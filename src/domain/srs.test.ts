import { describe, expect, it } from "vitest";
import { UNITS } from "../content/curriculum";
import { buildBackup, parseBackup, restoreBackup, serializeBackup, summarizeBackup, type EnumerableKV } from "./backup";
import { rng } from "./review";
import {
  LOG_MAX, addCardIfMissing, applyReview, cardId, emptySrs, ensureSrs, loadSrs, newSrsCard, rateCard, rerateLast,
  saveSrs, seedSrsCard, unlockProdCards, type SrsState,
} from "./srs";
import { choicesFor, emptyContext, resolveCard, sentenceItemId, wordsOfUnit } from "./srsDeck";
import { easyRating, gradeWriting, ratingForChoice, ratingForWriting, typoRating } from "./srsGrade";
import { LIMITS, answeredToday, buildQueue } from "./srsQueue";
import { KEYS, SRS_KEY } from "./storage";

class FakeStore implements EnumerableKV {
  private map = new Map<string, string>();
  get length() { return this.map.size; }
  key(i: number) { return [...this.map.keys()][i] ?? null; }
  getItem(k: string) { return this.map.get(k) ?? null; }
  setItem(k: string, v: string) { this.map.set(k, v); }
  removeItem(k: string) { this.map.delete(k); }
}

const day = (n: number, hour = 12) => new Date(2026, 0, 1 + n, hour);
const u01 = wordsOfUnit("u01");

describe("calificación", () => {
  it("opción múltiple: Good, Hard con pista, Again", () => {
    expect(ratingForChoice(true, false)).toBe(3);
    expect(ratingForChoice(true, true)).toBe(2);
    expect(ratingForChoice(false, false)).toBe(1);
    expect(ratingForChoice(false, true)).toBe(1);
  });

  it("escritura: exacta = Good, tilde o apóstrofo = Hard, otra cosa = Again", () => {
    expect(ratingForWriting(gradeWriting("il caffè", ["il caffè"]))).toBe(3);
    expect(gradeWriting("  IL   Caffè ", ["il caffè"])).toBe("exact");
    expect(gradeWriting("il caffe", ["il caffè"])).toBe("close");
    expect(gradeWriting("perche", ["perché"])).toBe("close");
    expect(gradeWriting("è", ["e"])).toBe("close");
    expect(gradeWriting("lho visto", ["l'ho visto"])).toBe("close");
    expect(gradeWriting("l’ho visto", ["l'ho visto"])).toBe("exact");
    expect(ratingForWriting(gradeWriting("il caffe", ["il caffè"]))).toBe(2);
    expect(gradeWriting("il tè", ["il caffè"])).toBe("wrong");
    expect(gradeWriting("", ["il caffè"])).toBe("wrong");
    expect(ratingForWriting("wrong")).toBe(1);
  });

  it("ignora la puntuación final y acepta cualquiera de varias respuestas", () => {
    expect(gradeWriting("Vorrei un caffè.", ["vorrei un caffè"])).toBe("exact");
    expect(gradeWriting("sono", ["sono", "siamo"])).toBe("exact");
  });

  it("«Me equivoqué al escribir» sube Again a Hard y «Fácil» sube Good a Easy; no tocan otras", () => {
    expect([1, 2, 3, 4].map((r) => typoRating(r as 1))).toEqual([2, 2, 3, 4]);
    expect([1, 2, 3, 4].map((r) => easyRating(r as 1))).toEqual([1, 2, 4, 4]);
  });
});

