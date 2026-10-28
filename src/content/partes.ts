// Reparto de los ítems de las 7 unidades partidas entre su semana A y su semana B (docs/v2/13 §1.2 y §4, carril G2).
// Los números son índices dentro de cada lista del contenido (examples, notice, exercises, vocab, dictation).
// Criterio: cada parte lleva lo que la tabla de §2 le asigna; algunos ítems de la otra parte se repiten a propósito
// como repaso. No cambia ningún texto en italiano. Si se agregan ítems al contenido, se asignan aquí (lo vigila partes.test.ts).
import type { UnitParts } from "./curriculum";

export const PARTS: Record<string, UnitParts> = {
  // A: artículos, plurales regulares, avere, c'è / ci sono. B: piacere, plurales especiales (y lugar, al insertarse).
  u02: {
    A: { examples: [0, 1, 2, 4, 5], notice: [1, 2], exercises: [0, 1, 2, 3, 4, 5, 8, 9, 10, 11, 12, 13, 16, 17, 18, 19, 24], vocab: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], dictation: [0, 1, 2, 4, 5] },
    B: { examples: [1, 3], notice: [0], exercises: [6, 7, 14, 15, 16, 20, 21, 22, 23, 25], vocab: [11, 12, 13, 14, 15, 16, 17, 18, 19], dictation: [0, 3] },
  },
  // A: números hasta 100 y la hora. B: fechas, días y meses, precios.
  u03: {
    A: { examples: [0, 1, 5, 7], notice: [0], exercises: [2, 3, 4, 5, 6, 7, 8, 9, 16, 19], vocab: [0, 1, 2, 3, 4, 5, 6, 7, 15, 16, 17], dictation: [0, 1, 4, 5] },
    B: { examples: [2, 3, 4, 6], notice: [1, 2], exercises: [0, 1, 10, 11, 12, 13, 14, 15, 17, 18, 20, 21, 22], vocab: [8, 9, 10, 11, 12, 13, 14, 18, 19], dictation: [0, 2, 3] },
  },
  // A: a / in / da, andare–venire–uscire, preposiciones articuladas. B: falsos amigos, direcciones.
  u05: {
    A: { examples: [0, 1, 2, 3, 5], notice: [0, 2, 3], exercises: [0, 1, 2, 3, 4, 5, 6, 7, 9, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24, 25, 26], vocab: [0, 1, 2, 3, 4, 5, 6, 15, 16, 17, 18], dictation: [0, 1, 2, 3, 4] },
    B: { examples: [3, 4], notice: [1], exercises: [5, 6, 8, 10, 11, 17, 19, 22], vocab: [7, 8, 9, 10, 11, 12, 13, 14, 19], dictation: [2, 3, 5] },
  },
  // A: posesivos y questo / quello. B: adjetivos, colores, tallas, ropa.
  u06: {
    A: { examples: [0, 1, 2, 3, 4, 5, 7], notice: [0, 1, 2], exercises: [0, 1, 2, 3, 4, 5, 6, 7, 8, 12, 14, 16, 17, 23], vocab: [8, 9, 10, 11, 12, 13, 14, 15, 16], dictation: [0, 1, 2, 5] },
    B: { examples: [3, 5, 6], notice: [0], exercises: [9, 10, 11, 13, 15, 18, 19, 20, 21, 22], vocab: [0, 1, 2, 3, 4, 5, 6, 7, 17, 18, 19], dictation: [1, 3, 4] },
  },
  // A: reflexivos y rutina. B: stare + gerundio, essere / stare, irregulares frecuentes.
  u07: {
    A: { examples: [0, 1, 4], notice: [0, 2], exercises: [0, 1, 2, 3, 10, 11, 12, 13, 14, 18], vocab: [0, 1, 2, 3, 4, 5, 6, 7, 12, 13, 14, 15, 16, 17], dictation: [0, 1, 3] },
    B: { examples: [2, 3, 5], notice: [1], exercises: [4, 5, 6, 7, 8, 9, 15, 16, 17, 19, 20, 21, 22, 23, 24, 25, 26], vocab: [8, 9, 10, 11, 18, 19], dictation: [2, 4, 5] },
  },
  // A: ci y ne. B: imperativo tu / Lei y direcciones.
  u14: {
    A: { examples: [1, 2], notice: [1, 2], exercises: [5, 6, 7, 15, 16, 17], vocab: [4, 5, 6, 10, 11], dictation: [1, 2] },
    B: { examples: [0, 3, 4, 5], notice: [0], exercises: [0, 1, 2, 3, 4, 8, 9, 10, 11, 12, 13, 14, 18, 19], vocab: [0, 1, 2, 3, 7, 8, 9, 12, 13, 14, 15, 16, 17, 18, 19], dictation: [0, 3, 4, 5] },
  },
  // A: futuro simple. B: condizionale de cortesía y consejo, se + presente, invitar.
  u15: {
    A: { examples: [0, 1, 2], notice: [0, 1], exercises: [0, 1, 2, 3, 4, 7, 10, 11, 12, 13, 14, 18, 22, 23], vocab: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 17, 18, 19], dictation: [0, 1, 5] },
    B: { examples: [3, 4, 5], notice: [2], exercises: [5, 6, 8, 9, 15, 16, 17, 19, 20, 21, 24, 25], vocab: [10, 11, 12, 13, 14, 15, 16], dictation: [2, 3, 4] },
  },
};
