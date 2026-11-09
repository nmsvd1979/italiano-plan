import { COURSE } from "../content/course";

// «Releer con recuperación» (docs/v2/plan-b1/06, E4): el bloque del día 3 retoma el texto de la semana anterior del curso.
// Primero se responden de memoria las preguntas del texto y recién después se vuelve a ver, con su audio. Releer sin más
// rinde poco frente a evaluarse (docs/v2/plan-b1/11); por eso las preguntas van antes del texto.

/** Paso cuyo texto se retoma: el anterior en el orden del curso. La primera semana no tiene. */
export function rereadSource(stepId: string): string | undefined {
  const i = COURSE.findIndex((s) => s.id === stepId);
  return i > 0 ? COURSE[i - 1].id : undefined;
}
