import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LESSONS, type Block } from "../../content/grammar";
import { RuleSection, RuleView, splitRule } from "./RuleSection";

const rule: Block[] = [
  { kind: "p", text: "Regla corta" },
  { kind: "table", head: ["Visible"], rows: [["fila visible"]] },
  { kind: "p", text: "Párrafo extra", detail: true },
  { kind: "table", head: ["Extra"], rows: [["fila extra"]], detail: true },
  { kind: "list", items: ["ítem extra"], detail: true },
];
const view = (r: Block[], open: boolean) =>
  renderToStaticMarkup(createElement(RuleView, { rule: r, open, onToggle: () => {}, panelId: "p" }));

describe("regla con «Más detalle»", () => {
  it("plegada: oculta los bloques detail y muestra el botón con aria-expanded=false", () => {
    const out = view(rule, false);
    expect(out).toContain("Regla corta");
    expect(out).toContain("fila visible");
    expect(out).not.toContain("Párrafo extra");
    expect(out).not.toContain("fila extra");
    expect(out).not.toContain("ítem extra");
    expect(out).toContain("Más detalle");
    expect(out).toContain('aria-expanded="false"');
    expect(out).toContain("<button");
  });

  it("desplegada: muestra el resto, tablas incluidas, y aria-expanded=true", () => {
    const out = view(rule, true);
    expect(out).toContain("Párrafo extra");
    expect(out).toContain("<th><span>Extra</span></th>");
    expect(out).toContain("fila extra");
    expect(out).toContain("ítem extra");
    expect(out).toContain('aria-expanded="true"');
  });

  it("sin bloques detail no hay botón y se ve igual que antes", () => {
    const plain = rule.filter((b) => !b.detail);
    for (const open of [false, true]) {
      const out = view(plain, open);
      expect(out).not.toContain("Más detalle");
      expect(out).not.toContain("<button");
      expect(out).toContain("fila visible");
    }
  });

  it("RuleSection empieza plegada (el estado no se guarda)", () => {
    const out = renderToStaticMarkup(createElement(RuleSection, { rule, unit: "u99" }));
    expect(out).not.toContain("Párrafo extra");
    expect(out).toContain('aria-expanded="false"');
  });

  it("splitRule conserva el orden dentro de cada grupo", () => {
    const { main, detail } = splitRule(rule);
    expect(main.map((b) => b.kind)).toEqual(["p", "table"]);
    expect(detail.map((b) => b.kind)).toEqual(["p", "table", "list"]);
  });

  it("u16 y u17: regla corta visible (en u17 incluye la frase que introduce la tabla), el resto en detalle", () => {
    for (const unit of ["u16", "u17"]) {
      const lesson = LESSONS.find((l) => l.unit === unit)!;
      const { main, detail } = splitRule(lesson.rule);
      expect(main.map((b) => b.kind), unit).toEqual(unit === "u17" ? ["p", "p", "table"] : ["p", "table"]);
      expect(lesson.rule[0].detail, unit).toBeUndefined();
      expect(detail.length, unit).toBeGreaterThan(0);
    }
  });
});
