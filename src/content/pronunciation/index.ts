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

import { NUEVAS } from "../nuevas";

export const PRON_UNITS = [...(unitsJson.units as PronUnit[]), ...NUEVAS.map((n) => n.pron)];
export const GLOSS: Record<string, string> = { ...unitsJson.gloss, ...Object.assign({}, ...NUEVAS.map((n) => n.gloss)) };

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

/**
 * Palabras que todavía no tienen grabación nativa (se leen con la voz del sistema).
 * Corre `npm run audio` en tu computador: baja las que existan en Lingua Libre y actualiza el manifest;
 * después quita de esta lista las que ya tengan audio (el test te avisa).
 */
export const AUDIO_PENDING: string[] = ["autunno", "cugino", "figlia", "figli", "filo", "fratello", "moglie", "messe", "molle", "paglia", "primavera", "rossa", "sorella", "abbia", "amico", "cina", "là", "sano", "sì", "tè", "tetto", "tutto", "vano", "allegato", "arredato", "avessi", "comprerei", "càpitano", "dammelo", "dimmelo", "facessi", "fato", "fatto", "gliene", "ingresso", "messo", "nona", "note", "orario", "papa", "papà", "portarmelo", "possa", "posso", "potessi", "resterei", "richiamare", "serra", "spiegarmelo", "stia", "tutta", "vada", "venga", "viaggerei", "volessi"];
