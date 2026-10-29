import { findExercise, type Fill } from "../content/grammar";
import { getDictation } from "../content/dictation";
import { getVocab, getWords, type GeneralWord, type VocabItem, type VocabWord } from "../content/vocab";
import { rng, shuffle } from "./review";
import type { SrsCard } from "./srs";

// De dónde sale el contenido de cada tarjeta: vocabulario de la unidad, ejercicios de completar, dictados y mazo general.

export const slug = (text: string): string =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const wordItemId = (unit: string, it: string): string => `${unit}:${slug(it)}`;
export const sentenceItemId = (unit: string, it: string): string => `${unit}:d-${slug(it)}`;
/** Id estable de una tarjeta del mazo general: sale de la palabra, no de su posición en la lista. */
export const generalItemId = (it: string): string => `g:${slug(it)}`;

export interface Word {
  itemId: string;
  unit: string;
  it: string;
  es: string;
  ex?: string;
  exEs?: string;
  /** Palabra de la ampliación (no del vocabulario original). */
  extra?: boolean;
  part?: "A" | "B";
}

const toWords = (unit: string, list: readonly (VocabItem & Partial<Pick<VocabWord, "extra" | "part">>)[]): Word[] => {
  const seen = new Set<string>();
  const out: Word[] = [];
  for (const v of list) {
    const itemId = wordItemId(unit, v.it);
    if (seen.has(itemId)) continue;
    seen.add(itemId);
    out.push({ itemId, unit, it: v.it, es: v.es, ex: v.ex, exEs: v.exEs, ...(v.extra ? { extra: true, part: v.part } : {}) });
  }
  return out;
};

/**
 * Solo el núcleo de la unidad (el vocabulario original), en su orden y sin repetir. Lo usan la siembra de continuidad
 * y el diagnóstico: la ampliación no se ha estudiado y no debe darse por conocida.
 */
export function wordsOfUnit(unit: string): Word[] {
  return toWords(unit, getVocab(unit) ?? []);
}

/** El núcleo más la ampliación (G3), en ese orden. De aquí salen las palabras nuevas del repaso y el contenido de sus tarjetas. */
export function allWordsOfUnit(unit: string): Word[] {
  return toWords(unit, getWords(unit) ?? []);
}

export interface DeckContext {
  /** Mazo general de frecuencia por id de tarjeta; vacío mientras no se haya cargado. */
  general: ReadonlyMap<string, GeneralWord>;
}

export const emptyContext = (): DeckContext => ({ general: new Map() });

export const contextOf = (deck: readonly GeneralWord[]): DeckContext => ({
  general: new Map(deck.map((w) => [generalItemId(w.it), w])),
});

export type Resolved =
  | { kind: "recog" | "prod"; it: string; es: string; ex?: string; exEs?: string }
  | { kind: "cloze"; prompt: string; answers: string[]; why: string }
  | { kind: "listen"; it: string; es: string };

/** Busca el contenido de la tarjeta; null si ya no existe (contenido cambiado o mazo no cargado). */
export function resolveCard(card: SrsCard, ctx: DeckContext): Resolved | null {
  if (card.kind === "recog" || card.kind === "prod") {
    // Las tarjetas del antiguo mazo de Quizlet se conservan en el almacenamiento pero ya no se muestran.
    if (card.deck === "quizlet") return null;
    if (card.deck === "general") {
      const g = ctx.general.get(card.itemId);
      return g ? { kind: card.kind, it: g.it, es: g.es, ex: g.ex, exEs: g.exEs } : null;
    }
    const w = allWordsOfUnit(card.unit).find((x) => x.itemId === card.itemId);
    return w ? { kind: card.kind, it: w.it, es: w.es, ...(w.ex ? { ex: w.ex, exEs: w.exEs } : {}) } : null;
  }
  if (card.kind === "cloze") {
    const e = findExercise(card.itemId)?.exercise;
    if (!e || e.type !== "fill") return null;
    const fill: Fill = e;
    return { kind: "cloze", prompt: fill.prompt, answers: fill.answers, why: fill.why };
  }
  const d = (getDictation(card.unit) ?? []).find((x) => sentenceItemId(card.unit, x.it) === card.itemId);
  return d ? { kind: "listen", it: d.it, es: d.es } : null;
}

export interface ChoiceSet {
  options: string[];
  answerIndex: number;
}

/**
 * Significado correcto más hasta 3 distractores de la misma unidad (o de la misma clase de palabra, si es del mazo general);
 * si no alcanza, se completa con palabras de otras unidades. Orden estable por tarjeta y repetición.
 */
export function choicesFor(card: SrsCard, correct: string, ctx: DeckContext, units: string[]): ChoiceSet {
  const rand = rng(`${card.id}:${card.fsrs.reps}`);
  const distinct = (list: string[]) => [...new Set(list)].filter((es) => es !== correct);
  const mine = card.deck === "general" ? ctx.general.get(card.itemId) : undefined;
  const same = card.deck === "general"
    ? distinct([...ctx.general.values()].filter((g) => g.pos === mine?.pos).map((g) => g.es))
    : distinct(allWordsOfUnit(card.unit).map((w) => w.es));
  const others = card.deck === "general"
    ? distinct([...ctx.general.values()].map((g) => g.es))
    : distinct(units.filter((u) => u !== card.unit).flatMap(allWordsOfUnit).map((w) => w.es));
  const picked = [...shuffle(same, rand), ...shuffle(others, rand)].filter((es, i, a) => a.indexOf(es) === i).slice(0, 3);
  const options = shuffle([correct, ...picked], rand);
  return { options, answerIndex: options.indexOf(correct) };
}
