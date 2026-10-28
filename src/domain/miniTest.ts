import { exercisesOf, type IndexedExercise } from "../content/grammar";
import type { CoursePart } from "../content/course";
import { forPart } from "./parts";
import { PASS_RATIO } from "./cycle";
import { rng, shuffle } from "./review";

// Mini-prueba de la semana (docs/v2/04 D3): ejercicios de la propia unidad (y de su parte, si es A/B),
// sin pista. Cada intento usa una versión distinta mientras queden ejercicios sin usar.

export const MINI_SIZE = 8;

function pool(unit: string, part: CoursePart | null): IndexedExercise[] {
  const all = exercisesOf(unit);
  return forPart(unit, part, "exercises", all).map(({ item }) => item);
}

/** Ejercicios del intento `attempt` (0 = el primero): no repite los de intentos anteriores hasta agotar el banco. */
export function miniItems(stepId: string, unit: string, part: CoursePart | null, attempt: number): IndexedExercise[] {
  let remaining = pool(unit, part);
  let chosen: IndexedExercise[] = [];
  for (let a = 0; a <= attempt; a++) {
    if (remaining.length < MINI_SIZE) remaining = pool(unit, part);
    chosen = shuffle(remaining, rng(`${stepId}:mini:${a}`)).slice(0, MINI_SIZE);
    const used = new Set(chosen.map((e) => e.id));
    remaining = remaining.filter((e) => !used.has(e.id));
  }
  return chosen;
}

export const miniPassed = (correct: number, total: number): boolean => total > 0 && correct / total >= PASS_RATIO;
