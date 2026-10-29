import { describe, expect, it } from "vitest";
import { COURSE } from "../content/course";
import { UNITS, getUnit, sessionsOf } from "../content/curriculum";
import { exercisesOf, findExercise } from "../content/grammar";
import { getDictation } from "../content/dictation";
import { AVANCE_INICIAL } from "../content/avance-inicial";
import { buildBackup, parseBackup, restoreBackup, LAST_BACKUP_KEY, type EnumerableKV } from "./backup";
import {
  CATCHUP_MAX_MINUTES, DIAGNOSTIC_SIZE, backupRecent, catchupItems, courseWithContinuity, diagnosticItems, diagnosticSessions,
  loadContinuity, markCatchup, markDirected, nextCatchup, overlayOf, phaseTestPassed, recordDiagnostic, scoreDiagnostic,
  setPostponed, setUsePrevious, skipDiagnostic, startHere, startingPoint, verdictOf, viewsOf, marksOf, type ContinuityState,
} from "./continuity";
import { applySeedReview, planSeed, SEED_PER_DAY, SEED_WINDOW_DAYS } from "./continuitySeed";
import { compressedDays, currentSlot, orderedSteps, weekComplete, daysOf, type CourseProgress } from "./cycle";
import { toISODate } from "./dates";
import { doneKeys } from "./progress";
import { applySeed } from "./seed";
import { dayOf, loadSrs, saveSrs, seedSrsCard, unlockProdCards, rateCard, newSrsCard } from "./srs";
import { wordsOfUnit } from "./srsDeck";
import {
  KEYS, KEYS_V2, SRS_KEY, getCompletions, getMiniTests, getPhaseTests, getStartUnit, type PhaseTests,
} from "./storage";

class FakeStore implements EnumerableKV {
  private map = new Map<string, string>();
  writes: string[] = [];
  get length() { return this.map.size; }
  key(i: number) { return [...this.map.keys()][i] ?? null; }
  getItem(k: string) { return this.map.get(k) ?? null; }
  setItem(k: string, v: string) { this.writes.push(k); this.map.set(k, v); }
  removeItem(k: string) { this.map.delete(k); }
  snapshot() { return Object.fromEntries([...this.map].sort(([a], [b]) => a.localeCompare(b))); }
}

const NOW = new Date(2026, 9, 28, 10, 0, 0);

/**
 * u25–u28 siguen con `ready: false` hasta que el carril de contenido las active. Estas pruebas corren con la bandera real
 * y también "como si ya estuvieran activas", que es como se comportará el plan cuando se fusionen.
 */
function withReady<T>(ids: string[], fn: () => T): T {
  const units = ids.map((id) => getUnit(id)!);
  const before = units.map((u) => u.ready);
  units.forEach((u) => { u.ready = true; });
  try { return fn(); } finally { units.forEach((u, i) => { u.ready = before[i]; }); }
}
const NEW_UNITS = ["u25", "u26", "u27", "u28"];
const firstReadyStep = () => COURSE.find((s) => getUnit(s.unit)?.ready)!.id;
const OLD_KEYS: string[] = Object.values(KEYS);
const oldKeysOf = (snap: Record<string, string>) => Object.fromEntries(Object.entries(snap).filter(([k]) => OLD_KEYS.includes(k)));

/* ───────── respaldos sintéticos (nada de esto es un respaldo real) ───────── */

const legacyKeys = (unitId: string, only?: number[]): string[] =>
  sessionsOf(getUnit(unitId)!).filter((s) => !only || only.includes(s.index)).flatMap((s) => s.activities.map((a) => `${unitId}.s${s.index}.${a.id}`));
const unitIds = (from: number, to: number) => UNITS.filter((u) => u.n >= from && u.n <= to).map((u) => u.id);

function writeMarks(store: FakeStore, keys: string[], date = "2026-10-01") {
  const all = getCompletions(store);
  store.setItem(KEYS.completions, JSON.stringify({ ...all, [date]: { ...(all[date] ?? {}), ...Object.fromEntries(keys.map((k) => [k, true])) } }));
}

function base(): FakeStore {
  const s = new FakeStore();
  s.setItem(KEYS.startDate, "2026-09-01");
  s.setItem(KEYS.settings, JSON.stringify({ reminderTime: "21:00", reminderEnabled: true, theme: "dark", sessionsPerWeek: 5, dailyMinutes: 45, shortMode: false }));
  s.setItem(KEYS.lastNotified, "2026-10-20");
  return s;
}

/** (a) Hasta u04 completo. */
function hastaU04(): FakeStore {
  const s = base();
  writeMarks(s, unitIds(1, 4).flatMap((u) => legacyKeys(u)));
  return s;
}

