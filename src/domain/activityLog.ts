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
