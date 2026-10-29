import { measuredMinutes, type Timings } from "./timing";

// Minutos que se muestran de cada bloque: estimados (el repaso espaciado según la cola de hoy) o medidos.

/** Segundos que se estiman por tarjeta del repaso espaciado. */
export const SECONDS_PER_CARD = 15;
export const SRS_MIN_MINUTES = 1;
export const SRS_MAX_MINUTES = 10;

export function srsMinutes(cards: number): number {
  const m = Math.ceil((cards * SECONDS_PER_CARD) / 60);
  return Math.min(SRS_MAX_MINUTES, Math.max(SRS_MIN_MINUTES, m));
}

/** Minutos estimados de un bloque; solo el repaso espaciado depende de la cola de hoy. */
export function estimatedMinutes(block: { kind: string; minutes: number }, srsCards: number): number {
  return block.kind === "srs" ? srsMinutes(srsCards) : block.minutes;
}

export interface DayBlock {
  key: string;
  estimated: number;
  done: boolean;
  core: boolean;
}

/** Minutos del día: los medidos de los bloques hechos que los tienen y los estimados de los demás. */
export function dayMinutes(blocks: DayBlock[], timings: Timings): number {
  return blocks.reduce((n, b) => n + ((b.done ? measuredMinutes(timings, b.key) : undefined) ?? b.estimated), 0);
}

/** Si lo esencial terminó con menos de este porcentaje del tiempo estimado, «Hacer más hoy» se destaca. */
export const SHORT_DAY_RATIO = 0.8;

/** Lo esencial del día se hizo en menos del 80 % del tiempo estimado (con tiempos medidos; sin medir cuenta lo estimado). */
export function endedShort(blocks: DayBlock[], timings: Timings): boolean {
  const core = blocks.filter((b) => b.core);
  const estimated = core.reduce((n, b) => n + b.estimated, 0);
  if (estimated <= 0) return false;
  return dayMinutes(core, timings) < estimated * SHORT_DAY_RATIO;
}
