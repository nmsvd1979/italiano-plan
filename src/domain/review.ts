import { addDays, toISODate } from "./dates";

// Repaso espaciado de los ejercicios errados (cajas de Leitner).
// Un error vuelve mañana; cada acierto posterior lo espacia más; tras el último intervalo se da por aprendido.

export interface ReviewEntry {
  box: number;
  /** Fecha (YYYY-MM-DD) desde la que el ítem puede volver a aparecer. */
  due: string;
}
export type ReviewState = Record<string, ReviewEntry>;

export const INTERVALS = [1, 2, 4, 8, 15];

export function recordResult(state: ReviewState, id: string, correct: boolean, today: Date): ReviewState {
  const next = { ...state };
  if (!correct) {
    next[id] = { box: 0, due: toISODate(addDays(today, INTERVALS[0])) };
    return next;
  }
  const entry = state[id];
  if (!entry) return state;
  if (entry.box >= INTERVALS.length - 1) {
    delete next[id];
    return next;
  }
  const box = entry.box + 1;
  next[id] = { box, due: toISODate(addDays(today, INTERVALS[box])) };
  return next;
}

export interface Candidate {
  id: string;
  /** Número de la unidad del ejercicio (4 para "u04"). */
  unit: number;
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rng(seed: string): () => number {
  let a = hash(seed);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: T[], rand: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface SessionArgs {
  /** Todos los ejercicios elegibles (de la unidad actual y anteriores). */
  candidates: Candidate[];
  /** Unidad a practicar. null = repaso mixto sin foco. */
  focusUnit: number | null;
  size: number;
  state: ReviewState;
  today: Date;
  /** La misma semilla da la misma sesión: recargar la pantalla no la cambia. */
  seed: string;
}

/**
 * Práctica: ~70 % de la unidad en foco y ~30 % de unidades anteriores (errados vencidos primero).
 * Repaso mixto: mezcla de todas las unidades, con los errados vencidos primero.
 */
export function buildSession({ candidates, focusUnit, size, state, today, seed }: SessionArgs): string[] {
  const rand = rng(seed);
  const todayISO = toISODate(today);
  const isDue = (c: Candidate) => !!state[c.id] && state[c.id].due <= todayISO;
  const byDue = (a: Candidate, b: Candidate) => state[a.id].due.localeCompare(state[b.id].due);
  const unique = (list: Candidate[]) => [...new Map(list.map((c) => [c.id, c])).values()];

  let picked: Candidate[];
  if (focusUnit === null) {
    const due = candidates.filter(isDue).sort(byDue);
    picked = unique([...due, ...shuffle(candidates, rand)]).slice(0, size);
  } else {
    const focus = candidates.filter((c) => c.unit === focusUnit);
    const earlier = candidates.filter((c) => c.unit < focusUnit);
    const reviewSlots = earlier.length > 0 ? Math.round(size * 0.3) : 0;

    const review = unique([...earlier.filter(isDue).sort(byDue), ...shuffle(earlier, rand)]).slice(0, reviewSlots);
    const main = unique([...focus.filter(isDue).sort(byDue), ...shuffle(focus, rand)]).slice(0, size - review.length);
    picked = [...review, ...main];
    if (picked.length < size) {
      const rest = unique([...earlier, ...focus]).filter((c) => !picked.some((p) => p.id === c.id));
      picked = [...picked, ...shuffle(rest, rand)].slice(0, size);
    }
  }
  return shuffle(picked, rand).map((c) => c.id);
}
