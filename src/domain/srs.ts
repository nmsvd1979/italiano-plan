import { createEmptyCard, fsrs, generatorParameters, type Card, type Grade } from "ts-fsrs";
import { toISODate } from "./dates";
import { SRS_KEY, type KV } from "./storage";

// Repaso espaciado propio (docs/v2/02). Algoritmo FSRS vía ts-fsrs (MIT). Todo vive en localStorage
// bajo italianPlan.srs.v1 para que la copia de seguridad lo incluya. No toca review.ts ni sus claves.

export type CardKind = "recog" | "prod" | "cloze" | "listen";
export type RatingValue = 1 | 2 | 3 | 4;

/** Estado FSRS con las fechas como texto ISO 8601, para guardarlo como JSON. */
export interface FsrsData {
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number;
  last_review?: string;
}

export interface SrsCard {
  /** `${kind}:${itemId}` */
  id: string;
  kind: CardKind;
  /** Palabra (`u04:il-tavolo`), ejercicio (`u04-e03`), frase de dictado (`u04:d-vorrei-un-caffe`) o `q123` (mazo extra). */
  itemId: string;
  unit: string;
  fsrs: FsrsData;
  createdAt: string;
  /** Tarjeta del mazo extra de Quizlet. */
  deck?: "quizlet";
  /** Creada con estado inicial sembrado desde el progreso previo (fase H2). */
  source?: "seed";
}

export interface SrsLogEntry {
  cardId: string;
  at: string;
  rating: RatingValue;
  /** Milisegundos que tardó en responder. */
  ms: number;
}

export interface SrsState {
  version: 1;
  cards: Record<string, SrsCard>;
  /** Máximo LOG_MAX entradas: se recortan las más viejas. */
  log: SrsLogEntry[];
  options?: { quizlet?: boolean };
}

export const LOG_MAX = 3000;
/** La tarjeta de producir se desbloquea cuando la de reconocer llega a esta estabilidad (días). */
export const PROD_UNLOCK_STABILITY = 4;

export const cardId = (kind: CardKind, itemId: string): string => `${kind}:${itemId}`;

// enable_short_term desactivado: sin pasos de minutos, porque se repasa una vez al día y la cola se arma por día.
const scheduler = fsrs(generatorParameters({
  request_retention: 0.9, maximum_interval: 180, enable_fuzz: true, enable_short_term: false,
}));

export const emptySrs = (): SrsState => ({ version: 1, cards: {}, log: [] });

export function loadSrs(store: KV): SrsState {
  try {
    const raw = store.getItem(SRS_KEY);
    if (!raw) return emptySrs();
    const parsed = JSON.parse(raw) as Partial<SrsState>;
    if (parsed.version !== 1 || typeof parsed.cards !== "object" || parsed.cards === null) return emptySrs();
    return { ...parsed, version: 1, cards: parsed.cards, log: Array.isArray(parsed.log) ? parsed.log : [] };
  } catch {
    return emptySrs();
  }
}

export function saveSrs(state: SrsState, store: KV): void {
  store.setItem(SRS_KEY, JSON.stringify(state));
}

/** Crea la clave vacía si no existe (nunca pisa una existente). */
export function ensureSrs(store: KV): void {
  if (store.getItem(SRS_KEY) === null) saveSrs(emptySrs(), store);
}

const toCard = (f: FsrsData): Card => ({
  ...f,
  due: new Date(f.due),
  last_review: f.last_review ? new Date(f.last_review) : undefined,
});

const fromCard = (c: Card): FsrsData => ({
  due: c.due.toISOString(),
  stability: c.stability,
  difficulty: c.difficulty,
  elapsed_days: c.elapsed_days,
  scheduled_days: c.scheduled_days,
  learning_steps: c.learning_steps,
  reps: c.reps,
  lapses: c.lapses,
  state: c.state,
  ...(c.last_review ? { last_review: c.last_review.toISOString() } : {}),
});

interface NewCardInput {
  kind: CardKind;
  itemId: string;
  unit: string;
  deck?: "quizlet";
}

