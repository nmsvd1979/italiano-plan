import { describe, expect, it } from "vitest";
import { COURSE } from "./course";
import { LECTURA_IDS, checkShortAnswer, getLectura } from "./lectura";

const VOSEO = /\b(vos|tenés|querés|sos|podés|decís|sabés|hablás|mirá|escuchá|fijate)\b/i;
const REGIONAL = /\b(polera|remera|campera|pibe|choclo|cachái|fome|bacán|pololo|weón|arriendo|amoblad\w*)\b/i;
const words = (ss: string[]) => ss.join(" ").match(/[A-Za-zÀ-ÿ']+/g)?.length ?? 0;

describe("textos graduados (G4)", () => {
  it("hay un texto por cada paso del curso (32 semanas + 3 del puente)", () => {
    expect(LECTURA_IDS.slice().sort()).toEqual(COURSE.map((s) => s.id).sort());
    expect(LECTURA_IDS).toHaveLength(35);
  });

  for (const id of LECTURA_IDS) {
    describe(id, () => {
      const t = getLectura(id)!;
      it("tiene entre 55 y 250 palabras y más texto a medida que avanza el curso", () => {
        const n = words(t.it);
        expect(n).toBe(t.palabras);
        expect(n).toBeGreaterThanOrEqual(55);
        expect(n).toBeLessThanOrEqual(250);
      });
      it("la traducción tiene los mismos párrafos", () => {
        expect(t.es).toHaveLength(t.it.length);
        expect(t.titulo.length).toBeGreaterThan(2);
        expect(t.tipo.length).toBeGreaterThan(2);
      });
      it("tiene de 4 a 8 palabras clave con su traducción", () => {
        expect(t.claves.length).toBeGreaterThanOrEqual(4);
        expect(t.claves.length).toBeLessThanOrEqual(8);
        for (const c of t.claves) expect(c.it && c.es).toBeTruthy();
      });
      it("tiene 4 preguntas: 3 de opción múltiple y 1 de respuesta breve", () => {
        expect(t.preguntas.map((p) => p.kind)).toEqual(["mc", "mc", "mc", "short"]);
        for (const p of t.preguntas) {
          expect(p.q.endsWith("?")).toBe(true);
          expect(p.why.length).toBeGreaterThan(5);
          if (p.kind === "mc") {
            expect(p.options).toHaveLength(3);
            expect(new Set(p.options).size).toBe(3);
            expect(p.answer).toBeGreaterThanOrEqual(0);
            expect(p.answer).toBeLessThan(3);
          } else {
            expect(p.accepted.length).toBeGreaterThan(0);
          }
        }
      });
      it("español neutro (sin voseo ni regionalismos)", () => {
        const es = [...t.es, ...t.claves.map((c) => c.es), ...t.preguntas.flatMap((p) => [p.q, p.why])].join("\n");
        expect(es).not.toMatch(VOSEO);
        expect(es).not.toMatch(REGIONAL);
      });
      it("la respuesta breve acepta su propia respuesta", () => {
        const p = t.preguntas[3];
        if (p.kind === "short") for (const a of p.accepted) expect(checkShortAnswer(p, a)).toBe(true);
      });
    });
  }

  it("las respuestas correctas no se concentran en una sola letra", () => {
    const counts = [0, 0, 0];
    for (const id of LECTURA_IDS) for (const p of getLectura(id)!.preguntas) if (p.kind === "mc") counts[p.answer]++;
    const total = counts.reduce((a, b) => a + b, 0);
    for (const c of counts) expect(c / total).toBeLessThan(0.45);
  });

  it("el largo medio crece con las fases", () => {
    const avg = (ids: string[]) => ids.reduce((s, i) => s + getLectura(i)!.palabras, 0) / ids.length;
    const first = COURSE.filter((s) => s.phase <= 1).map((s) => s.id);
    const last = COURSE.filter((s) => s.phase >= 4).map((s) => s.id);
    expect(avg(last)).toBeGreaterThan(avg(first));
  });

  it("checkShortAnswer ignora tildes, mayúsculas y signos", () => {
    const q = { kind: "short" as const, q: "¿?", accepted: ["alle venti"], why: "x" };
    expect(checkShortAnswer(q, "  Alle venti. ")).toBe(true);
    expect(checkShortAnswer(q, "alle dieci")).toBe(false);
    expect(checkShortAnswer(q, "")).toBe(false);
  });
});
