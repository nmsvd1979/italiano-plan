// Baja grabaciones nativas de Lingua Libre (Wikimedia Commons, CC BY-SA 4.0) para las palabras
// de src/content/pronunciation/units.json y deja src/content/pronunciation/manifest.json (palabra → archivos) + public/audio/ATTRIBUZIONI.md.
// Uso: npm run audio   (es idempotente: no vuelve a bajar lo que ya existe)

import { mkdir, readFile, writeFile, access, readdir, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "audio");
const API = "https://commons.wikimedia.org/w/api.php";
const UA = { "User-Agent": "italiano-plan/2.0 (https://github.com/nmsvd1979/italiano-plan; estudio personal)" };
const MAX_VOICES = 3;
const DELAY = 1200;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const exists = (p) => access(p).then(() => true, () => false);
const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function get(url, asJson = true) {
  for (let attempt = 0; attempt < 6; attempt++) {
    let res;
    try {
      res = await fetch(url, { headers: UA });
    } catch {
      await sleep(4000 * (attempt + 1)); // sin red un momento: reintenta
      continue;
    }
    if (res.status === 429 || res.status >= 500) {
      await sleep(4000 * (attempt + 1));
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return asJson ? res.json() : Buffer.from(await res.arrayBuffer());
  }
  throw new Error(`Demasiados reintentos: ${url}`);
}

const units = JSON.parse(await readFile(path.join(ROOT, "src/content/pronunciation/units.json"), "utf8"));
const vocab = JSON.parse(await readFile(path.join(ROOT, "src/content/vocab.json"), "utf8"));

// Palabra → cuántas voces bajar. Las de pronunciación llevan hasta 3 (para entrenar el oído con varias voces);
// las del vocabulario solo 1 (para no inflar la app). Solo palabras sueltas: las frases usan la voz del sistema.
const ARTICLE = /^(?:(?:il|lo|la|i|gli|le)\s+|l')/i;
const wanted = new Map();
for (const w of units.units.flatMap((u) => [...u.pairs.flat(), ...u.words])) wanted.set(w, MAX_VOICES);
for (const v of Object.values(vocab).flat()) {
  const bare = v.it.replace(ARTICLE, "").toLowerCase();
  if (/^[a-zàèéìòù]+$/.test(bare) && !wanted.has(bare)) wanted.set(bare, 1);
}
const words = [...wanted.keys()];

await mkdir(OUT, { recursive: true });
const MANIFEST = path.join(ROOT, "src/content/pronunciation/manifest.json");
const previous = JSON.parse(await readFile(MANIFEST, "utf8").catch(() => "{}"));
const manifest = {};
const credits = [];
const missing = [];

for (const word of words) {
  const lower = word.toLowerCase();
  const kept = previous[lower];
  const haveFiles = kept?.length && (await Promise.all(kept.map((f) => exists(path.join(OUT, f))))).every(Boolean);
  const search = new URLSearchParams({
    action: "query", list: "search", srnamespace: "6", srlimit: "50", format: "json",
    srsearch: `intitle:"LL-Q652 (ita)" intitle:"-${lower}.wav"`,
  });
  const found = (await get(`${API}?${search}`)).query.search
    .map((h) => h.title)
    .map((t) => ({ title: t, m: t.match(/^File:LL-Q652 \(ita\)-(.+)-([^-]+)\.wav$/) }))
    .filter((x) => x.m && x.m[2].toLowerCase() === lower)
    .map((x) => ({ title: x.title, speaker: x.m[1] }));
  await sleep(DELAY);

  // Ya descargada: solo se reconstruyen los créditos (hay que atribuir cada archivo, CC BY-SA 4.0).
  if (haveFiles) {
    manifest[lower] = kept;
    for (const file of kept) {
      const hit = found.find((f) => `${slug(lower)}--${slug(f.speaker)}.mp3` === file);
      if (!hit) console.warn(`  (sin crédito para ${file})`);
      else credits.push(`- \`${file}\` — «${word}», voz de ${hit.speaker} — https://commons.wikimedia.org/wiki/${encodeURI(hit.title.replace(/ /g, "_"))}`);
    }
    continue;
  }

  const chosen = found.slice(0, wanted.get(word));
  if (chosen.length === 0) {
    missing.push(word);
    continue;
  }

  const info = new URLSearchParams({
    action: "query", titles: chosen.map((c) => c.title).join("|"), prop: "videoinfo", viprop: "derivatives", format: "json",
  });
  const pages = Object.values((await get(`${API}?${info}`)).query.pages);
  await sleep(DELAY);

  manifest[lower] = [];
  for (const c of chosen) {
    const page = pages.find((p) => p.title === c.title);
    const mp3 = page?.videoinfo?.[0]?.derivatives?.find((d) => d.src.endsWith(".mp3"))?.src;
    if (!mp3) continue;
    const file = `${slug(lower)}--${slug(c.speaker)}.mp3`;
    const target = path.join(OUT, file);
    if (!(await exists(target))) {
      await writeFile(target, await get(mp3, false));
      await sleep(DELAY);
    }
    manifest[lower].push(file);
    credits.push(`- \`${file}\` — «${word}», voz de ${c.speaker} — https://commons.wikimedia.org/wiki/${encodeURI(c.title.replace(/ /g, "_"))}`);
  }
  if (manifest[lower].length === 0) {
    delete manifest[lower];
    missing.push(word);
  }
  console.log(`${word}: ${manifest[lower]?.length ?? 0} voz/voces`);
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
// Borra grabaciones que ya no están en el manifest (sobras de corridas interrumpidas o palabras quitadas).
const used = new Set(Object.values(manifest).flat());
for (const f of await readdir(OUT)) if (f.endsWith(".mp3") && !used.has(f)) await unlink(path.join(OUT, f));
await writeFile(
  path.join(OUT, "ATTRIBUZIONI.md"),
  "# Atribuciones de audio\n\nGrabaciones de hablantes nativos de [Lingua Libre](https://lingualibre.org/), publicadas en Wikimedia Commons bajo licencia [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).\n\n" +
    credits.join("\n") + "\n",
);
console.log(missing.length ? `\nSIN AUDIO (quitar del JSON): ${missing.join(", ")}` : "\nTodas las palabras tienen audio.");
