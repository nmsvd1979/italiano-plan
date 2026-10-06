import { rng, shuffle } from "./review";

export interface Trial {
  /** Palabra que se reproduce. */
  target: string;
  /** Las dos opciones, en orden aleatorio. */
  options: [string, string];
  /** Archivo de audio (una voz entre las disponibles). */
  file: string;
}

/**
 * Pares mínimos: se recorren los pares barajados (repitiendo si hace falta) y en cada intento
 * suena una de las dos palabras con una de las voces disponibles. Misma semilla = mismos intentos.
 */
export function buildTrials(
  pairs: [string, string][],
  filesOf: (word: string) => string[],
  size: number,
  seed: string,
): Trial[] {
  if (!pairs.some((pair) => pair.some((w) => filesOf(w).length > 0))) return [];
  const rand = rng(seed);
  const trials: Trial[] = [];
  let order: [string, string][] = [];
  while (trials.length < size) {
    if (order.length === 0) order = shuffle(pairs, rand);
    const pair = order.shift() as [string, string];
    const target = pair[Math.floor(rand() * 2)];
    const files = filesOf(target);
    if (files.length === 0) continue;
    const options = shuffle(pair, rand) as [string, string];
    trials.push({ target, options, file: files[Math.floor(rand() * files.length)] });
  }
  return trials;
}
