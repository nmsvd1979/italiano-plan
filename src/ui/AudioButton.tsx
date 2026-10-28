import { useState } from "react";
import { Icon } from "./Icon";
import { speak } from "./speech";

/** Lee una frase con la voz italiana del sistema. Solo para ejemplos: no sirve para entrenar la pronunciación. */
export function AudioButton({ text, rate }: { text: string; rate?: number }) {
  const [failed, setFailed] = useState(false);
  if (!("speechSynthesis" in window)) return null;
  const play = async () => {
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
