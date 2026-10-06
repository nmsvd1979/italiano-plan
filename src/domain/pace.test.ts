import { describe, expect, it } from "vitest";
import { Progress, buildSteps } from "./curriculum";
import { diffInDays, parseISODate, toISODate, addDays } from "./dates";
import { paceOf, sessionRefs } from "./pace";
import type { Completions } from "./storage";

const steps = buildSteps();
const sessions = sessionRefs(steps);
const start = parseISODate("2026-10-01");

function progressOf(keys: string[], startUnit = 1): Progress {
  return { done: new Set(keys), skipped: new Set(), startUnit };
}

/** Marca esas claves en una fecha. */
function marked(entries: [string, string[]][]): Completions {
  const c: Completions = {};
  for (const [iso, keys] of entries) c[iso] = Object.fromEntries(keys.map((k) => [k, true]));
  return c;
}

const run = (today: string, doneKeys: string[], completions: Completions = {}, extra: { startUnit?: number; spw?: number } = {}) =>
  paceOf({
    steps, progress: progressOf(doneKeys, extra.startUnit), completions, start,
    today: parseISODate(today), sessionsPerWeek: extra.spw ?? 6,
  });

describe("ritmo", () => {
  it("el primer día, sin haber hecho nada, estás al día", () => {
    expect(run("2026-10-01", []).status).toBe("ontrack");
  });

  it("la primera sesión no te marca como adelantada", () => {
    expect(run("2026-10-01", sessions[0].keys).status).toBe("ontrack");
  });

  it("tras dos semanas sin estudiar vas detrás por unas 12 sesiones", () => {
    const pace = run("2026-10-15", []);
    expect(pace.status).toBe("behind");
    expect(pace.sessions).toBe(12);
  });

  it("faltar ayer te deja una sesión detrás", () => {
    const pace = run("2026-10-02", []);
    expect(pace.status).toBe("behind");
    expect(pace.sessions).toBe(1);
  });

  it("si te adelantas varias sesiones en un día, lo dice", () => {
    const pace = run("2026-10-01", sessions.slice(0, 4).flatMap((s) => s.keys));
    expect(pace.status).toBe("ahead");
    expect(pace.sessions).toBe(4);
  });

  it("una sesión a medias no cuenta como hecha", () => {
    const pace = run("2026-10-08", sessions[0].keys.slice(0, -1));
    expect(pace.sessionsDone).toBe(0);
  });

  it("menos sesiones por semana relaja el ritmo esperado", () => {
    const strict = run("2026-10-15", [], {}, { spw: 7 });
    const relaxed = run("2026-10-15", [], {}, { spw: 3 });
    expect(relaxed.sessions).toBeLessThan(strict.sessions);
  });

  it("empezar desde la unidad 4 deja fuera las sesiones anteriores", () => {
    const all = run("2026-10-01", []);
    const late = run("2026-10-01", [], {}, { startUnit: 4 });
    expect(late.sessionsTotal).toBe(all.sessionsTotal - sessions.filter((s) => s.unit.n < 4).length);
    expect(late.remainingMinutes).toBeLessThan(all.remainingMinutes);
  });
});

describe("fecha estimada de fin", () => {
  it("sin historial usa el ritmo que elegiste", () => {
    const pace = run("2026-10-01", []);
    expect(pace.endDate).not.toBeNull();
    const days = diffInDays(pace.endDate!, parseISODate("2026-10-01"));
    expect(days).toBeGreaterThan(60);
    expect(days).toBeLessThan(140);
  });

  it("si estudias más que lo planeado, la fecha se acerca; si dejas de estudiar, se aleja", () => {
    const today = "2026-10-15";
    const heavy: Completions = {};
    const light: Completions = {};
    const keys = steps.map((s) => s.key);
    // Pesado: 14 días con ~90 min. Liviano: un solo paso.
    for (let i = 0; i < 14; i++) {
      const iso = toISODate(addDays(parseISODate(today), -i));
      heavy[iso] = Object.fromEntries(keys.slice(i * 6, i * 6 + 6).map((k) => [k, true]));
    }
    light[today] = { [keys[0]]: true };
    const fast = run(today, keys.slice(0, 84), heavy);
    const slow = run(today, keys.slice(0, 1), light);
    expect(diffInDays(fast.endDate!, parseISODate(today))).toBeLessThan(diffInDays(slow.endDate!, parseISODate(today)));
  });

  it("el piso de 3 sesiones por semana evita proyecciones infinitas", () => {
    const pace = run("2026-10-15", [], marked([["2026-10-15", [steps[0].key]]]));
    expect(pace.endDate).not.toBeNull();
    expect(diffInDays(pace.endDate!, parseISODate("2026-10-15"))).toBeLessThan(400);
  });

  it("terminado no hay fecha", () => {
    expect(run("2026-10-15", steps.map((s) => s.key)).endDate).toBeNull();
  });
});
