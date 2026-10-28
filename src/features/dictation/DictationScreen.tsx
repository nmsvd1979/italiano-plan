import { useState } from "react";
import { useApp } from "../../app/state";
import { goBack } from "../../app/route";
import { getUnit } from "../../content/curriculum";
import { getDictation } from "../../content/dictation";
import type { CoursePart } from "../../content/course";
import { forPart } from "../../domain/parts";
import { recordFailure } from "../../domain/srs";
import { sentenceItemId } from "../../domain/srsDeck";
import { Grade, gradeDictation } from "../../domain/grading";
import { Icon } from "../../ui/Icon";
import { speak, useItalianVoice } from "../../ui/speech";

const ACCENTS = ["à", "è", "é", "ì", "ò", "ù"];

export function DictationScreen({ unit, part }: { unit: string; part?: CoursePart | null }) {
  const { completeActivity } = useApp();
  const all = getDictation(unit);
  const items = all && forPart(unit, part, "dictation", all).map(({ item }) => item);
  const meta = getUnit(unit);
  const voice = useItalianVoice();
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [grade, setGrade] = useState<Grade | null>(null);
  const [results, setResults] = useState<Grade[]>([]);
  const [finished, setFinished] = useState(false);

  if (!items) return <p className="sub">Esta unidad todavía no tiene dictado.</p>;

  const item = items[index];
  const last = index === items.length - 1;
  const correct = results.filter((g) => g !== "wrong").length;

  const check = () => {
    if (grade || !text.trim()) return;
    const g = gradeDictation(text, item.it);
    setGrade(g);
    if (g !== "correct") recordFailure(window.localStorage, { kind: "listen", itemId: sentenceItemId(unit, item.it), unit });
    setResults((r) => [...r, g]);
  };

  const next = () => {
    if (!last) {
      setIndex(index + 1);
      setText("");
      setGrade(null);
      return;
    }
    completeActivity("dictation", unit);
    setFinished(true);
  };

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">Unidad {meta?.n} · Dictado</div>
          <h1 className="title">Escribe lo que oyes</h1>
        </div>
      </header>

      {voice === "no" && (
        <p className="note">
          <Icon name="info" size={16} />
          <span>
            Este dispositivo no tiene una voz italiana. En iPhone: Ajustes → Accesibilidad → Contenido leído → Voces → Italiano.
            Sin voz italiana el dictado no sirve.
          </span>
        </p>
      )}

      <section className="card stack">
        {finished ? (
          <>
            <div className="score">{correct} de {items.length}</div>
            <p className="sub">Las frases que fallaste, léelas en voz alta una vez y vuelve a intentarlo otro día.</p>
            <a className="btn primary block" href="#/" style={{ textAlign: "center", textDecoration: "none" }}>Volver a Hoy</a>
          </>
        ) : (
          <div className="runner">
            <div className="runner-progress" aria-label={`Frase ${index + 1} de ${items.length}`}>
              <div className="bar"><i style={{ width: `${((index + (grade ? 1 : 0)) / items.length) * 100}%` }} /></div>
              <span>{index + 1} de {items.length}</span>
            </div>
            <p className="runner-prompt">Escucha y escribe la frase completa.</p>
            <div className="row">
              <button type="button" className="listen-btn" onClick={() => speak(item.it, 0.9)}>
                <Icon name="sound" size={26} /> Escuchar
              </button>
              <button type="button" className="chip" onClick={() => speak(item.it, 0.6)}>Más lento</button>
            </div>
            <div className="stack">
              <input
                className="input" value={text} disabled={!!grade}
                autoCapitalize="off" autoCorrect="off" spellCheck={false} autoComplete="off"
                placeholder="Escribe la frase"
                aria-label="Frase dictada"
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (grade ? next() : check())}
              />
              <div className="accents" aria-label="Letras con tilde">
                {ACCENTS.map((c) => (
                  <button key={c} type="button" disabled={!!grade} onClick={() => setText((t) => t + c)}>{c}</button>
                ))}
              </div>
            </div>

            {grade && (
              <div className={`feedback ${grade}`} role="status">
                <div className="feedback-head">
                  <Icon name={grade === "wrong" ? "x" : "check"} size={18} />
                  {grade === "correct" && "¡Correcto!"}
                  {grade === "almost" && "Casi: revisa la tilde"}
                  {grade === "wrong" && "No era esa"}
                </div>
                {grade !== "correct" && <p>Era: <strong>{item.it}</strong></p>}
                <p>{item.es}</p>
              </div>
            )}

            {grade ? (
              <button className="btn primary block" type="button" onClick={next}>{last ? "Terminar" : "Siguiente"}</button>
            ) : (
              <button className="btn primary block" type="button" onClick={check} disabled={!text.trim()}>Comprobar</button>
            )}
          </div>
        )}
      </section>
    </>
  );
}
