import { rng, shuffle } from "./review";

export const SOUND_TOPIC = "sonidos";
export const WEAK_BELOW = 0.6;

/** Elige `perUnit` ejercicios de cada unidad de la fase y los mezcla. Misma semilla = mismo test. */
export function pickGrammar(
  exercises: { id: string; unit: number }[],
  units: number[],
  perUnit: number,
  seed: string,
): string[] {
  const rand = rng(seed);
  const chosen = units.flatMap((u) =>
    shuffle(exercises.filter((e) => e.unit === u), rand).slice(0, perUnit).map((e) => e.id),
  );
  return shuffle(chosen, rand);
}

export interface Outcome {
  /** "u04" para gramática de la unidad 4, o SOUND_TOPIC. */
  topic: string;
  correct: boolean;
}

export interface TopicScore {
  correct: number;
  total: number;
}

export interface TestSummary {
  total: number;
  correct: number;
  byTopic: Record<string, TopicScore>;
  /** Temas con menos del 60 % de aciertos, del más flojo al menos flojo. */
  weak: string[];
}

export function summarize(outcomes: Outcome[]): TestSummary {
  const byTopic: Record<string, TopicScore> = {};
  for (const o of outcomes) {
    const t = (byTopic[o.topic] ??= { correct: 0, total: 0 });
    t.total++;
    if (o.correct) t.correct++;
  }
  const weak = Object.entries(byTopic)
    .filter(([, s]) => s.correct / s.total < WEAK_BELOW)
    .sort(([, a], [, b]) => a.correct / a.total - b.correct / b.total)
    .map(([topic]) => topic);
  return {
    total: outcomes.length,
    correct: outcomes.filter((o) => o.correct).length,
    byTopic,
    weak,
  };
}

/** Nivel según el porcentaje de aciertos. */
export function levelOf(correct: number, total: number): { label: string; text: string } {
  const pct = total > 0 ? correct / total : 0;
  if (pct >= 0.8) return { label: "Nivel firme", text: "Puedes pasar a la siguiente fase con tranquilidad." };
  if (pct >= 0.6) return { label: "Casi", text: "Repasa los temas marcados antes de seguir o hazlo mientras avanzas." };
  return { label: "A repasar", text: "Antes de seguir conviene repasar estos temas: la fase siguiente se apoya en ellos." };
}
