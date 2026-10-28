// Unidad nueva u28 (G1): comer fuera. Se conecta sola a los registros porque está en NUEVAS (index.ts).
// Evidencia de cada frase: docs/v2/revision-fuentes.md (G1-u28).
import type { Lesson } from "../grammar/types";
import type { Dialogue } from "../dialogues";
import type { DictationItem } from "../dictation";
import type { VocabItem } from "../vocab";
import type { WritingTask } from "../writing";
import type { PronUnit } from "../pronunciation";

const lesson: Lesson = {
  unit: "u28",
  title: "Comer fuera: leer el menú, pedir, avisar de alergias y pagar",
  situation: "Una cena en un restaurante en Italia: pides mesa, entiendes el menú, avisas de una alergia y pides la cuenta",
  rule: [
    {
      kind: "table",
      head: ["Parte del menú", "Qué es"],
      rows: [
        ["*l'antipasto*", "la entrada"],
        ["*il primo*", "primer plato: pasta, risotto o sopa"],
        ["*il secondo*", "segundo plato: carne, aves o pescado"],
        ["*il contorno*", "guarnición (verduras, ensalada o papas); se pide aparte"],
        ["*il dolce*", "el postre"],
      ],
    },
    {
      kind: "p",
      text: "**Mesa.** *Avete un tavolo per due?* · *Siamo in quattro — avete posto?* · *Ho prenotato per due persone.* Para ver la carta: *Posso vedere il menù?* o *Posso avere il menu, per favore?*",
    },
    {
      kind: "p",
      text: "**Pedir.** *Vorrei ordinare.* · *Vorrei una pizza margherita e un'acqua naturale.* Para pedir una recomendación: *Cosa consiglia?* o *Che cosa consiglia come piatto principale?* · *Qual è il piatto del giorno?* · *C'è un dolce tipico della casa?*",
    },
    {
      kind: "table",
      head: ["Si necesitas decir…", "Italiano"],
      rows: [
        ["que eres vegetariano/a", "*Sono vegetariano. Avete piatti senza carne?*"],
        ["una alergia", "*Sono allergico alle noci.* · *Ho un'allergia alle uova.*"],
        ["una intolerancia", "*Sono intollerante al lattosio.*"],
        ["que no comes algo", "*Non mangio carne di maiale.*"],
        ["sin gluten", "*Senza glutine, per favore.* · *Avete la pizza senza glutine?*"],
      ],
    },
    {
      kind: "p",
      text: "**Pagar.** En Italia la cuenta no llega sola: la pides. *Il conto, per favore.* · *Posso avere il conto, per favore?* · *Possiamo avere il conto?* · *Paghiamo separatamente.* · *Posso pagare con carta?* · *Il servizio è incluso?* Muchas veces se suma **il coperto**, un cargo por cubierto: *Il coperto è di due euro.*",
    },
  ],
  transfer:
    "Ojo, en español: (1) *il primo* no es «el primero» de cualquier cosa: es el primer **plato** (pasta, risotto o sopa). (2) *Il contorno* es una guarnición que normalmente se pide aparte; el *secondo* suele venir solo. (3) *Il menù* es la carta; *la carta* sola es la tarjeta de pago (*pagare con carta*). (4) *Il coperto* no es propina: es un cargo fijo que va en la cuenta. Si dudas, pregunta *Il servizio è incluso?* (5) Las preposiciones se fusionan con el artículo: *alle noci* (a + le), *ai molluschi* (a + i).",
  examples: [
    { it: "Avete un tavolo per due?", es: "¿Tienen una mesa para dos?" },
    { it: "Ho prenotato per due persone.", es: "Reservé para dos personas." },
    { it: "Posso vedere il menù?", es: "¿Puedo ver el menú?" },
    { it: "Vorrei ordinare una pizza margherita e un'acqua naturale.", es: "Quisiera pedir una pizza margarita y un agua sin gas." },
    { it: "Che cosa consiglia come piatto principale?", es: "¿Qué recomienda como plato principal?" },
    { it: "Sono vegetariano. Avete piatti senza carne?", es: "Soy vegetariano. ¿Tienen platos sin carne?" },
    { it: "Sono allergico alle noci.", es: "Soy alérgico a las nueces." },
    { it: "Il coperto è di due euro.", es: "El cubierto cuesta dos euros." },
    { it: "Il conto, per favore.", es: "La cuenta, por favor." },
  ],
  notice: [
    {
      type: "choice",
      prompt: "«Il coperto è di due euro.» ¿Qué es *il coperto*?",
      options: ["Un plato del menú", "Un cargo que se suma a la cuenta", "Una mesa reservada"],
      answer: 1,
      why: "*Il coperto* es el cargo por cubierto (*sitting charge*); aparece en la cuenta.",
    },
    {
      type: "choice",
      prompt: "«Sono allergico alle noci.» ¿Qué dice la persona?",
      options: ["Que no puede comer nueces", "Que le encantan las nueces", "Que quiere pedir nueces"],
      answer: 0,
      why: "*Sono allergico a…* = soy alérgico a…; *alle noci* = a las nueces.",
    },
    {
      type: "choice",
      prompt: "«Per primo prendo la pasta.» ¿Qué parte del menú pide?",
      options: ["La entrada", "El primer plato", "El postre"],
      answer: 1,
      why: "*Il primo* es el primer plato: pasta, risotto o sopa.",
    },
  ],
  exercises: [
    { type: "fill", prompt: "___ un tavolo per due? (¿tienen?)", answers: ["Avete"], why: "*Avete un tavolo per due?* con *voi*." },
    { type: "fill", prompt: "___ prenotato per due persone. (yo reservé)", answers: ["Ho"], why: "*Ho prenotato* = reservé (passato prossimo con *avere*)." },
    { type: "fill", prompt: "Posso vedere il ___? (la carta del restaurante)", answers: ["menù", "menu"], why: "*Il menù* = la carta de un restaurante." },
    { type: "fill", prompt: "___ ordinare. (quisiera)", answers: ["Vorrei"], why: "*Vorrei ordinare* = quisiera pedir." },
    { type: "fill", prompt: "Cosa ___? (usted recomienda)", answers: ["consiglia"], why: "*Cosa consiglia?* con *Lei*." },
    { type: "fill", prompt: "Qual è il piatto del ___? (de hoy)", answers: ["giorno"], why: "*Il piatto del giorno* = el plato del día." },
    { type: "fill", prompt: "Sono ___. Avete piatti senza carne? (no como carne)", answers: ["vegetariano"], why: "*Sono vegetariano* = soy vegetariano." },
    { type: "fill", prompt: "Sono allergico ___ noci. (a + las)", answers: ["alle"], why: "a + le = *alle*: *alle noci*." },
    { type: "fill", prompt: "Ho un'___ alle uova. (alergia)", answers: ["allergia"], why: "*Un'allergia* = una alergia." },
    { type: "fill", prompt: "Sono intollerante ___ lattosio. (a + el)", answers: ["al"], why: "a + il = *al*: *al lattosio*." },
    { type: "fill", prompt: "___ glutine, per favore. (sin)", answers: ["Senza"], why: "*Senza glutine* = sin gluten." },
    { type: "fill", prompt: "Il ___, per favore. (lo que pides al final)", answers: ["conto"], why: "*Il conto, per favore.*" },
    { type: "fill", prompt: "Posso ___ con carta? (pagar)", answers: ["pagare"], why: "*Pagare con carta* = pagar con tarjeta." },
    { type: "fill", prompt: "Il ___ è incluso? (el servicio)", answers: ["servizio"], why: "*Il servizio è incluso?*" },
    { type: "choice", prompt: "Entra la pasta y la sopa en:", options: ["il primo", "il secondo", "il contorno"], answer: 0, why: "*Il primo* es pasta, risotto o sopa." },
    { type: "choice", prompt: "Quieres pedir una guarnición de verduras:", options: ["un contorno di verdure", "un secondo di verdure", "un dolce di verdure"], answer: 0, why: "*Il contorno* es la guarnición." },
    { type: "choice", prompt: "Quieres preguntar si el servicio está incluido:", options: ["Il servizio è incluso?", "Il servizio è conto?", "Il coperto è servizio?"], answer: 0, why: "*Incluso* = incluido." },
    { type: "choice", prompt: "Quieres pedir la cuenta con cortesía:", options: ["Possiamo avere il conto?", "Possiamo essere il conto?", "Possiamo fare il conto?"], answer: 0, why: "*Avere il conto* = tener la cuenta, o sea, que nos la traigan." },
    { type: "choice", prompt: "Eres alérgico a los huevos. ¿Qué dices?", options: ["Ho un'allergia alle uova.", "Sono allergia alle uova.", "Ho allergico alle uova."], answer: 0, why: "*Ho un'allergia a…* (sustantivo) o *Sono allergico a…* (adjetivo)." },
  ],
};

