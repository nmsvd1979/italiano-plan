import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FRASES_PRUEBA } from "../../content/pruebaVoz";
import { VOCES, aleatorizar, armarResultado, contarVotos, mezclar } from "./logic";

/** Generador determinista para que la prueba no dependa del azar. */
const semilla = (s: number) => () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);

describe("aleatorización", () => {
  it("cada frase conserva las 3 opciones, una vez cada una", () => {
    for (let s = 1; s <= 50; s++) {
      const orden = aleatorizar(FRASES_PRUEBA.map((f) => f.id), semilla(s));
      expect(Object.keys(orden)).toHaveLength(10);
      for (const voces of Object.values(orden)) expect([...voces].sort()).toEqual([...VOCES].sort());
    }
  });

  it("mezclar no pierde ni repite elementos", () => {
    expect(mezclar([1, 2, 3, 4, 5], semilla(7)).sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it("el orden varía entre frases (no es siempre el mismo)", () => {
    const orden = aleatorizar(FRASES_PRUEBA.map((f) => f.id), semilla(3));
    expect(new Set(Object.values(orden).map((o) => o.join())).size).toBeGreaterThan(1);
  });
});

describe("conteo de votos", () => {
  const orden = { p01: ["c1", "c2", "sistema"], p02: ["sistema", "c1", "c2"], p03: ["c2", "sistema", "c1"] } as const;

  it("traduce etiqueta → voz y suma", () => {
    const votos = { p01: 0, p02: 1, p03: 2 }; // c1, c1, c1
    expect(contarVotos(orden as never, votos)).toEqual({ c1: 3, c2: 0, sistema: 0 });
    expect(contarVotos(orden as never, { p01: 2, p02: 0 })).toEqual({ c1: 0, c2: 0, sistema: 2 });
  });

  it("sin votos todo es cero", () => {
    expect(contarVotos(orden as never, {})).toEqual({ c1: 0, c2: 0, sistema: 0 });
  });

  it("el resultado guardado incluye total y voz por frase", () => {
    const r = armarResultado(orden as never, { p01: 1, p02: 0 }, "2026-11-03");
    expect(r).toEqual({ fecha: "2026-11-03", total: { c1: 0, c2: 1, sistema: 1 }, porFrase: { p01: "c2", p02: "sistema" } });
  });
});

describe("frases y ruta", () => {
  it("son 10 con id único y texto no vacío", () => {
    expect(FRASES_PRUEBA).toHaveLength(10);
    expect(new Set(FRASES_PRUEBA.map((f) => f.id)).size).toBe(10);
    expect(FRASES_PRUEBA.every((f) => f.it.length > 0)).toBe(true);
  });

  it("cada frase sale tal cual de dictation.ts o dialogues.ts", () => {
    const fuente = readFileSync("src/content/dictation.ts", "utf8") + readFileSync("src/content/dialogues.ts", "utf8");
    for (const f of FRASES_PRUEBA) expect(fuente, f.it).toContain(`"${f.it}"`);
  });

  it("la ruta no aparece en ninguna pantalla de navegación", () => {
    for (const f of ["src/features/today/Today.tsx", "src/features/settings/Settings.tsx", "src/features/plan/PlanScreen.tsx", "src/features/progress/Progress.tsx", "src/app/links.ts"]) {
      expect(readFileSync(f, "utf8"), f).not.toContain("prueba-voz");
    }
  });

  it("los mp3 de prueba quedan fuera del precache", () => {
    expect(readFileSync("vite.config.ts", "utf8")).toContain('"audio-prueba/**"');
  });
});
