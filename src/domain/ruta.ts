import { COURSE } from "../content/course";
import { weekComplete, type CourseProgress } from "./cycle";
import { AREAS, PASS_LEVEL, WEAK_AREA, type Area } from "./evaluation";
import type { getLevelTests } from "./storage";

// Qué sigue al terminar el núcleo A2 (docs/v2/plan-b1/05): la prueba de nivel A2 hace de puerta y el resultado guardado decide la ruta.

export type LevelTests = ReturnType<typeof getLevelTests>;

export type Route =
  | { stage: "sin-prueba" }
  | { stage: "aprobada"; ratio: number }
  | { stage: "repasar"; ratio: number; weak: Area[] };

/** Ruta según el último intento de la prueba de nivel: ≥ 80 % y ningún área bajo 70 % pasa al puente; si no, se refuerza lo flojo. La producción (autoevaluada) no cuenta. */
export function routeAfterCore(tests: LevelTests): Route {
  const last = [...tests].reverse().find((t) => t.total > 0);
  if (!last) return { stage: "sin-prueba" };
  const ratio = last.correct / last.total;
  const weak = AREAS.filter((a) => a !== "produccion" && (last.byArea[a]?.total ?? 0) > 0 && last.byArea[a].correct / last.byArea[a].total < WEAK_AREA);
  return ratio >= PASS_LEVEL && weak.length === 0 ? { stage: "aprobada", ratio } : { stage: "repasar", ratio, weak };
}

/** ¿Están terminadas todas las semanas del núcleo (u25–u28 incluidas)? El puente a B1 es aparte y opcional. */
export const coreFinished = (p: CourseProgress): boolean => COURSE.filter((s) => s.kind === "core").every((s) => weekComplete(s, p));
