import { describe, expect, it } from "vitest";
import { UNITS } from "./curriculum";
import { getVocab, getWords, loadGeneralDeck } from "./vocab";

// G3: lista ampliada de palabras por unidad (con frase de ejemplo) y mazo general de frecuencia.
const ART = /^(?:(?:il|lo|la|i|gli|le|un|uno|una)\s+|l'|un')/i;
const bare = (s: string) => s.trim().toLowerCase().replace(ART, "");
// Español neutro: sin voseo ni chilenismos en el texto que ve el usuario.
const REGIONAL = /\b(polera|pololo|polola|frutilla|frutillas|bencina|boleta|vuelto|plata|pieza|living|flojo|cartera|clóset|departamento|computador|arriendo|arrendar|lentes|pasto|hongos|afiche|bacán|cachai|al tiro|guagua|lindo|linda|lindos|lindas|seguido|colegio|chao)\b/i;
const VOSEO = /\b(vos|tenés|querés|podés|sabés|hacés|decís|venís|mirá|tocá|elegí|escuchá|repetí|seguí|empezá|terminá|probá|volvé|pegá|copiá|andá)\b/i;

describe("lista ampliada de palabras por unidad (G3)", () => {
  for (const u of UNITS) {
    describe(u.id, () => {
      const words = getWords(u.id)!;
      const base = getVocab(u.id)!;

      it("tiene entre 45 y 55 palabras: las del núcleo más unas 30 nuevas", () => {
        expect(words.length).toBeGreaterThanOrEqual(45);
        expect(words.length).toBeLessThanOrEqual(55);
        expect(words.filter((w) => w.extra).length).toBeGreaterThanOrEqual(25);
        expect(words.slice(0, base.length).every((w) => !w.extra)).toBe(true);
      });

      it("todas tienen frase de ejemplo, traducción y etiqueta", () => {
        for (const w of words) {
          expect(w.ex?.trim(), `${u.id} ${w.it} ex`).toBeTruthy();
          expect(w.exEs?.trim(), `${u.id} ${w.it} exEs`).toBeTruthy();
          expect(w.ex, `${u.id} ${w.it}`).toMatch(/[.!?]$/);
          expect(w.exEs, `${u.id} ${w.it}`).toMatch(/[.!?]$/);
          expect(w.ex!.length, `${u.id} ${w.it} larga`).toBeLessThanOrEqual(80);
          expect(["unidad", "frecuente"], `${u.id} ${w.it}`).toContain(w.tag);
          expect(w.es.trim(), `${u.id} ${w.it} es`).toBeTruthy();
        }
      });

      it("no repite palabras dentro de la unidad", () => {
        const keys = words.map((w) => bare(w.it));
        expect(keys.filter((k, i) => keys.indexOf(k) !== i)).toEqual([]);
      });

      it("el español es neutro (sin voseo ni regionalismos)", () => {
        for (const w of words) {
          expect(`${w.es} ${w.exEs}`, `${u.id} ${w.it}`).not.toMatch(REGIONAL);
          expect(`${w.es} ${w.exEs}`, `${u.id} ${w.it}`).not.toMatch(VOSEO);
        }
      });

      if (u.parts) {
        it("las palabras nuevas se reparten entre la semana A y la B", () => {
          const extra = words.filter((w) => w.extra);
          expect(extra.every((w) => w.part === "A" || w.part === "B")).toBe(true);
          for (const part of ["A", "B"]) expect(extra.filter((w) => w.part === part).length, `${u.id} ${part}`).toBeGreaterThanOrEqual(10);
        });
      }
    });
  }

  it("no hay palabras nuevas repetidas entre unidades", () => {
    const seen = new Map<string, string>();
    const dup: string[] = [];
    for (const u of UNITS) {
      for (const w of getWords(u.id)!.filter((x) => x.extra)) {
        const k = bare(w.it);
        if (seen.has(k)) dup.push(`${w.it}: ${seen.get(k)} y ${u.id}`);
        seen.set(k, u.id);
      }
    }
    expect(dup).toEqual([]);
  });

  it("al menos el 55 % de las palabras de las unidades es de uso general", () => {
    const all = UNITS.flatMap((u) => getWords(u.id)!);
    const freq = all.filter((w) => w.tag === "frecuente").length;
    expect(freq / all.length).toBeGreaterThanOrEqual(0.55);
    // Las palabras nuevas son más temáticas, pero al menos 4 de cada 10 son frecuentes.
    const extra = all.filter((w) => w.extra);
    expect(extra.filter((w) => w.tag === "frecuente").length / extra.length).toBeGreaterThanOrEqual(0.4);
  });
});

describe("mazo general de frecuencia (G3)", () => {
  it("tiene más de 500 palabras con frase, sin repetir ni pisar las de las unidades", async () => {
    const deck = await loadGeneralDeck();
    expect(deck.length).toBeGreaterThan(500);
    const keys = deck.map((d) => bare(d.it));
    expect(keys.filter((k, i) => keys.indexOf(k) !== i)).toEqual([]);
    const inUnits = new Set(UNITS.flatMap((u) => getWords(u.id)!.map((w) => bare(w.it))));
    expect(deck.filter((d) => inUnits.has(bare(d.it))).map((d) => d.it)).toEqual([]);
    for (const d of deck) {
      expect(d.es.trim(), d.it).toBeTruthy();
      expect(d.ex, d.it).toMatch(/[.!?]$/);
      expect(d.exEs, d.it).toMatch(/[.!?]$/);
      expect(["v", "n", "adj", "adv", "num", "mes", "exp"], d.it).toContain(d.pos);
      expect(`${d.es} ${d.exEs}`, d.it).not.toMatch(REGIONAL);
      expect(`${d.es} ${d.exEs}`, d.it).not.toMatch(VOSEO);
    }
  });

  it("está ordenado de más a menos frecuente", async () => {
    const deck = (await loadGeneralDeck()).filter((d) => d.n !== null);
    for (let i = 1; i < deck.length; i++) expect(deck[i].n!, deck[i].it).toBeGreaterThanOrEqual(deck[i - 1].n!);
  });
});
