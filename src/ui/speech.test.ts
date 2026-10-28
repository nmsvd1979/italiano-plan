import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { pickItalianVoice, speakOn, waitForVoices, type SynthLike } from "./speech";

const voice = (lang: string, name = lang): SpeechSynthesisVoice => ({ lang, name, voiceURI: `uri:${name}`, default: false, localService: true });

class FakeSynth implements SynthLike {
  voices: SpeechSynthesisVoice[] = [];
  speaking = false;
  pending = false;
  paused = false;
  cancel = vi.fn(() => { this.speaking = false; this.pending = false; });
  resume = vi.fn(() => { this.paused = false; });
  spoken: FakeUtterance[] = [];
  /** Qué hace el sistema al recibir la locución. */
  onSpeak: (u: FakeUtterance) => void = (u) => u.onstart?.({} as SpeechSynthesisEvent);
  private listeners = new Set<() => void>();
  getVoices() { return this.voices; }
  speak(u: SpeechSynthesisUtterance) { this.spoken.push(u as unknown as FakeUtterance); this.onSpeak(u as unknown as FakeUtterance); }
  addEventListener(_t: "voiceschanged", cb: () => void) { this.listeners.add(cb); }
  removeEventListener(_t: "voiceschanged", cb: () => void) { this.listeners.delete(cb); }
  emit() { this.listeners.forEach((cb) => cb()); }
  get listenerCount() { return this.listeners.size; }
}
interface FakeUtterance { text: string; lang: string; rate: number; voice: SpeechSynthesisVoice | null; onstart?: (e: SpeechSynthesisEvent) => void; onerror?: (e: SpeechSynthesisErrorEvent) => void }
const utt = (text: string) => ({ text, lang: "", rate: 1, voice: null }) as unknown as SpeechSynthesisUtterance;

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

describe("voz italiana: elección", () => {
  it("prefiere it-IT y acepta it_IT u otras variantes it-*", () => {
    const voices = [voice("es-CL", "Paulina"), voice("it-CH", "Suiza"), voice("it_IT", "Alice")];
    expect(pickItalianVoice(voices)?.name).toBe("Alice");
    expect(pickItalianVoice([voice("it-CH", "Suiza")])?.name).toBe("Suiza");
    expect(pickItalianVoice([voice("es-CL"), voice("en-US")])).toBeUndefined();
    expect(pickItalianVoice([])).toBeUndefined();
  });
});

describe("esperar las voces", () => {
  it("si ya están, responde de inmediato sin escuchar eventos", async () => {
    const s = new FakeSynth();
    s.voices = [voice("it-IT")];
    expect(await waitForVoices(s)).toHaveLength(1);
    expect(s.listenerCount).toBe(0);
  });

  it("si vienen vacías, espera el evento voiceschanged", async () => {
    const s = new FakeSynth();
    const p = waitForVoices(s);
    s.voices = [voice("it-IT")];
    s.emit();
    expect(await p).toHaveLength(1);
    expect(s.listenerCount).toBe(0);
  });

  it("si no llega el evento (algunos Safari), las encuentra revisando cada 100 ms", async () => {
    const s = new FakeSynth();
    const p = waitForVoices(s);
    await vi.advanceTimersByTimeAsync(250);
    s.voices = [voice("it-IT")];
    await vi.advanceTimersByTimeAsync(100);
    expect(await p).toHaveLength(1);
  });

  it("si nunca llegan, se rinde al vencer el tiempo y devuelve una lista vacía", async () => {
    const s = new FakeSynth();
    const p = waitForVoices(s, 1000);
    await vi.advanceTimersByTimeAsync(1000);
    expect(await p).toEqual([]);
    expect(s.listenerCount).toBe(0);
  });
});

describe("hablar", () => {
  const run = async (s: FakeSynth, opts: { langOnly?: boolean } = {}) => {
    const p = speakOn(s, "Buongiorno *Marco*", 0.9, utt, 2500, opts.langOnly);
    await vi.advanceTimersByTimeAsync(3000);
    return p;
  };

  it("usa la voz italiana y el idioma it-IT, y avisa que empezó", async () => {
    const s = new FakeSynth();
    s.voices = [voice("es-CL", "Paulina"), voice("it-IT", "Alice")];
    const r = await run(s);
    expect(r).toMatchObject({ voices: 2, italian: 1, result: "started", used: { name: "Alice", voiceURI: "uri:Alice" } });
    expect(s.spoken[0]).toMatchObject({ text: "Buongiorno Marco", lang: "it-IT", rate: 0.9 });
    expect(s.spoken[0].voice?.voiceURI).toBe("uri:Alice");
  });

  it("espera las voces antes de hablar si aún no cargaron", async () => {
    const s = new FakeSynth();
    const p = speakOn(s, "Ciao", 0.9, utt);
    await vi.advanceTimersByTimeAsync(300);
    expect(s.spoken).toHaveLength(0);
    s.voices = [voice("it-IT", "Alice")];
    s.emit();
    const r = await p;
    expect(s.spoken).toHaveLength(1);
    expect(r.result).toBe("started");
  });

  it("no llama a cancel() si no hay nada hablando; si lo hay, cancela y espera un instante", async () => {
    const idle = new FakeSynth();
    idle.voices = [voice("it-IT")];
    await run(idle);
    expect(idle.cancel).not.toHaveBeenCalled();

    const busy = new FakeSynth();
    busy.voices = [voice("it-IT")];
    busy.speaking = true;
    const p = speakOn(busy, "Ciao", 0.9, utt);
    await vi.advanceTimersByTimeAsync(0);
    expect(busy.cancel).toHaveBeenCalledTimes(1);
    expect(busy.spoken).toHaveLength(0); // todavía esperando después de cancelar
    await vi.advanceTimersByTimeAsync(100);
    await p;
    expect(busy.spoken).toHaveLength(1);
  });

  it("si está en pausa, la reanuda", async () => {
    const s = new FakeSynth();
    s.voices = [voice("it-IT")];
    s.paused = true;
    await run(s);
    expect(s.resume).toHaveBeenCalled();
  });

  it("sin voz italiana igual habla con el idioma it-IT y lo informa", async () => {
    const s = new FakeSynth();
    s.voices = [voice("es-CL")];
    const r = await run(s);
    expect(r).toMatchObject({ voices: 1, italian: 0, used: null, result: "started" });
    expect(s.spoken[0].lang).toBe("it-IT");
    expect(s.spoken[0].voice).toBeNull();
  });

  it("langOnly no asigna ninguna voz", async () => {
    const s = new FakeSynth();
    s.voices = [voice("it-IT", "Alice")];
    const r = await run(s, { langOnly: true });
    expect(r.used).toBeNull();
    expect(s.spoken[0].voice).toBeNull();
  });

  it("informa error y silencio", async () => {
    const err = new FakeSynth();
    err.voices = [voice("it-IT")];
    err.onSpeak = (u) => u.onerror?.({ error: "not-allowed" } as SpeechSynthesisErrorEvent);
    expect(await run(err)).toMatchObject({ result: "error", error: "not-allowed" });

    const mute = new FakeSynth();
    mute.voices = [voice("it-IT")];
    mute.onSpeak = () => undefined;
    expect((await run(mute)).result).toBe("silent");
  });

  it("sin speechSynthesis devuelve «unsupported»", async () => {
    expect(await speakOn(null, "Ciao")).toMatchObject({ result: "unsupported", voices: 0 });
  });
});
