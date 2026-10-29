import { describe, expect, it } from "vitest";
import { UNITS } from "../content/curriculum";
import { getVocab, getWords, loadGeneralDeck, type GeneralWord } from "../content/vocab";
import type { UnitView } from "./continuity";
import { planSeed } from "./continuitySeed";
import {
  applyReview, emptySrs, generalOn, loadSrs, newSrsCard, rateCard, rerateLast, saveSrs, type SrsCard, type SrsState,
} from "./srs";
import { allWordsOfUnit, choicesFor, contextOf, emptyContext, generalItemId, resolveCard, wordItemId, wordsOfUnit } from "./srsDeck";
import {
  LIMITS, buildExtraBatch, buildQueue, extraToday, mixNew, newUnitWords, nextDue, type NewCandidate, type QueueItem,
} from "./srsQueue";
import { SRS_KEY, type KV } from "./storage";

const day = (n: number, hour = 12) => new Date(2026, 0, 1 + n, hour);

class FakeStore implements KV {
  private map = new Map<string, string>();
  getItem(k: string) { return this.map.get(k) ?? null; }
  setItem(k: string, v: string) { this.map.set(k, v); }
  removeItem(k: string) { this.map.delete(k); }
}

let deck: GeneralWord[] = [];
const loadDeck = async () => (deck = deck.length ? deck : await loadGeneralDeck());

/** Tarjeta de reconocer con vencimiento en `inDays` días a partir de `at`. */
function cardDue(itemId: string, unit: string, at: Date, inDays: number, deckName?: "general"): SrsCard {
  const c = newSrsCard({ kind: "recog", itemId, unit, ...(deckName ? { deck: deckName } : {}) }, at);
  const due = new Date(at.getTime() + inDays * 86_400_000);
  return { ...c, fsrs: { ...c.fsrs, due: due.toISOString() } };
}
const stateOf = (cards: SrsCard[], more: Partial<SrsState> = {}): SrsState => ({
  ...emptySrs(), cards: Object.fromEntries(cards.map((c) => [c.id, c])), ...more,
});
const candidates = (items: QueueItem[]) => items.flatMap((i) => (i.type === "new" ? [i.candidate] : []));

