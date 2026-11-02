import { describe, expect, it } from "vitest";
import { MemoryRecStore, MAX_PER_ACTIVITY, idsToPrune } from "./recStore";
import {
  MIME_ORDER, MicError, pickMimeType, startRecording, type MediaRecorderLike, type RecorderEnv, type StreamLike,
} from "./recording";
import { LOG_KEY, LOG_MAX_ENTRIES, appendLog, loadLog } from "./activityLog";
import { selfRatingOf } from "../features/record/SelfEval";
import type { KV } from "./storage";

/** Doble de MediaRecorder: entrega un trozo al detenerse, como el real. */
class FakeRecorder implements MediaRecorderLike {
  state: "inactive" | "recording" | "paused" = "inactive";
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  constructor(public mimeType: string | undefined, private chunks = ["voz"]) {}
  start() { this.state = "recording"; }
  stop() {
    this.state = "inactive";
    for (const c of this.chunks) this.ondataavailable?.({ data: new Blob([c]) });
    this.onstop?.();
  }
}

const makeEnv = (over: Partial<RecorderEnv> & { supported?: string[]; chunks?: string[] } = {}) => {
  const log = { stopped: 0, mime: undefined as string | undefined, constraints: undefined as unknown, recorders: [] as FakeRecorder[] };
  const stream: StreamLike = { getTracks: () => [{ stop: () => { log.stopped++; } }] };
  const env: RecorderEnv = {
    getUserMedia: async (c) => { log.constraints = c; return stream; },
    createRecorder: (_s, mime) => { log.mime = mime; const r = new FakeRecorder(mime, over.chunks); log.recorders.push(r); return r; },
    isTypeSupported: (t) => (over.supported ?? [...MIME_ORDER]).includes(t),
    makeBlob: (parts, mime) => new Blob(parts, { type: mime }),
    ...over,
  };
  return { env, log };
};

describe("elegir el tipo de grabación", () => {
  it("prueba audio/mp4, luego webm con opus y luego webm, en ese orden", () => {
    expect(MIME_ORDER).toEqual(["audio/mp4", "audio/webm;codecs=opus", "audio/webm"]);
    expect(pickMimeType(() => true)).toBe("audio/mp4");
    expect(pickMimeType((t) => t !== "audio/mp4")).toBe("audio/webm;codecs=opus");
    expect(pickMimeType((t) => t === "audio/webm")).toBe("audio/webm");
    expect(pickMimeType(() => false)).toBeUndefined();
  });

  it("el MediaRecorder se crea con el tipo elegido (iOS Safari: mp4; Chrome: webm)", async () => {
    const ios = makeEnv({ supported: ["audio/mp4", "audio/webm"] });
    await startRecording(ios.env);
    expect(ios.log.mime).toBe("audio/mp4");
    const chrome = makeEnv({ supported: ["audio/webm;codecs=opus", "audio/webm"] });
    const rec = await startRecording(chrome.env);
    expect(chrome.log.mime).toBe("audio/webm;codecs=opus");
    expect(rec.mime).toBe("audio/webm;codecs=opus");
    const none = makeEnv({ supported: [] });
    await startRecording(none.env);
    expect(none.log.mime).toBeUndefined();
  });
});

