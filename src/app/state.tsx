import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { parseISODate, startOfDay, toISODate } from "../domain/dates";
import { PlanState, planStateForDate } from "../domain/planState";
import {
  Completions, Settings, clearAll, clearProgress, getCompletions, getSettings, getStartDateISO,
  saveSettings, setCompletion, setStartDateISO,
} from "../domain/storage";

interface AppState {
  startDate: Date | null;
  today: Date;
  plan: PlanState | null;
  completions: Completions;
  settings: Settings;
  setStart: (iso: string) => void;
  /** Marca o desmarca una actividad de hoy (o de la fecha dada). */
  setDone: (activityId: string, done: boolean, dateISO?: string) => void;
  patchSettings: (patch: Partial<Settings>) => void;
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
  const [settings, setSettings] = useState<Settings>(() => getSettings());
  const [today, setToday] = useState(() => startOfDay(new Date()));

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
  const plan = useMemo(() => (startDate ? planStateForDate(startDate, today) : null), [startDate, today]);

  const setStart = useCallback((iso: string) => {
    setStartDateISO(iso);
    setStartISO(iso);
  }, []);

  const setDone = useCallback((activityId: string, done: boolean, dateISO = toISODate(today)) => {
    setCompletions(setCompletion(dateISO, activityId, done));
  }, [today]);

  const patchSettings = useCallback((patch: Partial<Settings>) => setSettings(saveSettings(patch)), []);

  const resetProgress = useCallback(() => {
    clearProgress();
    setCompletions({});
  }, []);

  const resetAll = useCallback(() => {
    clearAll();
    setCompletions({});
    setStartISO(null);
  }, []);

  const value = useMemo<AppState>(
    () => ({ startDate, today, plan, completions, settings, setStart, setDone, patchSettings, resetProgress, resetAll }),
    [startDate, today, plan, completions, settings, setStart, setDone, patchSettings, resetProgress, resetAll],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
