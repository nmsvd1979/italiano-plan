import { readFileSync, readdirSync, existsSync } from "node:fs";
import { UNITS } from "../../../../src/content/curriculum";
import { COURSE } from "../../../../src/content/course";
import { getLesson } from "../../../../src/content/grammar";
import { getVocab } from "../../../../src/content/vocab";
import { getDictation } from "../../../../src/content/dictation";
import { getDialogue } from "../../../../src/content/dialogues";
import { getWriting } from "../../../../src/content/writing";
import { getSinPista } from "../../../../src/content/sinpista";
import { getLectura } from "../../../../src/content/lectura";
import { SHADOWING } from "../../../../src/content/shadowing";
import { getPronUnit } from "../../../../src/content/pronunciation";
import { wordsOfUnit } from "../../../../src/domain/srsDeck";
import pruebas from "../../../../src/content/pruebas.json";
import clips from "../../../../src/content/ttsClips.json";
import { ttsId } from "../../../../src/ui/ttsId";
import frases from "scripts/tts/frases.json";
const wc = (s: string) => s.replace(/\*/g, "").split(/\s+/).filter(Boolean).length;
const P: any = pruebas;
const rows: any[] = [];
const clipSet = new Set(clips as string[]);
const audioIdx: any[] = JSON.parse(readFileSync("public/audio-index.json", "utf8"));
for (const u of UNITS) {
  const L = getLesson(u.id); const V = getVocab(u.id) ?? []; const D = getDictation(u.id) ?? [];
  const Dg = getDialogue(u.id); const W = getWriting(u.id); const SP = getSinPista(u.id);
  const steps = COURSE.filter((s) => s.unit === u.id);
  const lect = steps.map((s) => getLectura(s.id)).filter(Boolean) as any[];
  const pr = P[u.id] ?? { lectura: [], escucha: [], gramatica: [] };
  const pron = getPronUnit(u.id);
  const fill = (L?.exercises ?? []).filter((e) => e.type === "fill").length;
  rows.push({
    u: u.id, ready: u.ready, pasos: steps.length, ej: L?.examples.length ?? 0, notice: L?.notice.length ?? 0, ejer: L?.exercises.length ?? 0, fill,
    vocab: V.length, dict: D.length, dialL: Dg?.lines.length ?? 0, dialW: Dg ? Dg.lines.reduce((n, l) => n + wc(l.it), 0) : 0,
    lect: lect.length, lectW: lect.reduce((n, l) => n + (l.palabras ?? 0), 0), lectQ: lect.reduce((n, l) => n + l.preguntas.length, 0),
    escr: W ? 1 : 0, escrMin: W?.minWords ?? (W ? Math.round(W.minChars / 6) : 0),
    pL: pr.lectura.length, pE: pr.escucha.length, pG: pr.gramatica.length,
    sp: SP.length, spTipos: [...new Set(SP.map((x) => x.type))].join("/"),
    shadow: SHADOWING[u.id] ? 2 : 0,
    pares: pron?.pairs.length ?? 0, pronW: pron?.words.length ?? 0,
    srsW: wordsOfUnit(u.id).length,
    clipsU: (frases as any).frases.filter((f: any) => f.unidad.slice(0, 3) === u.id && clipSet.has(ttsId(f.texto))).length,
    nativ: audioIdx.filter((a) => a.unit === u.id).length,
  });
}
console.log(JSON.stringify(rows));
