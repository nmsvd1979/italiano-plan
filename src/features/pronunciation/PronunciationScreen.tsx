import { useState } from "react";
import { useApp } from "../../app/state";
import { goBack } from "../../app/route";
import { audioFiles, getPronWeek } from "../../content/pronunciation";
import { toISODate } from "../../domain/dates";
import { buildTrials } from "../../domain/pronunciation";
import { Icon } from "../../ui/Icon";
import { Rich } from "../../ui/Rich";
import { SoundTrials } from "./SoundTrials";
import { WordButton } from "./WordButton";

const TRIALS = 8;

export function PronunciationScreen({ week }: { week: number }) {
  const { today, completeIfScheduled } = useApp();
  const data = getPronWeek(week);
  const [trials] = useState(() => (data ? buildTrials(data.pairs, audioFiles, TRIALS, `${toISODate(today)}:pron:${week}`) : []));
  const [score, setScore] = useState(0);
  const [stage, setStage] = useState<"listen" | "repeat">(trials.length === 0 ? "repeat" : "listen");

  if (!data) return <p className="sub">No existe la práctica de la semana {week}.</p>;

  const finish = () => {
    completeIfScheduled("pronunciation");
    window.location.hash = "#/";
  };

  const repeatWords = [...new Set([...data.words, ...data.pairs.flat()])];

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">Semana {week} · Pronunciación</div>
          <h1 className="title">{data.title}</h1>
        </div>
      </header>

      <section className="callout">
        <div className="callout-title"><Icon name="ear" size={18} /> El sonido de hoy</div>
        <p><Rich text={data.tip} /></p>
      </section>

      {stage === "listen" ? (
        <section className="card">
          <SoundTrials
            trials={trials}
            doneLabel="Seguir"
            onDone={(results) => {
              setScore(results.filter(Boolean).length);
              setStage("repeat");
            }}
          />
        </section>
      ) : (
        <>
          {trials.length > 0 && <p className="score-line">Acertaste {score} de {trials.length}</p>}
          <section className="card stack">
            <div className="eyebrow">Repite en voz alta</div>
            <p className="sub">Toca cada palabra, escúchala y dila en voz alta justo después. Imita la duración de las consonantes.</p>
            <div className="word-grid">{repeatWords.map((w) => <WordButton key={w} word={w} />)}</div>
          </section>
          <button className="btn primary block" type="button" onClick={finish}>Terminé</button>
        </>
      )}
    </>
  );
}
