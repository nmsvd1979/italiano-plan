import { UNITS } from "../content/curriculum";
import type { CoursePart } from "../content/course";
import type { GeneralWord } from "../content/vocab";
import { addDays, diffInDays, formatDateHuman, parseISODate, toISODate } from "./dates";
import type { Progress } from "./curriculum";
import { partsSeen, wordsSeen } from "./cycle";
import { dayOf, cardId, generalOn, type CardKind, type SrsCard, type SrsState } from "./srs";
import { allWordsOfUnit, generalItemId } from "./srsDeck";

// Cola diaria (docs/v2/02 B5).

export const LIMITS = {
  /** Palabras nuevas por día. */
  newPerDay: 8,
  /** Tarjetas nuevas del mazo general por día. */
  generalNewPerDay: 5,
  /** De las nuevas de una tanda, la parte que sale de las unidades (el resto, del mazo general). */
  unitShare: 0.6,
  /** «Practicar más»: tarjetas de una tanda. */
  extraBatch: 20,
  /** «Practicar más»: tope de tarjetas extra por día. */
  extraPerDay: 40,
  /** «Practicar más»: se adelantan las tarjetas que vencen dentro de estos días. */
  extraAheadDays: 3,
  /** Con más vencidas que esto no se introducen nuevas. */
  blockNewAbove: 40,
  /** Tarjetas de una sesión de 5 minutos. */
  session: 20,
  /** Aviso al llegar a esta cantidad en un día. */
  warnAt: 60,
  /** Días sin abrir a partir de los cuales se limita la cola. */
  absentDays: 3,
  /** Tras una ausencia, vencidas visibles = habitual + 30 %. */
  absentExtra: 0.3,
  /** Habitual mínimo (una sesión), para quien casi no tenía historial. */
  minHabitual: 20,
} as const;

export interface NewCandidate {
  kind: CardKind;
  itemId: string;
  unit: string;
  deck?: "general";
}

export type QueueItem = { type: "due"; card: SrsCard } | { type: "new"; candidate: NewCandidate };

export interface Queue {
  items: QueueItem[];
  /** Vencidas hoy en total (antes de limitar por ausencia). */
  dueTotal: number;
  /** Vencidas que se pospusieron por ausencia larga. */
  postponed: number;
  /** Días desde el último repaso (null si nunca hubo uno). */
  absent: number | null;
  /** No se introducen nuevas porque hay demasiadas vencidas. */
  newBlocked: boolean;
}

export interface QueueInput {
  state: SrsState;
  today: Date;
  /** Unidades cuyo bloque «Palabras de la unidad» ya se mostró, en orden de currículo. */
  eligibleUnits: string[];
  /** Mazo general de frecuencia, ya cargado (se usa solo si está activado en Ajustes). */
  general?: readonly GeneralWord[];
  /** En las unidades partidas, las semanas cuyas palabras ya se mostraron: las de la ampliación de la otra semana no se introducen aún. */
  seenParts?: Readonly<Record<string, readonly CoursePart[]>>;
}

/** Las tarjetas del antiguo mazo de Quizlet se conservan en el almacenamiento, pero la cola las ignora. */
const live = (state: SrsState): SrsCard[] => Object.values(state.cards).filter((c) => c.deck !== "quizlet");

const isDue = (c: SrsCard, todayISO: string): boolean => dayOf(c.fsrs.due) <= todayISO;

/** Repasos por día en los últimos 14 días con actividad (promedio), para saber qué es «lo habitual». */
function habitual(state: SrsState, today: Date): number {
  const from = toISODate(addDays(today, -14));
  const perDay = new Map<string, number>();
  for (const e of state.log) {
    const d = dayOf(e.at);
    if (d >= from) perDay.set(d, (perDay.get(d) ?? 0) + 1);
  }
  if (perDay.size === 0) return LIMITS.minHabitual;
  const avg = [...perDay.values()].reduce((a, b) => a + b, 0) / perDay.size;
  return Math.max(LIMITS.minHabitual, Math.round(avg));
}

/**
 * Palabras nuevas de las unidades elegibles que aún no tienen tarjeta: primero el núcleo de cada unidad (en orden de
 * currículo) y después las palabras de la ampliación, para no dejar el vocabulario base de una unidad por detrás del
 * extra de otra.
 */
