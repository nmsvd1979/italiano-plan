import { describe, expect, it } from "vitest";
import { COURSE } from "../content/course";
import { PASS_LEVEL, WEAK_AREA } from "./evaluation";
import { B1_PASS } from "./practicaB1";
import { BRIDGE_UNITS, RECALL_MIN_ANSWERS, readyB1, type ReadyInput } from "./readyB1";
import { emptySrs } from "./srs";

const today = new Date(2026, 10, 9);
const empty = (): ReadyInput => ({ levelTests: [], mini: {}, srs: emptySrs(), log: [], b1: {}, b1Ids: { lectura: ["b1-1", "b1-2", "b1-3"], escucha: ["b1-1", "b1-2", "b1-3"] }, writingDone: [], today });
const area = (c: number, t: number) => ({ correct: c, total: t });
const test = (date: string, c: number, t = 28, byArea: Record<string, { correct: number; total: number }> = { lectura: area(5, 6), gramatica: area(9, 10) }) => ({ date, correct: c, total: t, byArea });
const state = (i: ReadyInput, id: string) => readyB1(i).lights.find((l) => l.id === id)!.state;
const core = COURSE.filter((s) => s.kind === "core").map((s) => s.id);
const att = (passed: boolean) => [{ date: "2026-11-01", correct: passed ? 9 : 5, total: 10, passed }];

/** Un recuerdo con `n` respuestas repetidas (la primera de cada tarjeta no cuenta) y proporción `ok` de aciertos. */
function srsWith(n: number, ok: number) {
  const srs = emptySrs();
  const at = new Date(2026, 10, 5).getTime();
  srs.log.push({ cardId: "a", rating: 3, at } as never);
  for (let k = 0; k < n; k++) srs.log.push({ cardId: "a", rating: k < n * ok ? 3 : 1, at } as never);
  return srs;
}