const vocab: VocabItem[] = [
  { it: "il primo", es: "el primer plato" },
  { it: "il secondo", es: "el segundo plato" },
  { it: "il contorno", es: "la guarnición" },
  { it: "il coperto", es: "el cubierto (cargo)" },
  { it: "il ristorante", es: "el restaurante" },
  { it: "il piatto", es: "el plato" },
  { it: "la bevanda", es: "la bebida" },
  { it: "ordinare", es: "pedir (en un restaurante)" },
  { it: "consigliare", es: "recomendar" },
  { it: "l'allergia", es: "la alergia" },
  { it: "vegetariano", es: "vegetariano" },
  { it: "senza", es: "sin" },
  { it: "il riso", es: "el arroz" },
  { it: "la zuppa", es: "la sopa" },
  { it: "l'insalata", es: "la ensalada" },
  { it: "le uova", es: "los huevos" },
  { it: "la noce", es: "la nuez" },
  { it: "il pollo", es: "el pollo" },
  { it: "la torta", es: "la torta / el pastel" },
  { it: "il gelato", es: "el helado" },
  { it: "il servizio", es: "el servicio" },
  { it: "la forchetta", es: "el tenedor" },
];

const dictation: DictationItem[] = [
  { it: "Avete un tavolo per due?", es: "¿Tienen una mesa para dos?" },
  { it: "Ho prenotato per due persone.", es: "Reservé para dos personas." },
  { it: "Posso vedere il menù?", es: "¿Puedo ver el menú?" },
  { it: "Vorrei ordinare, per favore.", es: "Quisiera pedir, por favor." },
  { it: "Che cosa consiglia?", es: "¿Qué recomienda?" },
  { it: "Sono vegetariano.", es: "Soy vegetariano." },
  { it: "Sono allergico alle noci.", es: "Soy alérgico a las nueces." },
  { it: "Senza glutine, per favore.", es: "Sin gluten, por favor." },
  { it: "Il conto, per favore.", es: "La cuenta, por favor." },
  { it: "Posso pagare con carta?", es: "¿Puedo pagar con tarjeta?" },
];

