import type { UnitMeta } from "../content/curriculum";
import { Progress, Step } from "./curriculum";
import { addDays, diffInDays } from "./dates";
import { minutesOn } from "./progress";
import type { Completions } from "./storage";

// Ritmo y proyección. Son solo información: nada del plan depende de ellos.

export interface SessionRef {
  unit: UnitMeta;
  session: number;
  keys: string[];
  minutes: number;
}

export function sessionRefs(steps: Step[]): SessionRef[] {
  const map = new Map<string, SessionRef>();
  for (const s of steps) {
    const id = `${s.unit.id}.s${s.session}`;
    const ref = map.get(id) ?? { unit: s.unit, session: s.session, keys: [], minutes: 0 };
    ref.keys.push(s.key);
    ref.minutes += s.activity.minutes;
    map.set(id, ref);
  }
  return [...map.values()];
}

export type PaceStatus = "ontrack" | "behind" | "ahead";

export interface Pace {
  status: PaceStatus;
  /** Cuántas sesiones de diferencia (0 si está al día). */
  sessions: number;
  sessionsDone: number;
  sessionsTotal: number;
  /** null si ya terminaste lo disponible. */
  endDate: Date | null;
  remainingMinutes: number;
}

interface Args {
  steps: Step[];
  progress: Progress;
  completions: Completions;
  start: Date;
  today: Date;
  sessionsPerWeek: number;
}

const WINDOW = 14;
const MIN_SESSIONS_PER_WEEK = 3;

export function paceOf({ steps, progress, completions, start, today, sessionsPerWeek }: Args): Pace {
  const minutesByKey = new Map(steps.map((s) => [s.key, s.activity.minutes]));
  const sessions = sessionRefs(steps).filter((s) => s.unit.n >= progress.startUnit);
  const done = sessions.filter((s) => s.keys.every((k) => progress.done.has(k))).length;

  // Lo esperado cuenta solo los días ya terminados (hoy todavía puedes estudiar). Una sesión de ventaja
  // es normal (estudiar hoy antes que el calendario); recién con dos se considera "adelante".
  const elapsed = Math.max(0, diffInDays(today, start));
  const gap = Math.round((elapsed * sessionsPerWeek) / 7 - done);
  const status: PaceStatus = gap >= 1 ? "behind" : gap <= -2 ? "ahead" : "ontrack";

  const remainingMinutes = steps
    .filter((s) => s.unit.n >= progress.startUnit && !progress.done.has(s.key))
    .reduce((n, s) => n + s.activity.minutes, 0);

  const totalMinutes = sessions.reduce((n, s) => n + s.minutes, 0);
  const avgSession = sessions.length > 0 ? totalMinutes / sessions.length : 0;

  const days = Math.min(WINDOW, elapsed + 1);
  let studied = 0;
  for (let i = 0; i < days; i++) {
    const d = addDays(today, -i);
    studied += minutesOn(completions, d, minutesByKey, 0);
  }
  const observed = studied / days;
  const floor = (MIN_SESSIONS_PER_WEEK * avgSession) / 7;
  const planned = (sessionsPerWeek * avgSession) / 7;
  const rate = studied > 0 ? Math.max(observed, floor) : planned;

  const endDate = remainingMinutes > 0 && rate > 0 ? addDays(today, Math.ceil(remainingMinutes / rate)) : null;

  return {
    status,
    sessions: status === "ontrack" ? 0 : Math.abs(gap),
    sessionsDone: done,
    sessionsTotal: sessions.length,
    endDate,
    remainingMinutes,
  };
}