describe("tarjetas y FSRS", () => {
  it("una tarjeta nueva vence ahora; Good la aleja y Again la deja más cerca", () => {
    const c = newSrsCard({ kind: "recog", itemId: u01[0].itemId, unit: "u01" }, day(0));
    expect(c.id).toBe(`recog:${u01[0].itemId}`);
    const good = rateCard(c, 3, day(0));
    const again = rateCard(c, 1, day(0));
    expect(new Date(good.fsrs.due).getTime()).toBeGreaterThan(day(0).getTime());
    expect(new Date(good.fsrs.due).getTime()).toBeGreaterThan(new Date(again.fsrs.due).getTime());
    expect(good.fsrs.reps).toBe(1);
  });

  it("rerateLast reemplaza la calificación guardada, sin duplicar el historial", () => {
    const c = newSrsCard({ kind: "prod", itemId: "x", unit: "u01" }, day(0));
    let s: SrsState = applyReview(emptySrs(), c, 1, day(0), 900);
    s = rerateLast(s, c, 2, day(0), 900);
    expect(s.log).toHaveLength(1);
    expect(s.log[0].rating).toBe(2);
    expect(s.cards[c.id].fsrs.lapses).toBe(rateCard(c, 2, day(0)).fsrs.lapses);
  });

  it("el historial se recorta a 3000 entradas", () => {
    const c = newSrsCard({ kind: "recog", itemId: "a", unit: "u01" }, day(0));
    let s = emptySrs();
    for (let i = 0; i < LOG_MAX + 25; i++) s = applyReview(s, s.cards[c.id] ?? c, 3, day(0), i);
    expect(s.log).toHaveLength(LOG_MAX);
    expect(s.log[LOG_MAX - 1].ms).toBe(LOG_MAX + 24);
  });

  it("producir se desbloquea cuando reconocer llega a estabilidad 4 días, y una sola vez", () => {
    const c = newSrsCard({ kind: "recog", itemId: "a", unit: "u01" }, day(0));
    let s: SrsState = { ...emptySrs(), cards: { [c.id]: { ...c, fsrs: { ...c.fsrs, stability: 3.9 } } } };
    expect(Object.keys(unlockProdCards(s, day(1)).cards)).toEqual([c.id]);
    s = { ...s, cards: { [c.id]: { ...c, fsrs: { ...c.fsrs, stability: 4 } } } };
    const after = unlockProdCards(s, day(1));
    expect(Object.keys(after.cards).sort()).toEqual([c.id, cardId("prod", "a")].sort());
    expect(unlockProdCards(after, day(1))).toBe(after);
  });

  it("las tarjetas del mazo general (y las del antiguo mazo de Quizlet) no generan tarjeta de producir", () => {
    const c = { ...newSrsCard({ kind: "recog", itemId: "q1", unit: "extra" }, day(0)), deck: "quizlet" as const };
    const s: SrsState = { ...emptySrs(), cards: { [c.id]: { ...c, fsrs: { ...c.fsrs, stability: 30 } } } };
    expect(unlockProdCards(s, day(1))).toBe(s);
  });

  it("permite crear una tarjeta sembrada con estado inicial y marca source:seed", () => {
    const c = seedSrsCard({ kind: "recog", itemId: "a", unit: "u01", stability: 7, difficulty: 5, lapses: 1, due: day(5) }, day(0));
    expect(c.source).toBe("seed");
    expect(c.fsrs).toMatchObject({ stability: 7, difficulty: 5, lapses: 1, state: 2 });
    expect(new Date(c.fsrs.due).getTime()).toBe(day(5).getTime());
    expect(rateCard(c, 3, day(5)).fsrs.stability).toBeGreaterThan(7);
  });

  it("un fallo en práctica o dictado agrega la tarjeta cloze o listen una sola vez", () => {
    let s = addCardIfMissing(emptySrs(), { kind: "cloze", itemId: "u04-e03", unit: "u04" }, day(0));
    s = addCardIfMissing(s, { kind: "listen", itemId: "u04:d-x", unit: "u04" }, day(0));
    expect(addCardIfMissing(s, { kind: "cloze", itemId: "u04-e03", unit: "u04" }, day(3))).toBe(s);
    expect(Object.keys(s.cards)).toHaveLength(2);
  });
});

describe("contenido de las tarjetas", () => {
  it("resuelve palabra, completar (de un ejercicio fill) y dictado; null si ya no existe", () => {
    const w = u01[0];
    expect(resolveCard(newSrsCard({ kind: "recog", itemId: w.itemId, unit: "u01" }, day(0)), emptyContext()))
      .toMatchObject({ kind: "recog", it: w.it, es: w.es });
    expect(resolveCard(newSrsCard({ kind: "recog", itemId: "u01:no-existe", unit: "u01" }, day(0)), emptyContext())).toBeNull();
    const cloze = resolveCard(newSrsCard({ kind: "cloze", itemId: "u01-e00", unit: "u01" }, day(0)), emptyContext());
    if (cloze) expect(cloze.kind).toBe("cloze");
    const d = (resolveCard(newSrsCard({ kind: "listen", itemId: sentenceItemId("u01", "Mi chiamo Marco."), unit: "u01" }, day(0)), emptyContext()));
    expect(d).toMatchObject({ kind: "listen", it: "Mi chiamo Marco." });
  });

  it("las opciones traen el significado correcto y distractores distintos, estables por tarjeta", () => {
    const w = u01[3];
    const card = newSrsCard({ kind: "recog", itemId: w.itemId, unit: "u01" }, day(0));
    const a = choicesFor(card, w.es, emptyContext(), ["u01", "u02"]);
    expect(a.options).toHaveLength(4);
    expect(new Set(a.options).size).toBe(4);
    expect(a.options[a.answerIndex]).toBe(w.es);
    expect(choicesFor(card, w.es, emptyContext(), ["u01", "u02"])).toEqual(a);
  });
});

