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
  // La opción correcta era la más larga en ≈61 % de los ítems (9-nov-2026; azar 33 %) y al alargar distractores a ciegas pasó a ser
  // «la del medio» en ≈60 %. Ahora «elegir la más larga / la más corta / la del medio» acierta ≈30–36 % en lectura y escucha; el tope
  // evita que cualquiera de las tres estrategias vuelva a rendir más que el azar con margen.
  it("elegir por longitud (más larga, más corta o del medio) no rinde mucho más que el azar", () => {
    const todos = Object.values(p).flatMap((u) => [...u.lectura, ...u.escucha]);
    expect(todos.length).toBe(210);
    const acierto = (objetivo: (largos: number[]) => number): number =>
      todos.reduce((suma, x) => {
        const largos = x.options.map((o) => o.length);
        const meta = objetivo(largos);
        const empatadas = largos.map((l, j) => (l === meta ? j : -1)).filter((j) => j >= 0);
        return suma + (empatadas.includes(x.answer) ? 1 / empatadas.length : 0);
      }, 0) / todos.length;
    expect(acierto((l) => Math.max(...l))).toBeLessThanOrEqual(0.4);
    expect(acierto((l) => Math.min(...l))).toBeLessThanOrEqual(0.4);
    expect(acierto((l) => [...l].sort((a, b) => a - b)[1])).toBeLessThanOrEqual(0.4);
  });
});
