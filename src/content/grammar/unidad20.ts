import type { Lesson } from "./types";

export const unidad20: Lesson = {
  unit: "u20",
  title: "Conectores, discurso indirecto y congiuntivo (reconocimiento)",
  situation: "Contar lo que te dijeron y entender opiniones (repaso de la fase 3)",
  rule: [
    {
      kind: "p",
      text: "Los **conectores** hacen que hables en párrafos y no en frases sueltas. Son los que más vas a oír en la conversación real:",
    },
    {
      kind: "table",
      head: ["Conector", "Significa", "Ejemplo"],
      rows: [
        ["*perché*", "porque / ¿por qué?", "*Non vengo perché sono stanco.*"],
        ["*quindi*", "por lo tanto", "*Piove, quindi resto a casa.*"],
        ["*ma / però*", "pero", "*Mi piace, ma è caro.*"],
        ["*invece*", "en cambio", "*Io bevo caffè, lui invece tè.*"],
        ["*allora*", "entonces", "*Allora, che cosa prendiamo?*"],
        ["*comunque*", "de todos modos", "*Comunque, grazie lo stesso.*"],
        ["*insomma*", "en fin / en resumen", "*Insomma, non è male.*"],
        ["*magari*", "ojalá / quizás", "*Magari vengo anch'io.*"],
      ],
    },
    {
      kind: "p",
      text: "**Discurso indirecto.** Para contar lo que alguien dijo usas *che* y, si hablas de algo pasado, los verbos suelen bajar un paso. «*Sono stanco*» → *Ha detto che **era** stanco.* «*Vengo alle tre*» → *Ha detto che **veniva** alle tre* (en la lengua hablada; en un texto cuidado se prefiere *sarebbe venuto*). Con preguntas se usa *se*: *Mi ha chiesto **se** parlo italiano* (si sigue siendo cierto) o *se parlavo italiano* (referido a aquel momento).",
    },
    {
      kind: "p",
      text: "**Congiuntivo (solo reconocerlo).** Después de verbos de opinión, duda o deseo (*penso che, credo che, spero che, è importante che*) el italiano usa un modo especial. Todavía no hace falta conjugarlo: reconoce las formas más comunes.",
    },
    {
      kind: "table",
      head: ["", "essere", "avere", "stare", "andare", "fare"],
      rows: [["que yo/él…", "*sia*", "*abbia*", "*stia*", "*vada*", "*faccia*"]],
    },
    {
      kind: "p",
      text: "*Penso che sia giusto.* · *Credo che abbia ragione.* · *Spero che tu stia bene.* · *È importante che vada subito.*",
    },
  ],
  transfer:
    "*Perché* significa \"porque\" y también \"¿por qué?\" (en español se distinguen por la tilde y la forma; en italiano es la misma palabra). Para el discurso indirecto, el español hace casi lo mismo (*dijo que estaba cansado*): aquí no hay trampa. El *congiuntivo* sí existe en español (*que sea*), así que vas a reconocerlo con facilidad.",
  examples: [
    { it: "Non vengo perché sono stanco.", es: "No voy porque estoy cansado." },
    { it: "Piove, quindi resto a casa.", es: "Llueve, así que me quedo en casa." },
    { it: "Mi ha detto che era stanco.", es: "Me dijo que estaba cansado." },
    { it: "Mi ha chiesto se parlo italiano.", es: "Me preguntó si hablo italiano." },
    { it: "Penso che sia una buona idea.", es: "Pienso que es una buena idea." },
    { it: "Spero che tu stia bene.", es: "Espero que estés bien." },
  ],
  notice: [
    {
      type: "choice",
      prompt: "«Mi ha detto che era stanco.» ¿Cuándo estaba cansado?",
      options: ["Cuando lo dijo (en el pasado)", "Ahora mismo", "En el futuro"],
      answer: 0,
      why: "*Era* (imperfetto) refiere a un estado pasado que coincide con el momento en que lo dijo.",
    },
    {
      type: "choice",
      prompt: "«Penso che sia tardi.» ¿Qué expresa?",
      options: ["Una opinión", "Un hecho seguro", "Una orden"],
      answer: 0,
      why: "*Penso che* + congiuntivo (*sia*) = una opinión.",
    },
    {
      type: "choice",
      prompt: "«Spero che tu stia bene.» ¿Qué expresa?",
      options: ["Un deseo", "Una pregunta", "Un recuerdo"],
      answer: 0,
      why: "*Spero che* introduce un deseo.",
    },
  ],
  exercises: [
    { type: "fill", prompt: "Non vengo ___ sono stanco. (porque)", answers: ["perché"], why: "*Perché* = porque, con tilde." },
    { type: "fill", prompt: "Piove, ___ resto a casa. (por lo tanto)", answers: ["quindi"], why: "*Quindi* = por lo tanto." },
    { type: "fill", prompt: "Io bevo caffè, lui ___ tè. (en cambio)", answers: ["invece"], why: "*Invece* = en cambio." },
    { type: "fill", prompt: "Mi ha detto che ___ stanco. (él, essere, imperfetto)", answers: ["era"], why: "Discurso indirecto en pasado: *era*." },
    { type: "fill", prompt: "Mi ha chiesto ___ parlo italiano. (si)", answers: ["se"], why: "En preguntas indirectas: *se*." },
    {
      type: "choice",
      prompt: "¿Cuál de estas es una forma de congiuntivo?",
      options: ["sono", "sia", "eravamo"],
      answer: 1,
      why: "*Sia* es el congiuntivo de *essere*.",
    },
    {
      type: "choice",
      prompt: "«Spero che tu stia bene.» ¿Qué parte es el congiuntivo?",
      options: ["spero", "stia", "bene"],
      answer: 1,
      why: "*Stia* es el congiuntivo de *stare*.",
    },
    {
      type: "choice",
      prompt: "«Me dijo que venía a las tres»",
      options: ["Ha detto che veniva alle tre", "Ha detto che venga alle tre", "Dice che veniva alle tre"],
      answer: 0,
      why: "Contar algo dicho en el pasado: *ha detto che* + imperfetto.",
    },
    {
      type: "choice",
      prompt: "«Llueve, así que me quedo en casa.» ¿Con qué conector lo unes?",
      options: ["Piove, quindi resto a casa.", "Piove, invece resto a casa.", "Piove, mentre resto a casa."],
      answer: 0,
      why: "*Quindi* marca la consecuencia.",
    },
    {
      type: "choice",
      prompt: "Alguien te dice: «Penso che sia giusto». ¿Qué opina?",
      options: ["Que es correcto o justo", "Que es una orden", "Que no sabe nada"],
      answer: 0,
      why: "*Sia giusto* = es justo / es correcto.",
    },
  ],
};
