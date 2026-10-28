import { COURSE, type CourseStep } from "../content/course";
import { getUnit, sessionsOf, type UnitMeta } from "../content/curriculum";
import type { IconKey } from "../content/plan";
import type { MiniTests } from "./storage";

// Ciclo de 7 días por semana del curso (docs/v2/04 D1). Cada semana es un CourseStep (una unidad, o su parte A o B).
// El plan avanza por progreso, no por calendario. Las marcas nuevas usan claves `${paso}.d${día}.${bloque}`
// (ej. `u04.d2.lesson`, `u02#A.d2.lesson`); las claves de la app anterior (`u04.s2.lesson`) no se tocan y se leen
// como equivalentes (ver `legacy`).

export type BlockKind =
  | "srs" | "dialogue" | "vocab" | "pron" | "lesson" | "practice" | "dictation" | "shadowing" | "writing"
  | "cando" | "review" | "mini" | "input" | "failed" | "soon";

export interface Block {
  /** Único dentro del día. */
  id: string;
  kind: BlockKind;
  name: string;
  minutes: number;
  /** Bloque esencial: el día se completa al terminar los core. */
  core: boolean;
  icon: IconKey;
  needsInternet?: boolean;
  /** Contenido de la unidad que debe existir; si falta, el bloque queda «en preparación». */
  needs?: keyof UnitMeta["has"];
  /** Actividades de la app anterior (ids de sessionsOf) que dejan este bloque hecho. */
  legacy?: string[];
  /** Aún no hay herramienta ni contenido: se muestra «en preparación» y no bloquea el día. */
  soon?: boolean;
  /** Cuántos ejercicios usa la práctica de este bloque. */
  size?: number;
  /** En la mini-prueba: número de intento (0 = la primera). */
  attempt?: number;
}

export interface CycleDay {
  stepId: string;
  /** 1 a 7; los días de repaso dirigido siguen desde el 8. */
  day: number;
  name: string;
  blocks: Block[];
}

const srs: Block = { id: "srs", kind: "srs", name: "Repaso espaciado", minutes: 5, core: true, icon: "cards" };
const words = (id: string): Block => ({
  id, kind: "vocab", name: "Palabras de la unidad", minutes: 6, core: false, icon: "list", needs: "vocab", legacy: id === "words" ? ["vocab"] : undefined,
});
const soon = (id: string, name: string, minutes: number, core = false, icon: IconKey = "book"): Block => ({
  id, kind: "soon", name, minutes, core, icon, soon: true,
});

