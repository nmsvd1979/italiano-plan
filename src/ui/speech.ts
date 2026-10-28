import { useEffect, useState } from "react";
import { audioFiles } from "../content/pronunciation";
import { playFile } from "./audio";

/** Lo mínimo que usamos de speechSynthesis; se inyecta para poder probar la espera de voces. */
export interface SynthLike {
  getVoices(): SpeechSynthesisVoice[];
  speak(u: SpeechSynthesisUtterance): void;
  cancel(): void;
  resume?(): void;
  speaking: boolean;
  pending: boolean;
  paused: boolean;
  addEventListener(type: "voiceschanged", cb: () => void): void;
  removeEventListener(type: "voiceschanged", cb: () => void): void;
}

const normLang = (lang: string): string => lang.replace("_", "-").toLowerCase();

/** Voz italiana: primero it-IT exacta, después cualquier it-*. */
export function pickItalianVoice(voices: readonly SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return voices.find((v) => normLang(v.lang) === "it-it") ?? voices.find((v) => normLang(v.lang).startsWith("it"));
}

const synthOrNull = (): SynthLike | null =>
  typeof window !== "undefined" && "speechSynthesis" in window ? (window.speechSynthesis as unknown as SynthLike) : null;

/**
 * Devuelve las voces; si todavía no cargaron (en iOS getVoices() viene vacío hasta `voiceschanged`),
 * espera ese evento y revisa cada 100 ms. Si pasa el tiempo sin voces, devuelve la lista vacía.
 */
export function waitForVoices(synth: SynthLike, timeoutMs = 1500): Promise<SpeechSynthesisVoice[]> {
  const now = synth.getVoices();
  if (now.length > 0) return Promise.resolve(now);
  return new Promise((resolve) => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearInterval(poll);
      clearTimeout(timer);
      synth.removeEventListener("voiceschanged", check);
      resolve(synth.getVoices());
    };
    const check = () => { if (synth.getVoices().length > 0) finish(); };
    const poll = setInterval(check, 100);
    const timer = setTimeout(finish, timeoutMs);
    synth.addEventListener("voiceschanged", check);
  });
}

export interface SpeakReport {
  voices: number;
  italian: number;
  /** Voz elegida (null: se dejó solo el idioma it-IT y el sistema decide). */
  used: { name: string; lang: string; voiceURI: string } | null;
  /** started: empezó a sonar · error: el sistema devolvió un error · silent: no pasó nada · unsupported: sin speechSynthesis. */
  result: "started" | "error" | "silent" | "unsupported";
  error?: string;
}

/**
 * Lee `text` con la voz italiana. Espera las voces si aún no cargaron y solo llama a cancel() si hay algo
 * hablando o en cola (en iOS cancelar justo antes de hablar a veces deja la locución muda). Si tuvo que cancelar,
 * espera un instante antes de hablar.
 */
export async function speakOn(
  synth: SynthLike | null,
  text: string,
  rate = 0.9,
  makeUtterance: (t: string) => SpeechSynthesisUtterance = (t) => new SpeechSynthesisUtterance(t),
  startTimeoutMs = 2500,
  langOnly = false,
): Promise<SpeakReport> {
  if (!synth) return { voices: 0, italian: 0, used: null, result: "unsupported" };
  const voices = await waitForVoices(synth);
  const italian = voices.filter((v) => normLang(v.lang).startsWith("it"));
  const voice = langOnly ? undefined : pickItalianVoice(voices);
  const report: SpeakReport = {
    voices: voices.length,
    italian: italian.length,
    used: voice ? { name: voice.name, lang: voice.lang, voiceURI: voice.voiceURI } : null,
    result: "silent",
  };

  if (synth.speaking || synth.pending) {
    synth.cancel();
    await new Promise((r) => setTimeout(r, 60));
  }
  if (synth.paused) synth.resume?.();

  const u = makeUtterance(text.replace(/\*/g, ""));
  u.lang = "it-IT";
  u.rate = rate;
  if (voice) u.voice = voice;

  return new Promise<SpeakReport>((resolve) => {
    let settled = false;
    const done = (r: Partial<SpeakReport>) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ ...report, ...r });
    };
    const timer = setTimeout(() => done({ result: "silent" }), startTimeoutMs);
    u.onstart = () => done({ result: "started" });
    u.onerror = (e) => done({ result: "error", error: (e as SpeechSynthesisErrorEvent).error ?? "error" });
    synth.speak(u);
  });
}

/** Pide las voces al sistema cuanto antes: así, al tocar un parlante, ya están cargadas. */
export function primeVoices(): void {
  const synth = synthOrNull();
  if (!synth) return;
  synth.getVoices();
  synth.addEventListener("voiceschanged", () => synth.getVoices());
}

export type VoiceStatus = "yes" | "no" | "unknown";

/** ¿Hay una voz italiana instalada? Las voces cargan de forma asíncrona en algunos navegadores. */
export function useItalianVoice(): VoiceStatus {
  const read = (): VoiceStatus => {
    const synth = synthOrNull();
    if (!synth) return "no";
    const voices = synth.getVoices();
    if (voices.length === 0) return "unknown";
    return pickItalianVoice(voices) ? "yes" : "no";
  };
  const [status, setStatus] = useState<VoiceStatus>(read);
  useEffect(() => {
    const synth = synthOrNull();
    if (!synth) return;
    const on = () => setStatus(read());
    synth.addEventListener("voiceschanged", on);
    on();
    // Algunos Safari no emiten el evento: se revisa unos segundos mientras no haya voces.
    const poll = setInterval(on, 500);
    const stop = setTimeout(() => clearInterval(poll), 5000);
    return () => {
      synth.removeEventListener("voiceschanged", on);
      clearInterval(poll);
      clearTimeout(stop);
    };
  }, []);
  return status;
}

/** Lee un texto con la voz italiana del sistema. */
export async function speak(text: string, rate = 0.9): Promise<SpeakReport> {
  const synth = synthOrNull();
  const first = await speakOn(synth, text, rate);
  // Si la voz elegida no suena, se prueba una vez solo con el idioma it-IT y que el sistema decida.
  if (first.used && (first.result === "silent" || first.result === "error")) {
    const retry = await speakOn(synth, text, rate, undefined, 2500, true);
    return retry.result === "started" ? { ...retry, used: null } : first;
  }
  return first;
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
  void speak(text, rate);
  return "system";
}
