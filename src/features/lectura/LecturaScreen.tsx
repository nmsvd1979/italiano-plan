import { Fragment, useEffect, useMemo, useState } from "react";
import { useApp } from "../../app/state";
import { goBack, href, routeQuery } from "../../app/route";
import type { CoursePart } from "../../content/course";
import { getUnit } from "../../content/curriculum";
import { loadLectura } from "../../content/lazy";
import type { Lectura, LecturaQuestion } from "../../content/lectura";
import { blockKey } from "../../domain/cycle";
import { optionOrder } from "../../domain/optionOrder";
import { Icon } from "../../ui/Icon";
import { Rich } from "../../ui/Rich";
import { speak, useItalianVoice } from "../../ui/speech";

interface Props {
  unit: string;
  part: CoursePart | null;
  /** texto: leer con traducción y palabras clave · preguntas: las 4 preguntas del texto. */
  mode: "texto" | "preguntas";
}

const ACCENTS = ["à", "è", "é", "ì", "ò", "ù"];
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Parte un párrafo en trozos de texto y palabras clave (las más largas primero), sin distinguir mayúsculas. */
export function segments(text: string, claves: Lectura["claves"]): { text: string; clave?: Lectura["claves"][number] }[] {
  if (claves.length === 0) return [{ text }];
  const sorted = [...claves].sort((a, b) => b.it.length - a.it.length);
  const re = new RegExp(`(${sorted.map((c) => escapeRe(c.it)).join("|")})`, "gi");
  return text.split(re).filter(Boolean).map((t) => ({ text: t, clave: sorted.find((c) => c.it.toLowerCase() === t.toLowerCase()) }));
}

export function ReadText({ lectura, onNext }: { lectura: Lectura; onNext: () => void }) {
  const [shown, setShown] = useState<number[]>([]);
  const [gloss, setGloss] = useState<Lectura["claves"][number] | null>(null);
  const voice = useItalianVoice();
  const toggle = (i: number) => setShown((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));
  return (
    <>
      <section className="card stack">
        <div className="eyebrow">{lectura.tipo}</div>
        <h2 className="title" style={{ fontSize: 20 }}>{lectura.titulo}</h2>
        {lectura.it.map((p, i) => (
          <div key={i} className="stack">
            <p className="reading-p">
              {p.split("\n").map((line, l) => (
                <Fragment key={l}>
                  {l > 0 && <br />}
                  {segments(line, lectura.claves).map((seg, s) =>
                    seg.clave ? (
                      <button key={s} type="button" className="key-word" onClick={() => setGloss(seg.clave!)}>{seg.text}</button>
                    ) : (
                      <span key={s}>{seg.text}</span>
                    ),
                  )}
                </Fragment>
              ))}
            </p>
            <div className="row">
              <button type="button" className="chip" aria-expanded={shown.includes(i)} onClick={() => toggle(i)}>
                {shown.includes(i) ? "Ocultar traducción" : "Ver traducción"}
              </button>
              {voice !== "no" && (
                <button type="button" className="chip" onClick={() => void speak(p.replace(/\n/g, " "))}>
                  Escuchar <Icon name="sound" size={14} />
                </button>
              )}
            </div>
            {shown.includes(i) && <p className="sub">{lectura.es[i]}</p>}
          </div>
        ))}
        {gloss && (
          <p className="note" role="status">
            <Icon name="info" size={16} />
            <span><strong>{gloss.it}</strong> = {gloss.es}</span>
          </p>
        )}
      </section>

      <section className="card stack">
        <div className="eyebrow">Palabras clave</div>
        <div className="row" style={{ flexWrap: "wrap" }}>
          {lectura.claves.map((c) => (
            <button key={c.it} type="button" className="chip" onClick={() => setGloss(c)}>{c.it}</button>
          ))}
        </div>
        <p className="sub">Toca una palabra para ver qué significa.</p>
      </section>

      <button className="btn primary block" type="button" onClick={onNext}>Ir a las preguntas</button>
    </>
  );
}

