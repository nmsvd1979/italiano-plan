import { useState } from "react";
import { useApp } from "../../app/state";
import { goBack } from "../../app/route";
import { exercisesOf, findExercise, unitNumber } from "../../content/grammar";
import type { CoursePart } from "../../content/course";
import { forPart } from "../../domain/parts";
import { getUnit } from "../../content/curriculum";
import { toISODate } from "../../domain/dates";
import { Grade } from "../../domain/grading";
import { candidatesOf, dueCandidates, learnedUnits } from "../../domain/practice";
import { recordFailure } from "../../domain/srs";
import { ReviewState, buildSession, recordResult } from "../../domain/review";
import { getReview, saveReview } from "../../domain/storage";
import { Icon } from "../../ui/Icon";
import { ExerciseRunner, RunnerItem, Summary } from "./ExerciseRunner";

interface Props {
  /** practice: una unidad · review: repaso mixto de lo visto · due: solo los errados que ya pueden volver. */
  mode: "practice" | "review" | "due";
  /** Unidad a practicar (solo en modo práctica). */
  unit?: string;
  /** Semana A o B de una unidad partida: solo sus ejercicios (docs/v2/13 §4). */
  part?: CoursePart | null;
  /** Cuántos ejercicios (por defecto 10). */
  size?: number;
}

const SIZE = 10;
const DUE_SIZE = 8;

export function PracticeScreen({ mode, unit = "", part = null, size = SIZE }: Props) {
  const { today, progress, completeActivity } = useApp();
  const meta = getUnit(unit);
  const [review, setReview] = useState<ReviewState>(() => getReview());
  const [summary, setSummary] = useState<Summary | null>(null);

  const [items] = useState<RunnerItem[]>(() => {
    const learned = learnedUnits(progress);
    // Practicar una unidad por adelantado (sin haber hecho la lección) igual la incluye.
    const units = mode === "practice" ? [...new Set([...learned, unit])].filter((u) => unitNumber(u) <= unitNumber(unit)) : learned;
    let candidates = candidatesOf(units);
    if (mode === "practice" && part) {
      const mine = new Set(forPart(unit, part, "exercises", exercisesOf(unit)).map(({ item }) => item.id));
      candidates = candidates.filter((c) => c.unit !== unitNumber(unit) || mine.has(c.id));
    }
    const ids = mode === "due"
      ? dueCandidates(candidates, getReview(), today).slice(0, DUE_SIZE).map((c) => c.id)
      : buildSession({
        candidates,
        focusUnit: mode === "practice" ? unitNumber(unit) : null,
        size,
        state: getReview(),
        today,
        seed: `${toISODate(today)}:${mode}:${unit}`,
      });
    return ids.flatMap((id) => {
      const found = findExercise(id);
      return found ? [{ id, exercise: found.exercise }] : [];
    });
  });

  const onAnswer = (item: RunnerItem, grade: Grade) => {
    // Un "casi" (faltaba la tilde) cuenta como acierto en el puntaje pero vuelve a aparecer.
    // El fallo en un ejercicio de completar también entra al repaso espaciado como tarjeta cloze.
    if (grade !== "correct" && item.exercise.type === "fill") {
      recordFailure(window.localStorage, { kind: "cloze", itemId: item.id, unit: item.id.slice(0, item.id.indexOf("-")) });
    }
    const next = recordResult(review, item.id, grade === "correct", today);
    setReview(next);
    saveReview(next);
  };

  const onFinish = (s: Summary) => {
    if (mode === "practice") completeActivity("practice", unit);
    else if (mode === "review") completeActivity("review");
    else completeActivity("due");
    setSummary(s);
  };

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">{mode === "practice" ? `Unidad ${meta?.n} · Práctica` : mode === "review" ? "Repaso mixto" : "Repaso pendiente"}</div>
          <h1 className="title">{mode === "practice" ? "Práctica de gramática" : mode === "review" ? "Repaso de todo lo visto" : "Lo que fallaste"}</h1>
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
          <p className="sub">
            {mode === "practice"
              ? "Esta unidad todavía no tiene ejercicios."
              : "Todavía no hay nada para repasar. Cuando hagas lecciones y falles ejercicios, aparecen aquí."}
          </p>
        ) : (
          <ExerciseRunner items={items} onAnswer={onAnswer} onFinish={onFinish} finishLabel="Ver resultado" />
        )}
      </section>
    </>
  );
}
