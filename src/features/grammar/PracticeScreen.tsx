import { useState } from "react";
import { useApp } from "../../app/state";
import { goBack } from "../../app/route";
import { exercisesUpTo, findExercise } from "../../content/grammar";
import { toISODate } from "../../domain/dates";
import { Grade } from "../../domain/grading";
import { ReviewState, buildSession, recordResult } from "../../domain/review";
import { getReview, saveReview } from "../../domain/storage";
import { Icon } from "../../ui/Icon";
import { ExerciseRunner, RunnerItem, Summary } from "./ExerciseRunner";

interface Props {
  mode: "practice" | "review";
  /** Semana a practicar (solo en modo práctica). */
  week: number;
}

const SIZE = 10;

export function PracticeScreen({ mode, week }: Props) {
  const { today, plan, completeIfScheduled } = useApp();
  const [review, setReview] = useState<ReviewState>(() => getReview());
  const [summary, setSummary] = useState<Summary | null>(null);

  const [items] = useState<RunnerItem[]>(() => {
    const upTo = mode === "practice" ? week : plan?.weekNumber ?? week;
    const candidates = exercisesUpTo(upTo).map(({ id, week: w }) => ({ id, week: w }));
    const ids = buildSession({
      candidates,
      focusWeek: mode === "practice" ? week : null,
      size: SIZE,
      state: getReview(),
      today,
      seed: `${toISODate(today)}:${mode}:${week}`,
    });
    return ids.flatMap((id) => {
      const found = findExercise(id);
      return found ? [{ id, exercise: found.exercise }] : [];
    });
  });

  const onAnswer = (item: RunnerItem, grade: Grade) => {
    // Un "casi" (faltaba la tilde) cuenta como acierto en el puntaje pero vuelve a aparecer.
    const next = recordResult(review, item.id, grade === "correct", today);
    setReview(next);
    saveReview(next);
  };

  const onFinish = (s: Summary) => {
    completeIfScheduled(mode === "practice" ? "grammar_practice" : "grammar_review");
    setSummary(s);
  };

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">{mode === "practice" ? `Semana ${week} · Práctica` : "Repaso mixto"}</div>
          <h1 className="title">{mode === "practice" ? "Práctica de gramática" : "Repaso de todo lo visto"}</h1>
        </div>
      </header>

      <section className="card">
        {summary ? (
          <div className="stack">
            <div className="score">{summary.correct} de {summary.total}</div>
            <p className="sub">
              {summary.missed.length === 0
                ? "Sin errores. Muy bien."
                : "Los que fallaste van a volver en las próximas prácticas, cada vez más espaciados."}
            </p>
            {summary.missed.map(({ item }) => (
              <div key={item.id} className="missed">
                <div>{item.exercise.prompt}</div>
                <strong>{item.exercise.type === "choice" ? item.exercise.options[item.exercise.answer] : item.exercise.answers[0]}</strong>
              </div>
            ))}
            <a className="btn primary block" href="#/" style={{ textAlign: "center", textDecoration: "none" }}>Volver a Hoy</a>
          </div>
        ) : items.length === 0 ? (
          <p className="sub">No hay ejercicios para esta semana.</p>
        ) : (
          <ExerciseRunner items={items} onAnswer={onAnswer} onFinish={onFinish} finishLabel="Ver resultado" />
        )}
      </section>
    </>
  );
}
