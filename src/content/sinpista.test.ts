import { describe, expect, it } from "vitest";
import { UNITS } from "./curriculum";
import { SINPISTA_UNITS, checkText, getSinPista, normalize, orderBank, type SpOrder, type SpTranslate } from "./sinpista";

const VOSEO = /\b(vos|tenés|querés|sos|podés|decís|sabés|hablás|mirá|escuchá|fijate)\b/i;
const REGIONAL = /\b(polera|remera|campera|pibe|choclo|cachái|fome|bacán|pololo|weón|arriendo|amoblad\w*)\b/i;
const SPLIT = UNITS.filter((u) => u.parts).map((u) => u.id);

describe("práctica sin pista (G5)", () => {
  it("hay ejercicios para las 28 unidades", () => {
    expect(SINPISTA_UNITS.slice().sort()).toEqual(UNITS.map((u) => u.id).sort());
    expect(SINPISTA_UNITS).toHaveLength(28);
  });

  for (const unit of SINPISTA_UNITS) {
    describe(unit, () => {
      const list = getSinPista(unit);
      it("tiene 12 ejercicios con la mezcla acordada (2 ordenar, 3 traducir, 2 corregir, 2 transformar, 2 diálogo, 1 oído)", () => {
        expect(list).toHaveLength(12);
        const count = (t: string) => list.filter((e) => e.type === t).length;
        expect([count("order"), count("translate"), count("fix"), count("transform"), count("dialog"), count("listen")]).toEqual([2, 3, 2, 2, 2, 1]);
      });
      it("ids únicos y explicación en cada uno", () => {
        expect(new Set(list.map((e) => e.id)).size).toBe(12);
        for (const e of list) expect(e.why.length).toBeGreaterThan(9);
      });
      it("unidad partida: 6 ejercicios en cada semana", () => {
        if (SPLIT.includes(unit)) {
          expect(getSinPista(unit, "A")).toHaveLength(6);
          expect(getSinPista(unit, "B")).toHaveLength(6);
        } else {
          expect(list.every((e) => !e.part)).toBe(true);
        }
      });
      it("las respuestas son coherentes", () => {
        for (const e of list) {
          if (e.type === "dialog") {
            expect(e.lines.join(" ").split("___").length - 1).toBe(1);
            expect(e.options).toHaveLength(3);
            expect(e.answer).toBeGreaterThanOrEqual(0);
            expect(e.answer).toBeLessThan(3);
          } else if (e.type === "listen") {
            expect(e.options).toHaveLength(3);
            expect(new Set(e.options).size).toBe(3);
          } else {
            expect(e.answers.length).toBeGreaterThan(0);
            if (e.type === "fix") expect(e.answers.map(normalize)).not.toContain(normalize(e.prompt));
            if (e.type === "order") {
              const bank = orderBank(e);
              for (const a of e.answers) expect(bank.join(" ")).not.toBe(normalize(a));
              const base = normalize(e.answers[0]).split(" ");
              expect([...bank].sort()).toEqual([...base, ...e.extra.map(normalize)].sort());
              for (const a of e.answers) expect(normalize(a).split(" ").sort()).toEqual(base.slice().sort());
            }
          }
        }
      });
      it("español neutro", () => {
        const es = list.flatMap((e) => [e.why, e.type === "order" || e.type === "translate" || e.type === "transform" ? e.prompt : "", e.type === "listen" ? e.options.join(" ") : ""]).join("\n");
        expect(es).not.toMatch(VOSEO);
        expect(es).not.toMatch(REGIONAL);
      });
      it("cada respuesta aceptada se corrige como correcta", () => {
        for (const e of list) if (e.type === "order" || e.type === "translate" || e.type === "fix" || e.type === "transform") for (const a of e.answers) expect(checkText(e, a)).toBe(true);
      });
    });
  }

  it("las posiciones correctas de las opciones se reparten parejo", () => {
    const pos = [0, 0, 0];
    for (const u of SINPISTA_UNITS) for (const e of getSinPista(u)) if (e.type === "dialog" || e.type === "listen") pos[e.answer]++;
    const total = pos.reduce((a, b) => a + b, 0);
    for (const p of pos) expect(p / total).toBeGreaterThan(0.28);
  });

  it("normalize ignora mayúsculas y signos pero no las tildes", () => {
    expect(normalize("  «Che ora è?» ")).toBe("che ora è");
    expect(normalize("E")).not.toBe(normalize("È"));
  });

  it("checkText acepta la respuesta con otros signos y rechaza vacío o distinto", () => {
    const ex: SpTranslate = { id: "x", type: "translate", prompt: "", answers: ["Non capisco."], why: "x" };
    expect(checkText(ex, "non capisco")).toBe(true);
    expect(checkText(ex, "")).toBe(false);
    expect(checkText(ex, "non capire")).toBe(false);
    const o: SpOrder = { id: "u99-s01", type: "order", prompt: "", answers: ["A B C"], extra: ["D"], why: "x" };
    expect(orderBank(o)).toHaveLength(4);
    expect(orderBank(o).slice().sort()).toEqual(["a", "b", "c", "d"]);
  });
});
