import { useState } from "react";
import type { Exercise } from "../../content/grammar/types";
import { Grade, gradeChoice, gradeFill } from "../../domain/grading";
import { Icon } from "../../ui/Icon";
import { Rich } from "../../ui/Rich";

export interface RunnerItem {
  id: string;
  exercise: Exercise;
}

export interface Summary {
  total: number;
  /** Aciertos, incluidos los "casi" (solo faltaba una tilde). */
  correct: number;
  missed: { item: RunnerItem; grade: Grade }[];
}

interface Props {
  items: RunnerItem[];
  /** Se llama en cada respuesta. "almost" cuenta como acierto para el puntaje, pero conviene repasarlo. */
  onAnswer?: (item: RunnerItem, grade: Grade) => void;
  onFinish: (summary: Summary) => void;
  finishLabel: string;
}

const ACCENTS = ["à", "è", "é", "ì", "ò", "ù"];

function correctText(e: Exercise): string {
  return e.type === "choice" ? e.options[e.answer] : e.answers[0];
}

export function ExerciseRunner({ items, onAnswer, onFinish, finishLabel }: Props) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [grade, setGrade] = useState<Grade | null>(null);
  const [results, setResults] = useState<Grade[]>([]);

  const item = items[index];
  const e = item.exercise;
  const last = index === items.length - 1;
  const canCheck = e.type === "choice" ? selected !== null : text.trim().length > 0;

  const check = () => {
    if (grade || !canCheck) return;
    const g = e.type === "choice" ? gradeChoice(selected as number, e.answer) : gradeFill(text, e.answers);
    setGrade(g);
    setResults((r) => [...r, g]);
    onAnswer?.(item, g);
  };

  const next = () => {
    if (!last) {
      setIndex(index + 1);
      setSelected(null);
      setText("");
      setGrade(null);
      return;
    }
    const missed = items
      .map((it, i) => ({ item: it, grade: results[i] }))
      .filter((r) => r.grade === "wrong");
    onFinish({ total: items.length, correct: results.filter((g) => g !== "wrong").length, missed });
  };

  const [before, after] = e.type === "fill" ? e.prompt.split("___") : ["", ""];

  return (
    <div className="runner">
      <div className="runner-progress" aria-label={`Ejercicio ${index + 1} de ${items.length}`}>
        <div className="bar"><i style={{ width: `${((index + (grade ? 1 : 0)) / items.length) * 100}%` }} /></div>
        <span>{index + 1} de {items.length}</span>
      </div>

      {e.type === "fill" ? (
        <p className="runner-prompt">
          <Rich text={before} /><span className="blank">{grade ? correctText(e) : "     "}</span><Rich text={after} />
        </p>
      ) : (
        <p className="runner-prompt"><Rich text={e.prompt} /></p>
      )}

      {e.type === "choice" ? (
        <div className="options" role="radiogroup">
          {e.options.map((o, i) => {
            const state = grade && i === e.answer ? "right" : grade && i === selected ? "wrong" : "";
            return (
              <button
                key={o} type="button" role="radio" aria-checked={selected === i}
                className={`option ${selected === i ? "picked" : ""} ${state}`}
                disabled={!!grade}
                onClick={() => setSelected(i)}
              >
                {o}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="stack">
          <input
            className="input" value={text} disabled={!!grade}
            autoCapitalize="off" autoCorrect="off" spellCheck={false} autoComplete="off"
            placeholder="Escribe lo que falta"
            aria-label="Respuesta"
            onChange={(ev) => setText(ev.target.value)}
            onKeyDown={(ev) => ev.key === "Enter" && (grade ? next() : check())}
          />
          <div className="accents" aria-label="Letras con tilde">
            {ACCENTS.map((c) => (
              <button key={c} type="button" disabled={!!grade} onClick={() => setText((t) => t + c)}>{c}</button>
            ))}
          </div>
        </div>
      )}

      {grade && (
        <div className={`feedback ${grade}`} role="status">
          <div className="feedback-head">
            <Icon name={grade === "wrong" ? "x" : "check"} size={18} />
            {grade === "correct" && "¡Correcto!"}
            {grade === "almost" && "Casi: revisa la tilde"}
            {grade === "wrong" && "No era esa"}
          </div>
          {grade !== "correct" && <p>Respuesta: <strong>{correctText(e)}</strong></p>}
          <p><Rich text={e.why} /></p>
        </div>
      )}

      {grade ? (
        <button className="btn primary block" type="button" onClick={next}>{last ? finishLabel : "Siguiente"}</button>
      ) : (
        <button className="btn primary block" type="button" onClick={check} disabled={!canCheck}>Comprobar</button>
      )}
    </div>
  );
}
