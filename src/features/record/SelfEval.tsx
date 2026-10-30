import { useState } from "react";

export const SELF_QUESTIONS = [
  "¿Terminé todas las frases?",
  "¿Se entiende lo que dije?",
  "¿Sonó con un ritmo natural?",
] as const;

const OPTIONS: [number, string][] = [[1, "Todavía no"], [2, "Más o menos"], [3, "Sí"]];

/** Promedio de las tres respuestas (1 a 3), con un decimal. */
export const selfRatingOf = (answers: number[]): number => Math.round((answers.reduce((a, b) => a + b, 0) / answers.length) * 10) / 10;

/** Tres preguntas de 1 a 3 (docs/v2/05 E1). Llama a `onDone` con la media cuando están las tres. */
export function SelfEval({ onDone, doneLabel = "Terminé" }: { onDone: (rating: number, answers: number[]) => void; doneLabel?: string }) {
  const [answers, setAnswers] = useState<(number | null)[]>(SELF_QUESTIONS.map(() => null));
  const complete = answers.every((a): a is number => a !== null);
  return (
    <div className="stack">
      {SELF_QUESTIONS.map((q, i) => (
        <div key={q} className="field">
          <label id={`self-${i}`}>{q}</label>
          <div className="segmented" role="group" aria-labelledby={`self-${i}`}>
            {OPTIONS.map(([value, text]) => (
              <button
                key={value} type="button" aria-pressed={answers[i] === value}
                onClick={() => setAnswers((a) => a.map((x, k) => (k === i ? value : x)))}
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button type="button" className="btn primary block" disabled={!complete} onClick={() => complete && onDone(selfRatingOf(answers as number[]), answers as number[])}>
        {doneLabel}
      </button>
    </div>
  );
}
