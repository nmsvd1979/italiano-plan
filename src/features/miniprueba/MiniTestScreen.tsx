import { useState } from "react";
import { useApp } from "../../app/state";
import { goBack, routeQuery } from "../../app/route";
import { COURSE } from "../../content/course";
import { getUnit } from "../../content/curriculum";
import { PASS_RATIO } from "../../domain/cycle";
import { Grade } from "../../domain/grading";
import { MINI_SIZE, miniItems } from "../../domain/miniTest";
import { recordFailure } from "../../domain/srs";
import { recordResult } from "../../domain/review";
import { getReview, saveReview } from "../../domain/storage";
import { Icon } from "../../ui/Icon";
import { ExerciseRunner, RunnerItem, Summary } from "../grammar/ExerciseRunner";

/** Mini-prueba de la semana: ejercicios de la unidad sin pista. Aprobar es ≥ 75 % (docs/v2/04 D3). */
export function MiniTestScreen({ unit }: { unit: string }) {
  const { today, course, recordMini } = useApp();
  const q = routeQuery();
  const step = COURSE.find((s) => s.id === q.get("step") && s.unit === unit);
  const attempt = Number(q.get("a") ?? 0);
  const meta = getUnit(unit);
  const [result, setResult] = useState<{ summary: Summary; passed: boolean } | null>(null);
  const [items] = useState<RunnerItem[]>(() =>
    step ? miniItems(step.id, unit, step.part ?? null, attempt).map((e) => ({ id: e.id, exercise: e.exercise })) : [],
  );
  const already = step ? (course.mini[step.id]?.length ?? 0) > attempt : false;

  const onAnswer = (item: RunnerItem, grade: Grade) => {
    // Lo que falles entra al repaso (Leitner de ejercicios y tarjetas de completar).
    saveReview(recordResult(getReview(), item.id, grade === "correct", today));
    if (grade !== "correct" && item.exercise.type === "fill") {
      recordFailure(window.localStorage, { kind: "cloze", itemId: item.id, unit: item.id.slice(0, item.id.indexOf("-")) });
    }
  };

  const onFinish = (summary: Summary) => {
    if (!step) return;
    const passed = recordMini(step.id, summary.correct, summary.total, q.get("k") ?? undefined);
    setResult({ summary, passed });
  };

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">Unidad {meta?.n}{step?.part ? ` · semana ${step.part}` : ""} · Mini-prueba</div>
          <h1 className="title">Mini-prueba de la semana</h1>
        </div>
      </header>

      <section className="card">
        {!step || items.length === 0 ? (
          <p className="sub">Esta semana todavía no tiene prueba.</p>
        ) : already && !result ? (
          <div className="stack">
            <p className="sub">Ya hiciste este intento. Vuelve a Hoy para seguir.</p>
            <a className="btn primary block" href="#/" style={{ textAlign: "center", textDecoration: "none" }}>Volver a Hoy</a>
          </div>
        ) : result ? (
          <div className="stack">
            <div className="score">{result.summary.correct} de {result.summary.total}</div>
            <p className="sub">
              {result.passed
                ? "Aprobaste: pasas a lo que sigue."
                : `Para pasar hacen falta ${Math.round(PASS_RATIO * 100)} %. No pasa nada: Hoy te pone 2 días de repaso de lo que fallaste y después haces otra versión de la prueba.`}
            </p>
            {result.summary.missed.map(({ item }) => (
              <div key={item.id} className="missed">
                <div>{item.exercise.prompt}</div>
                <strong>{item.exercise.type === "choice" ? item.exercise.options[item.exercise.answer] : item.exercise.answers[0]}</strong>
              </div>
            ))}
            <a className="btn primary block" href="#/" style={{ textAlign: "center", textDecoration: "none" }}>Volver a Hoy</a>
          </div>
        ) : (
          <>
            <p className="sub" style={{ marginBottom: 12 }}>{Math.min(MINI_SIZE, items.length)} ejercicios, sin pista. Respóndelos sin mirar apuntes.</p>
            <ExerciseRunner items={items} onAnswer={onAnswer} onFinish={onFinish} finishLabel="Ver resultado" />
          </>
        )}
      </section>
    </>
  );
}
