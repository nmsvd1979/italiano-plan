import { useState } from "react";
import { Score } from "../../ui/Score";
import { EmptyState } from "../../ui/EmptyState";
import { useApp } from "../../app/state";
import { goBack, afterActivityHref } from "../../app/route";
import type { CoursePart } from "../../content/course";
import { getUnit } from "../../content/curriculum";
import { getVelocidad } from "../../content/velocidad";
import { writingKey } from "../../content/writing";
import { appendLog } from "../../domain/activityLog";
import { toISODate } from "../../domain/dates";
import { NORMAL_RATE } from "../../domain/dictationDiff";
import { Icon } from "../../ui/Icon";
import { say } from "../../ui/speech";
import { VoiceNotice } from "../../ui/VoiceNotice";

/** Velocidad de cada ítem: de la normal a un 15 % más rápida (un clip se reproduce a rate / NORMAL_RATE). */
const rateOf = (i: number, n: number): number => NORMAL_RATE * (1 + (0.15 * i) / Math.max(1, n - 1));

const digits = (s: string): string => s.replace(/\D/g, "");

/** «Números a velocidad» (docs/v2/plan-b1/06): oyes un número, cada vez un poco más rápido, y lo escribes en cifras. */
export function SpeedScreen({ unit, part = null }: { unit: string; part?: CoursePart | null }) {
  const { completeActivity, today } = useApp();
  const items = getVelocidad(writingKey(unit, part));
  const meta = getUnit(unit);
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [plays, setPlays] = useState(0);
  const [shown, setShown] = useState<"ok" | "no" | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (!items) return <EmptyState message="Esta semana todavía no tiene «Números a velocidad»." />;
  const item = items[index];
  const rate = rateOf(index, items.length);

  const play = () => {
    setPlays((p) => p + 1);
    say(item.it, rate);
  };

  const check = () => {
    if (shown || digits(text) === "") return;
    const ok = digits(text) === String(item.n);
    setShown(ok ? "ok" : "no");
    if (ok) setScore((s) => s + 1);
  };

  const next = () => {
    if (index < items.length - 1) {
      setIndex(index + 1);
      setText("");
      setPlays(0);
      setShown(null);
    } else {
      setDone(true);
    }
  };

  const finish = () => {
    appendLog(window.localStorage, { date: toISODate(today), unit, activity: "velocidad", minutes: 0, correct: score, total: items.length });
    completeActivity("speed", unit);
    window.location.hash = afterActivityHref();
  };

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">Unidad {meta?.n}{part ? ` · semana ${part}` : ""} · {done ? "Resultado" : `Número ${index + 1} de ${items.length}`}</div>
          <h1 className="title">Números a velocidad</h1>
        </div>
      </header>
      <section className="card stack">
        {done ? (
          <>
            <Score correct={score} total={items.length} />
            <p className="sub">Los números fueron sonando un poco más rápido cada vez. Si te cuesta, repite: es una destreza que mejora con la práctica.</p>
            <button type="button" className="btn primary block" onClick={finish}>Terminé</button>
          </>
        ) : (
          <>
            <VoiceNotice />
            <p className="sub">Escucha y escribe el número en cifras. Velocidad: {Math.round((rate / NORMAL_RATE) * 100)} %.</p>
            <button type="button" className="btn primary block" onClick={play}>
              <Icon name="sound" size={18} /> Escuchar{plays > 0 ? ` otra vez (${plays})` : ""}
            </button>
            <input
              className="input" inputMode="numeric" value={text} onChange={(e) => setText(e.target.value)} aria-label="El número que oíste"
              placeholder="Escribe el número" onKeyDown={(e) => { if (e.key === "Enter") check(); }}
            />
            {shown === null ? (
              <button type="button" className="btn block" onClick={check} disabled={digits(text) === ""}>Comprobar</button>
            ) : (
              <>
                <div role="status" className={`feedback ${shown === "ok" ? "correct" : "wrong"}`}>
                  <div className="feedback-head"><Icon name={shown === "ok" ? "check" : "x"} size={18} /> {shown === "ok" ? "¡Correcto!" : "No era ese"}</div>
                  <p><b>{item.n}</b> · <i>{item.it}</i></p>
                </div>
                <button type="button" className="btn primary block" onClick={next}>{index < items.length - 1 ? "Siguiente" : "Ver resultado"}</button>
              </>
            )}
          </>
        )}
      </section>
    </>
  );
}
