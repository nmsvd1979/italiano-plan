import type { CourseStep } from "../content/course";
import { INPUT_GROUP_NAME, PHASE_INPUT, RESOURCES, type Resource } from "../content/plan";
import { getUnit } from "../content/curriculum";
import { Block, CycleDay, blockKey } from "../domain/cycle";
import { href } from "./route";

/** Herramienta propia que abre un bloque del ciclo (si la tiene). La clave `k` dice qué bloque marcar al terminar. */
export function blockRoute(step: CourseStep, day: CycleDay, block: Block): { to: string; label: string } | undefined {
  const unit = step.unit;
  const k = blockKey(step.id, day.day, block.id);
  const q = (extra: Record<string, string | number | undefined> = {}) => {
    const params = new URLSearchParams();
    if (step.part) params.set("part", step.part);
    for (const [name, value] of Object.entries(extra)) if (value !== undefined) params.set(name, String(value));
    params.set("k", k);
    return `?${params.toString()}`;
  };
  switch (block.kind) {
    case "srs": return { to: href(`/tarjetas${q()}`), label: "Repasar tarjetas" };
    case "dialogue":
      // El diálogo con rol (día 4) graba y compara; los demás bloques de diálogo solo leen y escuchan.
      return block.id === "roleplay"
        ? { to: href(`/dialogo/${unit}${q({ mode: "rol" })}`), label: "Empezar la escena" }
        : { to: href(`/dialogo/${unit}${q()}`), label: "Abrir diálogo" };
    case "vocab": return { to: href(`/vocabulario/${unit}${q()}`), label: "Ver palabras" };
    case "pron":
      return block.id === "compare"
        ? { to: href(`/pronunciacion/${unit}${q({ mode: "comparar" })}`), label: "Repetir y comparar" }
        : { to: href(`/pronunciacion/${unit}${q()}`), label: "Practicar sonidos" };
    case "lesson": return { to: href(`/gramatica/${unit}${q()}`), label: "Empezar lección" };
    case "practice": return { to: href(`/practica/${unit}${q({ n: block.size })}`), label: "Practicar" };
    case "sinpista": return { to: href(`/variada/${unit}${q({ n: block.size })}`), label: "Practicar" };
    case "reading": return { to: href(`/lectura/${unit}${q()}`), label: "Leer el texto" };
    case "readq": return { to: href(`/lectura/${unit}${q({ mode: "preguntas" })}`), label: "Responder preguntas" };
    case "dictation": return { to: href(`/dictado/${unit}${q()}`), label: "Empezar dictado" };
    // Shadowing propio (sin conexión) con los diálogos y textos de la app. El de YouTube es un extra del día 7 (input libre).
    case "shadowing": return { to: href(`/shadowing-propio/${unit}${q()}`), label: "Empezar shadowing" };
    case "input": return { to: href(`/shadowing/${unit}${q()}`), label: "Shadowing con video (extra)" };
    case "writing": return { to: href(`/escritura/${unit}${q()}`), label: "Escribir" };
    case "cando": return { to: href(`/unidad/${unit}`), label: "Ver «Puedo…»" };
    case "review": return { to: href(`/repaso${q()}`), label: "Repasar" };
    case "failed": return { to: href(`/repaso-pendiente${q()}`), label: "Repasar" };
    case "mini": return { to: href(`/miniprueba/${unit}${q({ step: step.id, a: block.attempt ?? 0 })}`), label: "Empezar prueba" };
    default: return undefined;
  }
}

/** Enlaces externos de un bloque (el input libre usa los podcasts de la fase de la unidad). */
export function blockResources(step: CourseStep, block: Block): Resource[] {
  if (block.kind !== "input") return [];
  const unit = getUnit(step.unit);
  if (!unit) return [];
  return PHASE_INPUT[unit.phase].resources.map((r) => RESOURCES[r]).filter(Boolean);
}

export const inputGroupName = (step: CourseStep): string | undefined => {
  const unit = getUnit(step.unit);
  return unit ? INPUT_GROUP_NAME[PHASE_INPUT[unit.phase].group] : undefined;
};
