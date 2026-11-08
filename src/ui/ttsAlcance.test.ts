import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { COURSE } from "../content/course";
import { getWords } from "../content/vocab";
import { getWriting } from "../content/writing";
import { getMonologue } from "../content/monologos";
import { getPronStep } from "../content/pronunciation/sequence";
import { audioFiles } from "../content/pronunciation";
import { clipFile } from "./speech";

// El audio nuevo se genera por fase (docs/v2/plan-b1/07, scripts/tts/alcance-nuevo.json). Para las unidades del alcance,
// todo lo que las pantallas hacen sonar con say() tiene clip, salvo lo excluido a propósito (dudas de docs/dudas-italiano.md).

const ROOT = path.resolve(__dirname, "..", "..");
const alcance = new Set((JSON.parse(readFileSync(path.join(ROOT, "scripts/tts/alcance-nuevo.json"), "utf8")) as { unidades: string[] }).unidades);
const exclusiones = JSON.parse(readFileSync(path.join(ROOT, "scripts/tts/exclusiones.json"), "utf8")) as { frase: string }[];
const norm = (t: string) => t.toLowerCase().replace(/[^\p{L}\p{N}']+/gu, " ").trim();
const excluded = (t: string) => exclusiones.some((e) => ` ${norm(t)} `.includes(` ${norm(e.frase)} `));
const steps = COURSE.filter((s) => alcance.has(s.unit));

describe("audio de la fase 1: todo lo que suena tiene clip", () => {
  it("hay unidades en el alcance", () => {
    expect(steps.length).toBeGreaterThanOrEqual(7);
  });

  it("frases de ejemplo del vocabulario", () => {
    const missing: string[] = [];
    for (const s of steps) {
      for (const w of getWords(s.unit) ?? []) {
        if (!w.ex || (s.part && w.part && w.part !== s.part) || excluded(w.ex)) continue;
        if (!clipFile(w.ex)) missing.push(`${s.id}: ${w.ex}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("modelos de escritura y de monólogo", () => {
    const missing: string[] = [];
    for (const s of steps) {
      const wr = getWriting(s.unit, s.part ?? null);
      for (const t of [wr?.model, wr?.extend?.model, getMonologue(s.id)?.model]) if (t && !excluded(t) && !clipFile(t)) missing.push(`${s.id}: ${t}`);
    }
    expect(missing).toEqual([]);
  });

  it("palabras de la pronunciación semanal sin grabación nativa (salvo una o dos letras)", () => {
    const missing: string[] = [];
    for (const s of steps) {
      const p = getPronStep(s.id);
      if (!p) continue;
      for (const w of [...p.pairs.flat(), ...p.words]) {
        if (audioFiles(w).length > 0 || w.trim().length <= 2 || excluded(w)) continue;
        if (!clipFile(w)) missing.push(`${s.id}: ${w}`);
      }
    }
    expect(missing).toEqual([]);
  });
});
