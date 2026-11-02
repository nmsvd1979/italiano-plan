import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../../app/state";
import { goBack } from "../../app/route";
import type { CoursePart } from "../../content/course";
import { getUnit } from "../../content/curriculum";
import { getDialogue } from "../../content/dialogues";
import { toISODate } from "../../domain/dates";
import { appendLog } from "../../domain/activityLog";
import { Icon } from "../../ui/Icon";
import { playModel, stopAudio } from "../../ui/modelAudio";
import { useItalianVoice } from "../../ui/speech";
import { CompareRow } from "../record/CompareRow";
import { RecordTake } from "../record/RecordTake";
import { SelfEval } from "../record/SelfEval";
import type { Take } from "../record/useRecorder";

// Diálogo con rol (docs/v2/05 E1): (1) oír, (2) tu papel con pistas en español, (3) decir cada línea, (4) grabar la escena
// completa, (5) comparar, (6) autoevaluar. El día 1 sigue usando DialogueScreen para leer y escuchar.
// Límite de contenido: E1 propone variar cada semana «un dato (precio, hora)»; no hay variantes escritas, así que solo
// varía el papel (la semana B hace el otro). Cuando existan, se agregan a dialogues.ts.

const STEPS = ["Escucha", "Tu papel", "Di tus líneas", "Graba la escena", "Compara", "Autoevalúa"] as const;

