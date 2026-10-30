import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SINPISTA_UNITS, checkText, getSinPista, normalize, orderBank, type SinPista } from "../../content/sinpista";
import { SinPistaRunner } from "./SinPistaRunner";

const all: SinPista[] = SINPISTA_UNITS.flatMap((u) => getSinPista(u));
const first = (type: SinPista["type"]) => all.find((e) => e.type === type)!;
const html = (ex: SinPista) =>
  renderToStaticMarkup(createElement(SinPistaRunner, { items: [ex], onAnswer: () => {}, onFinish: () => {}, finishLabel: "Fin" }));
const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");

describe("interfaz de la práctica sin pista", () => {
  it("ningún tipo muestra la explicación ni la respuesta antes de responder", () => {
    for (const ex of all) {
      const out = html(ex);
      expect(out, ex.id).not.toContain(escape(ex.why));
      expect(out, ex.id).not.toContain("Respuesta:");
      expect(out, ex.id).not.toContain("¡Correcto!");
      if (ex.type === "translate" || ex.type === "transform" || ex.type === "order") {
        for (const a of ex.answers) expect(out, ex.id).not.toContain(escape(a));
      }
    }
  });

  it("ordenar: botones con las palabras del banco y «Borrar»; sin campo de texto", () => {
    const ex = first("order") as Extract<SinPista, { type: "order" }>;
    const out = html(ex);
    for (const w of orderBank(ex)) expect(out).toContain(`>${escape(w)}</button>`);
    expect(out).toContain("Borrar");
    expect(out).not.toContain("<input");
  });

  it("traducir, corregir y transformar: un campo de texto con las tildes", () => {
    for (const t of ["translate", "fix", "transform"] as const) {
      const out = html(first(t));
      expect(out, t).toContain("<input");
      expect(out, t).toContain(">à</button>");
    }
  });

  it("diálogo y oído: 3 opciones y sin campo de texto", () => {
    for (const t of ["dialog", "listen"] as const) {
      const ex = first(t) as Extract<SinPista, { type: "dialog" | "listen" }>;
      const out = html(ex);
      expect(out, t).not.toContain("<input");
      expect(out.match(/role="radio"/g), t).toHaveLength(3);
      for (const o of ex.options) expect(out).toContain(escape(o));
    }
  });

  it("oído: muestra la frase en italiano (sin voz solo la frase, sin botón de escuchar)", () => {
    const ex = first("listen") as Extract<SinPista, { type: "listen" }>;
    const out = html(ex);
    expect(out).toContain(escape(ex.prompt));
    expect(out).not.toContain("Escuchar"); // en el servidor no hay voz
  });

  it("el diálogo deja el hueco vacío hasta responder", () => {
    const ex = first("dialog") as Extract<SinPista, { type: "dialog" }>;
    const out = html(ex);
    expect(out).toContain('class="blank"');
    expect(out).not.toMatch(new RegExp(`class="blank">${escape(ex.options[ex.answer])}`));
  });
});

describe("corrección por tipo (con todos los ejercicios reales)", () => {
  it("la respuesta modelo se acepta y una frase vacía o distinta, no", () => {
    for (const ex of all) {
      if (ex.type === "dialog" || ex.type === "listen") {
        expect(ex.answer).toBeGreaterThanOrEqual(0);
        expect(ex.answer).toBeLessThan(ex.options.length);
        continue;
      }
      for (const a of ex.answers) expect(checkText(ex, a), ex.id).toBe(true);
      expect(checkText(ex, ""), ex.id).toBe(false);
      expect(checkText(ex, "zzz qqq"), ex.id).toBe(false);
    }
  });

  it("ordenar: armar el banco en el orden de la respuesta acierta; el banco tal como está, no", () => {
    for (const ex of all.filter((e): e is Extract<SinPista, { type: "order" }> => e.type === "order")) {
      const bank = orderBank(ex);
      expect(checkText(ex, bank.join(" ")), ex.id).toBe(false);
      expect(checkText(ex, normalize(ex.answers[0])), ex.id).toBe(true);
      // las palabras de la respuesta están todas en el banco (más las sobrantes)
      for (const w of normalize(ex.answers[0]).split(" ")) expect(bank, ex.id).toContain(w);
    }
  });
});
