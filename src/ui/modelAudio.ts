import { playFile, stopFile } from "./audio";
import { NORMAL_RATE } from "../domain/speechRate";
import { clipFile, noteSystemVoice } from "./speech";

// Reproducir y esperar a que termine, para poder alternar «Modelo → Tú».

let current: HTMLAudioElement | null = null;

export function stopAudio(): void {
  current?.pause();
  current = null;
  stopFile();
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
}

/** Devuelve false si el archivo no cargó o no pudo iniciarse (el llamador puede caer a la voz del sistema). */
function playSrc(src: string, maxMs: number, playbackRate = 1): Promise<boolean> {
  stopAudio();
  return new Promise((resolve) => {
    const audio = new Audio(src);
    audio.preservesPitch = true;
    audio.defaultPlaybackRate = playbackRate;
    audio.playbackRate = playbackRate;
    current = audio;
    const end = (ok: boolean) => { clearTimeout(timer); resolve(ok); };
    const timer = setTimeout(() => end(true), maxMs);
    audio.onended = () => end(true);
    audio.onerror = () => end(false);
    audio.play().catch(() => end(false));
  });
}

/** Reproduce una grabación propia (URL de objeto). */
export const playRecording = (url: string): Promise<void> => playSrc(url, 60_000).then(() => undefined);

/**
 * Reproduce el modelo: el audio nativo si hay (`file`), si no el clip de voz sintética de la frase (el mismo que usa `say()`),
 * y solo si tampoco hay, la voz italiana del sistema. Termina cuando acaba de sonar.
 */
export function playModel(text: string, file?: string, rate = 0.9): Promise<void> {
  if (file) return playSrc(`${import.meta.env.BASE_URL}audio/${file}`, 20_000).then(() => undefined);
  const clip = clipFile(text);
  if (clip) {
    return playSrc(`${import.meta.env.BASE_URL}audio/${clip}`, 20_000, rate / NORMAL_RATE).then((ok) => (ok ? undefined : speakSystem(text, rate)));
  }
  return speakSystem(text, rate);
}

function speakSystem(text: string, rate: number): Promise<void> {
  stopAudio();
  noteSystemVoice();
  const synth = window.speechSynthesis;
  if (!synth) return Promise.resolve();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text.replace(/\*/g, ""));
    u.lang = "it-IT";
    u.rate = rate;
    const voice = synth.getVoices().find((v) => v.lang.replace("_", "-").toLowerCase().startsWith("it"));
    if (voice) u.voice = voice;
    const timer = setTimeout(resolve, 20_000);
    const end = () => { clearTimeout(timer); resolve(); };
    u.onend = end;
    u.onerror = end;
    synth.speak(u);
  });
}

export { playFile };
