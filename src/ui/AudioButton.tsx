import { useState } from "react";
import { Icon } from "./Icon";
import { say, sourceOf, speak } from "./speech";

/** Dice una frase: clip de voz sintética si lo hay, si no la voz italiana del sistema. Solo para ejemplos: no sirve para entrenar la pronunciación. */
export function AudioButton({ text, rate }: { text: string; rate?: number }) {
  const [failed, setFailed] = useState(false);
  if (!("speechSynthesis" in window) && sourceOf(text) === "system") return null;
  const play = async () => {
    if (sourceOf(text) !== "system") {
      say(text, rate);
      setFailed(false);
      return;
    }
    const r = await speak(text, rate);
    setFailed(r.result !== "started");
  };
  return (
    <>
      <button type="button" className="audio-btn" onClick={() => void play()} aria-label={`Escuchar: ${text}`}>
        <Icon name="sound" size={18} />
      </button>
      {failed && <span className="activity-hint" role="status">No sonó. Prueba la voz en Ajustes.</span>}
    </>
  );
}
