import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ttsClips from "../content/ttsClips.json";
import { audioFiles } from "../content/pronunciation";

vi.mock("./audio", () => ({ playFile: vi.fn(), stopFile: vi.fn() }));
import { playFile } from "./audio";
import { clipFile, say, sayThrough, sourceOf, systemVoiceCount } from "./speech";
import { normalizeText, sha1Hex, ttsId } from "./ttsId";

const ROOT = path.resolve(__dirname, "..", "..");
const TTS_DIR = path.join(ROOT, "public", "audio", "tts");
const readJson = <T>(p: string): T => JSON.parse(readFileSync(path.join(ROOT, p), "utf8")) as T;

interface Manifest { frases: { texto: string; fuentes: string[]; unidad: string }[]; excluidas: { texto: string; motivo: string }[] }
interface IndexEntry { id: string; text: string; sha1: string; voice: string; license: string }
const manifest = readJson<Manifest>("scripts/tts/frases.json");
const index = readJson<IndexEntry[]>("public/audio/tts/index.json");

describe("id del clip: sha1 del texto normalizado", () => {
  it("sha1 coincide con vectores conocidos y con node:crypto, incluso con tildes y comillas", () => {
    expect(sha1Hex("abc")).toBe("a9993e364706816aba3e25717850c26c9cd0d89d");
    expect(sha1Hex("")).toBe("da39a3ee5e6b4b0d3255bfef95601890afd80709");
    for (const t of ["Così è più facile: «Scusi, può ripetere?»", "a".repeat(55), "a".repeat(56), "a".repeat(64), "È già lunedì"]) {
      expect(sha1Hex(t), t).toBe(createHash("sha1").update(t).digest("hex"));
    }
  });
  it("normaliza espacios, saltos de línea y asteriscos, y es estable", () => {
    const base = ttsId("Buongiorno, sono Laura.");
    expect(ttsId("  Buongiorno,   sono\nLaura.  ")).toBe(base);
    expect(ttsId("Buongiorno, sono *Laura*.")).toBe(base);
    expect(ttsId("Buongiorno, sono Laura.")).toBe(base);
    expect(base).toMatch(/^[0-9a-f]{12}$/);
    expect(normalizeText("  uno \n\t dos ")).toBe("uno dos");
  });
  it("da el mismo id que el script de generación para todas las frases del manifiesto", async () => {
    // @ts-expect-error módulo .mjs sin tipos
    const { idDe } = await import("../../scripts/tts/comun.mjs");
    for (const f of manifest.frases) expect(ttsId(f.texto), f.texto).toBe(idDe(f.texto));
  });
});

describe("say(): clip → grabación nativa → voz del sistema", () => {
  const conClip = manifest.frases[0].texto;
  // Una palabra suelta con grabación nativa que no sea además una frase del manifiesto.
  const palabra = ["gatto", "casa", "acqua", "libro", "pane"].find((w) => audioFiles(w).length > 0 && !clipFile(w))!;
  const sinNada = "Questa frase non è nel manifesto di nessuna unità.";

  beforeEach(() => {
    vi.mocked(playFile).mockReset();
    vi.mocked(playFile).mockResolvedValue("ended");
  });

  it("elige la fuente en ese orden", () => {
    expect(palabra).toBeDefined();
    expect(sourceOf(conClip)).toBe("clip");
    expect(sourceOf(palabra)).toBe("native");
    expect(sourceOf(sinNada)).toBe("system");
  });
  it("con clip toca el clip, no la grabación ni la voz del sistema", async () => {
    const antes = systemVoiceCount();
    expect(await sayThrough(conClip)).toBe("clip");
    expect(playFile).toHaveBeenCalledOnce();
    expect(playFile).toHaveBeenCalledWith(`tts/${ttsId(conClip)}.mp3`, 1);
    expect(systemVoiceCount()).toBe(antes);
  });
  it("el dictado lento reproduce el mismo clip a 0,75×", async () => {
    await sayThrough(conClip, 0.9 * 0.75);
    expect(playFile).toHaveBeenCalledWith(`tts/${ttsId(conClip)}.mp3`, expect.closeTo(0.75, 5));
  });
  it("sin clip, la palabra suelta usa su grabación nativa", async () => {
    expect(await sayThrough(palabra)).toBe("native");
    expect(audioFiles(palabra)).toContain(vi.mocked(playFile).mock.calls[0][0]);
  });
  it("sin clip ni grabación suena la voz del sistema y avisa", async () => {
    const antes = systemVoiceCount();
    expect(await sayThrough(sinNada)).toBe("system");
    expect(playFile).not.toHaveBeenCalled();
    expect(systemVoiceCount()).toBe(antes + 1);
  });
  it("si el clip no carga (p. ej. sin conexión y sin descargar), cae a la voz del sistema", async () => {
    vi.mocked(playFile).mockResolvedValue("failed");
    const antes = systemVoiceCount();
    expect(await sayThrough(conClip)).toBe("system");
    expect(systemVoiceCount()).toBe(antes + 1);
  });
  it("say() devuelve la fuente de inmediato y arranca el audio dentro del mismo gesto", () => {
    expect(say(conClip)).toBe("clip");
    expect(playFile).toHaveBeenCalledOnce();
  });
});

