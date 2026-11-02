import { playFile } from "./audio";

// Reproducir y esperar a que termine, para poder alternar «Modelo → Tú».

let current: HTMLAudioElement | null = null;

export function stopAudio(): void {
  current?.pause();
  current = null;
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
}

function playSrc(src: string, maxMs: number): Promise<void> {
  stopAudio();
  return new Promise((resolve) => {
    const audio = new Audio(src);
    current = audio;
    const end = () => { clearTimeout(timer); resolve(); };
    const timer = setTimeout(end, maxMs);
    audio.onended = end;
    audio.onerror = end;
    audio.play().catch(end);
  });
}

/** Reproduce una grabación propia (URL de objeto). */
export const playRecording = (url: string): Promise<void> => playSrc(url, 60_000);

/** Reproduce el modelo: el audio nativo si hay (`file`), si no la voz italiana del sistema. Termina cuando acaba de sonar. */
export function playModel(text: string, file?: string, rate = 0.9): Promise<void> {
  if (file) return playSrc(`${import.meta.env.BASE_URL}audio/${file}`, 20_000);
  stopAudio();
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
