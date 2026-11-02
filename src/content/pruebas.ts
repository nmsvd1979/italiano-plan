import type { Exercise } from "./grammar/types";

// Reserva de ítems de prueba (docs/v2/06 F2 y docs/v2/07 «tests/»): ítems distintos a los de práctica, por unidad.
// Los escribe la persona en `data/g8` y se compilan a `src/content/pruebas.json`. Mientras ese archivo no exista, esta
// reserva está vacía y las pruebas usan solo gramática y lo avisan. El cargador no necesita cambios cuando el archivo aparezca.
//
// Formato de `pruebas.json` (una clave por unidad; una unidad partida puede marcar `part` en cada ítem):
//   { "u04": { "lectura": [3 ítems], "escucha": [3 ítems], "gramatica": [4 ítems] }, … }
// - lectura:   { text, q, options (3), answer, why, part? }   un texto breve en italiano y una pregunta de opción múltiple.
// - escucha:   { it, q?, options (3), answer, why, part? }    `it` se lee en voz alta (no se muestra); `audio?` si hay grabación.
// - gramatica: ejercicios con el formato de las lecciones (choice o fill) + `part?`.

export interface PartTag {
  part?: "A" | "B";
}
export interface PMc extends PartTag {
  q: string;
  options: string[];
  answer: number;
  why: string;
}
export interface PReading extends PMc {
  text: string;
}
export interface PListening extends PMc {
  it: string;
  audio?: string;
}
export type PGrammar = Exercise & PartTag;

export interface UnitPruebas {
  lectura: PReading[];
  escucha: PListening[];
  gramatica: PGrammar[];
}
export type Pruebas = Record<string, UnitPruebas>;

/** El archivo es opcional: `import.meta.glob` no falla si no existe. */
const files = import.meta.glob("./pruebas.json", { import: "default" }) as Record<string, () => Promise<unknown>>;

export const pruebasDisponibles = (): boolean => "./pruebas.json" in files;

export async function loadPruebas(): Promise<Pruebas> {
  const load = files["./pruebas.json"];
  return load ? ((await load()) as Pruebas) : {};
}

/** Hay reserva de lectura, escucha y gramática para la unidad (y la semana A o B, si se pide). */
export function hasReserve(p: Pruebas, unit: string, part?: "A" | "B" | null): boolean {
  const u = p[unit];
  if (!u) return false;
  const mine = <T extends PartTag>(list: T[]) => list.filter((x) => !part || !x.part || x.part === part);
  return mine(u.lectura ?? []).length > 0 && mine(u.escucha ?? []).length > 0 && mine(u.gramatica ?? []).length > 0;
}

/** Los ítems de una unidad para una semana: los sin parte valen para las dos. */
export function forStep<T extends PartTag>(list: T[] | undefined, part?: "A" | "B" | null): T[] {
  return (list ?? []).filter((x) => !part || !x.part || x.part === part);
}

/** Errores de formato del archivo (para la prueba de contenido y para quien lo escribe). Lista vacía = bien. */
export function validatePruebas(p: Pruebas): string[] {
  const errors: string[] = [];
  const mc = (where: string, x: PMc) => {
    if (!x.q || !x.why) errors.push(`${where}: falta q o why`);
    if (!Array.isArray(x.options) || x.options.length !== 3 || new Set(x.options).size !== 3) errors.push(`${where}: debe tener 3 opciones distintas`);
    else if (!Number.isInteger(x.answer) || x.answer < 0 || x.answer > 2) errors.push(`${where}: answer fuera de rango`);
  };
  for (const [unit, u] of Object.entries(p)) {
    (u.lectura ?? []).forEach((x, i) => { mc(`${unit}.lectura[${i}]`, x); if (!x.text) errors.push(`${unit}.lectura[${i}]: falta text`); });
    (u.escucha ?? []).forEach((x, i) => { mc(`${unit}.escucha[${i}]`, { ...x, q: x.q || "¿Qué dijo?" }); if (!x.it) errors.push(`${unit}.escucha[${i}]: falta it`); });
    (u.gramatica ?? []).forEach((x, i) => {
      const where = `${unit}.gramatica[${i}]`;
      if (!x.prompt || !x.why) errors.push(`${where}: falta prompt o why`);
      if (x.type === "fill" && (x.prompt.split("___").length !== 2 || x.answers.length === 0)) errors.push(`${where}: fill necesita un solo ___ y respuestas`);
      if (x.type === "choice" && (x.options.length < 2 || x.answer < 0 || x.answer >= x.options.length)) errors.push(`${where}: choice mal formado`);
    });
  }
  return errors;
}
