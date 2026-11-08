import { describe, expect, it } from "vitest";
import { LAP_MESSAGE, SHORT_RATIO, coveredCount, lapStatus, monoActivity } from "./monologue";

describe("medidas del monólogo", () => {
  it("una vuelta dentro del límite y no muy corta está «justo»", () => {
    expect(lapStatus(30, 45)).toBe("justo");
    expect(lapStatus(45, 45)).toBe("justo");
    expect(lapStatus(Math.ceil(45 * SHORT_RATIO), 45)).toBe("justo");
  });
  it("pasarse del límite o quedar muy corta se avisa", () => {
    expect(lapStatus(46, 45)).toBe("pasado");
    expect(lapStatus(10, 45)).toBe("corto");
    for (const s of ["justo", "pasado", "corto"] as const) expect(LAP_MESSAGE[s].length).toBeGreaterThan(5);
  });
  it("cuenta los puntos marcados y nombra la actividad por vuelta", () => {
    expect(coveredCount([true, false, true])).toBe(2);
    expect(coveredCount([])).toBe(0);
    expect(monoActivity("u02#B", 2)).toBe("u02#B:mono:2");
  });
});
