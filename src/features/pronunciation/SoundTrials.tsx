import { useState } from "react";
import { GLOSS } from "../../content/pronunciation";
import type { Trial } from "../../domain/pronunciation";
import { Icon } from "../../ui/Icon";
import { playFile } from "../../ui/audio";
import { WordButton } from "./WordButton";

interface Props {
  trials: Trial[];
  /** Se llama al terminar, con un acierto/error por intento. */
  onDone: (results: boolean[]) => void;
  doneLabel: string;
}

/** "¿Qué palabra escuchaste?": suena una palabra de un par mínimo y eliges cuál era. */
export function SoundTrials({ trials, onDone, doneLabel }: Props) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [results, setResults] = useState<boolean[]>([]);

  const trial = trials[index];
  const answered = picked !== null;
  const last = index === trials.length - 1;

  const choose = (word: string) => {
    if (answered) return;
    setPicked(word);
    setResults((r) => [...r, word === trial.target]);
  };
  const next = () => {
    if (last) {
      onDone(results);
      return;
    }
    setIndex(index + 1);
    setPicked(null);
  };

  return (
    <div className="runner">
      <div className="runner-progress">
        <div className="bar"><i style={{ width: `${((index + (answered ? 1 : 0)) / trials.length) * 100}%` }} /></div>
        <span>{index + 1} de {trials.length}</span>
      </div>
      <p className="runner-prompt">¿Qué palabra escuchaste?</p>
      <button type="button" className="listen-btn" onClick={() => playFile(trial.file)}>
        <Icon name="sound" size={26} /> Escuchar
      </button>
      <div className="options">
        {trial.options.map((o) => {
          const state = answered && o === trial.target ? "right" : answered && o === picked ? "wrong" : "";
          return (
            <button key={o} type="button" className={`option ${state}`} disabled={answered} onClick={() => choose(o)}>
              {o}{answered && GLOSS[o] ? <span className="word-gloss"> · {GLOSS[o]}</span> : null}
            </button>
          );
        })}
      </div>
      {answered && (
        <>
          <div className={`feedback ${picked === trial.target ? "correct" : "wrong"}`} role="status">
            <div className="feedback-head">
              <Icon name={picked === trial.target ? "check" : "x"} size={18} />
              {picked === trial.target ? "¡Correcto!" : `Sonaba «${trial.target}»`}
            </div>
            <p>Escúchalas otra vez, una después de la otra:</p>
            <div className="row">{trial.options.map((o) => <WordButton key={o} word={o} />)}</div>
          </div>
          <button className="btn primary block" type="button" onClick={next}>{last ? doneLabel : "Siguiente"}</button>
        </>
      )}
    </div>
  );
}
