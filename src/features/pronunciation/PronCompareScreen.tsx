import { useMemo, useState } from "react";
import { useApp } from "../../app/state";
import { goBack } from "../../app/route";
import { GLOSS, audioFiles, getPronUnit } from "../../content/pronunciation";
import { getUnit } from "../../content/curriculum";
import { toISODate } from "../../domain/dates";
import { appendLog } from "../../domain/activityLog";
import { Icon } from "../../ui/Icon";
import { Rich } from "../../ui/Rich";
import { stopAudio } from "../../ui/modelAudio";
import { CompareRow } from "../record/CompareRow";
import { RecordTake } from "../record/RecordTake";
import { SelfEval } from "../record/SelfEval";
import type { Take } from "../record/useRecorder";

/** Cuántas palabras se graban en la sesión del día 4. */
export const COMPARE_WORDS = 5;

/** Repetir y comparar la pronunciación (docs/v2/05 E1/E2, día 4): oír el modelo nativo, grabarte, comparar y autoevaluarte. */
export function PronCompareScreen({ unit }: { unit: string }) {
  const { completeActivity, today } = useApp();
  const data = getPronUnit(unit);
  const meta = getUnit(unit);
  const [takes, setTakes] = useState<Record<string, Take>>({});
  const [noMic, setNoMic] = useState(false);
  const [stage, setStage] = useState<"record" | "eval">("record");

  // Primero las palabras con audio nativo del modelo: sirven para comparar de oído.
  const words = useMemo(() => {
    if (!data) return [];
    const all = [...new Set([...data.pairs.flat(), ...data.words])];
    return [...all.filter((w) => audioFiles(w).length > 0), ...all.filter((w) => audioFiles(w).length === 0)].slice(0, COMPARE_WORDS);
  }, [data]);

  if (!data) return <p className="sub">No existe la práctica de esa unidad.</p>;

  const finish = (rating: number) => {
    appendLog(window.localStorage, { date: toISODate(today), unit, activity: "pron-comparar", minutes: 0, selfRating: rating });
    stopAudio();
    completeActivity("pron", unit);
    window.location.hash = "#/";
  };

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); stopAudio(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">Unidad {meta?.n} · Repetir y comparar</div>
          <h1 className="title">{data.title}</h1>
        </div>
      </header>

      <section className="callout">
        <div className="callout-title"><Icon name="ear" size={18} /> El sonido de hoy</div>
        <p><Rich text={data.tip} /></p>
      </section>

      {stage === "record" ? (
        <>
          <p className="sub">Para cada palabra: escucha el modelo, grábate y compara.</p>
          {noMic && (
            <p className="note" role="status">
              <Icon name="info" size={16} />
              <span>No se pudo usar el micrófono (sin permiso o sin soporte). Sigue sin grabar: dila en voz alta y compárala de oído con el modelo.</span>
            </p>
          )}
          {words.map((w) => {
            const file = audioFiles(w)[0];
            return (
              <section key={w} className="card stack">
                <div className="hero-row">
                  <p className="runner-prompt">{w}{GLOSS[w] && <span className="word-gloss"> · {GLOSS[w]}</span>}</p>
                </div>
                {!noMic && (
                  <RecordTake
                    activity={`${unit}:pron:${w}`}
                    label="Grabar"
                    onTake={(t) => t && setTakes((x) => ({ ...x, [w]: t }))}
                    onUnusable={() => setNoMic(true)}
                  />
                )}
                <CompareRow text={w} file={file} url={takes[w]?.url} rate={0.8} />
                {!file && <p className="sub">Esta palabra todavía no tiene grabación nativa: el modelo es la voz del sistema.</p>}
              </section>
            );
          })}
          <button type="button" className="btn primary block" onClick={() => setStage("eval")} disabled={!noMic && Object.keys(takes).length === 0}>
            Autoevaluarme
          </button>
        </>
      ) : (
        <section className="card stack">
          <p className="sub">Sé honesto contigo: sirve para ver cómo avanzas, no para sacar nota.</p>
          <SelfEval onDone={finish} />
        </section>
      )}
    </>
  );
}
