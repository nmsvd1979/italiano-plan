// Arma scripts/tts/frases.json: la lista única de frases italianas que reciben un clip de voz sintética (docs/v2/03, C3).
// La clave es el texto que la app le pasa a say() (normalizado: sin asteriscos, espacios colapsados).
//
// Fuentes: dictados, diálogos, lecturas (cada párrafo de `it`, que es lo que lee el botón «Escuchar»), ítems «listen» de sinpista,
// ítems de escucha de pruebas y ejemplos de las lecciones. Entran también las palabras de AUDIO_PENDING (pronunciación sin
// grabación nativa), cada una como frase suelta. Además, SOLO para las unidades de `alcance-nuevo.json` (audio por fase):
// frases de ejemplo del vocabulario (G3), textos modelo de escritura (y su ampliación), modelos de monólogo, los números de «Números a velocidad» y las palabras
// de la pronunciación semanal que no tienen grabación nativa. NO entran palabras sueltas del vocabulario ni pares mínimos
// de pronunciación que sí tienen audio nativo. Las frases sin confirmar (scripts/tts/exclusiones.json) se excluyen.
//
// Uso: node scripts/tts/extraer.mjs

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { motivoDeExclusion, normalizar } from "./comun.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const json = (p) => JSON.parse(readFileSync(path.join(ROOT, p), "utf8"));

const server = await createServer({ root: ROOT, server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
try {
  const { UNITS } = await server.ssrLoadModule("/src/content/curriculum.ts");
  const { getDictation } = await server.ssrLoadModule("/src/content/dictation.ts");
  const { getDialogue } = await server.ssrLoadModule("/src/content/dialogues.ts");
  const { getLesson } = await server.ssrLoadModule("/src/content/grammar/index.ts");
  const { AUDIO_PENDING, PRON_UNITS, audioFiles } = await server.ssrLoadModule("/src/content/pronunciation/index.ts");
  const { getWords } = await server.ssrLoadModule("/src/content/vocab.ts");
  const { getWriting } = await server.ssrLoadModule("/src/content/writing.ts");
  const { getMonologue } = await server.ssrLoadModule("/src/content/monologos.ts");
  const { getPronStep } = await server.ssrLoadModule("/src/content/pronunciation/sequence.ts");
  const { COURSE } = await server.ssrLoadModule("/src/content/course.ts");
  const { getVelocidad } = await server.ssrLoadModule("/src/content/velocidad.ts");

  /** @type {{ fuente: string, texto: string, unidad: string }[]} */
  const crudo = [];
  const add = (fuente, unidad, texto) => { if (typeof texto === "string" && normalizar(texto)) crudo.push({ fuente, unidad, texto: normalizar(texto) }); };

  for (const u of UNITS) {
    for (const d of getDictation(u.id) ?? []) add("dictado", u.id, d.it);
    for (const l of getDialogue(u.id)?.lines ?? []) add("diálogo", u.id, l.it);
    for (const e of getLesson(u.id)?.examples ?? []) add("ejemplo", u.id, e.it);
  }
  for (const [u, t] of Object.entries(json("src/content/lectura.json"))) for (const p of t.it) add("lectura", u, p);
  for (const [u, items] of Object.entries(json("src/content/sinpista.json"))) for (const x of items) if (x.type === "listen") add("sinpista", u, x.prompt);
  // Unidad de cada palabra pendiente: la primera cuya pronunciación la usa (para que el gestor de descarga la baje con su unidad).
  const unidadDe = new Map();
  for (const pu of PRON_UNITS) for (const w of [...pu.pairs.flat(), ...pu.words]) if (!unidadDe.has(w) || pu.unit < unidadDe.get(w)) unidadDe.set(w, pu.unit);
  for (const w of AUDIO_PENDING) add("pendiente", unidadDe.get(w) ?? "u99", w);
  for (const [u, t] of Object.entries(json("src/content/pruebas.json"))) for (const x of t.escucha ?? []) add("prueba", u, x.it);

  // Fuentes nuevas, por fase (scripts/tts/alcance-nuevo.json).
  const alcance = new Set(json("scripts/tts/alcance-nuevo.json").unidades);
  for (const step of COURSE.filter((x) => alcance.has(x.unit))) {
    for (const w of getWords(step.unit) ?? []) if (w.ex && (!step.part || !w.part || w.part === step.part)) add("vocab-ejemplo", step.unit, w.ex);
    const wr = getWriting(step.unit, step.part ?? null);
    if (wr) { add("escritura", step.unit, wr.model); if (wr.extend) add("escritura", step.unit, wr.extend.model); }
    for (const v of getVelocidad(step.id) ?? []) add("número", step.unit, v.it);
    const mo = getMonologue(step.id);
    if (mo) add("monólogo", step.unit, mo.model);
    const pr = getPronStep(step.id);
    if (pr) for (const w of [...pr.pairs.flat(), ...pr.words]) {
      // Sin grabación nativa; una o dos letras sueltas no se sintetizan bien (se oyen dentro de las frases).
      if (audioFiles(w).length === 0 && normalizar(w).length > 2) add("pron-semana", step.unit, w);
    }
  }

  // Textos largos de «Práctica B1» (lecturas por párrafo; escuchas línea por línea, como las lee la pantalla).
  for (const [id, t] of Object.entries(json("src/content/lecturas-b1.json"))) for (const p of t.it) add("práctica-b1", "u23", p);
  for (const [id, t] of Object.entries(json("src/content/escucha-b1.json"))) for (const l of t.lines) add("práctica-b1", "u23", l.it);

  const exclusiones = json("scripts/tts/exclusiones.json");
  const porTexto = new Map();
  for (const { fuente, unidad, texto } of crudo) {
    const e = porTexto.get(texto) ?? { texto, unidad, fuentes: [] };
    if (unidad < e.unidad) e.unidad = unidad; // primera unidad que usa la frase (el gestor de descarga baja primero las unidades iniciales)
    if (!e.fuentes.includes(fuente)) e.fuentes.push(fuente);
    porTexto.set(texto, e);
  }
  const frases = [];
  const excluidas = [];
  for (const e of [...porTexto.values()].sort((a, b) => a.texto.localeCompare(b.texto, "it"))) {
    const motivo = motivoDeExclusion(e.texto, exclusiones);
    if (motivo) excluidas.push({ ...e, motivo });
    else frases.push(e);
  }

  writeFileSync(path.join(ROOT, "scripts/tts/frases.json"), JSON.stringify({ frases, excluidas }, null, 1) + "\n");

  const fuentes = ["dictado", "diálogo", "lectura", "sinpista", "prueba", "ejemplo", "pendiente", "vocab-ejemplo", "escritura", "monólogo", "pron-semana", "práctica-b1", "número"];
  console.log("Por fuente (elementos leídos → textos distintos que entran, tras excluir):");
  for (const f of fuentes) {
    const leidos = crudo.filter((c) => c.fuente === f).length;
    const entran = frases.filter((x) => x.fuentes.includes(f)).length;
    console.log(`  ${f.padEnd(9)} ${String(leidos).padStart(5)} → ${String(entran).padStart(5)}`);
  }
  console.log(`Elementos leídos: ${crudo.length} · textos distintos: ${porTexto.size} · excluidos: ${excluidas.length} · TOTAL en el manifiesto: ${frases.length}`);
  for (const x of excluidas) console.log(`  excluida: «${x.texto}» (${x.fuentes.join(", ")}) — ${x.motivo}`);
} finally {
  await server.close();
}
