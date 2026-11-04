import { UNITS } from "../../../../src/content/curriculum";
import { COURSE } from "../../../../src/content/course";
import { getLesson } from "../../../../src/content/grammar";
import { getSinPista } from "../../../../src/content/sinpista";
import { getDictation } from "../../../../src/content/dictation";
import pruebas from "../../../../src/content/pruebas.json";
const P: any = pruebas;
const rows: any[] = [];
for (const u of UNITS) {
  const L = getLesson(u.id)!; const SP = getSinPista(u.id); const c = u.canDo.length;
  const steps = COURSE.filter((s) => s.unit === u.id).length;
  const fill = L.exercises.filter((e) => e.type === "fill").length;
  const choice = L.exercises.length - fill;
  const spProd = SP.filter((s) => ["translate", "fix", "transform", "order"].includes(s.type)).length;
  const pG = (P[u.id]?.gramatica ?? []).length;
  const total = L.exercises.length + L.notice.length + SP.length + pG + (getDictation(u.id)?.length ?? 0);
  rows.push({ u: u.id, c, steps, ejer: L.exercises.length, fill, choice, notice: L.notice.length, sp: SP.length, spProd, pG, dict: getDictation(u.id)?.length ?? 0, total, ejPerC: +(L.exercises.length / c).toFixed(1), totPerC: +(total / c).toFixed(1), ejPerWeek: +(L.exercises.length / steps).toFixed(1), prodEsc: fill + spProd });
}
console.log(["u","canDo","sem","ejer","fill","choice","notice","sp","spProd","pruebaG","dict","total","ejer/canDo","tot/canDo","ejer/sem","prodEsc"].join("\t"));
for (const r of rows) console.log(Object.values(r).join("\t"));
const tot = (k: string) => rows.reduce((n, r) => n + r[k], 0);
console.log("TOT", tot("c"), tot("steps"), tot("ejer"), tot("fill"), tot("choice"), tot("notice"), tot("sp"), tot("spProd"), tot("pG"), tot("dict"), tot("total"));
console.log("flojas (ejer/canDo<8):", rows.filter((r) => r.ejPerC < 8).map((r) => r.u + "=" + r.ejPerC).join(" "));
console.log("flojas (tot/canDo<14):", rows.filter((r) => r.totPerC < 14).map((r) => r.u + "=" + r.totPerC).join(" "));
console.log("flojas (ejer/semana<12):", rows.filter((r) => r.ejPerWeek < 12).map((r) => r.u + "=" + r.ejPerWeek).join(" "));
