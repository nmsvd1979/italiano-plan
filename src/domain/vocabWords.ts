import type { CoursePart } from "../content/course";
import { getWords, type VocabItem, type VocabWord } from "../content/vocab";
import { forPart } from "./parts";

export interface UnitWords {
  /** «Palabras base»: el vocabulario original de la unidad (en las partidas, el de la semana). */
  base: VocabWord[];
  /** «Más palabras»: la ampliación (en las partidas, solo la de la semana). */
  more: VocabWord[];
}

/**
 * Las palabras que muestra «Palabras de la unidad». El núcleo se reparte por semana como siempre (`forPart`);
 * la ampliación, por su `part`: una palabra sin `part` va a las dos semanas, y sin semana se muestra todo.
 */
export function wordsForScreen(unit: string, part?: CoursePart | null): UnitWords | undefined {
  const words = getWords(unit);
  if (!words) return undefined;
  const core = words.filter((w) => !w.extra);
  return {
    base: forPart(unit, part, "vocab", core).map(({ item }) => item),
    more: words.filter((w) => w.extra && (!part || !w.part || w.part === part)),
  };
}

/** Lo mismo como lista plana de palabras (para el mini-quiz y para copiar). */
export const shownWords = (w: UnitWords): VocabItem[] => [...w.base, ...w.more];
