import { describe, expect, it } from "vitest";
import { COURSE } from "../content/course";
import { CourseProgress, blockKey, todaySlots } from "./cycle";
import { nextItem, sessionItems } from "./session";

const progress = (done: string[] = []): CourseProgress => ({ done: new Set(done), startUnit: 1, mini: {} });

describe("sessionItems", () => {
  const p = progress();
  const { shown } = todaySlots(p, new Set());

  it("separa esenciales y recomendados, sin repetir bloques", () => {
    const { essential, optional } = sessionItems(shown, p, false);
    expect(essential.length).toBeGreaterThan(0);
    expect(essential.every((i) => i.block.core)).toBe(true);
    expect(optional.every((i) => !i.block.core)).toBe(true);
    const keys = [...essential, ...optional].map((i) => i.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("en modo corto no hay recomendados", () => {
    expect(sessionItems(shown, p, true).optional).toEqual([]);
  });

  it("nextItem avanza al marcar el primer esencial", () => {
    const first = sessionItems(shown, p, false).essential[0];
    expect(nextItem(sessionItems(shown, p, false).essential)?.key).toBe(first.key);
    const p2 = progress([blockKey(first.slot.step.id, first.slot.day.day, first.block.id)]);
    const after = sessionItems(todaySlots(p2, new Set([first.key])).shown, p2, false).essential;
    expect(after.find((i) => i.key === first.key)?.done).toBe(true);
    expect(nextItem(after)?.key).not.toBe(first.key);
  });

  it("el curso tiene semanas listas", () => {
    expect(COURSE.length).toBeGreaterThan(0);
  });
});
