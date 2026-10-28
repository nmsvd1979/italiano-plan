// Lista los ítems de una unidad con su índice (para repartirlos en partes A/B, docs/v2/13 §4).
// Uso: npx vite-node scripts/listar-unidad.ts u02
import { getDictation } from "../src/content/dictation";
import { getLesson } from "../src/content/grammar";
import { getVocab } from "../src/content/vocab";

const id = process.argv[2];
const l = getLesson(id)!;
console.log(`## ${id} ${l.title}`);
console.log("-- rule (resumen de bloques)");
l.rule.forEach((b, i) => console.log(`R${i} ${b.kind}: ${(b.kind === "p" ? b.text : b.kind === "list" ? b.items.join(" | ") : b.head.join("|") + " / " + b.rows[0]?.join("|")).slice(0, 110)}`));
console.log("-- examples");
l.examples.forEach((e, i) => console.log(`${i}: ${e.it}`));
console.log("-- notice");
l.notice.forEach((e, i) => console.log(`${i}: ${e.prompt.slice(0, 90)}`));
console.log("-- exercises");
l.exercises.forEach((e, i) => console.log(`${i}: [${e.type}] ${e.prompt.slice(0, 90)}`));
console.log("-- vocab");
(getVocab(id)?.words ?? (getVocab(id) as any) ?? []).forEach?.((w: any, i: number) => console.log(`${i}: ${w.it ?? JSON.stringify(w).slice(0, 60)}`));
console.log("-- dictation");
(getDictation(id) ?? []).forEach((d: any, i: number) => console.log(`${i}: ${d.it ?? d.text ?? JSON.stringify(d).slice(0, 80)}`));
