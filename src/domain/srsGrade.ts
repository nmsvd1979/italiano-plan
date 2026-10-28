import { normalize } from "./grading";
import type { RatingValue } from "./srs";

// Calificación del repaso espaciado (docs/v2/02 B4).

export type WriteGrade = "exact" | "close" | "wrong";

const PUNCTUATION = /[.,;:!?¡¿"«»…]/g;

/** Para comparar con tildes: minúsculas, apóstrofos unificados, sin puntuación. */
const exactForm = (s: string): string => normalize(s.replace(PUNCTUATION, " "));

/** Para "casi": además sin tildes ni apóstrofos (é/e, l'ho/lho). */
const looseForm = (s: string): string =>
  exactForm(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/'/g, "").replace(/\s+/g, " ").trim();

/** exact: coincide; close: solo faltan o sobran tildes o apóstrofos; wrong: cualquier otra cosa. */
export function gradeWriting(input: string, answers: string[]): WriteGrade {
  const given = exactForm(input);
  if (!given) return "wrong";
  if (answers.some((a) => exactForm(a) === given)) return "exact";
  const loose = looseForm(input);
  return answers.some((a) => looseForm(a) === loose) ? "close" : "wrong";
}

export const ratingForWriting = (g: WriteGrade): RatingValue => (g === "exact" ? 3 : g === "close" ? 2 : 1);

/** Opción múltiple: correcta = Good; correcta tras pedir pista = Hard; incorrecta = Again. */
export const ratingForChoice = (correct: boolean, usedHint: boolean): RatingValue => (!correct ? 1 : usedHint ? 2 : 3);

/** «Me equivoqué al escribir» (Again → Hard) y «Fácil» (Good → Easy). */
export const typoRating = (r: RatingValue): RatingValue => (r === 1 ? 2 : r);
export const easyRating = (r: RatingValue): RatingValue => (r === 3 ? 4 : r);
