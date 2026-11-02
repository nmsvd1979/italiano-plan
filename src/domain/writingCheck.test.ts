import { describe, expect, it } from "vitest";
import { COURSE } from "../content/course";
import { UNITS } from "../content/curriculum";
import { appLexicon, wordsOf } from "../content/lexicon";
import { getWriting, type WritingTask } from "../content/writing";
import { BACKUP_APP, BACKUP_VERSION, buildBackup, parseBackup } from "./backup";
import { KEYS_V2, clearProgress, type KV } from "./storage";
import {
  MIN_RECOGNIZED, checkWriting, claudeMessage, highlightForms, includesForm, keywordsOf, minWordsOf, targetForms, writingLevel,
} from "./writingCheck";
import { REWRITE_AFTER_DAYS, loadFixes, rewritesDue, saveFix, saveRewrite } from "./writingFix";

class Store implements KV {
  map = new Map<string, string>();
  get length() { return this.map.size; }
  key(i: number) { return [...this.map.keys()][i] ?? null; }
  getItem(k: string) { return this.map.get(k) ?? null; }
  setItem(k: string, v: string) { this.map.set(k, v); }
  removeItem(k: string) { this.map.delete(k); }
}

const lex = appLexicon();
const units = UNITS.map((u) => u.id);
const task = (extra: Partial<WritingTask> = {}): WritingTask => ({
  prompt: "Cuenta tu día.", model: "Mi sveglio alle sette e prendo un caffè.", checklist: ["Usé *mi sveglio*."], minChars: 60, ...extra,
});

describe("la escalera de escritura", () => {
  it("reconstruir hasta u06, marcos de u07 a u14 y consigna libre desde u15 (por posición en el curso)", () => {
    for (const u of ["u01", "u02", "u03", "u04", "u05", "u06", "u25"]) expect(writingLevel(u), u).toBe("reconstruir");
    for (const u of ["u07", "u08", "u09", "u10", "u11", "u12", "u13", "u14", "u26", "u27", "u28"]) expect(writingLevel(u), u).toBe("marcos");
    for (const u of ["u15", "u16", "u17", "u18", "u19", "u20", "u21", "u22", "u23", "u24"]) expect(writingLevel(u), u).toBe("libre");
    expect(COURSE.every((s) => ["reconstruir", "marcos", "libre"].includes(writingLevel(s.unit)))).toBe(true);
  });
});

