import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { GLOSS, PRON_WEEKS, allWords, audioFiles } from "./index";

describe("contenido de pronunciación", () => {
  it("hay 12 semanas en orden", () => {
    expect(PRON_WEEKS.map((w) => w.week)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("cada palabra usada tiene audio nativo y el archivo existe", () => {
    const missing = allWords().filter((w) => audioFiles(w).length === 0);
    expect(missing, "palabras sin audio (corre npm run audio o quítalas del JSON)").toEqual([]);
    for (const w of allWords()) {
      for (const f of audioFiles(w)) {
        expect(existsSync(path.join(process.cwd(), "public/audio", f)), `${w}: falta ${f}`).toBe(true);
      }
    }
  });

  it("los pares son de dos palabras distintas y tienen significado para mostrar", () => {
    for (const week of PRON_WEEKS) {
      for (const [a, b] of week.pairs) {
        expect(a.toLowerCase(), `semana ${week.week}`).not.toBe(b.toLowerCase());
        expect(GLOSS[a], `falta significado de "${a}"`).toBeTruthy();
        expect(GLOSS[b], `falta significado de "${b}"`).toBeTruthy();
      }
      expect(week.tip.length).toBeGreaterThan(20);
      expect(week.words.length + week.pairs.length).toBeGreaterThan(0);
    }
  });

  it("las semanas con pares tienen suficientes para variar los intentos", () => {
    const sin = PRON_WEEKS.filter((w) => w.pairs.length > 0 && w.pairs.length < 2).map((w) => w.week);
    expect(sin).toEqual([]);
  });
});
