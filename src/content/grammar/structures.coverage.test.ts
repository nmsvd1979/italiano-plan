import { describe, expect, it } from "vitest";
import { UNITS } from "../curriculum";
import { exercisesOf, getLesson } from ".";

// Pisos de cobertura de estructuras del sillabo A2/B1 que casi no se practicaban (docs/v2/plan-b1/04): impiden que un PR
// futuro borre ejercicios o ejemplos que las cubren. Se cuenta sobre los ejercicios y ejemplos de las lecciones.
const texts = (unit: string): string[] => {
  const ex = exercisesOf(unit).map((e) => e.exercise).flatMap((e) => [e.prompt, ...(e.type === "choice" ? e.options : e.answers)]);
  const lesson = getLesson(unit);
  return [...ex, ...(lesson?.examples.map((x) => x.it) ?? [])];
};
const count = (re: RegExp, units: string[] = UNITS.map((u) => u.id)): number => units.reduce((n, u) => n + texts(u).filter((t) => re.test(t)).length, 0);

describe("cobertura de estructuras", () => {
  it("non solo… ma anche", () => expect(count(/non solo|ma anche/i)).toBeGreaterThanOrEqual(8));
  it("infatti", () => expect(count(/infatti/i)).toBeGreaterThanOrEqual(8));
  it("relativas con che/dove (u17 y u20)", () => expect(count(/\bche\b|\bdove\b/i, ["u17", "u20"])).toBeGreaterThanOrEqual(12));
  it("exclamativas con Che…!", () => expect(count(/\bChe \w+.*!|Che bello|Che peccato|Che buono/i)).toBeGreaterThanOrEqual(10));
});
