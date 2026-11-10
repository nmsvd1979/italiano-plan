import { useMemo, useState } from "react";
import { Score } from "../../ui/Score";
import { EmptyState } from "../../ui/EmptyState";
import { useApp } from "../../app/state";
import { goBack, afterActivityHref } from "../../app/route";
import { getUnit } from "../../content/curriculum";
import { getDialogue } from "../../content/dialogues";
import { appendLog } from "../../domain/activityLog";
import { toISODate } from "../../domain/dates";
import { diffDictation, holeIndexes, tokenize } from "../../domain/dictationDiff";
import { Icon } from "../../ui/Icon";
import { say } from "../../ui/speech";

/**
 * «Oír el diálogo y completar» (docs/v2/plan-b1/11, E5): se oye cada línea y se escribe una palabra clave antes de ver el texto
 * (recuperar en vez de releer). La palabra es la más larga de la línea; una tilde o un apóstrofo mal puestos cuentan como «casi».
 */
export function GapDialogueScreen({ unit }: { unit: string }) {
  const { completeActivity, today } = useApp();
  const dialogue = getDialogue(unit);
  const meta = getUnit(unit);
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<"correct" | "almost" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const lines = useMemo(() => (dialogue?.lines ?? []).filter((l) => tokenize(l.it).length >= 2), [dialogue]);
  if (!dialogue || lines.length === 0) return <EmptyState message="Esta unidad todavía no tiene diálogo." />;

  const line = lines[index];
  const tokens = tokenize(line.it);
  const hole = holeIndexes(line.it)[0];
  const answer = tokens[hole].text.replace(/[.,;:!?¡¿"«»…]/g, "");

  const check = () => {
    if (result || typed.trim() === "") return;
    const g = diffDictation(typed, answer).grade;
    setResult(g);
    if (g !== "wrong") setScore((s) => s + 1);
  };

  const next = () => {
    if (index < lines.length - 1) {
      setIndex(index + 1);
      setTyped("");
      setResult(null);
    } else setDone(true);
  };

  const finish = () => {
    appendLog(window.localStorage, { date: toISODate(today), unit, activity: "dialogo-huecos", minutes: 0, correct: score, total: lines.length });
    completeActivity("dialogue", unit);
    window.location.hash = afterActivityHref();
  };

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">Unidad {meta?.n} · {done ? "Resultado" : `Línea ${index + 1} de ${lines.length}`}</div>
          <h1 className="title">Oír y completar</h1>
        </div>
      </header>
      <section className="card stack">
        {done ? (
          <>
            <Score correct={score} total={lines.length} />
            <p className="sub">Recuperar la palabra antes de verla fija más que releer el diálogo. Si fallaste muchas, vuelve a oírlo entero en «Diálogo de entrada».</p>
            <button type="button" className="btn primary block" onClick={finish}>Terminé</button>
          </>
        ) : (
          <>
            <p className="sub">{dialogue.roles[line.who]} dice (en español: {line.es}). Escucha y completa la palabra que falta.</p>
            <button type="button" className="btn primary block" onClick={() => say(line.it)}>
              <Icon name="sound" size={18} /> Escuchar
            </button>
            <p className="example-it" lang="it">
              {tokens.map((t, i) => (i === hole && !result ? <span key={i} className="blank">&nbsp;</span> : <span key={i}>{t.text} </span>))}
            </p>
            {!result ? (
              <>
                <input
                  className="input" value={typed} onChange={(e) => setTyped(e.target.value)} aria-label="La palabra que falta"
                  placeholder="La palabra que falta" autoCapitalize="none" autoCorrect="off" spellCheck={false}
                  onKeyDown={(e) => { if (e.key === "Enter") check(); }}
                />
                <button type="button" className="btn block" onClick={check} disabled={typed.trim() === ""}>Comprobar</button>
              </>
            ) : (
              <>
                <div role="status" className={`feedback ${result}`}>
                  <div className="feedback-head"><Icon name={result === "wrong" ? "x" : "check"} size={18} /> {result === "correct" ? "¡Correcto!" : result === "almost" ? "Casi: revisa la tilde" : "No era esa"}</div>
                  <p>Palabra: <b>{answer}</b></p>
                </div>
                <button type="button" className="btn primary block" onClick={next}>{index < lines.length - 1 ? "Siguiente" : "Ver resultado"}</button>
              </>
            )}
          </>
        )}
      </section>
    </>
  );
}
