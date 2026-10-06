import { semana01 } from "./semana01";
import { semana02 } from "./semana02";
import { semana03 } from "./semana03";
import { semana04 } from "./semana04";
import { semana05 } from "./semana05";
import { semana06 } from "./semana06";
import { semana07 } from "./semana07";
import { semana08 } from "./semana08";
import { semana09 } from "./semana09";
import { semana10 } from "./semana10";
import { semana11 } from "./semana11";
import { semana12 } from "./semana12";
import { Exercise, Lesson, exerciseId } from "./types";

export const LESSONS: Lesson[] = [
  semana01, semana02, semana03, semana04, semana05, semana06,
  semana07, semana08, semana09, semana10, semana11, semana12,
];

export function getLesson(week: number): Lesson | undefined {
  return LESSONS.find((l) => l.week === week);
}

export interface IndexedExercise {
  id: string;
  week: number;
  exercise: Exercise;
}

/** Todos los ejercicios de producción de las semanas pedidas, con su id estable. */
export function exercisesUpTo(week: number): IndexedExercise[] {
  return LESSONS.filter((l) => l.week <= week).flatMap((l) =>
    l.exercises.map((exercise, i) => ({ id: exerciseId(l.week, i), week: l.week, exercise })),
  );
}

export function findExercise(id: string): IndexedExercise | undefined {
  const week = Number(id.slice(1, 3));
  return exercisesUpTo(week).find((e) => e.id === id);
}

export * from "./types";
