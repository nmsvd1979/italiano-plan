import { describe, expect, it } from "vitest";
import { LESSONS } from "../content/grammar";
import { optionOrder } from "./optionOrder";

describe("orden de las opciones", () => {
  it("es una permutación y se repite con la misma semilla", () => {
    const o = optionOrder(4, "x");
    expect([...o].sort()).toEqual([0, 1, 2, 3]);
    expect(optionOrder(4, "x")).toEqual(o);
  });

  it("la respuesta correcta se reparte entre las posiciones (no se puede adivinar por lugar)", () => {
    const counts = [0, 0, 0];
    let total = 0;
    for (const l of LESSONS) {
      for (const e of [...l.exercises, ...l.notice]) {
        if (e.type !== "choice" || e.options.length !== 3) continue;
        for (let s = 0; s < 20; s++) {
          counts[optionOrder(3, `${s}:${l.unit}:${e.prompt}`).indexOf(e.answer)]++;
          total++;
        }
      }
    }
    for (const c of counts) expect(c / total).toBeGreaterThan(0.28);
  });
});
