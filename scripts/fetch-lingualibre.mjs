// Baja grabaciones nativas de Lingua Libre (Wikimedia Commons, CC BY-SA 4.0) para las palabras
// de src/content/pronunciation/weeks.json y deja src/content/pronunciation/manifest.json (palabra → archivos) + public/audio/ATTRIBUZIONI.md.
// Uso: npm run audio   (es idempotente: no vuelve a bajar lo que ya existe)

import { mkdir, readFile, writeFile, access } from "node:fs/promises";
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
    const res = await fetch(url, { headers: UA });
    if (res.status === 429 || res.status >= 500) {
      await sleep(4000 * (attempt + 1));
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return asJson ? res.json() : Buffer.from(await res.arrayBuffer());
  }
  throw new Error(`Demasiados reintentos: ${url}`);
}

const weeks = JSON.parse(await readFile(path.join(ROOT, "src/content/pronunciation/weeks.json"), "utf8"));
const words = [...new Set(weeks.weeks.flatMap((w) => [...w.pairs.flat(), ...w.words]))];

await mkdir(OUT, { recursive: true });
const MANIFEST = path.join(ROOT, "src/content/pronunciation/manifest.json");
const previous = JSON.parse(await readFile(MANIFEST, "utf8").catch(() => "{}"));
const manifest = {};
const credits = [];
const missing = [];

for (const word of words) {
  const lower = word.toLowerCase();
  const kept = previous[lower];
  if (kept?.length && (await Promise.all(kept.map((f) => exists(path.join(OUT, f))))).every(Boolean)) {
    manifest[lower] = kept;
    continue;
  }
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

  const chosen = found.slice(0, MAX_VOICES);
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
await writeFile(
  path.join(OUT, "ATTRIBUZIONI.md"),
  "# Atribuciones de audio\n\nGrabaciones de hablantes nativos de [Lingua Libre](https://lingualibre.org/), publicadas en Wikimedia Commons bajo licencia [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).\n\n" +
    credits.join("\n") + "\n",
);
console.log(missing.length ? `\nSIN AUDIO (quitar del JSON): ${missing.join(", ")}` : "\nTodas las palabras tienen audio.");
