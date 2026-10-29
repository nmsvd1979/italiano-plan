import { COURSE, stepsOfUnit, type CoursePart, type CourseStep } from "../content/course";
import { getUnit, sessionsOf, UNITS, type UnitMeta } from "../content/curriculum";
import { exercisesOf, type Exercise, type IndexedExercise } from "../content/grammar";
import { PASS_RATIO, currentSlot, daysOf, legacyCoverage, unitCycleProgress, unitSettled, weekComplete } from "./cycle";
import type { ContinuityOverlay, CourseProgress, Slot } from "./cycle";
import { forPart } from "./parts";
import { rng, shuffle } from "./review";
import { KEYS_V2, type KV, type PhaseTests } from "./storage";
import { LAST_BACKUP_KEY, BACKUP_STALE_DAYS } from "./backup";

// Continuidad con el progreso (docs/v2/14). Este módulo solo LEE las claves antiguas (`italianPlan.*`):
// lo único que escribe es `italianPlan.v2.progress` (y la siembra del repaso, en continuitySeed.ts).
// Sin esa clave, todo vale como antes: la capa de continuidad no cambia nada hasta que la persona decide.

/* ───────────── estado guardado (italianPlan.v2.progress) ───────────── */

/** Resultado de comparar lo que recuerdas con lo que marcaste (docs/v2/14 §4). */
export type Verdict = "dominada" | "repasar" | "rehacer";

export interface PartScore {
  correct: number;
  total: number;
  verdict: Verdict;
}

export interface Diagnostic {
  correct: number;
  total: number;
  /** Día (AAAA-MM-DD) en que se hizo. */
  date: string;
  verdict: Verdict;
  /** Ids de los ejercicios que fallaste (para el repaso dirigido). */
  failed: string[];
  /** Solo en unidades partidas: cada semana se decide por separado. */
  parts?: Partial<Record<CoursePart, PartScore>>;
}

export interface UnitRecord {
  diagnostic?: Diagnostic;
  /** «Saltar» el diagnóstico deja la unidad en `repasar`. */
  skipped?: boolean;
  /** Bloques de la puesta al día que ya hiciste. */
  catchup: { done: string[] };
  /** Día en que terminaste el repaso dirigido. */
  directedDone?: string;
}

export interface ContinuityState {
  version: 2;
  /** Cuándo confirmaste tu punto de partida por primera vez; null mientras no lo hagas. */
  migratedAt: string | null;
  /** «Hacer el diagnóstico» o «Empezar donde estoy». null: todavía no decides y el plan sigue como antes. */
  decision: "diagnostico" | "aqui" | null;
  /** «Volver al plan anterior»: el plan ignora todo lo de esta capa. No borra nada. */
  usePrevious: boolean;
  units: Record<string, UnitRecord>;
  /** Huecos por cerrar que dejaste para después (ids de semana). */
  postponedGaps: string[];
  /** Cuándo se sembró el repaso espaciado y con qué unidades. */
  seeded: { date: string; units: string[]; cards: number } | null;
}

export const emptyContinuity = (): ContinuityState => ({
  version: 2, migratedAt: null, decision: null, usePrevious: false, units: {}, postponedGaps: [], seeded: null,
});

const emptyRecord = (): UnitRecord => ({ catchup: { done: [] } });

/** Lee la clave con valores por defecto. Nunca escribe: una clave dañada se ignora, no se pisa. */
export function loadContinuity(store: KV): ContinuityState {
  try {
    const raw = store.getItem(KEYS_V2.progress);
    if (!raw) return emptyContinuity();
    const parsed = JSON.parse(raw) as Partial<ContinuityState>;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return emptyContinuity();
    const base = emptyContinuity();
    const units: Record<string, UnitRecord> = {};
    for (const [id, rec] of Object.entries(parsed.units ?? {})) {
      units[id] = { ...emptyRecord(), ...rec, catchup: { done: Array.isArray(rec?.catchup?.done) ? rec.catchup.done : [] } };
    }
    return {
      ...base,
      migratedAt: typeof parsed.migratedAt === "string" ? parsed.migratedAt : null,
      decision: parsed.decision === "diagnostico" || parsed.decision === "aqui" ? parsed.decision : null,
      usePrevious: parsed.usePrevious === true,
      units,
      postponedGaps: Array.isArray(parsed.postponedGaps) ? parsed.postponedGaps : [],
      seeded: parsed.seeded && typeof parsed.seeded === "object" ? parsed.seeded : null,
    };
  } catch {
    return emptyContinuity();
  }
}

