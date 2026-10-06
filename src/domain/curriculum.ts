import { UNITS, UnitMeta, sessionsOf } from "../content/curriculum";
import { Activity, PHASE_INPUT } from "../content/plan";

// Motor del plan adaptativo. Todo el currículo es una lista ordenada de pasos (actividades);
// el progreso son las marcas hechas (cualquier día) y los pasos que dejaste para después.
// Nada depende del calendario: si faltas, mañana sigue lo mismo; si te adelantas, sigue lo siguiente.

export interface Step {
  /** `unidad.sesión.actividad`, ej. "u04.s2.lesson". Es lo que se guarda en las marcas. */
  key: string;
  unit: UnitMeta;
  /** 1 a 6. */
  session: number;
  activity: Activity;
  /** Posición en la lista completa. */
  order: number;
}

export interface Progress {
  /** Claves hechas, en cualquier fecha. */
  done: ReadonlySet<string>;
  /** Claves que dejaste para después. */
  skipped: ReadonlySet<string>;
  /** Unidades anteriores a esta se consideran hechas ("empezar desde la unidad N"). */
  startUnit: number;
}

export function buildSteps(units: UnitMeta[] = UNITS): Step[] {
  const steps: Step[] = [];
  for (const unit of units.filter((x) => x.ready)) {
    for (const s of sessionsOf(unit)) {
      for (const activity of s.activities) {
        steps.push({ key: `${unit.id}.s${s.index}.${activity.id}`, unit, session: s.index, activity, order: steps.length });
      }
    }
  }
  return steps;
}

export function unitNumberOfKey(key: string): number {
  return Number(key.slice(1, key.indexOf(".")));
}

export function isSettled(step: Step, p: Progress): boolean {
  return p.done.has(step.key) || p.skipped.has(step.key) || step.unit.n < p.startUnit;
}

/** Claves que deben estar hechas antes de ofrecer este paso. */
export function requiresOf(step: Step, steps: Step[]): string[] {
  const id = step.activity.id;
  const lesson = `${step.unit.id}.s2.lesson`;
  if (["practice", "review", "writing", "dictation", "dialogue"].includes(id)) return [lesson];
  if (id === "test") {
    return steps.filter((s) => s.activity.id === "lesson" && s.unit.phase === step.unit.phase).map((s) => s.key);
  }
  return [];
}

function met(key: string, p: Progress): boolean {
  return p.done.has(key) || unitNumberOfKey(key) < p.startUnit;
}

/** Pendiente y con sus requisitos cumplidos (la práctica nunca antes que su lección). */
export function isOffered(step: Step, steps: Step[], p: Progress): boolean {
  return !isSettled(step, p) && requiresOf(step, steps).every((k) => met(k, p));
}

export function nextSteps(steps: Step[], p: Progress): Step[] {
  return steps.filter((s) => isOffered(s, steps, p));
}

/** Lo que dejaste para después y sigue sin hacerse, en orden de currículo. */
export function pendingSteps(steps: Step[], p: Progress): Step[] {
  return steps.filter((s) => p.skipped.has(s.key) && !p.done.has(s.key) && s.unit.n >= p.startUnit);
}

export interface DayPlan {
  /** Pasos de hoy en orden: los ya hechos hoy y los que faltan para llenar el tiempo. */
  items: { step: Step; done: boolean }[];
  doneMinutes: number;
  /** Lo que sigue después de hoy, para "si tienes más tiempo". */
  ahead: Step[];
  /** Hay trabajo pendiente pero bloqueado por algo que dejaste para después. */
  blocked: boolean;
}

/**
 * Arma el día según el tiempo disponible. Siempre incluye al menos el próximo paso mientras quede
 * tiempo; lo ya hecho hoy cuenta contra el tiempo, así la lista no cambia mientras avanzas.
 */
export function planDay(steps: Step[], p: Progress, doneToday: ReadonlySet<string>, budget: number): DayPlan {
  const doneSteps = steps.filter((s) => doneToday.has(s.key));
  const doneMinutes = doneSteps.reduce((n, s) => n + s.activity.minutes, 0);
  const pending = nextSteps(steps, p).filter((s) => !doneToday.has(s.key));

  const chosen: Step[] = [];
  let remaining = budget - doneMinutes;
  for (const s of pending) {
    if (remaining <= 0) break;
    if (chosen.length > 0 && s.activity.minutes > remaining) break;
    chosen.push(s);
    remaining -= s.activity.minutes;
  }

  const chosenKeys = new Set(chosen.map((s) => s.key));
  const rest = pending.filter((s) => !chosenKeys.has(s.key));
  const ahead: Step[] = [];
  let minutes = 0;
  for (const s of rest) {
    if (ahead.length > 0 && minutes + s.activity.minutes > 30) break;
    ahead.push(s);
    minutes += s.activity.minutes;
  }

  const items = [
    ...doneSteps.map((step) => ({ step, done: true })),
    ...chosen.map((step) => ({ step, done: false })),
  ].sort((a, b) => a.step.order - b.step.order);

  const unsettled = steps.some((s) => !isSettled(s, p));
  return { items, doneMinutes, ahead, blocked: unsettled && pending.length === 0 && doneSteps.length === 0 };
}

export function isFinished(steps: Step[], p: Progress): boolean {
  return steps.every((s) => p.done.has(s.key) || s.unit.n < p.startUnit);
}

/** Primera unidad con algo por hacer. */
export function currentUnit(steps: Step[], p: Progress): UnitMeta | null {
  const first = steps.find((s) => !isSettled(s, p)) ?? steps.find((s) => !p.done.has(s.key) && s.unit.n >= p.startUnit);
  return first?.unit ?? null;
}

export interface UnitProgress {
  done: number;
  total: number;
  /** Sesiones completas (todas sus actividades hechas). */
  sessionsDone: number;
}

export function unitProgress(unit: UnitMeta, steps: Step[], p: Progress): UnitProgress {
  const mine = steps.filter((s) => s.unit.id === unit.id);
  const done = mine.filter((s) => p.done.has(s.key) || unit.n < p.startUnit).length;
  const sessions = new Set(mine.map((s) => s.session));
  const sessionsDone = [...sessions].filter((n) =>
    mine.filter((s) => s.session === n).every((s) => p.done.has(s.key) || unit.n < p.startUnit),
  ).length;
  return { done, total: mine.length, sessionsDone };
}

/** El tercer episodio de input de una fase es el nº 3 de su secuencia. Determinista: no usa contadores. */
export function episodeNumber(step: Step, steps: Step[], startUnit = 1): number | null {
  if (step.activity.kind !== "input") return null;
  const group = PHASE_INPUT[step.unit.phase].group;
  // Si empiezas en una unidad avanzada, los episodios cuentan desde donde empiezas.
  const same = steps.filter((s) => s.unit.n >= startUnit && s.activity.kind === "input" && PHASE_INPUT[s.unit.phase].group === group);
  return same.findIndex((s) => s.key === step.key) + 1;
}
