import { useEffect, useRef, useState } from "react";
import { useApp } from "../../app/state";
import { goBack, href } from "../../app/route";
import { loadPracticaB1 } from "../../content/lazy";
import type { B1Item, Escucha } from "../../content/practicaB1";
import type { Lectura } from "../../content/lectura";
import { appendLog } from "../../domain/activityLog";
import { toISODate } from "../../domain/dates";
import { B1_PASS, b1Key, loadB1, passedB1, recordB1, type B1Results } from "../../domain/practicaB1";
import { Icon } from "../../ui/Icon";
import { sayThrough, stopSpeech } from "../../ui/speech";
import { Questions, ReadText } from "../lectura/LecturaScreen";

type Mod = typeof import("../../content/practicaB1");

function useModule(): Mod | null {
  const [mod, setMod] = useState<Mod | null>(null);
  useEffect(() => {
    let off = false;
    void loadPracticaB1().then((m) => { if (!off) setMod(m); });
    return () => { off = true; };
  }, []);
  return mod;
}

function Header({ title, eyebrow }: { title: string; eyebrow: string }) {
  return (
    <header className="screen-head">
      <a className="back" href="#/practica-b1" onClick={(e) => { e.preventDefault(); stopSpeech(); goBack("/practica-b1"); }} aria-label="Volver">
        <Icon name="arrowLeft" size={20} />
      </a>
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="title">{title}</h1>
      </div>
    </header>
  );
}

const pct = (r: { correct: number; total: number }): number => Math.round((100 * r.correct) / r.total);

/** Menú del módulo opcional «Práctica B1»: textos y audios más largos que los del curso. */
export function PracticaB1Screen() {
  const mod = useModule();
  const results = loadB1(window.localStorage);
  const items: B1Item[] = mod ? mod.b1Items() : [];
  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">Opcional · después del puente</div>
          <h1 className="title">Práctica B1</h1>
        </div>
      </header>
      <section className="card stack">
        <p className="sub">
          Textos y audios más largos que los del curso, con el tamaño de las pruebas de lectura y de escucha de un B1 (el CILS B1 usa
          textos de unas 270 palabras para leer y de unas 200 para escuchar). Se dan por logrados con {Math.round(B1_PASS * 100)} % de aciertos;
          es un criterio del proyecto, no el de un examen. Los audios usan una sola voz.
        </p>
      </section>
      {!mod ? <p className="sub">Cargando…</p> : (
        <section className="card stack">
          {items.map((it) => {
            const r = results[b1Key(it.kind, it.id)];
            return (
              <a key={`${it.kind}:${it.id}`} className="unit-row" href={href(`/practica-b1/${it.kind}/${it.id}`)}>
                <span className="unit-num"><Icon name={it.kind === "lectura" ? "book" : "headphones"} size={18} /></span>
                <span className="unit-main">
                  <b>{it.titulo}</b>
                  <small>{it.kind === "lectura" ? "Lectura" : "Escucha"} · {it.tipo}{r ? ` · mejor: ${pct({ correct: r.best, total: r.total })} %` : ""}</small>
                </span>
                <span className={`status ${passedB1(r) ? "status-done" : ""}`}>{passedB1(r) ? "Lograda" : r ? "Otra vez" : "Nueva"}</span>
              </a>
            );
          })}
        </section>
      )}
    </>
  );
}

function ResultCard({ correct, total, onAgain, children }: { correct: number; total: number; onAgain: () => void; children?: React.ReactNode }) {
  const ok = correct / total >= B1_PASS;
  return (
    <section className="card stack">
      <div className="score">{correct} de {total}</div>
      <p className="sub">{ok ? "Lograda: llegaste al 75 % que se pide en este módulo." : "Todavía no llega al 75 %. Vuelve a intentarlo cuando quieras."}</p>
      {children}
      <button type="button" className="btn" onClick={onAgain}>Intentarlo otra vez</button>
      <a className="btn primary block" href={href("/practica-b1")} style={{ textAlign: "center", textDecoration: "none" }}>Volver a Práctica B1</a>
    </section>
  );
}

function useSave(key: string) {
  const { today } = useApp();
  return (correct: number, total: number, kind: "lectura" | "escucha"): B1Results => {
    appendLog(window.localStorage, { date: toISODate(today), unit: "u23", activity: `b1:${kind}`, minutes: 0, correct, total });
    return recordB1(window.localStorage, key, correct, total, toISODate(today));
  };
}

