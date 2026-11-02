import { UNITS } from "./curriculum";
import { getDialogue } from "./dialogues";
import { getDictation } from "./dictation";
import { getLesson } from "./grammar";
import type { Block } from "./grammar/types";
import { getWords } from "./vocab";
import { getWriting } from "./writing";

// El léxico de la app: todo el italiano que ve quien estudia (vocabulario con su frase, diálogos, dictados, lecciones
// y modelos de escritura). La corrección de la escritura avisa de lo que no está aquí; no bloquea.

/** Palabras de un texto en italiano. Un apóstrofo final queda pegado (`l'`, `un'`), como en la elisión. */
export function wordsOf(text: string): string[] {
  return text.normalize("NFC").toLowerCase().replace(/[’‘´`]/g, "'").match(/[a-zà-ÿ]+'?/g) ?? [];
}

const italics = (s: string): string[] => [...s.matchAll(/(?<!\*)\*([^*]+)\*(?!\*)/g)].map((m) => m[1]);
const blockText = (b: Block): string => (b.kind === "p" ? b.text : b.kind === "list" ? b.items.join(" ") : [...b.head, ...b.rows.flat()].join(" "));

let cache: ReadonlySet<string> | null = null;

export function appLexicon(): ReadonlySet<string> {
  if (cache) return cache;
  const out = new Set<string>();
  const add = (s: string) => wordsOf(s.replace(/\*/g, "")).forEach((w) => out.add(w));
  for (const u of UNITS) {
    for (const w of getWords(u.id) ?? []) { add(w.it); if (w.ex) add(w.ex); }
    for (const d of getDictation(u.id) ?? []) add(d.it);
    for (const l of getDialogue(u.id)?.lines ?? []) add(l.it);
    const w = getWriting(u.id);
    if (w) { add(w.model); w.checklist.flatMap(italics).forEach(add); }
    const lesson = getLesson(u.id);
    if (!lesson) continue;
    for (const e of lesson.examples) add(e.it);
    for (const b of lesson.rule) italics(blockText(b)).forEach(add);
    for (const n of lesson.notice) [...italics(n.prompt), ...n.options.flatMap(italics)].forEach(add);
    for (const x of lesson.exercises) {
      if (x.type === "fill") x.answers.forEach((a) => add(x.prompt.replace("___", a)));
      else { italics(x.prompt).forEach(add); x.options.forEach(add); }
    }
  }
  cache = out;
  return out;
}