export function Questions({ lectura, onFinish }: { lectura: Lectura; onFinish: (correct: number) => void }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [seed] = useState(() => String(Math.random()));
  const [checkShort, setCheckShort] = useState<null | ((q: Extract<LecturaQuestion, { kind: "short" }>, t: string) => boolean)>(null);

  useEffect(() => {
    let cancelled = false;
    void loadLectura().then((m) => { if (!cancelled) setCheckShort(() => m.checkShortAnswer); });
    return () => { cancelled = true; };
  }, []);

  const q = lectura.preguntas[index];
  const last = index === lectura.preguntas.length - 1;
  const order = useMemo(() => (q.kind === "mc" ? optionOrder(q.options.length, `${seed}:${index}`) : []), [q, index, seed]);
  const canCheck = q.kind === "mc" ? selected !== null : text.trim().length > 0 && !!checkShort;

  const check = () => {
    if (result !== null || !canCheck) return;
    const ok = q.kind === "mc" ? selected === q.answer : checkShort!(q, text);
    setResult(ok);
    if (ok) setScore((s) => s + 1);
  };
  const next = () => {
    if (last) return onFinish(score);
    setIndex(index + 1);
    setSelected(null);
    setText("");
    setResult(null);
  };
  const done = result !== null;

  return (
    <div className="runner">
      <div className="runner-progress" aria-label={`Pregunta ${index + 1} de ${lectura.preguntas.length}`}>
        <div className="bar"><i style={{ width: `${((index + (done ? 1 : 0)) / lectura.preguntas.length) * 100}%` }} /></div>
        <span>{index + 1} de {lectura.preguntas.length}</span>
      </div>
      <p className="runner-prompt">{q.q}</p>

      {q.kind === "mc" ? (
        <div className="options" role="radiogroup">
          {order.map((i) => {
            const state = done && i === q.answer ? "right" : done && i === selected ? "wrong" : "";
            return (
              <button
                key={q.options[i]} type="button" role="radio" aria-checked={selected === i}
                className={`option ${selected === i ? "picked" : ""} ${state}`}
                disabled={done} onClick={() => setSelected(i)}
              >
                {q.options[i]}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="stack">
          <input
            className="input" value={text} disabled={done}
            autoCapitalize="off" autoCorrect="off" spellCheck={false} autoComplete="off"
            placeholder="Respuesta breve, en italiano" aria-label="Respuesta"
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

      {done && (
        <div className={`feedback ${result ? "correct" : "wrong"}`} role="status">
          <div className="feedback-head">
            <Icon name={result ? "check" : "x"} size={18} />
            {result ? "¡Correcto!" : "No era esa"}
          </div>
          {!result && q.kind === "short" && <p>Respuesta modelo: <strong>{q.accepted[0]}</strong></p>}
          <p><Rich text={q.why} /></p>
        </div>
      )}

      {done ? (
        <button className="btn primary block" type="button" onClick={next}>{last ? "Ver resultado" : "Siguiente"}</button>
      ) : (
        <button className="btn primary block" type="button" onClick={check} disabled={!canCheck}>Comprobar</button>
      )}
    </div>
  );
}

export function LecturaScreen({ unit, part, mode }: Props) {
  const { completeActivity } = useApp();
  const meta = getUnit(unit);
  const stepId = part ? `${unit}#${part}` : unit;
  const [lectura, setLectura] = useState<Lectura | null | undefined>(undefined);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadLectura().then((m) => { if (!cancelled) setLectura(m.getLectura(stepId) ?? null); });
    return () => { cancelled = true; };
  }, [stepId]);

  const toQuestions = () => {
    completeActivity("reading", unit);
    const q = new URLSearchParams();
    if (part) q.set("part", part);
    q.set("mode", "preguntas");
    // En la puesta al día (`?c=u04.text`) la marca va al bloque de preguntas de esa misma puesta al día.
    if (routeQuery().get("c")) q.set("c", `${unit}.questions`);
    else q.set("k", blockKey(stepId, 5, "questions"));
    window.location.hash = href(`/lectura/${unit}?${q.toString()}`);
  };

  const finish = (correct: number) => {
    completeActivity("readq", unit);
    setScore(correct);
  };

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">Unidad {meta?.n}{part ? ` · semana ${part}` : ""} · {mode === "texto" ? "Texto graduado" : "Preguntas del texto"}</div>
          <h1 className="title">{mode === "texto" ? "Lee con calma" : "¿Qué entendiste?"}</h1>
        </div>
      </header>

      {lectura === undefined ? (
        <p className="sub">Cargando…</p>
      ) : lectura === null ? (
        <p className="sub">Esta semana todavía no tiene texto.</p>
      ) : mode === "texto" ? (
        <ReadText lectura={lectura} onNext={toQuestions} />
      ) : score !== null ? (
        <section className="card stack">
          <div className="score">{score} de {lectura.preguntas.length}</div>
          <p className="sub">{score === lectura.preguntas.length ? "Entendiste todo el texto." : "Puedes volver al texto cuando quieras para releerlo."}</p>
          <a className="btn primary block" href="#/" style={{ textAlign: "center", textDecoration: "none" }}>Volver a Hoy</a>
        </section>
      ) : (
        <>
          <details className="card">
            <summary>Ver el texto</summary>
            <div className="stack" style={{ marginTop: 8 }}>
              {lectura.it.map((p, i) => <p key={i} className="reading-p">{p}</p>)}
            </div>
          </details>
          <section className="card"><Questions lectura={lectura} onFinish={finish} /></section>
        </>
      )}
    </>
  );
}
