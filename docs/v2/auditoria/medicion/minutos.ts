import { COURSE } from "../../../../src/content/course";
import { getUnit } from "../../../../src/content/curriculum";
import { daysOf, isSoon } from "../../../../src/domain/cycle";
// Minutos nominales por tipo de bloque en una semana del curso (todas las semanas son iguales) y reparto core / no core / «en preparación».
const step = COURSE[0];
const unit = getUnit(step.unit)!;
const byKind = new Map<string, { min: number; n: number; core: boolean }>();
let soon = 0, core = 0, rest = 0;
for (const d of daysOf(step)) for (const b of d.blocks) {
  if (isSoon(b, unit)) { soon += b.minutes; continue; }
  const k = `${b.kind}:${b.id}`;
  byKind.set(k, { min: b.minutes, n: (byKind.get(k)?.n ?? 0) + 1, core: b.core });
  if (b.core) core += b.minutes; else rest += b.minutes;
}
for (const [k, v] of byKind) console.log(k.padEnd(22), v.n, "×", v.min, "=", v.n * v.min, v.core ? "core" : "");
console.log("TOTAL con contenido", core + rest, "· core", core, "· no core", rest, "· en preparación", soon);
const per = (re: RegExp) => [...byKind].filter(([k]) => re.test(k)).reduce((n, [, v]) => n + v.n * v.min, 0);
console.log("diálogo (4 pasadas)", per(/^dialogue:/), "· palabras (4 pasadas)", per(/^vocab:/), "· repaso espaciado", per(/^srs:/), "· repaso mixto", per(/^review:/), "· input libre", per(/^input:/));
