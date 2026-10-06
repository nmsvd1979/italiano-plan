import { addDays, diffInDays, parseISODate, toISODate } from "./dates";
import type { Completions } from "./storage";

/** Minutos que se asumen para una marca que no está en el currículo (marcas de la app anterior). */
export const LEGACY_MINUTES = 8;

/** Todas las claves marcadas, en cualquier fecha. */
export function doneKeys(completions: Completions): Set<string> {
  const keys = new Set<string>();
  for (const day of Object.values(completions)) for (const [k, v] of Object.entries(day)) if (v) keys.add(k);
  return keys;
}

export function keysOn(completions: Completions, date: Date): Set<string> {
  const rec = completions[toISODate(date)] ?? {};
  return new Set(Object.entries(rec).filter(([, v]) => v).map(([k]) => k));
}

export function hasAnyCompletion(completions: Completions, date: Date): boolean {
  return keysOn(completions, date).size > 0;
}

/** Minutos estudiados ese día, según los minutos de cada paso del currículo. */
export function minutesOn(
  completions: Completions, date: Date, minutesByKey: ReadonlyMap<string, number>, unknown = LEGACY_MINUTES,
): number {
  let total = 0;
  for (const k of keysOn(completions, date)) total += minutesByKey.get(k) ?? unknown;
  return total;
}

/**
 * Días consecutivos con al menos una actividad. Si hoy todavía no marcaste nada,
 * la racha cuenta desde ayer (hoy no la corta hasta que termine el día).
 */
export function computeStreak(completions: Completions, today: Date): number {
  let cursor = hasAnyCompletion(completions, today) ? today : addDays(today, -1);
  let streak = 0;
  while (hasAnyCompletion(completions, cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Días desde el último día con alguna marca (hoy = 0). null si nunca marcaste nada. */
export function daysSinceLastStudy(completions: Completions, today: Date): number | null {
  const days = Object.keys(completions).filter((iso) => hasAnyCompletion(completions, parseISODate(iso)));
  if (days.length === 0) return null;
  const last = days.sort().at(-1)!;
  return diffInDays(today, parseISODate(last));
}

/** 0 = nada, 1 = algo (hasta 19 min), 2 = una sesión normal (20–44 min), 3 = día largo (45 min o más). */
export function heatLevel(minutes: number): 0 | 1 | 2 | 3 {
  if (minutes <= 0) return 0;
  if (minutes >= 45) return 3;
  return minutes >= 20 ? 2 : 1;
}
