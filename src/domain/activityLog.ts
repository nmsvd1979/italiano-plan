import { LOG_KEY, type KV } from "./storage";

// Registro de actividad (docs/v2/06 F1), solo lo necesario para guardar la autoevaluación de grabar y comparar.
// Clave en localStorage, así que entra en la copia de seguridad: arreglo de entradas, máximo 2000 (se recorta lo más antiguo).

export { LOG_KEY };
export const LOG_MAX_ENTRIES = 2000;

export interface LogEntry {
  /** AAAA-MM-DD */
  date: string;
  unit: string;
  activity: string;
  minutes: number;
  correct?: number;
  total?: number;
  /** Autoevaluación de 1 a 3. */
  selfRating?: number;
}

export function loadLog(store: KV): LogEntry[] {
  try {
    const raw = store.getItem(LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as LogEntry[]).filter((e) => e && typeof e.date === "string" && typeof e.unit === "string" && typeof e.activity === "string") : [];
  } catch {
    return [];
  }
}

export function appendLog(store: KV, entry: LogEntry): void {
  const all = [...loadLog(store), entry];
  store.setItem(LOG_KEY, JSON.stringify(all.length > LOG_MAX_ENTRIES ? all.slice(all.length - LOG_MAX_ENTRIES) : all));
}

/** Tope de minutos por bloque y día (docs/v2/06 F1). */
export const MINUTES_CAP = 30;

/** `u02#A.d3.varied` → unidad `u02`, bloque `varied`. */
export function parseBlockKey(key: string): { unit: string; activity: string } | null {
  const m = key.match(/^(u\d{2})(?:#[AB])?\.d\d+\.(.+)$/);
  return m ? { unit: m[1], activity: m[2] } : null;
}

/** Suma minutos medidos (bloque abierto y visible) a la entrada del día; nunca más de MINUTES_CAP por bloque y día. */
export function addMinutes(store: KV, date: string, unit: string, activity: string, minutes: number): void {
  if (!(minutes > 0)) return;
  const all = loadLog(store);
  const at = all.findIndex((e) => e.date === date && e.unit === unit && e.activity === activity && e.correct === undefined && e.selfRating === undefined);
  const round = (n: number) => Math.round(n * 10) / 10;
  if (at >= 0) all[at] = { ...all[at], minutes: round(Math.min(MINUTES_CAP, all[at].minutes + minutes)) };
  else all.push({ date, unit, activity, minutes: round(Math.min(MINUTES_CAP, minutes)) });
  store.setItem(LOG_KEY, JSON.stringify(all.length > LOG_MAX_ENTRIES ? all.slice(all.length - LOG_MAX_ENTRIES) : all));
}