/** (b) u08 parcial (60 %), repaso lleno, y la prueba de fase 1 aprobada con u04 a medias. */
function u08Parcial(): FakeStore {
  const s = base();
  const u08 = legacyKeys("u08");
  writeMarks(s, [...unitIds(1, 3), ...unitIds(5, 7)].flatMap((u) => legacyKeys(u)));
  writeMarks(s, legacyKeys("u04").slice(0, 9)); // u04 a medias (9 de 22)…
  writeMarks(s, u08.slice(0, Math.round(u08.length * 0.6)));
  s.setItem(KEYS.phaseTests, JSON.stringify({ "1": [{ date: "2026-09-28", correct: 8, total: 10, byTopic: {} }] })); // …pero la prueba de fase 1 aprobada
  const review: Record<string, { box: number; due: string }> = {};
  for (const u of unitIds(1, 8)) {
    exercisesOf(u).slice(0, 4).forEach((e, i) => { review[e.id] = { box: i % 3, due: i % 2 ? "2026-10-20" : "2026-11-04" }; });
  }
  s.setItem(KEYS.review, JSON.stringify(review));
  return s;
}

/** (c) Hasta u16 completo, con textos de escritura. */
function hastaU16(): FakeStore {
  const s = base();
  writeMarks(s, unitIds(1, 16).flatMap((u) => legacyKeys(u)));
  s.setItem(KEYS.writing, JSON.stringify({ u01: "Mi chiamo Nicolás. Sono cileno.", u04: "Vorrei un caffè, per favore.", u09: "Ieri sono andato al mercato." }));
  s.setItem(KEYS.canDo, JSON.stringify({ u01: [0, 1, 2] }));
  s.setItem(KEYS.skipped, JSON.stringify(["u12.s5.dictation"]));
  return s;
}

/** La semilla de u01 (17 de 22), aplicada con el botón. */
function semillaU01(): FakeStore {
  const s = base();
  applySeed(s, NOW);
  return s;
}

const SYNTHETIC: [string, () => FakeStore][] = [["hasta u04", hastaU04], ["u08 parcial con repaso lleno", u08Parcial], ["hasta u16 con textos", hastaU16], ["semilla de u01", semillaU01]];

function load(store: FakeStore) {
  const raw: CourseProgress = { done: doneKeys(getCompletions(store)), startUnit: getStartUnit(store), mini: getMiniTests(store) };
  const tests: PhaseTests = getPhaseTests(store);
  const cont = loadContinuity(store);
  return { raw, tests, cont };
}

const stateOf = (store: FakeStore, id: string) => {
  const { raw, tests } = load(store);
  return marksOf(UNITS.find((u) => u.id === id)!, raw, tests).state;
};

/* ───────── estado de cada unidad desde las marcas ───────── */

describe("estado de cada unidad desde las marcas (14 §3)", () => {
  it("(a) hasta u04: u01–u04 completas y el resto por empezar", () => {
    const s = hastaU04();
    for (const u of unitIds(1, 4)) expect(stateOf(s, u), u).toBe("completa");
    for (const u of unitIds(5, 28)) expect(stateOf(s, u), u).toBe("nueva");
  });

  it("(a) la cola sigue en u05A; con u25 activa, empieza en el hueco u25 comprimido a 3 días y después sigue en u05A", () => {
    const { raw, tests, cont } = load(hastaU04());
    const point = startingPoint(raw, tests, startHere(cont, NOW));
    expect(point.gaps.map((g) => [g.step.id, g.length, g.done])).toEqual([["u25", 3, false]]);
    expect(point.next?.step.id).toBe(getUnit("u25")!.ready ? "u25" : "u05#A");
    withReady(["u25"], () => {
      expect(startingPoint(raw, tests, startHere(cont, NOW)).next?.step.id).toBe("u25");
      // Con u25 hecho, sigue u05A: ningún paso dominado (u01–u04) aparece pendiente.
      const done = new Set(raw.done);
      for (const d of compressedDays(COURSE.find((x) => x.id === "u25")!, 3)) for (const b of d.blocks) done.add(`u25.d${d.day}.${b.id}`);
      const p2 = courseWithContinuity({ ...raw, done, mini: { ...raw.mini, u25: [{ date: "2026-10-28", correct: 8, total: 8, passed: true }] } }, tests, startHere(cont, NOW));
      expect(currentSlot(p2)?.step.id).toBe("u05#A");
    });
  });

  it("(b) u08 parcial, u04 completa por la prueba de fase, y las demás por marcas", () => {
    const s = u08Parcial();
    expect(stateOf(s, "u08")).toBe("parcial");
    expect(stateOf(s, "u04")).toBe("completa");
    const { raw, tests } = load(s);
    const u04 = UNITS.find((u) => u.id === "u04")!;
    expect(marksOf(u04, raw, tests).byPhaseTest).toBe(true);
    expect(phaseTestPassed(UNITS.find((u) => u.id === "u05")!, tests)).toBe(false);
    for (const u of ["u01", "u02", "u03", "u05", "u06", "u07"]) expect(stateOf(s, u), u).toBe("completa");
    expect(stateOf(s, "u09")).toBe("nueva");
  });

  it("(c) hasta u16: 16 unidades completas; u17 en adelante por empezar", () => {
    const s = hastaU16();
    for (const u of unitIds(1, 16)) expect(stateOf(s, u), u).toBe("completa");
    for (const u of unitIds(17, 28)) expect(stateOf(s, u), u).toBe("nueva");
  });

  it("la semilla de u01 (17 de 22 = 77 %) deja u01 parcial, no completa", () => {
    const s = semillaU01();
    const { raw, tests } = load(s);
    const m = marksOf(UNITS.find((u) => u.id === "u01")!, raw, tests);
    expect(m).toMatchObject({ state: "parcial", done: 17, total: 22 });
    expect(m.coverage).toBeCloseTo(17 / 22);
    for (const u of unitIds(2, 28)) expect(stateOf(s, u), u).toBe("nueva");
  });

  it("los umbrales: 30 % es parcial, menos es solo empezada, 85 % es completa", () => {
    const u = UNITS.find((x) => x.id === "u04")!;
    const keys = legacyKeys("u04");
    const at = (n: number) => marksOf(u, { done: new Set(keys.slice(0, n)), startUnit: 1, mini: {} }, {}).state;
    expect(at(0)).toBe("nueva");
    expect(at(1)).toBe("tocada");
    expect(at(Math.ceil(keys.length * 0.3) - 1)).toBe("tocada");
    expect(at(Math.ceil(keys.length * 0.3))).toBe("parcial");
    expect(at(Math.ceil(keys.length * 0.85) - 1)).toBe("parcial");
    expect(at(Math.ceil(keys.length * 0.85))).toBe("completa");
  });

  it("las unidades anteriores a la inicial son omitidas, y una unidad nueva nunca queda omitida", () => {
    const raw: CourseProgress = { done: new Set(), startUnit: 30, mini: {} };
    const states = Object.fromEntries(UNITS.map((u) => [u.id, marksOf(u, raw, {}).state]));
    for (const u of UNITS) expect(states[u.id], u.id).toBe(u.n <= 24 ? "omitida" : "nueva");
    expect(overlayOf(raw, {}, loadContinuity(new FakeStore())).overlay.settled.size).toBe(0);
  });
});

