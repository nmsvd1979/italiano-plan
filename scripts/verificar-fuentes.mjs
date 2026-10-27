// Verificación del italiano del curso contra fuentes externas comprobables (sin hablante nativo).
// 1) Extrae el italiano:   npx vite-node scripts/extraer-italiano.ts <dir>/italiano.json
// 2) Baja las listas (solo para verificar; NO se copian al repositorio):
//      napolux/paroleitaliane: 280000_parole_italiane.txt → <dir>/w280.txt ; 9000_nomi_propri.txt → <dir>/nomi.txt
//      hermitdave/FrequencyWords: content/2018/it/it_50k.txt → <dir>/it50k.txt   (subtítulos de cine/TV)
// 3) Corre:                node scripts/verificar-fuentes.mjs <dir>
// Salida en <dir>: bad.txt (palabras no reconocidas; revisar a mano: incluye español y morfemas), rare.txt (vocabulario fuera de las 5.000 más frecuentes).
import fs from "node:fs";
import path from "node:path";
const dir = process.argv[2] ?? ".";
const P = (f) => path.join(dir, f);
const L = (f) => fs.readFileSync(P(f), "utf8").split("\n").map((s) => s.trim().toLowerCase()).filter(Boolean);
const dict = new Set([...L("w280.txt"), ...L("nomi.txt")]);
const freq = new Map(fs.readFileSync(P("it50k.txt"), "utf8").trim().split("\n").map((l, i) => [l.split(" ")[0], i + 1]));
const data = JSON.parse(fs.readFileSync(P("italiano.json"), "utf8"));
const FUNC = new Set(["il", "lo", "la", "gli", "le", "un", "una", "uno", "di", "a", "da", "in", "per", "con", "su"]);
const words = (s) => s.replace(/\*/g, "").normalize("NFC").split(/[^A-Za-zÀ-ÿ']+/).flatMap((r) => r.split("'")).filter((t) => t.length > 1);
const bad = new Map();
for (const f of data) for (const t0 of words(f.text)) {
  const t = t0.toLowerCase();
  if (dict.has(t) || (freq.get(t) ?? 1e9) <= 30000) continue;
  const e = bad.get(t) ?? { n: 0, units: new Set(), ex: f.text, src: f.src };
  e.n++; e.units.add(f.unit); bad.set(t, e);
}
const arr = [...bad.entries()].sort((a, b) => b[1].n - a[1].n);
fs.writeFileSync(P("bad.txt"), arr.map(([k, e]) => `${k}\t${e.n}\t${[...e.units].join(",")}\t${e.src}\t${e.ex}`).join("\n"));
const vocab = data.filter((f) => f.src === "vocab");
const bins = { "≤1000": 0, "1001-2000": 0, "2001-5000": 0, "5001-20000": 0, ">20000/ausente": 0 };
const rare = [];
for (const v of vocab) {
  const w = words(v.text).map((x) => x.toLowerCase()).filter((x) => !FUNC.has(x));
  const k = w.length ? Math.min(...w.map((x) => freq.get(x) ?? 1e9)) : 1e9;
  bins[k <= 1000 ? "≤1000" : k <= 2000 ? "1001-2000" : k <= 5000 ? "2001-5000" : k <= 20000 ? "5001-20000" : ">20000/ausente"]++;
  if (k > 5000) rare.push(`${v.unit}\t${v.text}\t${k === 1e9 ? "—" : k}`);
}
fs.writeFileSync(P("rare.txt"), rare.join("\n"));
console.log(JSON.stringify({ fragmentos: data.length, noReconocidas: arr.length, vocab: vocab.length, bins }, null, 1));
