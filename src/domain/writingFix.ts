import { diffInDays, parseISODate, toISODate } from "./dates";
import { KEYS_V2, type KV } from "./storage";

// Capa 3 de la escritura (docs/v2/05 E4): el texto original y la versión corregida con Claude se guardan por unidad,
// y a los 3 días la app propone volver a escribirlo desde el español sin mirar la versión corregida.

export const REWRITE_AFTER_DAYS = 3;

export interface FixEntry {
  original: string;
  corrected: string;
  /** Día (AAAA-MM-DD) en que se pegó la versión corregida. */
  savedAt: string;
  /** La reescritura hecha a los 3 días. */
  rewrite?: { text: string; at: string };
}

export type Fixes = Record<string, FixEntry>;

export function loadFixes(store: KV): Fixes {
  try {
    const raw = store.getItem(KEYS_V2.writingFix);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed as Record<string, FixEntry>).filter(([, v]) => v && typeof v.original === "string" && typeof v.corrected === "string" && typeof v.savedAt === "string"),
    );
  } catch {
    return {};
  }
}

const save = (fixes: Fixes, store: KV): void => store.setItem(KEYS_V2.writingFix, JSON.stringify(fixes));

/** Guarda original y versión corregida de una unidad (si ya había una, la reemplaza y se vuelve a proponer la reescritura). */
export function saveFix(unit: string, original: string, corrected: string, today: Date, store: KV): void {
  const fixes = loadFixes(store);
  fixes[unit] = { original, corrected, savedAt: toISODate(today) };
  save(fixes, store);
}

export function saveRewrite(unit: string, text: string, today: Date, store: KV): void {
  const fixes = loadFixes(store);
  if (!fixes[unit]) return;
  fixes[unit] = { ...fixes[unit], rewrite: { text, at: toISODate(today) } };
  save(fixes, store);
}

/** Unidades cuya reescritura ya toca (≥ 3 días desde que pegaste la versión corregida y aún no la hiciste), la más antigua primero. */
export function rewritesDue(fixes: Fixes, today: Date): string[] {
  return Object.entries(fixes)
    .filter(([, f]) => !f.rewrite && diffInDays(today, parseISODate(f.savedAt)) >= REWRITE_AFTER_DAYS)
    .sort((a, b) => a[1].savedAt.localeCompare(b[1].savedAt))
    .map(([unit]) => unit);
}

/** Copia el texto al portapapeles; si el navegador no deja, prueba con una selección temporal. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      document.body.removeChild(area);
    }
  }
}