/* ───────── diagnóstico ───────── */

describe("diagnóstico (14 §4)", () => {
  it("casos límite: 74 % repasar, 75 % dominada, 49 % rehacer, 50 % repasar", () => {
    expect(verdictOf(74, 100)).toBe("repasar");
    expect(verdictOf(75, 100)).toBe("dominada");
    expect(verdictOf(49, 100)).toBe("rehacer");
    expect(verdictOf(50, 100)).toBe("repasar");
    expect(verdictOf(6, 8)).toBe("dominada");
    expect(verdictOf(5, 8)).toBe("repasar");
    expect(verdictOf(4, 8)).toBe("repasar");
    expect(verdictOf(3, 8)).toBe("rehacer");
    expect(verdictOf(0, 0)).toBe("repasar");
  });

  it("toma 8 ejercicios del banco de la unidad, mezclando elegir y escribir, y siempre los mismos", () => {
    for (const u of UNITS.filter((x) => x.ready && x.n <= 24 && !x.parts)) {
      const items = diagnosticItems(u.id);
      expect(items, u.id).toHaveLength(DIAGNOSTIC_SIZE);
      expect(new Set(items.map((i) => i.id)).size).toBe(DIAGNOSTIC_SIZE);
      for (const i of items) expect(findExercise(i.id)?.unit).toBe(u.id);
      expect(items.some((i) => i.exercise.type === "choice") && items.some((i) => i.exercise.type === "fill"), u.id).toBe(true);
      expect(diagnosticItems(u.id).map((i) => i.id)).toEqual(items.map((i) => i.id));
    }
  });

  it("en unidades partidas toma 4 de cada semana", () => {
    for (const id of ["u02", "u03", "u05", "u06", "u07", "u14", "u15"]) {
      const items = diagnosticItems(id);
      expect(items.filter((i) => i.part === "A"), id).toHaveLength(4);
      expect(items.filter((i) => i.part === "B"), id).toHaveLength(4);
    }
  });

  it("no repite los ejercicios que ya fallaste y tienes en el repaso", () => {
    const failed = new Set(exercisesOf("u04").slice(0, 6).map((e) => e.id));
    const items = diagnosticItems("u04", failed);
    expect(items).toHaveLength(DIAGNOSTIC_SIZE);
    expect(items.some((i) => failed.has(i.id))).toBe(false);
  });

  it("el puntaje separa las semanas A y B, y guarda lo que fallaste", () => {
    const d = scoreDiagnostic([
      ...["a1", "a2", "a3", "a4"].map((id) => ({ id, part: "A" as const, correct: true })),
      ...["b1", "b2", "b3", "b4"].map((id, i) => ({ id, part: "B" as const, correct: i === 0 })),
    ], "2026-10-28");
    expect(d).toMatchObject({ correct: 5, total: 8, verdict: "repasar", failed: ["b2", "b3", "b4"] });
    expect(d.parts?.A?.verdict).toBe("dominada");
    expect(d.parts?.B?.verdict).toBe("rehacer");
  });

  it("dominada vale para las dos semanas; repasar/rehacer decide cada mitad por separado", () => {
    const { raw, tests, cont } = load(hastaU16());
    const diag = (parts: [number, number], total: [number, number]) =>
      scoreDiagnostic(["A", "B"].flatMap((p, i) => Array.from({ length: total[i] }, (_, k) => ({ id: `${p}${k}`, part: p as "A" | "B", correct: k < parts[i] }))), "2026-10-28");
    const mixed = recordDiagnostic(cont, "u02", diag([4, 0], [4, 4]), NOW); // 4/8 → repasar; A dominada, B rehacer
    const o = overlayOf(raw, tests, mixed).overlay;
    expect(o.settled.has("u02#A")).toBe(true);
    expect(o.redo.has("u02#B")).toBe(true);
    const good = recordDiagnostic(cont, "u03", diag([4, 3], [4, 4]), NOW); // 7/8 → dominada
    const og = overlayOf(raw, tests, good).overlay;
    expect(og.settled.has("u03#A") && og.settled.has("u03#B")).toBe(true);
  });

  it("repartido en hasta 3 sesiones, de lo más reciente a lo más antiguo", () => {
    const { raw, tests, cont } = load(hastaU16());
    const sessions = diagnosticSessions(viewsOf(raw, tests, cont));
    expect(sessions).toHaveLength(3);
    const order = sessions.flatMap((s) => s.units.map((v) => v.unit.n));
    expect(order).toEqual([...order].sort((a, b) => b - a));
    expect(order).toHaveLength(16);
  });

  it("saltar una unidad la deja en repasar", () => {
    const { raw, tests, cont } = load(hastaU04());
    const next = skipDiagnostic(cont, "u03", NOW);
    expect(viewsOf(raw, tests, next).find((v) => v.unit.id === "u03")).toMatchObject({ verdict: "repasar", source: "saltado" });
  });
});