export function B1LecturaScreen({ id }: { id: string }) {
  const mod = useModule();
  const lectura: Lectura | undefined = mod?.B1_LECTURAS[id];
  const [stage, setStage] = useState<"texto" | "preguntas" | "fin">("texto");
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const save = useSave(b1Key("lectura", id));
  return (
    <>
      <Header eyebrow="Práctica B1 · Lectura" title={stage === "texto" ? "Lee con calma" : "¿Qué entendiste?"} />
      {!mod ? <p className="sub">Cargando…</p> : !lectura ? <p className="sub">No existe ese texto.</p> : stage === "texto" ? (
        <>
          <section className="card"><p className="sub">{lectura.palabras} palabras. Léelo sin traducción la primera vez; las palabras clave y la traducción están a un toque.</p></section>
          <ReadText lectura={lectura} onNext={() => setStage("preguntas")} nextLabel="Responder las preguntas" />
        </>
      ) : stage === "preguntas" ? (
        <>
          <details className="card">
            <summary>Ver el texto</summary>
            <div className="stack" style={{ marginTop: 8 }}>{lectura.it.map((p, i) => <p key={i} className="reading-p">{p}</p>)}</div>
          </details>
          <section className="card"><Questions key={round} lectura={lectura} onFinish={(c) => { save(c, lectura.preguntas.length, "lectura"); setScore(c); setStage("fin"); }} /></section>
        </>
      ) : (
        <ResultCard correct={score} total={lectura.preguntas.length} onAgain={() => { setRound((r) => r + 1); setStage("texto"); }} />
      )}
    </>
  );
}

export function B1EscuchaScreen({ id }: { id: string }) {
  const mod = useModule();
  const escucha: Escucha | undefined = mod?.B1_ESCUCHAS[id];
  const [stage, setStage] = useState<"escuchar" | "preguntas" | "fin">("escuchar");
  const [playing, setPlaying] = useState(false);
  const [plays, setPlays] = useState(0);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [shown, setShown] = useState<number[]>([]);
  const cancelled = useRef(false);
  const save = useSave(b1Key("escucha", id));

  useEffect(() => () => { cancelled.current = true; stopSpeech(); }, []);

  const play = async () => {
    if (!escucha) return;
    if (playing) { cancelled.current = true; stopSpeech(); setPlaying(false); return; }
    cancelled.current = false;
    setPlaying(true);
    setPlays((n) => n + 1);
    for (const line of escucha.lines) {
      if (cancelled.current) return;
      await sayThrough(line.it);
    }
    setPlaying(false);
  };

  const toQuestions = () => { cancelled.current = true; stopSpeech(); setPlaying(false); setStage("preguntas"); };
  const pseudo = escucha ? ({ preguntas: escucha.preguntas } as unknown as Lectura) : null;

  return (
    <>
      <Header eyebrow="Práctica B1 · Escucha" title={stage === "escuchar" ? "Escucha el audio" : stage === "preguntas" ? "¿Qué entendiste?" : "Resultado"} />
      {!mod ? <p className="sub">Cargando…</p> : !escucha || !pseudo ? <p className="sub">No existe ese audio.</p> : stage === "escuchar" ? (
        <section className="card stack">
          <div className="eyebrow">{escucha.tipo}</div>
          <h2 className="title" style={{ fontSize: 20 }}>{escucha.titulo}</h2>
          <p className="sub">
            Un diálogo de dos personas (una sola voz). En el examen el audio se oye dos veces; aquí puedes oírlo las que quieras, pero intenta con dos.
            El texto no se muestra hasta el final.
          </p>
          <button type="button" className="btn primary block" onClick={() => void play()}>
            <Icon name={playing ? "pause" : "play"} size={16} /> {playing ? "Detener" : plays === 0 ? "Escuchar" : "Escuchar otra vez"}
          </button>
          {plays > 0 && <p className="sub" role="status">Lo oíste {plays} {plays === 1 ? "vez" : "veces"}.</p>}
          <button type="button" className="btn block" disabled={plays === 0} onClick={toQuestions}>Responder las preguntas</button>
        </section>
      ) : stage === "preguntas" ? (
        <>
          <section className="card"><Questions key={round} lectura={pseudo} onFinish={(c) => { save(c, escucha.preguntas.length, "escucha"); setScore(c); setStage("fin"); }} /></section>
          <button type="button" className="btn block" onClick={() => void play()}><Icon name="sound" size={16} /> {playing ? "Detener" : "Oír el audio de nuevo"}</button>
        </>
      ) : (
        <>
          <ResultCard correct={score} total={escucha.preguntas.length} onAgain={() => { setRound((r) => r + 1); setPlays(0); setShown([]); setStage("escuchar"); }} />
          <section className="card stack">
            <div className="eyebrow">El texto del audio</div>
            {escucha.lines.map((l, i) => (
              <div key={i} className="stack">
                <p className="reading-p"><b>{l.who}:</b> {l.it}</p>
                <div className="row">
                  <button type="button" className="chip" onClick={() => void sayThrough(l.it)}>Escuchar <Icon name="sound" size={14} /></button>
                  <button type="button" className="chip" aria-expanded={shown.includes(i)} onClick={() => setShown((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]))}>
                    {shown.includes(i) ? "Ocultar traducción" : "Ver traducción"}
                  </button>
                </div>
                {shown.includes(i) && <p className="sub">{l.es}</p>}
              </div>
            ))}
          </section>
        </>
      )}
    </>
  );
}
