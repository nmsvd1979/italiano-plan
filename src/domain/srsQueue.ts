import { UNITS } from "../content/curriculum";
import { addDays, diffInDays, formatDateHuman, parseISODate, toISODate } from "./dates";
import type { Progress } from "./curriculum";
import { wordsSeen } from "./cycle";
import { dayOf, cardId, type CardKind, type SrsCard, type SrsState } from "./srs";
import { quizletItemId, wordsOfUnit, type QuizletEntry } from "./srsDeck";

// Cola diaria (docs/v2/02 B5).

export const LIMITS = {
  /** Palabras nuevas por día. */
  newPerDay: 8,
  /** Tarjetas nuevas del mazo extra por día. */
  quizletNewPerDay: 5,
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
  deck?: "quizlet";
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
  /** Entradas del mazo extra (solo si está activado). */
  quizlet?: QuizletEntry[];
}

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

export function buildQueue({ state, today, eligibleUnits, quizlet = [] }: QueueInput): Queue {
  const todayISO = toISODate(today);
  const cards = Object.values(state.cards);

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
  const fresh: NewCandidate[] = [];
  if (!newBlocked) {
    const introducedToday = (quizletDeck: boolean) =>
      cards.filter((c) => c.kind === "recog" && c.source !== "seed" && (c.deck === "quizlet") === quizletDeck
        && dayOf(c.createdAt) === todayISO).length;

    let room = LIMITS.newPerDay - introducedToday(false);
    for (const unit of eligibleUnits) {
      if (room <= 0) break;
      for (const w of wordsOfUnit(unit)) {
        if (room <= 0) break;
        if (state.cards[cardId("recog", w.itemId)]) continue;
        fresh.push({ kind: "recog", itemId: w.itemId, unit });
        room--;
      }
    }

    if (state.options?.quizlet) {
      let qRoom = LIMITS.quizletNewPerDay - introducedToday(true);
      for (const q of quizlet) {
        if (qRoom <= 0) break;
        const itemId = quizletItemId(q.n);
        if (state.cards[cardId("recog", itemId)]) continue;
        fresh.push({ kind: "recog", itemId, unit: "extra", deck: "quizlet" });
        qRoom--;
      }
    }
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

/** Cuántas tarjetas se respondieron hoy. */
export function answeredToday(state: SrsState, today: Date): number {
  const iso = toISODate(today);
  return state.log.filter((e) => dayOf(e.at) === iso).length;
}

/** Unidades cuyo bloque «Palabras de la unidad» ya hiciste (en el ciclo nuevo o en la app anterior), en orden de currículo. */
export function eligibleUnits(progress: Pick<Progress, "done">): string[] {
  return UNITS.filter((u) => u.ready && wordsSeen(u.id, progress.done)).map((u) => u.id);
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
  const later = Object.values(state.cards).map((c) => dayOf(c.fsrs.due)).filter((d) => d > todayISO).sort();
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
