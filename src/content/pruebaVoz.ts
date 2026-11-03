import frases from "../../scripts/tts/frases-prueba.json";

export interface FrasePrueba {
  id: string;
  it: string;
  cubre: string;
}

/** Las 10 frases de la prueba A/B de voz (docs/v2/03 C1). Las lee también scripts/tts/compare.mjs. */
export const FRASES_PRUEBA: FrasePrueba[] = frases;
