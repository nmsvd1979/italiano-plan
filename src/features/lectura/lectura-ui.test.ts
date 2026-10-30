import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { COURSE } from "../../content/course";
import { getLectura, LECTURA_IDS } from "../../content/lectura";
import { blockRoute } from "../../app/blockRoute";
import { blockKey, daysOf } from "../../domain/cycle";
import { Questions, ReadText, segments } from "./LecturaScreen";

const noop = () => {};
const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");

describe("pantalla de lectura", () => {
  it("cada semana del curso tiene su texto, y el bloque del día 5 lleva a él con la parte y la clave", () => {
    for (const s of COURSE) {
      expect(getLectura(s.id), s.id).toBeDefined();
      const day = daysOf(s)[4];
      const text = blockRoute(s, day, day.blocks.find((b) => b.id === "text")!)!;
      const qs = blockRoute(s, day, day.blocks.find((b) => b.id === "questions")!)!;
      expect(text.to).toContain(`/lectura/${s.unit}`);
      expect(text.to).not.toContain("mode=");
      expect(qs.to).toContain("mode=preguntas");
      for (const r of [text, qs]) {
        if (s.part) expect(r.to).toContain(`part=${s.part}`);
        else expect(r.to).not.toContain("part=");
      }
      expect(text.to).toContain(`k=${encodeURIComponent(blockKey(s.id, 5, "text"))}`);
      expect(qs.to).toContain(`k=${encodeURIComponent(blockKey(s.id, 5, "questions"))}`);
    }
    expect(LECTURA_IDS.length).toBe(COURSE.length);
  });

  it("el texto sale por párrafos, con «Ver traducción» por párrafo y las palabras clave tocables", () => {
    for (const s of COURSE) {
      const t = getLectura(s.id)!;
      const out = renderToStaticMarkup(createElement(ReadText, { lectura: t, onNext: noop }));
      expect(out.match(/Ver traducción/g), s.id).toHaveLength(t.it.length);
      expect(out, s.id).toContain("Palabras clave");
      expect(out, s.id).toContain("Ir a las preguntas");
      // la traducción no se ve hasta tocar el botón
      for (const es of t.es) expect(out, s.id).not.toContain(escape(es.split("\n")[0]));
      // cada palabra clave aparece como botón en la lista
      for (const c of t.claves) expect(out, s.id).toContain(`>${escape(c.it)}</button>`);
    }
  });

  it("segments parte un párrafo sin perder texto y marca las palabras clave (sin distinguir mayúsculas)", () => {
    const claves = [{ it: "il caffè", es: "el café" }, { it: "caffè", es: "café" }];
    const parts = segments("Vorrei Il Caffè, per favore. Un caffè!", claves);
    expect(parts.map((p) => p.text).join("")).toBe("Vorrei Il Caffè, per favore. Un caffè!");
    expect(parts.filter((p) => p.clave).map((p) => p.text)).toEqual(["Il Caffè", "caffè"]);
    expect(segments("Ciao", [])).toEqual([{ text: "Ciao" }]);
  });

  it("las preguntas: 3 de opción múltiple y 1 breve, sin corrección antes de responder", () => {
    for (const s of COURSE) {
      const t = getLectura(s.id)!;
      const out = renderToStaticMarkup(createElement(Questions, { lectura: t, onFinish: noop }));
      expect(out, s.id).toContain(escape(t.preguntas[0].q));
      expect(out.match(/role="radio"/g), s.id).toHaveLength(3);
      expect(out, s.id).not.toContain(escape(t.preguntas[0].why));
      expect(out, s.id).not.toContain("¡Correcto!");
    }
  });
});
