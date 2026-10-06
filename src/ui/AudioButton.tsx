import { Icon } from "./Icon";
import { speak } from "./speech";

/** Lee una frase con la voz italiana del sistema. Solo para ejemplos: no sirve para entrenar la pronunciación. */
export function AudioButton({ text, rate }: { text: string; rate?: number }) {
  if (!("speechSynthesis" in window)) return null;
  return (
    <button type="button" className="audio-btn" onClick={() => speak(text, rate)} aria-label={`Escuchar: ${text}`}>
      <Icon name="sound" size={18} />
    </button>
  );
}
