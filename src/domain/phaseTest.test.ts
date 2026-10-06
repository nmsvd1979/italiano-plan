import { describe, expect, it } from "vitest";
import { SOUND_TOPIC, pickGrammar, summarize } from "./phaseTest";

const exercises = [1, 2, 3, 4, 5].flatMap((unit) => Array.from({ length: 10 }, (_, i) => ({ id: `u${unit}e${i}`, unit })));

describe("pickGrammar", () => {
  it("toma la misma cantidad de cada unidad de la fase y solo de esas", () => {
    const ids = pickGrammar(exercises, [2, 3, 4], 3, "seed");
    expect(ids).toHaveLength(9);
    for (const w of [2, 3, 4]) expect(ids.filter((id) => id.startsWith(`u${w}`))).toHaveLength(3);
    expect(ids.some((id) => id.startsWith("u1") || id.startsWith("u5"))).toBe(false);
    expect(new Set(ids).size).toBe(9);
  });

  it("la misma semilla da el mismo test", () => {
    expect(pickGrammar(exercises, [1, 2], 3, "x")).toEqual(pickGrammar(exercises, [1, 2], 3, "x"));
  });
});

describe("summarize", () => {
  it("puntaje por tema y temas flojos ordenados", () => {
    const s = summarize([
      { topic: "u1", correct: true }, { topic: "u1", correct: true }, { topic: "u1", correct: true },
      { topic: "u2", correct: true }, { topic: "u2", correct: false }, { topic: "u2", correct: false },
      { topic: SOUND_TOPIC, correct: false }, { topic: SOUND_TOPIC, correct: false },
    ]);
    expect(s.total).toBe(8);
    expect(s.correct).toBe(4);
    expect(s.byTopic.u2).toEqual({ correct: 1, total: 3 });
    expect(s.weak).toEqual([SOUND_TOPIC, "u2"]);
  });

  it("exactamente 60 % no es flojo", () => {
    const outcomes = [true, true, true, false, false].map((correct) => ({ topic: "u1", correct }));
    expect(summarize(outcomes).weak).toEqual([]);
  });

  it("sin respuestas no rompe", () => {
    expect(summarize([])).toEqual({ total: 0, correct: 0, byTopic: {}, weak: [] });
  });
});
