// Orden del curso (docs/v2/13 §2). Los ids de unidad no cambian: el progreso guardado los usa.
// UNITS (curriculum.ts) dice QUÉ es cada unidad; COURSE dice EN QUÉ ORDEN se estudia y qué semana es cada paso.

export type CoursePart = "A" | "B";
/** core: el núcleo A2 (32 semanas). bridge: el Puente a B1, opcional. */
export type CourseKind = "core" | "bridge";

export interface CoursePhase {
  /** 1 a 6: es el `phase` de UnitMeta y de PHASES. */
  id: number;
  title: string;
}

/** F1–F6 según docs/v2/13 §2. PHASES (curriculum.ts) se reajusta a estos títulos con el PR del ciclo de 7 días. */
export const COURSE_PHASES: CoursePhase[] = [
  { id: 1, title: "Primer contacto" },
  { id: 2, title: "Moverte y describir" },
  { id: 3, title: "Contar el pasado" },
  { id: 4, title: "Personas y planes" },
  { id: 5, title: "Vivir allá" },
  { id: 6, title: "Cierre A2" },
];

export interface CourseStep {
  /** Clave de actividad del paso: el id de la unidad, o `u02#A` / `u02#B` si la unidad se parte en dos semanas. */
  id: string;
  unit: string;
  part?: CoursePart;
  phase: number;
  kind: CourseKind;
  /** Semana del núcleo (1 a 32). Los pasos del puente no tienen semana fija. */
  week?: number;
}

const step = (unit: string, phase: number, kind: CourseKind = "core", part?: CoursePart): Omit<CourseStep, "week"> => ({
  id: part ? `${unit}#${part}` : unit,
  unit,
  ...(part ? { part } : {}),
  phase,
  kind,
});

const ORDER: Omit<CourseStep, "week">[] = [
  // F1 Primer contacto
  step("u25", 1), step("u01", 1), step("u02", 1, "core", "A"), step("u02", 1, "core", "B"),
  step("u03", 1, "core", "A"), step("u03", 1, "core", "B"), step("u04", 1),
  // F2 Moverte y describir
  step("u05", 2, "core", "A"), step("u05", 2, "core", "B"), step("u06", 2, "core", "A"), step("u06", 2, "core", "B"),
  step("u26", 2), step("u07", 2, "core", "A"), step("u07", 2, "core", "B"), step("u08", 2), step("u27", 2),
  // F3 Contar el pasado
  step("u09", 3), step("u10", 3), step("u11", 3), step("u12", 3), step("u28", 3),
  // F4 Personas y planes
  step("u13", 4), step("u14", 4, "core", "A"), step("u14", 4, "core", "B"),
  step("u15", 4, "core", "A"), step("u15", 4, "core", "B"), step("u16", 4),
  // F5 Vivir allá
  step("u17", 5), step("u18", 5), step("u19", 5), step("u20", 5),
  // F6 Cierre A2
  step("u24", 6),
  // Puente a B1 (opcional)
  step("u21", 6, "bridge"), step("u22", 6, "bridge"), step("u23", 6, "bridge"),
];

let week = 0;
export const COURSE: CourseStep[] = ORDER.map((s) => (s.kind === "core" ? { ...s, week: ++week } : s));

export const CORE_WEEKS = week;

export const stepsOfUnit = (unit: string): CourseStep[] => COURSE.filter((s) => s.unit === unit);

export function getCourseStep(id: string): CourseStep | undefined {
  return COURSE.find((s) => s.id === id);
}
