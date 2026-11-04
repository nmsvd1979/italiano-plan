import { describe, expect, it } from "vitest";
import { KEYS, KEYS_V2, getCompletions, getMiniTests, getPhaseTests, getSkipped, type KV } from "./storage";

class Mem implements KV {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
}

describe("estado guardado con la forma equivocada", () => {
  const cases: [string, (s: KV) => unknown, unknown][] = [
    [KEYS.completions, getCompletions, {}],
    [KEYS.phaseTests, getPhaseTests, {}],
    [KEYS.skipped, getSkipped, []],
    [KEYS_V2.miniTests, getMiniTests, {}],
  ];
  for (const [key, read, empty] of cases) {
    for (const bad of ["null", "123", '"x"', "{roto", ...(Array.isArray(empty) ? ["{}"] : ["[]"])]) {
      it(`${key} = ${bad} devuelve el valor vacío`, () => {
        const s = new Mem();
        s.setItem(key, bad);
        expect(read(s)).toEqual(empty);
      });
    }
  }

  it("un valor correcto se conserva", () => {
    const s = new Mem();
    s.setItem(KEYS.skipped, '["u01.s1.quizlet"]');
    s.setItem(KEYS.completions, '{"2026-11-01":{"u25.d1.srs":true}}');
    expect(getSkipped(s)).toEqual(["u01.s1.quizlet"]);
    expect(getCompletions(s)).toEqual({ "2026-11-01": { "u25.d1.srs": true } });
  });
});
