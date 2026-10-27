// Unidad nueva u25 (G1): alfabeto, deletreo, acento y frases de supervivencia.
// Va en esta carpeta, separada de los registros (grammar/, vocab.json, dialogues.ts, …), hasta que el PR de curso y datos (H1)
// esté fusionado: entonces un PR corto la conecta (UNITS, LESSONS, registros) sin tocar el texto.
// Evidencia de cada frase: docs/v2/revision-fuentes.md (G1-u25).
import type { Lesson } from "../grammar/types";
import type { Dialogue } from "../dialogues";
import type { DictationItem } from "../dictation";
import type { VocabItem } from "../vocab";
import type { WritingTask } from "../writing";
import type { PronUnit } from "../pronunciation";

const lesson: Lesson = {
  unit: "u25",
  title: "Alfabeto, deletreo, acento y frases de supervivencia",
  situation: "Tu primer día en Italia: presentarte, deletrear tu nombre y pedir ayuda cuando no entiendes",
  rule: [
    {
      kind: "p",
      text: "El alfabeto italiano tiene **21 letras**: *j, k, w, x, y* solo aparecen en palabras extranjeras. Las vocales (*a, e, i, o, u*) son **puras y cortas**, como en español: no se alargan ni se convierten en diptongo.",
    },
    {
      kind: "table",
      head: ["Letra", "Nombre"],
      rows: [
        ["*a, e, i, o, u*", "como en español: *a, e, i, o, u*"],
        ["*b, c, d, f, g*", "*bi, ci, di, effe, gi*"],
        ["*h, l, m, n*", "*acca, elle, emme, enne*"],
        ["*p, q, r, s, t, v, z*", "*pi, cu, erre, esse, ti, vi (o vu), zeta*"],
        ["*j, k, w, x, y*", "*i lunga, kappa, doppia vu, ics, i greca*"],
      ],
    },
    {
      kind: "p",
      text: "Para pedir que te escriban una palabra: *Come si scrive?* Para deletrear, di los nombres de las letras en orden: *Esse, a, enne, ti, i, a, gi, o* (*Santiago*).",
    },
    {
      kind: "p",
      text: "**Acento.** En la mayoría de las palabras la sílaba fuerte es la penúltima (*CA-sa*). Si la fuerte es la **última**, se escribe tilde: *caffè, tè* (grave) y *perché* (aguda). En palabras de una sílaba la tilde distingue: *è* (es) / *e* (y), *sì* (sí) / *si*, *là* (allá) / *la*.",
    },
    {
      kind: "table",
      head: ["Frase", "Para qué sirve"],
      rows: [
        ["*Non ho capito.*", "No entendí"],
        ["*Può ripetere, per favore?*", "¿Puede repetir, por favor? (formal) · con amigos: *Puoi ripetere?*"],
        ["*Più piano, per favore.*", "Más despacio, por favor"],
        ["*Come si dice…?*", "¿Cómo se dice…?"],
        ["*Che cosa significa…?*", "¿Qué significa…?"],
        ["*Come si scrive?*", "¿Cómo se escribe?"],
      ],
    },
    {
      kind: "p",
      text: "Para presentarte: *Come ti chiami?* (¿cómo te llamas?) → *Mi chiamo Marco.* · *Di dove sei?* → *Sono di Santiago.* Números del 0 al 10: *zero, uno, due, tre, quattro, cinque, sei, sette, otto, nove, dieci*.",
    },
  ],
  transfer:
    "Ojo, en español: las vocales italianas suenan como las tuyas, pero la tilde escrita casi solo aparece en la **última** vocal (*caffè, perché*), y la *h* nunca suena: *ho* se lee «o». Además, *e* sin tilde es «y» y *è* con tilde es «es»: no son lo mismo.",
  examples: [
    { it: "Come ti chiami?", es: "¿Cómo te llamas?" },
    { it: "Mi chiamo Marco.", es: "Me llamo Marco." },
    { it: "Di dove sei? — Sono di Santiago.", es: "¿De dónde eres? — Soy de Santiago." },
    { it: "Non ho capito.", es: "No entendí." },
    { it: "Può ripetere, per favore?", es: "¿Puede repetir, por favor?" },
    { it: "Più piano, per favore.", es: "Más despacio, por favor." },
    { it: "Come si dice «gracias»?", es: "¿Cómo se dice «gracias»?" },
    { it: "Che cosa significa «prego»?", es: "¿Qué significa «prego»?" },
  ],
  notice: [
    {
      type: "choice",
      prompt: "¿Cuál de estas palabras lleva tilde escrita?",
      options: ["caffè", "casa", "banca"],
      answer: 0,
      why: "La sílaba fuerte de *caffè* es la última, y ahí se escribe la tilde. En *casa* y *banca* la fuerte es la penúltima.",
    },
    {
      type: "choice",
      prompt: "¿Qué significa «è» con tilde, como en «Marco è di Roma»?",
      options: ["es / está", "y", "sí"],
      answer: 0,
      why: "*È* con tilde es el verbo *essere* (*es*). Sin tilde, *e* significa «y».",
    },
    {
      type: "choice",
      prompt: "Hablas con una señora mayor que habla muy rápido. ¿Qué le dices?",
      options: ["Può ripetere, per favore?", "Puoi ripetere, per favore?", "Posso ripetere, per favore?"],
      answer: 0,
      why: "A una persona mayor se le habla de *Lei*: *Può ripetere*. *Puoi* es para amigos.",
    },
  ],
  exercises: [
    { type: "fill", prompt: "___ ti chiami? (¿cómo?)", answers: ["Come"], why: "*Come ti chiami?* = ¿cómo te llamas?" },
    { type: "fill", prompt: "Mi ___ Marco. (me llamo)", answers: ["chiamo"], why: "*Mi chiamo…* = me llamo…" },
    { type: "fill", prompt: "Di dove ___? (eres, con *tu*)", answers: ["sei"], why: "Con *tu* el verbo *essere* es *sei*." },
    { type: "fill", prompt: "Sono ___ Santiago. (de)", answers: ["di"], why: "Para decir de dónde eres: *sono di*." },
    { type: "fill", prompt: "Non ho ___. (entendido)", answers: ["capito"], why: "*Non ho capito* = no entendí." },
    { type: "fill", prompt: "Più ___, per favore. (despacio)", answers: ["piano"], why: "*Più piano* = más despacio." },
    { type: "fill", prompt: "Può ___, per favore? (repetir)", answers: ["ripetere"], why: "*Può ripetere?* = ¿puede repetir?" },
    { type: "fill", prompt: "Come si ___ «gracias»? (decir)", answers: ["dice"], why: "*Come si dice…?* = ¿cómo se dice…?" },
    { type: "fill", prompt: "Che cosa ___ «prego»? (quiere decir)", answers: ["significa"], why: "*Che cosa significa…?* = ¿qué significa…?" },
    { type: "choice", prompt: "¿Cuántas letras tiene el alfabeto italiano?", options: ["21", "24", "26"], answer: 0, why: "Son 21; *j, k, w, x, y* solo están en palabras extranjeras." },
    { type: "choice", prompt: "¿Cómo se llama la letra «h» en italiano?", options: ["acca", "effe", "elle"], answer: 0, why: "La *h* se llama *acca* (y no suena)." },
    { type: "choice", prompt: "Un amigo te habla muy rápido. ¿Qué le dices?", options: ["Più piano, per favore.", "Più tardi, per favore.", "Più presto, per favore."], answer: 0, why: "*Più piano* = más despacio. *Più tardi* es «más tarde»." },
    { type: "choice", prompt: "Quieres que te escriban una palabra. ¿Qué preguntas?", options: ["Come si scrive?", "Come si dice?", "Che cosa significa?"], answer: 0, why: "*Come si scrive?* = ¿cómo se escribe?" },
    { type: "choice", prompt: "Con *è* y *e*: «Marco ___ Anna son de Roma» (y)", options: ["e", "è", "é"], answer: 0, why: "Para «y» se escribe *e* sin tilde." },
  ],
};

