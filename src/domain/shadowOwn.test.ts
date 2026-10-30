import { describe, expect, it } from "vitest";
import { COURSE } from "../content/course";
import { getDialogue } from "../content/dialogues";
import { getLectura } from "../content/lectura";
import { blockRoute } from "../app/blockRoute";
import { daysOf } from "./cycle";
import { SHADOW_LINES, STAGES, pickLines, sentencesOf, shadowable } from "./shadowOwn";
import { NORMAL_RATE, SLOW_RATE } from "./speechRate";

describe("pasadas del shadowing propio (docs/v2/05 E5)", () => {
  it("oír → leer mientras suena → repetir a 0,75 → repetir a velocidad normal", () => {
    expect(STAGES.map((s) => s.id)).toEqual(["listen", "read", "slow", "normal"]);
    expect(STAGES.map((s) => s.showText)).toEqual([false, true, true, true]);
    expect(STAGES.map((s) => s.speak)).toEqual([false, false, true, true]);
    expect(STAGES.map((s) => s.slow)).toEqual([false, false, true, false]);
    expect(SLOW_RATE / NORMAL_RATE).toBeCloseTo(0.75);
  });
});

describe("frases para el shadowing", () => {
  it("parte los párrafos en frases sin perder palabras", () => {
    const text = ["Buongiorno! Mi chiamo Laura. Sono di Santiago.\nAbito a Roma.", "— Come stai? Bene, grazie."];
    expect(sentencesOf(text)).toEqual(["Buongiorno!", "Mi chiamo Laura.", "Sono di Santiago.", "Abito a Roma.", "Come stai?", "Bene, grazie."]);
    expect(sentencesOf(text).join(" ").replace(/[—\s]+/g, " ").split(" ").length).toBeGreaterThan(8);
    expect(sentencesOf([])).toEqual([]);
  });

  it("sirven las líneas de 3 a 12 palabras", () => {
    expect(shadowable("Sì.")).toBe(false);
    expect(shadowable("Mi chiamo Laura.")).toBe(true);
    expect(shadowable(Array(13).fill("parola").join(" "))).toBe(false);
  });

  it("mezcla diálogo y texto, sin repetir, estable por semilla, solo con contenido recibido", () => {
    const d = ["Buongiorno, signora Mora.", "Ho una prenotazione qui.", "Dove è la mia camera?", "Grazie mille, arrivederci.", "Mi chiamo Laura Mora."];
    const t = ["Sono di Santiago.", "Abito a Roma da due anni.", "Studio italiano ogni giorno.", "Il mio amico è italiano."];
    const out = pickLines(d, t, 6, "s");
    expect(out).toHaveLength(6);
    expect(new Set(out).size).toBe(6);
    expect(out.every((l) => d.includes(l) || t.includes(l))).toBe(true);
    expect(out.filter((l) => d.includes(l)).length).toBe(3);
    expect(out.filter((l) => t.includes(l)).length).toBe(3);
    expect(pickLines(d, t, 6, "s")).toEqual(out);
    expect(pickLines(d, t, 6, "otra")).not.toEqual(out);
  });

  it("sin texto usa solo el diálogo, sin diálogo solo el texto, y sin ninguno devuelve nada", () => {
    const d = ["Buongiorno, signora Mora.", "Ho una prenotazione qui.", "Dove è la mia camera?"];
    const t = ["Sono di Santiago.", "Abito a Roma da due anni."];
    expect(pickLines(d, [], 6, "s").sort()).toEqual([...d].sort());
    expect(pickLines([], t, 6, "s").sort()).toEqual([...t].sort());
    expect(pickLines([], [], 6, "s")).toEqual([]);
    expect(pickLines(d, t, 4, "s")).toHaveLength(4);
    expect(pickLines(["Ciao.", "Sì."], ["No."], 6, "s")).toEqual([]);
  });

  it("todas las semanas del curso tienen al menos 4 líneas con el contenido real de la app", () => {
    for (const s of COURSE) {
      const dialogue = getDialogue(s.unit)?.lines.map((l) => l.it) ?? [];
      const text = sentencesOf(getLectura(s.id)?.it ?? []);
      const lines = pickLines(dialogue, text, SHADOW_LINES, `x:${s.id}`);
      expect(lines.length, s.id).toBeGreaterThanOrEqual(4);
      expect(lines.every(shadowable), s.id).toBe(true);
    }
  });
});

describe("rutas: shadowing propio sin conexión y YouTube como extra del día 7", () => {
  it("el bloque del día 5 abre el shadowing propio y ya no necesita internet", () => {
    for (const s of COURSE) {
      const day = daysOf(s)[4];
      const block = day.blocks.find((b) => b.id === "shadowing")!;
      expect(block.needsInternet).toBeFalsy();
      expect(block.core).toBe(false);
      expect(block.legacy).toEqual(["shadow"]);
      const route = blockRoute(s, day, block)!;
      expect(route.to).toContain("/shadowing-propio/");
      if (s.part) expect(route.to).toContain(`part=${s.part}`);
    }
  });

  it("el input libre del día 7 (necesita internet) ofrece el shadowing con video como extra", () => {
    for (const s of COURSE) {
      const day = daysOf(s)[6];
      const block = day.blocks.find((b) => b.id === "input")!;
      expect(block.needsInternet).toBe(true);
      expect(block.core).toBe(false);
      const route = blockRoute(s, day, block)!;
      expect(route.to).toMatch(/#\/shadowing\/u\d{2}\?/);
      expect(route.label).toContain("extra");
    }
  });
});
