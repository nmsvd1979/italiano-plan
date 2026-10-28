import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { requestPersistence } from "./persist";
import { Progress, Step, buildSteps, isOffered } from "../domain/curriculum";
import { parseISODate, startOfDay, toISODate } from "../domain/dates";
import { doneKeys, keysOn } from "../domain/progress";
import { applySeed } from "../domain/seed";
import { ensureSrs } from "../domain/srs";
import {
  CanDo, Completions, Settings, clearAll, clearProgress, getCanDo, getCompletions, getSettings, getSkipped,
  getStartDateISO, getStartUnit, removeKeyEverywhere, saveCanDo, saveSettings, saveSkipped, saveStartUnit,
  setCompletion, setStartDateISO,
} from "../domain/storage";

const STEPS = buildSteps();

interface AppState {
  startDate: Date | null;
  today: Date;
  steps: Step[];
  progress: Progress;
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
  const [today, setToday] = useState(() => startOfDay(new Date()));

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

  const completeActivity = useCallback((activityId: string, unitId?: string) => {
    const step = STEPS.find((s) =>
      s.activity.id === activityId && (!unitId || s.unit.id === unitId) &&
      !progress.done.has(s.key) && isOffered(s, STEPS, { ...progress, skipped: new Set() }),
    );
    if (!step) return false;
    setDone(step.key, true);
    return true;
  }, [progress, setDone]);

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
    setCompletions({});
    setSkippedList([]);
    setCanDo({});
  }, []);

  const resetAll = useCallback(() => {
    clearAll();
    setCompletions({});
    setSkippedList([]);
    setCanDo({});
    setStartUnitState(1);
    setStartISO(null);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      startDate, today, steps: STEPS, progress, doneToday, completions, settings, canDo, setStart, setDone,
      setSkipped, completeActivity, setStartUnit, toggleCanDo, patchSettings, applyAdvance, resetProgress,
      resetAll,
    }),
    [startDate, today, progress, doneToday, completions, settings, canDo, setStart, setDone, setSkipped,
      completeActivity, setStartUnit, toggleCanDo, patchSettings, applyAdvance, resetProgress, resetAll],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