describe("capa 1: revisión automática", () => {
  it("el léxico de la app reconoce todos los modelos de escritura (si no, daría falsos avisos)", () => {
    for (const u of units) {
      const t = getWriting(u);
      if (!t) continue;
      const c = checkWriting(t.model, t, lex);
      expect(c.unknown, u).toEqual([]);
      expect(c.recognized, u).toBe(1);
    }
  });

  it("cuenta palabras (no caracteres) y el mínimo sale de minChars si no se fijó", () => {
    const t = task({ minChars: 70 });
    expect(minWordsOf(t)).toBe(12);
    expect(minWordsOf(task({ minChars: 70, minWords: 9 }))).toBe(9);
    expect(minWordsOf(task({ minChars: 10 }))).toBe(8);
    expect(checkWriting("Mi sveglio alle sette", t, lex).words).toBe(4);
    // la elisión no es una palabra más
    expect(checkWriting("l'amico", t, lex).words).toBe(1);
  });

  it("no se completa con texto sin sentido aunque llegue a la cantidad", () => {
    const t = task({ minChars: 60 });
    const junk = "qwer tyui opas dfgh jklz xcvb nmqw erty uiop asdf ghjk lzxc";
    const c = checkWriting(junk, t, lex);
    expect(c.words).toBeGreaterThanOrEqual(c.minWords);
    expect(c.recognized).toBeLessThan(MIN_RECOGNIZED);
    expect(c.complete).toBe(false);
  });

  it("un texto con palabras de la app y suficientes palabras sí se completa", () => {
    for (const u of units) {
      const t = getWriting(u);
      if (!t) continue;
      expect(checkWriting(t.model, t, lex).complete, u).toBe(true);
    }
  });

  it("pocas palabras = no se completa; justo la mitad reconocida = sí", () => {
    const t = task({ minWords: 4 });
    expect(checkWriting("Mi sveglio alle", t, lex).complete).toBe(false);
    const half = checkWriting("Mi sveglio alle sette qwer tyui opas dfgh", task({ minWords: 4 }), lex);
    expect(half.recognized).toBe(0.5);
    expect(half.complete).toBe(true);
  });

  it("avisa de las palabras que no conoce sin bloquear", () => {
    const c = checkWriting("Mi sveglio alle sette e prendo un cafffè", task({ minWords: 4 }), lex);
    expect(c.unknown).toEqual(["cafffè"]);
    expect(c.complete).toBe(true);
  });

  it("sugiere la tilde cuando falta y la palabra con tilde está en la app", () => {
    const c = checkWriting("Oggi e il sei ottobre e piu bello", task({ minWords: 4 }), lex);
    expect(c.accent.map((a) => a.typed)).toContain("piu");
    expect(c.accent.find((a) => a.typed === "piu")!.suggestion).toBe("più");
    // «e» ya es una palabra válida (= y): no se marca
    expect(c.accent.map((a) => a.typed)).not.toContain("e");
  });

  it("mustInclude: alternativas aceptadas, varias palabras seguidas, sin mayúsculas ni apóstrofo curvo", () => {
    const t = task({ minWords: 3, mustInclude: [["c'è", "ci sono"], ["mi piace", "mi piacciono"], ["vorrei"]] });
    const c = checkWriting("Ci sono due camere. Mi piacciono i bar.", t, lex);
    expect(c.totalForms).toBe(3);
    expect(c.missingForms).toEqual([["vorrei"]]);
    expect(checkWriting("C’è un bar. MI PIACE. Vorrei un caffè", t, lex).missingForms).toEqual([]);
    expect(includesForm(wordsOf("mi piace molto"), "mi piace")).toBe(true);
    expect(includesForm(wordsOf("mi molto piace"), "mi piace")).toBe(false);
    // sin formas meta escritas, no se exige nada
    expect(checkWriting("Mi sveglio alle sette", task(), lex)).toMatchObject({ totalForms: 0, missingForms: [] });
  });
});

describe("capa 2: comparación con el modelo", () => {
  it("palabras clave: las dadas, o las más largas del modelo en su orden", () => {
    expect(keywordsOf(task({ keywords: ["sveglio", "caffè"] }))).toEqual(["sveglio", "caffè"]);
    const k = keywordsOf(getWriting("u01")!);
    expect(k.length).toBeGreaterThan(0);
    expect(k.length).toBeLessThanOrEqual(6);
    for (const u of units.filter((x) => getWriting(x))) {
      const t = getWriting(u)!;
      const ks = keywordsOf(t);
      expect(ks.length, u).toBeGreaterThanOrEqual(3);
      const model = wordsOf(t.model);
      expect(ks.every((w) => model.includes(w)), u).toBe(true);
      // en el orden del modelo
      const at = ks.map((w) => model.indexOf(w));
      expect(at, u).toEqual([...at].sort((a, b) => a - b));
    }
  });

  it("resalta las formas meta sin perder texto", () => {
    const text = "Ho un appartamento. C'è una cucina e ci sono due camere.";
    const pieces = highlightForms(text, ["c'è", "ci sono", "ci"]);
    expect(pieces.map((p) => p.text).join("")).toBe(text);
    expect(pieces.filter((p) => p.mark).map((p) => p.text)).toEqual(["C'è", "ci sono"]);
    expect(highlightForms("Ciao", [])).toEqual([{ text: "Ciao", mark: false }]);
    expect(highlightForms("Piacere", ["ace"])).toEqual([{ text: "Piacere", mark: false }]);
  });

  it("las formas meta salen de mustInclude o, si faltan, de las cursivas de la lista de la unidad", () => {
    expect(targetForms(task({ mustInclude: [["c'è", "ci sono"]] }))).toEqual(["c'è", "ci sono"]);
    expect(targetForms(getWriting("u02")!)).toEqual(expect.arrayContaining(["c'è", "ci sono", "mi piace"]));
  });
});

