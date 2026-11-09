import { describe, expect, it } from "vitest";
import { COURSE } from "../content/course";
import { rereadSource } from "./reread";
import { blockRoute } from "../app/blockRoute";
import { daysOf } from "./cycle";
import { getLectura } from "../content/lectura";

describe("releer con recuperación", () => {
  it("la primera semana no tiene texto anterior; las demás retoman el paso previo del curso", () => {
    expect(rereadSource(COURSE[0].id)).toBeUndefined();
    for (let i = 1; i < COURSE.length; i++) expect(rereadSource(COURSE[i].id), COURSE[i].id).toBe(COURSE[i - 1].id);
    expect(rereadSource("u99")).toBeUndefined();
  });

  it("cada texto que se retoma existe y trae 4 preguntas para responder de memoria", () => {
    for (const s of COURSE.slice(1)) {
      const l = getLectura(rereadSource(s.id)!);
      expect(l, s.id).toBeDefined();
      expect(l!.preguntas.length, s.id).toBe(4);
    }
  });

  it("el bloque del día 3 abre su pantalla y aparece solo cuando hay texto anterior", () => {
    const step = COURSE[3];
    const block = daysOf(step)[2].blocks.find((b) => b.id === "shorttext")!;
    expect(block.kind).toBe("reread");
    expect(block.core).toBe(false);
    const day = daysOf(step)[2];
    expect(blockRoute(step, day, block)?.to).toMatch(/^#\/releer\/u02\?part=A&k=u02#A\.d3\.shorttext$|^#\/releer\//);
    expect(daysOf(COURSE[0])[2].blocks.some((b) => b.id === "shorttext")).toBe(false);
  });
});
