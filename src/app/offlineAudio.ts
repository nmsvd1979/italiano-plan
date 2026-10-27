import { useEffect, useSyncExternalStore } from "react";
import { requestPersistence, type PersistState } from "./persist";

// Gestor de descarga del audio para usar sin conexión. El audio NO va en el precache del service worker:
// se baja desde la página a la caché "audio-v1" (la misma que lee el service worker con CacheFirst).

export const AUDIO_CACHE = "audio-v1";
const BATCH = 4;
const ATTEMPTS = 3;
/** Margen sobre el peso del audio al comparar con el espacio libre. */
const SPACE_MARGIN = 1.25;

export interface AudioEntry {
  /** Ruta relativa a la base del sitio, ej. "audio/gatto--langpao.mp3". */
  url: string;
  bytes: number;
  unit: string;
}

export const absoluteUrl = (entry: AudioEntry | string, base = location.href): string =>
  new URL(typeof entry === "string" ? entry : `${import.meta.env.BASE_URL}${entry.url}`, base).href;

/** Lo que falta por bajar: entradas del índice cuya URL no está entre las claves de la caché. */
export function missingAudio(index: AudioEntry[], cachedUrls: Set<string>, resolve: (e: AudioEntry) => string): AudioEntry[] {
  return index.filter((e) => !cachedUrls.has(resolve(e)));
}

/** Ordena para bajar primero las unidades dadas (en ese orden) y después el resto (por unidad). */
export function prioritize(entries: AudioEntry[], firstUnits: string[]): AudioEntry[] {
  const rank = (e: AudioEntry) => {
    const i = firstUnits.indexOf(e.unit);
    return i === -1 ? firstUnits.length : i;
  };
  return entries
    .map((e, pos) => ({ e, pos }))
    .sort((a, b) => rank(a.e) - rank(b.e) || (rank(a.e) === firstUnits.length ? a.e.unit.localeCompare(b.e.unit) : 0) || a.pos - b.pos)
    .map((x) => x.e);
}

/** Reintenta `fn` hasta `attempts` veces, esperando más cada vez (1 s, 2 s…). No reintenta si se pausó. */
export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: { attempts?: number; wait?: (ms: number) => Promise<void>; signal?: AbortSignal } = {},
): Promise<T> {
  const { attempts = ATTEMPTS, wait = (ms) => new Promise((r) => setTimeout(r, ms)), signal } = opts;
  for (let n = 1; ; n++) {
    try {
      return await fn();
    } catch (err) {
      if (signal?.aborted || n >= attempts) throw err;
      await wait(1000 * n);
    }
  }
}

export interface DownloadDeps {
  fetchAudio: (url: string, signal: AbortSignal) => Promise<Response>;
  put: (url: string, response: Response) => Promise<void>;
  wait?: (ms: number) => Promise<void>;
}

export interface DownloadProgress {
  done: number;
  total: number;
  bytesDone: number;
  failed: number;
}

/**
 * Baja las entradas que faltan, de a `BATCH` en paralelo. Solo guarda un archivo si llegó completo (200 y el peso del índice),
 * así una descarga cortada nunca deja un audio a medias en la caché. Devuelve cuántas fallaron tras los reintentos.
 */
export async function downloadEntries(
  entries: AudioEntry[],
  deps: DownloadDeps,
  signal: AbortSignal,
  onProgress: (p: DownloadProgress) => void,
  resolve: (e: AudioEntry) => string = absoluteUrl,
): Promise<DownloadProgress> {
  const p: DownloadProgress = { done: 0, total: entries.length, bytesDone: 0, failed: 0 };
  let next = 0;
  const worker = async () => {
    while (!signal.aborted) {
      const entry = entries[next++];
      if (!entry) return;
      const url = resolve(entry);
      try {
        await withRetry(
          async () => {
            const res = await deps.fetchAudio(url, signal);
            if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
            const blob = await res.blob();
            if (blob.size !== entry.bytes) throw new Error(`tamaño ${blob.size} ≠ ${entry.bytes}`);
            await deps.put(url, new Response(blob, { headers: { "Content-Type": res.headers.get("Content-Type") ?? "audio/mpeg", "Content-Length": String(blob.size) } }));
          },
          { wait: deps.wait, signal },
        );
        p.done++;
        p.bytesDone += entry.bytes;
      } catch {
        if (signal.aborted) return;
        p.failed++;
      }
      onProgress({ ...p });
    }
  };
  await Promise.all(Array.from({ length: Math.min(BATCH, entries.length) }, worker));
  return p;
}

// ---- Estado compartido (la descarga sigue aunque cambies de pantalla) ----

export type AudioPhase = "unsupported" | "checking" | "idle" | "downloading" | "paused" | "done" | "error";

