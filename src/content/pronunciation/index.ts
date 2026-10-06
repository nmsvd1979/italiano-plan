import unitsJson from "./units.json";
import manifestJson from "./manifest.json";

export interface PronUnit {
  /** Id de la unidad del currículo (ej. "u04"). */
  unit: string;
  title: string;
  tip: string;
  /** Pares mínimos: dos palabras que solo se distinguen por el sonido que se entrena. */
  pairs: [string, string][];
  /** Palabras para escuchar y repetir en voz alta. */
  words: string[];
}

export const PRON_UNITS = unitsJson.units as PronUnit[];
export const GLOSS: Record<string, string> = unitsJson.gloss;

/** Palabra (minúscula) → archivos de audio nativo disponibles (una voz por archivo). */
const AUDIO = manifestJson as Record<string, string[]>;

export function getPronUnit(unit: string): PronUnit | undefined {
  return PRON_UNITS.find((w) => w.unit === unit);
}

export function audioFiles(word: string): string[] {
  return AUDIO[word.toLowerCase()] ?? [];
}

export function allWords(): string[] {
  return [...new Set(PRON_UNITS.flatMap((w) => [...w.pairs.flat(), ...w.words]))];
}