export function saveContinuity(store: KV, state: ContinuityState): void {
  store.setItem(KEYS_V2.progress, JSON.stringify(state));
}

const recordOf = (state: ContinuityState, unit: string): UnitRecord => state.units[unit] ?? emptyRecord();

const withRecord = (state: ContinuityState, unit: string, patch: Partial<UnitRecord>): ContinuityState => ({
  ...state, units: { ...state.units, [unit]: { ...recordOf(state, unit), ...patch } },
});

const confirmed = (state: ContinuityState, decision: "diagnostico" | "aqui", now: Date): ContinuityState => ({
  ...state, decision, migratedAt: state.migratedAt ?? now.toISOString(),
});

/** «Empezar donde estoy»: se asume lo que marcaste. */
export const startHere = (state: ContinuityState, now: Date): ContinuityState => confirmed(state, "aqui", now);

/** «Hacer el diagnóstico»: queda elegido aunque lo termines otro día. */
export const startDiagnostic = (state: ContinuityState, now: Date): ContinuityState => confirmed(state, "diagnostico", now);

export const skipDiagnostic = (state: ContinuityState, unit: string, now: Date): ContinuityState =>
  withRecord(confirmed(state, "diagnostico", now), unit, { skipped: true });

export const setUsePrevious = (state: ContinuityState, value: boolean): ContinuityState => ({ ...state, usePrevious: value });

export function markCatchup(state: ContinuityState, unit: string, blockId: string): ContinuityState {
  const done = recordOf(state, unit).catchup.done;
  return done.includes(blockId) ? state : withRecord(state, unit, { catchup: { done: [...done, blockId] } });
}

export const markDirected = (state: ContinuityState, unit: string, dateISO: string): ContinuityState =>
  withRecord(state, unit, { directedDone: dateISO });

export function setPostponed(state: ContinuityState, stepId: string, postponed: boolean): ContinuityState {
  const rest = state.postponedGaps.filter((id) => id !== stepId);
  return { ...state, postponedGaps: postponed ? [...rest, stepId] : rest };
}

/* ───────────── estado de cada unidad desde las marcas (14 §3) ───────────── */

export type MarkState = "completa" | "parcial" | "tocada" | "nueva" | "omitida";

/** Desde este porcentaje de actividades hechas, la unidad cuenta como parcial (por debajo, solo «tocada»). */
export const PARCIAL_FROM = 0.3;

export interface UnitMarks {
  state: MarkState;
  /** Qué fracción (0 a 1) de la unidad está hecha. */
  coverage: number;
  /** Actividades de la app anterior marcadas y total (`sessionsOf`). */
  done: number;
  total: number;
  /** Cuenta como completa porque aprobaste la prueba de fase de su fase. */
  byPhaseTest: boolean;
}

/** La prueba de fase se aprueba con el mismo umbral que la mini-prueba. Solo vale para las unidades 1 a 24. */
export function phaseTestPassed(unit: UnitMeta, tests: PhaseTests): boolean {
  return unit.n <= 24 && (tests[String(unit.phase)] ?? []).some((t) => t.total > 0 && t.correct / t.total >= PASS_RATIO);
}

/**
 * Estado por marcas. `raw` debe ser el progreso SIN la capa de continuidad: así el estado depende solo de lo que
 * marcaste y no de lo que decidas después. Reutiliza `unitSettled` y `legacyCoverage` del ciclo de 7 días:
 * ≥ 85 % de la app anterior, o unidades anteriores a la inicial, valen como completas.
 */
