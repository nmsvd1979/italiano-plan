import { describe, expect, it } from "vitest";
import { UNITS, type UnitPartItems } from "./curriculum";
import { getDictation } from "./dictation";
import { getLesson } from "./grammar";
import { getVocab } from "./vocab";

type Key = keyof UnitPartItems;
const KEYS: Key[] = ["examples", "notice", "exercises", "vocab", "dictation"];

function sizes(id: string): Record<Key, number> {
  const l = getLesson(id)!;
  return {
    examples: l.examples.length,
    notice: l.notice.length,
    exercises: l.exercises.length,
    vocab: getVocab(id)!.length,
    dictation: getDictation(id)!.length,
  };
}

/** Minutos de práctica estimados: ~0,5 min por ejercicio (la práctica completa de una unidad son 12 min). */
const practiceMinutes = (p: UnitPartItems) => Math.ceil((p.exercises?.length ?? 0) * 0.5 + (p.dictation?.length ?? 0) * 1.5 + (p.vocab?.length ?? 0) * 0.4);

describe("partición A/B de las unidades partidas (G2)", () => {
  const split = UNITS.filter((u) => u.parts);
  it("son las siete unidades esperadas", () => {
    expect(split.map((u) => u.id)).toEqual(["u02", "u03", "u05", "u06", "u07", "u14", "u15"]);
  });

  for (const u of split) {
    const n = sizes(u.id);
    describe(u.id, () => {
      it("los índices existen y no se repiten dentro de una parte", () => {
        for (const part of ["A", "B"] as const) {
          for (const k of KEYS) {
            const list = u.parts![part][k] ?? [];
            expect(new Set(list).size, `${part}.${k}`).toBe(list.length);
            for (const i of list) expect(i >= 0 && i < n[k], `${part}.${k}[${i}]`).toBe(true);
          }
        }
      });

      it("todo ítem está al menos en una parte", () => {
        for (const k of KEYS) {
          const used = new Set([...(u.parts!.A[k] ?? []), ...(u.parts!.B[k] ?? [])]);
          const missing = Array.from({ length: n[k] }, (_, i) => i).filter((i) => !used.has(i));
          expect(missing, `${u.id} ${k} sin asignar`).toEqual([]);
        }
      });

      it("cada parte tiene material propio suficiente para una semana", () => {
        for (const part of ["A", "B"] as const) {
          const p = u.parts![part];
          expect((p.examples ?? []).length, `${part} examples`).toBeGreaterThanOrEqual(2);
          expect((p.notice ?? []).length, `${part} notice`).toBeGreaterThanOrEqual(1);
          expect((p.exercises ?? []).length, `${part} exercises`).toBeGreaterThanOrEqual(6);
          expect((p.vocab ?? []).length, `${part} vocab`).toBeGreaterThanOrEqual(5);
          expect((p.dictation ?? []).length, `${part} dictation`).toBeGreaterThanOrEqual(2);
        }
      });

      it("ninguna parte pasa de 60 minutos de práctica estimada", () => {
        expect(practiceMinutes(u.parts!.A)).toBeLessThanOrEqual(60);
        expect(practiceMinutes(u.parts!.B)).toBeLessThanOrEqual(60);
      });
    });
  }
});
