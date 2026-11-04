import type { CoursePart } from "../content/course";
import { getVocab, getWords, type VocabItem } from "../content/vocab";
import { forPart } from "./parts";

/** Bloques de palabras de la semana: el día 1 trae las palabras de la unidad; los días 3, 4 y 5 traen la ampliación (G3) en tres partes. */
const EXTRA_BLOCKS = ["words3", "words4", "words5"] as const;

/**
 * Palabras que muestra un bloque de «Palabras de la unidad». Sin bloque conocido (se abrió desde la unidad) o sin
 * ampliación escrita, las palabras de la unidad de siempre. Cada palabra de la ampliación sale en un solo bloque de la semana.
 */
export function vocabForBlock(unit: string, part: CoursePart | null | undefined, blockId: string | undefined): VocabItem[] | undefined {
  const all = getVocab(unit);
  if (!all) return undefined;
  const core = forPart(unit, part, "vocab", all).map(({ item }) => item);
  const slot = EXTRA_BLOCKS.indexOf(blockId as (typeof EXTRA_BLOCKS)[number]);
  if (slot < 0) return core;
  const extras = (getWords(unit) ?? []).filter((w) => w.extra && (!part || !w.part || w.part === part));
  if (extras.length === 0) return core;
  const size = Math.ceil(extras.length / EXTRA_BLOCKS.length);
  const chunk = extras.slice(slot * size, (slot + 1) * size);
  return chunk.length > 0 ? chunk : core;
}
