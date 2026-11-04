import { UNITS } from "../../../../src/content/curriculum";
import { COURSE } from "../../../../src/content/course";
import { getLesson } from "../../../../src/content/grammar";
import { getVocab } from "../../../../src/content/vocab";
import { getDictation } from "../../../../src/content/dictation";
import { getDialogue } from "../../../../src/content/dialogues";
import { getLectura } from "../../../../src/content/lectura";
import { getSinPista } from "../../../../src/content/sinpista";
const strip = (s: string) => s.replace(/\*/g, "");
const rule = (b: any): string => b.kind === "p" ? b.text : b.kind === "list" ? b.items.join(" ") : [...b.head, ...b.rows.flat()].join(" ");
const corpus: Record<string, { lesson: string; all: string }> = {};
for (const u of UNITS) { const L = getLesson(u.id)!;
  const lesson = strip([L.title, L.situation, L.transfer, ...L.rule.map(rule), ...L.examples.map((e) => e.it), ...L.exercises.map((e: any) => e.prompt + " " + (e.answers ?? []).join(" ")), ...L.notice.map((e) => e.prompt)].join(" "));
  const rest = strip([...(getVocab(u.id) ?? []).map((v) => v.it), ...(getDictation(u.id) ?? []).map((d) => d.it), ...(getDialogue(u.id)?.lines ?? []).map((l) => l.it), ...COURSE.filter((s) => s.unit === u.id).flatMap((s) => getLectura(s.id)?.it ?? []), ...getSinPista(u.id).map((s: any) => (s.prompt ?? "") + " " + (s.answers ?? []).join(" "))].join(" "));
  corpus[u.id] = { lesson, all: lesson + " " + rest }; }
const probes: [string, RegExp][] = [
 ["prima di + infinito (temporale implícita)", /\bprima di\b/i], ["dopo + infinito / dopo aver", /\bdopo (aver|essere|\w+are\b|\w+ere\b|\w+ire\b)/i],
 ["bere / bevo", /\b(bere|bevo|bevi|beve|bevuto)\b/i], ["dare / do-dai", /\b(dare|dai|dà|dato|dammi|dà)\b/i], ["venire", /\b(venire|vengo|vieni|viene|venuto)\b/i], ["stare", /\b(stare|sto|stai|sta|stiamo)\b/i], ["dire", /\b(dire|dico|dici|detto)\b/i],
 ["infatti", /\binfatti\b/i], ["invece", /\binvece\b/i], ["allora", /\ballora\b/i], ["non solo … ma anche", /non solo.*ma anche/i], ["quindi / però / ma / perciò", /\b(quindi|però|perciò)\b/i],
 ["relativas con che (il libro che …)", /\b(il|la|le|i|gli|un|una)\s+\w+\s+che\s+(ho|è|sono|abita|lavora|mi|ti|ci|vive)/i], ["se + (ipotética)", /\bse\b.*(,|\?)/i],
 ["ordinales primo/secondo/terzo", /\b(primo|seconda|secondo|terzo|terza|quarto)\b/i], ["preposición su / sul / sulla", /\b(sul|sulla|sullo|sui|sulle|su)\b/i], ["articuladas di (del, della)", /\b(del|della|dello|dei|delle|degli)\b/i],
 ["esclamativas (che bello / quanto)", /\b(che (bello|bella|peccato|fortuna)|quanto è)/i], ["indefinidos (qualche, alcuni, ogni, tutti, nessuno)", /\b(qualche|alcuni|alcune|ogni|nessuno|ciascuno|tutti|qualcuno)\b/i],
 ["invitar (ti va di / vuoi venire / invito)", /(ti va di|ti andrebbe|vuoi venire|invit)/i], ["disculparse (scusa / scusi / mi dispiace)", /\b(scusa|scusi|scusate|mi dispiace|perdono)\b/i], ["opinión (penso che / secondo me / credo)", /(penso che|secondo me|credo che|mi sembra)/i],
 ["gerundio stare + gerundio", /\bsto \w+ando|\bsta \w+endo/i], ["passato remoto", /\b(fu|fece|andò|disse)\b/i], ["comparativos più…di", /\bpiù\b.*\bdi\b/i], ["futuro", /\b(andrò|farò|sarà|avrò|verrò)\b/i], ["condizionale (vorrei/potrei)", /\b(vorrei|potrei|potresti|dovrei|vorrebbe)\b/i], ["imperativo", /\b(prendi|prenda|vai|vada|gira|giri|continua|scusi)\b/i],
];
const ids = UNITS.map((u) => u.id);
console.log("sonda | unidades con la forma en la LECCIÓN | unidades en todo el contenido (n)");
for (const [name, re] of probes) { const inL = ids.filter((i) => re.test(corpus[i].lesson)); const inA = ids.filter((i) => re.test(corpus[i].all)); console.log(name.padEnd(46), "| L:", inL.length ? inL.map((x) => x.slice(1)).join(",") : "—", "| T:", inA.length, inA.length ? "(" + inA.slice(0, 6).map((x) => x.slice(1)).join(",") + ")" : ""); }
