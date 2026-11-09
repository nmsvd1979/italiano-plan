import { getUnit } from "../content/curriculum";
import { toISODate } from "./dates";
import type { Area } from "./evaluation";
import { rng } from "./review";

// «Practicar por habilidad» (docs/v2/plan-b1/06): un atajo por área hacia las pantallas que ya existen, con una unidad ya vista
// elegida por día. Es práctica extra: el enlace lleva `extra=1` para que no marque bloques del plan.

export interface AreaTarget {
  to: string;
  /** Qué se practica, en una línea. */
  detail: string;
}

/** Las áreas de la prueba de nivel que tienen una práctica propia (la producción se practica escribiendo frases). */
export const PRACTICE_AREAS: Area[] = ["gramatica", "vocabulario", "escucha", "lectura", "produccion"];

const withQuery = (path: string, unit: string, extra: Record<string, string> = {}): string => {
  const params = new URLSearchParams(extra);
  if (getUnit(unit)?.parts) params.set("part", "A");
  params.set("extra", "1");
  return `/${path}${unit ? `/${unit}` : ""}?${params.toString()}`;
};

/** Unidad ya vista para esa área y esa fecha: estable durante el día y distinta de un día a otro. */
function pick(units: string[], area: Area, today: Date): string {
  return units[Math.floor(rng(`${toISODate(today)}:area:${area}`)() * units.length)];
}

/** A dónde lleva cada área, o null si no hay nada que practicar todavía (sin unidades vistas). */
export function areaTarget(area: Area, learned: string[], today: Date): AreaTarget | null {
  if (area === "vocabulario") return { to: "/tarjetas", detail: "Repaso espaciado de tus palabras" };
  if (area === "gramatica") return { to: "/practicar", detail: "10 ejercicios de lo ya visto" };
  if (learned.length === 0) return null;
  if (area === "escucha") {
    const units = learned.filter((u) => getUnit(u)?.has.dictation);
    if (units.length === 0) return null;
    const unit = pick(units, area, today);
    return { to: withQuery("dictado", unit), detail: `Dictado de la unidad ${getUnit(unit)?.n}` };
  }
  const unit = pick(learned, area, today);
  if (area === "lectura") return { to: withQuery("lectura", unit, { mode: "preguntas" }), detail: `Preguntas de la lectura de la unidad ${getUnit(unit)?.n}` };
  if (area === "produccion") return { to: withQuery("frases", unit), detail: `Dos frases propias con la unidad ${getUnit(unit)?.n}` };
  return null;
}
