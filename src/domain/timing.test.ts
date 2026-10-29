import { describe, expect, it } from "vitest";
import { parseISODate } from "./dates";
import { SHORT_DAY_RATIO, dayMinutes, endedShort, estimatedMinutes, srsMinutes, type DayBlock } from "./minutes";
import { minutesOn } from "./progress";
import { KEYS, KEYS_V2, KV, clearProgress } from "./storage";
import {
  BlockClock, PAUSE_MS, addTiming, emptyTimings, ensureTimings, loadTimings, measuredMinutes, normalizeTimings, withMeasured,
} from "./timing";

function memoryStore(initial: Record<string, string> = {}): KV {
  const m = new Map(Object.entries(initial));
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
  };
}

const MIN = 60_000;

describe("minutos del repaso espaciado", () => {
  it.each([[0, 1], [5, 2], [20, 5], [60, 10], [200, 10]])("%i tarjetas → %i min", (cards, min) => {
    expect(srsMinutes(cards)).toBe(min);
  });

  it("solo el bloque srs cambia; los demás conservan su estimación", () => {
    expect(estimatedMinutes({ kind: "srs", minutes: 5 }, 5)).toBe(2);
    expect(estimatedMinutes({ kind: "lesson", minutes: 10 }, 5)).toBe(10);
  });
});

describe("medición con pausas", () => {
  it("suma el tiempo entre toques", () => {
    const c = new BlockClock("u01.d1.lesson", 0);
    c.beat(30_000);
    c.beat(90_000);
    expect(c.take()).toEqual({ ms: 90_000, start: 0, end: 90_000 });
  });

  it("descarta una pausa de más de 2 minutos", () => {
    const c = new BlockClock("k", 0);
    c.beat(MIN);
    c.beat(MIN + PAUSE_MS + 1); // pausa larga: no cuenta
    c.beat(MIN + PAUSE_MS + 1 + 30_000);
    expect(c.take()?.ms).toBe(MIN + 30_000);
  });

  it("una pausa de exactamente 2 minutos sí cuenta", () => {
    const c = new BlockClock("k", 0);
    c.beat(PAUSE_MS);
    expect(c.take()?.ms).toBe(PAUSE_MS);
  });

  it("no cuenta el tiempo con la pantalla oculta", () => {
    const c = new BlockClock("k", 0);
    c.hide(20_000);
    c.beat(50_000); // ignorado mientras está oculta
    c.show(10 * MIN);
    c.beat(10 * MIN + 10_000);
    expect(c.take()?.ms).toBe(30_000);
  });

  it("sin tiempo medido no devuelve nada, y al tomar reinicia el contador conservando el inicio", () => {
    const c = new BlockClock("k", 5);
    expect(c.take()).toBeNull();
    c.beat(1005);
    expect(c.take()).toEqual({ ms: 1000, start: 5, end: 1005 });
    expect(c.take()).toBeNull();
  });
});

describe("almacenamiento y migración", () => {
  it("sin clave: lee vacío y ensureTimings la crea sin tocar las demás", () => {
    const completions = JSON.stringify({ "2026-09-14": { "u01.d1.srs": true } });
    const store = memoryStore({ [KEYS.completions]: completions });
    expect(loadTimings(store)).toEqual(emptyTimings());
    ensureTimings(store);
    expect(store.getItem(KEYS_V2.timing)).toBe(JSON.stringify(emptyTimings()));
    expect(store.getItem(KEYS.completions)).toBe(completions);
  });

  it("ensureTimings no pisa lo ya guardado", () => {
    const store = memoryStore();
    addTiming(store, "k", { ms: 1000, start: 1, end: 2 });
    ensureTimings(store);
    expect(loadTimings(store).blocks.k.ms).toBe(1000);
  });

  it("un valor dañado o de otra versión se lee como vacío y no revienta", () => {
    expect(loadTimings(memoryStore({ [KEYS_V2.timing]: "{no json" }))).toEqual(emptyTimings());
    expect(normalizeTimings({ version: 9, blocks: { k: { ms: 1, start: 1, end: 1 } } })).toEqual(emptyTimings());
    expect(normalizeTimings(null)).toEqual(emptyTimings());
  });

  it("descarta solo las entradas incompletas", () => {
    const t = normalizeTimings({ version: 1, blocks: { a: { ms: 5, start: 1, end: 6 }, b: { ms: -1, start: 1, end: 2 }, c: "x" } });
    expect(Object.keys(t.blocks)).toEqual(["a"]);
  });

  it("acumula varias aperturas del mismo bloque", () => {
    const store = memoryStore();
    addTiming(store, "k", { ms: 1000, start: 10, end: 20 });
    addTiming(store, "k", { ms: 2000, start: 5, end: 30 });
    expect(loadTimings(store).blocks.k).toEqual({ ms: 3000, start: 5, end: 30 });
  });

  it("«Borrar progreso» también borra los tiempos", () => {
    const store = memoryStore();
    addTiming(store, "k", { ms: 1000, start: 1, end: 2 });
    clearProgress(store);
    expect(store.getItem(KEYS_V2.timing)).toBeNull();
  });
});

describe("Progress con y sin medición", () => {
  const day = parseISODate("2026-09-14");
  const completions = { "2026-09-14": { "u01.d1.srs": true, "u01.d1.lesson": true } };
  const nominal = new Map([["u01.d1.srs", 5], ["u01.d1.lesson", 10]]);

  it("sin medición usa los minutos nominales", () => {
    expect(minutesOn(completions, day, withMeasured(nominal, emptyTimings()))).toBe(15);
  });

  it("con medición usa lo medido y, donde falta, lo nominal", () => {
    const t = emptyTimings();
    t.blocks["u01.d1.srs"] = { ms: 90_000, start: 0, end: 90_000 };
    expect(measuredMinutes(t, "u01.d1.srs")).toBe(2);
    expect(minutesOn(completions, day, withMeasured(nominal, t))).toBe(12);
  });

  it("un bloque abierto unos segundos cuenta al menos 1 minuto", () => {
    const t = emptyTimings();
    t.blocks.k = { ms: 4000, start: 0, end: 4000 };
    expect(measuredMinutes(t, "k")).toBe(1);
  });
});

describe("resumen del día y «Hacer más hoy»", () => {
  const blocks = (): DayBlock[] => [
    { key: "a", estimated: 5, done: true, core: true },
    { key: "b", estimated: 10, done: true, core: true },
    { key: "c", estimated: 6, done: false, core: false },
  ];
  const timed = (a: number, b: number) => {
    const t = emptyTimings();
    t.blocks.a = { ms: a * MIN, start: 0, end: 1 };
    t.blocks.b = { ms: b * MIN, start: 0, end: 1 };
    return t;
  };

  it("el total del día usa lo medido de los bloques hechos y lo estimado del resto", () => {
    expect(dayMinutes(blocks(), timed(2, 4))).toBe(2 + 4 + 6);
    expect(dayMinutes(blocks(), emptyTimings())).toBe(21);
  });

  it("menos del 80 % de lo estimado destaca el botón", () => {
    expect(endedShort(blocks(), timed(2, 4))).toBe(true); // 6 de 15
    expect(endedShort(blocks(), timed(5, 6))).toBe(true); // 11 de 15
  });

  it("exactamente el 80 % o más no lo destaca; sin medición tampoco", () => {
    expect(endedShort(blocks(), timed(4, 8))).toBe(false); // 12 de 15
    expect(endedShort(blocks(), timed(6, 12))).toBe(false);
    expect(endedShort(blocks(), emptyTimings())).toBe(false);
    expect(SHORT_DAY_RATIO).toBe(0.8);
  });
});
