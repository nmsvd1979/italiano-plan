import { UNITS } from "../content/curriculum";
import { currentUnit, type Progress, type Step } from "../domain/curriculum";

/** Unidades cuyo audio se baja primero: la actual y la siguiente. */
export function audioPriorityUnits(steps: Step[], progress: Progress): string[] {
  const unit = currentUnit(steps, progress);
  if (!unit) return [];
  const next = UNITS.find((u) => u.n === unit.n + 1);
  return next ? [unit.id, next.id] : [unit.id];
}
