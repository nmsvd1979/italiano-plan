import { useMemo, useState } from "react";
import { useApp } from "../../app/state";
import { goBack } from "../../app/route";
import { getUnit } from "../../content/curriculum";
import { appLexicon } from "../../content/lexicon";
import { getWriting, writingKey, type WritingTask } from "../../content/writing";
import type { CoursePart } from "../../content/course";
import {
  LEVEL_NAME, checkWriting, claudeMessage, highlightForms, keywordsOf, targetForms, writingLevel,
} from "../../domain/writingCheck";
import { REWRITE_AFTER_DAYS, copyText, loadFixes, saveFix, saveRewrite } from "../../domain/writingFix";
import { getWritingTexts, saveWritingText } from "../../domain/storage";
import { Icon } from "../../ui/Icon";
import { Rich } from "../../ui/Rich";
import { AudioButton } from "../../ui/AudioButton";

const Marked = ({ text, forms }: { text: string; forms: string[] }) => (
  <>
    {highlightForms(text, forms).map((p, i) => (p.mark ? <mark key={i} className="target-form">{p.text}</mark> : <span key={i}>{p.text}</span>))}
  </>
);

export function WritingScreen({ unit, part = null, rewrite = false }: { unit: string; part?: CoursePart | null; rewrite?: boolean }) {
  const task = getWriting(unit, part);
  if (!task) return <p className="sub">Esta unidad todavía no tiene escritura guiada.</p>;
  // El texto, la corrección y la reescritura se guardan por semana: la B de una unidad partida no pisa a la A.
  const saveKey = writingKey(unit, part);
  return rewrite ? <Rewrite unit={unit} saveKey={saveKey} task={task} /> : <Write unit={unit} saveKey={saveKey} task={task} />;
}

function Header({ unit, title }: { unit: string; title: string }) {
  const meta = getUnit(unit);
  return (
    <header className="screen-head">
      <a className="back" href="#/" onClick={(e) => { e.preventDefault(); goBack(); }} aria-label="Volver">
        <Icon name="arrowLeft" size={20} />
      </a>
      <div>
        <div className="eyebrow">Unidad {meta?.n} · Escritura guiada</div>
        <h1 className="title">{title}</h1>
      </div>
    </header>
  );
}

