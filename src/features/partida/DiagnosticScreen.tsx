import { useMemo, useRef, useState } from "react";
import { useApp } from "../../app/state";
import { goBack, href, routeQuery } from "../../app/route";
import {
  DiagnosticItem, DiagnosticOutcome, Diagnostic, diagnosticItems, diagnosticSessions, recordDiagnostic, scoreDiagnostic,
  skipDiagnostic, viewsOf,
} from "../../domain/continuity";
import { toISODate } from "../../domain/dates";
import { getPhaseTests, getReview } from "../../domain/storage";
import { Icon } from "../../ui/Icon";
import { ExerciseRunner, type RunnerItem } from "../grammar/ExerciseRunner";

const VERDICT_TEXT = {
  dominada: "Dominada: no se enseña de nuevo. Se siembra su repaso y se ofrece la puesta al día de lo nuevo.",
  repasar: "Para repasar: se siembra su repaso con menos estabilidad y tienes un repaso dirigido de lo que fallaste.",
  rehacer: "Por rehacer: la semana vuelve al plan como pendiente, con el curso normal.",
} as const;

/** Un ejercicio ya en curso de una unidad. Se vuelve a montar con cada unidad. */
function UnitDiagnostic({ unitId, onDone }: { unitId: string; onDone: (d: Diagnostic) => void }) {
  const { today } = useApp();
  const items = useMemo<DiagnosticItem[]>(() => diagnosticItems(unitId, new Set(Object.keys(getReview()))), [unitId]);
  const outcomes = useRef<DiagnosticOutcome[]>([]);
  const parts = useMemo(() => new Map(items.map((i) => [i.id, i.part])), [items]);
  const runner = useMemo<RunnerItem[]>(() => items.map((i) => ({ id: i.id, exercise: i.exercise })), [items]);

  return (
    <ExerciseRunner
      items={runner}
      onAnswer={(item, grade) => {
        outcomes.current.push({ id: item.id, part: parts.get(item.id), correct: grade !== "wrong" });
      }}
      onFinish={() => onDone(scoreDiagnostic(outcomes.current, toISODate(today)))}
      finishLabel="Ver resultado"
    />
  );
}

/** Diagnóstico opcional (docs/v2/14 §4): ejercicios sin pista de cada unidad, en sesiones cortas. No escribe ninguna clave antigua. */
export function DiagnosticScreen() {
  const { rawCourse, continuity, updateContinuity } = useApp();
  const n = Math.min(3, Math.max(1, Number(routeQuery().get("s")) || 1));
  const views = viewsOf(rawCourse, getPhaseTests(), continuity);
  const session = diagnosticSessions(views).find((s) => s.n === n);
  const pending = session?.units.filter((v) => v.pendingDiagnostic) ?? [];
  const [justDone, setJustDone] = useState<{ unit: string; result: Diagnostic } | null>(null);
  const current = pending[0];

  const back = (
    <header className="screen-head">
      <a className="back" href="#/punto-de-partida" onClick={(e) => { e.preventDefault(); goBack("/punto-de-partida"); }} aria-label="Volver">
        <Icon name="arrowLeft" size={20} />
      </a>
      <div>
        <div className="eyebrow">Diagnóstico · sesión {n}</div>
        <h1 className="title">¿Qué recuerdas?</h1>
      </div>
    </header>
  );

  if (justDone) {
    const unit = views.find((v) => v.unit.id === justDone.unit)?.unit;
    return (
      <>
        {back}
        <section className="card stack">
          <div className="eyebrow">Unidad {unit?.n} · {unit?.title}</div>
          <div className="score">{justDone.result.correct} de {justDone.result.total}</div>
          <p className="sub">{VERDICT_TEXT[justDone.result.verdict]}</p>
          {justDone.result.parts && (
            <p className="sub">
              {(["A", "B"] as const).filter((p) => justDone.result.parts?.[p]).map((p) => `Semana ${p}: ${justDone.result.parts![p]!.correct} de ${justDone.result.parts![p]!.total}`).join(" · ")}
            </p>
          )}
          {pending.length > 0 ? (
            <button type="button" className="btn primary block" onClick={() => setJustDone(null)}>Seguir con la unidad siguiente</button>
          ) : null}
          <a className="btn block" href={href("/punto-de-partida")} style={{ textAlign: "center", textDecoration: "none" }}>
            {pending.length > 0 ? "Seguir otro día" : "Volver a Tu punto de partida"}
          </a>
        </section>
      </>
    );
  }

  return (
    <>
      {back}
      <section className="card stack">
        {!session ? (
          <p className="sub">No hay unidades para diagnosticar en esta sesión.</p>
        ) : !current ? (
          <>
            <p className="sub">Esta sesión ya está lista.</p>
            <a className="btn primary block" href={href("/punto-de-partida")} style={{ textAlign: "center", textDecoration: "none" }}>Volver a Tu punto de partida</a>
          </>
        ) : (
          <>
            <div className="eyebrow">Unidad {current.unit.n} · {current.unit.title}</div>
            <p className="sub">
              {pending.length === 1 ? "Última unidad de esta sesión." : `Quedan ${pending.length} unidades en esta sesión.`}
              {" "}Responde sin mirar apuntes. No cambia tus marcas.
            </p>
            <UnitDiagnostic
              key={current.unit.id} unitId={current.unit.id}
              onDone={(result) => {
                updateContinuity((c) => recordDiagnostic(c, current.unit.id, result, new Date()));
                setJustDone({ unit: current.unit.id, result });
              }}
            />
            <button type="button" className="btn block" onClick={() => updateContinuity((c) => skipDiagnostic(c, current.unit.id, new Date()))}>
              Saltar esta unidad (queda para repasar)
            </button>
          </>
        )}
      </section>
      <p className="note"><Icon name="info" size={16} /><span>Puedes salir cuando quieras: lo que ya respondiste queda guardado.</span></p>
    </>
  );
}
