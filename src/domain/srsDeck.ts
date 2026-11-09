import { findExercise, type Fill } from "../content/grammar";
import { getDictation } from "../content/dictation";
import { COURSE } from "../content/course";
import { getVocab, getWords, type GeneralWord } from "../content/vocab";
import type { SinPista } from "../content/sinpista";
import { isSinPistaId, resolveSinPista } from "./sinpistaSrs";
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
/** Mazo de frecuencia (`base-frecuente.json`): el id sale de la palabra, no del puesto, que puede cambiar si se corrige la lista. */
export const freqItemId = (it: string): string => `f:${slug(it)}`;

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

/**
 * Palabras de la unidad más sus palabras ampliadas (G3), sin repetir. Sirve para encontrar el contenido de cualquier tarjeta
 * ya creada y para armar distractores; qué palabras ampliadas entran a la cola lo decide `srsExtras.ts`.
 */
export function allWordsOfUnit(unit: string): Word[] {
  const seen = new Set<string>();
  const out: Word[] = [];
  for (const v of getWords(unit) ?? []) {
    const itemId = wordItemId(unit, v.it);
    if (seen.has(itemId)) continue;
    seen.add(itemId);
    out.push({ itemId, unit, it: v.it, es: v.es });
  }
  return out;
}

let HOME: Map<string, string> | null = null;

/**
 * Unidad «principal» de cada palabra de la lista de unidad: la primera del curso que la trae (*perché* en u08, no en u20 ni
 * u24). Las demás unidades la repasan sin tarjeta propia: crear otra duplicaría la carga del repaso espaciado.
 */
export function wordHomeUnit(it: string): string | undefined {
  if (!HOME) {
    HOME = new Map();
    for (const unit of [...new Set(COURSE.map((s) => s.unit))]) {
      for (const v of getVocab(unit) ?? []) if (!HOME.has(slug(v.it))) HOME.set(slug(v.it), unit);
    }
  }
  return HOME.get(slug(it));
}

/** El mazo extra se carga solo cuando se necesita: no pesa en la carga inicial. */
export async function loadQuizletDeck(): Promise<QuizletEntry[]> {
  const mod = await import("../../data/quizlet-1400.json");
  return (mod.default as QuizletEntry[]).filter((e) => e.enApp === null);
}

/** El mazo de frecuencia se carga solo cuando se necesita; sin repetidas y sin las palabras que ya están en una unidad (vocabulario o ampliadas). */
export async function loadFreqDeck(): Promise<GeneralWord[]> {
  const { loadGeneralDeck } = await import("../content/vocab");
  const seen = new Set<string>();
  return (await loadGeneralDeck()).filter((w) => {
    const k = slug(w.it);
    if (seen.has(k) || isUnitWord(w.it)) return false;
    seen.add(k);
    return true;
  });
}

let UNIT_WORDS: Set<string> | null = null;
/** ¿La palabra ya está en alguna unidad del curso (lista de la unidad o ampliadas)? Esas ya tienen su tarjeta. */
export function isUnitWord(it: string): boolean {
  if (!UNIT_WORDS) {
    UNIT_WORDS = new Set();
    for (const unit of new Set(COURSE.map((s) => s.unit))) for (const w of getWords(unit) ?? []) UNIT_WORDS.add(slug(w.it));
  }
  return UNIT_WORDS.has(slug(it));
}

export interface DeckContext {
  quizlet: ReadonlyMap<string, QuizletEntry>;
  /** Mazo de frecuencia por id de tarjeta (`f:…`). */
  freq?: ReadonlyMap<string, GeneralWord>;
  /** Ejercicios sin pista por id; se cargan solo si hay tarjetas que vienen de ahí. */
  sinpista?: ReadonlyMap<string, SinPista>;
}

/** Los ejercicios sin pista se cargan solo si alguna tarjeta viene de ahí. */
export async function loadSinPistaMap(): Promise<ReadonlyMap<string, SinPista>> {
  const mod = await import("../content/sinpista");
  return new Map(mod.SINPISTA_UNITS.flatMap((u) => mod.getSinPista(u)).map((e) => [e.id, e]));
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
    if (card.deck === "freq") {
      const f = ctx.freq?.get(card.itemId);
      return f ? { kind: card.kind, it: f.it, es: f.es } : null;
    }
    const w = allWordsOfUnit(card.unit).find((x) => x.itemId === card.itemId);
    return w ? { kind: card.kind, it: w.it, es: w.es } : null;
  }
  if (isSinPistaId(card.itemId)) {
    const ex = ctx.sinpista?.get(card.itemId);
    return ex ? resolveSinPista(ex) : null;
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
    : card.deck === "freq"
      ? distinct([...(ctx.freq?.values() ?? [])].map((f) => f.es))
      : distinct(allWordsOfUnit(card.unit).map((w) => w.es));
  const others = card.deck === "quizlet" || card.deck === "freq"
    ? []
    : distinct(units.filter((u) => u !== card.unit).flatMap(wordsOfUnit).map((w) => w.es));
  const picked = [...shuffle(same, rand), ...shuffle(others, rand)].filter((es, i, a) => a.indexOf(es) === i).slice(0, 3);
  const options = shuffle([correct, ...picked], rand);
  return { options, answerIndex: options.indexOf(correct) };
}
