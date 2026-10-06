import type { Lesson } from "./types";

export const semana03: Lesson = {
  week: 3,
  title: "Presente, volere / potere / dovere y vorrei",
  situation: "Pedir en un bar y en un restaurante",
  rule: [
    {
      kind: "p",
      text: "Hay tres familias de verbos regulares, según el final del infinitivo. Cambias la terminación y listo.",
    },
    {
      kind: "table",
      head: ["", "parl*are*", "prend*ere*", "dorm*ire*", "fin*ire*"],
      rows: [
        ["io", "parl*o*", "prend*o*", "dorm*o*", "fin*isco*"],
        ["tu", "parl*i*", "prend*i*", "dorm*i*", "fin*isci*"],
        ["lui/lei", "parl*a*", "prend*e*", "dorm*e*", "fin*isce*"],
        ["noi", "parl*iamo*", "prend*iamo*", "dorm*iamo*", "fin*iamo*"],
        ["voi", "parl*ate*", "prend*ete*", "dorm*ite*", "fin*ite*"],
        ["loro", "parl*ano*", "prend*ono*", "dorm*ono*", "fin*iscono*"],
      ],
    },
    {
      kind: "p",
      text: "Muchos verbos en *-ire* (*finire, capire, preferire*) agregan *-isc-* en io, tu, lui/lei y loro. No existe en español: se aprende verbo por verbo.",
    },
    {
      kind: "table",
      head: ["", "volere (querer)", "potere (poder)", "dovere (deber)"],
      rows: [
        ["io", "voglio", "posso", "devo"],
        ["tu", "vuoi", "puoi", "devi"],
        ["lui/lei", "vuole", "può", "deve"],
        ["noi", "vogliamo", "possiamo", "dobbiamo"],
        ["voi", "volete", "potete", "dovete"],
        ["loro", "vogliono", "possono", "devono"],
      ],
    },
    {
      kind: "p",
      text: "Estos tres van seguidos de un infinitivo: *Posso avere il conto?* · *Dobbiamo andare.* Para pedir, *voglio* suena brusco. Usa **vorrei** (\"quisiera\"): *Vorrei un caffè, per favore.*",
    },
  ],
  transfer:
    "En el bar, *Voglio un caffè* suena brusco; los italianos dicen *Vorrei…* o *Prendo…* (\"tomo\"). Ojo con *prendere*: significa tomar o pedir (*Prendo un cappuccino*) y también agarrar. Y los verbos en *-ire* con *-isc-* (*finisco*) no tienen equivalente en español.",
  examples: [
    { it: "Vorrei un caffè e un cornetto, per favore.", es: "Quisiera un café y un cornetto, por favor." },
    { it: "Prendo un cappuccino. E tu?", es: "Tomo un capuchino. ¿Y tú?" },
    { it: "Posso avere il conto?", es: "¿Puedo pedir la cuenta?" },
    { it: "Non capisco: può ripetere?", es: "No entiendo: ¿puede repetir?" },
    { it: "Dobbiamo prenotare un tavolo per due.", es: "Tenemos que reservar una mesa para dos." },
    { it: "Il treno parte alle otto e finisce a Roma.", es: "El tren sale a las ocho y termina en Roma." },
  ],
  notice: [
    {
      type: "choice",
      prompt: "«Capisco, ma non parlo bene.» ¿Quién habla?",
      options: ["Una persona (yo)", "Un grupo (nosotros)", "Se habla de otro (él)"],
      answer: 0,
      why: "La terminación *-o* es la de *io*.",
    },
    {
      type: "choice",
      prompt: "«Possono sedersi qui.» ¿Quiénes pueden sentarse?",
      options: ["Una sola persona", "Varias personas", "Yo"],
      answer: 1,
      why: "*Possono* es la forma de *loro*: varias personas (o *Loro* en cortesía plural).",
    },
    {
      type: "choice",
      prompt: "Un camarero dice «Vuole altro?». ¿Qué trato está usando?",
      options: ["Formal, a un cliente", "Informal, a un amigo", "Habla de un tercero"],
      answer: 0,
      why: "*Vuole* con *Lei* (cortesía): le habla al cliente de usted.",
    },
  ],
  exercises: [
    { type: "fill", prompt: "Io ___ un caffè. (prendere)", answers: ["prendo"], why: "*Prendere* es de la familia -ere: *prendo*." },
    { type: "fill", prompt: "Tu ___ italiano? (parlare)", answers: ["parli"], why: "*Parlare* con *tu*: *parli*." },
    { type: "fill", prompt: "Noi ___ il conto. (chiedere)", answers: ["chiediamo"], why: "Con *noi*, siempre *-iamo*." },
    { type: "fill", prompt: "Io ___ la lezione alle nove. (finire)", answers: ["finisco"], why: "*Finire* agrega *-isc-*: *finisco*." },
    { type: "fill", prompt: "Loro ___ tardi. (dormire)", answers: ["dormono"], why: "*Dormire* sin *-isc-*: *dormono*." },
    { type: "fill", prompt: "Io ___ un caffè, per favore. (quisiera)", answers: ["vorrei"], why: "*Vorrei* es la forma cortés de pedir." },
    { type: "fill", prompt: "___ avere il conto? (¿puedo…?)", answers: ["posso"], why: "*Potere* con *io*: *posso*." },
    { type: "fill", prompt: "Noi ___ andare. (dovere)", answers: ["dobbiamo"], why: "*Dovere* con *noi*: *dobbiamo*." },
    {
      type: "choice",
      prompt: "En el bar quieres pedir un capuchino. ¿Qué es lo más natural?",
      options: ["Voglio un cappuccino.", "Vorrei un cappuccino, per favore.", "Io prendere cappuccino."],
      answer: 1,
      why: "*Vorrei … per favore* es el pedido cortés estándar.",
    },
    {
      type: "choice",
      prompt: "«Ellos quieren la cuenta»",
      options: ["Vogliono il conto", "Vuole il conto", "Vogliamo il conto"],
      answer: 0,
      why: "*Loro* + *volere* → *vogliono*.",
    },
  ],
};
