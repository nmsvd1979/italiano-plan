import { describe, expect, it } from "vitest";
import { gradeDictation, gradeFill, normalize } from "../../domain/grading";
import { parseRich } from "../../ui/richText";
import type { Choice, Exercise } from "../grammar/types";
import { u25 } from "./u25";
import { u26 } from "./u26";

// Unidades nuevas (G1) aún no conectadas a los registros. Mismas reglas que grammar.test.ts y activities.test.ts.
const NUEVAS = [u25, u26];

const allStrings = (v: unknown): string[] =>
  typeof v === "string" ? [v] : Array.isArray(v) ? v.flatMap(allStrings) : v && typeof v === "object" ? Object.values(v).flatMap(allStrings) : [];
const tokens = (s: string) => normalize(s).split(/[^\p{L}']+/u).filter(Boolean);

function checkChoice(c: Choice, where: string) {
  expect(c.options.length, `${where}: opciones`).toBeGreaterThanOrEqual(2);
  expect(new Set(c.options).size, `${where}: opciones repetidas`).toBe(c.options.length);
  expect(Number.isInteger(c.answer) && c.answer >= 0 && c.answer < c.options.length, `${where}: answer fuera de rango`).toBe(true);
  expect(c.why.length, `${where}: falta explicación`).toBeGreaterThan(5);
}

for (const u of NUEVAS) {
  describe(`unidad nueva ${u.id}`, () => {
    const l = u.lesson;
    it("lección completa", () => {
      expect(l.unit).toBe(u.id);
      expect(l.transfer.length).toBeGreaterThan(40);
      expect(l.examples.length).toBeGreaterThanOrEqual(5);
      expect(l.notice.length).toBeGreaterThanOrEqual(3);
      expect(l.exercises.length).toBeGreaterThanOrEqual(10);
      for (const b of l.rule) if (b.kind === "table") for (const r of b.rows) expect(r.length).toBe(b.head.length);
    });
    it("formato balanceado y sin voseo", () => {
      const bad = allStrings([l, u.vocab, u.dialogue, u.writing, u.pron]).filter((t) => parseRich(t).some((s) => s.text.includes("*")));
      expect(bad).toEqual([]);
    });
    it("ejercicios bien formados y se aprueban con su respuesta", () => {
      const problems: string[] = [];
      l.notice.forEach((n, i) => checkChoice(n, `notice ${i}`));
      l.exercises.forEach((e: Exercise, i) => {
        const where = `${u.id} e${i}: ${e.prompt}`;
        if (e.type === "choice") return checkChoice(e, where);
        if (e.prompt.split("___").length - 1 !== 1) problems.push(`${where}: un solo ___`);
        for (const a of e.answers) if (gradeFill(a, e.answers) !== "correct") problems.push(`${where}: "${a}"`);
        const clue = new Set(tokens([...e.prompt.matchAll(/\(([^)]*)\)/g)].map((m) => m[1]).join(" ")));
        for (const a of e.answers) if (clue.has(normalize(a))) problems.push(`${where}: la pista regala "${a}"`);
      });
      expect(problems).toEqual([]);
    });
    it("vocabulario 18–24 sin repetir", () => {
      expect(u.vocab.length).toBeGreaterThanOrEqual(18);
      expect(u.vocab.length).toBeLessThanOrEqual(24);
      expect(new Set(u.vocab.map((x) => x.it.toLowerCase())).size).toBe(u.vocab.length);
    });
    it("dictado ≥ 5 y se corrige bien", () => {
      expect(u.dictation.length).toBeGreaterThanOrEqual(5);
      for (const x of u.dictation) {
        expect(gradeDictation(x.it, x.it), x.it).toBe("correct");
        expect(gradeDictation("zzz", x.it)).toBe("wrong");
      }
    });
    it("escritura y diálogo", () => {
      expect(u.writing.checklist.length).toBeGreaterThanOrEqual(3);
      expect(u.writing.minChars).toBeLessThanOrEqual(120);
      expect(u.writing.model.length).toBeGreaterThanOrEqual(u.writing.minChars);
      expect(u.dialogue.lines.length).toBeGreaterThanOrEqual(6);
      expect(new Set(u.dialogue.lines.map((x) => x.who))).toEqual(new Set(["A", "B"]));
    });
    it("pronunciación: cada palabra tiene glosa", () => {
      for (const w of [...u.pron.pairs.flat(), ...u.pron.words]) expect(u.gloss[w], w).toBeTruthy();
    });
  });
}
