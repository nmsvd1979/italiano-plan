import { describe, expect, it } from "vitest";
import { COURSE } from "./course";
import { allVelocidad, getVelocidad, hasVelocidad, numeroIt } from "./velocidad";

// Tabla escrita a mano, aparte de la función: los casos con elisión, tilde y centenas.
const TABLA: [number, string][] = [
  [0, "zero"], [1, "uno"], [3, "tre"], [8, "otto"], [10, "dieci"], [11, "undici"], [16, "sedici"], [19, "diciannove"],
  [20, "venti"], [21, "ventuno"], [23, "ventitré"], [28, "ventotto"], [30, "trenta"], [31, "trentuno"], [33, "trentatré"], [38, "trentotto"],
  [40, "quaranta"], [45, "quarantacinque"], [51, "cinquantuno"], [56, "cinquantasei"], [67, "sessantasette"], [73, "settantatré"],
  [81, "ottantuno"], [88, "ottantotto"], [93, "novantatré"], [99, "novantanove"],
  [100, "cento"], [101, "centouno"], [108, "centotto"], [115, "centoquindici"], [120, "centoventi"], [180, "centottanta"], [183, "centottantatré"],
  [200, "duecento"], [248, "duecentoquarantotto"], [303, "trecentotré"], [418, "quattrocentodiciotto"], [505, "cinquecentocinque"],
  [650, "seicentocinquanta"], [777, "settecentosettantasette"], [999, "novecentonovantanove"], [1000, "mille"],
];

describe("numeroIt", () => {
  it("coincide con la tabla escrita a mano", () => {
    for (const [n, it] of TABLA) expect(numeroIt(n), String(n)).toBe(it);
  });

  it("rechaza lo que no es un entero de 0 a 1000", () => {
    expect(() => numeroIt(-1)).toThrow();
    expect(() => numeroIt(1001)).toThrow();
    expect(() => numeroIt(2.5)).toThrow();
  });
});

describe("números a velocidad", () => {
  it("solo hay ítems en pasos del curso, sin repetidos dentro de una semana, y hay 15 por semana", () => {
    for (const id of ["u25", "u01", "u03#A", "u03#B"]) {
      expect(COURSE.some((s) => s.id === id), id).toBe(true);
      expect(hasVelocidad(id)).toBe(true);
      const items = getVelocidad(id)!;
      expect(items).toHaveLength(15);
      expect(new Set(items.map((i) => i.n)).size, id).toBe(items.length);
    }
    expect(hasVelocidad("u04")).toBe(false);
    expect(allVelocidad()).toHaveLength(60);
  });
});
