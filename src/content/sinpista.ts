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

export { normalize, checkText, orderBank } from "./sinpistaCheck";
