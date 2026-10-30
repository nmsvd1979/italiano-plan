import { KEYS_V2, type KV } from "./storage";

// Rotación de la práctica sin pista (G5): cada semana tiene 12 ejercicios (6 por parte en unidades partidas) y el día 3
// muestra 7. Se anota cuántas veces respondiste cada uno para no repetirlos hasta agotar los 12; los que no salieron
// aparecen en el repaso mixto del día 7 y los que fallaste, en los días de repaso dirigido.

export interface SinPistaState {
  version: 1;
  /** Veces que respondiste cada ejercicio. */
  shown: Record<string, number>;
  /** Fallados que aún no has acertado. */
  missed: string[];
  /** Semanas (`u04`, `u02#A`) cuya práctica ya abriste: solo de ellas salen ejercicios en el repaso. */
  opened: string[];
}

export const WEEK_SIZE = 7;

export const emptySinPista = (): SinPistaState => ({ version: 1, shown: {}, missed: [], opened: [] });

export function loadSinPista(store: KV): SinPistaState {
  try {
    const raw = store.getItem(KEYS_V2.sinpista);
    if (!raw) return emptySinPista();
    const p = JSON.parse(raw) as Partial<SinPistaState>;
    if (p.version !== 1 || typeof p.shown !== "object" || p.shown === null) return emptySinPista();
    return {
      version: 1,
      shown: p.shown,
      missed: Array.isArray(p.missed) ? p.missed : [],
      opened: Array.isArray(p.opened) ? p.opened : [],
    };
  } catch {
    return emptySinPista();
  }
}

export function saveSinPista(state: SinPistaState, store: KV): void {
  store.setItem(KEYS_V2.sinpista, JSON.stringify(state));
}

/**
 * Los `n` ejercicios de la semana que menos veces has respondido (a igualdad, en el orden original), en su orden original.
 * Con 12 ejercicios y 7 por sesión: la primera sesión toma 1–7, la segunda los 5 que faltan y 2 de los primeros.
 */
export function pickWeek<T extends { id: string }>(list: readonly T[], state: SinPistaState, n = WEEK_SIZE): T[] {
  const ranked = list.map((ex, i) => ({ ex, i, seen: state.shown[ex.id] ?? 0 }));
  ranked.sort((a, b) => a.seen - b.seen || a.i - b.i);
  return ranked.slice(0, n).sort((a, b) => a.i - b.i).map((r) => r.ex);
}

/** Anota una respuesta: suma una vez vista, y agrega o quita el ejercicio de los fallados. */
export function recordSinPista(state: SinPistaState, id: string, stepId: string, correct: boolean): SinPistaState {
  const missed = correct ? state.missed.filter((m) => m !== id) : state.missed.includes(id) ? state.missed : [...state.missed, id];
  return {
    ...state,
    shown: { ...state.shown, [id]: (state.shown[id] ?? 0) + 1 },
    missed,
    opened: state.opened.includes(stepId) ? state.opened : [...state.opened, stepId],
  };
}

/** Semana a la que pertenece un ejercicio: `u04`, o `u02#A` si la unidad se parte. */
export const stepOf = (ex: { id: string; part?: "A" | "B" }): string => {
  const unit = ex.id.slice(0, ex.id.indexOf("-"));
  return ex.part ? `${unit}#${ex.part}` : unit;
};

/**
 * Ejercicios para el repaso mixto (día 7) o el repaso dirigido: primero los fallados y, en el repaso mixto, los de las
 * semanas ya abiertas que todavía no salieron. Nunca de una semana que no has abierto (A no ve los de B).
 */
export function pickReview<T extends { id: string; part?: "A" | "B" }>(
  all: readonly T[], state: SinPistaState, mode: "review" | "due", n = 4,
): T[] {
  const missed = all.filter((e) => state.missed.includes(e.id));
  const unseen = mode === "review"
    ? all.filter((e) => !(state.shown[e.id] > 0) && state.opened.includes(stepOf(e)))
    : [];
  return [...missed, ...unseen].slice(0, n);
}
