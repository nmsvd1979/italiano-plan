import type { Grade } from "./grading";

// Dictado por niveles y corrección palabra por palabra (docs/v2/05 E3).

export type DictationLevel = "huecos" | "parcial" | "completo";

/** Con huecos hasta la fase 2 (u01–u08), parcial en las fases 3 y 4 (u09–u16), completo desde la fase 5 (u17 en adelante). */
export function levelOfPhase(phase: number): DictationLevel {
  return phase <= 2 ? "huecos" : phase <= 4 ? "parcial" : "completo";
}

export const LEVEL_LABEL: Record<DictationLevel, string> = {
  huecos: "Con huecos",
  parcial: "Parcial",
  completo: "Completo",
};

export const LEVEL_HELP: Record<DictationLevel, string> = {
  huecos: "Ves la frase con palabras que faltan. Escribe solo esas.",
  parcial: "Ves el comienzo de la frase. Escribe el resto.",
  completo: "Escucha y escribe la frase completa.",
};

export { NORMAL_RATE, SLOW_RATE } from "./speechRate";

export interface Token {
  /** Tal como se escribió, con su puntuación pegada (para mostrarla). */
  text: string;
  /** Minúsculas, sin puntuación y con el mismo apóstrofo: lo que se compara. */
  norm: string;
}

const PUNCTUATION = /[.,;:!?¡¿"«»…–—()]/g;

const normWord = (s: string): string =>
  s.normalize("NFC").toLowerCase().replace(/[’‘´`]/g, "'").replace(PUNCTUATION, "").replace(/^'+|'+$/g, "");

/** Sin tildes ni apóstrofos: para detectar los errores que solo son de tilde o apóstrofo. */
const loose = (s: string): string => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/'/g, "");

/** Palabras de una frase. Lo que no tiene letras (una raya suelta, por ejemplo) no cuenta como palabra. */
export function tokenize(sentence: string): Token[] {
  return sentence
    .split(/\s+/)
    .map((text) => ({ text, norm: normWord(text) }))
    .filter((t) => t.norm !== "");
}

export type ExpectedMark = "ok" | "missing" | "accent";
export type TypedMark = "ok" | "extra" | "accent";

export interface DictationDiff {
  grade: Grade;
  /** La frase correcta: faltantes (missing, rojo) y errores solo de tilde o apóstrofo (accent, ámbar). */
  expected: (Token & { mark: ExpectedMark })[];
  /** Lo que escribiste: sobrantes (extra, gris) y errores de tilde o apóstrofo (accent). */
  typed: (Token & { mark: TypedMark })[];
}

/**
 * Compara lo escrito con la frase correcta, palabra por palabra: subsecuencia común más larga sobre las palabras
 * normalizadas (sin distinguir mayúsculas ni puntuación). Dos palabras que difieren solo en tilde o apóstrofo se
 * emparejan y se marcan como «casi».
 */
export function diffDictation(typedText: string, expectedText: string): DictationDiff {
  const exp = tokenize(expectedText);
  const typ = tokenize(typedText);
  const n = exp.length;
  const m = typ.length;
  const same = (i: number, j: number) => loose(exp[i].norm) === loose(typ[j].norm);
  // tabla[i][j] = largo de la subsecuencia común de exp[i..] y typ[j..]
  const table = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      table[i][j] = same(i, j) ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  const expected = exp.map((t): DictationDiff["expected"][number] => ({ ...t, mark: "missing" }));
  const typed = typ.map((t): DictationDiff["typed"][number] => ({ ...t, mark: "extra" }));
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (same(i, j)) {
      const exact = exp[i].norm === typ[j].norm;
      expected[i].mark = exact ? "ok" : "accent";
      typed[j].mark = exact ? "ok" : "accent";
      i++;
      j++;
    } else if (table[i + 1][j] >= table[i][j + 1]) i++;
    else j++;
  }
  const clean = expected.every((t) => t.mark !== "missing") && typed.every((t) => t.mark !== "extra");
  const grade: Grade = !clean || typ.length === 0 ? "wrong" : expected.some((t) => t.mark === "accent") ? "almost" : "correct";
  return { grade, expected, typed };
}

/** Palabras que se piden en el nivel «con huecos»: un tercio de la frase (al menos una), las más largas primero. */
export function holeIndexes(sentence: string): number[] {
  const tokens = tokenize(sentence);
  const count = Math.max(1, Math.round(tokens.length / 3));
  const ranked = tokens
    .map((t, i) => ({ i, len: loose(t.norm).length }))
    .sort((a, b) => b.len - a.len || a.i - b.i)
    .slice(0, count)
    .map((r) => r.i);
  return ranked.sort((a, b) => a - b);
}

/** Cuántas palabras se muestran en el nivel «parcial»: la primera mitad de la frase (al menos una, y deja al menos una). */
export function partialCount(sentence: string): number {
  const n = tokenize(sentence).length;
  return n <= 1 ? 0 : Math.max(1, Math.floor(n / 2));
}

/** Arma lo que escribiste con lo que se mostraba: huecos rellenados, o comienzo + resto. */
export function assemble(level: DictationLevel, sentence: string, written: string | string[]): string {
  const tokens = tokenize(sentence);
  if (level === "completo") return String(written);
  if (level === "parcial") {
    return [...tokens.slice(0, partialCount(sentence)).map((t) => t.text), String(written)].join(" ");
  }
  const holes = holeIndexes(sentence);
  const filled = Array.isArray(written) ? written : [written];
  return tokens.map((t, i) => (holes.includes(i) ? filled[holes.indexOf(i)] ?? "" : t.text)).join(" ");
}
