import type { Activity } from "../content/plan";
import { phaseForWeek } from "../domain/planState";
import { href } from "./route";

/** Herramienta propia que abre cada actividad (si la tiene). */
export function internalRoute(activity: Activity, week: number): { to: string; label: string } | undefined {
  switch (activity.kind) {
    case "grammarLesson":
      return { to: href(`/gramatica/${week}`), label: "Empezar lección" };
    case "grammarPractice":
      return { to: href(`/practica/${week}`), label: "Practicar" };
    case "pronunciation":
      return { to: href(`/pronunciacion/${week}`), label: "Practicar sonidos" };
    case "shadowing":
      return { to: href(`/shadowing/${week}`), label: "Abrir estudio" };
    case "phaseTest":
      return { to: href(`/test/${phaseForWeek(week).id}`), label: "Empezar test" };
    case "mixedReview":
      return { to: href("/repaso"), label: "Repasar" };
    default:
      return undefined;
  }
}
