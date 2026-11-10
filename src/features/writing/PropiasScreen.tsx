import { useMemo, useState } from "react";
import { EmptyState } from "../../ui/EmptyState";
import { useApp } from "../../app/state";
import { goBack, afterActivityHref } from "../../app/route";
import type { CoursePart } from "../../content/course";
import { getUnit } from "../../content/curriculum";
import { DEFAULT_MIN_WORDS, getPropias } from "../../content/propias";
import { writingKey } from "../../content/writing";
import { appendLog } from "../../domain/activityLog";
import { toISODate } from "../../domain/dates";
import { wordsOf } from "../../content/lexicon";
import { includesForm } from "../../domain/writingCheck";
import { AudioButton } from "../../ui/AudioButton";
import { Icon } from "../../ui/Icon";
import { Rich } from "../../ui/Rich";

/** «Dos frases propias» (docs/v2/plan-b1/06): dos frases con lo recién visto, comprobadas contra las formas de la semana. */
export function PropiasScreen({ unit, part = null }: { unit: string; part?: CoursePart | null }) {
  const { completeActivity, today } = useApp();
  const task = getPropias(writingKey(unit, part));
  const [text, setText] = useState("");
  const [model, setModel] = useState(false);
  const meta = getUnit(unit);
  const minWords = task?.minWords ?? DEFAULT_MIN_WORDS;
  const check = useMemo(() => {
    const words = wordsOf(text).filter((w) => !w.endsWith("'") || w.length > 2);
    return {
      words: words.length,
      missing: (task?.mustInclude ?? []).filter((alts) => !alts.some((f) => includesForm(wordsOf(text), f))),
    };
  }, [text, task]);

  if (!task) return <EmptyState message="Esta semana todavía no tiene «Dos frases propias»." />;
  // Las formas de la semana son una sugerencia, no un requisito: una frase correcta con otra forma no debe quedar bloqueada.
  const ok = check.words >= minWords;

  const finish = () => {
    appendLog(window.localStorage, { date: toISODate(today), unit, activity: "propias", minutes: 0 });
    completeActivity("own", unit);
    window.location.hash = afterActivityHref();
  };

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">Unidad {meta?.n} · Dos frases propias</div>
          <h1 className="title">Escribe con lo de esta semana</h1>
        </div>
      </header>
      <section className="card stack">
        <p><Rich text={task.prompt} /></p>
        <textarea
          className="input" rows={3} value={text} onChange={(e) => setText(e.target.value)}
          aria-label="Tus dos frases" placeholder="Escribe aquí tus dos frases"
          autoCapitalize="sentences" autoCorrect="off" spellCheck={false}
        />
        <p className="sub" role="status">
          {check.words} de {minWords} palabras.
          {check.missing.length > 0 && text.trim() !== "" && <> Esta semana trabaja: {check.missing.map((alts) => alts.slice(0, 3).join(" / ")).join("; ")}. Es una sugerencia: si usaste otra forma correcta, sigue.</>}
        </p>
        {!model ? (
          <button type="button" className="btn" onClick={() => setModel(true)}>Ver un modelo</button>
        ) : (
          <div className="example">
            <div className="example-it">{task.model.join(" ")}</div>
            <AudioButton text={task.model.join(" ")} />
          </div>
        )}
        <p className="note">
          Esto solo comprueba las formas de la semana, no que lo que escribiste sea correcto: compáralo con el modelo.
        </p>
        <button type="button" className="btn primary block" onClick={finish} disabled={!ok && !model}>
          Listo
        </button>
        {!ok && !model && <p className="sub">Puedes terminar cuando llegues al mínimo de palabras o después de ver el modelo.</p>}
      </section>
    </>
  );
}
