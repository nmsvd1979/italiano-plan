import { useState } from "react";
import { useApp } from "../../app/state";
import { goBack } from "../../app/route";
import { READY_UNITS, getPhase, getUnit } from "../../content/curriculum";
import { exercisesForUnits, findExercise, getLesson, unitNumber } from "../../content/grammar";
import { audioFiles, getPronUnit } from "../../content/pronunciation";
import { toISODate } from "../../domain/dates";
import { Grade } from "../../domain/grading";
import { Outcome, SOUND_TOPIC, TestSummary, pickGrammar, summarize } from "../../domain/phaseTest";
import { buildTrials } from "../../domain/pronunciation";
import { getReview, getPhaseTests, saveReview, addPhaseTest } from "../../domain/storage";
import { recordResult } from "../../domain/review";
import { Icon } from "../../ui/Icon";
import { ExerciseRunner, RunnerItem } from "../grammar/ExerciseRunner";
import { SoundTrials } from "../pronunciation/SoundTrials";

const PER_UNIT = 3;
const SOUND_TRIALS = 6;

/** Nivel según el porcentaje de aciertos. */
export function levelOf(correct: number, total: number): { label: string; text: string } {
  const pct = total > 0 ? correct / total : 0;
  if (pct >= 0.8) return { label: "Nivel firme", text: "Puedes pasar a la siguiente fase con tranquilidad." };
  if (pct >= 0.6) return { label: "Casi", text: "Repasa los temas marcados antes de seguir o hazlo mientras avanzas." };
  return { label: "A repasar", text: "Antes de seguir conviene repasar estos temas: la fase siguiente se apoya en ellos." };
}

export function PhaseTestScreen({ phase }: { phase: number }) {
  const { today, completeActivity } = useApp();
  const info = getPhase(phase);
  const phaseUnits = READY_UNITS.filter((u) => u.phase === phase);
  const [stage, setStage] = useState<"grammar" | "sound" | "result">("grammar");
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [summary, setSummary] = useState<TestSummary | null>(null);

  const topicLabel = (topic: string): { label: string; to: string } => {
    if (topic === SOUND_TOPIC) return { label: "Sonidos", to: `#/pronunciacion/${phaseUnits[0]?.id ?? "u01"}` };
    return { label: `Unidad ${unitNumber(topic)} · ${getLesson(topic)?.title ?? ""}`, to: `#/gramatica/${topic}` };
  };

  const [grammarItems] = useState<RunnerItem[]>(() => {
    const all = exercisesForUnits(phaseUnits.map((u) => u.id)).map(({ id, unit }) => ({ id, unit: unitNumber(unit) }));
    return pickGrammar(all, phaseUnits.map((u) => u.n), PER_UNIT, `${toISODate(today)}:test:${phase}`).flatMap((id) => {
      const found = findExercise(id);
      return found ? [{ id, exercise: found.exercise }] : [];
    });
  });
  const [trials] = useState(() => {
    const seen = new Set<string>();
    const pairs = phaseUnits.flatMap((u) => getPronUnit(u.id)?.pairs ?? []).filter((p) => !seen.has(p.join()) && seen.add(p.join()));
    return buildTrials(pairs, audioFiles, SOUND_TRIALS, `${toISODate(today)}:test-sound:${phase}`);
  });

  const finishAll = (final: Outcome[]) => {
    const s = summarize(final);
    addPhaseTest(phase, { date: toISODate(today), correct: s.correct, total: s.total, byTopic: s.byTopic });
    completeActivity("test", getUnit(`u${String(phase * 4).padStart(2, "0")}`)?.id);
    setSummary(s);
    setStage("result");
  };

  const onGrammarAnswer = (item: RunnerItem, grade: Grade) => {
    const unit = findExercise(item.id)?.unit ?? "";
    setOutcomes((o) => [...o, { topic: unit, correct: grade !== "wrong" }]);
    const next = recordResult(getReview(), item.id, grade === "correct", today);
    saveReview(next);
  };

  const afterGrammar = () => {
    if (trials.length > 0) setStage("sound");
    else finishAll(outcomes);
  };

  const previous = Object.entries(getPhaseTests())
    .filter(([p]) => Number(p) < phase)
    .map(([p, list]) => ({ phase: Number(p), last: list[list.length - 1] }))
    .filter((x) => x.last);

  const level = summary ? levelOf(summary.correct, summary.total) : null;

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">Checkpoint · {info.title}</div>
          <h1 className="title">Test de fase</h1>
        </div>
      </header>

      {stage === "grammar" && (
        <section className="card stack">
          <p className="sub">Gramática de las unidades de la fase, y después unos intentos de oído. Sin pistas: responde con lo que ya sabes.</p>
          <ExerciseRunner items={grammarItems} onAnswer={onGrammarAnswer} onFinish={afterGrammar} finishLabel="Seguir" />
        </section>
      )}

      {stage === "sound" && (
        <section className="card stack">
          <p className="sub">Parte de oído: elige la palabra que escuchas.</p>
          <SoundTrials
            trials={trials}
            doneLabel="Ver resultado"
            onDone={(results) => finishAll([...outcomes, ...results.map((correct) => ({ topic: SOUND_TOPIC, correct }))])}
          />
        </section>
      )}

      {stage === "result" && summary && level && (
        <>
          <section className="card stack">
            <div className="eyebrow">Resultado</div>
            <div className="score">{summary.correct} de {summary.total}</div>
            <span className="pill accent" style={{ alignSelf: "flex-start" }}>{level.label}</span>
            <p className="sub">{level.text}</p>
            {summary.weak.length > 0 && <p className="sub">Menos del 60 % de aciertos en:</p>}
            {summary.weak.map((t) => (
              <a key={t} className="chip primary" href={topicLabel(t).to} style={{ alignSelf: "flex-start" }}>
                {topicLabel(t).label} <Icon name="play" size={14} />
              </a>
            ))}
          </section>

          <section className="card stack">
            <div className="eyebrow">Por tema</div>
            {Object.entries(summary.byTopic).map(([topic, s]) => (
              <div key={topic} className="bar-block">
                <div className="bar-label"><span>{topicLabel(topic).label}</span><b>{s.correct} de {s.total}</b></div>
                <div className="bar"><i style={{ width: `${(s.correct / s.total) * 100}%` }} /></div>
              </div>
            ))}
          </section>

          {previous.length > 0 && (
            <p className="sub">
              {previous.map((x) => `Test de la fase ${x.phase}: ${x.last.correct} de ${x.last.total}`).join(" · ")}
            </p>
          )}
          <a className="btn primary block" href="#/" style={{ textAlign: "center", textDecoration: "none" }}>Volver a Hoy</a>
        </>
      )}
    </>
  );
}
