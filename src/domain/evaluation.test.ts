import { describe, expect, it } from "vitest";
import { COURSE } from "../content/course";
import { READY_UNITS } from "../content/curriculum";
import { daysOf, remedialDays } from "./cycle";
import { exercisesOf } from "../content/grammar";
import { hasReserve, loadPruebas, pruebasDisponibles, validatePruebas, type Pruebas } from "../content/pruebas";
import { LOG_KEY, MINUTES_CAP, addMinutes, loadLog, parseBlockKey } from "./activityLog";
import { BACKUP_APP, BACKUP_VERSION, buildBackup, parseBackup } from "./backup";
import {
  AREAS, MINI_TARGET, levelBattery, miniBattery, phaseBattery, pointsOf, scoreAreas, totalOf, vocabItems, weakAreas, type TestItem,
} from "./evaluation";
import { activeWords, areaAccuracy, recallRate, reinforcementAreas, strandMinutes, studiedDays, strandOf } from "./panel";
import { emptySrs, newSrsCard, rateCard, applyReview } from "./srs";
import { KEYS_V2, addLevelTest, clearProgress, getLevelTests, type KV } from "./storage";

class Store implements KV {
  map = new Map<string, string>();
  get length() { return this.map.size; }
  key(i: number) { return [...this.map.keys()][i] ?? null; }
  getItem(k: string) { return this.map.get(k) ?? null; }
  setItem(k: string, v: string) { this.map.set(k, v); }
  removeItem(k: string) { this.map.delete(k); }
}

const mc = (i: number) => ({ q: `¿Pregunta ${i}?`, options: ["a", "b", "c"], answer: i % 3, why: "porque sí" });
const reserve = (units: string[]): Pruebas =>
  Object.fromEntries(units.map((u) => [u, {
    lectura: [1, 2, 3].map((i) => ({ ...mc(i), text: `Testo ${i}` })),
    escucha: [1, 2, 3].map((i) => ({ ...mc(i), it: `Frase ${i}` })),
    gramatica: [1, 2, 3, 4].map((i) => ({ type: "choice" as const, prompt: `Elige ${i}`, options: ["x", "y"], answer: 0, why: "ok" })),
  }]));
const srs = emptySrs();
const count = (items: TestItem[], a: string) => items.filter((i) => i.area === a).length;

describe("ítems de prueba (reserva)", () => {
  it("sin pruebas.json la reserva está vacía y el cargador no falla; con el archivo, valida", async () => {
    const p = await loadPruebas();
    if (!pruebasDisponibles()) expect(p).toEqual({});
    else expect(validatePruebas(p)).toEqual([]);
  });
  it("el validador detecta ítems mal formados", () => {
    const bad = { u04: { lectura: [{ ...mc(1), options: ["a", "a", "b"], text: "" }], escucha: [], gramatica: [{ type: "fill", prompt: "sin hueco", answers: [], why: "x" }] } } as unknown as Pruebas;
    expect(validatePruebas(bad).length).toBeGreaterThanOrEqual(3);
    expect(validatePruebas(reserve(["u04"]))).toEqual([]);
  });
  it("hay reserva si hay lectura, escucha y gramática (de la parte, si se pide)", () => {
    const p = reserve(["u04"]);
    expect(hasReserve(p, "u04")).toBe(true);
    expect(hasReserve(p, "u05")).toBe(false);
    p.u04.lectura = p.u04.lectura.map((x) => ({ ...x, part: "B" as const }));
    expect(hasReserve(p, "u04", "A")).toBe(false);
    expect(hasReserve(p, "u04", "B")).toBe(true);
  });
});

