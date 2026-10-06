import { INPUT_GROUP_NAME, PHASE_INPUT, RESOURCES, Resource } from "../content/plan";
import { Step, episodeNumber } from "../domain/curriculum";
import { href } from "./route";

/** Herramienta propia que abre cada actividad (si la tiene). */
export function internalRoute(step: Step): { to: string; label: string } | undefined {
  const unit = step.unit.id;
  switch (step.activity.kind) {
    case "grammarLesson":
      return { to: href(`/gramatica/${unit}`), label: "Empezar lección" };
    case "grammarPractice":
      return { to: href(`/practica/${unit}`), label: "Practicar" };
    case "pronunciation":
      return { to: href(`/pronunciacion/${unit}`), label: "Practicar sonidos" };
    case "shadowing":
      return { to: href(`/shadowing/${unit}`), label: "Abrir estudio" };
    case "phaseTest":
      return { to: href(`/test/${step.unit.phase}`), label: "Empezar test" };
    case "mixedReview":
      return { to: href("/repaso"), label: "Repasar" };
    default:
      return undefined;
  }
}

/** Resuelve los recursos de una actividad (incluido el placeholder "input", según la fase de la unidad). */
export function resolveResources(step: Step): Resource[] {
  const keys = (step.activity.resources ?? []).flatMap((k) => (k === "input" ? PHASE_INPUT[step.unit.phase].resources : [k]));
  return keys.map((k) => RESOURCES[k]).filter(Boolean);
}

/** Texto de apoyo de un paso: en el input, qué episodio toca. */
export function stepHint(step: Step, steps: Step[]): string | undefined {
  const n = episodeNumber(step, steps);
  if (n === null) return undefined;
  const name = INPUT_GROUP_NAME[PHASE_INPUT[step.unit.phase].group];
  return `Hoy: episodio ${n} de ${name}. Si es la primera vez, empieza por el más antiguo y sigue en orden.`;
}
