import { describe, expect, it } from "vitest";
import { getWords } from "../content/vocab";
import { blockKey } from "./cycle";
import { allWordsOfUnit, choicesFor, emptyContext, resolveCard, wordItemId, wordsOfUnit } from "./srsDeck";
import { extraWordsFor, extraWordsOfUnit, extraWordsSeen } from "./srsExtras";
import { LIMITS, buildQueue } from "./srsQueue";
import { cardId, emptySrs, newSrsCard } from "./srs";

const today = new Date(2026, 10, 8);
const done = (...keys: string[]): ReadonlySet<string> => new Set(keys);

describe("palabras ampliadas en el repaso espaciado", () => {
  it("hay palabras ampliadas que no son de la lista de la unidad", () => {
    const extra = extraWordsOfUnit("u04");
    expect(extra.length).toBeGreaterThanOrEqual(20);
    const base = new Set(wordsOfUnit("u04").map((w) => w.itemId));
    expect(extra.every((w) => !base.has(w.itemId))).toBe(true);
    expect(new Set(extra.map((w) => w.itemId)).size).toBe(extra.length);
  });

  it("no entra ninguna antes de hacer su bloque, y cada bloque trae su tercio", () => {
    expect(extraWordsSeen("u04", done())).toEqual([]);
    expect(extraWordsSeen("u04", done(blockKey("u04", 1, "words")))).toEqual([]);
    const a = extraWordsSeen("u04", done(blockKey("u04", 3, "words3")));
    const b = extraWordsSeen("u04", done(blockKey("u04", 4, "words4")));
    const c = extraWordsSeen("u04", done(blockKey("u04", 5, "words5")));
    expect(a.length).toBeGreaterThan(0);
    expect(b.length).toBeGreaterThan(0);
    expect(c.length).toBeGreaterThan(0);
    const ids = [...a, ...b, ...c].map((w) => w.itemId);
    expect(new Set(ids).size).toBe(ids.length);
    const all = extraWordsSeen("u04", done(blockKey("u04", 3, "words3"), blockKey("u04", 4, "words4"), blockKey("u04", 5, "words5")));
    expect(all.map((w) => w.itemId).sort()).toEqual(extraWordsOfUnit("u04").map((w) => w.itemId).sort());
  });

  it("en una unidad partida, cada semana trae solo sus palabras", () => {
    const a = extraWordsSeen("u02", done(blockKey("u02#A", 3, "words3")));
    const b = extraWordsSeen("u02", done(blockKey("u02#B", 3, "words3")));
    expect(a.length).toBeGreaterThan(0);
    expect(b.length).toBeGreaterThan(0);
    const aIds = new Set(a.map((w) => w.itemId));
    const onlyB = getWords("u02")!.filter((w) => w.extra && w.part === "B").map((w) => wordItemId("u02", w.it));
    expect(onlyB.some((id) => aIds.has(id))).toBe(false);
  });

  it("la cola las introduce después de las palabras de su unidad", () => {
    const extras = extraWordsFor({ done: done(blockKey("u04", 3, "words3")) });
    const base = wordsOfUnit("u04");
    const q = buildQueue({ state: emptySrs(), today, eligibleUnits: ["u04"], extraWords: extras });
    const fresh = q.items.filter((i) => i.type === "new").map((i) => (i.type === "new" ? i.candidate.itemId : ""));
    expect(fresh).toHaveLength(LIMITS.newPerDay);
    expect(fresh).toEqual(base.slice(0, LIMITS.newPerDay).map((w) => w.itemId));
    // con las de la unidad ya introducidas, siguen las ampliadas
    let state = emptySrs();
    for (const w of base) state = { ...state, cards: { ...state.cards, [cardId("recog", w.itemId)]: newSrsCard({ kind: "recog", itemId: w.itemId, unit: "u04" }, new Date(2026, 10, 1)) } };
    const q2 = buildQueue({ state, today, eligibleUnits: ["u04"], extraWords: extras });
    const fresh2 = q2.items.filter((i) => i.type === "new").map((i) => (i.type === "new" ? i.candidate.itemId : ""));
    const extraIds = new Set(extras.get("u04")!.map((w) => w.itemId));
    expect(fresh2.length).toBeGreaterThan(0);
    expect(fresh2.every((id) => extraIds.has(id))).toBe(true);
  });

  it("sin palabras ampliadas vistas la cola es la de siempre", () => {
    const a = buildQueue({ state: emptySrs(), today, eligibleUnits: ["u04"] });
    const b = buildQueue({ state: emptySrs(), today, eligibleUnits: ["u04"], extraWords: new Map() });
    expect(b.items.map((i) => (i.type === "new" ? i.candidate.itemId : i.card.id))).toEqual(a.items.map((i) => (i.type === "new" ? i.candidate.itemId : i.card.id)));
  });

  it("una tarjeta de palabra ampliada se resuelve y sus opciones incluyen el significado correcto", () => {
    const w = extraWordsOfUnit("u04")[0];
    const card = newSrsCard({ kind: "recog", itemId: w.itemId, unit: "u04" }, today);
    const r = resolveCard(card, emptyContext());
    expect(r).toMatchObject({ kind: "recog", it: w.it, es: w.es });
    const set = choicesFor(card, w.es, emptyContext(), ["u04", "u05"]);
    expect(set.options[set.answerIndex]).toBe(w.es);
    expect(new Set(set.options).size).toBe(set.options.length);
  });

  it("los ids de las palabras de la unidad no cambian y allWordsOfUnit las incluye", () => {
    const base = wordsOfUnit("u04");
    const all = allWordsOfUnit("u04");
    expect(all.slice(0, base.length).map((w) => w.itemId)).toEqual(base.map((w) => w.itemId));
    expect(all.length).toBeGreaterThan(base.length);
  });
});
