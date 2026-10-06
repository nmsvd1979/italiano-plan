// Formato de las lecciones de gramática.
// Texto con formato mínimo: **negrita** y *cursiva* (las palabras en italiano van en cursiva).

export type Block =
  | { kind: "p"; text: string }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "list"; items: string[] };

export interface Choice {
  type: "choice";
  prompt: string;
  options: string[];
  /** Índice de la opción correcta. */
  answer: number;
  /** Explicación de una línea que se muestra al corregir. */
  why: string;
}

export interface Fill {
  type: "fill";
  /** Debe contener exactamente un "___". */
  prompt: string;
  /** Respuestas válidas (con tildes correctas). */
  answers: string[];
  why: string;
}

export type Exercise = Choice | Fill;

export interface Lesson {
  /** Id de la unidad del currículo (ej. "u04"). */
  unit: string;
  title: string;
  situation: string;
  rule: Block[];
  /** Recuadro "Ojo, en español…": el error típico de quien habla español. */
  transfer: string;
  examples: { it: string; es: string }[];
  /** Ítems de comprensión: el significado depende de notar la forma. Van antes de producir. */
  notice: Choice[];
  exercises: Exercise[];
}

export function exerciseId(unit: string, index: number): string {
  return `${unit}-e${String(index).padStart(2, "0")}`;
}

/** "u04" → 4 */
export function unitNumber(unit: string): number {
  return Number(unit.slice(1));
}

/** "u04-e07" → "u04" */
export function unitOfExercise(id: string): string {
  return id.slice(0, id.indexOf("-"));
}