const DAY_TABLE: { name: string; blocks: Block[] }[] = [
  {
    name: "Entrar",
    blocks: [
      srs,
      { id: "dialogue", kind: "dialogue", name: "Diálogo de entrada", minutes: 10, core: true, icon: "chat", needs: "dialogue", legacy: ["dialogue"] },
      words("words"),
      { id: "sound", kind: "pron", name: "Percepción de sonido", minutes: 4, core: false, icon: "ear", legacy: ["pron"] },
      { id: "repeat", kind: "dialogue", name: "Repetir las líneas del diálogo", minutes: 5, core: false, icon: "mic", needs: "dialogue" },
    ],
  },
  {
    name: "Regla",
    blocks: [
      srs,
      { id: "relisten", kind: "dialogue", name: "Volver a oír el diálogo con la regla", minutes: 6, core: false, icon: "headphones", needs: "dialogue" },
      { id: "lesson", kind: "lesson", name: "Lección de gramática", minutes: 10, core: true, icon: "book", legacy: ["lesson"] },
      { id: "guided", kind: "practice", name: "Práctica guiada", minutes: 4, core: false, icon: "book", size: 4 },
      soon("own", "Dos frases propias", 5, false, "pen"),
    ],
  },
  {
    name: "Practicar",
    blocks: [
      srs,
      { id: "varied", kind: "practice", name: "Práctica variada", minutes: 7, core: true, icon: "book", size: 7, legacy: ["practice"] },
      words("words3"),
      { id: "dictation", kind: "dictation", name: "Dictado", minutes: 6, core: false, icon: "ear", needs: "dictation", legacy: ["dictation"] },
      soon("shorttext", "Texto corto nuevo", 6),
    ],
  },
  {
    name: "Hablar",
    blocks: [
      srs,
      { id: "roleplay", kind: "dialogue", name: "Diálogo con rol", minutes: 11, core: true, icon: "chat", needs: "dialogue" },
      { id: "compare", kind: "pron", name: "Repetir y comparar pronunciación", minutes: 4, core: false, icon: "ear" },
      words("words4"),
      soon("speed", "Números y frases a velocidad", 4, false, "sound"),
    ],
  },
  {
    name: "Leer y escuchar",
    blocks: [
      srs,
      soon("text", "Texto graduado", 9, true),
      soon("questions", "Preguntas del texto", 4),
      words("words5"),
      { id: "shadowing", kind: "shadowing", name: "Shadowing", minutes: 6, core: false, icon: "mic", needsInternet: true, legacy: ["shadow"] },
    ],
  },
  {
    name: "Producir",
    blocks: [
      srs,
      { id: "writing", kind: "writing", name: "Escritura guiada", minutes: 13, core: true, icon: "pen", needs: "writing", legacy: ["writing"] },
      soon("retell", "Volver a contar sin mirar", 6, false, "chat"),
      { id: "cando", kind: "cando", name: "«Puedo…»", minutes: 5, core: false, icon: "target" },
    ],
  },
  {
    name: "Consolidar",
    blocks: [
      { id: "review", kind: "review", name: "Repaso mixto", minutes: 10, core: true, icon: "repeat", legacy: ["review"] },
      { id: "mini", kind: "mini", name: "Mini-prueba de la semana", minutes: 8, core: true, icon: "target", attempt: 0 },
      { id: "input", kind: "input", name: "Input libre", minutes: 12, core: false, icon: "headphones", needsInternet: true, legacy: ["input"] },
    ],
  },
];

/** Los 7 días de una semana del curso. */
export function daysOf(step: CourseStep): CycleDay[] {
  return DAY_TABLE.map((d, i) => ({ stepId: step.id, day: i + 1, name: d.name, blocks: d.blocks }));
}

/** Tras cada intento fallido de la mini-prueba: 2 días de repaso dirigido y una versión distinta de la prueba. */
export function remedialDays(step: CourseStep, failures: number): CycleDay[] {
  const days: CycleDay[] = [];
  for (let k = 1; k <= failures; k++) {
    const failed: Block = { id: "failed", kind: "failed", name: "Repasar lo que fallaste", minutes: 10, core: true, icon: "repeat" };
    days.push(
      { stepId: step.id, day: 7 + 2 * k - 1, name: "Repaso dirigido", blocks: [srs, failed] },
      {
        stepId: step.id, day: 7 + 2 * k, name: "Otra versión de la prueba",
        blocks: [srs, { ...failed, id: "failed2", minutes: 5 }, { id: "mini", kind: "mini", name: "Mini-prueba (otra versión)", minutes: 8, core: true, icon: "target", attempt: k }],
      },
    );
  }
  return days;
}

export const PASS_RATIO = 0.75;

export const blockKey = (stepId: string, day: number, blockId: string): string => `${stepId}.d${day}.${blockId}`;

export interface CourseProgress {
  /** Claves marcadas en cualquier fecha (nuevas y de la app anterior). */
  done: ReadonlySet<string>;
  /** Unidades anteriores a esta se dan por sabidas. */
  startUnit: number;
  mini: MiniTests;
}

/** El bloque no tiene herramienta o contenido todavía. */
export function isSoon(block: Block, unit: UnitMeta): boolean {
  return !!block.soon || (!!block.needs && !unit.has[block.needs]);
}

