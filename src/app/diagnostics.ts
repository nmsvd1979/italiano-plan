import type { AudioState } from "./offlineAudio";
import type { PersistState } from "./persist";

export interface CacheInfo {
  name: string;
  entries: number;
  /** Bytes según Content-Length o el cuerpo guardado; null si no se pudo medir. */
  bytes: number | null;
}

export interface DiagnosticData {
  version: string;
  buildDate: string;
  now: string;
  appInstalled: boolean;
  audioDone: number;
  audioTotal: number;
  persistent: PersistState | "checking";
  online: boolean;
  userAgent: string;
  caches: CacheInfo[];
  /** Estado del service worker: active / waiting / installing / sin registro. */
  worker: string;
  controlled: boolean;
  storage?: { usage?: number; quota?: number };
}

const mb = (n: number | null | undefined) => (n == null ? "n/d" : `${(n / 1e6).toFixed(1)} MB`);
const yn = (b: boolean) => (b ? "sí" : "no");

/** Texto para pegar a Claude cuando algo falla sin conexión. */
export function formatDiagnostic(d: DiagnosticData): string {
  const lines = [
    "Diagnóstico — Italiano",
    `Versión: ${d.version} · compilada ${d.buildDate}`,
    `Fecha: ${d.now}`,
    "",
    `1. App instalada y controlada por el service worker: ${yn(d.appInstalled)}`,
    `2. Audio descargado: ${d.audioDone}/${d.audioTotal}`,
    `3. Almacenamiento persistente: ${d.persistent === "persistent" ? "sí" : d.persistent === "checking" ? "comprobando" : d.persistent === "unsupported" ? "no soportado" : "no"}`,
    "",
    `navigator.onLine: ${d.online}`,
    `Service worker: ${d.worker} · controla esta página: ${yn(d.controlled)}`,
    `Espacio: usado ${mb(d.storage?.usage)} de ${mb(d.storage?.quota)}`,
    `Cachés (${d.caches.length}):`,
    ...d.caches.map((c) => `  - ${c.name}: ${c.entries} archivos, ${mb(c.bytes)}`),
    "",
    `User agent: ${d.userAgent}`,
  ];
  return lines.join("\n");
}

async function measure(name: string): Promise<CacheInfo> {
  const cache = await caches.open(name);
  const reqs = await cache.keys();
  let bytes: number | null = 0;
  for (const req of reqs) {
    const res = await cache.match(req);
    const len = res?.headers.get("Content-Length");
    if (len && /^\d+$/.test(len)) bytes += Number(len);
    else if (res) bytes += (await res.blob()).size;
  }
  return { name, entries: reqs.length, bytes };
}

export async function collectDiagnostic(audio: AudioState, persistent: PersistState | "checking"): Promise<DiagnosticData> {
  const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
  const names = "caches" in window ? await caches.keys() : [];
  const info: CacheInfo[] = [];
  for (const n of names) info.push(await measure(n).catch(() => ({ name: n, entries: 0, bytes: null })));
  const precache = info.find((c) => c.name.includes("precache"));
  const controlled = Boolean(navigator.serviceWorker?.controller);
  return {
    version: __APP_VERSION__,
    buildDate: __BUILD_DATE__,
    now: new Date().toISOString(),
    appInstalled: Boolean(reg?.active) && controlled && (precache?.entries ?? 0) > 0,
    audioDone: audio.done,
    audioTotal: audio.total,
    persistent,
    online: navigator.onLine,
    userAgent: navigator.userAgent,
    caches: info,
    worker: reg ? (reg.active ? "active" : reg.waiting ? "waiting" : reg.installing ? "installing" : "registrado") : "sin registro",
    controlled,
    storage: await navigator.storage?.estimate?.().catch(() => undefined),
  };
}

/** Copia al portapapeles; devuelve false si el navegador no lo permite (entonces se muestra el texto para copiarlo a mano). */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
