import { useEffect, useRef, useState } from "react";
import { EmptyState } from "../../ui/EmptyState";
import { useApp } from "../../app/state";
import { goBack, afterActivityHref } from "../../app/route";
import { getUnit } from "../../content/curriculum";
import { getMonologue, type Monologue } from "../../content/monologos";
import type { CoursePart } from "../../content/course";
import { appendLog } from "../../domain/activityLog";
import { toISODate } from "../../domain/dates";
import { LAP_MESSAGE, MONO_QUESTIONS, coveredCount, lapStatus, monoActivity } from "../../domain/monologue";
import { writingKey } from "../../content/writing";
import { Icon } from "../../ui/Icon";
import { Rich } from "../../ui/Rich";
import { AudioButton } from "../../ui/AudioButton";
import { stopAudio } from "../../ui/modelAudio";
import { useRecorder } from "../record/useRecorder";
import { SelfEval } from "../record/SelfEval";

interface LapResult { seconds: number; covered: boolean[] }

/**
 * «Hablar sin mirar» (docs/v2/plan-b1/02): un monólogo en tres vueltas con la misma consigna y menos tiempo cada vez.
 * Tras la primera vuelta se muestran los puntos y el modelo (retroalimentación diferida). No hay reconocimiento de voz:
 * se mide la duración de cada vuelta y los puntos que tú marcas como cubiertos.
 */
export function MonologueScreen({ unit, part = null }: { unit: string; part?: CoursePart | null }) {
  const stepId = writingKey(unit, part);
  const mono = getMonologue(stepId);
  const meta = getUnit(unit);
  if (!mono) return <EmptyState message="Esta semana todavía no tiene monólogo." />;
  return <Session unit={unit} stepId={stepId} meta={meta?.n} mono={mono} />;
}