export function newUnitWords(
  state: SrsState,
  units: readonly string[],
  seenParts: QueueInput["seenParts"] = {},
  limit = Infinity,
): NewCandidate[] {
  const out: NewCandidate[] = [];
  for (const wanted of [false, true]) {
    for (const unit of units) {
      const seen = seenParts[unit];
      for (const w of allWordsOfUnit(unit)) {
        if (out.length >= limit) return out;
        if (!!w.extra !== wanted) continue;
        if (w.extra && w.part && seen && !seen.includes(w.part)) continue;
        if (state.cards[cardId("recog", w.itemId)]) continue;
        out.push({ kind: "recog", itemId: w.itemId, unit });
      }
    }
  }
  return out;
}

/** Palabras del mazo general que aún no tienen tarjeta, de la más frecuente a la menos. */
export function newGeneralWords(state: SrsState, general: readonly GeneralWord[], limit = Infinity): NewCandidate[] {
  const out: NewCandidate[] = [];
  for (const g of general) {
    if (out.length >= limit) break;
    const itemId = generalItemId(g.it);
    if (state.cards[cardId("recog", itemId)]) continue;
    out.push({ kind: "recog", itemId, unit: "general", deck: "general" });
  }
  return out;
}

/** Intercala las nuevas de unidad y las del mazo general (≈60 % / 40 %) sin pasar de los topes que ya traen las listas. */
export function mixNew(units: readonly NewCandidate[], general: readonly NewCandidate[]): NewCandidate[] {
  const out: NewCandidate[] = [];
  let u = 0;
  let g = 0;
  while (u < units.length || g < general.length) {
    const wantGeneral = g < Math.round((1 - LIMITS.unitShare) * (out.length + 1));
    if ((wantGeneral && g < general.length) || u >= units.length) out.push(general[g++]);
    else out.push(units[u++]);
  }
  return out;
}

export function buildQueue({ state, today, eligibleUnits, general = [], seenParts }: QueueInput): Queue {
  const todayISO = toISODate(today);
  const cards = live(state);

  const dueAll = cards
    .filter((c) => isDue(c, todayISO))
    .sort((a, b) => a.fsrs.due.localeCompare(b.fsrs.due));

  const last = state.log.length ? dayOf(state.log[state.log.length - 1].at) : null;
  const absent = last ? diffInDays(parseISODate(todayISO), parseISODate(last)) : null;
  let visible = dueAll;
  if (absent !== null && absent >= LIMITS.absentDays) {
    visible = dueAll.slice(0, Math.ceil(habitual(state, today) * (1 + LIMITS.absentExtra)));
  }

  const newBlocked = dueAll.length > LIMITS.blockNewAbove;
  let fresh: NewCandidate[] = [];
  if (!newBlocked) {
    const introducedToday = (deck: "general" | undefined) =>
      cards.filter((c) => c.kind === "recog" && c.source !== "seed" && c.deck === deck && dayOf(c.createdAt) === todayISO).length;

    const unitRoom = LIMITS.newPerDay - introducedToday(undefined);
    const fromUnits = unitRoom > 0 ? newUnitWords(state, eligibleUnits, seenParts, unitRoom) : [];
    const generalRoom = generalOn(state) ? LIMITS.generalNewPerDay - introducedToday("general") : 0;
    const fromGeneral = generalRoom > 0 ? newGeneralWords(state, general, generalRoom) : [];
    fresh = mixNew(fromUnits, fromGeneral);
  }

  return {
    items: [
      ...visible.map((card): QueueItem => ({ type: "due", card })),
      ...fresh.map((candidate): QueueItem => ({ type: "new", candidate })),
    ],
    dueTotal: dueAll.length,
    postponed: dueAll.length - visible.length,
    absent,
    newBlocked,
  };
}

export interface ExtraBatch {
  items: QueueItem[];
  /** Tarjetas extra que aún se pueden hacer hoy (tope diario menos las hechas). */
  capLeft: number;
  /** Por qué no hay tanda: se llegó al tope de hoy o ya no hay de dónde sacar tarjetas. null si hay tanda. */
  blocked: "cap" | "empty" | null;
}

