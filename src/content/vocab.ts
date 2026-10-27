import vocabJson from "./vocab.json";

export interface VocabItem {
  /** Palabra o expresión en italiano; con artículo si es un sustantivo (il tavolo). */
  it: string;
  es: string;
}

import { NUEVAS } from "./nuevas";

const VOCAB: Record<string, VocabItem[]> = {
  ...(vocabJson as Record<string, VocabItem[]>),
  ...Object.fromEntries(NUEVAS.map((n) => [n.id, n.vocab])),
};

export function getVocab(unit: string): VocabItem[] | undefined {
  return VOCAB[unit];
}
