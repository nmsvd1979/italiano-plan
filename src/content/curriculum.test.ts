import { describe, expect, it } from "vitest";
import { PHASE_INPUT, RESOURCES } from "./plan";
import { PHASES, READY_UNITS, UNITS } from "./curriculum";
import { getLesson } from "./grammar";
import { getPronUnit } from "./pronunciation";
import { SHADOWING } from "./shadowing";
import { buildSteps, nextSteps } from "../domain/curriculum";
import { learnedUnits } from "../domain/practice";
import { doneKeys } from "../domain/progress";

describe("contenido del currículo", () => {
  it("cada unidad disponible tiene lección, pronunciación, shadowing y su 'puedo…'", () => {
    for (const u of READY_UNITS) {
      expect(getLesson(u.id), `lección de ${u.id}`).toBeTruthy();
      expect(getPronUnit(u.id), `pronunciación de ${u.id}`).toBeTruthy();
      expect(SHADOWING[u.id], `shadowing de ${u.id}`).toBeTruthy();
      expect(u.canDo.length, `puedo… de ${u.id}`).toBeGreaterThanOrEqual(2);
    }
  });

  it("las unidades 'pronto' no aparecen en el flujo diario", () => {
    const soon = new Set(UNITS.filter((u) => !u.ready).map((u) => u.id));
    const offered = nextSteps(buildSteps(), { done: new Set(), skipped: new Set(), startUnit: 1 });
    expect(offered.some((s) => soon.has(s.unit.id))).toBe(false);
    expect(buildSteps().some((s) => soon.has(s.unit.id))).toBe(false);
  });

  it("el título de cada lección coincide con el de su unidad (sin contenido cruzado)", () => {
    for (const u of READY_UNITS) expect(getLesson(u.id)?.unit).toBe(u.id);
  });

  it("todas las fases tienen recursos de input válidos", () => {
    for (const p of PHASES) {
      const input = PHASE_INPUT[p.id];
      expect(input, `fase ${p.id}`).toBeTruthy();
      for (const r of input.resources) expect(RESOURCES[r], `${p.id}: ${r}`).toBeTruthy();
    }
  });
});

describe("migración desde la app anterior", () => {
  it("las marcas viejas (anki, input…) no cuentan como pasos del plan nuevo", () => {
    const old = { "2026-09-14": { anki: true, input: true, grammar: true } };
    const steps = buildSteps();
    const done = doneKeys(old);
    expect(steps.some((s) => done.has(s.key))).toBe(false);
    expect(nextSteps(steps, { done, skipped: new Set(), startUnit: 1 })[0].key).toBe("u01.s1.quizlet");
  });

  it("las lecciones vistas (o de unidades anteriores a la inicial) alimentan el repaso", () => {
    const p = { done: new Set(["u01.s2.lesson"]), skipped: new Set<string>(), startUnit: 3 };
    expect(learnedUnits(p)).toEqual(["u01", "u02"]);
  });
});
