import { describe, expect, it } from "vitest";
import { checkText } from "./sinpistaCheck";
import type { SpTranslate } from "./sinpista";

describe("traducciones: variantes válidas aceptadas (9-nov-2026)", () => {
  const ex = async (id: string) => {
    const all = (await import("./sinpista.json")).default as unknown as Record<string, SpTranslate[]>;
    return Object.values(all).flat().find((e) => e.id === id)!;
  };
  it.each([
    ["u13-s05", "Ieri li ho comprati."],
    ["u27-s05", "Piove oggi."],
    ["u15-s03", "Noi saremo felici."],
    ["u26-s03", "Mio fratello è un ingegnere."],
  ])("%s acepta «%s»", async (id, text) => {
    expect(checkText(await ex(id), text)).toBe(true);
  });
  it("sigue exigiendo la tilde y rechaza lo incorrecto", async () => {
    expect(checkText(await ex("u26-s03"), "Mio fratello e ingegnere.")).toBe(false);
    expect(checkText(await ex("u13-s05"), "Ho comprati li ieri.")).toBe(false);
  });
});
