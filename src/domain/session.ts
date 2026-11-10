import { getUnit } from "../content/curriculum";
import { Block, CourseProgress, Slot, blockDone, blockKey, isSoon, visibleBlocks } from "./cycle";

export interface SessionItem {
  slot: Slot;
  block: Block;
  key: string;
  done: boolean;
}

/**
 * Los bloques de los días que muestra Hoy, partidos en esenciales (la sesión guiada) y recomendados («Si te queda tiempo»).
 * Respeta el modo corto y deja fuera los «en preparación».
 */
export function sessionItems(shown: Slot[], p: CourseProgress, short: boolean): { essential: SessionItem[]; optional: SessionItem[] } {
  const essential: SessionItem[] = [];
  const optional: SessionItem[] = [];
  for (const slot of shown) {
    const unit = getUnit(slot.step.unit);
    if (!unit) continue;
    for (const block of visibleBlocks(slot.day, unit, short)) {
      if (isSoon(block, unit)) continue;
      const item: SessionItem = { slot, block, key: blockKey(slot.step.id, slot.day.day, block.id), done: blockDone(slot.step, slot.day.day, block, p) };
      (block.core ? essential : optional).push(item);
    }
  }
  return { essential, optional };
}

/** Lo que sigue en la sesión: el primer bloque esencial pendiente. */
export const nextItem = (items: SessionItem[]): SessionItem | undefined => items.find((i) => !i.done);
