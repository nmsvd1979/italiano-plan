// Cobertura del léxico de la app frente a una lista de frecuencia (docs/v2/plan-b1/08, «Suficiencia del vocabulario»).
// Mide qué parte de las palabras más frecuentes del italiano aparece en lo que la app muestra (`appLexicon`: vocabulario con frase,
// diálogos, dictados, lecciones y modelos de escritura) y, con --mazo, también en las 574 del mazo de frecuencia.
//
//   npx vite-node scripts/cobertura-lexico.ts <it_50k.txt> [--mazo] [--faltan N]
//
// La lista (hermitdave/FrequencyWords, content/2018/it/it_50k.txt, subtítulos de cine y TV) NO se guarda en el repositorio: se
// baja solo para medir. Es por formas exactas (una forma nueva de un verbo ya enseñado cuenta como ausente), así que subestima
// lo que una persona entiende. No mide cobertura por ámbito (trabajo, salud…): para eso haría falta etiquetar cada palabra.
import fs from "node:fs";
import { appLexicon, wordsOf } from "../src/content/lexicon";
import base from "../src/content/base-frecuente.json";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
if (!file) {
  console.error("Uso: npx vite-node scripts/cobertura-lexico.ts <it_50k.txt> [--mazo] [--faltan N]");
  process.exit(1);
}
const withDeck = args.includes("--mazo");
const missingN = Number(args[args.indexOf("--faltan") + 1]) || 0;

const lex = new Set(appLexicon());
if (withDeck) for (const w of base as { it: string; ex: string }[]) for (const x of wordsOf(`${w.it} ${w.ex}`)) lex.add(x);
const has = (w: string): boolean => lex.has(w) || lex.has(`${w}'`) || lex.has(w.replace(/'$/, ""));

const rows = fs.readFileSync(file, "utf8").trim().split("\n").map((l) => l.split(" "));
const freq = rows.map(([w, n]) => ({ w: w.toLowerCase(), n: Number(n) })).filter((r) => /^[a-zà-ÿ]+'?$/.test(r.w) && r.w.length > 1);
const total = freq.reduce((s, r) => s + r.n, 0);

const bands = [100, 500, 1000, 2000, 5000, 10000, 20000];
console.log(`Léxico de la app: ${lex.size} formas${withDeck ? " (con el mazo de frecuencia)" : ""}. Lista: ${freq.length} formas.`);
console.log("Primeras N formas de la lista → cuántas aparecen en la app (por formas | por apariciones en subtítulos)");
for (const b of bands) {
  const top = freq.slice(0, b);
  const inApp = top.filter((r) => has(r.w));
  const wt = top.reduce((s, r) => s + r.n, 0);
  const wi = inApp.reduce((s, r) => s + r.n, 0);
  console.log(`  ${String(b).padStart(6)}: ${((100 * inApp.length) / top.length).toFixed(1)} % de las formas | ${((100 * wi) / wt).toFixed(1)} % de las apariciones`);
}
const covered = freq.filter((r) => has(r.w)).reduce((s, r) => s + r.n, 0);
console.log(`Todas las formas de la lista: ${((100 * covered) / total).toFixed(1)} % de las apariciones`);
let acc = 0;
let k = 0;
for (const r of freq) { acc += r.n; k++; if (acc / total >= 0.95) break; }
console.log(`Para el 95 % de las apariciones hacen falta ${k} formas.`);
if (missingN > 0) {
  console.log(`\nLas ${missingN} formas más frecuentes que NO están en la app:`);
  console.log(freq.filter((r) => !has(r.w)).slice(0, missingN).map((r) => r.w).join(" "));
}
