import { describe, expect, it } from "vitest";
import { getSinPista, SINPISTA_UNITS, type SinPista } from "../content/sinpista";
import { UNITS } from "../content/curriculum";
import { clearProgress, KEYS_V2, type KV } from "./storage";
import { BACKUP_APP, BACKUP_VERSION, buildBackup, parseBackup } from "./backup";
import {
  WEEK_SIZE, emptySinPista, loadSinPista, pickReview, pickWeek, recordSinPista, saveSinPista, stepOf,
} from "./sinpistaState";
import { addCardIfMissing, emptySrs, loadSrs } from "./srs";
import { resolveSinPista, srsCardOf, isSinPistaId } from "./sinpistaSrs";
import { resolveCard, type DeckContext } from "./srsDeck";

class Store implements KV {
  map = new Map<string, string>();
  get length() { return this.map.size; }
  key(i: number) { return [...this.map.keys()][i] ?? null; }
  getItem(k: string) { return this.map.get(k) ?? null; }
  setItem(k: string, v: string) { this.map.set(k, v); }
  removeItem(k: string) { this.map.delete(k); }
}

const SPLIT = UNITS.filter((u) => u.parts).map((u) => u.id);
const answerAll = (state = emptySinPista(), ids: string[], stepId: string, ok = true) =>
  ids.reduce((s, id) => recordSinPista(s, id, stepId, ok), state);

