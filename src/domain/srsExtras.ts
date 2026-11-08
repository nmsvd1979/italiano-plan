import { stepsOfUnit } from "../content/course";
import { getWords } from "../content/vocab";
import { UNITS } from "../content/curriculum";
import { blockKey } from "./cycle";
import { vocabForBlock } from "./vocabBlocks";
import { wordItemId, type Word } from "./srsDeck";

// Palabras ampliadas (G3, docs/v2/plan-b1/08) en el repaso espaciado. Cada una entra a la cola cuando hiciste el bloque
// de palabras que la contiene (días 3, 4 y 5: `words3`, `words4`, `words5`), igual que las de la unidad entran con el día 1.

const EXTRA_BLOCKS: [number, string][] = [[3, "words3"], [4, "words4"], [5, "words5"]];

const asWord = (unit: string, w: { it: string; es: string }): Word => ({ itemId: wordItemId(unit, w.it), unit, it: w.it, es: w.es });

/** Todas las palabras ampliadas de una unidad (sin las que ya son de la lista de la unidad), sin repetir. */
export function extraWordsOfUnit(unit: string): Word[] {
  const base = new Set((getWords(unit) ?? []).filter((w) => !w.extra).map((w) => wordItemId(unit, w.it)));
  const seen = new Set<string>();
  const out: Word[] = [];
  for (const w of getWords(unit) ?? []) {
    if (!w.extra) continue;
    const id = wordItemId(unit, w.it);
    if (base.has(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(asWord(unit, w));
  }
  return out;
}

/** Palabras ampliadas de una unidad cuyo bloque ya hiciste (en cualquiera de sus semanas), en el orden de la lista. */
export function extraWordsSeen(unit: string, done: ReadonlySet<string>): Word[] {
  const extra = extraWordsOfUnit(unit);
  if (extra.length === 0) return [];
  const extraIds = new Set(extra.map((w) => w.itemId));
  const shown = new Set<string>();
  for (const step of stepsOfUnit(unit)) {
    for (const [day, blockId] of EXTRA_BLOCKS) {
      if (!done.has(blockKey(step.id, day, blockId))) continue;
      for (const item of vocabForBlock(unit, step.part ?? null, blockId) ?? []) {
        const id = wordItemId(unit, item.it);
        if (extraIds.has(id)) shown.add(id);
      }
    }
  }
  return extra.filter((w) => shown.has(w.itemId));
}

/** Unidad → palabras ampliadas ya vistas, solo las unidades que tienen alguna. */
export function extraWordsFor(progress: { done: ReadonlySet<string> }): Map<string, Word[]> {
  const out = new Map<string, Word[]>();
  for (const u of UNITS) {
    const seen = extraWordsSeen(u.id, progress.done);
    if (seen.length > 0) out.set(u.id, seen);
  }
  return out;
}