export function marksOf(unit: UnitMeta, raw: CourseProgress, tests: PhaseTests): UnitMarks {
  const keys = legacyKeys(unit);
  const total = keys.length;
  const done = keys.filter((k) => raw.done.has(k)).length;
  const cycle = unitCycleProgress(unit.id, raw);
  const cycleShare = cycle.total > 0 ? cycle.done / cycle.total : 0;
  const coverage = Math.max(legacyCoverage(unit, raw.done), cycleShare);
  const base = { coverage, done, total, byPhaseTest: false };
  if (unit.n <= 24 && unit.n < raw.startUnit) return { ...base, state: "omitida" };
  if (unitSettled(unit, raw)) return { ...base, state: "completa" };
  if (phaseTestPassed(unit, tests)) return { ...base, state: "completa", byPhaseTest: true };
  const steps = stepsOfUnit(unit.id).filter((s) => s.kind === "core");
  if (unit.ready && steps.length > 0 && steps.every((s) => weekComplete(s, raw))) return { ...base, state: "completa" };
  return { ...base, state: coverage >= PARCIAL_FROM ? "parcial" : coverage > 0 ? "tocada" : "nueva" };
}

/** Claves de actividad de la app anterior que cubre la unidad (las mismas que cuenta `legacyCoverage`). */
function legacyKeys(unit: UnitMeta): string[] {
  return sessionsOf(unit).flatMap((s) => s.activities.map((a) => `${unit.id}.s${s.index}.${a.id}`));
}

/* ───────────── diagnóstico opcional (14 §4) ───────────── */

export const DIAGNOSTIC_SIZE = 8;
export const DOMINADA_FROM = 0.75;
export const REPASAR_FROM = 0.5;

/** dominada ≥ 75 %, repasar 50–74 %, rehacer < 50 %. Umbrales provisionales (criterio propio, no medido). */
export function verdictOf(correct: number, total: number): Verdict {
  if (total <= 0) return "repasar";
  const ratio = correct / total;
  return ratio >= DOMINADA_FROM ? "dominada" : ratio >= REPASAR_FROM ? "repasar" : "rehacer";
}

export interface DiagnosticItem {
  id: string;
  /** Semana (A o B) a la que pertenece, solo en unidades partidas. */
  part?: CoursePart;
  exercise: Exercise;
}

function pickMix(pool: IndexedExercise[], n: number, rand: () => number): IndexedExercise[] {
  const choices = shuffle(pool.filter((e) => e.exercise.type === "choice"), rand);
  const fills = shuffle(pool.filter((e) => e.exercise.type === "fill"), rand);
  // Unos 3 de reconocimiento (elegir) y 5 de producción (escribir) de cada 8.
  const wantChoice = Math.min(choices.length, Math.round((n * 3) / 8));
  const chosen = [...choices.slice(0, wantChoice), ...fills.slice(0, n - wantChoice)];
  if (chosen.length < n) chosen.push(...[...choices.slice(wantChoice), ...fills.slice(n - wantChoice)].slice(0, n - chosen.length));
  return chosen;
}

/**
 * Ejercicios del diagnóstico de una unidad: salen del banco de la lección (`src/content/grammar`), sin pista ni
 * explicación, y no repiten los que ya fallaste y tienes en repaso (`failedBefore`). Misma unidad = mismos ítems.
 * En unidades partidas se toman 4 de cada semana. No hay ítems de oído ni de dictado porque el banco de ejercicios no los tiene.
 */
