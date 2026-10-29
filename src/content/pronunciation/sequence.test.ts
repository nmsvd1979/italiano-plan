import { describe, expect, it } from "vitest";
import { COURSE } from "../course";
import { PRON_AUDIO_PENDING, PRON_STEP_IDS, getPronStep, pronGloss } from "./sequence";
import manifest from "./manifest.json";

const VOSEO = /\b(vos|tenés|querés|sos|podés|decís|sabés|hablás|mirá|escuchá|fijate)\b/i;
const REGIONAL = /\b(polera|remera|campera|pibe|choclo|cachái|fome|bacán|pololo|weón|arriendo|amoblad\w*)\b/i;

describe("secuencia de pronunciación (G6)", () => {
  it("hay un contraste para cada paso del curso, en el mismo orden", () => {
    expect(PRON_STEP_IDS).toEqual(COURSE.map((s) => s.id));
  });

  it("no hay dos pasos con el mismo título (cada semana trae algo nuevo)", () => {
    const titles = PRON_STEP_IDS.map((id) => getPronStep(id)!.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  for (const id of PRON_STEP_IDS) {
    describe(id, () => {
      const s = getPronStep(id)!;
      it("tiene título, consejo claro y de 6 a 10 palabras sin repetir", () => {
        expect(s.title.length).toBeGreaterThanOrEqual(3);
        const n = s.tip.split(/\s+/).length;
        expect(n).toBeGreaterThanOrEqual(25);
        expect(n).toBeLessThanOrEqual(90);
        expect((s.tip.match(/\*/g) ?? []).length % 2).toBe(0);
        expect(s.words.length).toBeGreaterThanOrEqual(6);
        expect(s.words.length).toBeLessThanOrEqual(10);
        expect(new Set(s.words.map((w) => w.toLowerCase())).size).toBe(s.words.length);
      });
      it("cada par tiene dos elementos distintos y todo tiene significado", () => {
        expect(s.pairs.length).toBeLessThanOrEqual(id === "u24" ? 8 : 5);
        for (const [a, b] of s.pairs) {
          expect(a.toLowerCase()).not.toBe(b.toLowerCase());
          expect(pronGloss(a), a).toBeTruthy();
          expect(pronGloss(b), b).toBeTruthy();
        }
        for (const w of s.words) expect(pronGloss(w), w).toBeTruthy();
      });
      it("español neutro", () => {
        expect(s.tip + s.title).not.toMatch(VOSEO);
        expect(s.tip + s.title).not.toMatch(REGIONAL);
      });
    });
  }

  it("la lista de palabras sin audio coincide con el manifest", () => {
    const words = new Set(PRON_STEP_IDS.flatMap((id) => [...getPronStep(id)!.words, ...getPronStep(id)!.pairs.flat()]));
    const keys = new Set(Object.keys(manifest));
    for (const w of words) expect(keys.has(w.toLowerCase()) ? false : PRON_AUDIO_PENDING.includes(w), w).toBe(!keys.has(w.toLowerCase()));
    for (const w of PRON_AUDIO_PENDING) expect(keys.has(w.toLowerCase())).toBe(false);
  });
});
