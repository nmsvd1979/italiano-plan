// Lo que comparten extraer.mjs y generar.mjs (y las pruebas): normalización del texto, id del clip y reglas de exclusión.
// src/ui/ttsId.ts repite la normalización y el hash para el navegador; una prueba comprueba que dan lo mismo.

import { createHash } from "node:crypto";

/** Texto tal como se busca: sin asteriscos de énfasis, espacios y saltos de línea colapsados, sin espacios en los bordes. */
export const normalizar = (texto) => texto.replace(/\*/g, "").replace(/\s+/g, " ").trim();

export const sha1 = (texto) => createHash("sha1").update(normalizar(texto)).digest("hex");

/** Id del clip: primeros 12 caracteres hex del sha1 del texto normalizado. */
export const idDe = (texto) => sha1(texto).slice(0, 12);

export const VOZ = "it_IT-serena-high";
export const LICENCIA = "CC BY 4.0";

const sinPuntuacion = (t) =>
  normalizar(t).toLowerCase().replace(/[^\p{L}\p{N}']+/gu, " ").trim();

/**
 * Devuelve el motivo si el texto contiene alguna de las frases sin confirmar de docs/dudas-italiano.md
 * (comparación sin mayúsculas ni puntuación, por palabras completas); si no, null.
 * `exclusiones`: [{ frase, motivo }] (scripts/tts/exclusiones.json).
 */
export function motivoDeExclusion(texto, exclusiones) {
  const t = ` ${sinPuntuacion(texto)} `;
  for (const e of exclusiones) if (t.includes(` ${sinPuntuacion(e.frase)} `)) return e.motivo;
  return null;
}
