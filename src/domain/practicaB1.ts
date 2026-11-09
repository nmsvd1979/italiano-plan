import { KEYS_V2, type KV } from "./storage";

// Resultados de «Práctica B1»: por actividad (`lectura:b1-1`, `escucha:b1-1`), el último intento y el mejor.

export interface B1Result { correct: number; total: number; date: string; best: number }
export type B1Results = Record<string, B1Result>;

/** Se da por lograda una actividad con ≥ 75 % (criterio propio, como el de las mini-pruebas; no es el del CILS B1). */
export const B1_PASS = 0.75;

export const b1Key = (kind: "lectura" | "escucha", id: string): string => `${kind}:${id}`;

export function loadB1(store: KV): B1Results {
  try {
    const raw = store.getItem(KEYS_V2.practiceB1);
    if (!raw) return {};
    const p = JSON.parse(raw) as unknown;
    if (typeof p !== "object" || p === null || Array.isArray(p)) return {};
    const out: B1Results = {};
    for (const [k, v] of Object.entries(p as Record<string, Partial<B1Result>>)) {
      if (v && typeof v.correct === "number" && typeof v.total === "number" && v.total > 0 && typeof v.date === "string") {
        out[k] = { correct: v.correct, total: v.total, date: v.date, best: typeof v.best === "number" ? v.best : v.correct };
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function recordB1(store: KV, key: string, correct: number, total: number, date: string): B1Results {
  const all = loadB1(store);
  const best = Math.max(all[key]?.best ?? 0, correct);
  all[key] = { correct, total, date, best };
  store.setItem(KEYS_V2.practiceB1, JSON.stringify(all));
  return all;
}

export const passedB1 = (r: B1Result | undefined): boolean => !!r && r.best / r.total >= B1_PASS;

/** Cuántas de las actividades de un tipo están logradas. */
export function b1Passed(results: B1Results, kind: "lectura" | "escucha", ids: readonly string[]): number {
  return ids.filter((id) => passedB1(results[b1Key(kind, id)])).length;
}