function Write({ unit, saveKey, task }: { unit: string; saveKey: string; task: WritingTask }) {
  const { completeActivity, today } = useApp();
  const level = writingLevel(unit);
  const [text, setText] = useState(() => getWritingTexts()[saveKey] ?? "");
  // Reconstruir: se ve el modelo hasta dos veces y después se oculta.
  const [views, setViews] = useState(1);
  const [hidden, setHidden] = useState(() => level !== "reconstruir" || text.trim() !== "");
  const [compare, setCompare] = useState(false);
  const [checked, setChecked] = useState<number[]>([]);
  const [copied, setCopied] = useState<"yes" | "no" | null>(null);
  const [pasted, setPasted] = useState(() => loadFixes(window.localStorage)[saveKey]?.corrected ?? "");
  const [saved, setSaved] = useState(() => !!loadFixes(window.localStorage)[saveKey]);
  const [extending, setExtending] = useState(false);
  const [extModel, setExtModel] = useState(false);

  const check = useMemo(() => checkWriting(text, task, appLexicon()), [text, task]);
  const keywords = useMemo(() => keywordsOf(task), [task]);
  const forms = useMemo(() => targetForms(task), [task]);
  const ext = task.extend;
  const extCheck = useMemo(
    () => (ext ? checkWriting(text, { ...task, minWords: ext.minWords, mustInclude: ext.mustInclude }, appLexicon()) : null),
    [text, task, ext],
  );

  const change = (value: string) => {
    setText(value);
    saveWritingText(saveKey, value);
  };

  const finish = () => {
    completeActivity("writing", unit);
    window.location.hash = "#/";
  };

  const copy = async () => setCopied((await copyText(claudeMessage(unit, task, text))) ? "yes" : "no");

  const saveCorrected = () => {
    saveFix(saveKey, text, pasted, today, window.localStorage);
    setSaved(true);
  };

  const missingForms = check.missingForms.map((alts) => alts.join(" / "));

  return (
    <>
      <Header unit={unit} title="Escribe con lo que aprendiste" />

      <section className="card stack">
        <div className="eyebrow">{LEVEL_NAME[level]}</div>
        <p>{task.prompt}</p>

        {level === "reconstruir" && (
          <>
            {!hidden ? (
              <div className="stack">
                <div className="example">
                  <div className="example-it">{task.model}</div>
                  <AudioButton text={task.model} />
                </div>
                <p className="sub">Léelo y escúchalo con atención ({views} de 2). Después se oculta y lo escribes con tus palabras y las palabras clave.</p>
                <button type="button" className="btn primary" onClick={() => setHidden(true)}>Ocultar y escribir</button>
              </div>
            ) : (
              <div className="stack">
                <div className="row" style={{ flexWrap: "wrap" }} aria-label="Palabras clave">
                  {keywords.map((k) => <span key={k} className="chip">{k}</span>)}
                </div>
                {views < 2 && (
                  <button type="button" className="btn" onClick={() => { setViews(2); setHidden(false); }}>Verlo otra vez (1 vez más)</button>
                )}
              </div>
            )}
          </>
        )}

        {level === "marcos" && task.frames && task.frames.length > 0 && (
          <ul className="frames" aria-label="Marcos de frase">
            {task.frames.map((f) => <li key={f}>{f}</li>)}
          </ul>
        )}

        {level === "libre" && task.mustInclude && task.mustInclude.length > 0 && (
          <p className="sub">Incluye al menos 3 de estas formas: {task.mustInclude.map((alts) => alts[0]).join(", ")}.</p>
        )}

        {hidden && (
          <>
            <textarea
              className="input writing" rows={7} value={text}
              autoCapitalize="sentences" autoCorrect="off" spellCheck={false}
              placeholder="Escribe en italiano. Se guarda solo."
              aria-label="Tu texto"
              onChange={(e) => change(e.target.value)}
            />
            <p className="sub">
              {check.words} de {check.minWords} palabras como mínimo. Escribe con calma: busca en la lección lo que necesites.
            </p>
          </>
        )}
      </section>

      {hidden && text.trim() !== "" && (
        <section className="card stack" aria-label="Revisión automática">
          <div className="eyebrow">Revisión automática</div>
          {check.words > 0 && check.recognized < 0.5 && (
            <p className="note" role="status">
              <Icon name="info" size={16} />
              <span>Menos de la mitad de las palabras están en la app. Para dar el texto por hecho escríbelo con lo que has estudiado.</span>
            </p>
          )}
          {check.accent.length > 0 && (
            <p className="sub" role="status">
              Revisa las tildes: {check.accent.map((a) => `«${a.typed}» → «${a.suggestion}»`).join(", ")}.
            </p>
          )}
          {check.unknown.length > 0 && (
            <p className="sub" role="status">
              No la conozco, ¿está bien escrita? {check.unknown.map((w) => `«${w}»`).join(", ")}.
            </p>
          )}
          {check.totalForms > 0 && (
            <p className="sub" role="status">
              {missingForms.length === 0
                ? "Usaste todas las formas de la unidad."
                : `Te falta usar: ${missingForms.join("; ")}.`}
            </p>
          )}
          {check.unknown.length === 0 && check.accent.length === 0 && check.recognized >= 0.5 && check.words >= check.minWords && (
            <p className="sub">Sin avisos. Compáralo con el modelo.</p>
          )}
        </section>
      )}

      {ext && extCheck && check.complete && (
        <section className="card stack" aria-label="Ampliar el texto">
          <div className="eyebrow">Ampliar el texto (opcional)</div>
          {!extending ? (
            <>
              <p className="sub">Si quieres practicar más, puedes alargar este mismo texto. No hace falta para terminar.</p>
              <button type="button" className="btn" onClick={() => setExtending(true)}>Ampliar el texto</button>
            </>
          ) : (
            <>
              <p>{ext.prompt}</p>
              <p className="sub">Sigue en el mismo cuadro de arriba. {extCheck.words} de {ext.minWords} palabras en total.</p>
              {extCheck.totalForms > 0 && extCheck.missingForms.length > 0 && (
                <p className="sub" role="status">Te falta usar: {extCheck.missingForms.map((alts) => alts.join(" / ")).join("; ")}.</p>
              )}
              {extCheck.complete && !extModel && <button type="button" className="btn" onClick={() => setExtModel(true)}>Ver el modelo ampliado</button>}
              {extModel && (
                <div className="example">
                  <div className="example-it"><Marked text={ext.model} forms={forms} /></div>
                  <AudioButton text={ext.model} />
                </div>
              )}
            </>
          )}
        </section>
      )}

      <section className="card stack">
        <div className="eyebrow">Corrígete tú mismo</div>
        <p className="sub">Relee tu texto y marca cada punto cuando lo hayas revisado.</p>
        <ul className="cando-check">
          {task.checklist.map((c, i) => (
            <li key={c}>
              <label>
                <input
                  className="check small" type="checkbox" checked={checked.includes(i)}
                  onChange={() => setChecked((list) => (list.includes(i) ? list.filter((x) => x !== i) : [...list, i]))}
                />
                <span><Rich text={c} /></span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="card stack">
        <div className="eyebrow">Compara con el modelo</div>
        {compare ? (
          <>
            <div className="compare">
              <div>
                <b>Tu texto</b>
                <p className="compare-text"><Marked text={text} forms={forms} /></p>
              </div>
              <div>
                <b>Modelo</b>
                <p className="compare-text"><Marked text={task.model} forms={forms} /></p>
                <AudioButton text={task.model} />
              </div>
            </div>
            <p className="sub">Resaltadas están las estructuras de la unidad. No es la única forma correcta: ¿qué estructura usó el modelo que tú no?</p>
          </>
        ) : (
          <>
            <p className="sub">Míralo después de escribir tu versión: así aprendes más de la comparación.</p>
            <button type="button" className="btn" disabled={!check.complete} onClick={() => setCompare(true)}>
              {check.complete ? "Ver el modelo" : check.words >= check.minWords && check.totalForms > 0 && check.missingForms.length > 0 ? "Usa más estructuras de la unidad" : "Escribe primero tu texto"}
            </button>
          </>
        )}
      </section>

      <section className="card stack">
        <div className="eyebrow">Corrección con Claude (opcional)</div>
        <p className="sub">
          Copia el mensaje, pégalo en Claude y trae de vuelta la versión corregida. No hace falta para completar la actividad.
          A los {REWRITE_AFTER_DAYS} días te propongo escribirlo otra vez desde el español, sin mirar la corrección.
        </p>
        <button type="button" className="btn" disabled={!check.complete} onClick={() => void copy()}>Copiar para Claude</button>
        {copied === "yes" && <p className="sub" role="status">Copiado. Pégalo en Claude.</p>}
        {copied === "no" && <p className="sub" role="status">No pude copiarlo. Selecciona el texto de tu escritura y cópialo a mano.</p>}
        <textarea
          className="input writing" rows={4} value={pasted}
          autoCapitalize="off" autoCorrect="off" spellCheck={false}
          placeholder="Pega aquí la versión corregida"
          aria-label="Versión corregida"
          onChange={(e) => { setPasted(e.target.value); setSaved(false); }}
        />
        <button type="button" className="btn" disabled={pasted.trim() === "" || text.trim() === "" || saved} onClick={saveCorrected}>
          {saved ? "Guardada" : "Guardar versión corregida"}
        </button>
      </section>

      <button type="button" className="btn primary block" disabled={!check.complete} onClick={finish}>Terminé</button>
    </>
  );
}

/** Tarea de reescritura a los 3 días: desde la consigna en español, sin ver la versión corregida. */
function Rewrite({ unit, saveKey, task }: { unit: string; saveKey: string; task: WritingTask }) {
  const { today } = useApp();
  const fix = loadFixes(window.localStorage)[saveKey];
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);

  if (!fix) return <><Header unit={unit} title="Reescribe sin mirar" /><p className="sub">No hay nada que reescribir en esta unidad.</p></>;

  const compare = () => {
    saveRewrite(saveKey, text, today, window.localStorage);
    setDone(true);
  };

  return (
    <>
      <Header unit={unit} title="Reescribe sin mirar" />
      <section className="card stack">
        <div className="eyebrow">Desde la consigna</div>
        <p>{task.prompt}</p>
        <p className="sub">Escribe el texto otra vez, sin mirar la versión corregida. Después compáralas.</p>
        <textarea
          className="input writing" rows={7} value={text} disabled={done}
          autoCapitalize="sentences" autoCorrect="off" spellCheck={false}
          placeholder="Escribe en italiano"
          aria-label="Tu reescritura"
          onChange={(e) => setText(e.target.value)}
        />
        {!done && <button type="button" className="btn primary block" disabled={text.trim() === ""} onClick={compare}>Comparar con la versión corregida</button>}
      </section>
      {done && (
        <section className="card stack">
          <div className="compare">
            <div><b>Tu reescritura</b><p className="compare-text">{text}</p></div>
            <div><b>Versión corregida</b><p className="compare-text">{fix.corrected}</p></div>
          </div>
          <a className="btn primary block" href="#/" style={{ textAlign: "center", textDecoration: "none" }}>Volver a Hoy</a>
        </section>
      )}
    </>
  );
}
