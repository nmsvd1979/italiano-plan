import { UNITS } from "../../../../src/content/curriculum";
import { COURSE } from "../../../../src/content/course";
import { getLesson } from "../../../../src/content/grammar";
import { getVocab } from "../../../../src/content/vocab";
import { getDictation } from "../../../../src/content/dictation";
import { getDialogue } from "../../../../src/content/dialogues";
import { getWriting } from "../../../../src/content/writing";
import { getSinPista } from "../../../../src/content/sinpista";
import { getLectura } from "../../../../src/content/lectura";
import { PARTS } from "../../../../src/content/partes";
import { gradeFill } from "../../../../src/domain/grading";
import pruebas from "../../../../src/content/pruebas.json";
const P: any = pruebas;
const strip = (s: string) => s.replace(/\*/g, "");
const nrm = (s: string) => strip(s).toLowerCase().normalize("NFC").replace(/[^\p{L}\p{N}' ]/gu, " ").replace(/\s+/g, " ").trim();
const out: string[] = [];
const rule = (c: boolean, msg: string) => { if (!c) out.push("REGLA " + msg); };
const seen = new Map<string, string[]>();
const reg = (kind: string, text: string, where: string) => { const k = kind + "|" + nrm(text); seen.set(k, [...(seen.get(k) ?? []), where]); };
const es: { where: string; text: string }[] = [];
for (const u of UNITS) {
  const L = getLesson(u.id)!; const V = getVocab(u.id) ?? []; const D = getDictation(u.id) ?? []; const Dg = getDialogue(u.id); const W = getWriting(u.id);
  rule(L.examples.length >= 5, u.id + " ejemplos " + L.examples.length); rule(L.notice.length >= 3, u.id + " notice " + L.notice.length); rule(L.exercises.length >= 10, u.id + " ejercicios");
  rule(V.length >= 18 && V.length <= 24, u.id + " vocab " + V.length); rule(D.length >= 5, u.id + " dictado"); rule(!!W && W.minChars <= 120, u.id + " minChars " + W?.minChars);
  rule(!!Dg && Dg.lines.length >= 6 && Dg.lines.some((l) => l.who === "A") && Dg.lines.some((l) => l.who === "B"), u.id + " dialogo");
  L.exercises.forEach((e, i) => {
    if (e.type === "fill") { rule(e.prompt.split("___").length - 1 === 1, u.id + " fill#" + i + " ___");
      for (const a of e.answers) rule(gradeFill(a, e.answers) === "correct", u.id + " fill#" + i + " respuesta no califica: " + a);
      const hint = e.prompt.match(/\(([^)]*)\)/g) ?? []; for (const h of hint) for (const a of e.answers) if (a.length > 2 && nrm(h).split(" ").includes(nrm(a))) out.push("PISTA=RESPUESTA " + u.id + " fill#" + i + " " + e.prompt);
      reg("ej", e.prompt, u.id + "#" + i); }
    else { rule(e.answer >= 0 && e.answer < e.options.length, u.id + " choice#" + i + " indice"); reg("ej", e.prompt + "|" + e.options[e.answer], u.id + "#" + i); }
    es.push({ where: u.id + " ej#" + i + " why", text: e.why });
  });
  for (const e of L.examples) { reg("ex", e.it, u.id); es.push({ where: u.id + " ejemplo es", text: e.es }); }
  for (const d of D) { reg("dic", d.it, u.id); es.push({ where: u.id + " dictado es", text: d.es }); }
  for (const l of Dg?.lines ?? []) { reg("dia", l.it, u.id); es.push({ where: u.id + " dialogo es", text: l.es }); }
  for (const v of V) { reg("voc", v.it.replace(/^(il|lo|la|l'|i|gli|le|un|uno|una)\s*/i, ""), u.id); es.push({ where: u.id + " vocab es", text: v.es }); }
  es.push({ where: u.id + " transfer", text: L.transfer }); es.push({ where: u.id + " situation", text: L.situation });
  if (W) { es.push({ where: u.id + " escritura prompt", text: W.prompt }); for (const c of W.checklist) es.push({ where: u.id + " escritura check", text: c }); }
  for (const s of getSinPista(u.id)) { reg("sp", (s as any).prompt ?? (s as any).lines?.join(" "), u.id); es.push({ where: u.id + " sinpista why", text: s.why }); }
  for (const x of [...(P[u.id]?.gramatica ?? [])]) reg("ej", x.prompt, "prueba " + u.id);
}
for (const s of COURSE) { const l = getLectura(s.id); if (l) { for (const q of l.preguntas) es.push({ where: s.id + " lectura q", text: q.q }); for (const p of l.es) es.push({ where: s.id + " lectura es", text: p }); } }
// duplicados
const dup = [...seen.entries()].filter(([k, w]) => w.length > 1 && !k.startsWith("voc|") && !k.startsWith("ex|") ).map(([k, w]) => k + " -> " + w.join(", "));
const dupV = [...seen.entries()].filter(([k, w]) => (k.startsWith("voc|")) && new Set(w).size > 1).map(([k, w]) => k + " -> " + w.join(","));
const dupEx = [...seen.entries()].filter(([k, w]) => k.startsWith("ex|") && new Set(w).size > 1).map(([k, w]) => k + " -> " + w.join(","));
// voseo / regionalismos (más amplio que lang.test.ts)
const VOS = /\b(vos|sos|tenés|querés|podés|sabés|hacés|decís|venís|mirá|escuchá|repetí|fijate|acordate|sentate|andá|hacé|decime|dale|boludo|che|ché|pibe|laburo|plata|bondi|colectivo|pileta|heladera|lindo)\b/i;
const REG = /\b(ordenador|coche|móvil|vale|vosotros|vuestro|vuestra|guay|tío|molar|currar|zumo|patata|melocotón|aparcar|chaval|pibe|polera|cachái|po\b|bacán|fome|pololo|weón)\b/i;
const vo = es.filter((e) => VOS.test(e.text)).map((e) => e.where + ": " + e.text.slice(0, 90));
const re = es.filter((e) => REG.test(e.text)).map((e) => e.where + ": " + e.text.slice(0, 90));
// referencias a unidades inexistentes o botones
const refs = es.flatMap((e) => [...e.text.matchAll(/\b[Uu]nidad(?:es)?\s+(\d+)/g)].map((m) => ({ where: e.where, n: +m[1], text: e.text.slice(0, 90) }))).filter((r) => r.n < 1 || r.n > 28);
const refsU = es.flatMap((e) => [...e.text.matchAll(/\bu(\d{2})\b/g)].map((m) => ({ where: e.where, n: +m[1], text: e.text }))).filter((r) => r.n < 1 || r.n > 28);
const quoted = es.flatMap((e) => [...e.text.matchAll(/«([^»]{3,40})»/g)].map((m) => ({ where: e.where, q: m[1] }))).filter((x) => /botón|pulsa|toca|clic|haz clic|presiona/i.test(es.find((e) => e.where === x.where && e.text.includes(x.q))?.text ?? ""));
// partes
const partOut: string[] = [];
for (const [uid, parts] of Object.entries(PARTS)) { const L = getLesson(uid)!; const V = getVocab(uid)!; const D = getDictation(uid)!;
  const lens: any = { examples: L.examples.length, notice: L.notice.length, exercises: L.exercises.length, vocab: V.length, dictation: D.length };
  for (const k of Object.keys(lens)) { const a = new Set((parts.A as any)[k] ?? []), b = new Set((parts.B as any)[k] ?? []); const both = [...a].filter((x) => b.has(x)).length; const miss = Array.from({ length: lens[k] }, (_, i) => i).filter((i) => !a.has(i) && !b.has(i)).length;
    partOut.push(uid + " " + k.padEnd(9) + " total " + String(lens[k]).padStart(2) + " A " + String(a.size).padStart(2) + " B " + String(b.size).padStart(2) + " compartidos " + both + " sin asignar " + miss); } }
console.log("REGLAS/PISTAS:", out.length); console.log(out.join("\n"));
console.log("DUP (no vocab/ejemplos):", dup.length); console.log(dup.slice(0, 30).join("\n"));
console.log("DUP vocab entre unidades:", dupV.length); console.log(dupV.slice(0, 40).join("\n"));
console.log("DUP ejemplos entre unidades:", dupEx.length); console.log(dupEx.slice(0, 20).join("\n"));
console.log("VOSEO:", vo.length); console.log(vo.slice(0, 25).join("\n"));
console.log("REGIONAL:", re.length); console.log(re.slice(0, 25).join("\n"));
console.log("REFS unidad fuera de rango:", refs.length + refsU.length, JSON.stringify([...refs, ...refsU].slice(0, 10)));
console.log("BOTONES citados:", JSON.stringify(quoted.slice(0, 40)));
console.log("PARTES"); console.log(partOut.join("\n"));
