import type { SinPista } from "../content/sinpista";
import type { CardKind } from "./srs";
import type { Resolved } from "./srsDeck";

// Un ejercicio sin pista fallado entra al repaso espaciado como tarjeta de su unidad (misma regla que la práctica de
// completar). El diálogo es una tarjeta de completar; los demás tipos se vuelven «escuchar y escribir» la frase correcta.

/** Los ids de ejercicio sin pista son `u04-s07`; los de gramática, `u04-e07`. */
export const isSinPistaId = (id: string): boolean => /^u\d{2}-s\d+$/.test(id);

export function srsCardOf(ex: SinPista): { kind: CardKind; itemId: string; unit: string } {
  return { kind: ex.type === "dialog" ? "cloze" : "listen", itemId: ex.id, unit: ex.id.slice(0, ex.id.indexOf("-")) };
}

export function resolveSinPista(ex: SinPista): Resolved {
  switch (ex.type) {
    case "dialog": return { kind: "cloze", prompt: ex.lines.join("\n"), answers: [ex.options[ex.answer]], why: ex.why };
    case "listen": return { kind: "listen", it: ex.prompt, es: ex.options[ex.answer] };
    default: return { kind: "listen", it: ex.answers[0], es: ex.type === "fix" ? ex.why : ex.prompt };
  }
}
