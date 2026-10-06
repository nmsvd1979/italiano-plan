import { rng, shuffle } from "./review";

export const SOUND_TOPIC = "sonidos";
export const WEAK_BELOW = 0.6;

/** Elige `perWeek` ejercicios de cada semana de la fase y los mezcla. Misma semilla = mismo test. */
export function pickGrammar(
  exercises: { id: string; week: number }[],
  weeks: number[],
  perWeek: number,
  seed: string,
): string[] {
  const rand = rng(seed);
  const chosen = weeks.flatMap((w) =>
    shuffle(exercises.filter((e) => e.week === w), rand).slice(0, perWeek).map((e) => e.id),
  );
  return shuffle(chosen, rand);
}

export interface Outcome {
  /** "w4" para gramática de la semana 4, o SOUND_TOPIC. */
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