/** Tarjetas extra respondidas hoy en «Practicar más». */
export function extraToday(state: SrsState, today: Date): number {
  const iso = toISODate(today);
  return state.log.filter((e) => e.extra && dayOf(e.at) === iso).length;
}

/**
 * «Practicar más»: una tanda de hasta 20 cuando ya no queda nada del día. Orden: tarjetas que vencen en los próximos
 * 3 días, palabras nuevas de unidades elegibles y palabras del mazo general. Las que ya respondiste hoy no se repiten.
 * El tope es de 40 tarjetas extra por día; las tarjetas se califican con las reglas normales.
 */
export function buildExtraBatch({ state, today, eligibleUnits, general = [], seenParts }: QueueInput): ExtraBatch {
  const capLeft = Math.max(0, LIMITS.extraPerDay - extraToday(state, today));
  const todayISO = toISODate(today);
  const limit = Math.min(LIMITS.extraBatch, capLeft);

  const answered = new Set(state.log.filter((e) => dayOf(e.at) === todayISO).map((e) => e.cardId));
  const ahead = toISODate(addDays(today, LIMITS.extraAheadDays));
  const soon = live(state)
    .filter((c) => { const d = dayOf(c.fsrs.due); return d > todayISO && d <= ahead && !answered.has(c.id); })
    .sort((a, b) => a.fsrs.due.localeCompare(b.fsrs.due));

  const items: QueueItem[] = soon.slice(0, limit).map((card) => ({ type: "due", card }));
  const room = () => limit - items.length;
  if (room() > 0) for (const candidate of newUnitWords(state, eligibleUnits, seenParts, room())) items.push({ type: "new", candidate });
  if (room() > 0 && generalOn(state)) for (const candidate of newGeneralWords(state, general, room())) items.push({ type: "new", candidate });

  return { items, capLeft, blocked: capLeft === 0 ? "cap" : items.length === 0 ? "empty" : null };
}

/** Cuántas tarjetas se respondieron hoy. */
export function answeredToday(state: SrsState, today: Date): number {
  const iso = toISODate(today);
  return state.log.filter((e) => dayOf(e.at) === iso).length;
}

/** Unidades cuyo bloque «Palabras de la unidad» ya hiciste (en el ciclo nuevo o en la app anterior), en orden de currículo. */
export function eligibleUnits(progress: Pick<Progress, "done">): string[] {
  return UNITS.filter((u) => u.ready && wordsSeen(u.id, progress.done)).map((u) => u.id);
}

/** Semanas ya vistas de cada unidad partida (para no introducir la ampliación de una semana que aún no empezaste). */
export function seenPartsOf(progress: Pick<Progress, "done">): Record<string, CoursePart[]> {
  const out: Record<string, CoursePart[]> = {};
  for (const u of UNITS) {
    const parts = partsSeen(u.id, progress.done);
    if (parts) out[u.id] = parts;
  }
  return out;
}

export interface NextDue {
  /** Día (AAAA-MM-DD) en que vence la próxima tarjeta pendiente. */
  date: string;
  /** Días desde hoy. */
  days: number;
  /** Tarjetas que vencen ese día. */
  count: number;
}

/** La próxima tarjeta que vencerá después de hoy, o null si no hay ninguna. */
export function nextDue(state: SrsState, today: Date): NextDue | null {
  const todayISO = toISODate(today);
  const later = live(state).map((c) => dayOf(c.fsrs.due)).filter((d) => d > todayISO).sort();
  if (later.length === 0) return null;
  const date = later[0];
  return { date, days: diffInDays(parseISODate(date), today), count: later.filter((d) => d === date).length };
}

/** Texto de «Nada por repasar ahora»: cuándo vence la próxima tarjeta y cuántas vencen ese día. */
export function nothingToReviewText(next: NextDue | null): string {
  if (!next) return "No quedan tarjetas vencidas ni palabras nuevas para hoy.";
  const cards = `${next.count} ${next.count === 1 ? "tarjeta" : "tarjetas"}`;
  const when = next.days === 1 ? "mañana" : `el ${formatDateHuman(parseISODate(next.date))}`;
  return `Hoy no vence ninguna tarjeta. La próxima vence ${when}: ${cards}.`;
}
