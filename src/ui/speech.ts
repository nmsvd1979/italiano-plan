import { useEffect, useState } from "react";
import { audioFiles } from "../content/pronunciation";
import { playFile } from "./audio";

function italianVoice(): SpeechSynthesisVoice | undefined {
  if (!("speechSynthesis" in window)) return undefined;
  return window.speechSynthesis.getVoices().find((v) => v.lang.replace("_", "-").toLowerCase().startsWith("it"));
}

export type VoiceStatus = "yes" | "no" | "unknown";

/** ¿Hay una voz italiana instalada? Las voces cargan de forma asíncrona en algunos navegadores. */
export function useItalianVoice(): VoiceStatus {
  const read = (): VoiceStatus => {
    if (!("speechSynthesis" in window)) return "no";
    if (window.speechSynthesis.getVoices().length === 0) return "unknown";
    return italianVoice() ? "yes" : "no";
  };
  const [status, setStatus] = useState<VoiceStatus>(read);
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const on = () => setStatus(read());
    window.speechSynthesis.addEventListener("voiceschanged", on);
    on();
    return () => window.speechSynthesis.removeEventListener("voiceschanged", on);
  }, []);
  return status;
}

/** Lee un texto con la voz italiana del sistema. */
export function speak(text: string, rate = 0.9): void {
  if (!("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/\*/g, ""));
  u.lang = "it-IT";
  u.rate = rate;
  const voice = italianVoice();
  if (voice) u.voice = voice;
  synth.speak(u);
}

const ARTICLE = /^(?:(?:il|lo|la|i|gli|le|un|uno|una)\s+|l'|un')/i;

/** Palabra suelta del texto (sin artículo), o null si es una frase. */
export function singleWord(text: string): string | null {
  const bare = text.trim().replace(ARTICLE, "").toLowerCase();
  return /^[a-zàèéìòù]+$/.test(bare) ? bare : null;
}

/** Audio nativo si existe para esa palabra suelta; si no, la voz del sistema. Devuelve cuál usó. */
export function say(text: string, rate = 0.9): "native" | "system" {
  const word = singleWord(text);
  const files = word ? audioFiles(word) : [];
  if (files.length > 0) {
    playFile(files[Math.floor(Math.random() * files.length)]);
    return "native";
  }
  speak(text, rate);
  return "system";
}
