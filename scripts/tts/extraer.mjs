// Arma scripts/tts/frases.json: la lista única de frases italianas que reciben un clip de voz sintética (docs/v2/03, C3).
// La clave es el texto que la app le pasa a say() (normalizado: sin asteriscos, espacios colapsados).
//
// Fuentes: dictados, diálogos, lecturas (cada párrafo de `it`, que es lo que lee el botón «Escuchar»), ítems «listen» de sinpista,
// ítems de escucha de pruebas y ejemplos de las lecciones. NO entran palabras sueltas del vocabulario ni pares mínimos
// de pronunciación (esos usan audio nativo). Las frases sin confirmar (scripts/tts/exclusiones.json) se excluyen.
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
  for (const [u, t] of Object.entries(json("src/content/pruebas.json"))) for (const x of t.escucha ?? []) add("prueba", u, x.it);

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

  const fuentes = ["dictado", "diálogo", "lectura", "sinpista", "prueba", "ejemplo"];
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
