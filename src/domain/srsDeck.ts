import { findExercise, type Fill } from "../content/grammar";
import { getDictation } from "../content/dictation";
import { getVocab } from "../content/vocab";
import { rng, shuffle } from "./review";
import type { SrsCard } from "./srs";

// De dónde sale el contenido de cada tarjeta: vocabulario de la unidad, ejercicios de completar, dictados y mazo extra.

export interface QuizletEntry {
  it: string;
  es: string;
  n: number;
  /** Unidad de la app donde ya está la palabra, o null si solo está en el mazo. */
  enApp: string | null;
}

export const slug = (text: string): string =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const wordItemId = (unit: string, it: string): string => `${unit}:${slug(it)}`;
export const sentenceItemId = (unit: string, it: string): string => `${unit}:d-${slug(it)}`;
export const quizletItemId = (n: number): string => `q${n}`;

export interface Word {
  itemId: string;
  unit: string;
  it: string;
  es: string;
}

/** Palabras de una unidad en el orden del vocabulario, sin repetir (por si dos entradas dan el mismo id). */
export function wordsOfUnit(unit: string): Word[] {
  const seen = new Set<string>();
  const out: Word[] = [];
  for (const v of getVocab(unit) ?? []) {
    const itemId = wordItemId(unit, v.it);
    if (seen.has(itemId)) continue;
    seen.add(itemId);
    out.push({ itemId, unit, it: v.it, es: v.es });
  }
  return out;
}

/** El mazo extra se carga solo cuando se necesita: no pesa en la carga inicial. */
export async function loadQuizletDeck(): Promise<QuizletEntry[]> {
  const mod = await import("../../data/quizlet-1400.json");
  return (mod.default as QuizletEntry[]).filter((e) => e.enApp === null);
}

export interface DeckContext {
  quizlet: ReadonlyMap<string, QuizletEntry>;
}

export const emptyContext = (): DeckContext => ({ quizlet: new Map() });

export type Resolved =
  | { kind: "recog" | "prod"; it: string; es: string }
  | { kind: "cloze"; prompt: string; answers: string[]; why: string }
  | { kind: "listen"; it: string; es: string };

/** Busca el contenido de la tarjeta; null si ya no existe (contenido cambiado o mazo no cargado). */
export function resolveCard(card: SrsCard, ctx: DeckContext): Resolved | null {
  if (card.kind === "recog" || card.kind === "prod") {
    if (card.deck === "quizlet") {
      const q = ctx.quizlet.get(card.itemId);
      return q ? { kind: card.kind, it: q.it, es: q.es } : null;
    }
    const w = wordsOfUnit(card.unit).find((x) => x.itemId === card.itemId);
    return w ? { kind: card.kind, it: w.it, es: w.es } : null;
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
 * Significado correcto más hasta 3 distractores de la misma unidad (o del mazo, si es del mazo extra);
 * si la unidad no alcanza, se completa con palabras de otras unidades. Orden estable por tarjeta y repetición.
 */
export function choicesFor(card: SrsCard, correct: string, ctx: DeckContext, units: string[]): ChoiceSet {
  const rand = rng(`${card.id}:${card.fsrs.reps}`);
  const distinct = (list: string[]) => [...new Set(list)].filter((es) => es !== correct);
  const same = card.deck === "quizlet"
    ? distinct([...ctx.quizlet.values()].map((q) => q.es))
    : distinct(wordsOfUnit(card.unit).map((w) => w.es));
  const others = card.deck === "quizlet"
    ? []
    : distinct(units.filter((u) => u !== card.unit).flatMap(wordsOfUnit).map((w) => w.es));
  const picked = [...shuffle(same, rand), ...shuffle(others, rand)].filter((es, i, a) => a.indexOf(es) === i).slice(0, 3);
  const options = shuffle([correct, ...picked], rand);
  return { options, answerIndex: options.indexOf(correct) };
}
