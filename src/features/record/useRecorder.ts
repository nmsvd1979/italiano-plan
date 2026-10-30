import { useCallback, useEffect, useRef, useState } from "react";
import { MemoryRecStore, idbRecStore, type RecStore } from "../../domain/recStore";
import { MicError, browserEnv, micAvailable, startRecording, type ActiveRecording } from "../../domain/recording";

export type RecorderStatus = "idle" | "recording" | "denied" | "unsupported" | "failed";

let store: RecStore | null = null;
/** IndexedDB si se puede; si no (navegación privada), en memoria mientras la app esté abierta. */
export function recStore(): RecStore {
  if (store) return store;
  try {
    store = idbRecStore();
  } catch {
    store = new MemoryRecStore();
  }
  return store;
}

export interface Take {
  url: string;
  mime: string;
  /** false si no se pudo guardar en el dispositivo (solo se puede oír mientras la pantalla esté abierta). */
  saved: boolean;
}

/**
 * Grabar con el micrófono. `start` debe llamarse desde un toque. Si no hay permiso o soporte, `status` lo dice y la
 * pantalla ofrece el modo sin grabación.
 */
export function useRecorder(activity: string) {
  const [status, setStatus] = useState<RecorderStatus>(() => (micAvailable() ? "idle" : "unsupported"));
  const [take, setTake] = useState<Take | null>(null);
  const active = useRef<ActiveRecording | null>(null);
  const urls = useRef<string[]>([]);

  useEffect(() => () => {
    active.current?.cancel();
    urls.current.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const start = useCallback(async () => {
    try {
      active.current = await startRecording(browserEnv());
      setStatus("recording");
    } catch (e) {
      setStatus(e instanceof MicError ? e.problem : "failed");
    }
  }, []);

  const stop = useCallback(async () => {
    const rec = active.current;
    active.current = null;
    if (!rec) return;
    try {
      const { blob, mime } = await rec.stop();
      const url = URL.createObjectURL(blob);
      urls.current.push(url);
      let saved = true;
      try {
        await recStore().add(activity, blob, mime, Date.now());
      } catch {
        saved = false;
      }
      setTake({ url, mime, saved });
      setStatus("idle");
    } catch {
      setStatus("failed");
    }
  }, [activity]);

  return { status, take, start, stop, usable: status === "idle" || status === "recording" };
}