/* ───────── el plan con la continuidad ───────── */

describe("el plan con la continuidad", () => {
  it("sin decisiones la capa no cambia nada del plan", () => {
    for (const [name, make] of SYNTHETIC) {
      const { raw, tests, cont } = load(make());
      const o = overlayOf(raw, tests, cont).overlay;
      expect(o.settled.size + o.redo.size, name).toBe(0);
      const before = currentSlot(raw);
      const after = currentSlot(courseWithContinuity(raw, tests, cont));
      // Los huecos comprimidos (u25) pueden cambiar el largo de la semana, pero no el paso que toca.
      expect(after?.step.id, name).toBe(before?.step.id);
    }
  });

  it("ninguna unidad dominada aparece como pendiente", () => {
    for (const [name, make] of SYNTHETIC) {
      const { raw, tests, cont } = load(make());
      const state = startHere(cont, NOW);
      const course = courseWithContinuity(raw, tests, state);
      const settled = overlayOf(raw, tests, state).overlay.settled;
      for (const id of settled) {
        const step = COURSE.find((s) => s.id === id)!;
        expect(weekComplete(step, course), `${name} ${id}`).toBe(true);
      }
      expect(orderedSteps(course).filter((s) => !weekComplete(s, course)).some((s) => settled.has(s.id)), name).toBe(false);
    }
  });

  it("una unidad por rehacer vuelve a la cola aunque la app anterior la diera por hecha", () => {
    const { raw, tests, cont } = load(hastaU04());
    const bad = scoreDiagnostic(Array.from({ length: 8 }, (_, i) => ({ id: `x${i}`, correct: i < 2 })), "2026-10-28");
    const state = recordDiagnostic(cont, "u04", bad, NOW);
    const course = courseWithContinuity(raw, tests, state);
    const u04 = COURSE.find((s) => s.id === "u04")!;
    expect(weekComplete(u04, courseWithContinuity(raw, tests, cont))).toBe(true);
    expect(weekComplete(u04, course)).toBe(false);
    // Las marcas de la app anterior no se tocaron: solo dejan de contar para esa semana.
    expect(course.done).toBe(raw.done);
  });

  it("al volver al plan anterior se ignora todo, y al volver a usar la capa todo sigue ahí", () => {
    const { raw, tests, cont } = load(hastaU16());
    const dec = startHere(cont, NOW);
    expect(overlayOf(raw, tests, dec).gaps.length).toBeGreaterThan(0);
    const prev = setUsePrevious(dec, true);
    expect(courseWithContinuity(raw, tests, prev)).toBe(raw);
    expect(startingPoint(raw, tests, prev).gaps).toEqual([]);
    expect(prev.decision).toBe("aqui");
    expect(setUsePrevious(prev, false)).toEqual(dec);
  });
});

/* ───────── huecos por cerrar ───────── */

