import type { KV } from "./storage";
import { KEYS_V2 } from "./storage";

// Tiempo real por bloque (con la pantalla activa). Clave nueva: no toca ninguna clave anterior.

/** Una pausa más larga que esto sin tocar la pantalla no cuenta como estudio. */
export const PAUSE_MS = 2 * 60 * 1000;

export interface BlockTime {
  /** Milisegundos de estudio activo acumulados (puede sumar varias aperturas). */
  ms: number;
  /** Primera vez que se abrió (ms desde 1970). */
  start: number;
  /** Último momento con actividad (ms desde 1970). */
  end: number;
}

/** Clave del bloque (`u04.d2.lesson`) → tiempo medido. */
export interface Timings {
  version: 1;
  blocks: Record<string, BlockTime>;
}

export const emptyTimings = (): Timings => ({ version: 1, blocks: {} });

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0;

/**
 * Lee lo guardado y lo lleva al formato actual. Un valor ausente, dañado o de otra versión da un registro vacío;
 * las entradas incompletas se descartan una a una.
 */
export function normalizeTimings(raw: unknown): Timings {
  const out = emptyTimings();
  if (typeof raw !== "object" || raw === null) return out;
  const r = raw as { version?: unknown; blocks?: unknown };
  if (r.version !== 1 || typeof r.blocks !== "object" || r.blocks === null) return out;
  for (const [key, v] of Object.entries(r.blocks as Record<string, unknown>)) {
    const t = v as Partial<BlockTime> | null;
    if (t && isNum(t.ms) && isNum(t.start) && isNum(t.end)) out.blocks[key] = { ms: t.ms, start: t.start, end: t.end };
  }
  return out;
}

export function loadTimings(store: KV): Timings {
  try {
    const raw = store.getItem(KEYS_V2.timing);
    return raw ? normalizeTimings(JSON.parse(raw)) : emptyTimings();
  } catch {
    return emptyTimings();
  }
}

export function saveTimings(timings: Timings, store: KV): void {
  store.setItem(KEYS_V2.timing, JSON.stringify(timings));
}

/** Crea la clave vacía si no existe (nunca pisa una existente). */
export function ensureTimings(store: KV): void {
  if (store.getItem(KEYS_V2.timing) === null) saveTimings(emptyTimings(), store);
}

/** Suma un tramo medido a un bloque. */
export function addTiming(store: KV, blockKey: string, slice: BlockTime): Timings {
  const all = loadTimings(store);
  const prev = all.blocks[blockKey];
  all.blocks[blockKey] = prev
    ? { ms: prev.ms + slice.ms, start: Math.min(prev.start, slice.start), end: Math.max(prev.end, slice.end) }
    : { ...slice };
  saveTimings(all, store);
  return all;
}

/**
 * Reloj de un bloque abierto. Cada `beat` (toque, tecla, desplazamiento…) suma el tiempo desde el anterior si fue
 * menor que PAUSE_MS; si no, esa pausa se descarta. Mientras la pantalla está oculta no se suma nada.
 */
export class BlockClock {
  private ms = 0;
  private last: number;
  private hidden = false;
  readonly start: number;

  constructor(readonly key: string, now: number) {
    this.start = now;
    this.last = now;
  }

  beat(now: number): void {
    if (this.hidden) return;
    const delta = now - this.last;
    if (delta > 0 && delta <= PAUSE_MS) this.ms += delta;
    this.last = Math.max(this.last, now);
  }

  hide(now: number): void {
    this.beat(now);
    this.hidden = true;
  }

  show(now: number): void {
    this.hidden = false;
    this.last = now;
  }

  /** Lo medido desde la última vez que se tomó; reinicia el contador (el inicio se conserva). */
  take(): BlockTime | null {
    if (this.ms <= 0) return null;
    const slice = { ms: this.ms, start: this.start, end: this.last };
    this.ms = 0;
    return slice;
  }
}

/** Minutos medidos de un bloque (mínimo 1 si se midió algo), o undefined si no hay medición. */
export function measuredMinutes(timings: Timings, key: string): number | undefined {
  const t = timings.blocks[key];
  return t && t.ms > 0 ? Math.max(1, Math.round(t.ms / 60000)) : undefined;
}

/** Los minutos nominales de cada clave, reemplazados por los medidos donde existen. */
export function withMeasured(nominal: ReadonlyMap<string, number>, timings: Timings): Map<string, number> {
  const out = new Map(nominal);
  for (const key of Object.keys(timings.blocks)) {
    const m = measuredMinutes(timings, key);
    if (m !== undefined) out.set(key, m);
  }
  return out;
}