describe("rotación de la práctica sin pista", () => {
  it("la primera sesión muestra 7 de los 12; la segunda, los 5 que faltan más 2; nunca repite antes de agotar los 12", () => {
    const list = getSinPista("u04");
    expect(list).toHaveLength(12);
    const first = pickWeek(list, emptySinPista());
    expect(first).toHaveLength(WEEK_SIZE);
    expect(first.map((e) => e.id)).toEqual(list.slice(0, 7).map((e) => e.id));
    const afterFirst = answerAll(emptySinPista(), first.map((e) => e.id), "u04");
    const second = pickWeek(list, afterFirst);
    const secondIds = second.map((e) => e.id);
    // los 5 que no habían salido están todos
    for (const e of list.slice(7)) expect(secondIds).toContain(e.id);
    expect(new Set(secondIds).size).toBe(7);
    // solo se repiten 2 de los ya vistos, para completar los 7
    expect(first.filter((e) => secondIds.includes(e.id))).toHaveLength(2);
  });

  it("una sesión que no se contestó no gasta ejercicios", () => {
    const list = getSinPista("u04");
    expect(pickWeek(list, emptySinPista()).map((e) => e.id)).toEqual(pickWeek(list, emptySinPista()).map((e) => e.id));
  });

  it("devuelve los ejercicios en su orden original", () => {
    const list = getSinPista("u04");
    const state = answerAll(emptySinPista(), list.slice(0, 3).map((e) => e.id), "u04");
    const ids = pickWeek(list, state).map((e) => e.id);
    const order = ids.map((id) => list.findIndex((e) => e.id === id));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("unidad partida: la semana A solo ve sus 6 y la B, los suyos", () => {
    for (const u of SPLIT) {
      const a = pickWeek(getSinPista(u, "A"), emptySinPista());
      const b = pickWeek(getSinPista(u, "B"), emptySinPista());
      expect(a).toHaveLength(6);
      expect(b).toHaveLength(6);
      expect(a.every((e) => e.part === "A")).toBe(true);
      expect(b.every((e) => e.part === "B")).toBe(true);
      expect(new Set([...a, ...b].map((e) => e.id)).size).toBe(12);
    }
  });

  it("registrar una respuesta suma, y los fallados se quedan hasta acertarlos", () => {
    let s = recordSinPista(emptySinPista(), "u04-s01", "u04", false);
    expect(s.shown["u04-s01"]).toBe(1);
    expect(s.missed).toEqual(["u04-s01"]);
    s = recordSinPista(s, "u04-s01", "u04", false);
    expect(s.missed).toEqual(["u04-s01"]);
    s = recordSinPista(s, "u04-s01", "u04", true);
    expect(s.missed).toEqual([]);
    expect(s.shown["u04-s01"]).toBe(3);
    expect(s.opened).toEqual(["u04"]);
  });
});

describe("repaso mixto y repaso dirigido con ejercicios sin pista", () => {
  const all: SinPista[] = SINPISTA_UNITS.flatMap((u) => getSinPista(u));

  it("sin haber abierto ninguna semana no hay nada que repasar", () => {
    expect(pickReview(all, emptySinPista(), "review")).toEqual([]);
    expect(pickReview(all, emptySinPista(), "due")).toEqual([]);
  });

  it("el repaso mixto trae los fallados y después los que aún no salieron de semanas abiertas", () => {
    const list = getSinPista("u04");
    let s = answerAll(emptySinPista(), list.slice(0, 7).map((e) => e.id), "u04");
    s = recordSinPista(s, list[0].id, "u04", false);
    const out = pickReview(all, s, "review").map((e) => e.id);
    expect(out[0]).toBe(list[0].id);
    for (const id of out.slice(1)) expect(list.slice(7).map((e) => e.id)).toContain(id);
    expect(out.length).toBeLessThanOrEqual(4);
  });

  it("el repaso dirigido solo trae fallados", () => {
    const list = getSinPista("u04");
    const s = answerAll(emptySinPista(), list.slice(0, 7).map((e) => e.id), "u04");
    expect(pickReview(all, s, "due")).toEqual([]);
    expect(pickReview(all, recordSinPista(s, list[2].id, "u04", false), "due").map((e) => e.id)).toEqual([list[2].id]);
  });

  it("A solo ve los suyos: si solo abriste la semana A, no salen ejercicios de la B", () => {
    const u = SPLIT[0];
    const a = getSinPista(u, "A");
    const s = answerAll(emptySinPista(), a.slice(0, 2).map((e) => e.id), `${u}#A`);
    const out = pickReview(all, s, "review", 20);
    expect(out.length).toBe(a.length - 2);
    expect(out.every((e) => e.part === "A" && e.id.startsWith(u))).toBe(true);
    expect(stepOf(a[0])).toBe(`${u}#A`);
  });
});

describe("almacenamiento y copia de seguridad", () => {
  it("guarda y vuelve a leer; un valor ajeno o dañado se ignora sin lanzar", () => {
    const store = new Store();
    expect(loadSinPista(store)).toEqual(emptySinPista());
    const s = recordSinPista(emptySinPista(), "u04-s01", "u04", false);
    saveSinPista(s, store);
    expect(loadSinPista(store)).toEqual(s);
    store.setItem(KEYS_V2.sinpista, "{no es json");
    expect(loadSinPista(store)).toEqual(emptySinPista());
    store.setItem(KEYS_V2.sinpista, JSON.stringify({ version: 9 }));
    expect(loadSinPista(store)).toEqual(emptySinPista());
  });

  it("es una clave nueva con prefijo italianPlan.: viaja en la copia y «Borrar progreso» la quita; no toca las claves anteriores", () => {
    expect(KEYS_V2.sinpista.startsWith("italianPlan.")).toBe(true);
    const store = new Store();
    saveSinPista(emptySinPista(), store);
    store.setItem("italianPlan.completions", JSON.stringify({ "2026-10-01": { "u01.s1.dialogue": true } }));
    const stored = recordSinPista(emptySinPista(), "u04-s01", "u04", false);
    saveSinPista(stored, store);
    const file = JSON.stringify(buildBackup(store));
    const parsed = parseBackup(file);
    expect(parsed.ok && parsed.backup.data[KEYS_V2.sinpista]).toBe(JSON.stringify(stored));
    expect(parsed.ok && parsed.ignored).toEqual([]);
    const bad = parseBackup(JSON.stringify({ app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: new Date().toISOString(), data: { [KEYS_V2.sinpista]: "[]" } }));
    expect(bad.ok).toBe(false);
    clearProgress(store);
    expect(store.getItem(KEYS_V2.sinpista)).toBeNull();
  });
});

describe("las respuestas fallidas entran al repaso espaciado", () => {
  const ex = (type: SinPista["type"]) => getSinPista("u07", "A").concat(getSinPista("u07", "B")).find((e) => e.type === type)!;
  const ctx: DeckContext = {
    quizlet: new Map(),
    sinpista: new Map(SINPISTA_UNITS.flatMap((u) => getSinPista(u)).map((e) => [e.id, e])),
  };

  it("los ids de ejercicios sin pista se distinguen de los de gramática", () => {
    expect(isSinPistaId("u07-s04")).toBe(true);
    expect(isSinPistaId("u07-e04")).toBe(false);
    expect(isSinPistaId("u07:d-vorrei")).toBe(false);
  });

  it("el diálogo es una tarjeta de completar y los demás tipos, de escuchar y escribir; todas de su unidad", () => {
    expect(srsCardOf(ex("dialog"))).toEqual({ kind: "cloze", itemId: ex("dialog").id, unit: "u07" });
    for (const t of ["order", "translate", "fix", "transform", "listen"] as const) {
      expect(srsCardOf(ex(t)).kind).toBe("listen");
      expect(srsCardOf(ex(t)).unit).toBe("u07");
    }
  });

  it("cada tarjeta se resuelve con su contenido, y sin cargar el contenido no se resuelve", () => {
    for (const unit of SINPISTA_UNITS) {
      for (const e of getSinPista(unit)) {
        const card = addCardIfMissing(emptySrs(), srsCardOf(e), new Date("2026-11-01T10:00:00Z")).cards[`${srsCardOf(e).kind}:${e.id}`];
        const r = resolveCard(card, ctx)!;
        expect(r, e.id).toEqual(resolveSinPista(e));
        if (r.kind === "cloze") expect(r.prompt.split("___")).toHaveLength(2);
        if (r.kind === "listen") expect(r.it.length).toBeGreaterThan(2);
        expect(resolveCard(card, { quizlet: new Map() })).toBeNull();
      }
    }
  });

  it("no pisa el repaso guardado: recordFailure agrega la tarjeta una sola vez", () => {
    const store = new Store();
    const e = ex("translate");
    const state = addCardIfMissing(loadSrs(store), srsCardOf(e), new Date());
    expect(Object.keys(state.cards)).toEqual([`listen:${e.id}`]);
    expect(addCardIfMissing(state, srsCardOf(e), new Date())).toBe(state);
  });
});
