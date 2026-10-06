import { describe, expect, it } from "vitest";
import { parseISODate } from "./dates";
import { gradeFill, gradeChoice, normalize } from "./grading";
import { Candidate, INTERVALS, buildSession, recordResult } from "./review";

describe("corrección", () => {
  it("ignora mayúsculas, espacios y apóstrofos curvos", () => {
    expect(gradeFill("  L’AMICO ", ["l'amico"])).toBe("correct");
    expect(normalize("Dov’è")).toBe("dov'è");
  });

  it("falta la tilde: casi", () => {
    expect(gradeFill("e", ["è"])).toBe("almost");
    expect(gradeFill("citta", ["città"])).toBe("almost");
  });

  it("la tilde equivocada con otra letra es error", () => {
    expect(gradeFill("sei", ["è"])).toBe("wrong");
    expect(gradeFill("", ["è"])).toBe("wrong");
  });

  it("acepta cualquiera de las variantes", () => {
    expect(gradeFill("faccia", ["faccia", "Faccia"])).toBe("correct");
  });

  it("choice", () => {
    expect(gradeChoice(2, 2)).toBe("correct");
    expect(gradeChoice(1, 2)).toBe("wrong");
  });
});

describe("repaso espaciado", () => {
  const today = parseISODate("2026-10-06");

  it("un error vuelve mañana", () => {
    expect(recordResult({}, "w01e01", false, today)).toEqual({ w01e01: { box: 0, due: "2026-10-07" } });
  });

  it("acertar algo que nunca falló no guarda nada", () => {
    expect(recordResult({}, "w01e01", true, today)).toEqual({});
  });

  it("cada acierto lo espacia más y al final se da por aprendido", () => {
    let s = recordResult({}, "x", false, today);
    for (let i = 1; i < INTERVALS.length; i++) {
      s = recordResult(s, "x", true, today);
      expect(s.x.box).toBe(i);
    }
    s = recordResult(s, "x", true, today);
    expect(s.x).toBeUndefined();
  });

  it("volver a fallar reinicia la caja", () => {
    let s = recordResult({}, "x", false, today);
    s = recordResult(s, "x", true, today);
    s = recordResult(s, "x", false, today);
    expect(s.x.box).toBe(0);
  });
});

describe("armado de sesiones", () => {
  const today = parseISODate("2026-10-06");
  const candidates: Candidate[] = [1, 2, 3].flatMap((week) =>
    Array.from({ length: 10 }, (_, i) => ({ id: `w${week}e${i}`, week })),
  );

  it("la semana 1 usa solo ejercicios de la semana 1", () => {
    const ids = buildSession({ candidates: candidates.filter((c) => c.week === 1), focusWeek: 1, size: 10, state: {}, today, seed: "a" });
    expect(ids).toHaveLength(10);
    expect(ids.every((id) => id.startsWith("w1"))).toBe(true);
  });

  it("práctica: 70 % de la semana y 30 % de anteriores", () => {
    const ids = buildSession({ candidates, focusWeek: 3, size: 10, state: {}, today, seed: "b" });
    expect(ids).toHaveLength(10);
    expect(ids.filter((id) => id.startsWith("w3"))).toHaveLength(7);
    expect(ids.filter((id) => !id.startsWith("w3"))).toHaveLength(3);
    expect(new Set(ids).size).toBe(10);
  });

  it("los errados vencidos de semanas anteriores entran primero", () => {
    const state = { w1e4: { box: 0, due: "2026-10-05" }, w2e7: { box: 1, due: "2026-10-06" } };
    const ids = buildSession({ candidates, focusWeek: 3, size: 10, state, today, seed: "c" });
    expect(ids).toContain("w1e4");
    expect(ids).toContain("w2e7");
  });

  it("la misma semilla da la misma sesión", () => {
    const a = buildSession({ candidates, focusWeek: 3, size: 10, state: {}, today, seed: "2026-10-06:3" });
    const b = buildSession({ candidates, focusWeek: 3, size: 10, state: {}, today, seed: "2026-10-06:3" });
    expect(a).toEqual(b);
  });

  it("repaso mixto: mezcla semanas y prioriza vencidos", () => {
    const state = { w1e2: { box: 0, due: "2026-10-01" } };
    const ids = buildSession({ candidates, focusWeek: null, size: 10, state, today, seed: "d" });
    expect(ids).toHaveLength(10);
    expect(ids).toContain("w1e2");
    expect(new Set(ids.map((i) => i.slice(0, 2))).size).toBeGreaterThan(1);
  });
});
