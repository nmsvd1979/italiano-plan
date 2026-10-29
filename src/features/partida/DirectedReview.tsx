import { useMemo, useState } from "react";
import { useApp } from "../../app/state";
import { goBack, href } from "../../app/route";
import { getUnit } from "../../content/curriculum";
import { findExercise } from "../../content/grammar";
import { markDirected } from "../../domain/continuity";
import { toISODate } from "../../domain/dates";
import { Icon } from "../../ui/Icon";
import { ExerciseRunner, type RunnerItem, type Summary } from "../grammar/ExerciseRunner";

/** Repaso dirigido de una unidad «para repasar» (docs/v2/14 §5): los ejercicios que fallaste en el diagnóstico. */
export function DirectedReview({ unit }: { unit: string }) {
  const { today, continuity, updateContinuity } = useApp();
  const meta = getUnit(unit);
  const items = useMemo<RunnerItem[]>(
    () => (continuity.units[unit]?.diagnostic?.failed ?? []).flatMap((id) => {
      const found = findExercise(id);
      return found ? [{ id, exercise: found.exercise }] : [];
    }),
    // El conjunto se fija al abrir: terminar el repaso no lo vacía a mitad de camino.
    [unit],
  );
  const [summary, setSummary] = useState<Summary | null>(null);

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/punto-de-partida" onClick={(e) => { e.preventDefault(); goBack("/punto-de-partida"); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">Unidad {meta?.n} · Repaso dirigido</div>
          <h1 className="title">Lo que fallaste</h1>
        </div>
      </header>
      <section className="card stack">
        {items.length === 0 ? (
          <p className="sub">No hay ejercicios para repasar en esta unidad.</p>
        ) : summary ? (
          <>
            <div className="score">{summary.correct} de {summary.total}</div>
            <p className="sub">Repaso terminado. Esto no cambia tus marcas ni tu repaso por cajas.</p>
            <a className="btn primary block" href={href("/punto-de-partida")} style={{ textAlign: "center", textDecoration: "none" }}>Volver a Tu punto de partida</a>
          </>
        ) : (
          <ExerciseRunner
            items={items}
            onFinish={(s) => {
              updateContinuity((c) => markDirected(c, unit, toISODate(today)));
              setSummary(s);
            }}
            finishLabel="Terminar"
          />
        )}
      </section>
    </>
  );
}
