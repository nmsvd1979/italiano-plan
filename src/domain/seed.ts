import { AVANCE_INICIAL, type AvanceInicial } from "../content/avance-inicial";
import { UNITS, sessionsOf } from "../content/curriculum";
import { KEYS, KEYS_V2, getCompletions, type KV } from "./storage";

// Semilla de avance: marca como hechas las actividades que la persona ya había estudiado antes de la v2.
// Reglas (docs/v2/14 §1): solo agrega marcas que faltan, nunca sobrescribe ni borra, es idempotente
// (deja italianPlan.v2.seedApplied) y todas las marcas llevan la fecha del avance.

/** Claves de actividad (`u01.s1.quizlet`…) que cubre la semilla. */
export function seedKeys(avance: AvanceInicial = AVANCE_INICIAL): string[] {
  const keys: string[] = [];
  for (const [unitId, { sesiones }] of Object.entries(avance.unidades)) {
    const unit = UNITS.find((x) => x.id === unitId);
    if (!unit) continue;
    for (const s of sessionsOf(unit)) {
      if (!sesiones.includes(s.index)) continue;
      for (const a of s.activities) keys.push(`${unit.id}.s${s.index}.${a.id}`);
    }
  }
  return keys;
}

export const isSeedApplied = (store: KV): boolean => store.getItem(KEYS_V2.seedApplied) !== null;

/**
 * Se ofrece solo si no se aplicó antes y el dispositivo no tiene ninguna marca de las unidades de la semilla
 * (si ya hay progreso de u01, la persona ya avanzó aquí y no hace falta).
 */
export function canOfferSeed(store: KV, avance: AvanceInicial = AVANCE_INICIAL): boolean {
  if (isSeedApplied(store)) return false;
  const units = Object.keys(avance.unidades);
  const marked = Object.values(getCompletions(store)).some((day) =>
    Object.keys(day).some((k) => units.some((u) => k.startsWith(`${u}.`))));
  return !marked;
}

/**
 * Agrega las marcas que faltan en `avance.fecha` y deja la marca de aplicada. Devuelve cuántas marcas agregó.
 * Una segunda llamada no hace nada.
 */
export function applySeed(store: KV, now: Date = new Date(), avance: AvanceInicial = AVANCE_INICIAL): number {
  if (isSeedApplied(store)) return 0;
  const completions = getCompletions(store);
  const already = new Set(Object.values(completions).flatMap((day) => Object.keys(day).filter((k) => day[k])));
  const missing = seedKeys(avance).filter((k) => !already.has(k));
  if (missing.length > 0) {
    const day = { ...(completions[avance.fecha] ?? {}) };
    for (const k of missing) day[k] = true;
    store.setItem(KEYS.completions, JSON.stringify({ ...completions, [avance.fecha]: day }));
  }
  store.setItem(KEYS_V2.seedApplied, JSON.stringify({ fecha: avance.fecha, appliedAt: now.toISOString(), added: missing.length }));
  return missing.length;
}
