// Vuelca lo que enseña cada unidad (palabras, diálogo, dictado, ejemplos, ejercicios) y los textos graduados a un JSON.
// Lo usa scripts/lexico-acumulado.py (informe de léxico acumulado, docs/v2/07). Solo lee; no cambia contenido.
// Uso: npx vite-node scripts/lexico-acumulado.ts <salida.json>
import { COURSE } from "../src/content/course";
import { UNITS } from "../src/content/curriculum";
import { getDialogue } from "../src/content/dialogues";
import { getDictation } from "../src/content/dictation";
import { getLesson } from "../src/content/grammar";
import type { Block } from "../src/content/grammar/types";
import { LECTURA_IDS, getLectura } from "../src/content/lectura";
import { writeFileSync } from "node:fs";
import { getWords } from "../src/content/vocab";


const norm = (s: string) => s.toLowerCase().replace(/[’]/g, "'");
const tokens = (s: string): string[] =>
  norm(s.replace(/\*/g, "")).replace(/(\w)'(\w)/g, "$1' $2").match(/[a-zà-ÿ]+'?/g)?.map((t) => t.replace(/'$/, "")) ?? [];
const italics = (s: string): string[] => [...s.matchAll(/(?<!\*)\*([^*]+)\*(?!\*)/g)].map((m) => m[1]);
const blockText = (b: Block): string => (b.kind === "p" ? b.text : b.kind === "list" ? b.items.join(" ") : [...b.head, ...b.rows.flat()].join(" "));

/** Palabras que cada unidad enseña (todo el italiano que ve la persona en esa unidad). */
function unitTokens(id: string): Set<string> {
  const out = new Set<string>();
  const add = (s: string) => tokens(s).forEach((t) => out.add(t));
  for (const w of getWords(id) ?? []) { add(w.it); if (w.ex) add(w.ex); }
  for (const d of getDictation(id) ?? []) add(d.it);
  for (const l of getDialogue(id)?.lines ?? []) add(l.it);
  const lesson = getLesson(id);
  if (lesson) {
    for (const e of lesson.examples) add(e.it);
    for (const b of lesson.rule) italics(blockText(b)).forEach(add);
    for (const n of lesson.notice) [...italics(n.prompt), ...n.options.flatMap(italics)].forEach(add);
    for (const x of lesson.exercises) {
      if (x.type === "fill") x.answers.forEach((a) => add(x.prompt.replace("___", a)));
      else { italics(x.prompt).forEach(add); x.options.forEach(add); }
    }
  }
  return out;
}

const unitOrder: string[] = [];
for (const s of COURSE) if (!unitOrder.includes(s.unit)) unitOrder.push(s.unit);
void UNITS;
const out = {
  unitOrder,
  units: Object.fromEntries(unitOrder.map((u) => [u, [...unitTokens(u)]])),
  steps: Object.fromEntries(COURSE.map((s) => [s.id, s.unit])),
  texts: Object.fromEntries(LECTURA_IDS.map((id) => [id, { it: getLectura(id)!.it.join(" "), claves: getLectura(id)!.claves.map((c) => c.it) }])),
};
writeFileSync(process.argv[2] ?? "lexico.json", JSON.stringify(out));
console.log(`${unitOrder.length} unidades, ${LECTURA_IDS.length} textos`);
