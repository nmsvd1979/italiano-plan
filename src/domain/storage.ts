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
}

export const KEYS = {
  startDate: "italianPlan.startDate",
  completions: "italianPlan.completions",
  settings: "italianPlan.settings",
  lastNotified: "italianPlan.lastNotifiedDate",
  review: "italianPlan.review",
  shadowing: "italianPlan.shadowing",
  phaseTests: "italianPlan.phaseTests",
} as const;

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

export function getSettings(store: KV = defaultStore()): Settings {
  return { reminderTime: "20:00", reminderEnabled: false, theme: "system" as ThemeChoice, ...readJSON<Partial<Settings>>(store, KEYS.settings, {}) };
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

export function clearProgress(store: KV = defaultStore()): void {
  store.removeItem(KEYS.completions);
  store.removeItem(KEYS.review);
  store.removeItem(KEYS.shadowing);
  store.removeItem(KEYS.phaseTests);
}

export function clearAll(store: KV = defaultStore()): void {
  clearProgress(store);
  store.removeItem(KEYS.startDate);
}