describe("huecos por cerrar (14 §5)", () => {
  it("(c) hasta u16: u25 en 3 días, u26 y u27 en 4, y u28 en preparación", () => {
    const { raw, tests, cont } = load(hastaU16());
    const gaps = overlayOf(raw, tests, startHere(cont, NOW)).gaps;
    expect(gaps.map((g) => [g.step.id, g.length])).toEqual([["u25", 3], ["u26", 4], ["u27", 4], ["u28", 4]]);
    // Una unidad sin contenido figura como hueco "en preparación" y no estorba al plan.
    expect(gaps.map((g) => g.ready)).toEqual(NEW_UNITS.map((id) => getUnit(id)!.ready));
  });

  it("sin pasar su posición no hay huecos, y u25 no se comprime si estás por debajo de u03", () => {
    const s = base();
    writeMarks(s, [...legacyKeys("u01"), ...legacyKeys("u02")]);
    const { raw, tests, cont } = load(s);
    const gaps = overlayOf(raw, tests, startHere(cont, NOW)).gaps;
    expect(gaps.map((g) => [g.step.id, g.length])).toEqual([["u25", 4]]);
    expect(overlayOf(...Object.values(load(semillaU01())) as [CourseProgress, PhaseTests, ContinuityState]).gaps).toEqual([]);
  });

  it("la versión comprimida conserva los números de día y termina con la mini-prueba", () => {
    const step = COURSE.find((s) => s.id === "u26")!;
    expect(compressedDays(step, 4).map((d) => d.day)).toEqual([1, 2, 3, 6, 7]);
    expect(compressedDays(step, 3).map((d) => d.day)).toEqual([1, 2, 3, 7]);
    expect(compressedDays(step, 4).at(-1)!.blocks.map((b) => b.kind)).toEqual(["mini"]);
    const full = daysOf(step).map((d) => d.blocks.map((b) => b.id).join());
    expect(compressedDays(step, 4)[0].blocks.map((b) => b.id).join()).toBe(full[0]);
  });

  it("un hueco se completa con sus días comprimidos y la mini-prueba, y pospuesto espera al final del tramo", () => withReady(["u25", "u26", "u27"], () => {
    const { raw, tests, cont } = load(hastaU16());
    const state = startHere(cont, NOW);
    const course = courseWithContinuity(raw, tests, state);
    expect(orderedSteps(course).find((s) => !weekComplete(s, course))?.id).toBe("u25");
    const held = courseWithContinuity(raw, tests, setPostponed(state, "u25", true));
    const first = orderedSteps(held).find((s) => !weekComplete(s, held))!;
    expect(first.id).toBe("u26");
    // u25 no se pierde: sigue en la lista, después de los demás pendientes de su tramo.
    const ids = orderedSteps(held).map((s) => s.id);
    expect(ids.indexOf("u25")).toBeGreaterThan(ids.indexOf("u26"));
    expect(setPostponed(setPostponed(state, "u25", true), "u25", false).postponedGaps).toEqual([]);

    const u26 = COURSE.find((s) => s.id === "u26")!;
    const done = new Set(raw.done);
    for (const d of compressedDays(u26, 4)) for (const b of d.blocks) if (b.kind !== "mini") done.add(`u26.d${d.day}.${b.id}`);
    const withMarks = courseWithContinuity({ ...raw, done }, tests, state);
    expect(weekComplete(u26, withMarks)).toBe(false);
    const passed = courseWithContinuity({ ...raw, done, mini: { u26: [{ date: "2026-10-28", correct: 8, total: 8, passed: true }] } }, tests, state);
    expect(weekComplete(u26, passed)).toBe(true);
  }));
});

/* ───────── puesta al día ───────── */

describe("puesta al día de capas nuevas (14 §5)", () => {
  it("ofrece lo que la app anterior no tenía; lo que no existe todavía figura en preparación", () => {
    const state = loadContinuity(new FakeStore());
    const items = catchupItems(getUnit("u04")!, state);
    expect(items.map((i) => i.blockId)).toEqual(["repeat", "text", "questions", "own"]);
    const repeat = items.find((i) => i.blockId === "repeat")!;
    expect(repeat).toMatchObject({ soon: false, done: false, to: "/dialogo/u04?c=u04.repeat" });
    expect(items.filter((i) => i.soon).map((i) => i.blockId)).toEqual(["text", "questions", "own"]);
    for (const i of items) expect(i.minutes).toBeLessThanOrEqual(CATCHUP_MAX_MINUTES);
  });

  it("un bloque hecho no se ofrece de nuevo, y solo aparece para unidades dominadas o por repasar", () => {
    const { raw, tests, cont } = load(hastaU04());
    expect(startingPoint(raw, tests, cont).catchup).toEqual([]);
    const state = startHere(cont, NOW);
    const point = startingPoint(raw, tests, state);
    expect(point.catchup.map((c) => c.view.unit.id)).toEqual(["u04", "u03", "u02", "u01"]);
    expect(nextCatchup(state, point.catchup)?.unit).toBe("u04");
    let s2 = state;
    for (const u of ["u04", "u03", "u02", "u01"]) s2 = markCatchup(s2, u, "repeat");
    expect(nextCatchup(s2, startingPoint(raw, tests, s2).catchup)).toBeNull();
    expect(markCatchup(s2, "u04", "repeat")).toBe(s2);
    expect(nextCatchup(setUsePrevious(state, true), point.catchup)).toBeNull();
  });
});

