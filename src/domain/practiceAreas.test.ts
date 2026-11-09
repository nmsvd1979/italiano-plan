import { describe, expect, it } from "vitest";
import { getUnit } from "../content/curriculum";
import { PRACTICE_AREAS, areaTarget } from "./practiceAreas";

const day = (n: number) => new Date(2026, 10, n);
const learned = ["u25", "u01", "u02", "u03", "u04"];

describe("Practicar por habilidad", () => {
  it("sin unidades vistas solo quedan las prácticas que no dependen de una unidad", () => {
    expect(areaTarget("gramatica", [], day(1))?.to).toBe("/practicar");
    expect(areaTarget("vocabulario", [], day(1))?.to).toBe("/tarjetas");
    for (const a of ["escucha", "lectura", "produccion"] as const) expect(areaTarget(a, [], day(1)), a).toBeNull();
  });

  it("escucha, lectura y producción llevan a una unidad vista, con extra=1 para no marcar el plan", () => {
    for (const a of ["escucha", "lectura", "produccion"] as const) {
      const t = areaTarget(a, learned, day(1))!;
      expect(t.to, a).toContain("extra=1");
      const unit = t.to.match(/\/(u\d{2})/)![1];
      expect(learned, a).toContain(unit);
    }
    expect(areaTarget("escucha", learned, day(1))!.to).toMatch(/^\/dictado\//);
    expect(areaTarget("lectura", learned, day(1))!.to).toContain("mode=preguntas");
    expect(areaTarget("produccion", learned, day(1))!.to).toMatch(/^\/frases\//);
  });

  it("una unidad partida pide su semana A", () => {
    const partida = learned.find((u) => getUnit(u)?.parts)!;
    const t = areaTarget("lectura", [partida], day(1))!;
    expect(t.to).toContain("part=A");
  });

  it("es estable durante el día y las cinco áreas están cubiertas", () => {
    for (const a of PRACTICE_AREAS) expect(areaTarget(a, learned, day(3)), a).toEqual(areaTarget(a, learned, day(3)));
    expect(PRACTICE_AREAS).toHaveLength(5);
  });
});
