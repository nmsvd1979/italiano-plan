import { describe, expect, it, vi } from "vitest";
import { downloadEntries, missingAudio, prioritize, withRetry, type AudioEntry } from "./offlineAudio";
import { isSafeToUpdate } from "./updates";

const entry = (name: string, unit: string, bytes = 10): AudioEntry => ({ url: `audio/${name}.mp3`, bytes, unit });
const resolve = (e: AudioEntry) => `https://x.test/${e.url}`;

const INDEX = [entry("a", "u03"), entry("b", "u01"), entry("c", "u02"), entry("d", "u01"), entry("e", "u04")];

describe("missingAudio", () => {
  it("devuelve lo que no está en la caché, en el orden del índice", () => {
    const cached = new Set([resolve(INDEX[1]), resolve(INDEX[4])]);
    expect(missingAudio(INDEX, cached, resolve).map((e) => e.url)).toEqual(["audio/a.mp3", "audio/c.mp3", "audio/d.mp3"]);
  });
  it("no falta nada si todo está guardado, y falta todo si la caché está vacía", () => {
    expect(missingAudio(INDEX, new Set(INDEX.map(resolve)), resolve)).toEqual([]);
    expect(missingAudio(INDEX, new Set(), resolve)).toHaveLength(5);
  });
  it("ignora archivos de la caché que ya no están en el índice", () => {
    expect(missingAudio(INDEX, new Set(["https://x.test/audio/viejo.mp3"]), resolve)).toHaveLength(5);
  });
});

describe("prioritize", () => {
  it("baja primero la unidad actual y la siguiente, y luego el resto por unidad", () => {
    expect(prioritize(INDEX, ["u02", "u03"]).map((e) => e.unit)).toEqual(["u02", "u03", "u01", "u01", "u04"]);
  });
  it("sin prioridades ordena por unidad y mantiene el orden dentro de cada una", () => {
    expect(prioritize(INDEX, []).map((e) => e.url)).toEqual(["audio/b.mp3", "audio/d.mp3", "audio/c.mp3", "audio/a.mp3", "audio/e.mp3"]);
  });
  it("no pierde ni duplica entradas", () => {
    expect(prioritize(INDEX, ["u04"])).toHaveLength(INDEX.length);
  });
});

describe("withRetry", () => {
  it("reintenta con espera creciente y devuelve el primer éxito", async () => {
    const waits: number[] = [];
    const fn = vi.fn().mockRejectedValueOnce(new Error("1")).mockRejectedValueOnce(new Error("2")).mockResolvedValue("ok");
    await expect(withRetry(fn, { wait: async (ms) => { waits.push(ms); } })).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(3);
    expect(waits).toEqual([1000, 2000]);
  });
  it("se rinde tras 3 intentos con el último error", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("no hay red"));
    await expect(withRetry(fn, { wait: async () => {} })).rejects.toThrow("no hay red");
    expect(fn).toHaveBeenCalledTimes(3);
  });
  it("no reintenta si se pausó", async () => {
    const ctl = new AbortController();
    const fn = vi.fn(async () => { ctl.abort(); throw new Error("abortado"); });
    await expect(withRetry(fn, { wait: async () => {}, signal: ctl.signal })).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

function okResponse(bytes: number) {
  return new Response(new Uint8Array(bytes), { status: 200, headers: { "Content-Type": "audio/mpeg" } });
}

describe("downloadEntries", () => {
  const wait = async () => {};

  it("guarda cada archivo completo y reporta el progreso", async () => {
    const saved: string[] = [];
    const seen: number[] = [];
    const res = await downloadEntries(
      INDEX,
      { fetchAudio: async () => okResponse(10), put: async (u) => { saved.push(u); }, wait },
      new AbortController().signal,
      (p) => seen.push(p.done),
      resolve,
    );
    expect(res).toMatchObject({ done: 5, failed: 0, bytesDone: 50 });
    expect(saved.sort()).toEqual(INDEX.map(resolve).sort());
    expect(Math.max(...seen)).toBe(5);
  });

  it("no baja más de 4 a la vez", async () => {
    let active = 0;
    let peak = 0;
    const many = Array.from({ length: 12 }, (_, i) => entry(`f${i}`, "u01"));
    await downloadEntries(
      many,
      {
        fetchAudio: async () => { active++; peak = Math.max(peak, active); await new Promise((r) => setTimeout(r, 5)); active--; return okResponse(10); },
        put: async () => {}, wait,
      },
      new AbortController().signal, () => {}, resolve,
    );
    expect(peak).toBe(4);
  });

  it("reintenta un fallo pasajero y no lo cuenta como fallido", async () => {
    let calls = 0;
    const res = await downloadEntries(
      [entry("a", "u01")],
      { fetchAudio: async () => { if (++calls === 1) throw new Error("red"); return okResponse(10); }, put: async () => {}, wait },
      new AbortController().signal, () => {}, resolve,
    );
    expect(res).toMatchObject({ done: 1, failed: 0 });
    expect(calls).toBe(2);
  });

  it("no guarda respuestas que no son 200 ni archivos con peso distinto al del índice", async () => {
    const saved: string[] = [];
    const res = await downloadEntries(
      [entry("a", "u01"), entry("b", "u01")],
      {
        fetchAudio: async (url) => (url.endsWith("a.mp3") ? new Response("no", { status: 404 }) : okResponse(3)),
        put: async (u) => { saved.push(u); }, wait,
      },
      new AbortController().signal, () => {}, resolve,
    );
    expect(saved).toEqual([]);
    expect(res).toMatchObject({ done: 0, failed: 2 });
  });

  it("al pausar deja de pedir archivos; lo ya guardado se conserva y reanudar solo baja lo que falta", async () => {
    const cache = new Set<string>();
    const ctl = new AbortController();
    const many = Array.from({ length: 10 }, (_, i) => entry(`f${i}`, "u01"));
    await downloadEntries(
      many,
      {
        fetchAudio: async () => okResponse(10),
        put: async (u) => { cache.add(u); if (cache.size === 4) ctl.abort(); }, wait,
      },
      ctl.signal, () => {}, resolve,
    );
    expect(cache.size).toBeGreaterThanOrEqual(4);
    expect(cache.size).toBeLessThan(10);

    const restante = missingAudio(many, cache, resolve);
    expect(restante.length).toBe(10 - cache.size);
    const fetched: string[] = [];
    await downloadEntries(
      restante,
      { fetchAudio: async (u) => { fetched.push(u); return okResponse(10); }, put: async (u) => { cache.add(u); }, wait },
      new AbortController().signal, () => {}, resolve,
    );
    expect(cache.size).toBe(10);
    expect(fetched).toHaveLength(restante.length);
  });
});

describe("isSafeToUpdate", () => {
  it("solo aplica la actualización en Hoy", () => {
    expect(isSafeToUpdate("/")).toBe(true);
    expect(isSafeToUpdate("")).toBe(true);
    for (const r of ["/practica/u04", "/gramatica/u01", "/dictado/u02", "/ajustes", "/repaso"]) expect(isSafeToUpdate(r)).toBe(false);
  });
});
