import { describe, expect, it } from "vitest";
import { B1_ESCUCHAS, B1_LECTURAS, b1Items, wordsInEscucha } from "./practicaB1";
import { appLexicon, wordsOf } from "./lexicon";
import { checkShortAnswer, type LecturaQuestion } from "./lectura";

// Por formas exactas: una forma nueva de un verbo ya enseñado cuenta como desconocida. Los textos graduados del curso rondan el 91 %
// (auditoría, H-all-04); se exige ≥ 90 % y se revisa a mano qué palabras faltan.
const known = (text: string): number => {
  const lex = appLexicon();
  const words = wordsOf(text).filter((w) => !w.endsWith("'") || w.length > 2);
  const ok = words.filter((w) => lex.has(w) || lex.has(w.replace(/'$/, "")) || lex.has(`${w}'`)).length;
  return ok / words.length;
};

const checkQuestions = (id: string, qs: LecturaQuestion[]) => {
  expect(qs, id).toHaveLength(4);
  expect(qs.filter((q) => q.kind === "mc"), id).toHaveLength(3);
  expect(qs.filter((q) => q.kind === "short"), id).toHaveLength(1);
  for (const q of qs) {
    expect(q.q.length, id).toBeGreaterThan(8);
    expect(q.why.length, id).toBeGreaterThan(4);
    if (q.kind === "mc") {
      expect(q.options, id).toHaveLength(3);
      expect(new Set(q.options).size, id).toBe(3);
      expect(q.answer, id).toBeGreaterThanOrEqual(0);
      expect(q.answer, id).toBeLessThan(3);
    } else {
      expect(q.accepted.length, id).toBeGreaterThan(0);
      for (const a of q.accepted) expect(checkShortAnswer(q, a), `${id}: ${a}`).toBe(true);
    }
  }
};

describe("Práctica B1: contenido", () => {
  it("hay lecturas y audios y cada uno se lista", () => {
    expect(Object.keys(B1_LECTURAS).length).toBeGreaterThanOrEqual(1);
    expect(Object.keys(B1_ESCUCHAS).length).toBeGreaterThanOrEqual(1);
    expect(b1Items()).toHaveLength(Object.keys(B1_LECTURAS).length + Object.keys(B1_ESCUCHAS).length);
  });

  it("lecturas: 250–330 palabras, traducción por párrafo, 4 preguntas y léxico de la app ≥ 90 %", () => {
    for (const [id, l] of Object.entries(B1_LECTURAS)) {
      const n = wordsOf(l.it.join(" ")).filter((w) => !w.endsWith("'") || w.length > 2).length;
      expect(n, id).toBeGreaterThanOrEqual(250);
      expect(n, id).toBeLessThanOrEqual(330);
      expect(l.es, id).toHaveLength(l.it.length);
      expect(l.palabras, id).toBeGreaterThan(200);
      checkQuestions(id, l.preguntas);
      expect(known(l.it.join(" ")), id).toBeGreaterThanOrEqual(0.9);
    }
  });

  it("audios: 140–230 palabras, dos hablantes, traducción por línea, 4 preguntas y léxico ≥ 90 %", () => {
    for (const [id, e] of Object.entries(B1_ESCUCHAS)) {
      const n = wordsInEscucha(e);
      expect(n, id).toBeGreaterThanOrEqual(140);
      expect(n, id).toBeLessThanOrEqual(230);
      expect(new Set(e.lines.map((l) => l.who)).size, id).toBe(2);
      for (const l of e.lines) { expect(l.it.length, id).toBeGreaterThan(3); expect(l.es.length, id).toBeGreaterThan(3); }
      checkQuestions(id, e.preguntas);
      expect(known(e.lines.map((l) => l.it).join(" ")), id).toBeGreaterThanOrEqual(0.9);
    }
  });
});
