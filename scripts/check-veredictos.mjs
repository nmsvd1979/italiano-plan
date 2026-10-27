// Cuenta los veredictos de docs/v2/auditoria/_veredictos.md y escribe el conteo entre las marcas.
// Uso: node scripts/check-veredictos.mjs   (falla si una celda no es C, A o R)
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "docs/v2/auditoria/_veredictos.md";
const text = readFileSync(FILE, "utf8");
const rows = text.split("\n").filter((l) => /^\| u\d\d \|/.test(l));
if (rows.length !== 24) throw new Error(`Se esperaban 24 filas y hay ${rows.length}`);

const cols = ["T", "Rg", "Ex", "Di", "Pr", "It"];
const total = { C: 0, A: 0, R: 0 };
const byCol = Object.fromEntries(cols.map((c) => [c, { C: 0, A: 0, R: 0 }]));
const unitsWithR = [];
for (const r of rows) {
  const cells = r.split("|").map((c) => c.trim());
  const id = cells[1];
  const v = cells.slice(2, 8);
  v.forEach((x, i) => {
    if (!["C", "A", "R"].includes(x)) throw new Error(`${id}: veredicto inválido «${x}»`);
    total[x]++;
    byCol[cols[i]][x]++;
  });
  if (v.includes("R")) unitsWithR.push(id);
}
const out = [
  `Celdas: ${rows.length * 6}. Conservar (C): ${total.C} · Ajustar (A): ${total.A} · Reescribir o reubicar (R): ${total.R}.`,
  `Unidades con al menos una R: ${unitsWithR.length} de 24 (${unitsWithR.join(", ")}).`,
  "",
  "| Columna | C | A | R |",
  "|---|---|---|---|",
  ...cols.map((c) => `| ${c} | ${byCol[c].C} | ${byCol[c].A} | ${byCol[c].R} |`),
].join("\n");
const next = text.replace(/<!-- conteo-generado -->[\s\S]*<!-- fin-conteo -->/, `<!-- conteo-generado -->\n${out}\n<!-- fin-conteo -->`);
writeFileSync(FILE, next);
console.log(out);