describe("mini-prueba", () => {
  const fallback: TestItem[] = exercisesOf("u04").slice(0, 8).map((e) => ({ area: "gramatica", id: e.id, unit: "u04", exercise: e.exercise }));

  it("sin reserva usa solo gramática y avisa de lo que falta", () => {
    const b = miniBattery("u04", "u04", null, 0, {}, srs, fallback);
    expect(b.items).toEqual(fallback);
    expect(b.missing).toEqual(["lectura", "escucha", "vocabulario", "produccion"]);
    expect(b.grammarOnly).toEqual(["u04"]);
  });

  it("con reserva: lectura 3 (todo lo que hay), escucha 3, gramática 6, vocabulario 4, producción 2", () => {
    const b = miniBattery("u04", "u04", null, 0, reserve(["u04"]), srs, fallback);
    expect([count(b.items, "lectura"), count(b.items, "escucha"), count(b.items, "gramatica"), count(b.items, "vocabulario"), count(b.items, "produccion")]).toEqual([3, 3, 6, 4, 2]);
    expect(MINI_TARGET).toEqual({ lectura: 4, escucha: 4, gramatica: 6, vocabulario: 4, produccion: 2 });
    expect(b.missing).toEqual([]);
    expect(new Set(b.items.map((i) => i.id)).size).toBe(b.items.length);
  });

  it("cada intento es otra versión de las partes con más ítems que cupos", () => {
    const p = reserve(["u04"]);
    const ids = (a: number) => miniBattery("u04", "u04", null, a, p, srs, fallback).items.filter((i) => i.area === "gramatica").map((i) => i.id).join();
    expect(ids(0)).not.toBe(ids(1));
  });

  it("vocabulario: primero las tarjetas de menor estabilidad; las demás, de las palabras sin tarjeta", () => {
    let s = emptySrs();
    const now = new Date("2026-11-01T10:00:00Z");
    const words = vocabItems("u04", s, 4, "x");
    expect(words).toHaveLength(4);
    for (const w of words) {
      expect(w.area === "vocabulario" && w.options[w.answer]).toBeTruthy();
      expect(w.area === "vocabulario" && new Set(w.options).size).toBe(3);
    }
    const first = words[0];
    if (first.area !== "vocabulario") throw new Error();
    const itemId = first.id.split(":v:")[1];
    let card = newSrsCard({ kind: "recog", itemId, unit: "u04" }, now);
    s = { ...s, cards: { [card.id]: card } };
    card = rateCard(card, 3, now);
    s = applyReview(s, card, 3, now, 1000);
    expect(vocabItems("u04", s, 4, "x")[0].id).toBe(first.id);
  });
});

describe("prueba de fase y de nivel", () => {
  const units = READY_UNITS.filter((u) => u.phase === 1).map((u) => u.id);

  it("unidad sin reserva = solo gramática (3 por unidad) y aviso; con reserva, las cinco áreas", () => {
    const sin = phaseBattery(units, {}, srs, "s");
    expect(sin.items.every((i) => i.area === "gramatica")).toBe(true);
    expect(sin.grammarOnly).toEqual(units);
    const con = phaseBattery(units, reserve(units), srs, "s");
    for (const a of AREAS) expect(count(con.items, a), a).toBeGreaterThan(0);
    expect(con.grammarOnly).toEqual([]);
    const mixed = phaseBattery(units, reserve([units[0]]), srs, "s");
    expect(mixed.grammarOnly).toEqual(units.slice(1));
  });

  it("prueba de nivel: ≈ 30 ítems, y distinta de la de las fases", () => {
    const all = READY_UNITS.filter((u) => u.n <= 24).map((u) => u.id);
    const sin = levelBattery(all, {}, srs, "level:0");
    expect(sin.items).toHaveLength(24);
    expect(sin.items.every((i) => i.area === "gramatica")).toBe(true);
    const con = levelBattery(all, reserve(all), srs, "level:0");
    expect(con.items.length).toBeGreaterThanOrEqual(26);
    expect(con.items.length).toBeLessThanOrEqual(32);
    expect(con.missing).toEqual([]);
    expect(levelBattery(all, reserve(all), srs, "level:1").items.map((i) => i.id)).not.toEqual(con.items.map((i) => i.id));
  });
});

