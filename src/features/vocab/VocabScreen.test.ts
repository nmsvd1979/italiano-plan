import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { getWords } from "../../content/vocab";
import { wordsForScreen } from "../../domain/vocabWords";

vi.mock("../../app/state", () => ({
  useApp: () => ({ today: new Date(2026, 9, 29), completeActivity: () => {} }),
}));

const { VocabScreen } = await import("./VocabScreen");

const html = (unit: string, part?: "A" | "B") => renderToStaticMarkup(createElement(VocabScreen, { unit, part }));
const count = (text: string, re: RegExp) => (text.match(re) ?? []).length;

describe("Palabras de la unidad con una unidad partida (u02)", () => {
  const words = getWords("u02")!;
  const core = words.filter((w) => !w.extra);
  const extras = words.filter((w) => w.extra);

  it("la semana A muestra el núcleo de A y la ampliación de A; la B, lo de B", () => {
    for (const part of ["A", "B"] as const) {
      const shown = wordsForScreen("u02", part)!;
      expect(shown.more.length).toBeGreaterThan(10);
      expect(shown.more.every((w) => w.part === part)).toBe(true);
      expect(shown.base.every((w) => !w.extra)).toBe(true);
      const other = extras.filter((w) => w.part !== part);
      expect(shown.more.some((w) => other.includes(w))).toBe(false);
    }
    const a = wordsForScreen("u02", "A")!;
    const b = wordsForScreen("u02", "B")!;
    expect(a.more.length + b.more.length).toBe(extras.length);
    expect(a.base.length + b.base.length).toBeGreaterThanOrEqual(core.length);
    expect(a.base.length).toBeLessThan(core.length);
  });

  it("sin semana se muestran todas las palabras", () => {
    const all = wordsForScreen("u02")!;
    expect(all.base).toHaveLength(core.length);
    expect(all.more).toHaveLength(extras.length);
  });

  it("la pantalla de la semana A pinta solo las palabras de esa semana, en dos bloques", () => {
    const shown = wordsForScreen("u02", "A")!;
    const page = html("u02", "A");
    expect(page).toContain("Palabras de la unidad");
    expect(page).toContain("Palabras base");
    expect(page).toContain("Más palabras");
    expect(count(page, /class="vocab-row"/g)).toBe(shown.base.length + shown.more.length);
    // Una palabra de la ampliación de la semana B no aparece.
    const fromB = extras.find((w) => w.part === "B")!;
    expect(page).not.toContain(`<em>${fromB.ex!.replace(/'/g, "&#x27;")}</em>`);
    const fromA = shown.more[0];
    expect(page).toContain(fromA.it.replace(/'/g, "&#x27;"));
  });

  it("cada palabra trae frase, traducción, botón de la palabra, botón de la frase y etiqueta", () => {
    const shown = wordsForScreen("u02", "A")!;
    const page = html("u02", "A");
    const n = shown.base.length + shown.more.length;
    expect(count(page, /aria-label="Escuchar: /g)).toBe(n);
    expect(count(page, /aria-label="Escuchar la frase: /g)).toBe(n);
    expect(count(page, /class="vocab-tag"/g)).toBe(n);
    expect(page).toContain("Del tema");
    expect(page).toContain("De uso general");
    expect(page).toContain("Ponerme a prueba");
  });

  it("una unidad sin partir muestra todo su listado ampliado", () => {
    const u01 = getWords("u01")!;
    const page = html("u01");
    expect(count(page, /class="vocab-row"/g)).toBe(u01.length);
  });
});
