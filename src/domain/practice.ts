import { LESSONS, exercisesForUnits, unitNumber } from "../content/grammar";
import { Progress } from "./curriculum";
import { toISODate } from "./dates";
import type { Candidate, ReviewState } from "./review";

/** Unidades con lección ya vista (o anteriores a la unidad desde la que empezaste). */
export function learnedUnits(p: Progress): string[] {
  return LESSONS.filter((l) => p.done.has(`${l.unit}.s2.lesson`) || unitNumber(l.unit) < p.startUnit).map((l) => l.unit);
}

/** Ejercicios de las unidades dadas, con el número de unidad para ordenarlos. */
export function candidatesOf(units: string[]): Candidate[] {
  return exercisesForUnits(units).map(({ id, unit }) => ({ id, unit: unitNumber(unit) }));
}

/** Errados que ya pueden volver, del más antiguo al más nuevo. */
export function dueCandidates(candidates: Candidate[], state: ReviewState, today: Date): Candidate[] {
  const iso = toISODate(today);
  return candidates
    .filter((c) => state[c.id] && state[c.id].due <= iso)
    .sort((a, b) => state[a.id].due.localeCompare(state[b.id].due));
}
