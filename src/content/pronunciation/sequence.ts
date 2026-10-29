import seq from "./pron-sequence.json";

/** Secuencia de pronunciación (G6): un contraste nuevo por semana del curso (id del paso: `u02#A`, `u07#B`, `u21`…). */
export interface PronStep {
  title: string;
  /** Consejo en español con *cursivas* para el italiano. */
  tip: string;
  /** Pares mínimos o contrastes (puede estar vacío). */
  pairs: [string, string][];
  /** Palabras o frases para escuchar y repetir. */
  words: string[];
}

const DATA = seq as unknown as { steps: Record<string, PronStep>; gloss: Record<string, string>; audioPending: string[] };

export const PRON_STEP_IDS = Object.keys(DATA.steps);

export function getPronStep(stepId: string): PronStep | undefined {
  return DATA.steps[stepId];
}

/** Significado en español de una palabra de la secuencia (sin distinguir mayúsculas). */
export function pronGloss(word: string): string | undefined {
  return DATA.gloss[word.toLowerCase()];
}

/** Palabras de la secuencia sin grabación nativa todavía: se leen con voz sintética hasta tener audio (carril C). */
export const PRON_AUDIO_PENDING: string[] = DATA.audioPending;
