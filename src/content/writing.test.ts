import { describe, expect, it } from "vitest";
import { COURSE } from "./course";
import { allWritingTasks, getWriting, writingKey } from "./writing";
import { checkWriting, minWordsOf } from "../domain/writingCheck";
import { appLexicon, wordsOf } from "./lexicon";
import { getWritingTexts, saveWritingText, type KV } from "../domain/storage";

class Mem implements KV {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
}

describe("consigna de escritura por semana", () => {
  it("cada paso del curso tiene consigna (la semana B repite la de la unidad hasta que tenga la suya)", () => {
    for (const s of COURSE) expect(getWriting(s.unit, s.part ?? null), s.id).toBeDefined();
  });

  it("sin parte, o con la parte A, devuelve la consigna de la unidad", () => {
    expect(getWriting("u02", "A")).toBe(getWriting("u02"));
    expect(getWriting("u02", null)).toBe(getWriting("u02"));
  });

  it("la semana A conserva la clave de siempre y la B usa una propia", () => {
    expect(writingKey("u02", "A")).toBe("u02");
    expect(writingKey("u02")).toBe("u02");
    expect(writingKey("u02", "B")).toBe("u02#B");
  });

  it("el texto de la semana B no pisa el de la A", () => {
    const s = new Mem();
    saveWritingText(writingKey("u02", "A"), "testo A", s);
    saveWritingText(writingKey("u02", "B"), "testo B", s);
    expect(getWritingTexts(s)).toEqual({ u02: "testo A", "u02#B": "testo B" });
    saveWritingText(writingKey("u02", "B"), "", s);
    expect(getWritingTexts(s)).toEqual({ u02: "testo A" });
  });

  it("en las 7 unidades partidas la consigna y el modelo de la semana B son distintos de los de la A", () => {
    const partidas = COURSE.filter((s) => s.part === "B");
    expect(partidas.map((s) => s.unit)).toEqual(["u02", "u03", "u05", "u06", "u07", "u14", "u15"]);
    for (const s of partidas) {
      const a = getWriting(s.unit, "A")!;
      const b = getWriting(s.unit, "B")!;
      expect(b, s.id).not.toBe(a);
      expect(b.prompt, s.id).not.toBe(a.prompt);
      expect(b.model, s.id).not.toBe(a.model);
    }
  });

  it("las consignas B de nivel «marcos» traen sus marcos de frase", () => {
    for (const u of ["u07", "u14"]) expect(getWriting(u, "B")!.frames?.length, u).toBeGreaterThanOrEqual(3);
  });
});

describe("ampliación opcional del texto (extend)", () => {
  const tasks = allWritingTasks();

  it("hay consignas y todas tienen modelo que cumple su propio mínimo", () => {
    expect(tasks.length).toBeGreaterThanOrEqual(28);
    for (const t of tasks) expect(checkWriting(t.model, t, appLexicon()).complete, t.prompt).toBe(true);
  });

  it("si una consigna trae extend: sube el mínimo, el modelo ampliado lo alcanza y cubre sus formas meta", () => {
    for (const t of tasks) {
      if (!t.extend) continue;
      expect(t.extend.minWords, t.prompt).toBeGreaterThan(minWordsOf(t));
      const n = wordsOf(t.extend.model).filter((w) => !w.endsWith("'")).length;
      expect(n, t.prompt).toBeGreaterThanOrEqual(t.extend.minWords);
      const c = checkWriting(t.extend.model, { ...t, minWords: t.extend.minWords, mustInclude: t.extend.mustInclude }, appLexicon());
      expect(c.missingForms, t.prompt).toEqual([]);
    }
  });

  it("las formas meta de cada consigna aparecen en su propio modelo", () => {
    for (const t of tasks) {
      if (!t.mustInclude) continue;
      expect(checkWriting(t.model, t, appLexicon()).missingForms, t.prompt).toEqual([]);
    }
  });
});