function Session({ unit, stepId, meta, mono }: { unit: string; stepId: string; meta?: number; mono: Monologue }) {
  const { completeActivity, today } = useApp();
  const [laps, setLaps] = useState<LapResult[]>([]);
  useEffect(() => () => stopAudio(), []);

  const lap = laps.length;
  const finished = lap >= mono.seconds.length;

  const finish = (rating: number) => {
    const last = laps[laps.length - 1];
    appendLog(window.localStorage, {
      date: toISODate(today), unit, activity: "monologo", minutes: 0,
      correct: last ? coveredCount(last.covered) : 0, total: mono.points.length, selfRating: rating,
    });
    stopAudio();
    completeActivity("monologue", unit);
    window.location.hash = afterActivityHref();
  };

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); stopAudio(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">Unidad {meta} · Hablar sin mirar</div>
          <h1 className="title">Dilo en tres vueltas</h1>
        </div>
      </header>

      <section className="card stack">
        <p>{mono.prompt}</p>
        <div className="eyebrow">Puntos que cubrir</div>
        <ul className="frames">{mono.points.map((p) => <li key={p}><Rich text={p} /></li>)}</ul>
        {mono.frames && mono.frames.length > 0 && (
          <>
            <div className="eyebrow">Marcos de ayuda</div>
            <ul className="frames" aria-label="Marcos de frase">{mono.frames.map((f) => <li key={f}>{f}</li>)}</ul>
          </>
        )}
        <p className="sub">
          Lo dices tres veces: cada vez con menos tiempo ({mono.seconds.join(" s, ")} s). Es para ganar soltura, no para que salga perfecto.
          Después de la primera vuelta ves el modelo.
        </p>
      </section>

      {laps.length > 0 && (
        <section className="card" aria-label="Vueltas hechas">
          <div className="eyebrow">Tus vueltas</div>
          <div className="unit-list">
            {laps.map((l, i) => (
              <div key={i} className="unit-row">
                <span className="unit-num">{i + 1}</span>
                <span className="unit-main">
                  <b>{l.seconds} s de {mono.seconds[i]} s</b>
                  <small>{coveredCount(l.covered)} de {mono.points.length} puntos</small>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {!finished ? (
        <LapCard
          key={lap} stepId={stepId} lap={lap} limit={mono.seconds[lap]} mono={mono}
          onDone={(r) => setLaps((all) => [...all, r])}
          last={lap === mono.seconds.length - 1}
        />
      ) : (
        <section className="card stack">
          <div className="eyebrow">Autoevaluación</div>
          <p className="sub">
            Tiempos: {laps.map((l) => `${l.seconds} s`).join(" → ")}. Si fueron bajando y seguiste cubriendo los puntos, ganaste soltura.
          </p>
          <SelfEval questions={MONO_QUESTIONS} onDone={(rating) => finish(rating)} doneLabel="Terminé" />
        </section>
      )}
    </>
  );
}

function LapCard({ stepId, lap, limit, mono, onDone, last }: {
  stepId: string; lap: number; limit: number; mono: Monologue; onDone: (r: LapResult) => void; last: boolean;
}) {
  const { status, take, start, stop, usable } = useRecorder(monoActivity(stepId, lap + 1));
  const t0 = useRef<number | null>(null);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [seconds, setSeconds] = useState<number | null>(null);
  const [covered, setCovered] = useState<boolean[]>(() => mono.points.map(() => false));

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setElapsed(Math.round((Date.now() - (t0.current ?? Date.now())) / 1000)), 250);
    return () => window.clearInterval(id);
  }, [running]);

  const begin = () => {
    stopAudio();
    t0.current = Date.now();
    setElapsed(0);
    setRunning(true);
    if (usable) void start();
  };
  const end = () => {
    setRunning(false);
    setSeconds(Math.max(1, Math.round((Date.now() - (t0.current ?? Date.now())) / 1000)));
    if (status === "recording") void stop();
  };

  const status0 = seconds === null ? null : lapStatus(seconds, limit);

  return (
    <section className="card stack" aria-label={`Vuelta ${lap + 1}`}>
      <div className="eyebrow">Vuelta {lap + 1} de {mono.seconds.length} · máximo {limit} s</div>
      {!usable && seconds === null && (
        <p className="note" role="status"><Icon name="info" size={16} /><span>No se puede grabar aquí. Sigue sin grabar: dilo en voz alta y marca cuándo empiezas y cuándo terminas.</span></p>
      )}
      {seconds === null && (
        running ? (
          <>
            <button type="button" className={`btn${usable ? " rec-on" : ""}`} onClick={end}><Icon name="pause" size={16} /> Terminé</button>
            <p className="sub" role="status">{usable ? "Grabando… " : ""}{elapsed} s de {limit} s</p>
          </>
        ) : (
          <button type="button" className="btn primary" onClick={begin}><Icon name="mic" size={16} /> {usable ? "Grabar la vuelta" : "Empezar a hablar"}</button>
        )
      )}

      {seconds !== null && status0 && (
        <>
          <p className="sub" role="status">{seconds} s. {LAP_MESSAGE[status0]}</p>
          {take && <audio controls src={take.url} aria-label="Tu grabación" />}
          <div className="eyebrow">¿Cubriste cada punto?</div>
          <ul className="cando-check">
            {mono.points.map((p, i) => (
              <li key={p}>
                <label>
                  <input className="check small" type="checkbox" checked={covered[i]} onChange={() => setCovered((c) => c.map((x, k) => (k === i ? !x : x)))} />
                  <span><Rich text={p} /></span>
                </label>
              </li>
            ))}
          </ul>
          {lap === 0 && (
            <div className="stack">
              <div className="eyebrow">Modelo</div>
              <div className="example">
                <div className="example-it">{mono.model}</div>
                <AudioButton text={mono.model} />
              </div>
              <p className="sub">Compáralo con lo que dijiste y fíjate qué estructura usó el modelo que tú no. Vas a decirlo otra vez.</p>
            </div>
          )}
          <button type="button" className="btn primary block" onClick={() => onDone({ seconds, covered })}>
            {last ? "Terminé las vueltas" : "Siguiente vuelta"}
          </button>
        </>
      )}
    </section>
  );
}
