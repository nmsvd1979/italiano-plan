import { useState } from "react";
import { useApp } from "../../app/state";
import { goBack } from "../../app/route";
import { getUnit } from "../../content/curriculum";
import { getDialogue } from "../../content/dialogues";
import { Icon } from "../../ui/Icon";
import { speak, useItalianVoice } from "../../ui/speech";

/** Reproduce todas las líneas una tras otra con la voz del sistema. */
function speakAll(lines: string[], onEnd: () => void): void {
  const synth = window.speechSynthesis;
  synth.cancel();
  const voice = synth.getVoices().find((v) => v.lang.replace("_", "-").toLowerCase().startsWith("it"));
  lines.forEach((text, i) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "it-IT";
    u.rate = 0.9;
    if (voice) u.voice = voice;
    if (i === lines.length - 1) u.onend = onEnd;
    synth.speak(u);
  });
}

export function DialogueScreen({ unit }: { unit: string }) {
  const { completeActivity } = useApp();
  const dialogue = getDialogue(unit);
  const meta = getUnit(unit);
  const voice = useItalianVoice();
  const [role, setRole] = useState<"A" | "B">(dialogue?.you ?? "B");
  const [revealed, setRevealed] = useState<number[]>([]);
  const [translations, setTranslations] = useState(true);
  const [playing, setPlaying] = useState(false);

  if (!dialogue) return <p className="sub">Esta unidad todavía no tiene diálogo.</p>;

  const reveal = (i: number) => {
    setRevealed((r) => (r.includes(i) ? r : [...r, i]));
    speak(dialogue.lines[i].it);
  };

  const playAll = () => {
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    speakAll(dialogue.lines.map((x) => x.it), () => setPlaying(false));
  };

  const finish = () => {
    window.speechSynthesis?.cancel();
    completeActivity("dialogue", unit);
    window.location.hash = "#/";
  };

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); window.speechSynthesis?.cancel(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">Unidad {meta?.n} · Diálogo</div>
          <h1 className="title">Dilo en voz alta</h1>
        </div>
      </header>

      {voice === "no" && (
        <p className="note">
          <Icon name="info" size={16} />
          <span>Este dispositivo no tiene voz italiana (iPhone: Ajustes → Accesibilidad → Contenido leído → Voces → Italiano). Puedes leer el diálogo igual, pero sin audio.</span>
        </p>
      )}

      <section className="card stack">
        <div className="eyebrow">La escena</div>
        <p>{dialogue.setting}</p>
        <div className="field">
          <label>Tú haces de…</label>
          <div className="segmented" role="group" aria-label="Tu papel">
            {(["A", "B"] as const).map((r) => (
              <button key={r} type="button" aria-pressed={role === r} onClick={() => { setRole(r); setRevealed([]); }}>
                {dialogue.roles[r]}
              </button>
            ))}
          </div>
        </div>
        <p className="sub">
          Lo que dice el otro lo lees y lo escuchas. En tus líneas ves solo la pista en español: dila en italiano en voz alta y toca para comprobar.
        </p>
        <div className="row">
          {voice !== "no" && (
            <button type="button" className="chip" onClick={playAll}>
              <Icon name={playing ? "pause" : "play"} size={14} /> {playing ? "Detener" : "Escuchar todo"}
            </button>
          )}
          <button type="button" className="chip" onClick={() => setTranslations((t) => !t)}>
            {translations ? "Ocultar traducción" : "Mostrar traducción"}
          </button>
        </div>
      </section>

      <section className="card dialogue">
        {dialogue.lines.map((line, i) => {
          const mine = line.who === role;
          const open = !mine || revealed.includes(i);
          return (
            <div key={i} className={`dline ${mine ? "mine" : "theirs"}`}>
              <div className="dwho">{dialogue.roles[line.who]}</div>
              {open ? (
                <>
                  <div className="dtext">
                    <span>{line.it}</span>
                    <button type="button" className="audio-btn" onClick={() => speak(line.it)} aria-label={`Escuchar: ${line.it}`}>
                      <Icon name="sound" size={18} />
                    </button>
                  </div>
                  {translations && <div className="des">{line.es}</div>}
                </>
              ) : (
                <button type="button" className="dcue" onClick={() => reveal(i)}>
                  <span>{line.es}</span>
                  <small>Dila en italiano y toca para ver y escuchar</small>
                </button>
              )}
            </div>
          );
        })}
      </section>

      <button type="button" className="btn primary block" onClick={finish}>Terminé</button>
    </>
  );
}
