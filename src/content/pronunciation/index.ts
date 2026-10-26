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

/**
 * Palabras que todavía no tienen grabación nativa (se leen con la voz del sistema).
 * Corre `npm run audio` en tu computador: baja las que existan en Lingua Libre y actualiza el manifest;
 * después quita de esta lista las que ya tengan audio (el test te avisa).
 */
export const AUDIO_PENDING: string[] = ["abbia", "affitto", "allegato", "ambulanza", "arredato", "ascensore", "attimo", "avessi", "bacca", "basta", "capitano", "cellulare", "comprerei", "comunque", "càpitano", "dammelo", "dimmelo", "emergenza", "faccia", "facessi", "fato", "fatto", "febbre", "fossi", "gentile", "gliela", "glielo", "gliene", "gola", "ha", "hai", "hanno", "ho", "informazione", "ingresso", "insomma", "invece", "medico", "messaggio", "messo", "nona", "note", "notte", "orario", "ormai", "papa", "papà", "però", "portarmelo", "possa", "posso", "potessi", "pozzo", "pronto", "quarto", "quindi", "quinto", "resterei", "richiamare", "riscaldamento", "rotto", "rubinetto", "schiena", "serra", "sia", "siamo", "spiegarmelo", "stia", "stomaco", "terzo", "testa", "tosse", "tuta", "tutta", "vacca", "vada", "vasta", "vene", "venga", "viaggerei", "volessi"];
