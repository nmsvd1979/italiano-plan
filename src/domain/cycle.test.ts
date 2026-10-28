import { describe, expect, it } from "vitest";
import { COURSE } from "../content/course";
import { UNITS, getUnit, sessionsOf } from "../content/curriculum";
import { AVANCE_INICIAL } from "../content/avance-inicial";
import { blockResources, blockRoute } from "../app/blockRoute";
import {
  CourseProgress, PASS_RATIO, blockDone, blockKey, currentSlot, dayComplete, daysFor, daysOf, isSoon, remedialDays,
  recommendedLeft, todaySlots, unitSettled, visibleBlocks, weekComplete, wordsSeen,
} from "./cycle";
import { MINI_SIZE, miniItems, miniPassed } from "./miniTest";
import { forPart } from "./parts";
import { eligibleUnits } from "./srsQueue";
import { seedKeys } from "./seed";
import type { MiniTests } from "./storage";

const step = (id: string) => COURSE.find((s) => s.id === id)!;
const progress = (done: Iterable<string> = [], mini: MiniTests = {}, startUnit = 1): CourseProgress => ({ done: new Set(done), startUnit, mini });
const legacyKeys = (unit: string) => sessionsOf(getUnit(unit)!).flatMap((s) => s.activities.map((a) => `${unit}.s${s.index}.${a.id}`));
const ids = (...n: number[]) => n.map((x) => `u${String(x).padStart(2, "0")}`);
/** Marca todo lo esencial de un día con claves nuevas. */
const doCore = (stepId: string, dayNo: number): string[] => {
  const s = step(stepId);
  const unit = getUnit(s.unit)!;
  return daysOf(s)[dayNo - 1].blocks.filter((b) => b.core && !isSoon(b, unit) && b.kind !== "mini").map((b) => blockKey(stepId, dayNo, b.id));
};