/* ───────── siembra del repaso espaciado ───────── */

const dueCounts = (cards: { fsrs: { due: string } }[]) => {
  const counts = new Map<string, number>();
  for (const c of cards) counts.set(dayOf(c.fsrs.due), (counts.get(dayOf(c.fsrs.due)) ?? 0) + 1);
  return counts;
};

describe("siembra del repaso espaciado (14 §6)", () => {
  it("(a) hasta u04 dominada: palabras y dictados de u01–u04, estabilidad 7, nunca más de 25 por día, desde mañana", () => {
    const store = hastaU04();
    const { raw, tests, cont } = load(store);
    const views = viewsOf(raw, tests, startHere(cont, NOW));
    const expected = unitIds(1, 4).reduce((n, u) => n + wordsOfUnit(u).length + (getDictation(u)?.length ?? 0), 0);
    const added = applySeedReview(store, views, NOW);
    expect(added).toBe(expected);
    const cards = Object.values(loadSrs(store).cards);
    expect(cards.every((c) => c.source === "seed" && c.fsrs.stability === 7 && c.fsrs.lapses === 0)).toBe(true);
    const tomorrow = toISODate(new Date(2026, 9, 29));
    expect(cards.every((c) => dayOf(c.fsrs.due) >= tomorrow)).toBe(true);
    for (const n of dueCounts(cards).values()) expect(n).toBeLessThanOrEqual(SEED_PER_DAY);
    expect(dueCounts(cards).size).toBeLessThanOrEqual(SEED_WINDOW_DAYS);
  });

  it("(b) u08 saltado queda para repasar: su repaso por cajas pasa a tarjetas de completar con 1 lapso", () => {
    const store = u08Parcial();
    const { raw, tests, cont } = load(store);
    const state = skipDiagnostic(startHere(cont, NOW), "u08", NOW);
    const views = viewsOf(raw, tests, state);
    expect(views.find((v) => v.unit.id === "u08")?.verdict).toBe("repasar");
    applySeedReview(store, views, NOW);
    const cards = Object.values(loadSrs(store).cards);
    const review = JSON.parse(store.getItem(KEYS.review)!) as Record<string, { due: string }>;
    const cloze = cards.filter((c) => c.kind === "cloze");
    expect(cloze.length).toBeGreaterThan(0);
    for (const c of cloze) {
      expect(findExercise(c.itemId)?.exercise.type).toBe("fill");
      expect(review[c.itemId]).toBeDefined();
      expect(c.fsrs.lapses).toBe(1);
      // Vence en su fecha original, o mañana si esa fecha ya pasó.
      expect(dayOf(c.fsrs.due) >= "2026-10-29").toBe(true);
      if (review[c.itemId].due > "2026-10-29") expect(dayOf(c.fsrs.due) >= review[c.itemId].due).toBe(true);
    }
    const u08Words = cards.filter((c) => c.unit === "u08" && c.kind === "recog");
    expect(u08Words.every((c) => c.fsrs.stability === 2)).toBe(true);
    expect(u08Words).toHaveLength(wordsOfUnit("u08").length);
  });

  it("(c) hasta u16: el tope de 25 por día manda sobre la cantidad, y lo que no cabe queda como palabra nueva", () => {
    const store = hastaU16();
    const { raw, tests, cont } = load(store);
    const views = viewsOf(raw, tests, startHere(cont, NOW));
    const plan = planSeed(views, [], {}, {}, NOW);
    expect(plan.cards.length).toBeLessThanOrEqual(SEED_PER_DAY * SEED_WINDOW_DAYS);
    expect(plan.left).toBeGreaterThan(0);
    for (const n of dueCounts(plan.cards).values()) expect(n).toBeLessThanOrEqual(SEED_PER_DAY);
    // Lo más reciente primero: u16 entra completo y lo que se queda fuera es de las unidades más antiguas.
    const seeded = new Set(plan.cards.map((c) => c.unit));
    expect(seeded.has("u16")).toBe(true);
    expect(plan.cards.filter((c) => c.unit === "u16").length).toBe(wordsOfUnit("u16").length + (getDictation("u16")?.length ?? 0));
  });

  it("respeta las tarjetas que ya tienes: no las cambia y las cuenta para el tope de cada día", () => {
    const store = hastaU04();
    const tomorrow = new Date(2026, 9, 29, 12);
    const mine = Array.from({ length: 20 }, (_, i) => seedSrsCard({ kind: "recog", itemId: `u99:mia-${i}`, unit: "u99", stability: 3, difficulty: 5, due: tomorrow }, NOW));
    saveSrs({ version: 1, cards: Object.fromEntries(mine.map((c) => [c.id, c])), log: [{ cardId: mine[0].id, at: NOW.toISOString(), rating: 3, ms: 900 }], options: { quizlet: true } }, store);
    const before = JSON.stringify(loadSrs(store).cards);
    const { raw, tests, cont } = load(store);
    applySeedReview(store, viewsOf(raw, tests, startHere(cont, NOW)), NOW);
    const after = loadSrs(store);
    for (const c of mine) expect(JSON.stringify(after.cards[c.id])).toBe(JSON.stringify(JSON.parse(before)[c.id]));
    expect(after.options).toEqual({ quizlet: true });
    expect(after.log).toHaveLength(1);
    expect(dueCounts(Object.values(after.cards)).get("2026-10-29")).toBeLessThanOrEqual(SEED_PER_DAY);
  });

  it("es idempotente: sembrar dos veces deja exactamente lo mismo", () => {
    const store = hastaU04();
    const { raw, tests, cont } = load(store);
    const views = viewsOf(raw, tests, startHere(cont, NOW));
    expect(applySeedReview(store, views, NOW)).toBeGreaterThan(0);
    const once = store.snapshot();
    expect(applySeedReview(store, views, new Date(2026, 10, 5))).toBe(0);
    expect(store.snapshot()).toEqual(once);
  });

  it("las tarjetas sembradas no disparan de golpe las de producir: esperan a su primer repaso real", () => {
    const store = hastaU04();
    const { raw, tests, cont } = load(store);
    applySeedReview(store, viewsOf(raw, tests, startHere(cont, NOW)), NOW);
    const state = loadSrs(store);
    const recog = Object.values(state.cards).filter((c) => c.kind === "recog");
    expect(recog.every((c) => c.fsrs.stability >= 4)).toBe(true);
    expect(unlockProdCards(state, NOW)).toBe(state);
    const reviewed = { ...state, cards: { ...state.cards, [recog[0].id]: rateCard(recog[0], 3, new Date(2026, 10, 1)) } };
    const unlocked = Object.values(unlockProdCards(reviewed, NOW).cards).filter((c) => c.kind === "prod");
    expect(unlocked.map((c) => c.itemId)).toEqual([recog[0].itemId]);
    // Sin la marca de siembra todo sigue como antes (tarjeta normal de estabilidad alta).
    const normal = { ...newSrsCard({ kind: "recog", itemId: "u04:x", unit: "u04" }, NOW), fsrs: { ...recog[0].fsrs, reps: 1 } };
    expect(Object.keys(unlockProdCards({ version: 1, cards: { [normal.id]: normal }, log: [] }, NOW).cards)).toContain("prod:u04:x");
  });
});

