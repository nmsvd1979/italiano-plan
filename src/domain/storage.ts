import type { ReviewState } from "./review";

// Mismas claves y mismo formato que la app anterior, para conservar el progreso.

export interface KV {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type Completions = Record<string, Record<string, boolean>>;

export type ThemeChoice = "system" | "light" | "dark";

export interface Settings {
  reminderTime: string;
  reminderEnabled: boolean;
  theme: ThemeChoice;
  /** Ritmo que quieres sostener; solo afecta al aviso de ritmo y a la fecha estimada. */
  sessionsPerWeek: number;
  /** Tiempo que dices tener hoy; se recuerda el último valor. */
  dailyMinutes: number;
  /** «Hoy tengo poco tiempo»: Hoy muestra solo los bloques esenciales. Se recuerda hasta que se cambie. */
  shortMode: boolean;
  /** Día (AAAA-MM-DD) en que se activó el modo corto, para sugerir volver al normal. */
  shortSince?: string;
}

export const KEYS = {
  startDate: "italianPlan.startDate",
  completions: "italianPlan.completions",
  settings: "italianPlan.settings",
  lastNotified: "italianPlan.lastNotifiedDate",
  review: "italianPlan.review",
  shadowing: "italianPlan.shadowing",
  phaseTests: "italianPlan.phaseTests",
  skipped: "italianPlan.skipped",
  startUnit: "italianPlan.startUnit",
  canDo: "italianPlan.canDo",
  writing: "italianPlan.writing",
} as const;

/**
 * Claves nuevas de la v2. Se llaman `italianPlan.v2.*` para que la copia de seguridad (prefijo `italianPlan.`)
 * las incluya, y no reemplazan ni modifican ninguna de KEYS.
 */
export const KEYS_V2 = {
  /** Estado por unidad de la v2 (docs/v2/14 §7). Reservada para la capa de continuidad (H2); H1 solo la valida en la copia. */
  progress: "italianPlan.v2.progress",
  /** Marca de que la semilla de avance ya se aplicó en este dispositivo: no se vuelve a ofrecer ni a aplicar. */
  seedApplied: "italianPlan.v2.seedApplied",
  /** Intentos de la mini-prueba de cada semana del curso (docs/v2/04 D3). */
  miniTests: "italianPlan.v2.miniTests",
  /** Tiempo real medido por bloque (domain/timing.ts). */
  timing: "italianPlan.v2.timing",
  /** Rotación de la práctica sin pista (domain/sinpistaState.ts): qué ejercicios ya salieron y cuáles fallaste. */
  sinpista: "italianPlan.v2.sinpista",
  /** Versiones corregidas con Claude y su reescritura a los 3 días (domain/writingFix.ts). */
  writingFix: "italianPlan.v2.writingFix",
  /** Intentos de la prueba de nivel A2 (domain/evaluation.ts). */
  levelTests: "italianPlan.v2.levelTests",
} as const;

/** Registro de actividad (domain/activityLog.ts, docs/v2/06 F1): arreglo JSON, máximo 2000 entradas. */
export const LOG_KEY = "italianPlan.log.v1";

/** Repaso espaciado propio (docs/v2/02 B2): tarjetas, historial y opciones, en un solo valor JSON. */
export const SRS_KEY = "italianPlan.srs.v1";

const defaultStore = (): KV => window.localStorage;

function readJSON<T>(store: KV, key: string, fallback: T): T {
  try {
    const raw = store.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getStartDateISO(store: KV = defaultStore()): string | null {
  return store.getItem(KEYS.startDate);
}

export function setStartDateISO(iso: string, store: KV = defaultStore()): void {
  store.setItem(KEYS.startDate, iso);
}

export function getCompletions(store: KV = defaultStore()): Completions {
  return readJSON<Completions>(store, KEYS.completions, {});
}

export function setCompletion(
  dateISO: string, activityId: string, done: boolean, store: KV = defaultStore(),
): Completions {
  const all = getCompletions(store);
  const day = { ...(all[dateISO] ?? {}) };
  if (done) day[activityId] = true;
  else delete day[activityId];
  if (Object.keys(day).length === 0) delete all[dateISO];
  else all[dateISO] = day;
  store.setItem(KEYS.completions, JSON.stringify(all));
  return all;
}

export function removeKeyEverywhere(key: string, store: KV = defaultStore()): Completions {
  const all = getCompletions(store);
  for (const iso of Object.keys(all)) {
    delete all[iso][key];
    if (Object.keys(all[iso]).length === 0) delete all[iso];
  }
  store.setItem(KEYS.completions, JSON.stringify(all));
  return all;
}

/** Claves de pasos que dejaste para después. */
export function getSkipped(store: KV = defaultStore()): string[] {
  return readJSON<string[]>(store, KEYS.skipped, []);
}

export function saveSkipped(keys: string[], store: KV = defaultStore()): void {
  store.setItem(KEYS.skipped, JSON.stringify(keys));
}

/** Unidades anteriores a esta se dan por sabidas. */
export function getStartUnit(store: KV = defaultStore()): number {
  const n = Number(store.getItem(KEYS.startUnit));
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

export function saveStartUnit(n: number, store: KV = defaultStore()): void {
  store.setItem(KEYS.startUnit, String(n));
}

/** Autoevaluación "Puedo…": id de unidad → índices de los enunciados marcados. */
export type CanDo = Record<string, number[]>;

export function getCanDo(store: KV = defaultStore()): CanDo {
  return readJSON<CanDo>(store, KEYS.canDo, {});
}

export function saveCanDo(value: CanDo, store: KV = defaultStore()): void {
  store.setItem(KEYS.canDo, JSON.stringify(value));
}

/** Textos de escritura guiada, por unidad. */
export type WritingTexts = Record<string, string>;

export function getWritingTexts(store: KV = defaultStore()): WritingTexts {
  return readJSON<WritingTexts>(store, KEYS.writing, {});
}

export function saveWritingText(unit: string, text: string, store: KV = defaultStore()): void {
  const all = getWritingTexts(store);
  if (text) all[unit] = text;
  else delete all[unit];
  store.setItem(KEYS.writing, JSON.stringify(all));
}

export function getSettings(store: KV = defaultStore()): Settings {
  return { reminderTime: "20:00", reminderEnabled: false, theme: "system" as ThemeChoice, sessionsPerWeek: 6, dailyMinutes: 30, shortMode: false, ...readJSON<Partial<Settings>>(store, KEYS.settings, {}) };
}

export function saveSettings(patch: Partial<Settings>, store: KV = defaultStore()): Settings {
  const next = { ...getSettings(store), ...patch };
  store.setItem(KEYS.settings, JSON.stringify(next));
  return next;
}

export function getReview(store: KV = defaultStore()): ReviewState {
  return readJSON<ReviewState>(store, KEYS.review, {});
}

export function saveReview(state: ReviewState, store: KV = defaultStore()): void {
  store.setItem(KEYS.review, JSON.stringify(state));
}

/** Fragmentos (inicio y fin en segundos) que marcaste en cada video de shadowing. */
export type ShadowingSegments = Record<string, { a: number; b: number }>;

export function getShadowing(store: KV = defaultStore()): ShadowingSegments {
  return readJSON<ShadowingSegments>(store, KEYS.shadowing, {});
}

export function saveShadowing(segments: ShadowingSegments, store: KV = defaultStore()): void {
  store.setItem(KEYS.shadowing, JSON.stringify(segments));
}

export interface PhaseTestResult {
  date: string;
  correct: number;
  total: number;
  byTopic: Record<string, { correct: number; total: number }>;
  /** Resultado por área (lectura, escucha, gramática, vocabulario, producción). Falta en los tests anteriores a la fase F. */
  byArea?: Record<string, { correct: number; total: number }>;
}
/** Historial de tests de fase, por número de fase. */
export type PhaseTests = Record<string, PhaseTestResult[]>;

export function getPhaseTests(store: KV = defaultStore()): PhaseTests {
  return readJSON<PhaseTests>(store, KEYS.phaseTests, {});
}

export function addPhaseTest(phase: number, result: PhaseTestResult, store: KV = defaultStore()): PhaseTests {
  const all = getPhaseTests(store);
  all[phase] = [...(all[phase] ?? []), result];
  store.setItem(KEYS.phaseTests, JSON.stringify(all));
  return all;
}

/** Intento de mini-prueba de una semana del curso. */
export interface MiniAttempt {
  date: string;
  correct: number;
  total: number;
  passed: boolean;
}
/** Id de paso del curso (`u04`, `u02#A`) → intentos en orden. */
export type MiniTests = Record<string, MiniAttempt[]>;

export function getMiniTests(store: KV = defaultStore()): MiniTests {
  return readJSON<MiniTests>(store, KEYS_V2.miniTests, {});
}

export function addMiniAttempt(stepId: string, attempt: MiniAttempt, store: KV = defaultStore()): MiniTests {
  const all = getMiniTests(store);
  all[stepId] = [...(all[stepId] ?? []), attempt];
  store.setItem(KEYS_V2.miniTests, JSON.stringify(all));
  return all;
}

export function clearProgress(store: KV = defaultStore()): void {
  store.removeItem(KEYS.completions);
  store.removeItem(KEYS.review);
  store.removeItem(KEYS.shadowing);
  store.removeItem(KEYS.phaseTests);
  store.removeItem(KEYS.skipped);
  store.removeItem(KEYS.canDo);
  store.removeItem(KEYS.writing);
  store.removeItem(KEYS_V2.seedApplied);
  store.removeItem(KEYS_V2.miniTests);
  store.removeItem(KEYS_V2.progress);
  store.removeItem(KEYS_V2.timing);
  store.removeItem(KEYS_V2.sinpista);
  store.removeItem(KEYS_V2.writingFix);
  store.removeItem(KEYS_V2.levelTests);
  store.removeItem(LOG_KEY);
  store.removeItem(SRS_KEY);
}

export function clearAll(store: KV = defaultStore()): void {
  clearProgress(store);
  store.removeItem(KEYS.startDate);
  store.removeItem(KEYS.startUnit);
}

/** Intentos de la prueba de nivel A2, del más antiguo al más nuevo. */
export function getLevelTests(store: KV = defaultStore()): { date: string; correct: number; total: number; byArea: Record<string, { correct: number; total: number }> }[] {
  const v = readJSON<unknown>(store, KEYS_V2.levelTests, []);
  return Array.isArray(v) ? v : [];
}

export function addLevelTest(result: { date: string; correct: number; total: number; byArea: Record<string, { correct: number; total: number }> }, store: KV = defaultStore()): void {
  store.setItem(KEYS_V2.levelTests, JSON.stringify([...getLevelTests(store), result]));
}
