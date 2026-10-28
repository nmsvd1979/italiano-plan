import { useState } from "react";
import { useApp } from "../../app/state";
import { goBack } from "../../app/route";
import { getUnit } from "../../content/curriculum";
import { getVocab } from "../../content/vocab";
import type { CoursePart } from "../../content/course";
import { forPart } from "../../domain/parts";
import { toISODate } from "../../domain/dates";
import { buildVocabQuiz, toQuizletText } from "../../domain/vocabQuiz";
import { Icon } from "../../ui/Icon";
import { say } from "../../ui/speech";
import { ExerciseRunner, RunnerItem, Summary } from "../grammar/ExerciseRunner";

const QUIZ_SIZE = 10;

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

export function VocabScreen({ unit, part }: { unit: string; part?: CoursePart | null }) {
  const { today, completeActivity } = useApp();
  const all = getVocab(unit);
  const vocab = all && forPart(unit, part, "vocab", all).map(({ item }) => item);
  const meta = getUnit(unit);
  const [stage, setStage] = useState<"learn" | "quiz" | "done">("learn");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [copied, setCopied] = useState<"yes" | "no" | null>(null);
  const [items] = useState<RunnerItem[]>(() =>
    buildVocabQuiz(vocab ?? [], QUIZ_SIZE, `${toISODate(today)}:vocab:${unit}`).map((exercise, i) => ({ id: `vocab-${unit}-${i}`, exercise })),
  );

  if (!vocab) return <p className="sub">Esta unidad todavía no tiene palabras.</p>;

  const onFinish = (s: Summary) => {
    completeActivity("vocab", unit);
    setSummary(s);
    setStage("done");
  };

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">Unidad {meta?.n} · Palabras</div>
          <h1 className="title">{vocab.length} palabras para esta unidad</h1>
        </div>
      </header>

      {stage === "learn" && (
        <>
          <section className="card stack">
            <p className="sub">
              Escucha cada palabra y dila en voz alta antes de mirar el significado. Si no hay grabación nativa, suena la voz del sistema.
            </p>
            <div className="vocab-list">
              {vocab.map((v) => (
                <div key={v.it} className="vocab-row">
                  <button type="button" className="audio-btn" onClick={() => say(v.it)} aria-label={`Escuchar: ${v.it}`}>
                    <Icon name="sound" size={18} />
                  </button>
                  <span className="vocab-it">{v.it}</span>
                  <span className="vocab-es">{v.es}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card stack">
            <div className="eyebrow">Para tu Quizlet</div>
            <p className="sub">Copia la lista (término, tabulador, definición) y pégala en «Importar» de tu set para estudiarla con repetición espaciada.</p>
            <button type="button" className="btn" onClick={async () => setCopied((await copy(toQuizletText(vocab))) ? "yes" : "no")}>
              Copiar para Quizlet
            </button>
            {copied === "yes" && <p className="sub">Copiado. Ahora pégalo en Quizlet.</p>}
            {copied === "no" && <p className="sub">No se pudo copiar desde aquí. Mantén pulsada la lista para copiarla a mano.</p>}
          </section>

          <button type="button" className="btn primary block" onClick={() => setStage("quiz")}>Ponerme a prueba</button>
        </>
      )}

      {stage === "quiz" && (
        <section className="card stack">
          <p className="sub">Sin mirar la lista: elige el significado.</p>
          <ExerciseRunner items={items} onFinish={onFinish} finishLabel="Ver resultado" />
        </section>
      )}

      {stage === "done" && summary && (
        <section className="card stack">
          <div className="score">{summary.correct} de {summary.total}</div>
          <p className="sub">
            {summary.missed.length === 0
              ? "Todas bien. Estas palabras ya van a aparecer en las lecciones y los diálogos."
              : "Las que fallaste conviene repasarlas en Quizlet."}
          </p>
          {summary.missed.map(({ item }) => (
            <div key={item.id} className="missed">
              <div>{item.exercise.prompt.replace(/\*/g, "")}</div>
              <strong>{item.exercise.type === "choice" ? item.exercise.options[item.exercise.answer] : ""}</strong>
            </div>
          ))}
          <a className="btn primary block" href="#/" style={{ textAlign: "center", textDecoration: "none" }}>Volver a Hoy</a>
        </section>
      )}
    </>
  );
}
