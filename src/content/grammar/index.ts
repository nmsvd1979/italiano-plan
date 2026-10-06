import { unidad01 } from "./unidad01";
import { unidad02 } from "./unidad02";
import { unidad03 } from "./unidad03";
import { unidad04 } from "./unidad04";
import { unidad05 } from "./unidad05";
import { unidad06 } from "./unidad06";
import { unidad07 } from "./unidad07";
import { unidad08 } from "./unidad08";
import { unidad09 } from "./unidad09";
import { unidad10 } from "./unidad10";
import { unidad11 } from "./unidad11";
import { unidad12 } from "./unidad12";
import { unidad13 } from "./unidad13";
import { unidad14 } from "./unidad14";
import { unidad15 } from "./unidad15";
import { unidad20 } from "./unidad20";
import { Exercise, Lesson, exerciseId } from "./types";

/** En orden de currículo. Las unidades sin lección todavía no están escritas. */
export const LESSONS: Lesson[] = [
  unidad01, unidad02, unidad03, unidad04, unidad05, unidad06, unidad07, unidad08, unidad09,
  unidad10, unidad11, unidad12, unidad13, unidad14, unidad15, unidad20,
];

export function getLesson(unit: string): Lesson | undefined {
  return LESSONS.find((l) => l.unit === unit);
}

export interface IndexedExercise {
  id: string;
  unit: string;
  exercise: Exercise;
}

export function exercisesOf(unit: string): IndexedExercise[] {
  return (getLesson(unit)?.exercises ?? []).map((exercise, i) => ({ id: exerciseId(unit, i), unit, exercise }));
}

/** Ejercicios de producción de las unidades dadas, con su id estable. */
export function exercisesForUnits(units: string[]): IndexedExercise[] {
  return units.flatMap(exercisesOf);
}

export function findExercise(id: string): IndexedExercise | undefined {
  const unit = id.slice(0, id.indexOf("-"));
  return exercisesOf(unit).find((e) => e.id === id);
}

export * from "./types";