describe("capa 3: copiar para Claude", () => {
  it("lleva unidad, objetivo, consigna, texto e instrucciones; nada personal", () => {
    const t = getWriting("u04")!;
    const msg = claudeMessage("u04", t, "  Al bar prendo un caffè.  ");
    expect(msg).toContain("Unidad: ");
    expect(msg).toContain("Objetivo gramatical: ");
    expect(msg).toContain(`Consigna: ${t.prompt}`);
    expect(msg).toContain("Al bar prendo un caffè.");
    expect(msg).toContain("Corrígelo, explica cada error en una línea en español neutro, dame la versión corregida y dos preguntas para practicar.");
    expect(msg).not.toMatch(/@|italianPlan|\d{4}-\d{2}-\d{2}/);
    expect(msg).not.toMatch(/\b(vos|tenés|querés|podés)\b/i);
  });

  it("funciona para todas las unidades con escritura", () => {
    for (const u of units) {
      const t = getWriting(u);
      if (t) expect(claudeMessage(u, t, "Ciao").split("\n").length, u).toBeGreaterThan(6);
    }
  });
});

describe("versión corregida y reescritura a los 3 días", () => {
  const day = (iso: string) => new Date(`${iso}T12:00:00`);

  it("guarda original y corregida; propone reescribir a los 3 días y no antes", () => {
    const store = new Store();
    saveFix("u04", "Io vado al bar", "Io vado al bar.", day("2026-11-01"), store);
    expect(loadFixes(store).u04).toMatchObject({ original: "Io vado al bar", corrected: "Io vado al bar.", savedAt: "2026-11-01" });
    expect(REWRITE_AFTER_DAYS).toBe(3);
    expect(rewritesDue(loadFixes(store), day("2026-11-03"))).toEqual([]);
    expect(rewritesDue(loadFixes(store), day("2026-11-04"))).toEqual(["u04"]);
    expect(rewritesDue(loadFixes(store), day("2026-12-24"))).toEqual(["u04"]);
  });

  it("al reescribir deja de proponerse; guardar otra corrección la vuelve a proponer", () => {
    const store = new Store();
    saveFix("u04", "a", "b", day("2026-11-01"), store);
    saveRewrite("u04", "c", day("2026-11-04"), store);
    expect(loadFixes(store).u04.rewrite).toEqual({ text: "c", at: "2026-11-04" });
    expect(rewritesDue(loadFixes(store), day("2026-11-10"))).toEqual([]);
    saveFix("u04", "a2", "b2", day("2026-11-10"), store);
    expect(loadFixes(store).u04.rewrite).toBeUndefined();
  });

  it("varias pendientes: primero la más antigua", () => {
    const store = new Store();
    saveFix("u05", "a", "b", day("2026-11-02"), store);
    saveFix("u04", "a", "b", day("2026-11-01"), store);
    expect(rewritesDue(loadFixes(store), day("2026-11-20"))).toEqual(["u04", "u05"]);
  });

  it("un valor dañado se ignora sin lanzar", () => {
    const store = new Store();
    store.setItem(KEYS_V2.writingFix, "{no es json");
    expect(loadFixes(store)).toEqual({});
    store.setItem(KEYS_V2.writingFix, JSON.stringify({ u04: { original: 1 }, u05: { original: "a", corrected: "b", savedAt: "2026-11-01" } }));
    expect(Object.keys(loadFixes(store))).toEqual(["u05"]);
  });

  it("clave nueva con prefijo italianPlan.: viaja en la copia y «Borrar progreso» la quita; no toca el texto guardado de la escritura", () => {
    const store = new Store();
    store.setItem("italianPlan.writing", JSON.stringify({ u04: "Ciao" }));
    saveFix("u04", "a", "b", day("2026-11-01"), store);
    const parsed = parseBackup(JSON.stringify(buildBackup(store)));
    expect(parsed.ok && parsed.backup.data[KEYS_V2.writingFix]).toBe(store.getItem(KEYS_V2.writingFix));
    expect(parsed.ok && parsed.ignored).toEqual([]);
    expect(parseBackup(JSON.stringify({ app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: new Date().toISOString(), data: { [KEYS_V2.writingFix]: "[]" } })).ok).toBe(false);
    clearProgress(store);
    expect(store.getItem(KEYS_V2.writingFix)).toBeNull();
    expect(store.getItem("italianPlan.writing")).toBeNull(); // «Borrar progreso» ya lo hacía
  });
});
