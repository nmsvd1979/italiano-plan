import { Fragment, useEffect, useMemo, useState } from "react";
import { Score } from "../../ui/Score";
import { useApp } from "../../app/state";
import { goBack, href, routeQuery, afterActivityHref, afterActivityLabel } from "../../app/route";
import type { CoursePart } from "../../content/course";
import { getUnit } from "../../content/curriculum";
import { loadLectura } from "../../content/lazy";
import type { Lectura, LecturaQuestion } from "../../content/lectura";
import { blockKey } from "../../domain/cycle";
import { optionOrder } from "../../domain/optionOrder";
import { Icon } from "../../ui/Icon";
import { Rich } from "../../ui/Rich";
import { say, useItalianVoice } from "../../ui/speech";
import { AccentBar, Choice, ExerciseShell, Feedback } from "../../ui/exercise/ExerciseShell";

interface Props {
  unit: string;
  part: CoursePart | null;
  /** texto: leer con traducción y palabras clave · preguntas: las 4 preguntas del texto. */
  mode: "texto" | "preguntas";
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Parte un párrafo en trozos de texto y palabras clave (las más largas primero), sin distinguir mayúsculas. */
export function segments(text: string, claves: Lectura["claves"]): { text: string; clave?: Lectura["claves"][number] }[] {
  if (claves.length === 0) return [{ text }];
  const sorted = [...claves].sort((a, b) => b.it.length - a.it.length);
  const re = new RegExp(`(${sorted.map((c) => escapeRe(c.it)).join("|")})`, "gi");
  return text.split(re).filter(Boolean).map((t) => ({ text: t, clave: sorted.find((c) => c.it.toLowerCase() === t.toLowerCase()) }));
}

export function ReadText({ lectura, onNext, nextLabel = "Ir a las preguntas" }: { lectura: Lectura; onNext: () => void; nextLabel?: string }) {
  const [shown, setShown] = useState<number[]>([]);
  const [gloss, setGloss] = useState<Lectura["claves"][number] | null>(null);
  const voice = useItalianVoice();
  const toggle = (i: number) => setShown((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));
  return (
    <>
      <section className="card stack">
        <div className="eyebrow">{lectura.tipo}</div>
        <h2 className="title sm">{lectura.titulo}</h2>
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
                <button type="button" className="chip" onClick={() => say(p.replace(/\n/g, " "))}>
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
        <div className="row">
          {lectura.claves.map((c) => (
            <button key={c.it} type="button" className="chip" onClick={() => setGloss(c)}>{c.it}</button>
          ))}
        </div>
        <p className="sub">Toca una palabra para ver qué significa.</p>
      </section>

      <button className="btn primary block" type="button" onClick={onNext}>{nextLabel}</button>
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
    <ExerciseShell
      index={index} total={lectura.preguntas.length} done={done} tone={done ? (result ? "correct" : "wrong") : undefined}
      feedback={done && (
        <Feedback tone={result ? "correct" : "wrong"} head={result ? "¡Correcto!" : "No era esa"}>
          {!result && q.kind === "short" && <p>Respuesta modelo: <strong className="it">{q.accepted[0]}</strong></p>}
          <p><Rich text={q.why} /></p>
        </Feedback>
      )}
      action={done ? (
        <button className="btn primary block" type="button" onClick={next}>{last ? "Ver resultado" : "Siguiente"}</button>
      ) : (
        <button className="btn primary block" type="button" onClick={check} disabled={!canCheck}>Comprobar</button>
      )}
    >
      <p className="runner-prompt">{q.q}</p>

      {q.kind === "mc" ? (
        <Choice
          selected={selected} disabled={done} onSelect={setSelected}
          items={order.map((i) => ({ value: i, label: q.options[i], state: done && i === q.answer ? "right" : done && i === selected ? "wrong" : "" }))}
        />
      ) : (
        <div className="stack">
          <input
            className="input" value={text} disabled={done}
            autoCapitalize="off" autoCorrect="off" spellCheck={false} autoComplete="off"
            placeholder="Respuesta breve, en italiano" aria-label="Respuesta"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (done ? next() : check())}
          />
          <AccentBar disabled={done} onPick={(c) => setText((t) => t + c)} />
        </div>
      )}
    </ExerciseShell>
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
          <Score correct={score} total={lectura.preguntas.length} />
          <p className="sub">{score === lectura.preguntas.length ? "Entendiste todo el texto." : "Puedes volver al texto cuando quieras para releerlo."}</p>
          <a className="btn primary block" href={afterActivityHref()}>{afterActivityLabel()}</a>
        </section>
      ) : (
        <>
          <details className="card">
            <summary>Ver el texto</summary>
            <div className="stack mt">
              {lectura.it.map((p, i) => <p key={i} className="reading-p">{p}</p>)}
            </div>
          </details>
          <section className="card"><Questions lectura={lectura} onFinish={finish} /></section>
        </>
      )}
    </>
  );
}
