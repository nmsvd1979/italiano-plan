import { describe, expect, it } from "vitest";
import { AVANCE_INICIAL } from "../content/avance-inicial";
import { UNITS, sessionsOf } from "../content/curriculum";
import { applySeed, canOfferSeed, seedKeys } from "./seed";
import { KEYS, KEYS_V2, getCompletions, clearProgress } from "./storage";
import { computeStreak } from "./progress";
import { parseISODate } from "./dates";
import type { EnumerableKV } from "./backup";

class FakeStore implements EnumerableKV {
  private map = new Map<string, string>();
  get length() { return this.map.size; }
  key(i: number) { return [...this.map.keys()][i] ?? null; }
  getItem(k: string) { return this.map.get(k) ?? null; }
  setItem(k: string, v: string) { this.map.set(k, v); }
  removeItem(k: string) { this.map.delete(k); }
  snapshot() { return Object.fromEntries([...this.map].sort(([a], [b]) => a.localeCompare(b))); }
}

const NOW = new Date("2026-10-28T09:00:00Z");

describe("semilla de avance", () => {
  it("cubre las 17 de las 22 actividades de u01 (sesiones 1 a 5) y ninguna de la sesión 6", () => {
    const u01 = UNITS.find((u) => u.id === "u01")!;
    const all = sessionsOf(u01).flatMap((s) => s.activities.map((a) => `u01.s${s.index}.${a.id}`));
    const keys = seedKeys();
    expect(all).toHaveLength(22);
    expect(keys).toHaveLength(17);
    expect(keys.every((k) => all.includes(k))).toBe(true);
    expect(keys.some((k) => k.startsWith("u01.s6."))).toBe(false);
  });

  it("en un dispositivo sin marcas se ofrece, y al aplicarla agrega las 17 marcas en la fecha del avance", () => {
    const s = new FakeStore();
    expect(canOfferSeed(s)).toBe(true);
    expect(applySeed(s, NOW)).toBe(17);
    const c = getCompletions(s);
    expect(Object.keys(c)).toEqual([AVANCE_INICIAL.fecha]);
    expect(Object.keys(c[AVANCE_INICIAL.fecha]).sort()).toEqual(seedKeys().sort());
    expect(s.getItem(KEYS_V2.seedApplied)).not.toBeNull();
    expect(canOfferSeed(s)).toBe(false);
  });

  it("es idempotente: aplicarla dos veces deja exactamente lo mismo", () => {
    const s = new FakeStore();
    applySeed(s, NOW);
    const once = s.snapshot();
    expect(applySeed(s, new Date("2026-11-05T09:00:00Z"))).toBe(0);
    expect(s.snapshot()).toEqual(once);
  });

  it("si la persona desmarca algo después, volver a aplicarla no lo vuelve a marcar", () => {
    const s = new FakeStore();
    applySeed(s, NOW);
    const c = getCompletions(s);
    delete c[AVANCE_INICIAL.fecha]["u01.s1.pron"];
    s.setItem(KEYS.completions, JSON.stringify(c));
    expect(applySeed(s, NOW)).toBe(0);
    expect(getCompletions(s)[AVANCE_INICIAL.fecha]["u01.s1.pron"]).toBeUndefined();
  });

  it("no se ofrece si ya hay marcas de u01 en el dispositivo", () => {
    const s = new FakeStore();
    s.setItem(KEYS.completions, JSON.stringify({ "2026-10-20": { "u01.s1.quizlet": true } }));
    expect(canOfferSeed(s)).toBe(false);
  });

  it("se ofrece si solo hay marcas de otras unidades o de la app anterior", () => {
    const s = new FakeStore();
    s.setItem(KEYS.completions, JSON.stringify({ "2026-10-20": { anki: true, "u02.s1.quizlet": true } }));
    expect(canOfferSeed(s)).toBe(true);
  });

  it("nunca sobrescribe ni borra marcas existentes: conserva su fecha y solo agrega las que faltan", () => {
    const s = new FakeStore();
    const before = {
      "2026-10-15": { "u01.s1.quizlet": true, "u02.s1.quizlet": true, anki: true },
      "2026-10-20": { "u99.s1.x": true },
    };
    // Simula marcas de u01 que ya tenía: el botón no se ofrece, pero si se llamara igual, no debe pisarlas.
    s.setItem(KEYS.completions, JSON.stringify(before));
    expect(applySeed(s, NOW)).toBe(16);
    const after = getCompletions(s);
    expect(after["2026-10-15"]).toEqual(before["2026-10-15"]);
    expect(after["2026-10-20"]).toEqual(before["2026-10-20"]);
    expect(Object.keys(after[AVANCE_INICIAL.fecha])).not.toContain("u01.s1.quizlet");
    expect(Object.keys(after[AVANCE_INICIAL.fecha])).toHaveLength(16);
  });

  it("no cambia ninguna otra clave antigua ni inventa racha", () => {
    const s = new FakeStore();
    s.setItem(KEYS.startDate, "2026-10-20");
    s.setItem(KEYS.startUnit, "1");
    s.setItem(KEYS.settings, JSON.stringify({ dailyMinutes: 30 }));
    s.setItem(KEYS.review, JSON.stringify({ "u01:e1": { box: 1, due: "2026-10-30" } }));
    s.setItem(KEYS.skipped, JSON.stringify(["u01.s2.vocab"]));
    s.setItem(KEYS.writing, JSON.stringify({ u01: "Mi chiamo Nicolás." }));
    const before = s.snapshot();
    applySeed(s, NOW);
    const after = s.snapshot();
    for (const [k, v] of Object.entries(before)) expect(after[k], k).toBe(v);
    expect(Object.keys(after).sort()).toEqual([...Object.keys(before), KEYS.completions, KEYS_V2.seedApplied].sort());
    // Un solo día marcado (27-oct): al día siguiente la racha es 1, dos días después ya se cortó.
    expect(computeStreak(getCompletions(s), parseISODate("2026-10-28"))).toBe(1);
    expect(computeStreak(getCompletions(s), parseISODate("2026-10-30"))).toBe(0);
  });

  it("al borrar el progreso desde Ajustes, la semilla vuelve a poder ofrecerse", () => {
    const s = new FakeStore();
    applySeed(s, NOW);
    clearProgress(s);
    expect(canOfferSeed(s)).toBe(true);
  });
});
