import { describe, expect, it } from "vitest";
import { UNITS, getUnit, sessionsOf } from "../content/curriculum";
import {
  Progress, buildSteps, currentUnit, episodeNumber, isFinished, nextSteps, pendingSteps, planDay, requiresOf,
  unitProgress,
} from "./curriculum";

const steps = buildSteps();
const none = (): Progress => ({ done: new Set(), skipped: new Set(), startUnit: 1 });
const withDone = (keys: Iterable<string>, extra: Partial<Progress> = {}): Progress => ({ ...none(), done: new Set(keys), ...extra });
const keyOf = (unit: string, session: number, id: string) => `${unit}.s${session}.${id}`;

/** Marca como hecho todo lo que va antes de un paso. */
const doneBefore = (key: string) => steps.slice(0, steps.findIndex((s) => s.key === key)).map((s) => s.key);

describe("currículo", () => {
  it("24 unidades en 6 fases de 4; el test de fase va en las unidades 4, 8, 12, 16, 20 y 24", () => {
    expect(UNITS).toHaveLength(24);
    expect(UNITS.map((u) => u.n)).toEqual(Array.from({ length: 24 }, (_, i) => i + 1));
    for (const u of UNITS) expect(u.phase).toBe(Math.ceil(u.n / 4));
    expect(UNITS.filter((u) => u.checkpoint).map((u) => u.n)).toEqual([4, 8, 12, 16, 20, 24]);
  });

  it("cada unidad tiene 6 sesiones y la última lleva repaso mixto o test, nunca ambos", () => {
    for (const u of UNITS) {
      const sessions = sessionsOf(u);
      expect(sessions.map((s) => s.index)).toEqual([1, 2, 3, 4, 5, 6]);
      const last = sessions[5].activities.map((a) => a.id);
      expect(last.includes(u.checkpoint ? "test" : "review")).toBe(true);
      expect(last.includes(u.checkpoint ? "review" : "test")).toBe(false);
    }
  });

  it("solo hay pasos de unidades con contenido, con claves únicas", () => {
    const ready = new Set(UNITS.filter((u) => u.ready).map((u) => u.id));
    expect(steps.every((s) => ready.has(s.unit.id))).toBe(true);
    expect(new Set(steps.map((s) => s.key)).size).toBe(steps.length);
  });

  it("una unidad en curso nunca queda con la unidad siguiente a medio camino por delante", () => {
    const order = steps.map((s) => s.unit.n);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });
});

describe("qué toca", () => {
  it("al empezar, lo primero es la sesión 1 de la unidad 1", () => {
    expect(nextSteps(steps, none())[0].key).toBe("u01.s1.quizlet");
  });

  it("la práctica y el repaso no se ofrecen antes de la lección de su unidad", () => {
    const upToPractice = doneBefore(keyOf("u01", 4, "practice"));
    const withoutLesson = upToPractice.filter((k) => k !== keyOf("u01", 2, "lesson"));
    const offered = nextSteps(steps, withDone(withoutLesson)).map((s) => s.key);
    expect(offered).not.toContain(keyOf("u01", 4, "practice"));
    expect(offered).toContain(keyOf("u01", 2, "lesson"));
    expect(nextSteps(steps, withDone(upToPractice)).map((s) => s.key)).toContain(keyOf("u01", 4, "practice"));
  });

  it("el test de fase espera a todas las lecciones de su fase", () => {
    const test = steps.find((s) => s.activity.id === "test")!;
    const lessons = requiresOf(test, steps);
    expect(lessons.length).toBeGreaterThan(1);
    expect(lessons.every((k) => k.endsWith(".s2.lesson") && steps.find((s) => s.key === k)!.unit.phase === test.unit.phase)).toBe(true);
    const all = doneBefore(test.key);
    expect(nextSteps(steps, withDone(all)).map((s) => s.key)).toContain(test.key);
    expect(nextSteps(steps, withDone(all.filter((k) => k !== lessons[0]))).map((s) => s.key)).not.toContain(test.key);
  });

  it("faltar no cambia nada: sin marcas nuevas, lo que toca es lo mismo", () => {
    const p = withDone(doneBefore(keyOf("u02", 3, "pron")));
    expect(nextSteps(steps, p)[0].key).toBe(keyOf("u02", 3, "pron"));
    expect(nextSteps(steps, p)[0].key).toBe(nextSteps(steps, p)[0].key);
  });

  it("lo que dejas para después sale del flujo y pasa a pendientes; lo siguiente se ofrece", () => {
    const p = withDone(doneBefore(keyOf("u01", 1, "input")), { skipped: new Set([keyOf("u01", 1, "input")]) });
    expect(nextSteps(steps, p)[0].key).toBe(keyOf("u01", 1, "shadow"));
    expect(pendingSteps(steps, p).map((s) => s.key)).toEqual([keyOf("u01", 1, "input")]);
  });

  it("dejar la lección para después deja sin ofrecer su práctica y su repaso", () => {
    const skipped = new Set([keyOf("u01", 2, "lesson")]);
    const p = withDone(doneBefore(keyOf("u01", 6, "review")).filter((k) => k !== keyOf("u01", 2, "lesson")), { skipped });
    expect(nextSteps(steps, p).map((s) => s.key)).not.toContain(keyOf("u01", 4, "practice"));
    expect(nextSteps(steps, p)[0].key).toBe("u02.s1.quizlet");
  });

  it("empezar desde la unidad N da por hechas las anteriores", () => {
    const p = { ...none(), startUnit: 4 };
    expect(nextSteps(steps, p)[0].unit.n).toBe(4);
    expect(currentUnit(steps, p)?.n).toBe(4);
    expect(unitProgress(getUnit("u02")!, steps, p).done).toBe(unitProgress(getUnit("u02")!, steps, p).total);
  });

  it("al terminar todo no queda nada y se declara terminado", () => {
    const p = withDone(steps.map((s) => s.key));
    expect(nextSteps(steps, p)).toEqual([]);
    expect(isFinished(steps, p)).toBe(true);
    expect(isFinished(steps, none())).toBe(false);
  });
});

