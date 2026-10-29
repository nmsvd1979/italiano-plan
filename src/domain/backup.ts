import { KEYS, KEYS_V2, SRS_KEY, type KV } from "./storage";

// Copia de seguridad del progreso: un JSON con todas las claves italianPlan.* tal como están guardadas.
// Versión 2: incluye las claves italianPlan.v2.*. Las copias de versión 1 (solo claves antiguas) se siguen
// importando: no hay nada que convertir porque las claves antiguas no cambian, solo se sellan como v2.

/** Almacenamiento que además se puede recorrer (window.localStorage lo cumple). */
export interface EnumerableKV extends KV {
  readonly length: number;
  key(index: number): string | null;
}

export const BACKUP_VERSION = 2;
/** La copia más vieja que todavía se importa. */
export const MIN_BACKUP_VERSION = 1;
export const BACKUP_APP = "italiano-plan";
export const PREFIX = "italianPlan.";
/** Cuándo se hizo la última copia en este dispositivo. No viaja dentro de la copia. */
export const LAST_BACKUP_KEY = `${PREFIX}lastBackup`;
export const BACKUP_STALE_DAYS = 14;

export interface Backup {
  app: typeof BACKUP_APP;
  version: number;
  /** Fecha y hora de la copia, ISO 8601. */
  exportedAt: string;
  /** Clave completa → valor tal como estaba guardado (texto). */
  data: Record<string, string>;
}

export type ParseResult =
  | { ok: true; backup: Backup; summary: BackupSummary; ignored: string[] }
  | { ok: false; error: string };

export interface BackupSummary {
  exportedAt: string;
  startDate: string | null;
  startUnit: number | null;
  /** Pasos marcados como hechos (suma de todos los días). */
  marks: number;
  /** Días con algo marcado. */
  days: number;
  reviewItems: number;
  writingTexts: number;
  phaseTests: number;
  /** Tarjetas del repaso espaciado. */
  srsCards: number;
  keys: number;
}

type Shape = "object" | "array";

/** Claves cuyo valor es JSON, con su forma esperada. */
const JSON_KEYS: Record<string, Shape> = {
  [KEYS.completions]: "object",
  [KEYS.settings]: "object",
  [KEYS.review]: "object",
  [KEYS.shadowing]: "object",
  [KEYS.phaseTests]: "object",
  [KEYS.skipped]: "array",
  [KEYS.canDo]: "object",
  [KEYS.writing]: "object",
  [KEYS_V2.progress]: "object",
  [KEYS_V2.seedApplied]: "object",
  [KEYS_V2.miniTests]: "object",
  [KEYS_V2.timing]: "object",
  [SRS_KEY]: "object",
};

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** Devuelve un texto de error si el valor no sirve para esa clave, o null si está bien. */
function checkValue(key: string, value: string): string | null {
  if (key in JSON_KEYS) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(value);
    } catch {
      return `«${key}» no es JSON válido`;
    }
    const isArray = Array.isArray(parsed);
    const isObject = typeof parsed === "object" && parsed !== null && !isArray;
    if (JSON_KEYS[key] === "array" ? !isArray : !isObject) return `«${key}» tiene un formato inesperado`;
    if (key === SRS_KEY) {
      const srs = parsed as { version?: unknown; cards?: unknown };
      if (srs.version !== 1 || typeof srs.cards !== "object" || srs.cards === null || Array.isArray(srs.cards)) {
        return `«${key}» tiene un formato inesperado`;
      }
    }
    return null;
  }
  if (key === KEYS.startDate) return ISO_DAY.test(value) && !Number.isNaN(Date.parse(value)) ? null : `«${key}» no es una fecha`;
  if (key === KEYS.startUnit) return /^\d+$/.test(value) && Number(value) >= 1 ? null : `«${key}» no es un número válido`;
  if (key === KEYS.lastNotified) return ISO_DAY.test(value) ? null : `«${key}» no es una fecha`;
  return null;
}

