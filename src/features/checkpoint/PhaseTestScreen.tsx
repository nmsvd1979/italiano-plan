import { useState } from "react";
import { useApp } from "../../app/state";
import { goBack } from "../../app/route";
import { exercisesUpTo, findExercise, getLesson } from "../../content/grammar";
import { audioFiles, getPronWeek } from "../../content/pronunciation";
import { PHASES } from "../../content/plan";
import { toISODate } from "../../domain/dates";
import { Grade } from "../../domain/grading";
import { Outcome, SOUND_TOPIC, TestSummary, pickGrammar, summarize } from "../../domain/phaseTest";
import { buildTrials } from "../../domain/pronunciation";
import { getReview, getPhaseTests, saveReview, addPhaseTest } from "../../domain/storage";
import { recordResult } from "../../domain/review";
import { Icon } from "../../ui/Icon";
import { ExerciseRunner, RunnerItem } from "../grammar/ExerciseRunner";
import { SoundTrials } from "../pronunciation/SoundTrials";

const PER_WEEK = 3;
const SOUND_TRIALS = 6;

function topicLabel(topic: string): { label: string; to: string } {
  if (topic === SOUND_TOPIC) return { label: "Sonidos", to: "#/pronunciacion/1" };
  const week = Number(topic.slice(1));
  return { label: `Semana ${week} · ${getLesson(week)?.title ?? ""}`, to: `#/gramatica/${week}` };
}

export function PhaseTestScreen({ phase }: { phase: number }) {
  const { today, completeIfScheduled } = useApp();
  const info = PHASES.find((p) => p.id === phase);
  const [stage, setStage] = useState<"grammar" | "sound" | "result">("grammar");
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [summary, setSummary] = useState<TestSummary | null>(null);

  const [grammarItems] = useState<RunnerItem[]>(() => {
    if (!info) return [];
    const all = exercisesUpTo(12).map(({ id, week }) => ({ id, week }));
    return pickGrammar(all, info.weeks, PER_WEEK, `${toISODate(today)}:test:${phase}`).flatMap((id) => {
      const found = findExercise(id);
      return found ? [{ id, exercise: found.exercise }] : [];
    });
  });
  const [trials] = useState(() => {
    if (!info) return [];
    const seen = new Set<string>();
    const pairs = info.weeks.flatMap((w) => getPronWeek(w)?.pairs ?? []).filter((p) => !seen.has(p.join()) && seen.add(p.join()));
    return buildTrials(pairs, audioFiles, SOUND_TRIALS, `${toISODate(today)}:test-sound:${phase}`);
  });

  if (!info) return <p className="sub">No existe ese test.</p>;

  const finishAll = (final: Outcome[]) => {
    const s = summarize(final);
    addPhaseTest(phase, { date: toISODate(today), correct: s.correct, total: s.total, byTopic: s.byTopic });
    completeIfScheduled("phase_test");
    setSummary(s);
    setStage("result");
  };

  const onGrammarAnswer = (item: RunnerItem, grade: Grade) => {
    const week = findExercise(item.id)?.week ?? 0;
    setOutcomes((o) => [...o, { topic: `w${week}`, correct: grade !== "wrong" }]);
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
          <p className="sub">Gramática de las cuatro semanas de la fase, y después unos intentos de oído. Sin pistas: responde con lo que ya sabes.</p>
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

      {stage === "result" && summary && (
        <>
          <section className="card stack">
            <div className="eyebrow">Resultado</div>
            <div className="score">{summary.correct} de {summary.total}</div>
            <p className="sub">
              {summary.weak.length === 0
                ? "Sin temas flojos. Vas muy bien para pasar a la siguiente fase."
                : "Estos temas conviene repasar antes de seguir (menos del 60 % de aciertos):"}
            </p>
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
