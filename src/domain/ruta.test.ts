import { describe, expect, it } from "vitest";
import { COURSE } from "../content/course";
import { getUnit } from "../content/curriculum";
import { blockKey, daysOf, isSoon, type CourseProgress } from "./cycle";
import { PASS_LEVEL, WEAK_AREA } from "./evaluation";
import { coreFinished, routeAfterCore, type LevelTests } from "./ruta";

const t = (c: number, total: number, byArea: LevelTests[number]["byArea"] = {}): LevelTests[number] => ({ date: "2026-11-10", correct: c, total, byArea });

describe("routeAfterCore", () => {
  it("sin prueba guardada: la prueba es la puerta", () => {
    expect(routeAfterCore([]).stage).toBe("sin-prueba");
    expect(routeAfterCore([t(0, 0)]).stage).toBe("sin-prueba");
  });

  it("≥ 80 % y ningún área floja pasa al puente; solo cuenta el último intento", () => {
    const ok = Math.ceil(28 * PASS_LEVEL);
    expect(routeAfterCore([t(ok, 28, { lectura: { correct: 5, total: 6 } })]).stage).toBe("aprobada");
    expect(routeAfterCore([t(ok, 28), t(10, 28)]).stage).toBe("repasar");
    expect(routeAfterCore([t(10, 28), t(ok, 28)]).stage).toBe("aprobada");
  });

  it("bajo el umbral o con un área floja, se refuerza esa área; la producción no cuenta", () => {
    const ok = Math.ceil(28 * PASS_LEVEL);
    const weakCount = Math.floor(6 * WEAK_AREA) - 1;
    const r = routeAfterCore([t(ok, 28, { escucha: { correct: weakCount, total: 6 }, produccion: { correct: 0, total: 2 } })]);
    expect(r).toMatchObject({ stage: "repasar", weak: ["escucha"] });
    expect(routeAfterCore([t(ok, 28, { produccion: { correct: 0, total: 2 } })]).stage).toBe("aprobada");
  });
});

/** Avance con todo lo esencial de las semanas indicadas y su mini-prueba aprobada. */
const finishedWeeks = (steps: typeof COURSE): CourseProgress => {
  const done = steps.flatMap((s) => {
    const unit = getUnit(s.unit)!;
    return daysOf(s).flatMap((d) => d.blocks.filter((b) => b.core && !isSoon(b, unit) && b.kind !== "mini").map((b) => blockKey(s.id, d.day, b.id)));
  });
  const mini = Object.fromEntries(steps.map((s) => [s.id, [{ date: "d", correct: 8, total: 8, passed: true }]]));
  return { done: new Set(done), startUnit: 1, mini };
};

describe("coreFinished", () => {
  it("con todas las semanas del núcleo hechas se alcanza (aunque falte el puente); con una pendiente no", () => {
    const core = COURSE.filter((s) => s.kind === "core");
    expect(coreFinished(finishedWeeks(core))).toBe(true);
    expect(coreFinished(finishedWeeks(core.slice(0, -1)))).toBe(false);
    expect(coreFinished({ done: new Set(), startUnit: 1, mini: {} })).toBe(false);
  });
});