describe("readyB1", () => {
  it("sin datos: seis luces «sin datos» y no listo", () => {
    const r = readyB1(empty());
    expect(r.lights).toHaveLength(6);
    expect(r.lights.every((l) => l.state === "sin")).toBe(true);
    expect(r.ready).toBe(false);
  });

  it("A2 firme pide dos días distintos con el umbral de la prueba (el mismo día no cuenta dos veces)", () => {
    const ok = Math.ceil(28 * PASS_LEVEL);
    expect(state({ ...empty(), levelTests: [test("2026-11-01", ok), test("2026-11-01", ok)] }, "a2")).toBe("ambar");
    expect(state({ ...empty(), levelTests: [test("2026-11-01", ok), test("2026-11-02", ok)] }, "a2")).toBe("verde");
    expect(state({ ...empty(), levelTests: [test("2026-11-01", ok), test("2026-11-02", 10)] }, "a2")).toBe("ambar");
  });

  it("A2 firme: un área bajo el 70 % en el último intento lo deja en camino, y la producción no cuenta", () => {
    const ok = Math.ceil(28 * PASS_LEVEL);
    const weak = { lectura: area(Math.floor(6 * WEAK_AREA) - 1, 6) };
    expect(state({ ...empty(), levelTests: [test("2026-11-01", ok), test("2026-11-02", ok, 28, weak)] }, "a2")).toBe("ambar");
    expect(state({ ...empty(), levelTests: [test("2026-11-01", ok), test("2026-11-02", ok, 28, { lectura: area(5, 6), produccion: area(0, 2) })] }, "a2")).toBe("verde");
  });

  it("regularidad: ≥ 3 de las últimas 4 semanas aprobadas a la primera; con menos de 4 semanas, sin datos", () => {
    const mini = (n: number, firstOk: number) => Object.fromEntries(core.slice(0, n).map((id, k) => [id, att(k < firstOk)]));
    expect(state({ ...empty(), mini: mini(3, 3) }, "regularidad")).toBe("sin");
    expect(state({ ...empty(), mini: mini(4, 3) }, "regularidad")).toBe("verde");
    expect(state({ ...empty(), mini: mini(4, 2) }, "regularidad")).toBe("ambar");
  });

  it("memoria: pide respuestas suficientes y ≥ 80 % de recuerdo", () => {
    expect(state({ ...empty(), srs: srsWith(RECALL_MIN_ANSWERS - 1, 1) }, "memoria")).toBe("sin");
    expect(state({ ...empty(), srs: srsWith(RECALL_MIN_ANSWERS, 0.9) }, "memoria")).toBe("verde");
    expect(state({ ...empty(), srs: srsWith(RECALL_MIN_ANSWERS, 0.5) }, "memoria")).toBe("ambar");
  });

  it("puente: tres mini-pruebas aprobadas (cualquier intento)", () => {
    const m = (ps: boolean[]) => Object.fromEntries(BRIDGE_UNITS.slice(0, ps.length).map((u, k) => [u, att(ps[k])]));
    expect(state({ ...empty(), mini: m([true, true]) }, "puente")).toBe("ambar");
    expect(state({ ...empty(), mini: m([true, true, true]) }, "puente")).toBe("verde");
    expect(state({ ...empty(), mini: { u21: [...att(false), ...att(true)], u22: att(true), u23: att(true) } }, "puente")).toBe("verde");
  });

  it("largas: con menos de 12 preguntas por tipo no puede ser verde; con 12 y ≥ 75 % sí", () => {
    const r = (kind: string, id: string, c: number) => [`${kind}:${id}`, { correct: c, total: 4, date: "2026-11-09", best: c }] as const;
    const one = Object.fromEntries([r("lectura", "b1-1", 4), r("escucha", "b1-1", 4)]);
    expect(state({ ...empty(), b1: one }, "largas")).toBe("ambar");
    const all = Object.fromEntries(["b1-1", "b1-2", "b1-3"].flatMap((id) => [r("lectura", id, 3), r("escucha", id, 3)]));
    expect(3 / 4).toBeGreaterThanOrEqual(B1_PASS);
    expect(state({ ...empty(), b1: all }, "largas")).toBe("verde");
    const bad = Object.fromEntries(["b1-1", "b1-2", "b1-3"].flatMap((id) => [r("lectura", id, 3), r("escucha", id, 2)]));
    expect(state({ ...empty(), b1: bad }, "largas")).toBe("ambar");
  });

  it("producción: tres textos ampliados y tres monólogos con todos los puntos marcados", () => {
    const mono = (u: string, c: number) => ({ date: "2026-11-09", unit: u, activity: "monologo", minutes: 0, correct: c, total: 4 });
    const log = BRIDGE_UNITS.map((u) => mono(u, 4));
    expect(state({ ...empty(), writingDone: [...BRIDGE_UNITS], log }, "produccion")).toBe("verde");
    expect(state({ ...empty(), writingDone: [...BRIDGE_UNITS], log: [mono("u21", 4), mono("u22", 4), mono("u23", 3)] }, "produccion")).toBe("ambar");
    expect(state({ ...empty(), writingDone: ["u21"] }, "produccion")).toBe("ambar");
  });

  it("una sola luz que no sea verde basta para no estar listo; con las seis verdes sí", () => {
    const ok = Math.ceil(28 * PASS_LEVEL);
    const r = (kind: string, id: string) => [`${kind}:${id}`, { correct: 3, total: 4, date: "2026-11-09", best: 3 }] as const;
    const full: ReadyInput = {
      ...empty(),
      levelTests: [test("2026-11-01", ok), test("2026-11-02", ok)],
      mini: { ...Object.fromEntries(core.slice(0, 4).map((id) => [id, att(true)])), ...Object.fromEntries(BRIDGE_UNITS.map((u) => [u, att(true)])) },
      srs: srsWith(RECALL_MIN_ANSWERS, 1),
      b1: Object.fromEntries(["b1-1", "b1-2", "b1-3"].flatMap((id) => [r("lectura", id), r("escucha", id)])),
      writingDone: [...BRIDGE_UNITS],
      log: BRIDGE_UNITS.map((u) => ({ date: "2026-11-09", unit: u, activity: "monologo", minutes: 0, correct: 3, total: 3 })),
    };
    expect(readyB1(full).ready).toBe(true);
    expect(readyB1({ ...full, writingDone: ["u21", "u22"] }).ready).toBe(false);
  });
});
