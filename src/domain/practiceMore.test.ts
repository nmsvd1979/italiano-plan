import { describe, expect, it } from "vitest";
import { learnedUnits, candidatesOf } from "./practice";
import { MORE_SIZE, emptyMore, loadMore, markServed, pickMore, saveMore, unseenCount } from "./practiceMore";
import { buildBackup, parseBackup, serializeBackup, BACKUP_VERSION } from "./backup";
import { KEYS_V2, clearProgress, type KV } from "./storage";
import type { Candidate } from "./review";

class Mem implements KV {
  private m = new Map<string, string>();
  get length() { return this.m.size; }
  key(i: number) { return [...this.m.keys()][i] ?? null; }
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
}

const cands = (n: number): Candidate[] => Array.from({ length: n }, (_, i) => ({ id: `u04-e${String(i).padStart(2, "0")}`, unit: 4 }));
const today = new Date(2026, 10, 8);

describe("Practicar más", () => {
  it("sirve primero lo que nunca salió y no repite ids en una tanda", () => {
    const c = cands(30);
    const more = markServed(emptyMore(), c.slice(0, 20).map((x) => x.id));
    const ids = pickMore({ candidates: c, review: {}, more, today, seed: "a" });
    expect(ids).toHaveLength(MORE_SIZE);
    expect(new Set(ids).size).toBe(MORE_SIZE);
    expect(ids.every((id) => !more.served[id])).toBe(true);
  });

  it("cuando todo salió, vuelve a lo que salió menos veces (nunca una lista vacía)", () => {
    const c = cands(12);
    let more = markServed(emptyMore(), c.map((x) => x.id));
    more = markServed(more, c.slice(0, 10).map((x) => x.id));
    const ids = pickMore({ candidates: c, review: {}, more, today, seed: "b" });
    expect(ids).toHaveLength(MORE_SIZE);
    expect(ids).toEqual(expect.arrayContaining([c[10].id, c[11].id]));
  });

  it("los errados vencidos más antiguos entran siempre, hasta un tercio de la tanda", () => {
    const c = cands(30);
    const review = Object.fromEntries(c.slice(0, 8).map((x, i) => [x.id, { box: 0, due: `2026-10-0${i + 1}` }]));
    for (const seed of ["c1", "c2", "c3"]) {
      const ids = pickMore({ candidates: c, review, more: emptyMore(), today, seed });
      expect(ids).toEqual(expect.arrayContaining([c[0].id, c[1].id, c[2].id]));
    }
  });

  it("un errado que aún no puede volver no cuenta como vencido", () => {
    const c = cands(12);
    const review = { [c[0].id]: { box: 0, due: "2026-11-20" } };
    const more = markServed(emptyMore(), [c[0].id]);
    const ids = pickMore({ candidates: c, review, more, today, seed: "d" });
    expect(ids).not.toContain(c[0].id);
  });

  it("misma semilla, misma tanda; otra semilla, otra", () => {
    const c = cands(40);
    const a = pickMore({ candidates: c, review: {}, more: emptyMore(), today, seed: "x" });
    expect(pickMore({ candidates: c, review: {}, more: emptyMore(), today, seed: "x" })).toEqual(a);
    expect(pickMore({ candidates: c, review: {}, more: emptyMore(), today, seed: "y" })).not.toEqual(a);
  });

  it("sin candidatos no devuelve nada", () => {
    expect(pickMore({ candidates: [], review: {}, more: emptyMore(), today, seed: "z" })).toEqual([]);
  });

  it("solo usa unidades de lecciones vistas", () => {
    const p = { done: new Set(["u04.d2.lesson"]), startUnit: 1 } as unknown as Parameters<typeof learnedUnits>[0];
    const units = learnedUnits(p);
    expect(units).toContain("u04");
    expect(units).not.toContain("u05");
    const c = candidatesOf(units);
    expect(c.length).toBeGreaterThan(10);
    expect(unseenCount(c, emptyMore())).toBe(c.length);
  });

  it("el estado se guarda, sobrevive a una copia y se borra con «Borrar progreso»", () => {
    const s = new Mem();
    saveMore(markServed(emptyMore(), ["u04-e00"]), s);
    expect(loadMore(s).served["u04-e00"]).toBe(1);
    const backup = buildBackup(s);
    expect(backup.data[KEYS_V2.practiceMore]).toBeDefined();
    const parsed = parseBackup(serializeBackup(backup));
    expect(parsed.ok).toBe(true);
    expect(BACKUP_VERSION).toBeGreaterThan(0);
    clearProgress(s);
    expect(s.getItem(KEYS_V2.practiceMore)).toBeNull();
  });

  it("un valor guardado con la forma equivocada se ignora", () => {
    for (const bad of ["null", "123", "{roto", "[]", '{"version":2,"served":{}}', '{"version":1,"served":[]}']) {
      const s = new Mem();
      s.setItem(KEYS_V2.practiceMore, bad);
      expect(loadMore(s)).toEqual(emptyMore());
    }
  });

  it("una copia con la clave de otro tipo se rechaza", () => {
    const b = { app: buildBackup(new Mem()).app, version: BACKUP_VERSION, exportedAt: new Date().toISOString(), data: { [KEYS_V2.practiceMore]: "[]" } };
    expect(parseBackup(JSON.stringify(b)).ok).toBe(false);
  });
});
