import {
  Activity, CHECKPOINT_WEEKS, DAY_TEMPLATES, PHASES, PHASE_INPUT, PHASE_TEST_ACTIVITY, Phase,
  RESOURCES, Resource, TOTAL_WEEKS,
} from "../content/plan";
import { addDays, diffInDays } from "./dates";

export interface PlanState {
  /** Día del plan, 1-indexado. Menor que 1 = todavía no empezó. */
  dayNumber: number;
  weekNumber: number;
  phase: Phase;
  notStarted: boolean;
  finished: boolean;
}

export function phaseForWeek(week: number): Phase {
  return PHASES.find((p) => p.weeks.includes(week)) ?? PHASES[PHASES.length - 1];
}

export function planStateForDate(startDate: Date, date: Date): PlanState {
  const dayNumber = diffInDays(date, startDate) + 1;
  const weekNumber = Math.min(TOTAL_WEEKS, Math.max(1, Math.ceil(dayNumber / 7)));
  return {
    dayNumber,
    weekNumber,
    phase: phaseForWeek(weekNumber),
    notStarted: dayNumber < 1,
    finished: dayNumber > TOTAL_WEEKS * 7,
  };
}

export function weekDateRange(startDate: Date, week: number): Date[] {
  const weekStart = addDays(startDate, (week - 1) * 7);
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

/**
 * Actividades de un día. En las semanas de checkpoint, el repaso mixto del fin de
 * semana se reemplaza por el test de fase.
 */
export function activitiesForDate(date: Date, week: number): Activity[] {
  const tpl = DAY_TEMPLATES[date.getDay()];
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  if (!isWeekend || !CHECKPOINT_WEEKS[week]) return tpl.activities;
  return tpl.activities.map((a) => (a.kind === "mixedReview" ? PHASE_TEST_ACTIVITY : a));
}

export function plannedCountForDate(date: Date): number {
  return DAY_TEMPLATES[date.getDay()].activities.length;
}

export function dayLabel(date: Date): string {
  return DAY_TEMPLATES[date.getDay()].label;
}

/** Resuelve las claves de recursos de una actividad (incluido el placeholder "input"). */
export function resolveResources(activity: Activity, phaseId: 1 | 2 | 3): Resource[] {
  const keys = (activity.resources ?? []).flatMap((k) => (k === "input" ? PHASE_INPUT[phaseId] : [k]));
  return keys.map((k) => RESOURCES[k]).filter(Boolean);
}
