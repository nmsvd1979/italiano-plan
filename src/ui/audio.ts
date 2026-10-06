let current: HTMLAudioElement | null = null;

/** Reproduce un archivo de public/audio; corta el anterior para que no se superpongan. */
export function playFile(file: string): void {
  current?.pause();
  current = new Audio(`${import.meta.env.BASE_URL}audio/${file}`);
  void current.play();
}