describe("palabras nuevas de una unidad salen de la lista ampliada", () => {
  it("allWordsOfUnit trae el núcleo y la ampliación; wordsOfUnit, solo el núcleo", () => {
    for (const u of ["u01", "u02", "u15", "u28"]) {
      const core = wordsOfUnit(u);
      const all = allWordsOfUnit(u);
      expect(core).toHaveLength(new Set(getVocab(u)!.map((w) => wordItemId(u, w.it))).size);
      expect(all.length).toBeGreaterThan(core.length + 20);
      expect(all.slice(0, core.length).map((w) => w.itemId)).toEqual(core.map((w) => w.itemId));
      expect(core.some((w) => w.extra)).toBe(false);
    }
  });

  it("la cola introduce primero el núcleo y después la ampliación, sin repetir", () => {
    const list = newUnitWords(emptySrs(), ["u01", "u02"], {});
    const ids = list.map((c) => c.itemId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(allWordsOfUnit("u01").length + allWordsOfUnit("u02").length);
    const coreCount = wordsOfUnit("u01").length + wordsOfUnit("u02").length;
    expect(ids.slice(0, coreCount)).toEqual([...wordsOfUnit("u01"), ...wordsOfUnit("u02")].map((w) => w.itemId));
  });

  it("en una unidad partida no introduce la ampliación de una semana que aún no viste", () => {
    const onlyA = newUnitWords(emptySrs(), ["u02"], { u02: ["A"] }).map((c) => c.itemId);
    const bExtras = getWords("u02")!.filter((w) => w.extra && w.part === "B").map((w) => wordItemId("u02", w.it));
    const aExtras = getWords("u02")!.filter((w) => w.extra && w.part === "A").map((w) => wordItemId("u02", w.it));
    expect(bExtras.length).toBeGreaterThan(0);
    expect(onlyA.some((id) => bExtras.includes(id))).toBe(false);
    expect(aExtras.every((id) => onlyA.includes(id))).toBe(true);
    const both = newUnitWords(emptySrs(), ["u02"], { u02: ["A", "B"] }).map((c) => c.itemId);
    expect(bExtras.every((id) => both.includes(id))).toBe(true);
  });

  it("una tarjeta de una palabra de la ampliación se resuelve con su frase de ejemplo", () => {
    const w = allWordsOfUnit("u03").find((x) => x.extra)!;
    const r = resolveCard(newSrsCard({ kind: "recog", itemId: w.itemId, unit: "u03" }, day(0)), emptyContext());
    expect(r).toEqual({ kind: "recog", it: w.it, es: w.es, ex: w.ex, exEs: w.exEs });
  });
});

describe("siembra de continuidad: solo el núcleo", () => {
  const views = UNITS.filter((u) => u.ready && u.n <= 24).map((unit): UnitView => ({
    unit, marks: {} as UnitView["marks"], verdict: "dominada", source: "marcas", diagnosable: false, pendingDiagnostic: false,
  }));

  it("ninguna palabra de la ampliación se siembra como conocida", () => {
    const plan = planSeed(views, [], {}, {}, day(0));
    const seededWords = plan.cards.filter((c) => c.kind === "recog");
    expect(seededWords.length).toBeGreaterThan(100);
    const extras = new Set(UNITS.flatMap((u) => allWordsOfUnit(u.id).filter((w) => w.extra).map((w) => w.itemId)));
    const core = new Set(UNITS.flatMap((u) => wordsOfUnit(u.id).map((w) => w.itemId)));
    expect(extras.size).toBeGreaterThan(500);
    expect(seededWords.filter((c) => extras.has(c.itemId))).toEqual([]);
    expect(seededWords.every((c) => core.has(c.itemId))).toBe(true);
  });

  it("tras sembrar, las palabras de la ampliación siguen saliendo como nuevas en la cola", () => {
    const plan = planSeed(views, [], {}, {}, day(0));
    const state = stateOf(plan.cards);
    const extra = allWordsOfUnit("u04").find((w) => w.extra)!;
    expect(state.cards[`recog:${extra.itemId}`]).toBeUndefined();
    expect(newUnitWords(state, ["u04"], {}).some((c) => c.itemId === extra.itemId)).toBe(true);
  });
});

describe("mazo general en la cola", () => {
  const units = ["u01", "u02", "u03"];

  it("ids estables a partir de la palabra, no de su posición", async () => {
    const d = await loadDeck();
    expect(generalItemId("unire")).toBe("g:unire");
    const ids = d.map((w) => generalItemId(w.it));
    expect(new Set(ids).size).toBe(d.length);
    const reversed = [...d].reverse().map((w) => generalItemId(w.it)).reverse();
    expect(reversed).toEqual(ids);
  });

  it("viene activado por defecto: 8 de unidad y 5 generales, intercaladas (≈60 / 40)", async () => {
    const d = await loadDeck();
    const state = emptySrs();
    expect(generalOn(state)).toBe(true);
    const fresh = candidates(buildQueue({ state, today: day(0), eligibleUnits: units, general: d }).items);
    expect(fresh).toHaveLength(13);
    const isGen = fresh.map((c) => c.deck === "general");
    expect(isGen.filter(Boolean)).toHaveLength(LIMITS.generalNewPerDay);
    expect(isGen[0]).toBe(false);
    for (let i = 1; i < isGen.length; i++) expect(isGen[i] && isGen[i - 1]).toBe(false);
    expect(isGen.slice(0, 5).filter(Boolean).length).toBeGreaterThanOrEqual(2);
    expect(fresh.filter((c) => c.deck === "general").every((c) => c.kind === "recog" && c.unit === "general")).toBe(true);
  });

  it("mixNew reparte ≈60/40 y respeta cuando falta una de las dos fuentes", () => {
    const mk = (n: number, deckName?: "general"): NewCandidate[] =>
      Array.from({ length: n }, (_, i) => ({ kind: "recog", itemId: `${deckName ?? "u"}${i}`, unit: "x", ...(deckName ? { deck: deckName } : {}) }));
    const mixed = mixNew(mk(6), mk(4, "general"));
    expect(mixed.map((c) => (c.deck ? "G" : "U")).join("")).toBe("UGUGUUGUGU");
    expect(mixNew(mk(3), []).map((c) => c.itemId)).toEqual(["u0", "u1", "u2"]);
    expect(mixNew([], mk(3, "general"))).toHaveLength(3);
  });

  it("el tope de 5 generales por día cuenta las ya introducidas hoy; los de unidad se cuentan aparte", async () => {
    const d = await loadDeck();
    const cards = d.slice(0, 3).map((w) => cardDue(generalItemId(w.it), "general", day(0), 5, "general"));
    const fresh = candidates(buildQueue({ state: stateOf(cards), today: day(0), eligibleUnits: units, general: d }).items);
    expect(fresh.filter((c) => c.deck === "general")).toHaveLength(2);
    expect(fresh.filter((c) => !c.deck)).toHaveLength(8);
    expect(fresh.some((c) => cards.some((x) => x.itemId === c.itemId))).toBe(false);
  });

  it("apagado en Ajustes no hay generales; sin unidades elegibles solo hay generales", async () => {
    const d = await loadDeck();
    const off = candidates(buildQueue({ state: { ...emptySrs(), options: { general: false } }, today: day(0), eligibleUnits: units, general: d }).items);
    expect(off).toHaveLength(8);
    expect(off.some((c) => c.deck === "general")).toBe(false);
    const only = candidates(buildQueue({ state: emptySrs(), today: day(0), eligibleUnits: [], general: d }).items);
    expect(only).toHaveLength(5);
    expect(only.every((c) => c.deck === "general")).toBe(true);
  });

  it("la tarjeta general se resuelve con su frase y las opciones salen de la misma clase de palabra", async () => {
    const d = await loadDeck();
    const ctx = contextOf(d);
    const w = d.find((x) => x.pos === "v")!;
    const card = newSrsCard({ kind: "recog", itemId: generalItemId(w.it), unit: "general", deck: "general" }, day(0));
    expect(resolveCard(card, ctx)).toEqual({ kind: "recog", it: w.it, es: w.es, ex: w.ex, exEs: w.exEs });
    expect(resolveCard(card, emptyContext())).toBeNull();
    const opts = choicesFor(card, w.es, ctx, units);
    expect(opts.options[opts.answerIndex]).toBe(w.es);
    expect(new Set(opts.options).size).toBe(opts.options.length);
    expect(opts.options.length).toBe(4);
  });

  it("las tarjetas antiguas del mazo de Quizlet se ignoran sin errores y se conservan", async () => {
    const d = await loadDeck();
    const old = { ...newSrsCard({ kind: "recog", itemId: "q7", unit: "extra" }, day(0)), deck: "quizlet" as const };
    const state = stateOf([{ ...old, fsrs: { ...old.fsrs, due: day(-2).toISOString() } }], { options: { quizlet: true } });
    const q = buildQueue({ state, today: day(0), eligibleUnits: [], general: d });
    expect(q.dueTotal).toBe(0);
    expect(q.items.every((i) => i.type === "new")).toBe(true);
    expect(resolveCard(state.cards[old.id], contextOf(d))).toBeNull();
    expect(nextDue(state, day(0))).toBeNull();
    expect(buildExtraBatch({ state, today: day(0), eligibleUnits: [], general: [] }).blocked).toBe("empty");
  });
});

describe("compatibilidad del formato guardado", () => {
  it("lee el formato anterior (options.quizlet, tarjetas deck quizlet, sin options.general) y no pierde nada", () => {
    const store = new FakeStore();
    const old = newSrsCard({ kind: "recog", itemId: "q7", unit: "extra" }, day(0));
    const raw = {
      version: 1,
      cards: { [old.id]: { ...old, deck: "quizlet" }, ...stateOf([newSrsCard({ kind: "recog", itemId: "u01:ciao", unit: "u01" }, day(0))]).cards },
      log: [{ cardId: old.id, at: day(0).toISOString(), rating: 3, ms: 900 }],
      options: { quizlet: true },
    };
    store.setItem(SRS_KEY, JSON.stringify(raw));
    const loaded = loadSrs(store);
    expect(generalOn(loaded)).toBe(true);
    expect(Object.keys(loaded.cards)).toEqual(Object.keys(raw.cards));
    expect(loaded.cards[old.id].deck).toBe("quizlet");
    expect(loaded.options).toEqual({ quizlet: true });
    expect(loaded.log).toEqual(raw.log);
    saveSrs({ ...loaded, options: { ...loaded.options, general: false } }, store);
    const again = loadSrs(store);
    expect(generalOn(again)).toBe(false);
    expect(again.options).toEqual({ quizlet: true, general: false });
    expect(Object.keys(again.cards)).toEqual(Object.keys(raw.cards));
  });
});

describe("«Practicar más»", () => {
  const units = ["u01"];
  const all = allWordsOfUnit("u01");

  /** Todas las palabras de u01 con tarjeta lejana salvo las `fresh` últimas; tres vencen en 1, 2 y 3 días y una en 5. */
  function scenario(fresh: number): SrsState {
    const carded = all.slice(0, all.length - fresh);
    const cards = carded.map((w, i) => cardDue(w.itemId, "u01", day(0), i === 0 ? 1 : i === 1 ? 2 : i === 2 ? 3 : i === 3 ? 5 : 60));
    return stateOf(cards);
  }

  it("arma 20 en este orden: vencen en 3 días, nuevas de unidad, nuevas del mazo general", async () => {
    const d = await loadDeck();
    const batch = buildExtraBatch({ state: scenario(4), today: day(0), eligibleUnits: units, general: d });
    expect(batch.items).toHaveLength(LIMITS.extraBatch);
    expect(batch.blocked).toBeNull();
    const kinds = batch.items.map((i) => (i.type === "due" ? "D" : i.candidate.deck === "general" ? "G" : "U")).join("");
    expect(kinds).toBe("DDD" + "UUUU" + "G".repeat(13));
    const dues = batch.items.flatMap((i) => (i.type === "due" ? [i.card.fsrs.due] : []));
    expect([...dues].sort()).toEqual(dues);
    // La que vence en 5 días queda fuera.
    expect(batch.items.some((i) => i.type === "due" && i.card.itemId === all[3].itemId)).toBe(false);
  });

  it("tope de 40 tarjetas extra por día, en tandas de 20", async () => {
    const d = await loadDeck();
    const base = scenario(0);
    const log = (n: number) => Array.from({ length: n }, (_, i) => ({ cardId: `x${i}`, at: day(0, 9 + (i % 3)).toISOString(), rating: 3 as const, ms: 1, extra: true as const }));
    const input = (n: number) => ({ state: { ...base, log: log(n) }, today: day(0), eligibleUnits: units, general: d });
    expect(buildExtraBatch(input(0)).items).toHaveLength(20);
    expect(buildExtraBatch(input(20)).items).toHaveLength(20);
    expect(buildExtraBatch(input(30)).items).toHaveLength(10);
    expect(buildExtraBatch(input(30)).capLeft).toBe(10);
    const capped = buildExtraBatch(input(40));
    expect(capped.items).toHaveLength(0);
    expect(capped.blocked).toBe("cap");
    expect(LIMITS.extraPerDay).toBe(40);
  });

  it("las extra de ayer no cuentan hoy, y las respuestas normales de hoy tampoco", () => {
    const entry = (at: Date, extra: boolean) => ({ cardId: "c", at: at.toISOString(), rating: 3 as const, ms: 1, ...(extra ? { extra: true as const } : {}) });
    const state = { ...emptySrs(), log: [entry(day(-1), true), entry(day(0), false), entry(day(0), true)] };
    expect(extraToday(state, day(0))).toBe(1);
  });

  it("no repite una tarjeta que ya respondiste hoy (aunque ahora venza mañana)", async () => {
    const d = await loadDeck();
    const first = scenario(0);
    const card = first.cards[Object.keys(first.cards)[0]];
    const state = applyReview(first, { ...card, fsrs: { ...card.fsrs, due: day(0).toISOString() } }, 3, day(0), 1, true);
    const batch = buildExtraBatch({ state, today: day(0), eligibleUnits: units, general: d });
    expect(batch.items.some((i) => i.type === "due" && i.card.id === card.id)).toBe(false);
  });

  it("sin nada de ninguna fuente, no hay tanda y se sabe por qué", () => {
    const empty = buildExtraBatch({ state: scenario(0), today: day(0), eligibleUnits: [], general: [] });
    expect(empty.items.filter((i) => i.type === "new")).toHaveLength(0);
    const nothing = buildExtraBatch({ state: emptySrs(), today: day(0), eligibleUnits: [], general: [] });
    expect(nothing).toMatchObject({ items: [], blocked: "empty", capLeft: 40 });
  });

  it("con el mazo general apagado no se ofrecen palabras generales", async () => {
    const d = await loadDeck();
    const state = { ...scenario(0), options: { general: false } };
    const batch = buildExtraBatch({ state, today: day(0), eligibleUnits: units, general: d });
    expect(batch.items.some((i) => i.type === "new")).toBe(false);
  });

  it("se califica con las reglas normales de ts-fsrs y deja la marca de extra en el registro", () => {
    const card = newSrsCard({ kind: "recog", itemId: "u01:ciao", unit: "u01" }, day(0));
    const normal = applyReview(emptySrs(), card, 3, day(0), 500);
    const extra = applyReview(emptySrs(), card, 3, day(0), 500, true);
    expect(extra.cards[card.id]).toEqual(normal.cards[card.id]);
    expect(extra.cards[card.id].fsrs).toEqual(rateCard(card, 3, day(0)).fsrs);
    expect(normal.log[0].extra).toBeUndefined();
    expect(extra.log[0].extra).toBe(true);
    const corrected = rerateLast(extra, card, 4, day(0), 500);
    expect(corrected.log[corrected.log.length - 1].extra).toBe(true);
    expect(corrected.log).toHaveLength(1);
  });

  it("la cola del día queda vacía cuando no hay vencidas ni nuevas: justo entonces se ofrece «Practicar más»", async () => {
    const d = await loadDeck();
    const state = { ...scenario(0), options: { general: false } };
    expect(buildQueue({ state, today: day(0), eligibleUnits: units, general: d }).items).toHaveLength(0);
    expect(buildExtraBatch({ state, today: day(0), eligibleUnits: units, general: d }).items).toHaveLength(3);
  });
});
