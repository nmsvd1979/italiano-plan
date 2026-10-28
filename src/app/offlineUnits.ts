import { UNITS } from "../content/curriculum";
import type { UnitMeta } from "../content/curriculum";

/** Unidades cuyo audio se baja primero: la actual y la siguiente. */
export function audioPriorityUnits(unit: UnitMeta | null): string[] {
  if (!unit) return [];
  const next = UNITS.find((u) => u.n === unit.n + 1);
  return next ? [unit.id, next.id] : [unit.id];
}
