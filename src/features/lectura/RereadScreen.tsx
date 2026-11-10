import { useEffect, useState } from "react";
import { useApp } from "../../app/state";
import { goBack, afterActivityHref } from "../../app/route";
import { getCourseStep, type CoursePart } from "../../content/course";
import { getUnit } from "../../content/curriculum";
import { loadLectura } from "../../content/lazy";
import type { Lectura } from "../../content/lectura";
import { appendLog } from "../../domain/activityLog";
import { toISODate } from "../../domain/dates";
import { rereadSource } from "../../domain/reread";
import { writingKey } from "../../content/writing";
import { Icon } from "../../ui/Icon";
import { stopAudio } from "../../ui/modelAudio";
import { Questions, ReadText } from "./LecturaScreen";

type Stage = "intro" | "memoria" | "texto";

/**
 * «Releer con recuperación»: retoma el texto de la semana anterior. Primero respondes de memoria sus preguntas, sin ver el
 * texto; después lo relees con su traducción y su audio. No cuenta como lectura nueva ni cambia el avance del ciclo.
 */
export function RereadScreen({ unit, part = null }: { unit: string; part?: CoursePart | null }) {
  const { completeActivity, today } = useApp();
  const stepId = writingKey(unit, part);
  const sourceId = rereadSource(stepId);
  const source = sourceId ? getCourseStep(sourceId) : undefined;
  const [lectura, setLectura] = useState<Lectura | null | undefined>(undefined);
  const [stage, setStage] = useState<Stage>("intro");
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadLectura().then((m) => { if (!cancelled) setLectura(sourceId ? m.getLectura(sourceId) ?? null : null); });
    return () => { cancelled = true; stopAudio(); };
  }, [sourceId]);

  const finish = () => {
    appendLog(window.localStorage, {
      date: toISODate(today), unit, activity: "releer", minutes: 0,
      ...(score !== null && lectura ? { correct: score, total: lectura.preguntas.length } : {}),
    });
    stopAudio();
    completeActivity("reread", unit);
    window.location.hash = afterActivityHref();
  };

  const sourceUnit = source ? getUnit(source.unit) : undefined;
  const label = source ? `unidad ${sourceUnit?.n}${source.part ? ` · semana ${source.part}` : ""}` : "";

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); stopAudio(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">Releer con recuperación{label ? ` · texto de la ${label}` : ""}</div>
          <h1 className="title">{stage === "texto" ? "Ahora léelo de nuevo" : "¿Qué recuerdas?"}</h1>
        </div>
      </header>

      {lectura === undefined ? (
        <p className="sub">Cargando…</p>
      ) : lectura === null || !source ? (
        <p className="sub">Esta semana todavía no tiene un texto anterior que retomar.</p>
      ) : stage === "intro" ? (
        <section className="card stack">
          <div className="eyebrow">{lectura.tipo}</div>
          <h2 className="title sm">{lectura.titulo}</h2>
          <p className="sub">
            Leíste este texto hace unos días. Antes de volver a verlo, responde de memoria sus {lectura.preguntas.length} preguntas.
            Equivocarte es parte de ejercitar la memoria: lo que fallas lo vuelves a ver en el texto.
          </p>
          <button type="button" className="btn primary block" onClick={() => setStage("memoria")}>Responder de memoria</button>
          <button type="button" className="btn block" onClick={() => setStage("texto")}>Prefiero releerlo primero</button>
        </section>
      ) : stage === "memoria" ? (
        <section className="card"><Questions lectura={lectura} onFinish={(c) => { setScore(c); setStage("texto"); }} /></section>
      ) : (
        <>
          {score !== null && (
            <section className="card">
              <p className="sub" role="status">De memoria acertaste {score} de {lectura.preguntas.length}. Ahora fíjate en lo que no recordabas.</p>
            </section>
          )}
          <ReadText lectura={lectura} onNext={finish} nextLabel="Terminé" />
        </>
      )}
    </>
  );
}
