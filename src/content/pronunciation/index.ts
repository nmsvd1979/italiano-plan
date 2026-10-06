import weeksJson from "./weeks.json";
import manifestJson from "./manifest.json";

export interface PronWeek {
  week: number;
  title: string;
  tip: string;
  /** Pares mínimos: dos palabras que solo se distinguen por el sonido que se entrena. */
  pairs: [string, string][];
  /** Palabras para escuchar y repetir en voz alta. */
  words: string[];
}

export const PRON_WEEKS = weeksJson.weeks as PronWeek[];
export const GLOSS: Record<string, string> = weeksJson.gloss;

/** Palabra (minúscula) → archivos de audio nativo disponibles (una voz por archivo). */
const AUDIO = manifestJson as Record<string, string[]>;

export function getPronWeek(week: number): PronWeek | undefined {
  return PRON_WEEKS.find((w) => w.week === week);
}

export function audioFiles(word: string): string[] {
  return AUDIO[word.toLowerCase()] ?? [];
}

export function allWords(): string[] {
  return [...new Set(PRON_WEEKS.flatMap((w) => [...w.pairs.flat(), ...w.words]))];
}
