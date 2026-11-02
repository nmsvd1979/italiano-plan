import { describe, expect, it } from "vitest";
import { COURSE } from "./course";
import { forStep, hasReserve, loadPruebas, pruebasDisponibles, validatePruebas, type Pruebas } from "./pruebas";

describe("reserva de ítems de prueba (G8)", () => {
  let p: Pruebas = {};
  it("el archivo existe y se carga", async () => {
    expect(pruebasDisponibles()).toBe(true);
    p = await loadPruebas();
    expect(Object.keys(p).length).toBe(28);
  });
  it("no tiene errores de formato", () => {
    expect(validatePruebas(p)).toEqual([]);
  });
  it("cada semana del curso tiene 3 de lectura, 3 de escucha y 4 de gramática", () => {
    for (const s of COURSE) {
      const part = s.part ?? null;
      expect(hasReserve(p, s.unit, part), s.id).toBe(true);
      expect(forStep(p[s.unit].lectura, part).length, `${s.id} lectura`).toBe(3);
      expect(forStep(p[s.unit].escucha, part).length, `${s.id} escucha`).toBe(3);
      expect(forStep(p[s.unit].gramatica, part).length, `${s.id} gramática`).toBe(4);
    }
  });
  it("los ítems no repiten el enunciado de la práctica sin pista", async () => {
    const sin = (await import("./sinpista.json")).default as Record<string, { prompt?: string }[]>;
    const used = new Set(Object.values(sin).flat().map((e) => (e.prompt ?? "").toLowerCase()));
    const mine = Object.values(p).flatMap((u) => [...u.lectura.map((x) => x.text), ...u.escucha.map((x) => x.it), ...u.gramatica.map((x) => x.prompt)]);
    expect(mine.filter((t) => used.has(t.toLowerCase()))).toEqual([]);
  });
});
