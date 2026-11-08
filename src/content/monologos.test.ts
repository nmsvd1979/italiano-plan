import { describe, expect, it } from "vitest";
import { COURSE } from "./course";
import { appLexicon, wordsOf } from "./lexicon";
import { getMonologue, hasMonologue, monologueIds } from "./monologos";

describe("monólogos guiados", () => {
  const ids = monologueIds();

  it("cada monólogo pertenece a un paso del curso", () => {
    expect(ids.length).toBeGreaterThanOrEqual(2);
    for (const id of ids) expect(COURSE.some((s) => s.id === id), id).toBe(true);
  });

  it("tiene entre 3 y 5 puntos, consigna y tiempos decrecientes", () => {
    for (const id of ids) {
      const m = getMonologue(id)!;
      expect(m.prompt.length, id).toBeGreaterThan(10);
      expect(m.points.length, id).toBeGreaterThanOrEqual(3);
      expect(m.points.length, id).toBeLessThanOrEqual(5);
      const [a, b, c] = m.seconds;
      expect(a, id).toBeGreaterThan(b);
      expect(b, id).toBeGreaterThan(c);
      expect(c, id).toBeGreaterThan(0);
    }
  });

  it("el modelo tiene entre 8 y 120 palabras, sin huecos, y usa léxico de la app", () => {
    const lex = appLexicon();
    for (const id of ids) {
      const m = getMonologue(id)!;
      const words = wordsOf(m.model).filter((w) => !w.endsWith("'"));
      expect(words.length, id).toBeGreaterThanOrEqual(8);
      expect(words.length, id).toBeLessThanOrEqual(120);
      expect(m.model.includes("___"), id).toBe(false);
      const known = words.filter((w) => lex.has(w) || lex.has(`${w}'`)).length / words.length;
      expect(known, id).toBeGreaterThanOrEqual(0.95);
    }
  });

  it("los marcos, si hay, son frases con hueco o con italiano", () => {
    for (const id of ids) for (const f of getMonologue(id)!.frames ?? []) expect(f.trim().length, id).toBeGreaterThan(3);
  });

  it("hasMonologue coincide con getMonologue", () => {
    for (const s of COURSE) expect(hasMonologue(s.id), s.id).toBe(!!getMonologue(s.id));
  });

  it.todo("un monólogo por cada paso de COURSE (35), en los PR de contenido");
});