const isKnownKey = (key: string): boolean =>
  key in JSON_KEYS || key === KEYS.startDate || key === KEYS.startUnit || key === KEYS.lastNotified;

/** Claves italianPlan.* que viajan en la copia (todas menos la marca de última copia). */
export function backupKeys(store: EnumerableKV): string[] {
  const keys: string[] = [];
  for (let i = 0; i < store.length; i++) {
    const key = store.key(i);
    if (key && key.startsWith(PREFIX) && key !== LAST_BACKUP_KEY) keys.push(key);
  }
  return keys.sort();
}

export function buildBackup(store: EnumerableKV, now: Date = new Date()): Backup {
  const data: Record<string, string> = {};
  for (const key of backupKeys(store)) {
    const value = store.getItem(key);
    if (value !== null) data[key] = value;
  }
  return { app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: now.toISOString(), data };
}

export const serializeBackup = (backup: Backup): string => JSON.stringify(backup, null, 2);

export function backupFileName(now: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `italiano-plan-copia-${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}.json`;
}

const countKeys = (value: unknown): number =>
  typeof value === "object" && value !== null ? Object.keys(value).length : 0;

export function summarizeBackup(backup: Backup): BackupSummary {
  const json = (key: string): unknown => (key in backup.data ? JSON.parse(backup.data[key]) : null);
  const completions = (json(KEYS.completions) ?? {}) as Record<string, Record<string, boolean>>;
  const tests = (json(KEYS.phaseTests) ?? {}) as Record<string, unknown[]>;
  return {
    exportedAt: backup.exportedAt,
    startDate: backup.data[KEYS.startDate] ?? null,
    startUnit: KEYS.startUnit in backup.data ? Number(backup.data[KEYS.startUnit]) : null,
    marks: Object.values(completions).reduce((n, day) => n + countKeys(day), 0),
    days: countKeys(completions),
    reviewItems: countKeys(json(KEYS.review)),
    writingTexts: countKeys(json(KEYS.writing)),
    phaseTests: Object.values(tests).reduce((n, list) => n + (Array.isArray(list) ? list.length : 0), 0),
    srsCards: countKeys((json(SRS_KEY) as { cards?: unknown } | null)?.cards),
    keys: Object.keys(backup.data).length,
  };
}

/** Lee y valida el texto de un archivo de copia. No toca el almacenamiento. */
export function parseBackup(text: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: "El archivo está dañado o no es una copia de la app (no se puede leer como JSON)." };
  }
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { ok: false, error: "El archivo no tiene el formato de una copia de la app." };
  }
  const file = raw as Record<string, unknown>;
  if (file.app !== BACKUP_APP) return { ok: false, error: "Este archivo no es una copia de Italiano Plan." };
  if (typeof file.version !== "number" || !Number.isInteger(file.version)) {
    return { ok: false, error: "El archivo no indica la versión de la copia." };
  }
  if (file.version < MIN_BACKUP_VERSION || file.version > BACKUP_VERSION) {
    return {
      ok: false,
      error: file.version > BACKUP_VERSION
        ? `La copia es de una versión más nueva (${file.version}) que la que entiende esta app (${BACKUP_VERSION}). Actualiza la app e inténtalo de nuevo.`
        : `La copia es de una versión que esta app ya no reconoce (${file.version}).`,
    };
  }
  if (typeof file.exportedAt !== "string" || Number.isNaN(Date.parse(file.exportedAt))) {
    return { ok: false, error: "La copia no tiene una fecha válida." };
  }
  const data = file.data;
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return { ok: false, error: "La copia no trae datos." };
  }

  const clean: Record<string, string> = {};
  const ignored: string[] = [];
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (!key.startsWith(PREFIX) || key === LAST_BACKUP_KEY) {
      return { ok: false, error: `La copia trae una clave que no es de la app: «${key}».` };
    }
    if (typeof value !== "string") return { ok: false, error: `El valor de «${key}» no es texto.` };
    const problem = checkValue(key, value);
    if (problem) return { ok: false, error: `Datos dañados: ${problem}.` };
    // Una clave que esta versión no conoce no se restaura (no se puede validar); se avisa en el resumen.
    if (isKnownKey(key)) clean[key] = value;
    else ignored.push(key);
  }
  if (Object.keys(clean).length === 0) return { ok: false, error: "La copia no contiene progreso." };

  const backup: Backup = { app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: file.exportedAt, data: clean };
  return { ok: true, backup, summary: summarizeBackup(backup), ignored };
}

