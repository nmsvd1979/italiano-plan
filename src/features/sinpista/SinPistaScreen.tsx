import { useEffect, useState } from "react";
import { Score } from "../../ui/Score";
import { Rich } from "../../ui/Rich";
import { useApp } from "../../app/state";
import { goBack } from "../../app/route";
import type { CoursePart } from "../../content/course";
import { getUnit } from "../../content/curriculum";
import { loadSinPistaContent } from "../../content/lazy";
import type { SinPista } from "../../content/sinpista";
import { loadSinPista, pickWeek, recordSinPista, saveSinPista, stepOf, WEEK_SIZE, type SinPistaState } from "../../domain/sinpistaState";
import { srsCardOf } from "../../domain/sinpistaSrs";
import { forgetFailure, recordFailure } from "../../domain/srs";
import { Icon } from "../../ui/Icon";
import { SinPistaRunner, type SinPistaSummary } from "./SinPistaRunner";

/** Guarda la respuesta en la rotación y, si falló, la deja como tarjeta de repaso espaciado de su unidad. */
export function saveAnswer(ex: SinPista, correct: boolean, corrected = false): void {
  const next: SinPistaState = recordSinPista(loadSinPista(window.localStorage), ex.id, stepOf(ex), correct, corrected);
  saveSinPista(next, window.localStorage);
  if (!correct) recordFailure(window.localStorage, srsCardOf(ex));
  else if (corrected) forgetFailure(window.localStorage, srsCardOf(ex));
}

export function SinPistaScreen({ unit, part = null, size = WEEK_SIZE }: { unit: string; part?: CoursePart | null; size?: number }) {
  const { completeActivity } = useApp();
  const meta = getUnit(unit);
  const [items, setItems] = useState<SinPista[] | null>(null);
  const [summary, setSummary] = useState<SinPistaSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadSinPistaContent().then((m) => {
      if (cancelled) return;
      setItems(pickWeek(m.getSinPista(unit, part ?? undefined), loadSinPista(window.localStorage), size));
    });
    return () => { cancelled = true; };
  }, [unit, part, size]);

  const finish = (s: SinPistaSummary) => {
    completeActivity("sinpista", unit);
    setSummary(s);
  };

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">Unidad {meta?.n}{part ? ` · semana ${part}` : ""} · Práctica variada</div>
          <h1 className="title">Sin ayudas</h1>
        </div>
      </header>

      <section className="card">
        {summary ? (
          <div className="stack">
            <Score correct={summary.correct} total={summary.total} />
            <p className="sub">
              {summary.missed.length === 0
                ? "Sin errores. Muy bien."
                : "Lo que fallaste quedó en tu repaso espaciado y volverá en los días de repaso."}
            </p>
            {summary.missed.map((ex) => (
              <div key={ex.id} className="missed">
                <div>{ex.type === "dialog" ? ex.lines.join(" ") : <Rich text={ex.prompt} />}</div>
                <strong>{ex.type === "dialog" || ex.type === "listen" ? ex.options[ex.answer] : ex.answers[0]}</strong>
              </div>
            ))}
            <a className="btn primary block" href="#/">Volver a Hoy</a>
          </div>
        ) : items === null ? (
          <p className="sub">Cargando…</p>
        ) : items.length === 0 ? (
          <p className="sub">Esta unidad todavía no tiene práctica sin pista.</p>
        ) : (
          <SinPistaRunner items={items} onAnswer={saveAnswer} onFinish={finish} finishLabel="Ver resultado" />
        )}
      </section>
    </>
  );
}