const dialogue: Dialogue = {
  roles: { A: "Camarero", B: "Tú" },
  you: "B",
  setting: "Llegas a un restaurante con un amigo, pides mesa, ordenas y pides la cuenta.",
  lines: [
    { who: "B", it: "Buonasera! Avete un tavolo per due?", es: "¡Buenas noches! ¿Tienen una mesa para dos?" },
    { who: "A", it: "Sì, certo. Volete sedervi vicino alla finestra?", es: "Sí, claro. ¿Quieren sentarse junto a la ventana?" },
    { who: "B", it: "Perfetto, grazie! Posso vedere il menù?", es: "¡Perfecto, gracias! ¿Puedo ver el menú?" },
    { who: "A", it: "Ecco il menù. Il coperto è di due euro.", es: "Aquí está el menú. El cubierto son dos euros." },
    { who: "B", it: "Sono allergico alle noci. Che cosa consiglia come primo?", es: "Soy alérgico a las nueces. ¿Qué recomienda de primer plato?" },
    { who: "A", it: "Le consiglio il risotto: è senza noci.", es: "Le recomiendo el risotto: no lleva nueces." },
    { who: "B", it: "Allora vorrei il risotto e un'acqua naturale.", es: "Entonces quisiera el risotto y un agua sin gas." },
    { who: "A", it: "Molto bene. Altro?", es: "Muy bien. ¿Algo más?" },
    { who: "B", it: "No, grazie. Dopo, il conto, per favore.", es: "No, gracias. Después, la cuenta, por favor." },
    { who: "A", it: "Subito!", es: "¡Enseguida!" },
  ],
};

const writing: WritingTask = {
  prompt: "Escríbele a un amigo para reservar y comentarle la cena: dile para cuántas personas es la mesa, avisa de una alergia o preferencia tuya y pregunta si el servicio está incluido.",
  model: "Ciao! Ho prenotato per due persone. Sono vegetariano e sono allergico alle noci. Il servizio è incluso?",
  checklist: [
    "Dije para cuántos es la mesa con *Ho prenotato per…* o *Avete un tavolo per…?*",
    "Avisé de una alergia o preferencia con *Sono allergico a…* o *Sono vegetariano*.",
    "Fusioné la preposición con el artículo (*alle noci*, *al lattosio*).",
    "Pregunté por la cuenta o el servicio con *Il conto…* o *Il servizio è incluso?*",
  ],
  minChars: 70,
};

const pron: PronUnit = {
  unit: "u28",
  title: "Dobles que cambian el significado",
  tip: "En italiano las consonantes dobles se alargan y **cambian la palabra**: *nono* (noveno) ≠ *nonno* (abuelo); *pane* (pan) ≠ *panna* (crema); *sete* (sed) ≠ *sette* (siete). Alarga la consonante un instante antes de seguir.",
  pairs: [["nono", "nonno"], ["pane", "panna"], ["sete", "sette"]],
  words: ["nonna", "nona", "dolce", "conto", "cameriere", "pasta", "carne", "pesce"],
};

const gloss: Record<string, string> = {
  nono: "noveno", nonno: "abuelo", pane: "pan", panna: "crema", sete: "sed", sette: "siete",
  nonna: "abuela", nona: "novena", dolce: "dulce / postre", conto: "cuenta", cameriere: "camarero", pasta: "pasta", carne: "carne", pesce: "pescado",
};

export const u28 = {
  id: "u28",
  title: "Comer fuera",
  canDo: [
    "Puedo entender un menú y pedir una comida completa.",
    "Puedo avisar de una alergia o preferencia y pedir la cuenta.",
  ],
  lesson,
  vocab,
  dictation,
  dialogue,
  writing,
  pron,
  gloss,
};
