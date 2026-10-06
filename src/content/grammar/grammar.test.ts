import { describe, expect, it } from "vitest";
import { gradeFill, normalize } from "../../domain/grading";
import { READY_UNITS, getUnit } from "../curriculum";
import { LESSONS, exercisesForUnits } from "./index";
import { parseRich } from "../../ui/richText";
import type { Choice, Exercise } from "./types";

function checkChoice(c: Choice, where: string) {
  expect(c.options.length, `${where}: opciones`).toBeGreaterThanOrEqual(2);
  expect(new Set(c.options).size, `${where}: opciones repetidas`).toBe(c.options.length);
  expect(Number.isInteger(c.answer) && c.answer >= 0 && c.answer < c.options.length, `${where}: answer fuera de rango`).toBe(true);
  expect(c.why.length, `${where}: falta explicación`).toBeGreaterThan(5);
}

function allStrings(v: unknown): string[] {
  if (typeof v === "string") return [v];
  if (Array.isArray(v)) return v.flatMap(allStrings);
  if (v && typeof v === "object") return Object.values(v).flatMap(allStrings);
  return [];
}

function tokens(s: string): string[] {
  return normalize(s).split(/[^\p{L}']+/u).filter(Boolean);
}

describe("contenido de gramática", () => {
  it("cada unidad disponible tiene su lección, y las lecciones van en orden de currículo", () => {
    const units = LESSONS.map((l) => l.unit);
    expect(units).toEqual([...units].sort());
    for (const u of READY_UNITS) expect(units, `falta la lección de ${u.id}`).toContain(u.id);
    for (const id of units) expect(getUnit(id), `lección de una unidad inexistente: ${id}`).toBeTruthy();
  });

  for (const lesson of LESSONS) {
    describe(`unidad ${lesson.unit}`, () => {
      it("tiene lo necesario", () => {
        expect(lesson.title).toBeTruthy();
        expect(lesson.situation).toBeTruthy();
        expect(lesson.transfer.length).toBeGreaterThan(40);
        expect(lesson.examples.length).toBeGreaterThanOrEqual(5);
        expect(lesson.notice.length).toBeGreaterThanOrEqual(3);
        expect(lesson.exercises.length).toBeGreaterThanOrEqual(10);
      });

      it("las tablas tienen filas del mismo ancho que el encabezado", () => {
        for (const b of lesson.rule) {
          if (b.kind === "table") for (const row of b.rows) expect(row.length, b.head.join("|")).toBe(b.head.length);
        }
      });

      it("el formato **negrita** / *cursiva* está balanceado (sin asteriscos sueltos)", () => {
        const bad = allStrings(lesson).filter((t) => parseRich(t).some((seg) => seg.text.includes("*")));
        expect(bad).toEqual([]);
      });

      it("ítems de comprensión bien formados", () => {
        lesson.notice.forEach((n, i) => checkChoice(n, `notice ${i}`));
      });

      it("cada ejercicio está bien formado y se aprueba con su propia respuesta", () => {
        const problems: string[] = [];
        lesson.exercises.forEach((e: Exercise, i: number) => {
          const where = `${lesson.unit} e${i}: ${e.prompt}`;
          if (e.type === "choice") {
            checkChoice(e, where);
            return;
          }
          if (e.prompt.split("___").length - 1 !== 1) problems.push(`${where}: debe tener un solo ___`);
          if (e.answers.length === 0) problems.push(`${where}: sin respuestas`);
          for (const a of e.answers) if (gradeFill(a, e.answers) !== "correct") problems.push(`${where}: "${a}" no se aprueba a sí misma`);
          const hint = [...e.prompt.matchAll(/\(([^)]*)\)/g)].map((m) => m[1]).join(" ");
          const clue = new Set(tokens(hint));
          for (const a of e.answers) if (clue.has(normalize(a))) problems.push(`${where}: la pista regala la respuesta "${a}"`);
        });
        expect(problems).toEqual([]);
      });
    });
  }

  it("los ids de ejercicios son únicos", () => {
    const ids = exercisesForUnits(LESSONS.map((l) => l.unit)).map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(LESSONS.reduce((n, l) => n + l.exercises.length, 0));
  });
});
