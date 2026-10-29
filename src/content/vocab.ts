import vocabJson from "./vocab.json";

import g3Json from "./vocab-g3.json";
import { NUEVAS } from "./nuevas";

/** «unidad»: palabra propia del tema de la unidad (situacional). «frecuente»: palabra de uso general (entre las ~2000 más frecuentes). */
export type VocabTag = "unidad" | "frecuente";

export interface VocabItem {
  /** Palabra o expresión en italiano; con artículo si es un sustantivo (il tavolo). */
  it: string;
  es: string;
  /** Frase de ejemplo en italiano (G3). */
  ex?: string;
  /** Traducción de la frase de ejemplo. */
  exEs?: string;
  tag?: VocabTag;
}

/** Palabra de la lista ampliada de una unidad (G3): las del núcleo más unas 30 nuevas. */
export interface VocabWord extends VocabItem {
  /** true si es de la ampliación y no del vocabulario original de la unidad. */
  extra: boolean;
  /** En las unidades partidas A/B, a qué semana pertenece una palabra de la ampliación. */
  part?: "A" | "B";
  /** Puesto en la lista de frecuencia (FrequencyWords), si lo tiene. */
  n?: number | null;
}

interface G3Unit {
  enrich: Record<string, { ex: string; exEs: string; tag: VocabTag }>;
  extra: { it: string; es: string; ex: string; exEs: string; tag: VocabTag; n: number | null; part?: "A" | "B" }[];
}
const G3 = g3Json as unknown as Record<string, G3Unit>;

const BASE: Record<string, VocabItem[]> = {
  ...(vocabJson as Record<string, VocabItem[]>),
  ...Object.fromEntries(NUEVAS.map((n) => [n.id, n.vocab])),
};

const VOCAB: Record<string, VocabItem[]> = Object.fromEntries(
  Object.entries(BASE).map(([unit, list]) => [
    unit,
    list.map((w) => {
      const e = G3[unit]?.enrich[w.it];
      return e ? { ...w, ex: e.ex, exEs: e.exEs, tag: e.tag } : w;
    }),
  ]),
);

/** El vocabulario original de la unidad (el que hoy practica la app), ahora con frase de ejemplo. */
export function getVocab(unit: string): VocabItem[] | undefined {
  return VOCAB[unit];
}

/** La lista ampliada de la unidad (G3): el núcleo con frase más las palabras nuevas, en ese orden. */
export function getWords(unit: string): VocabWord[] | undefined {
  const base = VOCAB[unit];
  if (!base) return undefined;
  const extra = G3[unit]?.extra ?? [];
  return [
    ...base.map((w) => ({ ...w, extra: false })),
    ...extra.map((e) => ({ it: e.it, es: e.es, ex: e.ex, exEs: e.exEs, tag: e.tag, extra: true, part: e.part, n: e.n })),
  ];
}

/** Mazo general de frecuencia (G3): palabras comunes que no pertenecen a una unidad concreta, con frase de ejemplo. */
export interface GeneralWord {
  it: string;
  es: string;
  ex: string;
  exEs: string;
  /** v verbo · n sustantivo · adj adjetivo · adv adverbio y otros · num número · mes mes · exp expresión */
  pos: "v" | "n" | "adj" | "adv" | "num" | "mes" | "exp";
  /** Puesto en la lista de frecuencia (menor = más frecuente); null si no figura. */
  n: number | null;
}

/** Se carga solo cuando se necesita, para no pesar en la carga inicial. */
export async function loadGeneralDeck(): Promise<GeneralWord[]> {
  const mod = await import("./base-frecuente.json");
  return mod.default as unknown as GeneralWord[];
}