describe("manifiesto", () => {
  it("no contiene frases excluidas (sin confirmar en docs/dudas-italiano.md)", async () => {
    // @ts-expect-error módulo .mjs sin tipos
    const { motivoDeExclusion } = await import("../../scripts/tts/comun.mjs");
    const exclusiones = readJson<{ frase: string; motivo: string }[]>("scripts/tts/exclusiones.json");
    expect(exclusiones.map((e) => e.frase)).toEqual(expect.arrayContaining(["Vuole altro?", "Credo di sì", "Credo di no", "Siete state lì una settimana?", "Gliene parlo io", "Potresti consigliarmi un ristorante?"]));
    for (const f of manifest.frases) expect(motivoDeExclusion(f.texto, exclusiones), f.texto).toBeNull();
    const textos = new Set(manifest.frases.map((f) => f.texto));
    for (const x of manifest.excluidas) expect(textos.has(x.texto), x.texto).toBe(false);
  });
  it("no repite frases y todas están normalizadas", () => {
    const textos = manifest.frases.map((f) => f.texto);
    expect(new Set(textos).size).toBe(textos.length);
    for (const t of textos) expect(normalizeText(t)).toBe(t);
  });
});

describe("public/audio/tts", () => {
  const mp3 = readdirSync(TTS_DIR).filter((f) => f.endsWith(".mp3")).sort();
  it("index.json coincide con los archivos de disco", () => {
    expect(index.map((e) => `${e.id}.mp3`).sort()).toEqual(mp3);
    for (const e of index) expect(statSync(path.join(TTS_DIR, `${e.id}.mp3`)).size, e.id).toBeGreaterThan(1000);
  });
  it("cada entrada del índice es una frase del manifiesto, con su sha1, voz y licencia", () => {
    expect(index.map((e) => e.text).sort()).toEqual(manifest.frases.map((f) => f.texto).sort());
    for (const e of index) {
      expect(e.sha1, e.id).toBe(sha1Hex(e.text));
      expect(e.id, e.id).toBe(e.sha1.slice(0, 12));
      expect(e.voice).toBe("it_IT-serena-high");
      expect(e.license).toBe("CC BY 4.0");
    }
  });
  it("la lista de ids que usa el navegador (src/content/ttsClips.json) es la del índice", () => {
    expect([...ttsClips].sort()).toEqual(index.map((e) => e.id).sort());
  });
  it("los clips entran en audio-index.json, para que el gestor de descarga los baje", () => {
    const audioIndex = readJson<{ url: string }[]>("public/audio-index.json").map((e) => e.url);
    for (const f of mp3) expect(audioIndex, f).toContain(`audio/tts/${f}`);
  });
});

describe("precache del service worker", () => {
  it("la configuración deja fuera todo public/audio (incluidos los clips tts)", () => {
    const config = readFileSync(path.join(ROOT, "vite.config.ts"), "utf8");
    expect(config).toMatch(/globIgnores:\s*\[[^\]]*"audio\/\*\*"/);
  });
  const sw = path.join(ROOT, "dist", "sw.js");
  it.skipIf(!existsSync(sw))("ningún clip tts está en dist/sw.js (necesita `npm run build` previo)", () => {
    expect(readFileSync(sw, "utf8")).not.toMatch(/audio\/tts/);
  });
});
