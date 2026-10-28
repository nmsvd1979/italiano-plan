import { getUnit, type UnitPartItems } from "../content/curriculum";
import type { CoursePart } from "../content/course";

/**
 * Ítems de una lista de contenido que corresponden a una semana (parte A o B) de la unidad.
 * Lo que no está asignado a ninguna parte va a ambas como repaso (docs/v2/13 §4). Sin parte, devuelve todo.
 * Conserva el orden y el índice original: `index` es el que usan los ids de ejercicio.
 */
export function forPart<T>(unit: string, part: CoursePart | null | undefined, key: keyof UnitPartItems, items: readonly T[]): { item: T; index: number }[] {
  const all = items.map((item, index) => ({ item, index }));
  const parts = getUnit(unit)?.parts;
  if (!part || !parts) return all;
  const mine = new Set(parts[part][key] ?? []);
  const other = new Set(parts[part === "A" ? "B" : "A"][key] ?? []);
  return all.filter(({ index }) => mine.has(index) || !other.has(index));
}
