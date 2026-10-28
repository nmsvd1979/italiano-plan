import { describe, expect, it } from "vitest";
import { parseISODate } from "./dates";
import { computeStreak, daysSinceLastStudy, doneKeys, heatLevel, minutesOn } from "./progress";
import {
  KEYS, KV, clearAll, clearProgress, getCanDo, getCompletions, getSettings, getSkipped, getStartUnit,
  removeKeyEverywhere, saveCanDo, saveSettings, saveSkipped, saveStartUnit, setCompletion, setStartDateISO,
} from "./storage";

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

  it("días desde el último estudio", () => {
    expect(daysSinceLastStudy(c, d("2026-09-14"))).toBe(0);
    expect(daysSinceLastStudy(c, d("2026-09-20"))).toBe(6);
    expect(daysSinceLastStudy({}, d("2026-09-20"))).toBeNull();
  });
});

describe("minutos y mapa de calor", () => {
  const minutes = new Map([["u01.s1.quizlet", 8], ["u01.s2.lesson", 15]]);
  const day = parseISODate("2026-09-14");

  it("suma los minutos de cada paso; una marca de la app anterior vale 8", () => {
    const c = { "2026-09-14": { "u01.s1.quizlet": true, "u01.s2.lesson": true, anki: true } };
    expect(minutesOn(c, day, minutes)).toBe(8 + 15 + 8);
    expect(minutesOn(c, day, minutes, 0)).toBe(23);
  });

  it("ignora las marcas en false", () => {
    expect(minutesOn({ "2026-09-14": { "u01.s2.lesson": false } }, day, minutes)).toBe(0);
  });

  it("niveles absolutos: no dependen de lo planificado", () => {
    expect([0, 8, 19, 20, 44, 45, 120].map(heatLevel)).toEqual([0, 1, 1, 2, 2, 3, 3]);
  });

  it("doneKeys une las marcas de todos los días", () => {
    const c = { "2026-09-13": { a: true }, "2026-09-14": { b: true, c: false } };
    expect([...doneKeys(c)].sort()).toEqual(["a", "b"]);
  });
});

describe("storage compatible con la app anterior", () => {
  it("lee el formato viejo tal cual y conserva la racha", () => {
    const store = memoryStore({
      [KEYS.startDate]: "2026-09-14",
      [KEYS.completions]: JSON.stringify({ "2026-09-14": { anki: true, input: true }, "2026-09-15": { anki: true } }),
    });
    const c = getCompletions(store);
    expect(c["2026-09-14"]).toEqual({ anki: true, input: true });
    expect(computeStreak(c, parseISODate("2026-09-15"))).toBe(2);
  });

  it("marcar y desmarcar; un día sin marcas se elimina", () => {
    const store = memoryStore();
    setCompletion("2026-09-14", "quizlet", true, store);
    expect(getCompletions(store)).toEqual({ "2026-09-14": { quizlet: true } });
    setCompletion("2026-09-14", "quizlet", false, store);
    expect(getCompletions(store)).toEqual({});
  });

  it("desmarcar en todas las fechas", () => {
    const store = memoryStore();
    setCompletion("2026-09-14", "x", true, store);
    setCompletion("2026-09-15", "x", true, store);
    setCompletion("2026-09-15", "y", true, store);
    expect(removeKeyEverywhere("x", store)).toEqual({ "2026-09-15": { y: true } });
  });

  it("settings con valores por defecto y parche parcial", () => {
    const store = memoryStore();
    const base = { reminderTime: "20:00", reminderEnabled: false, theme: "system", sessionsPerWeek: 6, dailyMinutes: 30, shortMode: false };
    expect(getSettings(store)).toEqual(base);
    saveSettings({ reminderEnabled: true, dailyMinutes: 60 }, store);
    expect(getSettings(store)).toEqual({ ...base, reminderEnabled: true, dailyMinutes: 60 });
  });

  it("pendientes, unidad inicial y puedo…", () => {
    const store = memoryStore();
    expect(getSkipped(store)).toEqual([]);
    expect(getStartUnit(store)).toBe(1);
    saveSkipped(["u01.s2.lesson"], store);
    saveStartUnit(4, store);
    saveCanDo({ u01: [0, 2] }, store);
    expect(getSkipped(store)).toEqual(["u01.s2.lesson"]);
    expect(getStartUnit(store)).toBe(4);
    expect(getCanDo(store)).toEqual({ u01: [0, 2] });
  });

  it("borrar progreso limpia pendientes y puedo…, pero no la unidad inicial", () => {
    const store = memoryStore();
    saveSkipped(["a"], store);
    saveStartUnit(4, store);
    saveCanDo({ u01: [0] }, store);
    clearProgress(store);
    expect(getSkipped(store)).toEqual([]);
    expect(getCanDo(store)).toEqual({});
    expect(getStartUnit(store)).toBe(4);
  });

  it("reiniciar todo borra fecha, unidad inicial y progreso", () => {
    const store = memoryStore();
    setStartDateISO("2026-09-14", store);
    saveStartUnit(4, store);
    setCompletion("2026-09-14", "quizlet", true, store);
    clearAll(store);
    expect(store.getItem(KEYS.startDate)).toBeNull();
    expect(getStartUnit(store)).toBe(1);
    expect(getCompletions(store)).toEqual({});
  });

  it("JSON corrupto cae en el valor por defecto", () => {
    expect(getCompletions(memoryStore({ [KEYS.completions]: "{no es json" }))).toEqual({});
  });
});
