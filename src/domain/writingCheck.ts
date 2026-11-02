import { COURSE } from "../content/course";
import { getUnit } from "../content/curriculum";
import { getLesson } from "../content/grammar";
import { wordsOf } from "../content/lexicon";
import type { WritingTask } from "../content/writing";

// Escritura con retroalimentación, capas 1 y 3 (docs/v2/05 E4). La capa 2 (comparación con el modelo) se arma en la pantalla.

export type WritingLevel = "reconstruir" | "marcos" | "libre";

export const LEVEL_NAME: Record<WritingLevel, string> = {
  reconstruir: "Reconstruir un texto",
  marcos: "Con marcos de frase",
  libre: "Consigna libre",
};

const lastIndex = (unit: string): number => COURSE.map((s) => s.unit).lastIndexOf(unit);

/**
 * La escalera por posición en el curso: hasta el final de u06 se reconstruye un texto breve a partir de palabras clave,
 * hasta el final de u14 se escribe con marcos de frase y desde u15, con una consigna libre con restricciones.
 */
export function writingLevel(unit: string): WritingLevel {
  const at = lastIndex(unit);
  if (at < 0) return "libre";
  if (at <= lastIndex("u06")) return "reconstruir";
  if (at <= lastIndex("u14")) return "marcos";
  return "libre";
}

/** Mínimo de palabras. `minChars` ya no se usa para dar el ejercicio por hecho. */
export const minWordsOf = (task: WritingTask): number => task.minWords ?? Math.max(8, Math.round(task.minChars / 6));

/** Proporción mínima de palabras que la app reconoce para dar el texto por válido. */
export const MIN_RECOGNIZED = 0.5;

const stripAccents = (s: string): string => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Palabras con sentido para el recuento: sin la elisión suelta (`l'`, `un'`). */
const countable = (words: string[]): string[] => words.filter((w) => !w.endsWith("'"));

export interface WritingCheck {
  words: number;
  minWords: number;
  /** Proporción de palabras que están en el léxico de la app (0 a 1). */
  recognized: number;
  /** No están en el léxico: «no la conozco, ¿está bien escrita?». No bloquea. */
  unknown: string[];
  /** Están sin tilde y existe la palabra con tilde en el léxico (ej. `e` → `è`, `piu` → `più`). */
  accent: { typed: string; suggestion: string }[];
  /** Grupos de `mustInclude` que no aparecen. Vacío si la unidad no tiene formas meta escritas. */
  missingForms: string[][];
  /** Cuántos grupos de `mustInclude` hay (0 = sin datos). */
  totalForms: number;
  /** Suficientes palabras y suficientes reconocidas: se puede dar por hecho. Las formas meta solo avisan. */
  complete: boolean;
}

/** ¿Aparece la forma (una o varias palabras seguidas) en el texto? Sin distinguir mayúsculas ni signos. */
export function includesForm(textWords: string[], form: string): boolean {
  const target = wordsOf(form);
  if (target.length === 0) return false;
  for (let i = 0; i + target.length <= textWords.length; i++) {
    if (target.every((w, k) => textWords[i + k] === w)) return true;
  }
  return false;
}

/** Capa 1: comprobación automática (formas meta, tildes, número de palabras y palabras que la app conoce). */
export function checkWriting(text: string, task: WritingTask, lexicon: ReadonlySet<string>): WritingCheck {
  const raw = wordsOf(text);
  const all = countable(raw);
  const bare = new Map<string, string>();
  for (const w of lexicon) if (stripAccents(w) !== w && !bare.has(stripAccents(w))) bare.set(stripAccents(w), w);

  const unknown: string[] = [];
  const accent: WritingCheck["accent"] = [];
  let known = 0;
  for (const w of new Set(all)) {
    const n = all.filter((x) => x === w).length;
    if (lexicon.has(w)) known += n;
    else if (bare.has(w)) accent.push({ typed: w, suggestion: bare.get(w)! });
    else unknown.push(w);
  }
  // Una palabra sin tilde cuenta como conocida: el problema es la tilde, no la palabra.
  known += accent.reduce((sum, a) => sum + all.filter((x) => x === a.typed).length, 0);

  const groups = task.mustInclude ?? [];
  const missingForms = groups.filter((alts) => !alts.some((f) => includesForm(raw, f)));
  const recognized = all.length === 0 ? 0 : known / all.length;
  const minWords = minWordsOf(task);
  return {
    words: all.length,
    minWords,
    recognized,
    unknown,
    accent,
    missingForms,
    totalForms: groups.length,
    complete: all.length >= minWords && recognized >= MIN_RECOGNIZED,
  };
}

/** Palabras clave para reconstruir el texto: las del tema o, si faltan, las palabras más largas del modelo, en su orden. */
export function keywordsOf(task: WritingTask, max = 6): string[] {
  if (task.keywords && task.keywords.length > 0) return task.keywords;
  const seen = new Set<string>();
  const words = wordsOf(task.model).filter((w) => w.length >= 5 && !w.endsWith("'")).filter((w) => !seen.has(w) && !!seen.add(w));
  const top = new Set([...words].sort((a, b) => b.length - a.length).slice(0, max));
  return words.filter((w) => top.has(w));
}

/** Formas meta para resaltar en el modelo: `mustInclude` o, si faltan, las formas en cursiva de la lista de la unidad. */
export function targetForms(task: WritingTask): string[] {
  if (task.mustInclude && task.mustInclude.length > 0) return task.mustInclude.flat();
  const forms = task.checklist.flatMap((c) => [...c.matchAll(/(?<!\*)\*([^*]+)\*(?!\*)/g)].map((m) => m[1]));
  return [...new Set(forms.flatMap((f) => f.split(/\s*,\s*/)).map((f) => f.trim()).filter((f) => wordsOf(f).join("").length > 1))];
}

export interface Piece { text: string; mark: boolean }

/** Parte un texto en trozos y marca las formas meta (las más largas primero), sin perder ni un carácter. */
export function highlightForms(text: string, forms: string[]): Piece[] {
  const sorted = [...new Set(forms)].filter(Boolean).sort((a, b) => b.length - a.length);
  if (sorted.length === 0) return [{ text, mark: false }];
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(?<![A-Za-zÀ-ÿ])(${sorted.map(esc).join("|")})(?![A-Za-zÀ-ÿ])`, "gi");
  const out: Piece[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), mark: false });
    out.push({ text: m[0], mark: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), mark: false });
  return out.length > 0 ? out : [{ text, mark: false }];
}

/** Capa 3: el mensaje que se copia para pegarlo en Claude. Solo lleva la unidad, el objetivo, la consigna y el texto. */
export function claudeMessage(unit: string, task: WritingTask, text: string): string {
  const meta = getUnit(unit);
  const goal = getLesson(unit)?.title ?? meta?.title ?? "";
  return [
    "Soy hispanohablante y estoy aprendiendo italiano (nivel A1–A2). Escribí este texto como práctica.",
    "",
    `Unidad: ${meta?.title ?? unit}`,
    `Objetivo gramatical: ${goal}`,
    `Consigna: ${task.prompt}`,
    "",
    "Mi texto:",
    text.trim(),
    "",
    "Corrígelo, explica cada error en una línea en español neutro, dame la versión corregida y dos preguntas para practicar.",
  ].join("\n");
}