describe("cola diaria", () => {
  const units = ["u01", "u02", "u03"];
  const dueCards = (n: number, at: Date): SrsState => {
    const cards: SrsState["cards"] = {};
    for (let i = 0; i < n; i++) {
      const c = newSrsCard({ kind: "prod", itemId: `d${i}`, unit: "u01" }, at);
      cards[c.id] = { ...c, fsrs: { ...c.fsrs, due: new Date(at.getTime() - i * 3_600_000).toISOString() } };
    }
    return { ...emptySrs(), cards };
  };

  it("máximo 8 palabras nuevas por día, en el orden del vocabulario", () => {
    const q = buildQueue({ state: emptySrs(), today: day(0), eligibleUnits: units });
    expect(q.items).toHaveLength(8);
    expect(q.items.every((i) => i.type === "new")).toBe(true);
    expect(q.items.map((i) => i.type === "new" && i.candidate.itemId)).toEqual(u01.slice(0, 8).map((w) => w.itemId));
  });

  it("las nuevas ya introducidas hoy descuentan del tope", () => {
    let s = emptySrs();
    for (const w of u01.slice(0, 5)) s = applyReview(s, newSrsCard({ kind: "recog", itemId: w.itemId, unit: "u01" }, day(0)), 3, day(0), 1);
    const q = buildQueue({ state: s, today: day(0), eligibleUnits: units });
    expect(q.items.filter((i) => i.type === "new")).toHaveLength(3);
    expect(q.items.some((i) => i.type === "new" && u01.slice(0, 5).some((w) => w.itemId === i.candidate.itemId))).toBe(false);
  });

  it("sin unidades con «Palabras nuevas» vistas no hay nuevas", () => {
    expect(buildQueue({ state: emptySrs(), today: day(0), eligibleUnits: [] }).items).toHaveLength(0);
  });

  it("vencidas primero (la más atrasada antes) y luego nuevas", () => {
    const q = buildQueue({ state: dueCards(3, day(0)), today: day(0), eligibleUnits: units });
    const kinds = q.items.map((i) => i.type);
    expect(kinds).toEqual(["due", "due", "due", ...Array(8).fill("new")]);
    const dues = q.items.flatMap((i) => (i.type === "due" ? [i.card.fsrs.due] : []));
    expect([...dues].sort()).toEqual(dues);
  });

  it("con más de 40 vencidas no se introducen nuevas (con 40 justos sí)", () => {
    expect(buildQueue({ state: dueCards(41, day(0)), today: day(0), eligibleUnits: units }).items.some((i) => i.type === "new")).toBe(false);
    expect(buildQueue({ state: dueCards(41, day(0)), today: day(0), eligibleUnits: units }).newBlocked).toBe(true);
    expect(buildQueue({ state: dueCards(40, day(0)), today: day(0), eligibleUnits: units }).items.some((i) => i.type === "new")).toBe(true);
  });

  it("tras 3 días sin abrir, las vencidas visibles se limitan a lo habitual +30 % y el resto se pospone", () => {
    const base = dueCards(50, day(0));
    const log = Array.from({ length: 20 }, (_, i) => ({ cardId: `x${i}`, at: day(-1).toISOString(), rating: 3 as const, ms: 1 }));
    const state: SrsState = { ...base, log };
    const back = buildQueue({ state, today: day(2), eligibleUnits: [] }); // 3 días después del último repaso
    expect(back.absent).toBe(3);
    expect(back.items).toHaveLength(26); // 20 habituales * 1,3
    expect(back.postponed).toBe(24);
    const near = buildQueue({ state, today: day(1), eligibleUnits: [] }); // solo 2 días: sin límite
    expect(near.postponed).toBe(0);
    expect(near.items).toHaveLength(50);
  });

  it("answeredToday cuenta solo las respuestas del día", () => {
    const c = newSrsCard({ kind: "recog", itemId: "a", unit: "u01" }, day(0));
    let s = applyReview(emptySrs(), c, 3, day(0), 1);
    s = applyReview(s, s.cards[c.id], 3, day(1), 1);
    expect(answeredToday(s, day(1))).toBe(1);
    expect(LIMITS.session).toBe(20);
  });
});

