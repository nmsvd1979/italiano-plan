import { toISODate } from "./dates";
import { rng, shuffle, type Candidate, type ReviewState } from "./review";
import { KEYS_V2, type KV } from "./storage";

// «Practicar más» (docs/v2/plan-b1/06): ejercicios de lecciones ya vistas, empezando por los que nunca salieron aquí.
// No suma al avance del ciclo: es práctica extra, no una semana adelantada.

export interface MoreState {
  version: 1;
  /** Veces que «Practicar más» sirvió cada ejercicio. */
  served: Record<string, number>;
}

export const MORE_SIZE = 10;

export const emptyMore = (): MoreState => ({ version: 1, served: {} });

export function loadMore(store: KV): MoreState {
  try {
    const raw = store.getItem(KEYS_V2.practiceMore);
    if (!raw) return emptyMore();
    const p = JSON.parse(raw) as Partial<MoreState>;
    if (p.version !== 1 || typeof p.served !== "object" || p.served === null || Array.isArray(p.served)) return emptyMore();
    return { version: 1, served: p.served };
  } catch {
    return emptyMore();
  }
}

export function saveMore(state: MoreState, store: KV): void {
  store.setItem(KEYS_V2.practiceMore, JSON.stringify(state));
}

export function markServed(state: MoreState, ids: readonly string[]): MoreState {
  const served = { ...state.served };
  for (const id of ids) served[id] = (served[id] ?? 0) + 1;
  return { version: 1, served };
}

interface PickArgs {
  candidates: Candidate[];
  review: ReviewState;
  more: MoreState;
  today: Date;
  size?: number;
  seed: string;
}

/**
 * Orden de preferencia: errados que ya pueden volver (hasta un tercio), luego los que nunca salieron aquí y, cuando
 * ya salieron todos, los que salieron menos veces. Nunca devuelve una lista vacía mientras haya candidatos.
 */
export function pickMore({ candidates, review, more, today, size = MORE_SIZE, seed }: PickArgs): string[] {
  const rand = rng(seed);
  const todayISO = toISODate(today);
  const times = (c: Candidate) => more.served[c.id] ?? 0;
  const due = candidates.filter((c) => review[c.id] && review[c.id].due <= todayISO)
    .sort((a, b) => review[a.id].due.localeCompare(review[b.id].due))
    .slice(0, Math.max(1, Math.floor(size / 3)));
  const taken = new Set(due.map((c) => c.id));
  // Barajar primero y ordenar después por veces servidas: el orden estable mantiene el azar dentro de cada grupo.
  const rest = shuffle(candidates.filter((c) => !taken.has(c.id)), rand).sort((a, b) => times(a) - times(b));
  return shuffle([...due, ...rest].slice(0, size), rand).map((c) => c.id);
}

/** Cuántos ejercicios de las lecciones vistas nunca salieron en «Practicar más». */
export const unseenCount = (candidates: Candidate[], more: MoreState): number =>
  candidates.filter((c) => !more.served[c.id]).length;
