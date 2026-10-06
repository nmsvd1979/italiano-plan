import { describe, expect, it } from "vitest";
import { addDays, diffInDays, formatDateHuman, parseISODate, toISODate } from "./dates";

process.env.TZ = "America/Argentina/Buenos_Aires";

describe("dates (siempre hora local)", () => {
  it("toISODate usa el día local aunque UTC ya sea el día siguiente", () => {
    // 21:30 del 15/09 en Buenos Aires = 00:30 UTC del 16/09
    const d = new Date("2026-09-16T00:30:00Z");
    expect(d.toISOString().slice(0, 10)).toBe("2026-09-16"); // el bug que se evita
    expect(toISODate(d)).toBe("2026-09-15");
  });

  it("parseISODate y toISODate son inversas", () => {
    expect(toISODate(parseISODate("2026-01-05"))).toBe("2026-01-05");
  });

  it("diffInDays cuenta días de calendario", () => {
    expect(diffInDays(parseISODate("2026-09-15"), parseISODate("2026-09-14"))).toBe(1);
    expect(diffInDays(parseISODate("2026-09-14"), parseISODate("2026-09-15"))).toBe(-1);
  });

  it("addDays cruza fin de mes", () => {
    expect(toISODate(addDays(parseISODate("2026-09-29"), 3))).toBe("2026-10-02");
  });

  it("formatDateHuman en español", () => {
    expect(formatDateHuman(parseISODate("2026-09-15"))).toBe("martes 15 de septiembre");
  });
});
