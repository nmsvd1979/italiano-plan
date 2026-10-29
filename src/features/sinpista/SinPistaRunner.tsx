import { useEffect, useMemo, useState } from "react";
import type { SinPista } from "../../content/sinpista";
import { checkText, orderBank } from "../../content/sinpistaCheck";
import { optionOrder } from "../../domain/optionOrder";
import { Icon } from "../../ui/Icon";
import { Rich } from "../../ui/Rich";
import { speak, useItalianVoice } from "../../ui/speech";

export interface SinPistaSummary {
  total: number;
  correct: number;
  missed: SinPista[];
}

interface Props {
  items: SinPista[];
  onAnswer: (ex: SinPista, correct: boolean) => void;
  onFinish: (summary: SinPistaSummary) => void;
  finishLabel: string;
}

const ACCENTS = ["à", "è", "é", "ì", "ò", "ù"];

const INSTRUCTION: Record<SinPista["type"], string> = {
  order: "Toca las palabras para armar la frase en italiano.",
  translate: "Escríbelo en italiano.",
  fix: "Corrige la frase.",
  transform: "Escribe la frase transformada.",
  dialog: "Elige lo que falta en el diálogo.",
  listen: "Lee la frase y elige qué significa.",
};

/** Lo que se muestra como respuesta correcta al fallar. */
function modelAnswer(ex: SinPista): string {
  if (ex.type === "dialog" || ex.type === "listen") return ex.options[ex.answer];
  return ex.answers[0];
}

/**
 * Práctica sin pista: ninguna ayuda en pantalla antes de responder. Ordenar = tocar palabras; traducir, corregir y
 * transformar = campo de texto; diálogo y oído = 3 opciones. La explicación (`why`) aparece solo al corregir.
 */
export function SinPistaRunner({ items, onAnswer, onFinish, finishLabel }: Props) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number[]>([]); // ordenar: posiciones del banco, en el orden tocado
  const [selected, setSelected] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [seed] = useState(() => String(Math.random()));
  const voice = useItalianVoice();

  const ex = items[index];
  const last = index === items.length - 1;
  const bank = useMemo(() => (ex.type === "order" ? orderBank(ex) : []), [ex]);
  const order = useMemo(
    () => (ex.type === "dialog" || ex.type === "listen" ? optionOrder(ex.options.length, `${seed}:${ex.id}`) : []),
    [ex, seed],
  );

  useEffect(() => {
    if (ex.type === "listen" && voice !== "no") void speak(ex.prompt);
  }, [ex, voice]);

  const chosen = picked.map((i) => bank[i]);
  const canCheck =
    ex.type === "order" ? picked.length > 0
      : ex.type === "dialog" || ex.type === "listen" ? selected !== null
        : text.trim().length > 0;

  const check = () => {
    if (result !== null || !canCheck) return;
    const ok =
      ex.type === "order" ? checkText(ex, chosen.join(" "))
        : ex.type === "dialog" || ex.type === "listen" ? selected === ex.answer
          : checkText(ex, text);
    setResult(ok);
    setResults((r) => [...r, ok]);
    onAnswer(ex, ok);
  };

  const next = () => {
    if (!last) {
      setIndex(index + 1);
      setPicked([]);
      setSelected(null);
      setText("");
      setResult(null);
      return;
    }
    onFinish({
      total: items.length,
      correct: results.filter(Boolean).length,
      missed: items.filter((_, i) => !results[i]),
    });
  };

  const done = result !== null;

  return (
    <div className="runner">
      <div className="runner-progress" aria-label={`Ejercicio ${index + 1} de ${items.length}`}>
        <div className="bar"><i style={{ width: `${((index + (done ? 1 : 0)) / items.length) * 100}%` }} /></div>
        <span>{index + 1} de {items.length}</span>
      </div>

      <p className="sub">{INSTRUCTION[ex.type]}</p>

      {ex.type === "dialog" ? (
        <div className="stack">
          {ex.lines.map((line, i) => (
            <p key={i} className="runner-prompt">
              {line.split("___").map((part, j, all) => (
                <span key={j}>
                  <Rich text={part} />
                  {j < all.length - 1 && <span className="blank">{done ? ex.options[ex.answer] : "     "}</span>}
                </span>
              ))}
            </p>
          ))}
        </div>
      ) : ex.type === "listen" ? (
        <div className="hero-row">
          <p className="runner-prompt">{ex.prompt}</p>
          {voice !== "no" && (
            <button type="button" className="audio-btn" style={{ width: 56, height: 56 }} onClick={() => void speak(ex.prompt)} aria-label="Escuchar">
              <Icon name="sound" size={26} />
            </button>
          )}
        </div>
      ) : (
        <p className="runner-prompt"><Rich text={ex.prompt} /></p>
      )}

      {ex.type === "order" && (
        <div className="stack">
          <div className="order-line" aria-label="Tu frase" aria-live="polite">
            {chosen.length === 0 ? <span className="sub">Toca las palabras en orden</span> : chosen.join(" ")}
          </div>
          <div className="order-bank">
            {bank.map((w, i) => (
              <button
                key={i} type="button" className="chip"
                disabled={done || picked.includes(i)}
                onClick={() => setPicked((p) => [...p, i])}
              >
                {w}
              </button>
            ))}
          </div>
          <button type="button" className="btn" disabled={done || picked.length === 0} onClick={() => setPicked((p) => p.slice(0, -1))}>
            Borrar
          </button>
        </div>
      )}

      {(ex.type === "translate" || ex.type === "fix" || ex.type === "transform") && (
        <div className="stack">
          <input
            className="input" value={text} disabled={done}
            autoCapitalize="off" autoCorrect="off" spellCheck={false} autoComplete="off"
            placeholder="Escribe tu respuesta" aria-label="Respuesta"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (done ? next() : check())}
          />
          <div className="accents" aria-label="Letras con tilde">
            {ACCENTS.map((c) => (
              <button key={c} type="button" disabled={done} onClick={() => setText((t) => t + c)}>{c}</button>
            ))}
          </div>
        </div>
      )}

      {(ex.type === "dialog" || ex.type === "listen") && (
        <div className="options" role="radiogroup">
          {order.map((i) => {
            const state = done && i === ex.answer ? "right" : done && i === selected ? "wrong" : "";
            return (
              <button
                key={ex.options[i]} type="button" role="radio" aria-checked={selected === i}
                className={`option ${selected === i ? "picked" : ""} ${state}`}
                disabled={done} onClick={() => setSelected(i)}
              >
                {ex.options[i]}
              </button>
            );
          })}
        </div>
      )}

      {done && (
        <div className={`feedback ${result ? "correct" : "wrong"}`} role="status">
          <div className="feedback-head">
            <Icon name={result ? "check" : "x"} size={18} />
            {result ? "¡Correcto!" : "No era esa"}
          </div>
          {!result && <p>Respuesta: <strong>{modelAnswer(ex)}</strong></p>}
          <p><Rich text={ex.why} /></p>
        </div>
      )}

      {done ? (
        <button className="btn primary block" type="button" onClick={next}>{last ? finishLabel : "Siguiente"}</button>
      ) : (
        <button className="btn primary block" type="button" onClick={check} disabled={!canCheck}>Comprobar</button>
      )}
    </div>
  );
}
