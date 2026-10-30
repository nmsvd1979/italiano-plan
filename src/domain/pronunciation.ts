import { rng, shuffle } from "./review";

export interface Trial {
  /** Palabra que se reproduce. */
  target: string;
  /** Las dos opciones, en orden aleatorio. */
  options: [string, string];
  /** Archivo de audio (una voz entre las disponibles). */
  file: string;
}

/** Voz (quien grabó) de un archivo de Lingua Libre: `cane--xana000.mp3` → `xana000`. */
export const speakerOf = (file: string): string => file.replace(/\.[a-z0-9]+$/i, "").split("--")[1] ?? file;

/** Lo más que crece una serie de intentos cuando se repite un contraste fallado. */
export const MAX_TRIALS = 10;

/**
 * Pares mínimos: se recorren los pares barajados (repitiendo si hace falta) y en cada intento
 * suena una de las dos palabras. Se prefiere la voz que menos ha sonado, para que la serie use varias voces
 * (docs/v2/05 E2: al menos 3 cuando hay). Misma semilla = mismos intentos.
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
  const used = new Map<string, number>();
  let order: [string, string][] = [];
  while (trials.length < size) {
    if (order.length === 0) order = shuffle(pairs, rand);
    const pair = order.shift() as [string, string];
    const choices = pair.flatMap((word) => filesOf(word).map((file) => ({ word, file, n: used.get(speakerOf(file)) ?? 0 })));
    if (choices.length === 0) continue;
    const least = Math.min(...choices.map((c) => c.n));
    const best = choices.filter((c) => c.n === least);
    const pick = best[Math.floor(rand() * best.length)];
    used.set(speakerOf(pick.file), least + 1);
    trials.push({ target: pick.word, options: shuffle(pair, rand) as [string, string], file: pick.file });
  }
  return trials;
}

/**
 * Si fallas un contraste, el siguiente intento vuelve sobre ese mismo par: suena la palabra que fallaste (o la otra si no
 * tiene audio) con una voz distinta a la que acabas de oír, si hay. Devuelve null si el par no tiene audio.
 */
export function retryTrial(failed: Trial, pairs: [string, string][], filesOf: (word: string) => string[], seed: string): Trial | null {
  const pair = pairs.find((p) => p.includes(failed.target));
  if (!pair) return null;
  const rand = rng(seed);
  const words = [failed.target, ...pair.filter((w) => w !== failed.target)];
  const choices = words.flatMap((word, rank) => filesOf(word).map((file) => ({ word, file, rank, same: file === failed.file })));
  if (choices.length === 0) return null;
  // Misma palabra con otra voz; si no hay, la otra palabra; en último caso, el mismo audio.
  const best = [...choices].sort((a, b) => Number(a.same) - Number(b.same) || a.rank - b.rank);
  const first = best[0];
  const ties = best.filter((c) => c.same === first.same && c.rank === first.rank);
  const pick = ties[Math.floor(rand() * ties.length)];
  return { target: pick.word, options: shuffle(pair, rand) as [string, string], file: pick.file };
}