describe("puntuación por área", () => {
  it("acierto = 1, error = 0, «casi» cuenta, producción 1 / 0,5 / 0", () => {
    const g: TestItem = { area: "gramatica", id: "a", unit: "u04", exercise: { type: "fill", prompt: "Io ___ qui", answers: ["sono"], why: "x" } };
    expect(pointsOf(g, "sono")).toBe(1);
    expect(pointsOf(g, "SONO")).toBe(1);
    expect(pointsOf(g, "stai")).toBe(0);
    const l: TestItem = { area: "lectura", id: "b", unit: "u04", text: "t", q: "q", options: ["a", "b", "c"], answer: 2, why: "w" };
    expect([pointsOf(l, 2), pointsOf(l, 0)]).toEqual([1, 0]);
    const p: TestItem = { area: "produccion", id: "c", unit: "u04", statement: "Puedo…" };
    expect([pointsOf(p, 3), pointsOf(p, 2), pointsOf(p, 1)]).toEqual([1, 0.5, 0]);
  });

  it("suma por área; débil = menos de 70 %", () => {
    const s = scoreAreas([
      { area: "lectura", points: 1 }, { area: "lectura", points: 0 }, { area: "gramatica", points: 1 }, { area: "gramatica", points: 1 },
      { area: "gramatica", points: 1 }, { area: "gramatica", points: 0 },
    ]);
    expect(s.lectura).toEqual({ correct: 1, total: 2 });
    expect(totalOf(s)).toEqual({ correct: 4, total: 6 });
    expect(weakAreas(s)).toEqual(["lectura"]);
    expect(weakAreas({ gramatica: { correct: 7, total: 10 } })).toEqual([]);
    expect(weakAreas({})).toEqual([]);
  });
});

describe("registro de actividad: minutos", () => {
  it("lee la unidad y el bloque de la clave, también en semanas A/B", () => {
    expect(parseBlockKey("u02#A.d3.varied")).toEqual({ unit: "u02", activity: "varied" });
    expect(parseBlockKey("u04.d5.text")).toEqual({ unit: "u04", activity: "text" });
    expect(parseBlockKey("x")).toBeNull();
  });
  it("suma por bloque y día, con tope de 30 min, y recorta a 2000", () => {
    const s = new Store();
    addMinutes(s, "2026-11-01", "u04", "lesson", 4.04);
    addMinutes(s, "2026-11-01", "u04", "lesson", 3);
    addMinutes(s, "2026-11-02", "u04", "lesson", 1);
    expect(loadLog(s).map((e) => e.minutes)).toEqual([7, 1]);
    addMinutes(s, "2026-11-01", "u04", "lesson", 500);
    expect(loadLog(s)[0].minutes).toBe(MINUTES_CAP);
    addMinutes(s, "2026-11-01", "u04", "lesson", 0);
    expect(loadLog(s)).toHaveLength(2);
    s.setItem(LOG_KEY, JSON.stringify(Array.from({ length: 2000 }, (_, i) => ({ date: "2026-11-03", unit: "u04", activity: `b${i}`, minutes: 1 }))));
    addMinutes(s, "2026-11-04", "u04", "nuevo", 1);
    expect(loadLog(s)).toHaveLength(2000);
    expect(loadLog(s).at(-1)!.activity).toBe("nuevo");
  });
  it("las pruebas de nivel viajan en la copia y se borran con el progreso", () => {
    const s = new Store();
    addLevelTest({ date: "2026-11-01", correct: 20, total: 30, byArea: {} }, s);
    expect(getLevelTests(s)).toHaveLength(1);
    const parsed = parseBackup(JSON.stringify(buildBackup(s)));
    expect(parsed.ok && parsed.ignored).toEqual([]);
    expect(parseBackup(JSON.stringify({ app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: new Date().toISOString(), data: { [KEYS_V2.levelTests]: "{}", [LOG_KEY]: "[]" } })).ok).toBe(false);
    clearProgress(s);
    expect(getLevelTests(s)).toEqual([]);
  });
});

