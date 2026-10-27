// Auditoría automática por unidad. Genera docs/v2/auditoria/uXX.md (métricas + banderas + lista de juicio) y _resumen.md.
// Uso: npx vite-node scripts/audit-unidades.ts
// Solo mide lo que se puede medir con código. El juicio pedagógico y lingüístico lo hace la pasada de revisión (docs/v2/12-protocolo-auditoria.md).
import { mkdirSync, writeFileSync } from "node:fs";
import { UNITS, sessionsOf } from "../src/content/curriculum";
import { getDialogue } from "../src/content/dialogues";
import { getDictation } from "../src/content/dictation";
import { getLesson } from "../src/content/grammar";
import type { Block, Exercise } from "../src/content/grammar/types";
import { audioFiles, getPronUnit } from "../src/content/pronunciation";
import { SHADOWING } from "../src/content/shadowing";
import { getVocab } from "../src/content/vocab";
import { getWriting } from "../src/content/writing";

const OUT = "docs/v2/auditoria";
mkdirSync(OUT, { recursive: true });

const strip = (s: string) => s.replace(/\*/g, "");
const norm = (s: string) => strip(s).toLowerCase().normalize("NFC");
const tokens = (s: string): string[] =>
  norm(s).split(/[^a-zà-ùé']+/).flatMap((t) => t.split("'")).filter((t) => t.length > 1);
const bare = (it: string) => norm(it).replace(/^(il|lo|la|l'|i|gli|le|un|uno|una|un')\s*/, "").trim();
const words = (s: string) => strip(s).split(/\s+/).filter(Boolean).length;
const accentless = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "");

function sim(a: string, b: string): number {
  a = accentless(a); b = accentless(b);
  const m = a.length, n = b.length;
  if (!m || !n) return 0;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return 1 - d[m][n] / Math.max(m, n);
}

function blockText(b: Block): string {
  return b.kind === "p" ? b.text : b.kind === "list" ? b.items.join(" ") : [...b.head, ...b.rows.flat()].join(" ");
}

interface Stat { unit: string; flags: string[]; row: Record<string, string | number> }
const stats: Stat[] = [];
const cumulative = new Set<string>();

for (const u of UNITS) {
  const flags: string[] = [];
  const L = getLesson(u.id);
  const V = getVocab(u.id) ?? [];
  const D = getDialogue(u.id);
  const T = getDictation(u.id) ?? [];
  const W = getWriting(u.id);
  const P = getPronUnit(u.id);
  const S = SHADOWING[u.id as keyof typeof SHADOWING] as unknown;

  // --- Lección y ejercicios
  const ex: Exercise[] = L?.exercises ?? [];
  const fill = ex.filter((e) => e.type === "fill");
  const choice = ex.filter((e) => e.type === "choice");
  const hinted = fill.filter((e) => /\([^)]*\)/.test(e.prompt));
  const ruleWords = (L?.rule ?? []).filter((b) => b.kind === "p").reduce((n, b) => n + words(blockText(b)), 0);
  const leaks = fill.filter((e) => {
    const hint = (e.prompt.match(/\(([^)]*)\)/) ?? [])[1] ?? "";
    const hintWords = hint.toLowerCase().split(/[^a-zà-ùé']+/);
    return e.answers.some((a) => a.length > 2 && hintWords.includes(a.toLowerCase()));
  });
  const prompts = ex.map((e) => norm(e.prompt));
  const dupPrompts = prompts.length - new Set(prompts).size;
  const answerCount = new Map<string, number>();
  fill.forEach((e) => answerCount.set(norm(e.answers[0]), (answerCount.get(norm(e.answers[0])) ?? 0) + 1));
  const repeatedAnswers = [...answerCount].filter(([, n]) => n >= 3).map(([a, n]) => `${a}×${n}`);
  const pos = [0, 0, 0, 0];
  let longest = 0;
  choice.forEach((e) => {
    if (e.type !== "choice") return;
    pos[e.answer] = (pos[e.answer] ?? 0) + 1;
    if (e.options[e.answer].length >= Math.max(...e.options.map((o) => o.length))) longest++;
  });
  const nChoice = choice.length;
  if (ex.length < 14) flags.push(`pocos ejercicios (${ex.length})`);
  if (ex.length && fill.length / ex.length >= 0.75) flags.push(`${Math.round((100 * fill.length) / ex.length)} % son «completar»`);
  if (hinted.length / Math.max(1, fill.length) >= 0.7) flags.push(`${hinted.length} de ${fill.length} «completar» llevan pista entre paréntesis`);
  if (leaks.length) flags.push(`${leaks.length} pista(s) contienen la respuesta`);
  if (dupPrompts) flags.push(`${dupPrompts} consigna(s) repetida(s)`);
  if (repeatedAnswers.length) flags.push(`respuestas repetidas: ${repeatedAnswers.join(", ")}`);
  // La posición de la opción correcta no se marca: la app baraja las opciones al mostrarlas (domain/optionOrder.ts).
  if (nChoice >= 5 && longest / nChoice > 0.6) flags.push(`la opción correcta es la más larga en ${longest} de ${nChoice}`);
  if (ruleWords > 150) flags.push(`regla larga (~${ruleWords} palabras)`);

  // --- Vocabulario
  const lessonText = L ? [...L.rule.map(blockText), ...L.examples.map((e) => e.it), ...ex.map((e) => e.prompt)].join(" ") : "";
  const unitText = [lessonText, ...(D?.lines.map((l) => l.it) ?? []), ...T.map((t) => t.it), W?.model ?? ""].join(" ");
  const unitTokens = new Set(tokens(unitText));
  const unseen = V.filter((v) => !tokens(v.it).filter((t) => !["il", "lo", "la", "un", "una", "uno", "i", "gli", "le"].includes(t)).some((t) => unitTokens.has(t)));
  const cogn = V.filter((v) => sim(bare(v.it), norm(v.es.split(/[ ,/(]/)[0])) >= 0.75);
  if (V.length < 30) flags.push(`vocabulario corto (${V.length}; meta ~50) y sin frase`);
  if (unseen.length >= 4) flags.push(`${unseen.length} palabras no reaparecen en el texto de la unidad (reciclaje bajo)`);

  // --- Léxico acumulado: palabras del diálogo/dictado que no están en nada visto hasta aquí
  const own = new Set<string>([...V.flatMap((v) => tokens(v.it)), ...tokens(lessonText), ...(P ? [...P.pairs.flat(), ...P.words].flatMap(tokens) : [])]);
  const known = (t: string) => cumulative.has(t) || own.has(t);
  const dlgTokens = (D?.lines ?? []).flatMap((l) => tokens(l.it));
  const dicTokens = T.flatMap((t) => tokens(t.it));
  const unknownDlg = [...new Set(dlgTokens.filter((t) => !known(t)))];
  const unknownDic = [...new Set(dicTokens.filter((t) => !known(t)))];
  const covDlg = dlgTokens.length ? Math.round((100 * dlgTokens.filter(known).length) / dlgTokens.length) : 0;
  const covDic = dicTokens.length ? Math.round((100 * dicTokens.filter(known).length) / dicTokens.length) : 0;
  if (D && covDlg < 90) flags.push(`diálogo: solo ${covDlg} % de las palabras estaban vistas (meta ≥ 95 %)`);
  if (T.length && covDic < 90) flags.push(`dictado: solo ${covDic} % de las palabras estaban vistas`);

  // --- Diálogo, dictado, escritura, pronunciación
  const dl = D?.lines ?? [];
  const dlWords = dl.reduce((n, l) => n + words(l.it), 0);
  const dlQuestions = dl.filter((l) => l.it.includes("?")).length;
  const meanDic = T.length ? Math.round((T.reduce((n, t) => n + words(t.it), 0) / T.length) * 10) / 10 : 0;
  if (!D) flags.push("sin diálogo");
  if (D && (dlWords < 50 || dlWords > 140)) flags.push(`diálogo de ${dlWords} palabras (meta 60–120)`);
  if (T.length < 10) flags.push(`dictado con ${T.length} frases (meta 10)`);
  const pairAudio = P ? P.pairs.flat().filter((w) => audioFiles(w).length > 0).length : 0;
  const pairTotal = P ? P.pairs.flat().length : 0;
  if (P && pairAudio < pairTotal) flags.push(`pares mínimos sin audio nativo: ${pairTotal - pairAudio} de ${pairTotal}`);
  if (W && W.checklist.length && !/\*/.test(W.checklist.join(""))) flags.push("lista de autocorrección sin formas meta marcadas");
  const minutes = sessionsOf(u).reduce((n, s) => n + s.activities.reduce((m, a) => m + a.minutes, 0), 0);

  // acumular para la unidad siguiente
  [...own, ...tokens(unitText)].forEach((t) => cumulative.add(t));

  const row = {
    "ejemplos": L?.examples.length ?? 0, "notice": L?.notice.length ?? 0, "ejercicios": ex.length, "completar": fill.length, "elegir": nChoice,
    "regla (palabras)": ruleWords, "vocab": V.length, "transparentes probables": cogn.length, "dictado": T.length, "palabras/dictado": meanDic,
    "diálogo (líneas)": dl.length, "diálogo (palabras)": dlWords, "preguntas en diálogo": dlQuestions,
    "cobertura diálogo %": covDlg, "cobertura dictado %": covDic, "pron. pares": P?.pairs.length ?? 0, "audio pares %": pairTotal ? Math.round((100 * pairAudio) / pairTotal) : 0,
    "shadowing": S ? "sí" : "no", "min/unidad (plan actual)": minutes,
  };
  stats.push({ unit: u.id, flags, row });

  const list = (xs: string[], n = 25) => (xs.length ? xs.slice(0, n).join(", ") + (xs.length > n ? ` … (+${xs.length - n})` : "") : "—");
  const md = `# ${u.id.toUpperCase()} — ${u.title}
Fase ${u.phase} · ${u.checkpoint ? "checkpoint · " : ""}Generado por \`scripts/audit-unidades.ts\`. Las métricas son automáticas; los veredictos los completa la pasada de revisión.

## Métricas automáticas
| Métrica | Valor |
|---|---|
${Object.entries(row).map(([k, v]) => `| ${k} | ${v} |`).join("\n")}

## Banderas automáticas
${flags.length ? flags.map((f) => `- ${f}`).join("\n") : "- (ninguna)"}

## Detalle para el juicio
- Palabras del diálogo no vistas antes: ${list(unknownDlg)}
- Palabras del dictado no vistas antes: ${list(unknownDic)}
- Palabras de vocabulario que no reaparecen en el texto de la unidad: ${list(unseen.map((v) => v.it))}
- Transparentes probables (parecido ≥ 0,75 con el español; heurística): ${list(cogn.map((v) => `${v.it}=${v.es.split(/[ ,/(]/)[0]}`))}
- Respuestas de «completar» que se repiten ≥ 3 veces: ${list(repeatedAnswers)}

## Lista de juicio (se completa en la pasada de revisión)
Veredicto por pieza: **C** conservar · **A** ajustar (cambio menor) · **R** reescribir · **E** eliminar. Cada veredicto lleva una razón de una línea y, si aplica, la fuente o el criterio.

| Pieza | Pregunta | Veredicto | Razón |
|---|---|---|---|
| Tema y función | ¿Es lo que un hispanohablante necesita en este punto y está en el mejor orden? | | |
| Lección: observar | ¿Se puede descubrir la regla con 4–6 frases antes de leerla? | | |
| Lección: regla | ¿Es la explicación más corta y clara posible (<120 palabras) y usa lo que ya sabe del español? | | |
| Lección: transferencia | ¿Nombra las trampas reales del español (no las genéricas)? | | |
| Ejemplos | ¿Son frases que alguien diría, con vocabulario ya visto? | | |
| Ejercicios | ¿Hay variedad de tipos, sin pista que regale la respuesta, con retroalimentación útil? | | |
| Vocabulario | ¿Son las palabras más útiles del tema y de alta frecuencia, con frase y etiqueta? | | |
| Diálogo | ¿Suena natural, cabe en 60–120 palabras, recicla la gramática y las palabras meta? | | |
| Dictado | ¿Frases útiles, con la dificultad correcta para este punto del curso? | | |
| Escritura | ¿La consigna fuerza la estructura meta y se puede dar retroalimentación? | | |
| Pronunciación | ¿El contraste es el que más le cuesta a un hispanohablante en este punto? | | |
| Shadowing | ¿El video corresponde al nivel y al tema? (el usuario aún debe escuchar los marcados) | | |
| Italiano | ¿Hay errores de forma, calcos del español o frases poco naturales? (anotar en \`docs/dudas-italiano.md\`) | | |
| Qué falta | ¿Qué debería enseñarse en esta unidad y no está? | | |
| Impacto en el plan | ¿Este hallazgo cambia la fase D, G, C u otra? (ver regla de propagación en \`docs/v2/11-plan-maestro-vivo.md\`) | | |
`;
  writeFileSync(`${OUT}/${u.id}.md`, md);
}

const keys = Object.keys(stats[0].row);
const summary = `# Resumen automático de la auditoría
Generado por \`scripts/audit-unidades.ts\`. Vuelve a generarlo con \`npx vite-node scripts/audit-unidades.ts\` después de cualquier cambio de contenido.

| Unidad | ${keys.join(" | ")} | Banderas |
|---|${keys.map(() => "---").join("|")}|---|
${stats.map((s) => `| ${s.unit} | ${keys.map((k) => s.row[k]).join(" | ")} | ${s.flags.length} |`).join("\n")}

## Banderas por unidad
${stats.map((s) => `### ${s.unit}\n${s.flags.length ? s.flags.map((f) => `- ${f}`).join("\n") : "- (ninguna)"}`).join("\n\n")}
`;
writeFileSync(`${OUT}/_resumen.md`, summary);
console.log(`Auditoría generada en ${OUT}/ (${stats.length} unidades)`);
