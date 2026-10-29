import type { SpOrder, SpTransform, SpTranslate, SpFix } from "./sinpista";

// Corrección de la práctica sin pista. Va aparte de sinpista.ts para que las pantallas puedan usarla sin cargar
// los ejercicios (sinpista.json se importa de forma diferida).

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
