import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "..", "..");
const AUDIO_DIR = path.join(ROOT, "public", "audio");

type Entry = { url: string; bytes: number; unit: string };
const index = JSON.parse(readFileSync(path.join(ROOT, "public", "audio-index.json"), "utf8")) as Entry[];

describe("public/audio-index.json (lo regenera `npm run build`; si falla, corre `node scripts/build-audio-index.mjs`)", () => {
  const files = readdirSync(AUDIO_DIR).filter((f) => f.endsWith(".mp3")).sort();

  it("lista exactamente los mp3 de public/audio", () => {
    expect(index.map((e) => e.url).sort()).toEqual(files.map((f) => `audio/${f}`).sort());
  });
  it("trae el peso real de cada archivo, que el gestor usa para validar la descarga", () => {
    for (const e of index) expect(e.bytes, e.url).toBe(statSync(path.join(ROOT, "public", e.url)).size);
  });
  it("asigna una unidad a cada audio, para bajar primero el de la unidad actual", () => {
    for (const e of index) expect(e.unit, e.url).toMatch(/^u\d{2}$/);
  });
});

describe("precache (necesita `npm run build` previo; lo comprueba también el postbuild)", () => {
  const sw = path.join(ROOT, "dist", "sw.js");
  it.skipIf(!existsSync(sw))("pesa menos de 2 MB y no incluye mp3", async () => {
    // @ts-expect-error módulo .mjs sin tipos
    const { measurePrecache, MAX_PRECACHE_BYTES } = await import("../../scripts/check-precache.mjs");
    const { urls, bytes } = await measurePrecache();
    expect(urls.length).toBeGreaterThan(0);
    expect(urls.filter((u: string) => /\.mp3|^audio\//.test(u))).toEqual([]);
    expect(bytes).toBeLessThan(MAX_PRECACHE_BYTES);
  });
});

describe("carga diferida de los textos y la práctica sin pista (necesita `npm run build` previo)", () => {
  const assets = path.join(ROOT, "dist", "assets");
  it.skipIf(!existsSync(assets))("lectura.json y sinpista.json van en trozos propios, no en el paquete principal", () => {
    const js = readdirSync(assets).filter((f) => f.endsWith(".js"));
    const main = readFileSync(path.join(assets, js.find((f) => f.startsWith("index-"))!), "utf8");
    const lectura = JSON.parse(readFileSync(path.join(ROOT, "src", "content", "lectura.json"), "utf8")) as Record<string, { titulo: string }>;
    const titulo = Object.values(lectura)[0].titulo;
    expect(main).not.toContain(titulo);
    expect(main).not.toContain("Piacere, sono Paolo e sono italiano");
    expect(js.some((f) => f.startsWith("lectura-"))).toBe(true);
    expect(js.some((f) => f.startsWith("sinpista-"))).toBe(true);
  });
});
