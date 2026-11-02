import { useEffect, useMemo, useState } from "react";
import { AREA_NAME, pointsOf, type Area, type TestItem } from "../../domain/evaluation";
import { optionOrder } from "../../domain/optionOrder";
import { Icon } from "../../ui/Icon";
import { Rich } from "../../ui/Rich";
import { speak, useItalianVoice } from "../../ui/speech";

export interface TestResult { item: TestItem; points: number }

const ACCENTS = ["à", "è", "é", "ì", "ò", "ù"];
const SELF = [[1, "Todavía no"], [2, "Más o menos"], [3, "Sí"]] as const;

/** Un ítem a la vez, de cualquier área. Sin pistas; la explicación aparece al corregir. */
export function TestRunner({ items, onAnswer, onFinish }: { items: TestItem[]; onAnswer?: (r: TestResult) => void; onFinish: (results: TestResult[]) => void }) {
  const [index, setIndex] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [points, setPoints] = useState<number | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [seed] = useState(() => String(Math.random()));
  const voice = useItalianVoice();
  const item = items[index];
  const last = index === items.length - 1;
  const mc = item.area === "lectura" || item.area === "escucha" || item.area === "vocabulario" || (item.area === "gramatica" && item.exercise.type === "choice");
  const opts = item.area === "produccion" ? [] : item.area === "gramatica" ? (item.exercise.type === "choice" ? item.exercise.options : []) : item.options;
  const order = useMemo(() => optionOrder(opts.length, `${seed}:${item.id}`), [opts.length, seed, item.id]);

  useEffect(() => { if (item.area === "escucha" && voice !== "no") void speak(item.it); }, [item, voice]);

  const answer = (response: number | string) => {
    if (points !== null) return;
    const p = pointsOf(item, response);
    const r = { item, points: p };
    setPoints(p);
    setResults((x) => [...x, r]);
    onAnswer?.(r);
  };
  const next = () => {
    if (!last) { setIndex(index + 1); setSel(null); setText(""); setPoints(null); return; }
    onFinish(results);
  };
  const canCheck = mc ? sel !== null : text.trim() !== "";
  const why = item.area === "gramatica" ? item.exercise.why : item.area === "produccion" ? "" : item.why;
  const model = item.area === "gramatica" && item.exercise.type === "fill" ? item.exercise.answers[0] : mc && opts.length > 0 ? opts[(item as { answer?: number }).answer ?? (item.area === "gramatica" && item.exercise.type === "choice" ? item.exercise.answer : 0)] : "";

  return (
    <div className="runner">
      <div className="runner-progress" aria-label={`Ítem ${index + 1} de ${items.length}`}>
        <div className="bar"><i style={{ width: `${((index + (points !== null ? 1 : 0)) / items.length) * 100}%` }} /></div>
        <span>{index + 1} de {items.length}</span>
      </div>
      <div className="eyebrow">{AREA_NAME[item.area as Area]}</div>

      {item.area === "lectura" && <p className="reading-p">{item.text}</p>}
      {item.area === "escucha" && (
        <div className="hero-row">
          <p className="sub">Escucha y responde.</p>
          {voice !== "no" && <button type="button" className="audio-btn" style={{ width: 56, height: 56 }} onClick={() => void speak(item.it)} aria-label="Escuchar"><Icon name="sound" size={26} /></button>}
        </div>
      )}
      {item.area === "produccion" ? (
        <>
          <p className="runner-prompt">{item.statement}</p>
          <p className="sub">Piensa en una vez que lo hayas escrito o dicho de verdad. ¿Puedes hacerlo sin ayuda?</p>
          <div className="options">
            {SELF.map(([v, t]) => (
              <button key={v} type="button" className={`option ${sel === v ? "picked" : ""}`} disabled={points !== null} onClick={() => { setSel(v); answer(v); }}>{t}</button>
            ))}
          </div>
        </>
      ) : item.area === "gramatica" ? (
        <p className="runner-prompt"><Rich text={item.exercise.prompt.replace("___", "_____")} /></p>
      ) : (
        <p className="runner-prompt">{item.q}</p>
      )}

      {mc && opts.length > 0 && (
        <div className="options" role="radiogroup">
          {order.map((i) => {
            const right = item.area === "gramatica" ? (item.exercise.type === "choice" ? item.exercise.answer : -1) : (item as { answer: number }).answer;
            const state = points !== null && i === right ? "right" : points !== null && i === sel ? "wrong" : "";
            return <button key={opts[i]} type="button" role="radio" aria-checked={sel === i} className={`option ${sel === i ? "picked" : ""} ${state}`} disabled={points !== null} onClick={() => setSel(i)}>{opts[i]}</button>;
          })}
        </div>
      )}
      {!mc && item.area === "gramatica" && (
        <div className="stack">
          <input className="input" value={text} disabled={points !== null} autoCapitalize="off" autoCorrect="off" spellCheck={false} autoComplete="off" aria-label="Respuesta" placeholder="Escribe lo que falta" onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (points !== null ? next() : canCheck && answer(text))} />
          <div className="accents">{ACCENTS.map((c) => <button key={c} type="button" disabled={points !== null} onClick={() => setText((t) => t + c)}>{c}</button>)}</div>
        </div>
      )}

      {points !== null && item.area !== "produccion" && (
        <div className={`feedback ${points > 0 ? "correct" : "wrong"}`} role="status">
          <div className="feedback-head"><Icon name={points > 0 ? "check" : "x"} size={18} />{points > 0 ? "¡Correcto!" : "No era esa"}</div>
          {points === 0 && model && <p>Respuesta: <strong>{model}</strong></p>}
          {why && <p><Rich text={why} /></p>}
        </div>
      )}

      {points !== null ? (
        <button className="btn primary block" type="button" onClick={next}>{last ? "Ver resultado" : "Siguiente"}</button>
      ) : item.area === "produccion" ? null : (
        <button className="btn primary block" type="button" disabled={!canCheck} onClick={() => answer(mc ? (sel as number) : text)}>Comprobar</button>
      )}
    </div>
  );
}
