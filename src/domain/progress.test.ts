import { describe, expect, it } from "vitest";
import { parseISODate } from "./dates";
import { aggregateProgress, computeStreak, doneCountForDate, heatLevel } from "./progress";
import { KEYS, KV, clearAll, getCompletions, getSettings, saveSettings, setCompletion, setStartDateISO } from "./storage";
import { weekDateRange } from "./planState";

function memoryStore(initial: Record<string, string> = {}): KV {
  const m = new Map(Object.entries(initial));
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
  };
}

describe("racha", () => {
  const d = parseISODate;
  const c = { "2026-09-13": { quizlet: true }, "2026-09-14": { input: true } };

  it("cuenta días consecutivos hasta hoy", () => {
    expect(computeStreak({ ...c, "2026-09-15": { quizlet: true } }, d("2026-09-15"))).toBe(3);
  });

  it("si hoy todavía no marcaste nada, no corta la racha de ayer", () => {
    expect(computeStreak(c, d("2026-09-15"))).toBe(2);
  });

  it("un día vacío la corta", () => {
    expect(computeStreak({ "2026-09-12": { quizlet: true }, "2026-09-14": { input: true } }, d("2026-09-14"))).toBe(1);
  });
});

describe("progreso", () => {
  it("topea lo hecho por lo planificado", () => {
    const lunes = parseISODate("2026-09-14"); // 4 actividades
    const c = { "2026-09-14": { a: true, b: true, c: true, d: true, e: true, f: true } };
    expect(doneCountForDate(c, lunes)).toBe(4);
  });

  it("una semana completa planifica 4+2+4+2+2+4+4 = 22 actividades", () => {
    const week = weekDateRange(parseISODate("2026-09-14"), 1);
    expect(aggregateProgress({}, week)).toEqual({ planned: 22, done: 0 });
  });

  it("niveles del heatmap", () => {
    expect([heatLevel(0, 4), heatLevel(1, 4), heatLevel(2, 4), heatLevel(4, 4)]).toEqual([0, 1, 2, 3]);
  });
});

describe("storage compatible con la app anterior", () => {
  it("lee el formato viejo tal cual", () => {
    const store = memoryStore({
      [KEYS.startDate]: "2026-09-14",
      [KEYS.completions]: JSON.stringify({ "2026-09-14": { anki: true, input: true } }),
    });
    expect(getCompletions(store)["2026-09-14"]).toEqual({ anki: true, input: true });
  });

  it("marcar y desmarcar; un día sin marcas se elimina", () => {
    const store = memoryStore();
    setCompletion("2026-09-14", "quizlet", true, store);
    expect(getCompletions(store)).toEqual({ "2026-09-14": { quizlet: true } });
    setCompletion("2026-09-14", "quizlet", false, store);
    expect(getCompletions(store)).toEqual({});
  });

  it("settings con valores por defecto y parche parcial", () => {
    const store = memoryStore();
    expect(getSettings(store)).toEqual({ reminderTime: "20:00", reminderEnabled: false, theme: "system" });
    saveSettings({ reminderEnabled: true }, store);
    expect(getSettings(store)).toEqual({ reminderTime: "20:00", reminderEnabled: true, theme: "system" });
  });

  it("reiniciar todo borra fecha y progreso", () => {
    const store = memoryStore();
    setStartDateISO("2026-09-14", store);
    setCompletion("2026-09-14", "quizlet", true, store);
    clearAll(store);
    expect(store.getItem(KEYS.startDate)).toBeNull();
    expect(getCompletions(store)).toEqual({});
  });

  it("JSON corrupto cae en el valor por defecto", () => {
    expect(getCompletions(memoryStore({ [KEYS.completions]: "{no es json" }))).toEqual({});
  });
});
