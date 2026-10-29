// Grabar la propia voz (docs/v2/05 E1). Todo lo que toca el navegador entra por `RecorderEnv`, así se prueba con dobles.

/** Orden de preferencia: iOS Safari graba en mp4; Chrome y Firefox, en webm. */
export const MIME_ORDER = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm"] as const;

export function pickMimeType(isSupported: (type: string) => boolean): string | undefined {
  return MIME_ORDER.find((t) => isSupported(t));
}

export interface MediaRecorderLike {
  readonly state: "inactive" | "recording" | "paused";
  ondataavailable: ((e: { data: Blob }) => void) | null;
  onstop: (() => void) | null;
  onerror: ((e: unknown) => void) | null;
  start(): void;
  stop(): void;
}

export interface StreamLike {
  getTracks(): { stop(): void }[];
}

export interface RecorderEnv {
  /** Falta cuando el navegador no tiene MediaRecorder o micrófono. */
  getUserMedia?: (constraints: { audio: true }) => Promise<StreamLike>;
  createRecorder?: (stream: StreamLike, mimeType: string | undefined) => MediaRecorderLike;
  isTypeSupported?: (type: string) => boolean;
  makeBlob: (parts: Blob[], mime: string) => Blob;
}

/** denied: no diste permiso · unsupported: este navegador no graba · failed: falló la grabación. */
export type MicProblem = "denied" | "unsupported" | "failed";

export class MicError extends Error {
  constructor(readonly problem: MicProblem, message?: string) {
    super(message ?? problem);
    this.name = "MicError";
  }
}

export interface ActiveRecording {
  mime: string;
  /** Detiene, libera el micrófono y devuelve la grabación. */
  stop(): Promise<{ blob: Blob; mime: string }>;
  /** Descarta sin devolver nada. */
  cancel(): void;
}

/**
 * Pide el micrófono y empieza a grabar. Debe llamarse desde un toque del usuario (iOS no deja pedir el permiso de otra forma).
 * Sin permiso o sin soporte lanza `MicError`: la pantalla pasa al modo sin grabación.
 */
export async function startRecording(env: RecorderEnv): Promise<ActiveRecording> {
  if (!env.getUserMedia || !env.createRecorder) throw new MicError("unsupported");
  let stream: StreamLike;
  try {
    stream = await env.getUserMedia({ audio: true });
  } catch (e) {
    const name = (e as { name?: string } | null)?.name;
    throw new MicError(name === "NotAllowedError" || name === "SecurityError" || name === "PermissionDeniedError" ? "denied" : "failed");
  }
  const release = () => stream.getTracks().forEach((t) => t.stop());
  const wanted = env.isTypeSupported ? pickMimeType(env.isTypeSupported) : undefined;
  let recorder: MediaRecorderLike;
  try {
    recorder = env.createRecorder(stream, wanted);
  } catch {
    release();
    throw new MicError("failed");
  }
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data); };
  try {
    recorder.start();
  } catch {
    release();
    throw new MicError("failed");
  }
  const mime = wanted ?? "audio/mp4";
  return {
    mime,
    stop: () =>
      new Promise((resolve, reject) => {
        recorder.onstop = () => {
          release();
          if (chunks.length === 0) reject(new MicError("failed", "La grabación quedó vacía."));
          else resolve({ blob: env.makeBlob(chunks, mime), mime });
        };
        recorder.onerror = () => { release(); reject(new MicError("failed")); };
        if (recorder.state === "inactive") recorder.onstop();
        else recorder.stop();
      }),
    cancel: () => {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      try { if (recorder.state !== "inactive") recorder.stop(); } catch { /* ya estaba detenido */ }
      release();
    },
  };
}

/** El entorno real del navegador. Con `MediaRecorder` ausente (iOS viejo, contexto no seguro) devuelve uno sin soporte. */
export function browserEnv(): RecorderEnv {
  const nav = typeof navigator !== "undefined" ? navigator : undefined;
  const MR = typeof MediaRecorder !== "undefined" ? MediaRecorder : undefined;
  const canRecord = !!MR && !!nav?.mediaDevices?.getUserMedia;
  return {
    getUserMedia: canRecord ? (c) => nav!.mediaDevices.getUserMedia(c) : undefined,
    createRecorder: canRecord ? (stream, mimeType) => new MR!(stream as MediaStream, mimeType ? { mimeType } : undefined) as unknown as MediaRecorderLike : undefined,
    isTypeSupported: MR ? (t) => MR.isTypeSupported(t) : undefined,
    makeBlob: (parts, mime) => new Blob(parts, { type: mime }),
  };
}

export const micAvailable = (env: RecorderEnv = browserEnv()): boolean => !!env.getUserMedia && !!env.createRecorder;
