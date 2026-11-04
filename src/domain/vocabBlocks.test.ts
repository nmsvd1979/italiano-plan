import { describe, expect, it } from "vitest";
import { UNITS } from "../content/curriculum";
import { getWords } from "../content/vocab";
import { vocabForBlock } from "./vocabBlocks";

const BLOCKS = ["words3", "words4", "words5"];

describe("palabras por bloque de la semana", () => {
  it("el día 1 y la unidad sin bloque traen las palabras de siempre", () => {
    expect(vocabForBlock("u04", null, "words")?.length).toBeGreaterThanOrEqual(18);
    expect(vocabForBlock("u04", null, undefined)).toEqual(vocabForBlock("u04", null, "words"));
  });

  it("los días 3 a 5 reparten toda la ampliación sin repetir palabras", () => {
    for (const u of UNITS.filter((x) => x.ready && !x.parts)) {
      const extras = (getWords(u.id) ?? []).filter((w) => w.extra).map((w) => w.it);
      const shown = BLOCKS.flatMap((b) => vocabForBlock(u.id, null, b)!.map((w) => w.it));
      expect(shown.sort(), u.id).toEqual([...extras].sort());
    }
  });

  it("en una unidad partida cada semana ve solo su ampliación", () => {
    const a = BLOCKS.flatMap((b) => vocabForBlock("u02", "A", b)!.map((w) => w.it));
    const b = BLOCKS.flatMap((x) => vocabForBlock("u02", "B", x)!.map((w) => w.it));
    expect(a.length).toBeGreaterThan(5);
    expect(b.length).toBeGreaterThan(5);
    expect(a.filter((w) => b.includes(w))).toEqual([]);
  });
});
