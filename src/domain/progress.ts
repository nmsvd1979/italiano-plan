import { addDays, toISODate } from "./dates";
import { plannedCountForDate } from "./planState";
import type { Completions } from "./storage";

/** Cantidad de actividades marcadas ese día, topeada por las planificadas. */
export function doneCountForDate(completions: Completions, date: Date): number {
  const rec = completions[toISODate(date)] ?? {};
  const done = Object.values(rec).filter(Boolean).length;
  return Math.min(done, plannedCountForDate(date));
}

export function aggregateProgress(completions: Completions, dates: Date[]): { planned: number; done: number } {
  let planned = 0;
  let done = 0;
  for (const d of dates) {
    planned += plannedCountForDate(d);
    done += doneCountForDate(completions, d);
  }
  return { planned, done };
}

export function hasAnyCompletion(completions: Completions, date: Date): boolean {
  const rec = completions[toISODate(date)];
  return !!rec && Object.values(rec).some(Boolean);
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

/** 0 = sin actividad, 1 = poca, 2 = más de la mitad, 3 = todo. */
export function heatLevel(done: number, planned: number): 0 | 1 | 2 | 3 {
  if (done <= 0 || planned <= 0) return 0;
  if (done >= planned) return 3;
  return done / planned >= 0.5 ? 2 : 1;
}
