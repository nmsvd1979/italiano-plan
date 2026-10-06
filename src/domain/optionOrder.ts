import { rng, shuffle } from "./review";

/** Orden en que se muestran las opciones (índices originales). Misma semilla = mismo orden. */
export function optionOrder(count: number, seed: string): number[] {
  return shuffle(Array.from({ length: count }, (_, i) => i), rng(seed));
}
