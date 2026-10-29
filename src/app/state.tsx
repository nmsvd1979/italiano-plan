import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { requestPersistence } from "./persist";
import { useBlockTimer } from "./blockTimer";
import { routeQuery } from "./route";
import { getUnit, type UnitMeta } from "../content/curriculum";
import { Progress, Step, buildSteps } from "../domain/curriculum";
import {
  CourseProgress, Block, blockDone, blockKey, blockMinutes, currentSlot, daysFor, isSoon, readySteps, type BlockKind,
} from "../domain/cycle";
import {
  ContinuityState, courseWithContinuity, loadContinuity, markCatchup, saveContinuity, viewsOf,
} from "../domain/continuity";
import { applySeedReview } from "../domain/continuitySeed";
import { miniPassed } from "../domain/miniTest";
import { parseISODate, startOfDay, toISODate } from "../domain/dates";
import { doneKeys, keysOn } from "../domain/progress";
import { applySeed } from "../domain/seed";
import { ensureSrs } from "../domain/srs";
import {
  CanDo, Completions, MiniTests, Settings, addMiniAttempt, clearAll, getMiniTests, clearProgress, getCanDo, getCompletions, getPhaseTests, getSettings, getSkipped,
  getStartDateISO, getStartUnit, removeKeyEverywhere, saveCanDo, saveSettings, saveSkipped, saveStartUnit,
  setCompletion, setStartDateISO,
} from "../domain/storage";

const STEPS = buildSteps();
const BLOCK_MINUTES = blockMinutes();

/** Actividad de la que avisa cada pantalla → tipo de bloque del ciclo que la cumple. */
const KIND_OF_ACTIVITY: Record<string, BlockKind> = {
  lesson: "lesson", practice: "practice", review: "review", shadow: "shadowing", vocab: "vocab", dialogue: "dialogue",
  dictation: "dictation", pron: "pron", writing: "writing", srs: "srs", sinpista: "sinpista", reading: "reading", readq: "readq",
};

interface AppState {
  startDate: Date | null;
  today: Date;
  steps: Step[];
  progress: Progress;
  /** Progreso del ciclo de 7 días (marcas nuevas y equivalentes de la app anterior). */
  course: CourseProgress;
  /** El mismo progreso sin la capa de continuidad: solo lo que marcaste (para calcular el estado de cada unidad). */
  rawCourse: CourseProgress;
  /** Decisiones de «Tu punto de partida» (italianPlan.v2.progress). */
  continuity: ContinuityState;
  /** Cambia las decisiones de continuidad y las guarda. Solo escribe italianPlan.v2.progress. */
  updateContinuity: (change: (state: ContinuityState) => ContinuityState) => void;
  /** Siembra el repaso espaciado con las unidades dominadas o por repasar. Devuelve cuántas tarjetas agregó. */
  seedReview: () => number;
  /** Unidad de la semana en curso, o null si terminaste lo disponible. */
  current: UnitMeta | null;
  /** Registra un intento de mini-prueba. Devuelve si se aprobó (≥ 75 %). */
  recordMini: (stepId: string, correct: number, total: number, markKey?: string) => boolean;
  /** Claves marcadas hoy. */
  doneToday: ReadonlySet<string>;
  completions: Completions;
  settings: Settings;
  canDo: CanDo;
  setStart: (iso: string) => void;
  /** Marca o desmarca un paso (hoy). */
  setDone: (key: string, done: boolean) => void;
  /** Deja un paso para después (pasa a Pendientes) o lo devuelve al flujo. */
  setSkipped: (key: string, skipped: boolean) => void;
  /**
   * Marca el paso pendiente más antiguo de esa actividad (en la unidad dada, o en cualquiera).
   * Devuelve false si no hay ninguno: por ejemplo, al releer una lección ya hecha.
   */
  completeActivity: (activityId: string, unitId?: string) => boolean;
  setStartUnit: (n: number) => void;
  toggleCanDo: (unitId: string, index: number) => void;
  patchSettings: (patch: Partial<Settings>) => void;
  /** Aplica la semilla de avance (domain/seed.ts) y devuelve cuántas marcas agregó. */
  applyAdvance: () => number;
  resetProgress: () => void;
  resetAll: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp fuera de AppProvider");
  return v;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [startISO, setStartISO] = useState<string | null>(() => getStartDateISO());
  const [completions, setCompletions] = useState<Completions>(() => getCompletions());
  const [skippedList, setSkippedList] = useState<string[]>(() => getSkipped());
  const [startUnit, setStartUnitState] = useState<number>(() => getStartUnit());
  const [canDo, setCanDo] = useState<CanDo>(() => getCanDo());
  const [settings, setSettings] = useState<Settings>(() => getSettings());
  const [mini, setMini] = useState<MiniTests>(() => getMiniTests());
  const [continuity, setContinuity] = useState<ContinuityState>(() => loadContinuity(window.localStorage));
  const [today, setToday] = useState(() => startOfDay(new Date()));

  useBlockTimer();

  // Pide que el navegador no borre los datos de la app si hay poco espacio.
  useEffect(() => { void requestPersistence(); ensureSrs(window.localStorage); }, []);