export interface AudioState {
  phase: AudioPhase;
  /** Archivos ya guardados / total del índice. */
  done: number;
  total: number;
  bytesDone: number;
  bytesTotal: number;
  /** Pocos MB libres para el audio que falta. */
  lowSpace: boolean;
  persist: PersistState | "checking";
  /** La descarga terminó en esta sesión (para mostrar «Listo para usar sin conexión» una vez). */
  justFinished: boolean;
  message?: string;
}

const supported = () => typeof caches !== "undefined" && typeof fetch === "function";

let state: AudioState = {
  phase: supported() ? "checking" : "unsupported",
  done: 0, total: 0, bytesDone: 0, bytesTotal: 0, lowSpace: false, persist: "checking", justFinished: false,
};
let index: AudioEntry[] = [];
let controller: AbortController | null = null;
const listeners = new Set<() => void>();

function set(patch: Partial<AudioState>): void {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

async function loadIndex(): Promise<AudioEntry[]> {
  const res = await fetch(`${import.meta.env.BASE_URL}audio-index.json`);
  if (!res.ok) throw new Error(`audio-index.json: HTTP ${res.status}`);
  return (await res.json()) as AudioEntry[];
}

/** Vuelve a leer la caché y calcula cuánto está guardado. No interrumpe una descarga en curso. */
export async function refreshAudioStatus(): Promise<void> {
  if (!supported() || state.phase === "downloading") return;
  try {
    if (index.length === 0) index = await loadIndex();
    const cache = await caches.open(AUDIO_CACHE);
    const cached = new Set((await cache.keys()).map((r) => r.url));
    const missing = missingAudio(index, cached, absoluteUrl);
    const bytesTotal = index.reduce((s, e) => s + e.bytes, 0);
    const bytesDone = bytesTotal - missing.reduce((s, e) => s + e.bytes, 0);
    set({
      phase: missing.length === 0 ? "done" : state.phase === "paused" ? "paused" : "idle",
      done: index.length - missing.length, total: index.length, bytesDone, bytesTotal, message: undefined,
    });
  } catch (err) {
    set({ phase: "error", message: err instanceof Error ? err.message : String(err) });
  }
}

async function enoughSpace(missingBytes: number): Promise<boolean> {
  const est = await navigator.storage?.estimate?.();
  if (!est?.quota || est.usage === undefined) return true;
  return est.quota - est.usage > missingBytes * SPACE_MARGIN;
}

/** Empieza o reanuda: calcula lo que falta comparando el índice con la caché, así que no repite lo ya bajado. */
export async function startAudioDownload(firstUnits: string[] = []): Promise<void> {
  if (!supported() || state.phase === "downloading") return;
  controller = new AbortController();
  const signal = controller.signal;
  try {
    set({ phase: "checking", message: undefined, justFinished: false });
    if (index.length === 0) index = await loadIndex();
    const cache = await caches.open(AUDIO_CACHE);
    const cached = new Set((await cache.keys()).map((r) => r.url));
    const todo = prioritize(missingAudio(index, cached, absoluteUrl), firstUnits);
    const bytesTotal = index.reduce((s, e) => s + e.bytes, 0);
    const bytesBefore = bytesTotal - todo.reduce((s, e) => s + e.bytes, 0);
    const lowSpace = !(await enoughSpace(todo.reduce((s, e) => s + e.bytes, 0)));
    set({ phase: "downloading", total: index.length, bytesTotal, done: index.length - todo.length, bytesDone: bytesBefore, lowSpace });

    const result = await downloadEntries(
      todo,
      {
        fetchAudio: (url, sig) => fetch(url, { signal: sig, cache: "no-store" }),
        put: (url, res) => cache.put(url, res),
      },
      signal,
      (p) => set({ done: index.length - todo.length + p.done, bytesDone: bytesBefore + p.bytesDone }),
    );

    if (signal.aborted) {
      set({ phase: "paused" });
    } else if (result.failed > 0) {
      set({ phase: "error", message: `No se pudieron bajar ${result.failed} archivos. Revisa tu conexión y toca «Reanudar».` });
    } else {
      set({ phase: "done", justFinished: true });
      set({ persist: await requestPersistence() });
    }
  } catch (err) {
    set({ phase: signal.aborted ? "paused" : "error", message: err instanceof Error ? err.message : String(err) });
  } finally {
    controller = null;
  }
}

export function pauseAudioDownload(): void {
  controller?.abort();
}

export function dismissJustFinished(): void {
  set({ justFinished: false });
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Estado de la descarga de audio. Al montar vuelve a leer la caché (por si iOS la desalojó o se borró algo). */
export function useAudioDownload(): AudioState {
  useEffect(() => { void refreshAudioStatus(); }, []);
  return useSyncExternalStore(subscribe, () => state);
}

/** Solo para pruebas: devuelve el estado a su valor inicial. */
export function __resetAudioStore(): void {
  state = { ...state, phase: supported() ? "checking" : "unsupported", done: 0, total: 0, bytesDone: 0, bytesTotal: 0, justFinished: false, message: undefined };
  index = [];
  controller = null;
}