describe("grabar con el doble de MediaRecorder", () => {
  it("pide solo audio, graba, devuelve la grabación y suelta el micrófono", async () => {
    const { env, log } = makeEnv({ supported: ["audio/mp4"] });
    const rec = await startRecording(env);
    expect(log.constraints).toEqual({ audio: true });
    expect(log.recorders[0].state).toBe("recording");
    const out = await rec.stop();
    expect(out.mime).toBe("audio/mp4");
    expect(out.blob.type).toBe("audio/mp4");
    expect(out.blob.size).toBeGreaterThan(0);
    expect(log.stopped).toBe(1);
  });

  it("si se niega el permiso, lanza «denied» (modo sin grabación)", async () => {
    const { env } = makeEnv({ getUserMedia: async () => { throw Object.assign(new Error("x"), { name: "NotAllowedError" }); } });
    await expect(startRecording(env)).rejects.toMatchObject({ problem: "denied" });
  });

  it("sin micrófono o sin MediaRecorder, lanza «unsupported»", async () => {
    await expect(startRecording({ makeBlob: (p, m) => new Blob(p, { type: m }) })).rejects.toMatchObject({ problem: "unsupported" });
    const { env } = makeEnv({ createRecorder: undefined });
    await expect(startRecording(env)).rejects.toBeInstanceOf(MicError);
  });

  it("otro error del micrófono = «failed»; una grabación vacía = «failed» y se suelta el micrófono", async () => {
    const bad = makeEnv({ getUserMedia: async () => { throw Object.assign(new Error("x"), { name: "NotFoundError" }); } });
    await expect(startRecording(bad.env)).rejects.toMatchObject({ problem: "failed" });
    const empty = makeEnv({ chunks: [] });
    const rec = await startRecording(empty.env);
    await expect(rec.stop()).rejects.toMatchObject({ problem: "failed" });
    expect(empty.log.stopped).toBe(1);
  });

  it("si el MediaRecorder no arranca, se suelta el micrófono", async () => {
    const { env, log } = makeEnv({ createRecorder: () => ({ ...new FakeRecorder(undefined), start() { throw new Error("no"); } }) as unknown as MediaRecorderLike });
    await expect(startRecording(env)).rejects.toMatchObject({ problem: "failed" });
    expect(log.stopped).toBe(1);
  });

  it("cancelar descarta sin devolver nada y suelta el micrófono", async () => {
    const { env, log } = makeEnv();
    const rec = await startRecording(env);
    rec.cancel();
    expect(log.stopped).toBe(1);
    expect(log.recorders[0].state).toBe("inactive");
  });
});

describe("almacenamiento de grabaciones (máximo 20 recientes por actividad)", () => {
  const blob = new Blob(["x"]);

  it("idsToPrune deja las 20 más recientes", () => {
    const rows = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, at: 1000 + i }));
    const drop = idsToPrune(rows);
    expect(drop).toHaveLength(5);
    expect(drop.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);
    expect(idsToPrune(rows.slice(0, 20))).toEqual([]);
    expect(MAX_PER_ACTIVITY).toBe(20);
  });

  it("borra las más antiguas de esa actividad y no toca las de otras", async () => {
    const store = new MemoryRecStore();
    for (let i = 0; i < 3; i++) await store.add("u04:pron:cane", blob, "audio/mp4", 5000 + i);
    for (let i = 0; i < 23; i++) await store.add("u04:rol", blob, "audio/mp4", 1000 + i);
    const rol = await store.list("u04:rol");
    expect(rol).toHaveLength(20);
    expect(rol[0].at).toBe(1022);
    expect(rol.at(-1)!.at).toBe(1003);
    expect(await store.list("u04:pron:cane")).toHaveLength(3);
    await store.clearAll();
    expect(await store.list("u04:rol")).toEqual([]);
  });
});

describe("autoevaluación y registro", () => {
  class Mem implements KV {
    m = new Map<string, string>();
    getItem(k: string) { return this.m.get(k) ?? null; }
    setItem(k: string, v: string) { this.m.set(k, v); }
    removeItem(k: string) { this.m.delete(k); }
  }

  it("la media de las tres respuestas de 1 a 3", () => {
    expect(selfRatingOf([3, 3, 3])).toBe(3);
    expect(selfRatingOf([1, 2, 3])).toBe(2);
    expect(selfRatingOf([1, 1, 2])).toBe(1.3);
  });

  it("guarda la autoevaluación en italianPlan.log.v1 y recorta a 2000 entradas", () => {
    const store = new Mem();
    appendLog(store, { date: "2026-11-01", unit: "u04", activity: "rol", minutes: 0, selfRating: 2.7 });
    expect(loadLog(store)).toEqual([{ date: "2026-11-01", unit: "u04", activity: "rol", minutes: 0, selfRating: 2.7 }]);
    expect(LOG_KEY).toBe("italianPlan.log.v1");
    for (let i = 0; i < LOG_MAX_ENTRIES + 5; i++) appendLog(store, { date: "2026-11-02", unit: "u04", activity: `a${i}`, minutes: 1 });
    const all = loadLog(store);
    expect(all).toHaveLength(LOG_MAX_ENTRIES);
    expect(all.at(-1)!.activity).toBe(`a${LOG_MAX_ENTRIES + 4}`);
    store.setItem(LOG_KEY, "{roto");
    expect(loadLog(store)).toEqual([]);
  });
});
