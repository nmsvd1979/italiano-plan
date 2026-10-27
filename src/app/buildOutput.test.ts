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
