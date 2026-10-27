// Extrae todo el texto en italiano del curso (por unidad y por fuente) a un JSON.
// Uso: npx vite-node scripts/extraer-italiano.ts <salida.json>
// Lo usa scripts/verificar-fuentes.mjs. Solo lee; no cambia contenido.
import { writeFileSync } from "node:fs";
import { UNITS } from "../src/content/curriculum";
import { getDialogue } from "../src/content/dialogues";
import { getDictation } from "../src/content/dictation";
import { getLesson } from "../src/content/grammar";
import type { Block } from "../src/content/grammar/types";
import { getVocab } from "../src/content/vocab";

const italics = (s: string): string[] => [...s.matchAll(/(?<!\*)\*([^*]+)\*(?!\*)/g)].map((m) => m[1]);
const blockText = (b: Block): string =>
  b.kind === "p" ? b.text : b.kind === "list" ? b.items.join(" ") : [...b.head, ...b.rows.flat()].join(" ");

const out: { unit: string; src: string; text: string }[] = [];
for (const u of UNITS) {
  const id = u.id;
  for (const v of getVocab(id) ?? []) out.push({ unit: id, src: "vocab", text: v.it });
  for (const d of getDictation(id) ?? []) out.push({ unit: id, src: "dictado", text: d.it });
  for (const l of getDialogue(id)?.lines ?? []) out.push({ unit: id, src: "dialogo", text: l.it });
  const lesson = getLesson(id);
  if (!lesson) continue;
  for (const e of lesson.examples) out.push({ unit: id, src: "ejemplo", text: e.it });
  for (const b of lesson.rule) for (const t of italics(blockText(b))) out.push({ unit: id, src: "regla", text: t });
  for (const n of lesson.notice) for (const t of [...italics(n.prompt), ...n.options.flatMap(italics)]) out.push({ unit: id, src: "observa", text: t });
  for (const x of lesson.exercises) {
    if (x.type === "fill") {
      for (const a of x.answers) out.push({ unit: id, src: "ejercicio-respuesta", text: x.prompt.replace("___", a) });
    } else {
      for (const t of [...italics(x.prompt), ...x.options]) out.push({ unit: id, src: "ejercicio-opcion", text: t });
    }
  }
}
writeFileSync(process.argv[2] ?? "italiano.json", JSON.stringify(out, null, 1));
console.log(`${out.length} fragmentos`);
