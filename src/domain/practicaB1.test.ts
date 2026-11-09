import { describe, expect, it } from "vitest";
import { B1_PASS, b1Key, b1Passed, loadB1, passedB1, recordB1 } from "./practicaB1";
import { KEYS_V2, clearProgress, type KV } from "./storage";
import { buildBackup, parseBackup, serializeBackup } from "./backup";

class Mem implements KV {
  private m = new Map<string, string>();
  get length() { return this.m.size; }
  key(i: number) { return [...this.m.keys()][i] ?? null; }
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
}

describe("resultados de Práctica B1", () => {
  it("guarda el último intento y el mejor", () => {
    const s = new Mem();
    recordB1(s, b1Key("lectura", "b1-1"), 3, 4, "2026-11-10");
    const r = recordB1(s, b1Key("lectura", "b1-1"), 2, 4, "2026-11-11");
    expect(r["lectura:b1-1"]).toEqual({ correct: 2, total: 4, date: "2026-11-11", best: 3 });
    expect(passedB1(r["lectura:b1-1"])).toBe(true);
    expect(B1_PASS).toBe(0.75);
  });

  it("cuenta las actividades logradas por tipo", () => {
    const s = new Mem();
    recordB1(s, b1Key("lectura", "b1-1"), 4, 4, "d");
    recordB1(s, b1Key("lectura", "b1-2"), 2, 4, "d");
    recordB1(s, b1Key("escucha", "b1-1"), 3, 4, "d");
    const all = loadB1(s);
    expect(b1Passed(all, "lectura", ["b1-1", "b1-2", "b1-3"])).toBe(1);
    expect(b1Passed(all, "escucha", ["b1-1"])).toBe(1);
  });

  it("ignora valores guardados con la forma equivocada", () => {
    for (const bad of ["null", "123", "[]", "{roto", '{"lectura:b1-1":{"correct":"x"}}', '{"a":{"correct":1,"total":0,"date":"d"}}']) {
      const s = new Mem();
      s.setItem(KEYS_V2.practiceB1, bad);
      expect(loadB1(s)).toEqual({});
    }
  });

  it("viaja en la copia de seguridad y se borra con «Borrar progreso»", () => {
    const s = new Mem();
    recordB1(s, b1Key("escucha", "b1-1"), 4, 4, "2026-11-10");
    const backup = buildBackup(s);
    expect(backup.data[KEYS_V2.practiceB1]).toBeDefined();
    expect(parseBackup(serializeBackup(backup)).ok).toBe(true);
    clearProgress(s);
    expect(s.getItem(KEYS_V2.practiceB1)).toBeNull();
  });
});
