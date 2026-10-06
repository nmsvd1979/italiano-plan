import { describe, expect, it } from "vitest";
import { Progress, buildSteps, isFinished, isOffered, pendingSteps, planDay, requiresOf } from "./curriculum";
import { addDays, parseISODate, toISODate } from "./dates";
import { rng } from "./review";
import type { Completions } from "./storage";

const steps = buildSteps();
const byKey = new Map(steps.map((s) => [s.key, s]));

interface Run {
  marks: string[];
  completions: Completions;
  days: number;
  finishedOn: number | null;
}

/** Un estudiante con conductas al azar: salta días, cambia el tiempo, corta a medias, deja cosas para después. */
function simulate(seed: string, days: number): Run {
  const rand = rng(seed);
  const done = new Set<string>();
  const skipped = new Set<string>();
  const marks: string[] = [];
  const completions: Completions = {};
  const start = parseISODate("2026-10-01");
  let finishedOn: number | null = null;

  const progress = (): Progress => ({ done, skipped, startUnit: 1 });
  const mark = (key: string, iso: string) => {
    const step = byKey.get(key)!;
    // Invariante: solo se marca lo que se ofrece (nunca repetido, nunca antes de su lección).
    expect(done.has(key), `repetido: ${key}`).toBe(false);
    expect(isOffered(step, steps, { done, skipped: new Set(), startUnit: 1 }), `no ofrecido: ${key}`).toBe(true);
    done.add(key);
    skipped.delete(key);
    marks.push(key);
    (completions[iso] ??= {})[key] = true;
  };

  for (let d = 0; d < days && finishedOn === null; d++) {
    const iso = toISODate(addDays(start, d));
    const r = rand();
    if (r < 0.3) continue; // día sin estudiar
    const budget = [15, 30, 60, 90][Math.floor(rand() * 4)];
    const doneToday = new Set<string>();
    const plan = planDay(steps, progress(), doneToday, budget);

    for (const { step } of plan.items) {
      const x = rand();
      if (x < 0.1) break; // se cortó el día
      if (x < 0.18) { skipped.add(step.key); continue; } // lo dejó para después
      mark(step.key, iso);
      doneToday.add(step.key);
    }

    // Algunos días se adelanta y suma lo que sigue.
    if (rand() < 0.15) {
      const more = planDay(steps, progress(), doneToday, budget + 60);
      for (const { step, done: already } of more.items) {
        if (!already && !doneToday.has(step.key)) { mark(step.key, iso); doneToday.add(step.key); }
      }
    }

    // Pendientes: a veces los retoma; si no queda nada más por ofrecer, los retoma sí o sí.
    const nothingElse = planDay(steps, progress(), new Set(), 15).items.length === 0;
    if (rand() < 0.3 || nothingElse) {
      for (const step of pendingSteps(steps, progress())) {
        if (requiresOf(step, steps).every((k) => done.has(k))) mark(step.key, iso);
      }
    }
    if (isFinished(steps, progress())) finishedOn = d;
  }
  return { marks, completions, days, finishedOn };
}

describe("simulación de 300 días con conducta aleatoria", () => {
  for (const seed of ["a", "b", "c", "d", "e", "f", "g", "h"]) {
    it(`semilla ${seed}: nunca repite ni salta contenido, llega al final y respeta el orden`, () => {
      const run = simulate(seed, 300);
      expect(run.finishedOn, "no llegó al final en 300 días").not.toBeNull();
      expect(new Set(run.marks).size).toBe(steps.length);
      expect(run.marks.length).toBe(steps.length);

      const at = new Map(run.marks.map((k, i) => [k, i]));
      for (const s of steps) {
        for (const req of requiresOf(s, steps)) {
          expect(at.get(req)!, `${s.key} antes de ${req}`).toBeLessThan(at.get(s.key)!);
        }
      }
    });
  }

  it("un día de 90 minutos avanza más que uno de 15, y siempre se puede seguir", () => {
    const p: Progress = { done: new Set(), skipped: new Set(), startUnit: 1 };
    const short = planDay(steps, p, new Set(), 15);
    const long = planDay(steps, p, new Set(), 90);
    expect(long.items.length).toBeGreaterThan(short.items.length);
    expect(long.items.slice(0, short.items.length).map((i) => i.step.key)).toEqual(short.items.map((i) => i.step.key));
  });
});
