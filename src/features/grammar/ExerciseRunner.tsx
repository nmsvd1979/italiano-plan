import { useMemo, useState } from "react";
import type { Exercise } from "../../content/grammar/types";
import { Grade, gradeChoice, gradeFill } from "../../domain/grading";
import { optionOrder } from "../../domain/optionOrder";
import { Rich } from "../../ui/Rich";
import { AccentBar, Choice, ExerciseShell, Feedback } from "../../ui/exercise/ExerciseShell";

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
  // Las opciones se barajan en cada sesión: así la respuesta correcta no cae siempre en el mismo lugar.
  const [seed] = useState(() => String(Math.random()));
  const order = useMemo(() => (e.type === "choice" ? optionOrder(e.options.length, `${seed}:${item.id}`) : []), [e, item.id, seed]);
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
    <ExerciseShell
      index={index} total={items.length} done={!!grade} tone={grade ?? undefined}
      feedback={grade && (
        <Feedback tone={grade} head={grade === "correct" ? "¡Correcto!" : grade === "almost" ? "Casi: revisa la tilde" : "No era esa"}>
          {grade !== "correct" && <p>Respuesta: <strong className={e.type === "fill" ? "it" : undefined}>{correctText(e)}</strong></p>}
          <p><Rich text={e.why} /></p>
        </Feedback>
      )}
      action={grade ? (
        <button className="btn primary block" type="button" onClick={next}>{last ? finishLabel : "Siguiente"}</button>
      ) : (
        <button className="btn primary block" type="button" onClick={check} disabled={!canCheck}>Comprobar</button>
      )}
    >
      {e.type === "fill" ? (
        <p className="runner-prompt it-prompt">
          <Rich text={before} /><span className="blank">{grade ? correctText(e) : "     "}</span><Rich text={after} />
        </p>
      ) : (
        <p className="runner-prompt"><Rich text={e.prompt} /></p>
      )}

      {e.type === "choice" ? (
        <Choice
          selected={selected} disabled={!!grade} onSelect={setSelected}
          items={order.map((i) => ({ value: i, label: e.options[i], state: grade && i === e.answer ? "right" : grade && i === selected ? "wrong" : "" }))}
        />
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
          <AccentBar disabled={!!grade} onPick={(c) => setText((t) => t + c)} />
        </div>
      )}
    </ExerciseShell>
  );
}
