import { Icon } from "./Icon";

/** Lee una frase con la voz italiana del sistema. Solo para ejemplos de gramática: no para entrenar la pronunciación. */
export function AudioButton({ text }: { text: string }) {
  if (!("speechSynthesis" in window)) return null;

  const speak = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/\*/g, ""));
    u.lang = "it-IT";
    u.rate = 0.9;
    const voice = synth.getVoices().find((v) => v.lang.replace("_", "-").toLowerCase().startsWith("it"));
    if (voice) u.voice = voice;
    synth.speak(u);
  };

  return (
    <button type="button" className="audio-btn" onClick={speak} aria-label={`Escuchar: ${text}`}>
      <Icon name="sound" size={18} />
    </button>
  );
}