export function diagnosticItems(unit: string, failedBefore: ReadonlySet<string> = new Set()): DiagnosticItem[] {
  const all = exercisesOf(unit);
  const usable = (pool: IndexedExercise[], n: number) => {
    const clean = pool.filter((e) => !failedBefore.has(e.id));
    return clean.length >= n ? clean : pool;
  };
  const toItem = (e: IndexedExercise, part?: CoursePart): DiagnosticItem => ({ id: e.id, exercise: e.exercise, ...(part ? { part } : {}) });
  if (!getUnit(unit)?.parts) {
    const rand = rng(`${unit}:diagnostico`);
    return shuffle(pickMix(usable(all, DIAGNOSTIC_SIZE), DIAGNOSTIC_SIZE, rand), rand).map((e) => toItem(e));
  }
  const half = DIAGNOSTIC_SIZE / 2;
  const taken = new Set<string>();
  const items: DiagnosticItem[] = [];
  for (const part of ["A", "B"] as const) {
    const pool = forPart(unit, part, "exercises", all).map(({ item }) => item).filter((e) => !taken.has(e.id));
    for (const e of pickMix(usable(pool, half), half, rng(`${unit}:diagnostico:${part}`))) {
      taken.add(e.id);
      items.push(toItem(e, part));
    }
  }
  return shuffle(items, rng(`${unit}:diagnostico`));
}

export interface DiagnosticOutcome {
  id: string;
  part?: CoursePart;
  correct: boolean;
}

/** Puntaje y veredicto de un diagnóstico; en unidades partidas, también el de cada semana. */
export function scoreDiagnostic(outcomes: DiagnosticOutcome[], dateISO: string): Diagnostic {
  const total = outcomes.length;
  const correct = outcomes.filter((o) => o.correct).length;
  const parts: Partial<Record<CoursePart, PartScore>> = {};
  for (const part of ["A", "B"] as const) {
    const mine = outcomes.filter((o) => o.part === part);
    if (mine.length === 0) continue;
    const c = mine.filter((o) => o.correct).length;
    parts[part] = { correct: c, total: mine.length, verdict: verdictOf(c, mine.length) };
  }
  return {
    correct, total, date: dateISO, verdict: verdictOf(correct, total),
    failed: outcomes.filter((o) => !o.correct).map((o) => o.id),
    ...(Object.keys(parts).length > 0 ? { parts } : {}),
  };
}

export const recordDiagnostic = (state: ContinuityState, unit: string, diagnostic: Diagnostic, now: Date): ContinuityState =>
  withRecord(confirmed(state, "diagnostico", now), unit, { diagnostic, skipped: false });

/* ───────────── vista de cada unidad ───────────── */

export interface UnitView {
  unit: UnitMeta;
  marks: UnitMarks;
  /** Qué se decidió para la unidad; null si todavía no hay decisión (el plan sigue como antes). */
  verdict: Verdict | null;
  source: "diagnostico" | "saltado" | "marcas" | null;
  /** Veredicto de cada semana (unidades partidas con diagnóstico). */
  parts?: Partial<Record<CoursePart, Verdict>>;
  /** Es completa o parcial: el diagnóstico tiene sentido y todavía no lo hiciste ni lo saltaste. */
  diagnosable: boolean;
  pendingDiagnostic: boolean;
}

export function viewOf(unit: UnitMeta, raw: CourseProgress, tests: PhaseTests, state: ContinuityState): UnitView {
  const marks = marksOf(unit, raw, tests);
  const diagnosable = unit.ready && unit.n <= 24 && (marks.state === "completa" || marks.state === "parcial");
  const rec = state.units[unit.id];
  let verdict: Verdict | null = null;
  let source: UnitView["source"] = null;
  let parts: UnitView["parts"];
  if (diagnosable) {
    if (rec?.diagnostic) {
      verdict = rec.diagnostic.verdict;
      source = "diagnostico";
      if (rec.diagnostic.parts && verdict !== "dominada") {
        parts = {};
        for (const part of ["A", "B"] as const) {
          const score = rec.diagnostic.parts[part];
          if (score) parts[part] = score.verdict;
        }
      }
    } else if (rec?.skipped) {
      verdict = "repasar";
      source = "saltado";
    } else if (state.decision === "aqui" && marks.state === "completa") {
      verdict = "dominada";
      source = "marcas";
    }
  }
  return { unit, marks, verdict, source, parts, diagnosable, pendingDiagnostic: diagnosable && !rec?.diagnostic && !rec?.skipped };
}

export const viewsOf = (raw: CourseProgress, tests: PhaseTests, state: ContinuityState): UnitView[] =>
  UNITS.map((u) => viewOf(u, raw, tests, state));