const vocab: VocabItem[] = [
  { it: "il nome", es: "el nombre" },
  { it: "il cognome", es: "el apellido" },
  { it: "la lettera", es: "la letra" },
  { it: "l'alfabeto", es: "el alfabeto" },
  { it: "la vocale", es: "la vocal" },
  { it: "la consonante", es: "la consonante" },
  { it: "l'accento", es: "el acento / la tilde" },
  { it: "capire", es: "entender" },
  { it: "ripetere", es: "repetir" },
  { it: "scrivere", es: "escribir" },
  { it: "piano", es: "despacio" },
  { it: "zero", es: "cero" },
  { it: "uno", es: "uno" },
  { it: "due", es: "dos" },
  { it: "tre", es: "tres" },
  { it: "quattro", es: "cuatro" },
  { it: "cinque", es: "cinco" },
  { it: "sei", es: "seis" },
  { it: "sette", es: "siete" },
  { it: "otto", es: "ocho" },
  { it: "nove", es: "nueve" },
  { it: "dieci", es: "diez" },
];

const dictation: DictationItem[] = [
  { it: "Come ti chiami?", es: "¿Cómo te llamas?" },
  { it: "Mi chiamo Marco.", es: "Me llamo Marco." },
  { it: "Sono di Santiago.", es: "Soy de Santiago." },
  { it: "Di dove sei?", es: "¿De dónde eres?" },
  { it: "Non ho capito.", es: "No entendí." },
  { it: "Più piano, per favore.", es: "Más despacio, por favor." },
  { it: "Può ripetere, per favore?", es: "¿Puede repetir, por favor?" },
  { it: "Come si scrive?", es: "¿Cómo se escribe?" },
  { it: "Che cosa significa?", es: "¿Qué significa?" },
  { it: "Un caffè, per favore.", es: "Un café, por favor." },
];

