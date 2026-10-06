import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    return statSync(p).isDirectory() ? files(p) : [p];
  });
}

describe("texto de la app", () => {
  // La app habla de tú, sin voseo ("podés", "mirá", "activalo").
  const VOSEO = /\b(vos|tenés|querés|podés|sabés|hacés|decís|venís|mirá|tocá|elegí|escuchá|repetí|seguí|empezá|terminá|probá|volvé|pegá|copiá|andá|activalo|activala|habilitalas|habilitalo|desactivalo|fijate|acordate|sentate)\b/i;
  const REGIONAL = /\b(polera|remera|campera|pibe|che boludo|choclo)\b/i;

  it("no hay voseo ni regionalismos marcados en los textos", () => {
    const bad: string[] = [];
    for (const f of files("src").filter((x) => /\.(ts|tsx|json)$/.test(x) && !x.includes(".test."))) {
      const text = readFileSync(f, "utf8");
      text.split("\n").forEach((line, i) => {
        if (VOSEO.test(line) || REGIONAL.test(line)) bad.push(`${f}:${i + 1}: ${line.trim().slice(0, 90)}`);
      });
    }
    expect(bad).toEqual([]);
  });
});
