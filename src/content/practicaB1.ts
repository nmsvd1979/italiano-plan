import lecturasJson from "./lecturas-b1.json";
import escuchaJson from "./escucha-b1.json";
import type { Lectura, LecturaQuestion } from "./lectura";

// Módulo opcional «Práctica B1» (docs/v2/plan-b1/09): textos más largos que los del curso, a la medida de las pruebas de
// lectura (800–1.000 palabras en tres textos) y de escucha (600–800 palabras en tres textos) del CILS B1. Se carga al
// abrir la pantalla para no pesar en el precache.

export interface EscuchaLine { who: string; it: string; es: string }
export interface Escucha {
  /** Tipo de texto (llamada, aviso, diálogo…), en español. */
  tipo: string;
  titulo: string;
  lines: EscuchaLine[];
  /** 3 de opción múltiple y 1 breve, como las lecturas. */
  preguntas: LecturaQuestion[];
}

export const B1_LECTURAS = lecturasJson as unknown as Record<string, Lectura>;
export const B1_ESCUCHAS = escuchaJson as unknown as Record<string, Escucha>;

export type B1Kind = "lectura" | "escucha";
export interface B1Item { id: string; kind: B1Kind; tipo: string; titulo: string; preguntas: number }

/** Todas las actividades del módulo, lecturas primero. */
export function b1Items(): B1Item[] {
  return [
    ...Object.entries(B1_LECTURAS).map(([id, l]): B1Item => ({ id, kind: "lectura", tipo: l.tipo, titulo: l.titulo, preguntas: l.preguntas.length })),
    ...Object.entries(B1_ESCUCHAS).map(([id, e]): B1Item => ({ id, kind: "escucha", tipo: e.tipo, titulo: e.titulo, preguntas: e.preguntas.length })),
  ];
}

export const wordsInEscucha = (e: Escucha): number => e.lines.reduce((n, l) => n + (l.it.match(/[A-Za-zÀ-ÿ]+'?/g)?.length ?? 0), 0);
