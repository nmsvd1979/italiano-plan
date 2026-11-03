// Prueba A/B de voz (docs/v2/03 C1): lógica pura, sin React, para poder probarla.

/** c1 y c2: los dos candidatos neuronales (archivos -x y -y); sistema: speak(). */
export type Voz = "c1" | "c2" | "sistema";

export const VOCES: Voz[] = ["c1", "c2", "sistema"];
export const ETIQUETAS = ["A", "B", "C"] as const;

/** Por cada frase, qué voz suena detrás de A, B y C. */
export type Orden = Record<string, [Voz, Voz, Voz]>;

/** Mezcla Fisher–Yates; `rng` devuelve un número en [0, 1). */
export function mezclar<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function aleatorizar(ids: readonly string[], rng: () => number = Math.random): Orden {
  const orden: Orden = {};
  for (const id of ids) orden[id] = mezclar(VOCES, rng) as [Voz, Voz, Voz];
  return orden;
}

/** Votos por frase: la etiqueta (índice 0–2) que el usuario marcó. */
export type Votos = Record<string, number>;

export function contarVotos(orden: Orden, votos: Votos): Record<Voz, number> {
  const total: Record<Voz, number> = { c1: 0, c2: 0, sistema: 0 };
  for (const [id, etiqueta] of Object.entries(votos)) {
    const voz = orden[id]?.[etiqueta];
    if (voz) total[voz]++;
  }
  return total;
}

export const CLAVE_RESULTADO = "italianPlan.v2.pruebaVoz";

export interface Resultado {
  fecha: string;
  total: Record<Voz, number>;
  /** Voz elegida en cada frase. */
  porFrase: Record<string, Voz>;
}

export function armarResultado(orden: Orden, votos: Votos, fecha: string): Resultado {
  const porFrase: Record<string, Voz> = {};
  for (const [id, etiqueta] of Object.entries(votos)) {
    const voz = orden[id]?.[etiqueta];
    if (voz) porFrase[id] = voz;
  }
  return { fecha, total: contarVotos(orden, votos), porFrase };
}
