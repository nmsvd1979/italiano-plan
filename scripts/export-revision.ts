// Genera docs/revision-italiano.md: todo el italiano de la app, para que lo revise un hablante nativo.
// Uso: npx vite-node scripts/export-revision.ts
import { writeFileSync } from "node:fs";
import { UNITS, PHASES } from "../src/content/curriculum";
import { getDialogue } from "../src/content/dialogues";
import { getDictation } from "../src/content/dictation";
import { LESSONS } from "../src/content/grammar";
import type { Block, Exercise } from "../src/content/grammar/types";
import { GLOSS, getPronUnit } from "../src/content/pronunciation";
import { SHADOWING } from "../src/content/shadowing";
import { getVocab } from "../src/content/vocab";
import { getWriting } from "../src/content/writing";

const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");
const out: string[] = [];
const p = (...lines: string[]) => out.push(...lines);

function block(b: Block): void {
  if (b.kind === "p") p(b.text, "");
  else if (b.kind === "list") p(...b.items.map((t) => `- ${t}`), "");
  else {
    p(`| ${b.head.map(cell).join(" | ")} |`, `|${b.head.map(() => "---").join("|")}|`, ...b.rows.map((r) => `| ${r.map(cell).join(" | ")} |`), "");
  }
}

function exercise(e: Exercise, i: number): string {
  if (e.type === "fill") return `${i + 1}. **Completar:** ${e.prompt}  → respuesta(s) aceptada(s): \`${e.answers.join("` · `")}\`  — _${e.why}_`;
  const opts = e.options.map((o, k) => `${k === e.answer ? "**✔** " : ""}${o}`).join("  /  ");
  return `${i + 1}. **Elegir:** ${e.prompt}  → ${opts}  — _${e.why}_`;
}

const readyIds = new Set(UNITS.filter((u) => u.ready).map((u) => u.id));
const lessons = LESSONS.map((l) => l.unit);
const counts = {
  units: lessons.length,
  examples: LESSONS.reduce((n, l) => n + l.examples.length, 0),
  exercises: LESSONS.reduce((n, l) => n + l.exercises.length + l.notice.length, 0),
  vocab: UNITS.reduce((n, u) => n + (getVocab(u.id)?.length ?? 0), 0),
  dictation: UNITS.reduce((n, u) => n + (getDictation(u.id)?.length ?? 0), 0),
  dialogueLines: UNITS.reduce((n, u) => n + (getDialogue(u.id)?.lines.length ?? 0), 0),
};

p(
  "# Revisión de italiano — app «Italiano»",
  "",
  "## Para quien revisa (léelo primero)",
  "",
  "**Qué es:** una app personal para que una persona de habla hispana (Latinoamérica) aprenda italiano desde cero hasta A2 en unos 6 meses. Todo el italiano de abajo lo escribió una IA y **nadie nativo lo ha revisado**. Tu trabajo es encontrar errores y cosas poco naturales.",
  "",
  "**Qué se necesita de ti, en orden de importancia:**",
  "1. **Errores de italiano** (gramática, ortografía, tildes, apóstrofos, concordancias, preposiciones).",
  "2. **Frases correctas pero poco naturales**: lo que un italiano no diría así. Propón la versión natural.",
  "3. **Registro**: si una frase mezcla *tu* y *Lei*, o suena demasiado formal/informal para la situación.",
  "4. **Ejercicios con más de una respuesta correcta**: en los ejercicios de completar (`___`), la app solo acepta las respuestas listadas. Si otra respuesta también es correcta, indícala para agregarla.",
  "5. **Ejercicios ambiguos o con pista que regala la respuesta**, y opciones de opción múltiple donde dos opciones serían correctas.",
  "6. **Traducciones al español** que no sean fieles. El español debe ser neutro (sin voseo ni regionalismos; si hay dos palabras comunes se escriben las dos: «boleto / pasaje»).",
  "7. **Explicaciones de gramática** (en español) que sean imprecisas o engañosas para un principiante.",
  "",
  "**Cómo responder (así se pueden aplicar las correcciones sin ambigüedad):** una lista donde cada fila tenga: `unidad · sección · número o frase exacta · problema · corrección propuesta · gravedad (error / mejorable / opcional)`. Si algo está bien, no hace falta decirlo.",
  "",
  "**Convenciones del documento:** `*texto*` es cursiva (en la app, las palabras en italiano dentro de las explicaciones van en cursiva) y `**texto**` negrita. En los ejercicios, ✔ marca la opción correcta. Los audios de dictado y diálogos los lee la voz italiana del sistema (iOS); los de pronunciación son grabaciones nativas ya existentes y **no** están en este documento.",
  "",
  "## Alcance",
  "",
  `- ${counts.units} lecciones (15 unidades disponibles + la lección de la unidad 20, que aún no se usa).`,
  `- ${counts.examples} frases de ejemplo, ${counts.exercises} ejercicios y preguntas de comprensión.`,
  `- ${counts.vocab} palabras o expresiones de vocabulario, ${counts.dictation} frases de dictado, ${counts.dialogueLines} líneas de diálogo, 15 consignas de escritura con modelo.`,
  "- Pronunciación: pares mínimos y consejos por unidad. Shadowing: lista de videos (para juzgar si el nivel es adecuado).",
  "",
  "## Dudas de la IA que conviene mirar primero",
  "",
  "Frases o decisiones en las que el autor tenía menos certeza:",
  "",
  "- **u06**: «Porto la quarantaquattro» (talla 44) y «Che taglia porta?» como diálogo de tienda; «La prendo» (me la llevo) antes de enseñar los pronombres.",
  "- **u04 / u12**: «Cosa prende?» y «Vuole altro?» (camarero); «Altro? — No, grazie. Va bene così.» (verdulero); «Ecco il resto».",
  "- **u12**: «I pomodori di oggi sono più buoni di quelli di ieri» (¿mejor «più freschi» / «migliori»?). Explicación de *più buono / migliore* y *bene / meglio*.",
  "- **u01**: «Piacere di conoscervi!» en el modelo de escritura; «Benvenuta»; «Ho una prenotazione»; «Ecco la chiave: camera dodici».",
  "- **u07**: «Ci sentiamo dopo cena?» y «a dopo» en el diálogo por teléfono.",
  "- **u10**: «Siete state lì una settimana?»; «Mi sono divertita molto»; concordancia del participio en los ejemplos con *essere*.",
  "- **u13**: «La può cambiare con una taglia più grande»; «Le va bene?»; «Glielo do» y la nota «*gli* + *lo* = *glielo*» (se enseña solo para reconocerla).",
  "- **u14**: imperativo *Lei* (*vada, giri, attraversi, continui, prenda*) y *tu* (*dimmi, dammi, non parlare*); uso de *ne* y *ci*.",
  "- **u15**: «Potresti mandarmi…», «Mi dai un consiglio?», futuro de suposición («Sarà in ritardo»), raíces irregulares.",
  "- **u20** (aún no se usa): discurso indirecto y congiuntivo «solo para reconocer»: ¿está bien el nivel de la explicación?",
  "- **Vocabulario**: que cada palabra tenga el artículo correcto y que la traducción principal sea la más común (p. ej. «l'etto = cien gramos», «il cornetto = croissant», «la sera = la tarde-noche»).",
  "- **Pronunciación**: que los pares mínimos (p. ej. *giallo/gallo*, *pane/panna*, *peggio/pegno*) sean palabras reales y bien glosadas, y que las explicaciones de sonidos sean correctas para hispanohablantes.",
  "",
  "---",
  "",
);

