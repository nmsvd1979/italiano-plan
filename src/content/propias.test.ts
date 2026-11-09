import { describe, expect, it } from "vitest";
import { COURSE } from "./course";
import { DEFAULT_MIN_WORDS, allPropias, getPropias } from "./propias";
import { includesForm } from "../domain/writingCheck";
import { wordsOf } from "./lexicon";

describe("Dos frases propias", () => {
  it("hay una consigna por cada semana del curso y ninguna de más", () => {
    expect(allPropias().map(([id]) => id).sort()).toEqual(COURSE.map((s) => s.id).sort());
  });

  it("cada modelo tiene dos frases, alcanza el mínimo y cumple todas sus formas", () => {
    for (const [id, p] of allPropias()) {
      expect(p.model, id).toHaveLength(2);
      const words = wordsOf(p.model.join(" ")).filter((w) => !w.endsWith("'") || w.length > 2);
      expect(words.length, id).toBeGreaterThanOrEqual(p.minWords ?? DEFAULT_MIN_WORDS);
      expect(p.mustInclude.length, id).toBeGreaterThan(0);
      for (const alts of p.mustInclude) expect(alts.some((f) => includesForm(wordsOf(p.model.join(" ")), f)), `${id}: ${alts.join("/")}`).toBe(true);
      expect(p.prompt.length, id).toBeGreaterThan(15);
    }
  });

  it("la consigna de cada semana se encuentra por el id del paso", () => {
    expect(getPropias("u02#B")).toBeDefined();
    expect(getPropias("u99")).toBeUndefined();
  });
});
