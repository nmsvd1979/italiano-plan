import vocabJson from "./vocab.json";

export interface VocabItem {
  /** Palabra o expresión en italiano; con artículo si es un sustantivo (il tavolo). */
  it: string;
  es: string;
}

const VOCAB = vocabJson as Record<string, VocabItem[]>;

export function getVocab(unit: string): VocabItem[] | undefined {
  return VOCAB[unit];
}
