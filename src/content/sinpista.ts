import data from "./sinpista.json";

/** Práctica sin pista (G5): 12 ejercicios por unidad, sin ayudas en pantalla; la explicación solo aparece al corregir. */
export type SinPistaBase = { id: string; part?: "A" | "B"; why: string };
export type SpOrder = SinPistaBase & { type: "order"; prompt: string; answers: string[]; extra: string[] };
export type SpTranslate = SinPistaBase & { type: "translate"; prompt: string; answers: string[] };
export type SpFix = SinPistaBase & { type: "fix"; prompt: string; answers: string[] };
export type SpTransform = SinPistaBase & { type: "transform"; prompt: string; answers: string[] };
export type SpDialog = SinPistaBase & { type: "dialog"; lines: string[]; options: string[]; answer: number };
export type SpListen = SinPistaBase & { type: "listen"; prompt: string; options: string[]; answer: number };
export type SinPista = SpOrder | SpTranslate | SpFix | SpTransform | SpDialog | SpListen;

const ALL = data as unknown as Record<string, SinPista[]>;

export function getSinPista(unit: string, part?: "A" | "B"): SinPista[] {
  const list = ALL[unit] ?? [];
  return part ? list.filter((e) => e.part === part) : list;
}

export const SINPISTA_UNITS = Object.keys(ALL);

/** Compara ignorando mayúsculas, signos y comillas; mantiene las tildes (a/à, e/è cambian el significado). */
export const normalize = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[«»"“”.,;:!?¿¡()–—-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Corrige un ejercicio de escritura (traducir, corregir, transformar) o de ordenar (pasar las palabras unidas con espacio). */
export function checkText(ex: SpOrder | SpTranslate | SpFix | SpTransform, input: string): boolean {
  const typed = normalize(input);
  return typed !== "" && ex.answers.some((a) => normalize(a) === typed);
}

/** Palabras para armar la frase (sin signos ni mayúsculas; las de la primera respuesta + las sobrantes), en un orden estable que nunca coincide con la solución. */
export function orderBank(ex: SpOrder): string[] {
  const words = [...normalize(ex.answers[0]).split(" "), ...ex.extra.map(normalize)];
  let seed = 0;
  for (const c of ex.id) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  for (let attempt = 0; attempt < 20; attempt++) {
    const out = [...words];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    if (out.join(" ") !== normalize(ex.answers[0])) return out;
  }
  return [...words].reverse();
}