/** Qué fracción de las actividades de la app anterior (sessionsOf) está marcada. */
export function legacyCoverage(unit: UnitMeta, done: ReadonlySet<string>): number {
  const keys = sessionsOf(unit).flatMap((s) => s.activities.map((a) => `${unit.id}.s${s.index}.${a.id}`));
  return keys.length === 0 ? 0 : keys.filter((k) => done.has(k)).length / keys.length;
}

/** Umbral de 14 §3: con ≥ 85 % de la unidad marcada en la app anterior, la unidad vale como completa. */
export const LEGACY_COMPLETE = 0.85;

/** Unidad ya sabida: anterior a la unidad inicial, o completa en la app anterior (vale como A y B hechas). */
export function unitSettled(unit: UnitMeta, p: CourseProgress): boolean {
  if (unit.n <= 24 && unit.n < p.startUnit) return true;
  return legacyCoverage(unit, p.done) >= LEGACY_COMPLETE;
}

function legacyDone(unit: UnitMeta, activity: string, done: ReadonlySet<string>): boolean {
  return sessionsOf(unit).some((s) => s.activities.some((a) => a.id === activity && done.has(`${unit.id}.s${s.index}.${a.id}`)));
}

export function blockDone(step: CourseStep, day: number, block: Block, p: CourseProgress): boolean {
  const unit = getUnit(step.unit);
  if (!unit) return false;
  if (unitSettled(unit, p)) return true;
  if (block.kind === "mini") return (p.mini[step.id]?.length ?? 0) > (block.attempt ?? 0);
  if (p.done.has(blockKey(step.id, day, block.id))) return true;
  return (block.legacy ?? []).some((a) => legacyDone(unit, a, p.done));
}

export const failuresOf = (step: CourseStep, mini: MiniTests): number => (mini[step.id] ?? []).filter((a) => !a.passed).length;

export const passedMini = (step: CourseStep, mini: MiniTests): boolean => (mini[step.id] ?? []).some((a) => a.passed);

/** Días de la semana tal como están hoy: los 7, más el repaso dirigido mientras la prueba no se apruebe. */
export function daysFor(step: CourseStep, p: CourseProgress): CycleDay[] {
  const base = daysOf(step);
  return passedMini(step, p.mini) ? base : [...base, ...remedialDays(step, failuresOf(step, p.mini))];
}

/** Un día se completa al terminar sus bloques core que existen; los «en preparación» no bloquean. */
export function dayComplete(step: CourseStep, day: CycleDay, p: CourseProgress): boolean {
  const unit = getUnit(step.unit);
  if (!unit) return false;
  return day.blocks.filter((b) => b.core && !isSoon(b, unit)).every((b) => blockDone(step, day.day, b, p));
}

/** Semana lista: sus 7 días completos y la mini-prueba aprobada (D3). */
export function weekComplete(step: CourseStep, p: CourseProgress): boolean {
  const unit = getUnit(step.unit);
  if (!unit) return false;
  if (unitSettled(unit, p)) return true;
  return passedMini(step, p.mini) && daysOf(step).every((d) => dayComplete(step, d, p));
}

/** Bloques que cuentan para el avance de una semana: los 7 días base, sin los «en preparación». */
export function weekProgress(step: CourseStep, p: CourseProgress): { done: number; total: number } {
  const unit = getUnit(step.unit);
  if (!unit) return { done: 0, total: 0 };
  const blocks = daysOf(step).flatMap((d) => d.blocks.filter((b) => !isSoon(b, unit)).map((b) => ({ d, b })));
  return { total: blocks.length, done: blocks.filter(({ d, b }) => blockDone(step, d.day, b, p)).length };
}

export function unitCycleProgress(unitId: string, p: CourseProgress): { done: number; total: number } {
  return COURSE.filter((s) => s.unit === unitId).reduce(
    (acc, s) => {
      const w = weekProgress(s, p);
      return { done: acc.done + w.done, total: acc.total + w.total };
    },
    { done: 0, total: 0 },
  );
}

