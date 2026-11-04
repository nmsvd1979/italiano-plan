import { writeFileSync } from "node:fs";
import { UNITS } from "../../../../src/content/curriculum";
import { COURSE } from "../../../../src/content/course";
import { getLesson } from "../../../../src/content/grammar";
import { getVocab } from "../../../../src/content/vocab";
import { getDictation } from "../../../../src/content/dictation";
import { getDialogue } from "../../../../src/content/dialogues";
import { getWriting } from "../../../../src/content/writing";
import { getSinPista } from "../../../../src/content/sinpista";
import { getLectura } from "../../../../src/content/lectura";
import { PRON_UNITS, audioFiles, AUDIO_PENDING } from "../../../../src/content/pronunciation";
import { sourceOf, singleWord } from "../../../../src/ui/speech";
import { sentencesOf, shadowable } from "../../../../src/domain/shadowOwn";
import pruebas from "../../../../src/content/pruebas.json";
const P: any = pruebas;
type Row = { surface: string; unit: string; text: string; src: string };
const rows: Row[] = [];
const add = (surface: string, unit: string, text: string) => rows.push({ surface, unit, text, src: sourceOf(text) });
for (const u of UNITS) {
  for (const e of getLesson(u.id)?.examples ?? []) add("Lección: ejemplo (AudioButton)", u.id, e.it);
  const w = getWriting(u.id); if (w) add("Escritura: texto modelo (AudioButton)", u.id, w.model);
  for (const v of getVocab(u.id) ?? []) add("Palabras: lista (say)", u.id, v.it);
  for (const l of getDialogue(u.id)?.lines ?? []) { add("Diálogo: línea (say)", u.id, l.it); }
  for (const d of getDictation(u.id) ?? []) add("Dictado (say)", u.id, d.it);
  for (const e of getSinPista(u.id)) if (e.type === "listen") add("Sin pista: escucha (say)", u.id, e.prompt);
  for (const e of P[u.id]?.escucha ?? []) add("Mini-prueba: escucha (say)", u.id, e.it);
  for (const e of getLesson(u.id)?.exercises ?? []) if (e.type === "fill") add("Repaso SRS: cloze (say frase completa)", u.id, e.prompt.replace("___", e.answers[0]).replace(/\*/g, ""));
}
for (const s of COURSE) for (const p of getLectura(s.id)?.it ?? []) add("Lectura: párrafo (say)", s.id, p.replace(/\n/g, " "));
// pantallas que usan playModel (siempre voz del sistema si no hay file)
for (const u of UNITS) {
  for (const l of getDialogue(u.id)?.lines ?? []) rows.push({ surface: "Diálogo con rol: playModel (sin say)", unit: u.id, text: l.it, src: "system(playModel)" });
}
for (const s of COURSE) {
  const lines = [...(getDialogue(s.unit)?.lines.map((l) => l.it) ?? []), ...sentencesOf(getLectura(s.id)?.it ?? [])].filter(shadowable);
  for (const t of lines) rows.push({ surface: "Shadowing propio: playModel (sin say)", unit: s.id, text: t, src: "system(playModel)" });
}
// pronunciación
const all = [...new Set(PRON_UNITS.flatMap((p) => [...p.pairs.flat(), ...p.words]))];
for (const wd of all) {
  const nat = audioFiles(wd).length > 0;
  rows.push({ surface: "Pronunciación: WordButton", unit: "-", text: wd, src: nat ? "native" : "system(speak; clip existe: " + (sourceOf(wd) === "clip") + ")" });
  rows.push({ surface: "Pronunciación: Repetir y comparar (CompareRow)", unit: "-", text: wd, src: nat ? "native" : "system(playModel; clip existe: " + (sourceOf(wd) === "clip") + ")" });
}
writeFileSync("docs/v2/auditoria/medicion/salida/aud.json", JSON.stringify(rows));
const by: Record<string, Record<string, number>> = {};
for (const r of rows) { const k = r.surface; by[k] ??= {}; const s = r.src.startsWith("system") ? r.src.replace(/;.*/, "") + (r.src.includes("true") ? " [clip existe]" : "") : r.src; by[k][s] = (by[k][s] ?? 0) + 1; }
for (const [k, v] of Object.entries(by)) console.log(k.padEnd(52), JSON.stringify(v));
console.log("PENDING", AUDIO_PENDING.length, "native-ok-for-all", all.filter((w) => audioFiles(w).length === 0).length, "words total", all.length);
