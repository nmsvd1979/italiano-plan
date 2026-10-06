import { describe, expect, it } from "vitest";
import { gradeDictation } from "../domain/grading";
import { bare, buildVocabQuiz, toQuizletText } from "../domain/vocabQuiz";
import { parseRich } from "../ui/richText";
import { READY_UNITS, sessionsOf } from "./curriculum";
import { getDialogue } from "./dialogues";
import { getDictation } from "./dictation";
import { getVocab } from "./vocab";
import { getWriting } from "./writing";

describe("actividades por unidad", () => {
  it("cada unidad disponible tiene vocabulario, escritura, dictado y diálogo", () => {
    for (const u of READY_UNITS) {
      expect(u.has, u.id).toEqual({ vocab: true, writing: true, dictation: true, dialogue: true });
      const ids = sessionsOf(u).flatMap((s) => s.activities.map((a) => a.id));
      for (const id of ["vocab", "writing", "dictation", "dialogue"]) expect(ids, `${u.id} ${id}`).toContain(id);
    }
  });

  describe("vocabulario", () => {
    for (const u of READY_UNITS) {
      it(`${u.id}: 18 a 24 palabras, sin repetir, con significado`, () => {
        const v = getVocab(u.id)!;
        expect(v.length).toBeGreaterThanOrEqual(18);
        expect(v.length).toBeLessThanOrEqual(24);
        expect(new Set(v.map((x) => x.it.toLowerCase())).size).toBe(v.length);
        for (const x of v) {
          expect(x.it.trim(), u.id).toBeTruthy();
          expect(x.es.trim(), `${u.id} ${x.it}`).toBeTruthy();
          expect(x.it).not.toMatch(/\t/);
        }
      });
    }
  });

  describe("dictado", () => {
    for (const u of READY_UNITS) {
      it(`${u.id}: frases que se corrigen bien`, () => {
        const items = getDictation(u.id)!;
        expect(items.length).toBeGreaterThanOrEqual(5);
        for (const x of items) {
          expect(x.es.trim()).toBeTruthy();
          expect(gradeDictation(x.it, x.it), x.it).toBe("correct");
          expect(gradeDictation(x.it.toLowerCase().replace(/[.,?!]/g, ""), x.it), `puntuación: ${x.it}`).toBe("correct");
          expect(gradeDictation("zzz", x.it)).toBe("wrong");
        }
      });
    }

    it("la tilde que falta es 'casi'", () => {
      expect(gradeDictation("Oggi e martedi, sei ottobre", "Oggi è martedì, sei ottobre.")).toBe("almost");
    });
  });

  describe("escritura guiada", () => {
    for (const u of READY_UNITS) {
      it(`${u.id}: consigna, modelo, lista y formato`, () => {
        const w = getWriting(u.id)!;
        expect(w.prompt.length).toBeGreaterThan(40);
        expect(w.checklist.length).toBeGreaterThanOrEqual(3);
        expect(w.model.length).toBeGreaterThanOrEqual(w.minChars);
        expect(w.minChars).toBeLessThanOrEqual(120);
        const bad = w.checklist.filter((t) => parseRich(t).some((seg) => seg.text.includes("*")));
        expect(bad).toEqual([]);
      });
    }
  });

  describe("diálogos", () => {
    for (const u of READY_UNITS) {
      it(`${u.id}: dos roles, líneas con traducción`, () => {
        const d = getDialogue(u.id)!;
        expect(d.lines.length).toBeGreaterThanOrEqual(6);
        expect(new Set(d.lines.map((l) => l.who))).toEqual(new Set(["A", "B"]));
        expect(d.roles.A).not.toBe(d.roles.B);
        for (const l of d.lines) {
          expect(l.it.trim()).toBeTruthy();
          expect(l.es.trim()).toBeTruthy();
        }
      });
    }
  });
});

describe("quiz de vocabulario", () => {
  const items = getVocab("u04")!;

  it("alterna italiano → español y español → italiano, con la respuesta correcta entre las opciones", () => {
    const quiz = buildVocabQuiz(items, 10, "seed");
    expect(quiz).toHaveLength(10);
    for (const q of quiz) {
      expect(q.options).toHaveLength(3);
      expect(new Set(q.options).size).toBe(3);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(3);
    }
    expect(quiz.filter((q) => q.prompt.startsWith("¿Qué significa")).length).toBe(5);
  });

  it("la respuesta marcada coincide con el par italiano-español", () => {
    for (const q of buildVocabQuiz(items, 20, "x")) {
      const correct = q.options[q.answer];
      const pair = items.find((i) => i.es === correct || i.it === correct)!;
      expect(q.why).toContain(pair.it);
    }
  });

  it("misma semilla, mismo quiz", () => {
    expect(buildVocabQuiz(items, 10, "a")).toEqual(buildVocabQuiz(items, 10, "a"));
  });

  it("texto para Quizlet: término, tabulador, definición", () => {
    const t = toQuizletText([{ it: "il tavolo", es: "la mesa" }, { it: "la sedia", es: "la silla" }]);
    expect(t).toBe("il tavolo\tla mesa\nla sedia\tla silla");
    expect(bare("l'acqua")).toBe("acqua");
  });
});
