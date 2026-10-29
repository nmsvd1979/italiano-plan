import { describe, expect, it } from "vitest";
import { getUnit, sessionsOf } from "../content/curriculum";
import { AVANCE_INICIAL } from "../content/avance-inicial";
import { NO_GAPS_TEXT, legacyNote, legacyNoteText, usePreviousHelp } from "./continuity";
import type { CourseProgress } from "./cycle";
import { unitCycleProgress } from "./cycle";
import { seedSrsCard, type SrsState } from "./srs";
import { nextDue, nothingToReviewText } from "./srsQueue";

const legacyKeys = (unitId: string, only?: number[]): string[] =>
  sessionsOf(getUnit(unitId)!).filter((s) => !only || only.includes(s.index)).flatMap((s) => s.activities.map((a) => `${unitId}.s${s.index}.${a.id}`));
const rawWith = (keys: string[]): CourseProgress => ({ done: new Set(keys), startUnit: 1, mini: {} });

describe("nota «Tu avance anterior» de la unidad", () => {
  const u01 = getUnit("u01")!;

  it("sin marcas de la app anterior no hay nota", () => {
    expect(legacyNote(u01, rawWith([]))).toBeNull();
    // Marcas de otra unidad tampoco cuentan.
    expect(legacyNote(u01, rawWith(legacyKeys("u02", [1])))).toBeNull();
  });

  it("con la semilla de u01 (17 de 22) cuenta X, Y y los bloques que esas marcas dan por hechos", () => {
    const raw = rawWith(legacyKeys("u01", AVANCE_INICIAL.unidades.u01.sesiones));
    const n = legacyNote(u01, raw)!;
    expect(n.done).toBe(17);
    expect(n.total).toBe(22);
    // Es lo mismo que la unidad muestra como marcado en el ciclo nuevo (la pantalla ve 8 de 26).
    expect(n.blocks).toBe(unitCycleProgress("u01", raw).done);
    expect(n.cycleTotal).toBe(unitCycleProgress("u01", raw).total);
    expect(n.blocks).toBe(8);
    expect(n.cycleTotal).toBe(26);
    expect(n.blocks).toBeGreaterThan(0);
    expect(n.blocks).toBeLessThan(n.cycleTotal);
  });

  it("no cuenta como equivalentes los bloques marcados directamente en el ciclo nuevo", () => {
    const legacy = legacyKeys("u01", [1]);
    const withCycle = rawWith([...legacy, "u01.d1.words"]);
    expect(legacyNote(u01, withCycle)!.blocks).toBe(legacyNote(u01, rawWith(legacy))!.blocks);
  });

  it("el texto usa las cifras tal cual", () => {
    expect(legacyNoteText({ done: 17, total: 22, blocks: 8, cycleTotal: 26 })).toBe(
      "Tu avance anterior: 17 de 22 actividades de la versión anterior. En el ciclo nuevo equivalen a 8 bloques marcados; los demás bloques son nuevos.",
    );
    expect(legacyNoteText({ done: 1, total: 22, blocks: 1, cycleTotal: 26 })).toContain("equivalen a 1 bloque marcado;");
  });

  it("si todo el ciclo queda hecho, no dice que los demás son nuevos", () => {
    const text = legacyNoteText({ done: 22, total: 22, blocks: 26, cycleTotal: 26 });
    expect(text).not.toContain("son nuevos");
    expect(text).toContain("26 bloques marcados");
  });

  it("no modifica el progreso que recibe", () => {
    const raw = rawWith(legacyKeys("u01", [1, 2]));
    const before = [...raw.done].sort();
    legacyNote(u01, raw);
    expect([...raw.done].sort()).toEqual(before);
    expect(raw.mini).toEqual({});
  });
});

describe("tarjetas: cuándo vence la próxima", () => {
  const today = new Date(2026, 9, 28, 10, 0, 0);
  const at = (days: number) => { const d = new Date(2026, 9, 28 + days, 12, 0, 0); return d; };
  const stateWith = (...due: Date[]): SrsState => {
    const cards = Object.fromEntries(due.map((d, i) => {
      const c = seedSrsCard({ kind: "recog", itemId: `u01:p${i}`, unit: "u01", stability: 7, difficulty: 5, lapses: 0, due: d }, today);
      return [c.id, c];
    }));
    return { cards, log: [] } as unknown as SrsState;
  };

  it("sin tarjetas futuras no hay próxima", () => {
    expect(nextDue({ cards: {}, log: [] } as unknown as SrsState, today)).toBeNull();
    expect(nothingToReviewText(null)).toBe("No quedan tarjetas vencidas ni palabras nuevas para hoy.");
  });

  it("siembra que empieza mañana: dice mañana y cuántas", () => {
    const next = nextDue(stateWith(at(1), at(1), at(1), at(2)), today)!;
    expect(next).toEqual({ date: "2026-10-29", days: 1, count: 3 });
    expect(nothingToReviewText(next)).toBe("Hoy no vence ninguna tarjeta. La próxima vence mañana: 3 tarjetas.");
  });

  it("una sola tarjeta, en singular", () => {
    expect(nothingToReviewText(nextDue(stateWith(at(1)), today))).toBe("Hoy no vence ninguna tarjeta. La próxima vence mañana: 1 tarjeta.");
  });

  it("más lejos, da la fecha", () => {
    const next = nextDue(stateWith(at(3), at(5)), today)!;
    expect(next).toMatchObject({ days: 3, count: 1 });
    expect(nothingToReviewText(next)).toBe("Hoy no vence ninguna tarjeta. La próxima vence el sábado 31 de octubre: 1 tarjeta.");
  });

  it("las tarjetas de hoy o vencidas no cuentan como próximas", () => {
    expect(nextDue(stateWith(at(0), at(-2), at(4)), today)).toMatchObject({ days: 4, count: 1 });
  });

  it("no cambia el estado", () => {
    const s = stateWith(at(1));
    const before = JSON.stringify(s);
    nextDue(s, today);
    expect(JSON.stringify(s)).toBe(before);
  });
});

describe("textos de Ajustes y de Tu punto de partida", () => {
  it("explica qué hace «Volver al plan anterior»", () => {
    expect(usePreviousHelp(false)).toBe(
      "«Volver al plan anterior»: el plan usa solo tus marcas y deja de lado lo que decidiste en Tu punto de partida; no borra nada.",
    );
  });

  it("explica qué hace «Usar de nuevo mi punto de partida»", () => {
    const t = usePreviousHelp(true);
    expect(t).toContain("«Usar de nuevo mi punto de partida» vuelve a aplicar lo que decidiste en Tu punto de partida");
    expect(t).toContain("tampoco borra nada");
  });

  it("dice que no hay huecos", () => {
    expect(NO_GAPS_TEXT).toBe("No tienes huecos por cerrar: ninguna unidad quedó pendiente.");
  });

  it("español neutro: sin voseo ni «Palabras nuevas»", () => {
    const all = [usePreviousHelp(true), usePreviousHelp(false), NO_GAPS_TEXT, nothingToReviewText(null), legacyNoteText({ done: 1, total: 2, blocks: 1, cycleTotal: 3 })].join(" ");
    expect(all).not.toMatch(/\b(tenés|querés|podés|hacé|vos)\b/i);
    expect(all).not.toContain("Palabras nuevas");
  });
});