const header = out.splice(0, out.length);
const chunks: { phase: number; lines: string[] }[] = [];

for (const phase of PHASES) {
  const units = UNITS.filter((u) => u.phase === phase.id && lessons.includes(u.id));
  if (units.length === 0) continue;
  out.splice(0, out.length);
  p(`# Fase ${phase.id} · ${phase.title}`, "", `_${phase.goal}_`, "");
  for (const u of units) {
    const lesson = LESSONS.find((l) => l.unit === u.id)!;
    p(`## Unidad ${u.n} — ${lesson.title}${readyIds.has(u.id) ? "" : "  _(lección escrita, unidad aún no usada)_"}`, "", `**Situación:** ${lesson.situation}`, "", "**Objetivos «Puedo…»:**", ...u.canDo.map((c) => `- ${c}`), "");

    p("### Lección: la regla", "");
    lesson.rule.forEach(block);
    p("**Recuadro «Ojo, en español…»:**", "", lesson.transfer, "");

    p("### Ejemplos", "", ...lesson.examples.map((e, i) => `${i + 1}. **${e.it}** — ${e.es}`), "");
    p("### Preguntas «Primero fíjate»", "", ...lesson.notice.map((e, i) => exercise(e, i)), "");
    p("### Ejercicios", "", ...lesson.exercises.map(exercise), "");

    const vocab = getVocab(u.id);
    if (vocab) p("### Vocabulario", "", "| Italiano | Español |", "|---|---|", ...vocab.map((v) => `| ${cell(v.it)} | ${cell(v.es)} |`), "");

    const dict = getDictation(u.id);
    if (dict) p("### Dictado (frases que la voz lee y la persona escribe)", "", ...dict.map((d, i) => `${i + 1}. **${d.it}** — ${d.es}`), "");

    const w = getWriting(u.id);
    if (w) p("### Escritura guiada", "", `**Consigna:** ${w.prompt}`, "", `**Texto modelo:** ${w.model}`, "", "**Lista de autocorrección:**", ...w.checklist.map((c) => `- ${c}`), "");

    const d = getDialogue(u.id);
    if (d) {
      p("### Diálogo", "", `**Escena:** ${d.setting}  ·  **Roles:** A = ${d.roles.A}, B = ${d.roles.B}`, "");
      p(...d.lines.map((l) => `- **${l.who}:** ${l.it} — _${l.es}_`), "");
    }

    const pron = getPronUnit(u.id);
    if (pron) {
      p("### Pronunciación", "", `**${pron.title}** — ${pron.tip}`, "");
      p(`Pares mínimos: ${pron.pairs.map(([a, b]) => `${a} (${GLOSS[a] ?? "?"}) / ${b} (${GLOSS[b] ?? "?"})`).join(" · ")}`, "", `Palabras para repetir: ${pron.words.join(", ")}`, "");
    }

    const sh = SHADOWING[u.id];
    if (sh) p("### Shadowing (videos de Easy Italian)", "", `- Principal: ${sh.main.title} — https://www.youtube.com/watch?v=${sh.main.id}`, `- Alternativo: ${sh.alt.title} — https://www.youtube.com/watch?v=${sh.alt.id}`, "");

    p("---", "");
  }
  chunks.push({ phase: phase.id, lines: [...out] });
}

// Un archivo con todo, y uno por fase (cada uno con las instrucciones) por si el chat no admite 140 KB.
writeFileSync("docs/revision-italiano.md", [...header, ...chunks.flatMap((c) => c.lines)].join("\n"));
for (const c of chunks) writeFileSync(`docs/revision-italiano-fase${c.phase}.md`, [...header, ...c.lines].join("\n"));
console.log(`docs/revision-italiano.md y ${chunks.length} archivos por fase`);
