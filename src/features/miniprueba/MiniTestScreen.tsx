import { useEffect, useState } from "react";
import { useApp } from "../../app/state";
import { goBack, routeQuery } from "../../app/route";
import { COURSE } from "../../content/course";
import { getUnit } from "../../content/curriculum";
import { findExercise } from "../../content/grammar";
import { loadPruebas } from "../../content/pruebas";
import { PASS_RATIO } from "../../domain/cycle";
import { appendLog } from "../../domain/activityLog";
import { toISODate } from "../../domain/dates";
import { AREAS, miniBattery, scoreAreas, totalOf, type AreaScores, type Battery, type TestItem } from "../../domain/evaluation";
import { miniItems } from "../../domain/miniTest";
import { recordResult } from "../../domain/review";
import { loadSrs, recordFailure } from "../../domain/srs";
import { getReview, saveReview } from "../../domain/storage";
import { Icon } from "../../ui/Icon";
import { ResultView } from "../evaluacion/ResultView";
import { TestRunner, type TestResult } from "../evaluacion/TestRunner";

/** Mini-prueba de la semana (docs/v2/06 F2): 20 ítems de 5 áreas si hay reserva; si no, solo gramática y se avisa. Aprobar es ≥ 75 %. */
export function MiniTestScreen({ unit }: { unit: string }) {
  const { today, course, recordMini } = useApp();
  const q = routeQuery();
  const step = COURSE.find((s) => s.id === q.get("step") && s.unit === unit);
  const attempt = Number(q.get("a") ?? 0);
  const meta = getUnit(unit);
  const [battery, setBattery] = useState<Battery | null>(null);
  const [result, setResult] = useState<{ battery: Battery; passed: boolean; scores: AreaScores } | null>(null);
  const already = step ? (course.mini[step.id]?.length ?? 0) > attempt : false;

  useEffect(() => {
    if (!step) return;
    let off = false;
    void loadPruebas().then((p) => {
      if (off) return;
      const fallback: TestItem[] = miniItems(step.id, unit, step.part ?? null, attempt).map((e) => ({ area: "gramatica", id: e.id, unit, exercise: e.exercise }));
      setBattery(miniBattery(step.id, unit, step.part ?? null, attempt, p, loadSrs(window.localStorage), fallback));
    });
    return () => { off = true; };
  }, [step, unit, attempt]);

  const onAnswer = ({ item, points }: TestResult) => {
    if (item.area !== "gramatica" || !findExercise(item.id)) return;
    saveReview(recordResult(getReview(), item.id, points === 1, today));
    if (points < 1 && item.exercise.type === "fill") recordFailure(window.localStorage, { kind: "cloze", itemId: item.id, unit: item.id.slice(0, item.id.indexOf("-")) });
  };

  const onFinish = (results: TestResult[]) => {
    if (!step || !battery) return;
    const scores = scoreAreas(results.map((r) => ({ area: r.item.area, points: r.points })));
    const t = totalOf(scores);
    for (const a of AREAS) if (scores[a]) appendLog(window.localStorage, { date: toISODate(today), unit, activity: `mini:${a}`, minutes: 0, correct: scores[a]!.correct, total: scores[a]!.total });
    const passed = recordMini(step.id, t.correct, t.total, q.get("k") ?? undefined);
    setResult({ battery, passed, scores });
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
        {!step || (battery && battery.items.length === 0) ? (
          <p className="sub">Esta semana todavía no tiene prueba.</p>
        ) : already && !result ? (
          <div className="stack">
            <p className="sub">Ya hiciste este intento. Vuelve a Hoy para seguir.</p>
            <a className="btn primary block" href="#/" style={{ textAlign: "center", textDecoration: "none" }}>Volver a Hoy</a>
          </div>
        ) : !battery ? (
          <p className="sub">Cargando…</p>
        ) : result ? (
          <Result result={result} />
        ) : (
          <>
            <p className="sub" style={{ marginBottom: 12 }}>{battery.items.length} ítems, sin pista. Respóndelos sin mirar apuntes.</p>
            {battery.missing.length > 0 && <p className="note" role="status">Esta prueba solo tiene gramática: todavía faltan ítems de lectura y escucha para esta unidad.</p>}
            <TestRunner items={battery.items} onAnswer={onAnswer} onFinish={onFinish} />
          </>
        )}
      </section>
    </>
  );
}

function Result({ result }: { result: { battery: Battery; passed: boolean; scores: AreaScores } }) {
  return (
    <div className="stack">
      <ResultView scores={result.scores} battery={result.battery} />
      <p className="sub">
        {result.passed
          ? "Aprobaste: pasas a lo que sigue."
          : `Para pasar hacen falta ${Math.round(PASS_RATIO * 100)} %. No pasa nada: Hoy te pone 2 días de repaso de lo que fallaste y después haces otra versión de la prueba.`}
      </p>
      <a className="btn primary block" href="#/" style={{ textAlign: "center", textDecoration: "none" }}>Volver a Hoy</a>
    </div>
  );
}