/** Semanas del curso con contenido, en orden. */
export const readySteps = (): CourseStep[] => COURSE.filter((s) => getUnit(s.unit)?.ready);

export interface Slot {
  step: CourseStep;
  day: CycleDay;
}

const slotHasMarks = (slot: Slot, marked: ReadonlySet<string>): boolean =>
  slot.day.blocks.some((b) => marked.has(blockKey(slot.step.id, slot.day.day, b.id)));

/**
 * Lo que muestra Hoy: desde el primer día pendiente (o con marcas de hoy) hasta el último con marcas de hoy,
 * más `extra` días siguientes cuando se pide «Hacer más hoy». No depende del calendario: si faltas, mañana sigue lo mismo.
 */
export function todaySlots(p: CourseProgress, markedToday: ReadonlySet<string>, extra = 0): { shown: Slot[]; finished: boolean } {
  const slots: Slot[] = [];
  let openWeeks = 0;
  for (const step of readySteps()) {
    const complete = weekComplete(step, p);
    const touched = [...markedToday].some((k) => k.startsWith(`${step.id}.d`));
    if (complete && !touched) continue;
    if (!complete && ++openWeeks > 2) break;
    for (const day of daysFor(step, p)) slots.push({ step, day });
  }
  const start = slots.findIndex((s) => !dayComplete(s.step, s.day, p) || slotHasMarks(s, markedToday));
  if (start < 0) return { shown: [], finished: true };
  let end = start;
  slots.forEach((s, i) => { if (i >= start && slotHasMarks(s, markedToday)) end = i; });
  // Después del último día con marcas, solo se agregan días si todo lo mostrado está completo.
  const allDone = slots.slice(start, end + 1).every((s) => dayComplete(s.step, s.day, p));
  let more = 0;
  for (let i = end + 1; i < slots.length && more < extra && allDone; i++) {
    if (dayComplete(slots[i].step, slots[i].day, p) && !slotHasMarks(slots[i], markedToday)) continue;
    end = i;
    more++;
  }
  const shown = slots.slice(start, end + 1);
  const finished = shown.length === 0;
  return { shown, finished };
}

/** Primer día pendiente del curso (para saber en qué semana vas), o null si terminaste lo disponible. */
export function currentSlot(p: CourseProgress): Slot | null {
  for (const step of readySteps()) {
    if (weekComplete(step, p)) continue;
    const day = daysFor(step, p).find((d) => !dayComplete(step, d, p));
    if (day) return { step, day };
  }
  return null;
}

/** Bloques de un día según el modo: el corto solo muestra los core que existen. */
export function visibleBlocks(day: CycleDay, unit: UnitMeta, short: boolean): Block[] {
  return short ? day.blocks.filter((b) => b.core && !isSoon(b, unit)) : day.blocks;
}

/** Minutos por clave para el mapa de calor y el ritmo: todos los bloques de todas las semanas, con hasta 3 repasos dirigidos. */
export function blockMinutes(): Map<string, number> {
  const map = new Map<string, number>();
  for (const step of COURSE) {
    for (const d of [...daysOf(step), ...remedialDays(step, 3)]) {
      for (const b of d.blocks) map.set(blockKey(step.id, d.day, b.id), b.minutes);
    }
  }
  return map;
}

/** Las palabras de la unidad ya se mostraron (el primer bloque de palabras de alguna semana, o la actividad antigua). */
export function wordsSeen(unitId: string, done: ReadonlySet<string>): boolean {
  if (done.has(`${unitId}.s2.vocab`)) return true;
  const places: [number, string][] = [[1, "words"], [3, "words3"], [4, "words4"], [5, "words5"]];
  return COURSE.some((s) => s.unit === unitId && places.some(([day, id]) => done.has(blockKey(s.id, day, id))));
}
