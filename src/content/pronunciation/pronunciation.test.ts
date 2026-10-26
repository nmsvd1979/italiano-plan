import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { READY_UNITS } from "../curriculum";
import { AUDIO_PENDING, GLOSS, PRON_UNITS, allWords, audioFiles } from "./index";

describe("licencia del audio", () => {
  it("cada archivo mp3 tiene su crédito (CC BY-SA exige atribuir a cada voz)", () => {
    const credits = readFileSync(path.join(process.cwd(), "public/audio/ATTRIBUZIONI.md"), "utf8");
    const files = readdirSync(path.join(process.cwd(), "public/audio")).filter((f) => f.endsWith(".mp3"));
    expect(files.length).toBeGreaterThan(0);
    const missing = files.filter((f) => !credits.includes(`\`${f}\``));
    expect(missing).toEqual([]);
  });

  it("el manifest solo apunta a archivos que existen", () => {
    const manifest = JSON.parse(readFileSync(path.join(process.cwd(), "src/content/pronunciation/manifest.json"), "utf8")) as Record<string, string[]>;
    for (const [word, files] of Object.entries(manifest)) {
      for (const f of files) expect(existsSync(path.join(process.cwd(), "public/audio", f)), `${word}: ${f}`).toBe(true);
    }
  });
});

describe("contenido de pronunciación", () => {
  it("cada unidad disponible tiene su práctica, en orden de currículo", () => {
    const units = PRON_UNITS.map((w) => w.unit);
    expect(units).toEqual([...units].sort());
    for (const u of READY_UNITS) expect(units, `falta la práctica de ${u.id}`).toContain(u.id);
  });

  it("cada palabra usada tiene audio nativo y el archivo existe (o está en AUDIO_PENDING)", () => {
    const missing = allWords().filter((w) => audioFiles(w).length === 0 && !AUDIO_PENDING.includes(w));
    expect(missing, "palabras sin audio: corre npm run audio y, si siguen sin audio, agrégalas a AUDIO_PENDING").toEqual([]);
    const stale = AUDIO_PENDING.filter((w) => audioFiles(w).length > 0 || !allWords().includes(w));
    expect(stale, "ya tienen audio o ya no se usan: quítalas de AUDIO_PENDING").toEqual([]);
    for (const w of allWords()) {
      for (const f of audioFiles(w)) {
        expect(existsSync(path.join(process.cwd(), "public/audio", f)), `${w}: falta ${f}`).toBe(true);
      }
    }
  });

  it("los pares son de dos palabras distintas y tienen significado para mostrar", () => {
    for (const week of PRON_UNITS) {
      for (const [a, b] of week.pairs) {
        expect(a.toLowerCase(), `unidad ${week.unit}`).not.toBe(b.toLowerCase());
        expect(GLOSS[a], `falta significado de "${a}"`).toBeTruthy();
        expect(GLOSS[b], `falta significado de "${b}"`).toBeTruthy();
      }
      expect(week.tip.length).toBeGreaterThan(20);
      expect(week.words.length + week.pairs.length).toBeGreaterThan(0);
    }
  });

  it("las unidades con pares tienen suficientes para variar los intentos", () => {
    const sin = PRON_UNITS.filter((w) => w.pairs.length > 0 && w.pairs.length < 2).map((w) => w.unit);
    expect(sin).toEqual([]);
  });
});