/** Veredicto de una semana: el de su parte si el diagnóstico las separó, y si no el de la unidad. */
function stepVerdict(view: UnitView, step: CourseStep): Verdict | null {
  return (step.part && view.parts?.[step.part]) || view.verdict;
}

export const DIAGNOSTIC_SESSIONS = 3;

export interface DiagnosticSession {
  /** 1 a 3. */
  n: number;
  /** Unidades de la sesión, de la más reciente a la más antigua. */
  units: UnitView[];
  /** Cuántas siguen sin diagnóstico ni «saltar». */
  pending: number;
}

/** Reparte las unidades diagnosticables en hasta 3 sesiones, de lo más reciente a lo más antiguo (14 §4). */
export function diagnosticSessions(views: UnitView[]): DiagnosticSession[] {
  const list = views.filter((v) => v.diagnosable).sort((a, b) => b.unit.n - a.unit.n);
  if (list.length === 0) return [];
  const count = Math.min(DIAGNOSTIC_SESSIONS, list.length);
  const size = Math.ceil(list.length / count);
  return Array.from({ length: count }, (_, i) => {
    const units = list.slice(i * size, (i + 1) * size);
    return { n: i + 1, units, pending: units.filter((v) => v.pendingDiagnostic).length };
  }).filter((s) => s.units.length > 0);
}

/* ───────────── huecos por cerrar (14 §5) ───────────── */

export interface Gap {
  step: CourseStep;
  /** Versión comprimida: 4 días (3 en u25 si estás por encima de u03). */
  length: 3 | 4;
  ready: boolean;
  postponed: boolean;
  /** Ya la terminaste. */
  done: boolean;
}

const isNewUnit = (step: CourseStep): boolean => step.kind === "core" && (getUnit(step.unit)?.n ?? 0) >= 25;

/**
 * La capa que se aplica al plan: unidades dominadas o por rehacer según el diagnóstico (o las marcas), y los
 * huecos por cerrar comprimidos. Sin decisiones, sin huecos y sin pospuestos, es una capa vacía (el plan no cambia).
 */
export function overlayOf(raw: CourseProgress, tests: PhaseTests, state: ContinuityState): { overlay: ContinuityOverlay; gaps: Gap[] } {
  const settled = new Set<string>();
  const redo = new Set<string>();
  for (const view of viewsOf(raw, tests, state)) {
    if (!view.verdict) continue;
    for (const step of stepsOfUnit(view.unit.id)) {
      const v = stepVerdict(view, step);
      if (v === "dominada") settled.add(step.id);
      else if (v === "rehacer") redo.add(step.id);
    }
  }
  const postponed = new Set(state.postponedGaps);
  const first: ContinuityOverlay = { settled, redo, compressed: new Map(), postponed: new Set() };
  const withFirst: CourseProgress = { ...raw, continuity: first };

  // Hasta dónde llegaste: la última semana del núcleo de una unidad antigua que ya está completa.
  let frontier = -1;
  COURSE.forEach((step, i) => {
    const unit = getUnit(step.unit);
    if (step.kind === "core" && unit && unit.ready && unit.n <= 24 && weekComplete(step, withFirst)) frontier = i;
  });
  const u03B = COURSE.findIndex((s) => s.id === "u03#B");

  const compressed = new Map<string, 3 | 4>();
  for (const [i, step] of COURSE.entries()) {
    if (isNewUnit(step) && i < frontier) compressed.set(step.id, step.unit === "u25" && frontier >= u03B ? 3 : 4);
  }
  const overlay: ContinuityOverlay = { settled, redo, compressed, postponed };
  const final: CourseProgress = { ...raw, continuity: overlay };
  const gaps: Gap[] = [...compressed].map(([id, length]) => {
    const step = COURSE.find((s) => s.id === id)!;
    return { step, length, ready: !!getUnit(step.unit)?.ready, postponed: postponed.has(id), done: weekComplete(step, final) };
  });
  return { overlay, gaps };
}