/* ───────── propiedades sobre los respaldos ───────── */

/** Recorre todo lo que la capa de continuidad puede hacer. */
function everything(store: FakeStore) {
  let { raw, tests, cont } = load(store);
  const save = (s: ContinuityState) => { cont = s; store.setItem(KEYS_V2.progress, JSON.stringify(s)); };
  save(startHere(cont, NOW));
  const diagnosable = viewsOf(raw, tests, cont).filter((v) => v.diagnosable);
  diagnosable.forEach((v, i) => {
    if (i % 3 === 0) save(skipDiagnostic(cont, v.unit.id, NOW));
    else if (i % 3 === 1) save(recordDiagnostic(cont, v.unit.id, scoreDiagnostic(Array.from({ length: 8 }, (_, k) => ({ id: `${v.unit.id}-e0${k}`, correct: k < 3 })), "2026-10-28"), NOW));
    else save(recordDiagnostic(cont, v.unit.id, scoreDiagnostic(Array.from({ length: 8 }, (_, k) => ({ id: `${v.unit.id}-e0${k}`, correct: k < 7 })), "2026-10-28"), NOW));
  });
  save(markCatchup(cont, "u01", "repeat"));
  save(markDirected(cont, "u01", "2026-10-28"));
  save(setPostponed(cont, "u26", true));
  applySeedReview(store, viewsOf(raw, tests, cont), NOW);
  applySeedReview(store, viewsOf(raw, tests, cont), NOW);
  save(setUsePrevious(cont, true));
  save(setUsePrevious(cont, false));
}