describe("armar el día", () => {
  const minutes = (list: { step: { activity: { minutes: number } } }[]) => list.reduce((n, i) => n + i.step.activity.minutes, 0);

  it("siempre incluye lo próximo y no se pasa de forma absurda", () => {
    for (const budget of [15, 30, 60, 90]) {
      const day = planDay(steps, none(), new Set(), budget);
      expect(day.items.length).toBeGreaterThan(0);
      expect(day.items[0].step.key).toBe("u01.s1.quizlet");
      expect(minutes(day.items)).toBeLessThanOrEqual(budget + 15);
    }
  });

  it("más tiempo, más actividades, siempre en orden de currículo", () => {
    const sizes = [15, 30, 60, 90].map((b) => planDay(steps, none(), new Set(), b).items.length);
    expect(sizes).toEqual([...sizes].sort((a, b) => a - b));
    expect(sizes[3]).toBeGreaterThan(sizes[0]);
    const orders = planDay(steps, none(), new Set(), 90).items.map((i) => i.step.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it("con un presupuesto muy corto igual ofrece una actividad", () => {
    expect(planDay(steps, none(), new Set(), 1).items).toHaveLength(1);
  });

  it("lo hecho hoy cuenta contra el tiempo y la lista no cambia mientras avanzas", () => {
    const before = planDay(steps, none(), new Set(), 30).items.map((i) => i.step.key);
    const first = before[0];
    const after = planDay(steps, withDone([first]), new Set([first]), 30);
    expect(after.items.map((i) => i.step.key)).toEqual(before);
    expect(after.items[0].done).toBe(true);
  });

  it("al completar el tiempo de hoy muestra qué sigue, sin tope", () => {
    const day1 = planDay(steps, none(), new Set(), 30);
    const keys = day1.items.map((i) => i.step.key);
    const done = planDay(steps, withDone(keys), new Set(keys), 30);
    expect(done.items.every((i) => i.done)).toBe(true);
    expect(done.ahead.length).toBeGreaterThan(0);
    expect(keys).not.toContain(done.ahead[0].key);
  });

  it("si lo único pendiente depende de algo que dejaste para después, lo avisa", () => {
    const lesson = keyOf("u15", 2, "lesson");
    const blocked = [lesson, keyOf("u15", 4, "practice"), keyOf("u15", 6, "review")];
    const all = steps.map((s) => s.key).filter((k) => !blocked.includes(k));
    const p = withDone(all, { skipped: new Set([lesson]) });
    const day = planDay(steps, p, new Set(), 30);
    expect(day.blocked).toBe(true);
  });
});

describe("input guiado", () => {
  it("numera los episodios en orden dentro de cada podcast", () => {
    const inputs = steps.filter((s) => s.activity.kind === "input");
    const first = inputs.filter((s) => s.unit.phase <= 2);
    expect(first.map((s) => episodeNumber(s, steps))).toEqual(first.map((_, i) => i + 1));
    expect(episodeNumber(steps[0], steps)).toBeNull();
  });
});
