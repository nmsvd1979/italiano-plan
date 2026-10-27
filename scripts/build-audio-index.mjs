// Genera public/audio-index.json: la lista de verdad de los audios que el gestor de descarga baja a la caché.
// Cada entrada: { url: "audio/<archivo>", bytes, unit }. `unit` es la primera unidad cuya pronunciación usa la palabra
// ("" si ninguna). Corre en `prebuild` y al final de `npm run audio`.

import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AUDIO = path.join(ROOT, "public", "audio");
const OUT = path.join(ROOT, "public", "audio-index.json");

const readJson = async (p) => JSON.parse(await readFile(path.join(ROOT, p), "utf8"));

export async function buildAudioIndex() {
  const units = (await readJson("src/content/pronunciation/units.json")).units;
  const manifest = await readJson("src/content/pronunciation/manifest.json");

  const vocab = await readJson("src/content/vocab.json");

  // Palabra → primera unidad que la usa (pronunciación o vocabulario). En vocabulario se quita el artículo, como hace say().
  const unitOfWord = new Map();
  const claim = (word, unit) => {
    const w = word.toLowerCase();
    if (!unitOfWord.has(w) || unit < unitOfWord.get(w)) unitOfWord.set(w, unit);
  };
  for (const u of units) for (const w of [...u.pairs.flat(), ...u.words]) claim(w, u.unit);
  for (const [unit, items] of Object.entries(vocab)) {
    for (const { it } of items) claim(it.trim().replace(/^(?:(?:il|lo|la|i|gli|le|un|uno|una)\s+|l'|un')/i, ""), unit);
  }
  const unitOfFile = new Map();
  for (const [word, files] of Object.entries(manifest)) {
    for (const f of files) if (!unitOfFile.has(f)) unitOfFile.set(f, unitOfWord.get(word.toLowerCase()) ?? "");
  }

  const files = (await readdir(AUDIO)).filter((f) => f.endsWith(".mp3")).sort();
  const index = [];
  for (const f of files) {
    index.push({ url: `audio/${f}`, bytes: (await stat(path.join(AUDIO, f))).size, unit: unitOfFile.get(f) ?? "" });
  }
  return index;
}

export async function writeAudioIndex() {
  const index = await buildAudioIndex();
  await writeFile(OUT, JSON.stringify(index) + "\n");
  return index;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const index = await writeAudioIndex();
  console.log(`audio-index.json: ${index.length} archivos, ${(index.reduce((s, e) => s + e.bytes, 0) / 1e6).toFixed(1)} MB`);
}