describe.each(SYNTHETIC)("propiedades con el respaldo «%s»", (_name, make) => {
  it("ninguna clave italianPlan.* antigua cambia de valor, ni siquiera se vuelve a escribir", () => {
    const store = make();
    const before = oldKeysOf(store.snapshot());
    const keysBefore = Object.keys(store.snapshot());
    store.writes = [];
    everything(store);
    expect(oldKeysOf(store.snapshot())).toEqual(before);
    expect(store.writes.filter((k) => OLD_KEYS.includes(k))).toEqual([]);
    // Lo único que se escribe es lo de la v2: las decisiones y las tarjetas sembradas.
    expect(new Set(store.writes)).toEqual(new Set([KEYS_V2.progress, SRS_KEY].filter((k) => store.writes.includes(k))));
    expect(Object.keys(store.snapshot()).filter((k) => !keysBefore.includes(k) && ![KEYS_V2.progress, SRS_KEY].includes(k))).toEqual([]);
  });

  it("leer el estado no escribe nada", () => {
    const store = make();
    store.writes = [];
    const { raw, tests, cont } = load(store);
    startingPoint(raw, tests, cont);
    overlayOf(raw, tests, cont);
    courseWithContinuity(raw, tests, cont);
    expect(store.writes).toEqual([]);
  });

  it("repetir todo da lo mismo (migrar dos veces es migrar una)", () => {
    const store = make();
    everything(store);
    const once = store.snapshot();
    everything(store);
    expect(store.snapshot()).toEqual(once);
  });

  it("exportar e importar la copia en otro almacenamiento deja el mismo estado", () => {
    const store = make();
    everything(store);
    const copy = buildBackup(store, NOW);
    const parsed = parseBackup(JSON.stringify(copy));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const other = new FakeStore();
    restoreBackup(parsed.backup, other);
    const strip = (snap: Record<string, string>) => Object.fromEntries(Object.entries(snap).filter(([k]) => k !== LAST_BACKUP_KEY));
    expect(strip(other.snapshot())).toEqual(strip(store.snapshot()));
    const a = load(store);
    const b = load(other);
    expect(JSON.stringify(viewsOf(b.raw, b.tests, b.cont).map((v) => [v.unit.id, v.marks.state, v.verdict])))
      .toBe(JSON.stringify(viewsOf(a.raw, a.tests, a.cont).map((v) => [v.unit.id, v.marks.state, v.verdict])));
    // Y exportar de nuevo da la misma copia.
    expect(buildBackup(other, NOW).data).toEqual(copy.data);
    // Volver a importar no cambia nada.
    restoreBackup(parsed.backup, other);
    expect(buildBackup(other, NOW).data).toEqual(copy.data);
  });

  it("los datos de la copia traen el estado nuevo con la versión que ya se importa", () => {
    const store = make();
    everything(store);
    const copy = buildBackup(store, NOW);
    expect(Object.keys(copy.data)).toContain(KEYS_V2.progress);
    expect(Object.keys(copy.data)).toContain(SRS_KEY);
  });
});

describe("estado guardado", () => {
  it("sin la clave o con la clave dañada, devuelve valores por defecto y no escribe", () => {
    const s = new FakeStore();
    expect(loadContinuity(s)).toEqual({ version: 2, migratedAt: null, decision: null, usePrevious: false, units: {}, postponedGaps: [], seeded: null });
    s.setItem(KEYS_V2.progress, "{no es json");
    s.writes = [];
    expect(loadContinuity(s).decision).toBeNull();
    s.setItem(KEYS_V2.progress, JSON.stringify([1, 2]));
    expect(loadContinuity(s).units).toEqual({});
    expect(s.getItem(KEYS_V2.progress)).toBe("[1,2]");
  });

  it("sin datos, instalación nueva: no hay nada que diagnosticar y el plan empieza en u25", () => {
    const s = base();
    const { raw, tests, cont } = load(s);
    const point = startingPoint(raw, tests, cont);
    expect(point.hasMarks).toBe(false);
    expect(diagnosticSessions(point.views)).toEqual([]);
    expect(point.next?.step.id).toBe(firstReadyStep());
    expect(point.next?.day.day).toBe(1);
    withReady(NEW_UNITS, () => expect(startingPoint(raw, tests, cont).next?.step.id).toBe("u25"));
  });

  it("la copia reciente es de menos de 14 días", () => {
    const s = new FakeStore();
    expect(backupRecent(s, NOW)).toBe(false);
    s.setItem(LAST_BACKUP_KEY, new Date(2026, 9, 20).toISOString());
    expect(backupRecent(s, NOW)).toBe(true);
    s.setItem(LAST_BACKUP_KEY, new Date(2026, 9, 1).toISOString());
    expect(backupRecent(s, NOW)).toBe(false);
  });

  it("la semilla de u01 sigue siendo opcional: con ella aplicada, u01 queda parcial y nada más cambia", () => {
    const s = semillaU01();
    expect(AVANCE_INICIAL.unidades.u01.sesiones).toEqual([1, 2, 3, 4, 5]);
    const before = s.snapshot();
    const { raw, tests, cont } = load(s);
    const point = startingPoint(raw, tests, cont);
    expect(point.views.find((v) => v.unit.id === "u01")).toMatchObject({ verdict: null, diagnosable: true, pendingDiagnostic: true });
    expect(point.next?.step.id).toBe(firstReadyStep());
    withReady(NEW_UNITS, () => expect(startingPoint(raw, tests, cont).next?.step.id).toBe("u25"));
    expect(s.snapshot()).toEqual(before);
  });
});