/** Tarjeta nueva, vence ahora. */
export function newSrsCard(input: NewCardInput, now: Date): SrsCard {
  return {
    id: cardId(input.kind, input.itemId),
    kind: input.kind,
    itemId: input.itemId,
    unit: input.unit,
    fsrs: fromCard(createEmptyCard(now)),
    createdAt: now.toISOString(),
    ...(input.deck ? { deck: input.deck } : {}),
  };
}

/** Tarjeta con estado inicial (estabilidad, dificultad, lapsos y vencimiento) para la siembra de H2. */
export function seedSrsCard(
  input: NewCardInput & { stability: number; difficulty: number; lapses?: number; due: Date },
  now: Date,
): SrsCard {
  return {
    ...newSrsCard(input, now),
    source: "seed",
    fsrs: {
      due: input.due.toISOString(), stability: input.stability, difficulty: input.difficulty,
      elapsed_days: 0, scheduled_days: Math.max(1, Math.round(input.stability)), learning_steps: 0,
      reps: 1, lapses: input.lapses ?? 0, state: 2, last_review: now.toISOString(),
    },
  };
}

export function rateCard(card: SrsCard, rating: RatingValue, now: Date): SrsCard {
  const { card: next } = scheduler.next(toCard(card.fsrs), now, rating as Grade);
  return { ...card, fsrs: fromCard(next) };
}

const trim = (log: SrsLogEntry[]): SrsLogEntry[] => (log.length > LOG_MAX ? log.slice(log.length - LOG_MAX) : log);

/** Guarda la respuesta: actualiza la tarjeta y agrega la entrada al historial. */
export function applyReview(state: SrsState, card: SrsCard, rating: RatingValue, now: Date, ms: number): SrsState {
  const next = rateCard(card, rating, now);
  return {
    ...state,
    cards: { ...state.cards, [card.id]: next },
    log: trim([...state.log, { cardId: card.id, at: now.toISOString(), rating, ms }]),
  };
}

/**
 * Cambia la calificación de la respuesta que se acaba de guardar («Me equivoqué al escribir», «Fácil»):
 * recalcula desde la tarjeta tal como estaba antes y reemplaza la última entrada del historial.
 */
export function rerateLast(state: SrsState, before: SrsCard, rating: RatingValue, now: Date, ms: number): SrsState {
  const next = rateCard(before, rating, now);
  const log = [...state.log];
  const last = log[log.length - 1];
  const entry: SrsLogEntry = { cardId: before.id, at: now.toISOString(), rating, ms };
  if (last && last.cardId === before.id) log[log.length - 1] = entry;
  else log.push(entry);
  return { ...state, cards: { ...state.cards, [before.id]: next }, log: trim(log) };
}

/** Crea las tarjetas de producir para las palabras cuya tarjeta de reconocer ya llegó a la estabilidad mínima. */
export function unlockProdCards(state: SrsState, now: Date): SrsState {
  let cards = state.cards;
  for (const c of Object.values(state.cards)) {
    if (c.kind !== "recog" || c.deck === "quizlet" || c.fsrs.stability < PROD_UNLOCK_STABILITY) continue;
    const id = cardId("prod", c.itemId);
    if (cards[id]) continue;
    if (cards === state.cards) cards = { ...state.cards };
    cards[id] = newSrsCard({ kind: "prod", itemId: c.itemId, unit: c.unit }, now);
  }
  return cards === state.cards ? state : { ...state, cards };
}

/** Agrega una tarjeta (cloze / listen por un fallo en la práctica) si todavía no existe. */
export function addCardIfMissing(state: SrsState, input: NewCardInput, now: Date): SrsState {
  const id = cardId(input.kind, input.itemId);
  if (state.cards[id]) return state;
  return { ...state, cards: { ...state.cards, [id]: newSrsCard(input, now) } };
}

/** Día local (AAAA-MM-DD) de un instante guardado. */
export const dayOf = (iso: string): string => toISODate(new Date(iso));

/** Guarda en el almacenamiento una tarjeta nueva por un fallo en la práctica o el dictado. */
export function recordFailure(store: KV, input: NewCardInput, now: Date = new Date()): void {
  const state = loadSrs(store);
  const next = addCardIfMissing(state, input, now);
  if (next !== state) saveSrs(next, store);
}
