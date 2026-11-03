export type PlayOutcome = "ended" | "stopped" | "failed";

// Un solo <audio> reutilizado para todo public/audio: así hay una pista a la vez, y en iOS el elemento, una vez
// desbloqueado por un toque del usuario, sigue pudiendo encadenar pistas.
let el: HTMLAudioElement | null = null;
let settle: ((outcome: PlayOutcome) => void) | null = null;

/** Corta lo que esté sonando (su promesa termina con "stopped"). */
export function stopFile(): void {
  const done = settle;
  settle = null;
  el?.pause();
  done?.("stopped");
}

/**
 * Reproduce un archivo de public/audio; corta el anterior para que no se superpongan. `rate` < 1 lo hace más lento sin
 * cambiar el tono. Llamar desde un gesto del usuario (iOS). La promesa dice cómo terminó:
 * "ended" (sonó entero), "stopped" (lo cortó otra pista) o "failed" (no pudo cargar o iniciar).
 */
export function playFile(file: string, rate = 1): Promise<PlayOutcome> {
  stopFile();
  const audio = (el ??= new Audio());
  return new Promise<PlayOutcome>((resolve) => {
    const mine = (outcome: PlayOutcome) => {
      if (settle !== mine) return;
      settle = null;
      resolve(outcome);
    };
    settle = mine;
    audio.onended = () => mine("ended");
    audio.onerror = () => mine("failed");
    audio.preservesPitch = true;
    audio.src = `${import.meta.env.BASE_URL}audio/${file}`;
    // Cambiar `src` reinicia la velocidad: se fija después.
    audio.defaultPlaybackRate = rate;
    audio.playbackRate = rate;
    audio.play().catch(() => mine("failed"));
  });
}
