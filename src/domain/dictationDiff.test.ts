import { describe, expect, it } from "vitest";
import { UNITS } from "../content/curriculum";
import { getDictation } from "../content/dictation";
import {
  SLOW_RATE, NORMAL_RATE, assemble, diffDictation, holeIndexes, levelOfPhase, partialCount, tokenize,
} from "./dictationDiff";

const marks = (d: ReturnType<typeof diffDictation>) => d.expected.map((t) => `${t.norm}:${t.mark}`);

describe("niveles del dictado", () => {
  it("con huecos u01–u08, parcial u09–u16, completo desde u17 (también las unidades nuevas, por su fase)", () => {
    const level = (id: string) => levelOfPhase(UNITS.find((u) => u.id === id)!.phase);
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8]) expect(level(`u0${n}`), `u0${n}`).toBe("huecos");
    for (const n of [9, 10, 11, 12, 13, 14, 15, 16]) expect(level(`u${String(n).padStart(2, "0")}`), `u${n}`).toBe("parcial");
    for (const n of [17, 18, 19, 20, 21, 22, 23, 24]) expect(level(`u${n}`), `u${n}`).toBe("completo");
    expect(["u25", "u26", "u27", "u28"].map(level)).toEqual(["huecos", "huecos", "huecos", "parcial"]);
  });

  it("la voz lenta es el 75 % de la normal", () => {
    expect(SLOW_RATE / NORMAL_RATE).toBeCloseTo(0.75);
  });
});

describe("diff palabra por palabra", () => {
  const frase = "Oggi è il sei ottobre.";

  it("igual (sin importar mayúsculas ni puntuación) = correcta", () => {
    for (const typed of [frase, "oggi è il sei ottobre", "OGGI È IL SEI OTTOBRE!", "  oggi   è il sei ottobre  "]) {
      const d = diffDictation(typed, frase);
      expect(d.grade, typed).toBe("correct");
      expect(d.expected.every((t) => t.mark === "ok")).toBe(true);
    }
  });

  it("falta una palabra: mal, y esa palabra sale como faltante", () => {
    const d = diffDictation("Oggi è il ottobre", frase);
    expect(d.grade).toBe("wrong");
    expect(marks(d)).toEqual(["oggi:ok", "è:ok", "il:ok", "sei:missing", "ottobre:ok"]);
    expect(d.typed.every((t) => t.mark === "ok")).toBe(true);
  });

  it("sobra una palabra: mal, y esa palabra sale como sobrante", () => {
    const d = diffDictation("Oggi è il sei bel ottobre", frase);
    expect(d.grade).toBe("wrong");
    expect(d.typed.map((t) => `${t.norm}:${t.mark}`)).toEqual(["oggi:ok", "è:ok", "il:ok", "sei:ok", "bel:extra", "ottobre:ok"]);
    expect(d.expected.every((t) => t.mark === "ok")).toBe(true);
  });

  it("una palabra cambiada cuenta como faltante y sobrante a la vez", () => {
    const d = diffDictation("Oggi è il sette ottobre", frase);
    expect(d.grade).toBe("wrong");
    expect(marks(d)).toContain("sei:missing");
    expect(d.typed.find((t) => t.norm === "sette")!.mark).toBe("extra");
  });

  it("solo la tilde = casi, en ámbar", () => {
    const d = diffDictation("Oggi e il sei ottobre", frase);
    expect(d.grade).toBe("almost");
    expect(marks(d)).toEqual(["oggi:ok", "è:accent", "il:ok", "sei:ok", "ottobre:ok"]);
    expect(d.typed[1].mark).toBe("accent");
  });

  it("apóstrofo omitido o cambiado de forma (’) = casi", () => {
    expect(diffDictation("Ho l’ho visto", "Ho l'ho visto.").grade).toBe("correct");
    expect(diffDictation("Ho lho visto", "Ho l'ho visto.").grade).toBe("almost");
    expect(diffDictation("Ce un bar", "C'è un bar").grade).toBe("almost");
  });

  it("tilde y falta de palabra a la vez: mal", () => {
    expect(diffDictation("Oggi e il ottobre", frase).grade).toBe("wrong");
  });

  it("vacío = mal y todas las palabras faltan", () => {
    const d = diffDictation("   ", frase);
    expect(d.grade).toBe("wrong");
    expect(d.expected.every((t) => t.mark === "missing")).toBe(true);
  });

  it("orden distinto: las palabras fuera de lugar se marcan, no se pierde ninguna", () => {
    const d = diffDictation("il sei Oggi è ottobre", frase);
    expect(d.grade).toBe("wrong");
    expect(d.expected.length).toBe(5);
    expect(d.expected.filter((t) => t.mark === "missing").length).toBeGreaterThan(0);
  });

  it("es consistente con la calificación anterior en todas las frases reales", () => {
    for (const u of UNITS) {
      for (const x of getDictation(u.id) ?? []) {
        expect(diffDictation(x.it, x.it).grade, x.it).toBe("correct");
        expect(diffDictation(x.it.toLowerCase().replace(/[.,?!]/g, ""), x.it).grade, x.it).toBe("correct");
        expect(diffDictation("zzz", x.it).grade, x.it).toBe("wrong");
      }
    }
  });
});

describe("huecos y parcial", () => {
  const frase = "Vorrei un caffè, per favore.";

  it("pide un tercio de las palabras (las más largas), siempre al menos una", () => {
    expect(holeIndexes(frase).map((i) => tokenize(frase)[i].norm)).toEqual(["vorrei", "favore"]);
    expect(holeIndexes("Hai fame?")).toHaveLength(1);
    for (const u of UNITS) {
      for (const x of getDictation(u.id) ?? []) {
        const n = tokenize(x.it).length;
        const holes = holeIndexes(x.it);
        expect(holes.length, x.it).toBeGreaterThanOrEqual(1);
        expect(holes.length, x.it).toBeLessThan(n);
      }
    }
  });

  it("completar los huecos con las palabras correctas da la frase completa", () => {
    for (const u of UNITS) {
      for (const x of getDictation(u.id) ?? []) {
        const tokens = tokenize(x.it);
        const words = holeIndexes(x.it).map((i) => tokens[i].text);
        expect(diffDictation(assemble("huecos", x.it, words), x.it).grade, x.it).toBe("correct");
        const rest = tokens.slice(partialCount(x.it)).map((t) => t.text).join(" ");
        expect(diffDictation(assemble("parcial", x.it, rest), x.it).grade, x.it).toBe("correct");
        expect(diffDictation(assemble("completo", x.it, x.it), x.it).grade, x.it).toBe("correct");
      }
    }
  });

  it("parcial muestra la primera mitad y deja al menos una palabra por escribir", () => {
    expect(partialCount("Hai fame?")).toBe(1);
    expect(partialCount("Vorrei un caffè, per favore.")).toBe(2);
    expect(partialCount("Ciao")).toBe(0);
  });

  it("un hueco vacío o equivocado se corrige como palabra faltante", () => {
    expect(diffDictation(assemble("huecos", frase, ["", ""]), frase).grade).toBe("wrong");
    expect(diffDictation(assemble("huecos", frase, ["vorrei", "tè"]), frase).grade).toBe("wrong");
  });
});