  // Si la app queda abierta pasada la medianoche, "hoy" se actualiza al volver a verla.
  useEffect(() => {
    const refresh = () => setToday((t) => {
      const now = startOfDay(new Date());
      return now.getTime() === t.getTime() ? t : now;
    });
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);

  const startDate = useMemo(() => (startISO ? parseISODate(startISO) : null), [startISO]);
  const progress = useMemo<Progress>(
    () => ({ done: doneKeys(completions), skipped: new Set(skippedList), startUnit }),
    [completions, skippedList, startUnit],
  );
  const rawCourse = useMemo<CourseProgress>(() => ({ done: progress.done, startUnit, mini }), [progress.done, startUnit, mini]);
  // Los tests de fase se leen al calcular: no cambian con las marcas, pero sí con cada completions nuevo.
  const course = useMemo<CourseProgress>(
    () => courseWithContinuity(rawCourse, getPhaseTests(), continuity),
    [rawCourse, continuity, completions],
  );
  const current = useMemo(() => {
    const slot = currentSlot(course);
    return slot ? getUnit(slot.step.unit) ?? null : null;
  }, [course]);
  const doneToday = useMemo(() => keysOn(completions, today), [completions, today]);

  const setStart = useCallback((iso: string) => {
    setStartDateISO(iso);
    setStartISO(iso);
  }, []);

  const setSkipped = useCallback((key: string, skipped: boolean) => {
    setSkippedList((list) => {
      const next = skipped ? [...new Set([...list, key])] : list.filter((k) => k !== key);
      saveSkipped(next);
      return next;
    });
  }, []);

  const setDone = useCallback((key: string, done: boolean) => {
    if (done) {
      setCompletions(setCompletion(toISODate(today), key, true));
      setSkipped(key, false);
    } else {
      setCompletions(removeKeyEverywhere(key));
    }
  }, [today, setSkipped]);

  /**
   * Una pantalla avisa que terminó su actividad. Si se abrió desde un bloque de Hoy (`?k=clave`), se marca ese bloque;
   * si no, el primer bloque pendiente de ese tipo en la unidad. Devuelve false si no había nada que marcar.
   */
  const updateContinuity = useCallback((change: (state: ContinuityState) => ContinuityState) => {
    setContinuity((prev) => {
      const next = change(prev);
      if (next !== prev) saveContinuity(window.localStorage, next);
      return next;
    });
  }, []);

  const seedReview = useCallback(() => {
    const views = viewsOf(rawCourse, getPhaseTests(), continuity);
    const added = applySeedReview(window.localStorage, views);
    setContinuity(loadContinuity(window.localStorage));
    return added;
  }, [rawCourse, continuity]);

  const completeActivity = useCallback((activityId: string, unitId?: string) => {
    // Puesta al día (`?c=u04.repeat`): se anota en italianPlan.v2.progress, no en las marcas del plan.
    const c = routeQuery().get("c");
    if (c) {
      const [unit, blockId] = c.split(".");
      updateContinuity((state) => markCatchup(state, unit, blockId));
      return true;
    }
    const k = routeQuery().get("k");
    if (k && BLOCK_MINUTES.has(k)) {
      if (!progress.done.has(k)) setDone(k, true);
      return true;
    }
    const kind = KIND_OF_ACTIVITY[activityId];
    if (!kind) return false;
    for (const step of readySteps()) {
      if (unitId && step.unit !== unitId) continue;
      const unit = getUnit(step.unit);
      if (!unit) continue;
      for (const day of daysFor(step, course)) {
        const block = day.blocks.find((b: Block) => b.kind === kind && !isSoon(b, unit) && !blockDone(step, day.day, b, course));
        if (block) {
          setDone(blockKey(step.id, day.day, block.id), true);
          return true;
        }
      }
    }
    return false;
  }, [progress, course, setDone, updateContinuity]);

  const recordMini = useCallback((stepId: string, correct: number, total: number, markKey?: string) => {
    const passed = miniPassed(correct, total);
    setMini(addMiniAttempt(stepId, { date: toISODate(today), correct, total, passed }));
    if (markKey && BLOCK_MINUTES.has(markKey)) setCompletions(setCompletion(toISODate(today), markKey, true));
    return passed;
  }, [today]);

  const setStartUnit = useCallback((n: number) => {
    saveStartUnit(n);
    setStartUnitState(n);
  }, []);

  const toggleCanDo = useCallback((unitId: string, index: number) => {
    setCanDo((all) => {
      const mine = all[unitId] ?? [];
      const next = { ...all, [unitId]: mine.includes(index) ? mine.filter((i) => i !== index) : [...mine, index] };
      saveCanDo(next);
      return next;
    });
  }, []);

  const patchSettings = useCallback((patch: Partial<Settings>) => setSettings(saveSettings(patch)), []);

  const applyAdvance = useCallback(() => {
    const added = applySeed(window.localStorage);
    setCompletions(getCompletions());
    return added;
  }, []);

  const resetProgress = useCallback(() => {
    clearProgress();
    setContinuity(loadContinuity(window.localStorage));
    setMini({});
    setCompletions({});
    setSkippedList([]);
    setCanDo({});
  }, []);

  const resetAll = useCallback(() => {
    clearAll();
    setContinuity(loadContinuity(window.localStorage));
    setMini({});
    setCompletions({});
    setSkippedList([]);
    setCanDo({});
    setStartUnitState(1);
    setStartISO(null);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      startDate, today, steps: STEPS, progress, course, rawCourse, continuity, updateContinuity, seedReview, current, recordMini, doneToday, completions, settings, canDo, setStart, setDone,
      setSkipped, completeActivity, setStartUnit, toggleCanDo, patchSettings, applyAdvance, resetProgress,
      resetAll,
    }),
    [startDate, today, progress, course, rawCourse, continuity, updateContinuity, seedReview, current, recordMini, doneToday, completions, settings, canDo, setStart, setDone, setSkipped,
      completeActivity, setStartUnit, toggleCanDo, patchSettings, applyAdvance, resetProgress, resetAll],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