describe("panel", () => {
  const today = new Date("2026-11-10T12:00:00");
  it("minutos por hebra de los últimos 7 días", () => {
    const log = [
      { date: "2026-11-10", unit: "u04", activity: "lesson", minutes: 10 },
      { date: "2026-11-08", unit: "u04", activity: "text", minutes: 5 },
      { date: "2026-11-09", unit: "u04", activity: "shadowing", minutes: 3 },
      { date: "2026-11-01", unit: "u04", activity: "lesson", minutes: 99 },
      { date: "2026-11-10", unit: "u04", activity: "rol", minutes: 0, selfRating: 3 },
    ];
    expect(strandMinutes(log, today)).toEqual({ lengua: 10, input: 5, output: 0, fluidez: 3, medicion: 0 });
    expect(strandOf("roleplay")).toBe("output");
  });
  it("aciertos por área de las pruebas recientes", () => {
    const log = [
      { date: "2026-11-09", unit: "u04", activity: "mini:lectura", minutes: 0, correct: 2, total: 3 },
      { date: "2026-11-05", unit: "u04", activity: "fase1:lectura", minutes: 0, correct: 1, total: 1 },
      { date: "2026-09-01", unit: "u04", activity: "mini:lectura", minutes: 0, correct: 0, total: 5 },
    ];
    expect(areaAccuracy(log, today)).toEqual({ lectura: { correct: 3, total: 4 } });
  });
  it("recuerdo real: no cuenta la primera vez que se ve una tarjeta", () => {
    const at = (d: string) => `${d}T10:00:00.000Z`;
    const srsState = { ...emptySrs(), log: [
      { cardId: "a", at: at("2026-10-01"), rating: 3 as const, ms: 1 },
      { cardId: "a", at: at("2026-11-05"), rating: 3 as const, ms: 1 },
      { cardId: "a", at: at("2026-11-06"), rating: 1 as const, ms: 1 },
      { cardId: "b", at: at("2026-11-06"), rating: 1 as const, ms: 1 },
    ] };
    expect(recallRate(srsState, today)).toEqual({ rate: 0.5, answers: 2 });
    expect(recallRate(emptySrs(), today).rate).toBeNull();
  });
  it("palabras activas = estabilidad ≥ 21 días, una vez por palabra", () => {
    const now = new Date();
    const mk = (kind: "recog" | "prod", itemId: string, stability: number) => {
      const c = newSrsCard({ kind, itemId, unit: "u04" }, now);
      return { ...c, fsrs: { ...c.fsrs, stability } };
    };
    const cards = [mk("recog", "u04:a", 30), mk("prod", "u04:a", 40), mk("recog", "u04:b", 20.9), mk("recog", "u04:c", 21)];
    expect(activeWords({ ...emptySrs(), cards: Object.fromEntries(cards.map((c) => [c.id, c])) })).toBe(2);
  });
  it("días estudiados y refuerzo de la fase siguiente", () => {
    const d = studiedDays({ "2026-11-10": { x: true }, "2026-11-09": { x: false } }, today, 3);
    expect(d.map((x) => x.studied)).toEqual([false, false, true]);
    const tests = { "1": [{ date: "x", correct: 5, total: 10, byTopic: {}, byArea: { lectura: { correct: 1, total: 4 }, gramatica: { correct: 9, total: 10 } } }] };
    expect(reinforcementAreas(tests, 2)).toEqual(["lectura"]);
    expect(reinforcementAreas(tests, 1)).toEqual([]);
    expect(reinforcementAreas({ "1": [{ date: "x", correct: 1, total: 2, byTopic: {} }] }, 2)).toEqual([]);
  });
  it("todos los bloques del ciclo tienen hebra", () => {
    const ids = new Set(COURSE.flatMap((st) => [...daysOf(st), ...remedialDays(st, 2)].flatMap((d) => d.blocks.map((b) => b.id))));
    for (const id of ids) expect(strandOf(id), id).not.toBeNull();
  });
});
