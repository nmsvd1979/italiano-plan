import { describe, expect, it } from "vitest";
import { COURSE, COURSE_PHASES, CORE_WEEKS } from "./course";
import { PHASES, UNITS } from "./curriculum";

describe("orden del curso (COURSE)", () => {
  it("cubre las 28 unidades, cada una al menos una vez, y no inventa ids", () => {
    expect(UNITS).toHaveLength(28);
    const ids = new Set(UNITS.map((u) => u.id));
    expect(new Set(COURSE.map((s) => s.unit))).toEqual(ids);
  });

  it("las unidades partidas aparecen exactamente una vez como A y una como B; las demás, una sola vez", () => {
    for (const u of UNITS) {
      const steps = COURSE.filter((s) => s.unit === u.id);
      if (u.parts) {
        expect(steps.map((s) => s.part), u.id).toEqual(["A", "B"]);
        expect(steps.map((s) => s.id), u.id).toEqual([`${u.id}#A`, `${u.id}#B`]);
      } else {
        expect(steps, u.id).toHaveLength(1);
        expect(steps[0].part, u.id).toBeUndefined();
        expect(steps[0].id).toBe(u.id);
      }
    }
  });

  it("las siete unidades partidas son u02, u03, u05, u06, u07, u14 y u15, y la parte A va antes que la B", () => {
    expect(UNITS.filter((u) => u.parts).map((u) => u.id)).toEqual(["u02", "u03", "u05", "u06", "u07", "u14", "u15"]);
    for (const u of UNITS.filter((x) => x.parts)) {
      const at = (p: string) => COURSE.findIndex((s) => s.id === `${u.id}#${p}`);
      expect(at("A")).toBeLessThan(at("B"));
    }
  });

  it("ningún id de paso se repite", () => {
    const ids = COURSE.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("núcleo de 32 semanas seguidas y puente de 3 pasos al final, sin semana", () => {
    const core = COURSE.filter((s) => s.kind === "core");
    const bridge = COURSE.filter((s) => s.kind === "bridge");
    expect(CORE_WEEKS).toBe(32);
    expect(core.map((s) => s.week)).toEqual(Array.from({ length: 32 }, (_, i) => i + 1));
    expect(bridge.map((s) => s.unit)).toEqual(["u21", "u22", "u23"]);
    expect(bridge.every((s) => s.week === undefined)).toBe(true);
    expect(COURSE.slice(-3)).toEqual(bridge);
  });

  it("sigue el orden de docs/v2/13 §2", () => {
    expect(COURSE.map((s) => s.id)).toEqual([
      "u25", "u01", "u02#A", "u02#B", "u03#A", "u03#B", "u04",
      "u05#A", "u05#B", "u06#A", "u06#B", "u26", "u07#A", "u07#B", "u08", "u27",
      "u09", "u10", "u11", "u12", "u28",
      "u13", "u14#A", "u14#B", "u15#A", "u15#B", "u16",
      "u17", "u18", "u19", "u20", "u24",
      "u21", "u22", "u23",
    ]);
  });

  it("las fases F1–F6 son consecutivas en el núcleo y coinciden con la fase de cada unidad", () => {
    expect(COURSE_PHASES.map((p) => p.id)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(COURSE_PHASES).toHaveLength(PHASES.length);
    const core = COURSE.filter((s) => s.kind === "core").map((s) => s.phase);
    expect([...core].sort((a, b) => a - b)).toEqual(core);
    for (const s of COURSE) expect(UNITS.find((u) => u.id === s.unit)?.phase, s.id).toBe(s.phase);
  });

  it("u25–u28 entran sin contenido (ready:false) y fuera del flujo; el resto de unidades sigue listo", () => {
    for (const id of ["u25", "u26", "u27", "u28"]) expect(UNITS.find((u) => u.id === id)?.ready, id).toBe(false);
    expect(UNITS.filter((u) => u.ready)).toHaveLength(24);
  });

  it("los ids y el orden de UNITS para u01–u24 no cambiaron", () => {
    expect(UNITS.slice(0, 24).map((u) => u.id)).toEqual(Array.from({ length: 24 }, (_, i) => `u${String(i + 1).padStart(2, "0")}`));
  });
});