const dialogue: Dialogue = {
  roles: { A: "Compañero de curso", B: "Tú" },
  you: "B",
  setting: "Primer día de un curso de italiano: te presentas a un compañero.",
  lines: [
    { who: "A", it: "Ciao! Come ti chiami?", es: "¡Hola! ¿Cómo te llamas?" },
    { who: "B", it: "Mi chiamo Marco. Piacere!", es: "Me llamo Marco. ¡Mucho gusto!" },
    { who: "A", it: "Piacere! Di dove sei?", es: "¡Mucho gusto! ¿De dónde eres?" },
    { who: "B", it: "Sono di Santiago, in Cile.", es: "Soy de Santiago, en Chile." },
    { who: "A", it: "Come si scrive «Santiago»?", es: "¿Cómo se escribe «Santiago»?" },
    { who: "B", it: "Esse, a, enne, ti, i, a, gi, o.", es: "S, a, n, t, i, a, g, o." },
    { who: "A", it: "Perfetto! Io sono di Verona.", es: "¡Perfecto! Yo soy de Verona." },
    { who: "B", it: "Scusa, non ho capito. Puoi ripetere, per favore?", es: "Perdona, no entendí. ¿Puedes repetir, por favor?" },
    { who: "A", it: "Certo! Sono di Verona.", es: "¡Claro! Soy de Verona." },
    { who: "B", it: "Ah, di Verona! Grazie, a presto!", es: "¡Ah, de Verona! ¡Gracias, hasta pronto!" },
  ],
};

const writing: WritingTask = {
  prompt: "Escríbele un mensaje corto a un compañero de curso: dile cómo te llamas, de dónde eres y pídele que te repita algo porque no lo entendiste.",
  model: "Ciao! Mi chiamo Marco e sono di Santiago. Scusa, non ho capito. Puoi ripetere, per favore?",
  checklist: [
    "Dije mi nombre con *Mi chiamo…* y de dónde soy con *Sono di…*.",
    "Pedí que repitieran con *Puoi ripetere, per favore?* (con un amigo).",
    "Usé *Non ho capito* para decir que no entendí.",
    "La *e* de «y» va sin tilde y *è* (es) con tilde.",
  ],
  minChars: 50,
};

const pron: PronUnit = {
  unit: "u25",
  title: "Vocales puras y acento",
  tip: "Las vocales italianas son **puras**: *a, e, i, o, u* suenan siempre igual, sin diptongo. La sílaba fuerte suele ser la penúltima (*CA-sa*); si es la última, lleva tilde: *caf-FÈ*, *per-CHÉ*. La *h* no suena: *ho* se lee «o».",
  pairs: [["sono", "sano"], ["tutto", "tetto"], ["cena", "cina"], ["vino", "vano"]],
  words: ["amico", "casa", "caffè", "perché", "tè", "sì", "là", "otto"],
};

const gloss: Record<string, string> = {
  sono: "soy / son", sano: "sano", tutto: "todo", tetto: "techo", cena: "cena", cina: "China", vino: "vino", vano: "vano / inútil",
  amico: "amigo", casa: "casa", caffè: "café", perché: "porque / por qué", tè: "té", sì: "sí", là: "allá", otto: "ocho",
};

export const u25 = {
  id: "u25",
  title: "Alfabeto, deletreo, acento y supervivencia",
  canDo: [
    "Puedo presentarme y decir de dónde soy.",
    "Puedo deletrear mi nombre y pedir que me deletreen una palabra.",
    "Puedo decir que no entendí y pedir que repitan más despacio.",
  ],
  lesson,
  vocab,
  dictation,
  dialogue,
  writing,
  pron,
  gloss,
};
