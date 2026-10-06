import { useState } from "react";
import { useApp } from "../../app/state";
import { goBack } from "../../app/route";
import { getUnit } from "../../content/curriculum";
import { getWriting } from "../../content/writing";
import { getWritingTexts, saveWritingText } from "../../domain/storage";
import { Icon } from "../../ui/Icon";
import { Rich } from "../../ui/Rich";
import { AudioButton } from "../../ui/AudioButton";

export function WritingScreen({ unit }: { unit: string }) {
  const { completeActivity } = useApp();
  const task = getWriting(unit);
  const meta = getUnit(unit);
  const [text, setText] = useState(() => getWritingTexts()[unit] ?? "");
  const [showModel, setShowModel] = useState(false);
  const [checked, setChecked] = useState<number[]>([]);

  if (!task) return <p className="sub">Esta unidad todavía no tiene escritura guiada.</p>;

  const enough = text.trim().length >= task.minChars;

  const change = (value: string) => {
    setText(value);
    saveWritingText(unit, value);
  };

  const finish = () => {
    completeActivity("writing", unit);
    window.location.hash = "#/";
  };

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">Unidad {meta?.n} · Escritura guiada</div>
          <h1 className="title">Escribe con lo que aprendiste</h1>
        </div>
      </header>

      <section className="card stack">
        <div className="eyebrow">La consigna</div>
        <p>{task.prompt}</p>
        <textarea
          className="input writing" rows={7} value={text}
          autoCapitalize="sentences" autoCorrect="off" spellCheck={false}
          placeholder="Escribe en italiano. Se guarda solo."
          aria-label="Tu texto"
          onChange={(e) => change(e.target.value)}
        />
        <p className="sub">{text.trim().length} de {task.minChars} caracteres como mínimo. Escribe con calma: busca en la lección lo que necesites.</p>
      </section>

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
        <div className="eyebrow">Un modelo</div>
        {showModel ? (
          <>
            <div className="example">
              <div className="example-it">{task.model}</div>
              <AudioButton text={task.model} />
            </div>
            <p className="sub">No es la única forma correcta. Compáralo con tu texto: ¿qué estructura usó que tú no?</p>
          </>
        ) : (
          <>
            <p className="sub">Míralo después de escribir tu versión: así aprendes más de la comparación.</p>
            <button type="button" className="btn" disabled={!enough} onClick={() => setShowModel(true)}>
              {enough ? "Ver el modelo" : "Escribe primero tu texto"}
            </button>
          </>
        )}
      </section>

      <button type="button" className="btn primary block" disabled={!enough} onClick={finish}>Terminé</button>
    </>
  );
}
