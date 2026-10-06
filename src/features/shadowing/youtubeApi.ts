// Carga única de la IFrame Player API de YouTube y los tipos mínimos que usamos.

export interface YTPlayer {
  getCurrentTime(): number;
  getPlayerState(): number;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  playVideo(): void;
  pauseVideo(): void;
  setPlaybackRate(rate: number): void;
  getAvailablePlaybackRates(): number[];
  loadVideoById(id: string): void;
  destroy(): void;
}

interface YTNamespace {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string;
      playerVars: Record<string, string | number>;
      events: { onReady: () => void };
    },
  ) => YTPlayer;
  PlayerState: { PLAYING: number };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let loading: Promise<YTNamespace> | null = null;

export function loadYouTube(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  loading ??= new Promise<YTNamespace>((resolve, reject) => {
    window.onYouTubeIframeAPIReady = () => resolve(window.YT as YTNamespace);
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.onerror = () => {
      loading = null;
      reject(new Error("No se pudo cargar YouTube"));
    };
    document.head.appendChild(s);
  });
  return loading;
}
