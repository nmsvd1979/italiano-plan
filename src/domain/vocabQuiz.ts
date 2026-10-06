import type { Choice } from "../content/grammar/types";
import type { VocabItem } from "../content/vocab";
import { rng, shuffle } from "./review";

/** Palabra en italiano sin el artículo inicial (il tavolo → tavolo). */
export function bare(it: string): string {
  return it.replace(/^(?:(?:il|lo|la|i|gli|le)\s+|l')/i, "");
}

/** Texto para importar en Quizlet: término, tabulador, definición; una tarjeta por línea. */
export function toQuizletText(items: VocabItem[]): string {
  return items.map((v) => `${v.it}\t${v.es}`).join("\n");
}

/**
 * Preguntas de opción múltiple sobre las palabras de la unidad. Alterna italiano → español y
 * español → italiano, con distractores de la misma unidad. Misma semilla = mismas preguntas.
 */
export function buildVocabQuiz(items: VocabItem[], size: number, seed: string): Choice[] {
  const rand = rng(seed);
  const picked = shuffle(items, rand).slice(0, Math.min(size, items.length));
  return picked.map((item, i) => {
    const toSpanish = i % 2 === 0;
    const others = shuffle(items.filter((x) => x.it !== item.it), rand).slice(0, 2);
    const options = shuffle([item, ...others], rand);
    return {
      type: "choice",
      prompt: toSpanish ? `¿Qué significa **${item.it}**?` : `¿Cómo se dice «${item.es}»?`,
      options: options.map((o) => (toSpanish ? o.es : o.it)),
      answer: options.indexOf(item),
      why: `*${item.it}* = ${item.es}.`,
    };
  });
}
