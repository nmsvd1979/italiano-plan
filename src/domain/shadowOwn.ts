import { rng, shuffle } from "./review";

// Shadowing propio, sin conexión (docs/v2/05 E5): con los diálogos y textos de la app, cada línea se hace en cuatro pasadas.

export interface ShadowStage {
  id: "listen" | "read" | "slow" | "normal";
  title: string;
  help: string;
  /** Velocidad a la que suena el modelo (undefined = normal). */
  slow: boolean;
  /** La línea se ve en pantalla. */
  showText: boolean;
  /** Tú hablas en este paso (el modelo suena antes, tú repites después). */
  speak: boolean;
}

/** Oír la línea → leerla mientras suena → repetirla a 0,75 → repetirla a velocidad normal. */
export const STAGES: ShadowStage[] = [
  { id: "listen", title: "Escucha", help: "Solo escucha la línea, sin leerla.", slow: false, showText: false, speak: false },
  { id: "read", title: "Léela mientras suena", help: "Ahora léela en pantalla mientras suena.", slow: false, showText: true, speak: false },
  { id: "slow", title: "Repítela despacio (0,75)", help: "Escucha a velocidad lenta y repítela en voz alta, justo después, imitando el ritmo.", slow: true, showText: true, speak: true },
  { id: "normal", title: "Repítela a velocidad normal", help: "Escucha a velocidad normal y repítela en voz alta, justo después.", slow: false, showText: true, speak: true },
];

export const SHADOW_LINES = 6;

/** Frases de un texto (por punto, signo de cierre o salto de línea), sin espacios sobrantes. */
export function sentencesOf(paragraphs: readonly string[]): string[] {
  return paragraphs
    .flatMap((p) => p.split(/\n+/))
    .flatMap((line) => line.match(/[^.!?…]+[.!?…]+["»”]?|[^.!?…]+$/g) ?? [])
    .map((s) => s.replace(/^[\s—–-]+/, "").replace(/\s+/g, " ").trim())
    .filter((s) => s.length > 0);
}

const wordCount = (s: string): number => (s.match(/[A-Za-zÀ-ÿ']+/g) ?? []).length;

/** Una línea sirve para el shadowing si es corta (3 a 12 palabras): más larga no se repite de memoria. */
export const shadowable = (s: string): boolean => wordCount(s) >= 3 && wordCount(s) <= 12;

/**
 * Las líneas de la sesión: mitad del diálogo y mitad del texto de la semana (si no hay texto, todas del diálogo y viceversa),
 * sin repetir, en un orden estable por semilla. Todo viene del contenido de la app; no se inventa nada.
 */
export function pickLines(dialogue: readonly string[], text: readonly string[], size: number, seed: string): string[] {
  const rand = rng(seed);
  const clean = (list: readonly string[]) => shuffle([...new Set(list.filter(shadowable))], rand);
  const d = clean(dialogue);
  const t = clean(text);
  const nt = Math.min(t.length, size - Math.min(d.length, Math.ceil(size / 2)));
  const nd = Math.min(d.length, size - nt);
  return shuffle([...d.slice(0, nd), ...t.slice(0, nt)], rand);
}
