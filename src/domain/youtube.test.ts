import { describe, expect, it } from "vitest";
import { READY_UNITS } from "../content/curriculum";
import { SHADOWING, SHADOWING_SEARCH } from "../content/shadowing";
import { isValidSegment, parseYouTubeId } from "./youtube";

describe("parseYouTubeId", () => {
  const id = "ieyLUxtwch4";
  it("entiende las formas comunes de link", () => {
    expect(parseYouTubeId(`https://www.youtube.com/watch?v=${id}`)).toBe(id);
    expect(parseYouTubeId(`https://www.youtube.com/watch?v=${id}&t=30s`)).toBe(id);
    expect(parseYouTubeId(`https://youtu.be/${id}?si=abc`)).toBe(id);
    expect(parseYouTubeId(`https://m.youtube.com/watch?v=${id}`)).toBe(id);
    expect(parseYouTubeId(`https://www.youtube.com/embed/${id}`)).toBe(id);
    expect(parseYouTubeId(`https://www.youtube.com/shorts/${id}`)).toBe(id);
    expect(parseYouTubeId(id)).toBe(id);
  });
  it("rechaza lo que no es un video", () => {
    expect(parseYouTubeId("")).toBeNull();
    expect(parseYouTubeId("hola")).toBeNull();
    expect(parseYouTubeId("https://example.com/watch?v=" + id)).toBeNull();
    expect(parseYouTubeId("https://www.youtube.com/@EasyItalian")).toBeNull();
  });
});

describe("segmento", () => {
  it("necesita al menos 1 segundo", () => {
    expect(isValidSegment(10, 12)).toBe(true);
    expect(isValidSegment(10, 10.5)).toBe(false);
    expect(isValidSegment(null, 12)).toBe(false);
  });
});

describe("videos de shadowing", () => {
  it("cada unidad disponible tiene un principal y un alternativo distintos, con id de 11 caracteres", () => {
    for (const { id: u } of READY_UNITS) {
      const v = SHADOWING[u];
      if (!v) {
        expect(SHADOWING_SEARCH[u], `unidad ${u}: sin video ni búsqueda guiada`).toBeTruthy();
        continue;
      }
      expect(v.main.id).toMatch(/^[A-Za-z0-9_-]{11}$/);
      expect(v.alt.id).toMatch(/^[A-Za-z0-9_-]{11}$/);
      expect(v.main.id).not.toBe(v.alt.id);
    }
  });
  it("no se repite ningún video entre unidades", () => {
    const ids = Object.values(SHADOWING).flatMap((v) => [v.main.id, v.alt.id]);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
