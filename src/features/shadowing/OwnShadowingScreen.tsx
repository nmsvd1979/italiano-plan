import { useEffect, useMemo, useState } from "react";
import { useApp } from "../../app/state";
import { goBack } from "../../app/route";
import type { CoursePart } from "../../content/course";
import { getUnit } from "../../content/curriculum";
import { getDialogue } from "../../content/dialogues";
import { loadLectura } from "../../content/lazy";
import { toISODate } from "../../domain/dates";
import { SHADOW_LINES, STAGES, pickLines, sentencesOf } from "../../domain/shadowOwn";
import { NORMAL_RATE, SLOW_RATE } from "../../domain/speechRate";
import { Icon } from "../../ui/Icon";
import { playModel, stopAudio } from "../../ui/modelAudio";
import { VoiceNotice } from "../../ui/VoiceNotice";

/**
 * Shadowing propio, sin conexión (docs/v2/05 E5), con los diálogos y el texto graduado de la semana:
 * oír la línea → leerla mientras suena → repetirla a 0,75 → repetirla a velocidad normal.
 * El shadowing con videos de YouTube es un extra del día 7 (`ShadowingScreen`).
 */
export function OwnShadowingScreen({ unit, part = null }: { unit: string; part?: CoursePart | null }) {
  const { today, completeActivity } = useApp();
  const meta = getUnit(unit);
  const stepId = part ? `${unit}#${part}` : unit;
  const [text, setText] = useState<string[] | null>(null);
  const [lines, setLines] = useState<string[] | null>(null);
  const [line, setLine] = useState(0);
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [heard, setHeard] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadLectura().then((m) => { if (!cancelled) setText(sentencesOf(m.getLectura(stepId)?.it ?? [])); });
    return () => { cancelled = true; stopAudio(); };
  }, [stepId]);

  const dialogue = useMemo(() => getDialogue(unit)?.lines.map((l) => l.it) ?? [], [unit]);
  useEffect(() => {
    if (text && !lines) setLines(pickLines(dialogue, text, SHADOW_LINES, `${toISODate(today)}:shadow:${stepId}`));
  }, [text, lines, dialogue, today, stepId]);

  if (!lines) return <p className="sub">Cargando…</p>;

  const header = (
    <header className="screen-head">
      <a className="back" href="#/" onClick={(e) => { e.preventDefault(); stopAudio(); goBack(); }} aria-label="Volver">
        <Icon name="arrowLeft" size={20} />
      </a>
      <div>
        <div className="eyebrow">Unidad {meta?.n}{part ? ` · semana ${part}` : ""} · Shadowing</div>
        <h1 className="title">Repite como la voz</h1>
      </div>
    </header>
  );

  if (lines.length === 0) {
    return <>{header}<p className="sub">Esta unidad todavía no tiene diálogos ni textos para el shadowing.</p></>;
  }

  const current = lines[line];
  const st = STAGES[stage];
  const lastStage = stage === STAGES.length - 1;
  const lastLine = line === lines.length - 1;

  const play = async () => {
    if (playing) { stopAudio(); setPlaying(false); return; }
    setPlaying(true);
    await playModel(current, undefined, st.slow ? SLOW_RATE : NORMAL_RATE);
    setPlaying(false);
    setHeard(true);
  };

  const next = () => {
    stopAudio();
    setPlaying(false);
    setHeard(false);
    if (!lastStage) { setStage(stage + 1); return; }
    if (!lastLine) { setLine(line + 1); setStage(0); return; }
    completeActivity("shadow", unit);
    setFinished(true);
  };

  if (finished) {
    return (
      <>
        {header}
        <section className="card stack">
          <div className="score">{lines.length} líneas</div>
          <p className="sub">Hiciste las cuatro pasadas con cada una. Si alguna se te trabó, vuelve a hacerla otro día: el shadowing mejora con la repetición.</p>
          <a className="btn primary block" href="#/" style={{ textAlign: "center", textDecoration: "none" }}>Volver a Hoy</a>
        </section>
      </>
    );
  }

  return (
    <>
      {header}
      <VoiceNotice needed="Sin voz italiana el shadowing no sirve." />
      <div className="runner-progress" aria-label={`Línea ${line + 1} de ${lines.length}`}>
        <div className="bar"><i style={{ width: `${((line + stage / STAGES.length) / lines.length) * 100}%` }} /></div>
        <span>Línea {line + 1} de {lines.length}</span>
      </div>

      <section className="card stack">
        <div className="eyebrow">Paso {stage + 1} de {STAGES.length} · {st.title}</div>
        <p className="sub">{st.help}</p>
        {st.showText ? <p className="runner-prompt">{current}</p> : <p className="runner-prompt" aria-label="La línea está oculta">• • •</p>}
        <button type="button" className="btn primary" onClick={() => void play()}>
          <Icon name={playing ? "pause" : "play"} size={16} /> {playing ? "Detener" : heard ? "Escuchar otra vez" : "Escuchar"}
        </button>
        {st.speak && heard && <p className="sub" role="status">Ahora dila tú, en voz alta, sin pausar.</p>}
      </section>

      <button type="button" className="btn primary block" disabled={!heard} onClick={next}>
        {lastStage ? (lastLine ? "Terminar" : "Siguiente línea") : "Siguiente paso"}
      </button>
    </>
  );
}
