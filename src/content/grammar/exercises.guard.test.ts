import { describe, expect, it } from "vitest";
import { UNITS } from "../curriculum";
import { exercisesOf } from ".";
import baseline from "./exercises-baseline.json";

// Los ids de los ejercicios son posicionales (`u25-e00`): el repaso de errados y las tarjetas `cloze` del repaso espaciado
// los guardan. Por eso los ejercicios nuevos se agregan SOLO AL FINAL y los existentes no se editan ni se reordenan.
// Si hay que corregir uno a propósito, se regenera `exercises-baseline.json` y se explica en el PR (docs/v2/plan-b1/03).

const hash = (s: string): string => {
  let x = 5381;
  for (let i = 0; i < s.length; i++) x = ((x << 5) + x + s.charCodeAt(i)) >>> 0;
  return x.toString(16);
};

describe("ejercicios de lección: solo se agregan al final", () => {
  const base = baseline as Record<string, { n: number; hash: string }>;
  it("hay línea base para todas las unidades", () => {
    expect(Object.keys(base).sort()).toEqual(UNITS.map((u) => u.id).sort());
  });
  for (const u of UNITS) {
    it(`${u.id}: los ${base[u.id]?.n} ejercicios originales no cambian de lugar ni de texto`, () => {
      const ex = exercisesOf(u.id);
      expect(ex.length).toBeGreaterThanOrEqual(base[u.id].n);
      expect(hash(JSON.stringify(ex.slice(0, base[u.id].n).map((e) => e.exercise)))).toBe(base[u.id].hash);
    });
  }
});

// Piso de ejercicios por «Puedo…» (docs/v2/plan-b1/03). Sube con cada PR de contenido y no puede bajar.
const FLOOR: Record<string, number> = {
  u01: 10, u02: 10, u03: 10, u04: 10, u05: 10, u06: 10, u07: 10, u08: 10, u09: 13.5, u10: 15, u11: 14, u12: 10, u13: 11, u14: 12.5,
  u15: 10, u16: 10, u17: 12.5, u18: 10, u19: 10, u20: 21, u21: 10, u22: 10, u23: 10, u24: 10.5, u25: 10, u26: 10, u27: 10, u28: 10,
};

describe("piso de ejercicios por «Puedo…»", () => {
  for (const u of UNITS) {
    it(`${u.id} tiene al menos ${FLOOR[u.id]} por «Puedo…»`, () => {
      expect(exercisesOf(u.id).length / u.canDo.length).toBeGreaterThanOrEqual(FLOOR[u.id]);
    });
  }
});