/** El progreso que ve el plan: con la capa de continuidad, salvo que hayas vuelto al plan anterior. */
export function courseWithContinuity(raw: CourseProgress, tests: PhaseTests, state: ContinuityState): CourseProgress {
  return state.usePrevious ? raw : { ...raw, continuity: overlayOf(raw, tests, state).overlay };
}

/* ───────────── puesta al día de capas nuevas (14 §5) ───────────── */

/** Bloques que la v2 trae y la app anterior no tenía, en el orden de §5: repetir, texto con preguntas y producción propia. */
const CATCHUP_BLOCKS = ["repeat", "text", "questions", "own"] as const;
/** Cada bloque de la puesta al día dura como máximo esto (minutos). */
export const CATCHUP_MAX_MINUTES = 8;

export interface CatchupItem {
  unit: string;
  /** Id del bloque dentro del ciclo (`repeat`). */
  blockId: string;
  name: string;
  minutes: number;
  /** Todavía no hay herramienta o contenido: se muestra «en preparación». */
  soon: boolean;
  done: boolean;
  /** Ruta de la herramienta, si ya existe. */
  to?: string;
}

export function catchupItems(unit: UnitMeta, state: ContinuityState): CatchupItem[] {
  const step = stepsOfUnit(unit.id)[0];
  if (!step) return [];
  const rec = recordOf(state, unit.id);
  const blocks = daysOf(step).flatMap((d) => d.blocks);
  return CATCHUP_BLOCKS.flatMap((id) => {
    const b = blocks.find((x) => x.id === id);
    if (!b) return [];
    const soon = !!b.soon || (!!b.needs && !unit.has[b.needs]);
    return [{
      unit: unit.id, blockId: b.id, name: b.name, minutes: Math.min(b.minutes, CATCHUP_MAX_MINUTES), soon,
      done: rec.catchup.done.includes(b.id),
      ...(!soon && b.kind === "dialogue" ? { to: `/dialogo/${unit.id}?c=${unit.id}.${b.id}` } : {}),
    }];
  });
}

export interface StartingPoint {
  views: UnitView[];
  gaps: Gap[];
  /** Desde dónde sigue el plan hoy. */
  next: Slot | null;
  /** Hay alguna marca (de cualquier tipo): sin marcas no hay nada que mostrar. */
  hasMarks: boolean;
  /** Unidades para la puesta al día: dominadas o por repasar. */
  catchup: { view: UnitView; items: CatchupItem[] }[];
}

export function startingPoint(raw: CourseProgress, tests: PhaseTests, state: ContinuityState): StartingPoint {
  const views = viewsOf(raw, tests, state);
  const { overlay, gaps } = overlayOf(raw, tests, state);
  const shown: CourseProgress = state.usePrevious ? raw : { ...raw, continuity: overlay };
  const catchup = views
    .filter((v) => v.verdict === "dominada" || v.verdict === "repasar")
    .map((view) => ({ view, items: catchupItems(view.unit, state) }))
    .filter((c) => c.items.length > 0)
    .reverse();
  return { views, gaps: state.usePrevious ? [] : gaps, next: currentSlot(shown), hasMarks: raw.done.size > 0, catchup };
}

/** Siguiente bloque de la puesta al día que ya se puede hacer (≤ 8 min), o null. */
export function nextCatchup(state: ContinuityState, points: StartingPoint["catchup"]): CatchupItem | null {
  if (state.usePrevious) return null;
  for (const { items } of points) {
    const item = items.find((i) => !i.done && !i.soon && i.to);
    if (item) return item;
  }
  return null;
}

/* ───────────── copia de seguridad reciente (14 §2, paso 1) ───────────── */

/** Hay una copia de menos de 14 días en este dispositivo. */
export function backupRecent(store: KV, now: Date): boolean {
  const last = store.getItem(LAST_BACKUP_KEY);
  if (!last || Number.isNaN(Date.parse(last))) return false;
  return (now.getTime() - Date.parse(last)) / 86_400_000 <= BACKUP_STALE_DAYS;
}