describe("guardado y copia de seguridad", () => {
  const sample = (): SrsState => {
    let s = emptySrs();
    for (const w of u01.slice(0, 4)) s = applyReview(s, newSrsCard({ kind: "recog", itemId: w.itemId, unit: "u01" }, day(0)), 3, day(0), 800);
    s = addCardIfMissing(s, { kind: "cloze", itemId: "u04-e03", unit: "u04" }, day(0));
    return { ...s, options: { quizlet: true } };
  };

  it("guardar y cargar devuelve lo mismo; sin clave o dañada devuelve vacío; ensure no pisa", () => {
    const store = new FakeStore();
    expect(loadSrs(store)).toEqual(emptySrs());
    saveSrs(sample(), store);
    expect(loadSrs(store)).toEqual(sample());
    ensureSrs(store);
    expect(loadSrs(store)).toEqual(sample());
    store.setItem(SRS_KEY, "{no es json");
    expect(loadSrs(store)).toEqual(emptySrs());
    const fresh = new FakeStore();
    ensureSrs(fresh);
    expect(fresh.getItem(SRS_KEY)).not.toBeNull();
  });

  it("la copia (versión 2) exporta e importa las tarjetas idénticas y las cuenta en el resumen", () => {
    const a = new FakeStore();
    a.setItem(KEYS.startDate, "2026-01-01");
    a.setItem(KEYS.completions, JSON.stringify({ "2026-01-01": { "u01.s2.vocab": true } }));
    saveSrs(sample(), a);
    const file = serializeBackup(buildBackup(a, day(3)));
    const parsed = parseBackup(file);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.backup.version).toBe(2);
    expect(parsed.summary.srsCards).toBe(5);
    expect(parsed.ignored).toEqual([]);
    const b = new FakeStore();
    restoreBackup(parsed.backup, b);
    expect(loadSrs(b)).toEqual(sample());
    expect(b.getItem(SRS_KEY)).toBe(a.getItem(SRS_KEY));
    expect(summarizeBackup(parsed.backup).srsCards).toBe(5);
  });

  it("una copia de versión 1 (sin tarjetas) sigue importándose y deja el repaso vacío", () => {
    const v1 = JSON.stringify({ app: "italiano-plan", version: 1, exportedAt: "2026-10-20T10:00:00.000Z", data: { [KEYS.startDate]: "2026-10-01" } });
    const r = parseBackup(v1);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.summary.srsCards).toBe(0);
  });

  it("rechaza un estado de repaso dañado dentro de la copia", () => {
    const f = JSON.parse(serializeBackup(buildBackup((() => { const s = new FakeStore(); s.setItem(KEYS.startDate, "2026-01-01"); saveSrs(sample(), s); return s; })(), day(3))));
    f.data[SRS_KEY] = JSON.stringify({ version: 1, cards: [] });
    expect(parseBackup(JSON.stringify(f)).ok).toBe(false);
    f.data[SRS_KEY] = JSON.stringify({ version: 9, cards: {} });
    expect(parseBackup(JSON.stringify(f)).ok).toBe(false);
  });
});

describe("simulación de 60 días", () => {
  /** Estudiante que cada día hace TODA la cola: 8 nuevas diarias y 90 % de aciertos. */
  function simulate(seed: string, days = 60, accuracy = 0.9): { perDay: number[]; newPerDay: number[] } {
    const rand = rng(seed);
    const eligibleUnits = UNITS.filter((u) => u.ready).map((u) => u.id);
    let state = emptySrs();
    const perDay: number[] = [];
    const newPerDay: number[] = [];
    for (let d = 0; d < days; d++) {
      const now = day(d);
      state = unlockProdCards(state, now);
      const q = buildQueue({ state, today: now, eligibleUnits });
      for (const item of q.items) {
        const card = item.type === "due" ? item.card
          : newSrsCard(item.candidate, now);
        state = applyReview(state, card, rand() < accuracy ? 3 : 1, now, 1000);
      }
      perDay.push(q.items.length);
      newPerDay.push(q.items.filter((i) => i.type === "new").length);
    }
    return { perDay, newPerDay };
  }

  it("con 8 nuevas diarias y 90 % de aciertos, el promedio después del día 30 no pasa de 60 repasos", () => {
    for (const seed of ["a", "b", "c"]) {
      const { perDay } = simulate(seed);
      const after = perDay.slice(30);
      const avg = after.reduce((a, b) => a + b, 0) / after.length;
      expect(avg, `semilla ${seed}: ${perDay.join(",")}`).toBeLessThanOrEqual(60);
    }
  });

  it("nunca se introducen más de 8 palabras nuevas por día", () => {
    const { newPerDay } = simulate("z", 40);
    expect(Math.max(...newPerDay)).toBe(8);
  });
});
