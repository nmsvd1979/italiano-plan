import data from "./lectura.json";

/** Texto graduado de lectura (G4): uno por semana del curso, clave = id del paso (`u02#A`, `u07#B`, `u21`…). */
export type LecturaQuestion =
  | { kind: "mc"; q: string; options: string[]; answer: number; why: string }
  | { kind: "short"; q: string; accepted: string[]; why: string };

export interface Lectura {
  /** Tipo de texto (aviso, receta, mail…), en español. */
  tipo: string;
  titulo: string;
  /** Párrafos en italiano (pueden tener varias líneas separadas por \n). */
  it: string[];
  /** Traducción al español, mismos párrafos. */
  es: string[];
  claves: { it: string; es: string }[];
  /** 3 de opción múltiple + 1 de respuesta breve. */
  preguntas: LecturaQuestion[];
  palabras: number;
}

const LECTURAS = data as unknown as Record<string, Lectura>;

export const LECTURA_IDS = Object.keys(LECTURAS);

export function getLectura(stepId: string): Lectura | undefined {
  return LECTURAS[stepId];
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9,\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Corrige la respuesta breve: acepta si lo escrito contiene alguna de las respuestas aceptadas (sin tildes ni signos). */
export function checkShortAnswer(q: Extract<LecturaQuestion, { kind: "short" }>, input: string): boolean {
  const typed = norm(input);
  if (!typed) return false;
  return q.accepted.some((a) => {
    const n = norm(a);
    return typed === n || typed.includes(n);
  });
}