export function RolePlayScreen({ unit, part = null }: { unit: string; part?: CoursePart | null }) {
  const { completeActivity, today } = useApp();
  const dialogue = getDialogue(unit);
  const meta = getUnit(unit);
  const voice = useItalianVoice();
  // Variación semanal (E1): la semana B hace el otro papel.
  const [role, setRole] = useState<"A" | "B">(() => {
    const base = dialogue?.you ?? "B";
    return part === "B" ? (base === "A" ? "B" : "A") : base;
  });
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [lineTakes, setLineTakes] = useState<Record<number, Take>>({});
  const [scene, setScene] = useState<Take | null>(null);
  const [noMic, setNoMic] = useState(false);
  const [said, setSaid] = useState(false);
  const cancelled = useRef(false);

  useEffect(() => () => { cancelled.current = true; stopAudio(); }, []);

  const mine = useMemo(() => (dialogue ? dialogue.lines.map((l, i) => ({ l, i })).filter(({ l }) => l.who === role) : []), [dialogue, role]);

  if (!dialogue) return <p className="sub">Esta unidad todavía no tiene diálogo.</p>;

  const playAll = async () => {
    if (playing) { stopAudio(); setPlaying(false); return; }
    setPlaying(true);
    for (const line of dialogue.lines) {
      if (cancelled.current) return;
      await playModel(line.it);
    }
    setPlaying(false);
  };

  const finish = (rating: number) => {
    appendLog(window.localStorage, { date: toISODate(today), unit, activity: "rol", minutes: 0, selfRating: rating });
    stopAudio();
    completeActivity("dialogue", unit);
    window.location.hash = "#/";
  };

  const next = () => { stopAudio(); setPlaying(false); setStep((s) => Math.min(s + 1, STEPS.length - 1)); };
  const back = () => { stopAudio(); setPlaying(false); setStep((s) => Math.max(s - 1, 0)); };

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); stopAudio(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">Unidad {meta?.n}{part ? ` · semana ${part}` : ""} · Diálogo con rol</div>
          <h1 className="title">{STEPS[step]}</h1>
        </div>
      </header>

      <div className="runner-progress" aria-label={`Paso ${step + 1} de ${STEPS.length}`}>
        <div className="bar"><i style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
        <span>{step + 1} de {STEPS.length}</span>
      </div>

      {step === 0 && (
        <section className="card stack">
          <p>{dialogue.setting}</p>
          <p className="sub">Escucha la escena completa una o dos veces. Todavía no tienes que decir nada.</p>
          {voice !== "no" && (
            <button type="button" className="btn" onClick={() => void playAll()}>
              <Icon name={playing ? "pause" : "play"} size={16} /> {playing ? "Detener" : "Escuchar la escena"}
            </button>
          )}
          <div className="dialogue">
            {dialogue.lines.map((line, i) => (
              <div key={i} className={`dline ${line.who === role ? "mine" : "theirs"}`}>
                <div className="dwho">{dialogue.roles[line.who]}</div>
                <div className="dtext"><span>{line.it}</span></div>
                <div className="des">{line.es}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="card stack">
          <div className="field">
            <label>Tú haces de…</label>
            <div className="segmented" role="group" aria-label="Tu papel">
              {(["A", "B"] as const).map((r) => (
                <button key={r} type="button" aria-pressed={role === r} onClick={() => { setRole(r); setRevealed([]); setLineTakes({}); setScene(null); }}>
                  {dialogue.roles[r]}
                </button>
              ))}
            </div>
          </div>
          <p className="sub">Estas son tus líneas, con la pista en español. Lo del otro lo verás en italiano.</p>
          <div className="dialogue">
            {dialogue.lines.map((line, i) => (
              <div key={i} className={`dline ${line.who === role ? "mine" : "theirs"}`}>
                <div className="dwho">{dialogue.roles[line.who]}</div>
                {line.who === role ? <div className="des">{line.es}</div> : <div className="dtext"><span>{line.it}</span></div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="stack">
          {noMic && (
            <p className="note" role="status">
              <Icon name="info" size={16} />
              <span>No se pudo usar el micrófono (sin permiso o sin soporte). Sigue sin grabar: di cada línea en voz alta y compárala de oído con el modelo.</span>
            </p>
          )}
          {mine.map(({ l, i }) => (
            <div key={i} className="card stack">
              <div className="eyebrow">Tu línea {mine.findIndex((m) => m.i === i) + 1} de {mine.length}</div>
              <p className="runner-prompt">{l.es}</p>
              {revealed.includes(i) ? (
                <div className="dtext"><span>{l.it}</span></div>
              ) : (
                <button type="button" className="btn" onClick={() => { setRevealed((r) => [...r, i]); void playModel(l.it); }}>
                  Dila en voz alta y toca para ver el modelo
                </button>
              )}
              {revealed.includes(i) && (
                <>
                  <p className="sub">Dila otra vez, en voz alta.</p>
                  {!noMic && (
                    <RecordTake
                      activity={`${unit}:rol:l${i}`}
                      label="Grabar esta línea"
                      onTake={(t) => t && setLineTakes((x) => ({ ...x, [i]: t }))}
                      onUnusable={() => setNoMic(true)}
                    />
                  )}
                </>
              )}
            </div>
          ))}
        </section>
      )}

      {step === 3 && (
        <section className="card stack">
          <p>Ahora toda la escena, de principio a fin. Tus líneas con la pista en español; las del otro, en italiano.</p>
          <div className="dialogue">
            {dialogue.lines.map((line, i) => (
              <div key={i} className={`dline ${line.who === role ? "mine" : "theirs"}`}>
                <div className="dwho">{dialogue.roles[line.who]}</div>
                {line.who === role ? <div className="des">{line.es}</div> : <div className="dtext"><span>{line.it}</span></div>}
              </div>
            ))}
          </div>
          {noMic ? (
            <>
              <p className="note"><Icon name="info" size={16} /><span>Sin micrófono: di la escena completa en voz alta. Después la compararás de oído con el modelo.</span></p>
              <button type="button" className="btn" disabled={said} onClick={() => setSaid(true)}>{said ? "Hecho" : "Ya la dije en voz alta"}</button>
            </>
          ) : (
            <RecordTake activity={`${unit}:rol`} label="Grabar la escena" onTake={(t) => t && setScene(t)} onUnusable={() => setNoMic(true)} />
          )}
        </section>
      )}

      {step === 4 && (
        <section className="stack">
          {noMic && (
            <p className="note"><Icon name="info" size={16} /><span>Sin grabaciones: escucha el modelo línea por línea y compáralo con cómo lo dijiste.</span></p>
          )}
          {mine.map(({ l, i }) => (
            <div key={i} className="card stack">
              <p><strong>{l.it}</strong></p>
              <p className="sub">{l.es}</p>
              <CompareRow text={l.it} url={lineTakes[i]?.url} />
              {!noMic && !lineTakes[i] && <p className="sub">No grabaste esta línea.</p>}
            </div>
          ))}
          {scene && (
            <div className="card stack">
              <div className="eyebrow">Tu escena completa</div>
              <audio controls src={scene.url} aria-label="Tu escena" />
            </div>
          )}
        </section>
      )}

      {step === 5 && (
        <section className="card stack">
          <p className="sub">Sé honesto contigo: sirve para ver cómo avanzas, no para sacar nota.</p>
          <SelfEval onDone={finish} />
        </section>
      )}

      {step < STEPS.length - 1 && (
        <div className="row">
          {step > 0 && <button type="button" className="btn" onClick={back}>Atrás</button>}
          <button type="button" className="btn primary" style={{ flex: 1 }} onClick={next} disabled={step === 3 && (noMic ? !said : !scene)}>
            {step === 3 ? "Comparar" : "Seguir"}
          </button>
        </div>
      )}
    </>
  );
}
