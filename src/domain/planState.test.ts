import { describe, expect, it } from "vitest";
import { parseISODate } from "./dates";
import { activitiesForDate, planStateForDate, resolveResources } from "./planState";

const start = parseISODate("2026-09-14"); // lunes

describe("planStateForDate", () => {
  it("día 1 = semana 1, fase 1", () => {
    const s = planStateForDate(start, parseISODate("2026-09-14"));
    expect([s.dayNumber, s.weekNumber, s.phase.id, s.notStarted, s.finished]).toEqual([1, 1, 1, false, false]);
  });

  it("día 29 = semana 5, fase 2", () => {
    const s = planStateForDate(start, parseISODate("2026-10-12"));
    expect([s.dayNumber, s.weekNumber, s.phase.id]).toEqual([29, 5, 2]);
  });

  it("día 84 es el último; el 85 ya terminó", () => {
    expect(planStateForDate(start, parseISODate("2026-12-06")).finished).toBe(false);
    const after = planStateForDate(start, parseISODate("2026-12-07"));
    expect(after.finished).toBe(true);
    expect(after.weekNumber).toBe(12);
  });

  it("antes de la fecha de inicio todavía no empezó", () => {
    expect(planStateForDate(start, parseISODate("2026-09-13")).notStarted).toBe(true);
  });
});

describe("activitiesForDate", () => {
  it("el lunes lleva pronunciación y shadowing", () => {
    const ids = activitiesForDate(parseISODate("2026-09-14"), 1).map((a) => a.id);
    expect(ids).toEqual(["quizlet", "pronunciation", "input", "shadowing"]);
  });

  it("martes lección y jueves práctica", () => {
    expect(activitiesForDate(parseISODate("2026-09-15"), 1).map((a) => a.id)).toEqual(["quizlet", "grammar"]);
    expect(activitiesForDate(parseISODate("2026-09-17"), 1).map((a) => a.id)).toEqual(["quizlet", "grammar_practice"]);
  });

  it("el fin de semana normal tiene repaso mixto; en checkpoint lo reemplaza el test", () => {
    const sat = parseISODate("2026-09-19");
    expect(activitiesForDate(sat, 3).map((a) => a.id)).toContain("grammar_review");
    const ids4 = activitiesForDate(sat, 4).map((a) => a.id);
    expect(ids4).toContain("phase_test");
    expect(ids4).not.toContain("grammar_review");
  });

  it("los días de semana no cambian en semana de checkpoint", () => {
    expect(activitiesForDate(parseISODate("2026-09-14"), 4).map((a) => a.id)).not.toContain("phase_test");
  });
});

describe("resolveResources", () => {
  const input = activitiesForDate(parseISODate("2026-09-14"), 1).find((a) => a.id === "input")!;
  it("input cambia por fase", () => {
    expect(resolveResources(input, 1).map((r) => r.name)).toEqual(["Coffee Break Italian"]);
    expect(resolveResources(input, 2).map((r) => r.name)).toEqual(["Podcast Italiano Principiante"]);
    expect(resolveResources(input, 3).map((r) => r.name)).toEqual(["Escuchar — Podcast Italiano", "Ver transcripción"]);
  });

  it("Quizlet muestra dos botones", () => {
    const q = activitiesForDate(parseISODate("2026-09-14"), 1)[0];
    expect(resolveResources(q, 1)).toHaveLength(2);
  });
});