/**
 * Reemplaza el progreso guardado por el de la copia: borra las claves italianPlan.* actuales (salvo la marca
 * de última copia) y escribe las de la copia. Si algo falla a mitad (por ejemplo, sin espacio), devuelve el
 * almacenamiento a como estaba y lanza el error.
 */
export function restoreBackup(backup: Backup, store: EnumerableKV): void {
  const previous: Record<string, string> = {};
  for (const key of backupKeys(store)) {
    const value = store.getItem(key);
    if (value !== null) previous[key] = value;
  }
  try {
    for (const key of Object.keys(previous)) store.removeItem(key);
    for (const [key, value] of Object.entries(backup.data)) store.setItem(key, value);
    store.setItem(LAST_BACKUP_KEY, backup.exportedAt);
  } catch (err) {
    for (const key of backupKeys(store)) store.removeItem(key);
    for (const [key, value] of Object.entries(previous)) {
      try { store.setItem(key, value); } catch { /* ya no hay más que hacer */ }
    }
    throw err;
  }
}

export function markBackupDone(store: KV, now: Date = new Date()): void {
  store.setItem(LAST_BACKUP_KEY, now.toISOString());
}

export interface BackupAdvice {
  /** Hay que avisar: más de 14 días sin copia. */
  due: boolean;
  /** Días desde la última copia (o desde que empezaste, si nunca hiciste una). null si no hay con qué medir. */
  days: number | null;
  /** Nunca se hizo una copia en este dispositivo. */
  never: boolean;
}

/**
 * Avisa solo si hay progreso que perder. La referencia es la última copia; si nunca hubo una,
 * la fecha de inicio del plan.
 */
export function backupAdvice(store: KV, now: Date = new Date()): BackupAdvice {
  const hasProgress = (() => {
    try {
      const raw = store.getItem(KEYS.completions);
      return raw ? Object.keys(JSON.parse(raw) as object).length > 0 : false;
    } catch {
      return false;
    }
  })();
  const last = store.getItem(LAST_BACKUP_KEY);
  const never = !last || Number.isNaN(Date.parse(last));
  const since = never ? store.getItem(KEYS.startDate) : last;
  if (!hasProgress || !since || Number.isNaN(Date.parse(since))) return { due: false, days: null, never };
  const days = Math.floor((now.getTime() - Date.parse(since)) / 86_400_000);
  return { due: days > BACKUP_STALE_DAYS, days, never };
}

/** Qué ofrece el navegador para entregar el archivo; se inyecta para poder probarlo. */
export interface DeliverEnv {
  canShare?: (data: { files: File[] }) => boolean;
  share?: (data: { files: File[]; title?: string }) => Promise<void>;
  download: (file: File) => void;
}

export type DeliverResult = "shared" | "downloaded" | "cancelled";

/**
 * Entrega la copia: con la hoja de compartir del sistema (archivo adjunto) si el navegador puede,
 * y si no, como descarga. Si la persona cierra la hoja de compartir, no se cuenta como copia hecha.
 */
export async function deliverBackup(file: File, env: DeliverEnv): Promise<DeliverResult> {
  if (env.share && env.canShare?.({ files: [file] })) {
    try {
      await env.share({ files: [file], title: "Copia de Italiano Plan" });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
      // Cualquier otro error (permiso, sin gesto…): se intenta la descarga.
    }
  }
  env.download(file);
  return "downloaded";
}