describe("daysOf: la estructura de 04 §D1", () => {
  it("devuelve 7 días y todo bloque tiene minutos > 0, id único por día y clave única", () => {
    for (const s of COURSE) {
      const days = daysOf(s);
      expect(days.map((d) => d.day)).toEqual([1, 2, 3, 4, 5, 6, 7]);
      const keys = days.flatMap((d) => d.blocks.map((b) => blockKey(s.id, d.day, b.id)));
      expect(new Set(keys).size).toBe(keys.length);
      for (const d of days) for (const b of d.blocks) expect(b.minutes, `${s.id} d${d.day} ${b.id}`).toBeGreaterThan(0);
    }
  });

  it("la suma de bloques core por día está entre 12 y 18 min y la total entre 25 y 35", () => {
    for (const d of daysOf(step("u04"))) {
      const core = d.blocks.filter((b) => b.core).reduce((n, b) => n + b.minutes, 0);
      const all = d.blocks.reduce((n, b) => n + b.minutes, 0);
      expect(core, `día ${d.day}`).toBeGreaterThanOrEqual(12);
      expect(core, `día ${d.day}`).toBeLessThanOrEqual(18);
      expect(all, `día ${d.day}`).toBeGreaterThanOrEqual(25);
      expect(all, `día ${d.day}`).toBeLessThanOrEqual(35);
    }
  });

  it("los 7 días y sus nombres siguen la tabla", () => {
    expect(daysOf(step("u04")).map((d) => d.name)).toEqual(["Entrar", "Regla", "Practicar", "Hablar", "Leer y escuchar", "Producir", "Consolidar"]);
  });

  it("solo el shadowing y el input libre necesitan internet; el resto funciona sin conexión", () => {
    const net = daysOf(step("u04")).flatMap((d) => d.blocks).filter((b) => b.needsInternet).map((b) => b.kind);
    expect([...new Set(net)].sort()).toEqual(["input", "shadowing"]);
    const s = step("u04");
    for (const d of daysOf(s)) {
      for (const b of d.blocks) {
        if (b.kind === "input") continue;
        expect(blockResources(s, b), `${d.day}.${b.id}`).toEqual([]);
        expect(blockRoute(s, d, b)?.to ?? "#/").toMatch(/^#\//);
      }
    }
  });

  it("los bloques sin herramienta ni contenido quedan «en preparación» y no tienen ruta", () => {
    const unit = getUnit("u04")!;
    const soon = daysOf(step("u04")).flatMap((d) => d.blocks.filter((b) => isSoon(b, unit)));
    expect(soon.map((b) => b.id)).toEqual(expect.arrayContaining(["own", "shorttext", "speed", "text", "questions", "retell"]));
    expect(blockRoute(step("u04"), daysOf(step("u04"))[4], soon.find((b) => b.id === "text")!)).toBeUndefined();
  });
});

describe("partes A y B", () => {
  it("cada parte recibe lo asignado más lo no asignado a ninguna; sin parte, todo", () => {
    const list = Array.from({ length: 26 }, (_, i) => i);
    const a = forPart("u02", "A", "exercises", list).map((x) => x.index);
    const b = forPart("u02", "B", "exercises", list).map((x) => x.index);
    expect(forPart("u02", null, "exercises", list)).toHaveLength(26);
    expect(forPart("u04", "A", "exercises", list)).toHaveLength(26); // u04 no se parte
    const parts = getUnit("u02")!.parts!;
    for (const i of parts.A.exercises ?? []) expect(a).toContain(i);
    for (const i of parts.B.exercises ?? []) expect(b).toContain(i);
    // lo que es solo de B no está en A y viceversa
    for (const i of parts.B.exercises ?? []) if (!(parts.A.exercises ?? []).includes(i)) expect(a).not.toContain(i);
    expect(new Set([...a, ...b]).size).toBe(26);
  });

  it("las rutas de una semana partida llevan la parte y la clave del bloque", () => {
    const s = step("u02#A");
    const d = daysOf(s)[1];
    const r = blockRoute(s, d, d.blocks.find((b) => b.id === "lesson")!)!;
    expect(r.to).toContain("/gramatica/u02");
    expect(r.to).toContain("part=A");
    expect(r.to).toContain(`k=${encodeURIComponent("u02#A.d2.lesson")}`);
  });

  it("los bloques de cada parte tienen claves distintas (u02#A ≠ u02#B)", () => {
    expect(blockKey("u02#A", 2, "lesson")).not.toBe(blockKey("u02#B", 2, "lesson"));
  });
});

describe("el día y la semana", () => {
  it("un día se completa con sus bloques core; los recomendados y los «en preparación» no lo bloquean", () => {
    const s = step("u04");
    const day5 = daysOf(s)[4]; // el texto graduado (core) aún no existe
    expect(dayComplete(s, day5, progress())).toBe(false);
    expect(dayComplete(s, day5, progress(doCore("u04", 5)))).toBe(true);
  });

  it("modo corto: solo los bloques core que existen", () => {
    const unit = getUnit("u04")!;
    for (const d of daysOf(step("u04"))) {
      const short = visibleBlocks(d, unit, true);
      expect(short.every((b) => b.core && !isSoon(b, unit))).toBe(true);
      expect(visibleBlocks(d, unit, false)).toHaveLength(d.blocks.length);
    }
    const mins = daysOf(step("u04")).map((d) => visibleBlocks(d, unit, true).reduce((n, b) => n + b.minutes, 0));
    expect(Math.max(...mins)).toBeLessThanOrEqual(18);
  });

  it("u25–u28 no aparecen en el flujo mientras estén ready:false", () => {
    const firstOpen = todaySlots(progress(), new Set()).shown.map((x) => x.step.unit);
    expect(firstOpen.some((u) => ["u25", "u26", "u27", "u28"].includes(u))).toBe(false);
    expect(currentSlot(progress())?.step.id).toBe("u01");
  });

  it("el plan avanza por progreso: no depende de ninguna fecha", () => {
    const p = progress(doCore("u01", 1));
    expect(todaySlots(p, new Set()).shown[0].day.day).toBe(2);
    expect(todaySlots(p, new Set()).shown[0].step.id).toBe("u01");
  });
});

describe("Hacer más hoy", () => {
  it("no agrega nada mientras el día no esté completo; después ofrece el siguiente, sin tope diario", () => {
    const empty = progress();
    expect(todaySlots(empty, new Set(), 3).shown).toHaveLength(1);
    const keys = doCore("u01", 1);
    const p = progress(keys);
    // Hoy se hizo el día 1: sigue visible como hecho; con más, aparece el día 2, el 3…
    const today = new Set(keys);
    expect(todaySlots(p, today, 0).shown.map((x) => x.day.day)).toEqual([1]);
    expect(todaySlots(p, today, 1).shown.map((x) => x.day.day)).toEqual([1, 2]);
    expect(todaySlots(p, today, 3).shown.map((x) => x.day.day)).toEqual([1, 2, 3, 4]);
  });

  it("cruza a la semana siguiente cuando termina la actual", () => {
    const all = Array.from({ length: 7 }, (_, i) => doCore("u01", i + 1)).flat();
    const p = progress(all, { u01: [{ date: "d", correct: 8, total: 8, passed: true }] });
    expect(weekComplete(step("u01"), p)).toBe(true);
    expect(currentSlot(p)?.step.id).toBe("u02#A");
  });
});

describe("mensaje de fin de día", () => {
  it("con lo esencial hecho, cuenta los recomendados que quedan; en modo corto no quedan", () => {
    const keys = doCore("u04", 1);
    const p = progress(keys, {}, 4);
    const shown = todaySlots(p, new Set(keys)).shown;
    expect(shown[0].step.id).toBe("u04");
    expect(shown.map((x) => x.day.day)).toEqual([1]);
    // día 1: palabras, sonido y repetir las líneas son recomendados
    expect(recommendedLeft(shown, p, false)).toBe(3);
    expect(recommendedLeft(shown, p, true)).toBe(0);
    const more = progress([...keys, blockKey("u04", 1, "words"), blockKey("u04", 1, "sound"), blockKey("u04", 1, "repeat")], {}, 4);
    expect(recommendedLeft(shown, more, false)).toBe(0);
  });

  it("no cuenta los bloques «en preparación»", () => {
    const keys = doCore("u04", 5);
    const p = progress(keys);
    const shown = [{ step: step("u04"), day: daysOf(step("u04"))[4] }];
    // día 5: palabras y shadowing existen; texto y preguntas están en preparación
    expect(recommendedLeft(shown, p, false)).toBe(2);
  });
});

describe("reglas de avance (04 §D3)", () => {
  it("aprobar es ≥ 75 %", () => {
    expect(PASS_RATIO).toBe(0.75);
    expect(miniPassed(6, 8)).toBe(true);
    expect(miniPassed(5, 8)).toBe(false);
    expect(miniPassed(0, 0)).toBe(false);
  });

  it("sin mini-prueba aprobada la semana no termina; reprobada agrega 2 días de repaso y otra versión", () => {
    const base = Array.from({ length: 7 }, (_, i) => doCore("u04", i + 1)).flat();
    const failed: MiniTests = { u04: [{ date: "d", correct: 5, total: 8, passed: false }] };
    expect(weekComplete(step("u04"), progress(base))).toBe(false);
    expect(weekComplete(step("u04"), progress(base, failed))).toBe(false);
    const days = daysFor(step("u04"), progress(base, failed));
    expect(days).toHaveLength(9);
    expect(days.slice(7).map((d) => d.name)).toEqual(["Repaso dirigido", "Otra versión de la prueba"]);
    expect(days[8].blocks.some((b) => b.kind === "mini" && b.attempt === 1)).toBe(true);
    // lo que sigue es el repaso dirigido, no otra semana
    expect(currentSlot(progress(base, failed, 4))?.day.day).toBe(8);
    // aprobar en el segundo intento cierra la semana
    const retry: MiniTests = { u04: [...failed.u04, { date: "d", correct: 7, total: 8, passed: true }] };
    expect(weekComplete(step("u04"), progress(base, retry))).toBe(true);
    expect(daysFor(step("u04"), progress(base, retry))).toHaveLength(7);
  });

  it("cada fallo agrega otro par de días de repaso", () => {
    expect(remedialDays(step("u04"), 2).map((d) => d.day)).toEqual([8, 9, 10, 11]);
    const mins = remedialDays(step("u04"), 1).map((d) => d.blocks.filter((b) => b.core).reduce((n, b) => n + b.minutes, 0));
    expect(Math.max(...mins)).toBeLessThanOrEqual(18);
  });

  it("la mini-prueba usa ejercicios de la unidad y de su parte, y cada intento es una versión distinta", () => {
    const a0 = miniItems("u02#A", "u02", "A", 0);
    const a1 = miniItems("u02#A", "u02", "A", 1);
    expect(a0).toHaveLength(MINI_SIZE);
    expect(miniItems("u02#A", "u02", "A", 0).map((e) => e.id)).toEqual(a0.map((e) => e.id));
    expect(a0.map((e) => e.id)).not.toEqual(a1.map((e) => e.id));
    expect(a0.filter((e) => a1.some((o) => o.id === e.id))).toHaveLength(0);
    const mine = new Set(forPart("u02", "A", "exercises", Array.from({ length: 40 }, (_, i) => i)).map((x) => x.index));
    for (const e of [...a0, ...a1]) expect(mine.has(Number(e.id.slice(-2)))).toBe(true);
  });
});

describe("migración desde la app anterior (14 §8)", () => {
  const upTo = (n: number) => ids(...Array.from({ length: n }, (_, i) => i + 1)).flatMap(legacyKeys);

  it("(a) hasta u04 completo: u01–u04 valen como hechas (A y B) y sigue u05 parte A", () => {
    const p = progress(upTo(4));
    for (const u of ids(1, 2, 3, 4)) expect(unitSettled(getUnit(u)!, p), u).toBe(true);
    for (const s of COURSE.filter((c) => ["u01", "u02", "u03", "u04"].includes(c.unit))) expect(weekComplete(s, p), s.id).toBe(true);
    const cur = currentSlot(p)!;
    expect(cur.step.id).toBe("u05#A");
    expect(cur.day.day).toBe(1);
  });

  it("(b) u08 parcial con el repaso lleno y una prueba de fase aprobada: lo hecho no se pierde", () => {
    const partial = legacyKeys("u08").filter((k) => /\.s[123]\./.test(k));
    const p = progress([...upTo(7), ...partial]);
    expect(unitSettled(getUnit("u08")!, p)).toBe(false);
    const cur = currentSlot(p)!;
    expect(cur.step.id).toBe("u08");
    // La lección y las palabras de las sesiones 1–3 cuentan como hechas en el ciclo nuevo.
    const s = step("u08");
    const get = (d: number, id: string) => daysOf(s)[d - 1].blocks.find((b) => b.id === id)!;
    expect(blockDone(s, 2, get(2, "lesson"), p)).toBe(true);
    expect(blockDone(s, 1, get(1, "words"), p)).toBe(true);
    expect(blockDone(s, 6, get(6, "writing"), p)).toBe(false);
    expect(eligibleUnits(p)).toContain("u08");
  });

  it("(c) hasta u16 completo: sigue u17", () => {
    const p = progress(upTo(16));
    expect(currentSlot(p)?.step.id).toBe("u17");
    expect(COURSE.filter((s) => s.kind === "core" && s.unit <= "u16" && s.unit !== "u25" && s.unit !== "u26" && s.unit !== "u27" && s.unit !== "u28").every((s) => weekComplete(s, p))).toBe(true);
  });

  it("la semilla de avance (u01 sesiones 1–5, 17 de 22) es parcial: cuenta lo hecho y falta el diálogo", () => {
    expect(Object.keys(AVANCE_INICIAL.unidades)).toEqual(["u01"]);
    const p = progress(seedKeys());
    expect(unitSettled(getUnit("u01")!, p)).toBe(false);
    const s = step("u01");
    const done = (d: number, id: string) => blockDone(s, d, daysOf(s)[d - 1].blocks.find((b) => b.id === id)!, p);
    expect(done(2, "lesson")).toBe(true);
    expect(done(3, "varied")).toBe(true);
    expect(done(6, "writing")).toBe(true);
    expect(done(1, "dialogue")).toBe(false);
    expect(currentSlot(p)?.day.day).toBe(1);
  });

  it("el motor no escribe nada: las marcas antiguas siguen siendo las mismas", () => {
    const old = upTo(4);
    const set = new Set(old);
    const before = [...set].sort();
    const p: CourseProgress = { done: set, startUnit: 1, mini: {} };
    todaySlots(p, new Set(), 2);
    currentSlot(p);
    weekComplete(step("u05#A"), p);
    expect([...set].sort()).toEqual(before);
  });

  it("startUnit: las unidades anteriores a la inicial se dan por sabidas", () => {
    const p = progress([], {}, 3);
    expect(unitSettled(getUnit("u02")!, p)).toBe(true);
    expect(currentSlot(p)?.step.id).toBe("u03#A");
  });

  it("las palabras de la unidad se consideran mostradas con la actividad antigua o con el bloque nuevo", () => {
    expect(wordsSeen("u04", new Set(["u04.s2.vocab"]))).toBe(true);
    expect(wordsSeen("u04", new Set(["u04.d1.words"]))).toBe(true);
    expect(wordsSeen("u02", new Set(["u02#B.d3.words3"]))).toBe(true);
    expect(wordsSeen("u04", new Set())).toBe(false);
    expect(eligibleUnits({ done: new Set(["u02#A.d1.words"]) })).toEqual(["u02"]);
  });

  it("todas las unidades están en el curso y el ciclo de las listas solo usa unidades listas", () => {
    expect(new Set(COURSE.map((s) => s.unit))).toEqual(new Set(UNITS.map((u) => u.id)));
  });
});
