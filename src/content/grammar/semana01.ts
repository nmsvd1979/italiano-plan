import type { Lesson } from "./types";

export const semana01: Lesson = {
  week: 1,
  title: "Essere, tu y Lei, saludos",
  situation: "Llegar a Italia y presentarte",
  rule: [
    {
      kind: "p",
      text: "*Essere* es el verbo para presentarte y decir de dónde sos. Es irregular: aprendé las seis formas como un bloque.",
    },
    {
      kind: "table",
      head: ["", "essere", "ejemplo"],
      rows: [
        ["io", "sono", "*Sono Lucía.*"],
        ["tu", "sei", "*Sei di Roma?*"],
        ["lui / lei / Lei", "è", "*Lei è argentina.*"],
        ["noi", "siamo", "*Siamo in vacanza.*"],
        ["voi", "siete", "*Siete italiani?*"],
        ["loro", "sono", "*Sono turisti.*"],
      ],
    },
    {
      kind: "p",
      text: "El pronombre sujeto casi siempre se omite: se dice *Sono argentina*, no *Io sono argentina*. *Io* aparece solo para contrastar (*Io sono di Córdoba, lui di Mendoza*).",
    },
    {
      kind: "p",
      text: "**Tu o Lei.** Con amigos y gente joven usás *tu* (*Come stai?*). Con desconocidos, en tiendas, trámites o con personas mayores usás *Lei* (*Come sta?*), que lleva el verbo en la forma de *lui/lei*. Si dudás, empezá con *Lei*: nadie se ofende.",
    },
    {
      kind: "table",
      head: ["Saludo", "Cuándo"],
      rows: [
        ["*Buongiorno*", "Hasta media tarde, con cualquiera"],
        ["*Buonasera*", "Desde la tarde, con cualquiera"],
        ["*Ciao*", "Solo con amigos: sirve para hola y chau"],
        ["*Arrivederci*", "Chau, en situaciones formales"],
        ["*Piacere*", "Mucho gusto, al conocer a alguien"],
        ["*Mi chiamo…*", "Me llamo…"],
        ["*Scusi*", "Disculpe (formal) / *Scusa* (informal)"],
      ],
    },
  ],
  transfer:
    "*Lei* (usted) y *lei* (ella) se escriben igual: lo decide el contexto. Y *essere* te sirve para decir dónde estás (*Sono a Milano*), pero para el estado (\"estoy bien\") se usa otro verbo, *stare*: *Sto bene* (lo vemos en la semana 5).",
  examples: [
    { it: "Buongiorno, sono Lucía. Piacere!", es: "Buen día, soy Lucía. ¡Mucho gusto!" },
    { it: "Di dov'è, signora?", es: "¿De dónde es, señora? (formal)" },
    { it: "Sono argentino, di Buenos Aires.", es: "Soy argentino, de Buenos Aires." },
    { it: "Tu sei di Roma?", es: "¿Vos sos de Roma? (informal)" },
    { it: "Siamo in vacanza.", es: "Estamos de vacaciones." },
    { it: "Scusi, è libero questo posto?", es: "Disculpe, ¿está libre este asiento?" },
  ],
  notice: [
    {
      type: "choice",
      prompt: "«Siete argentini?» ¿A cuántas personas le hablan?",
      options: ["A una sola", "A varias personas", "A nadie en particular"],
      answer: 1,
      why: "*Siete* es la forma de *voi*: se habla a varias personas.",
    },
    {
      type: "choice",
      prompt: "El camarero le dice a una señora: «Lei è pronta per ordinare?» ¿Qué trato usa?",
      options: ["Formal (le habla de usted)", "Informal (le habla de vos)", "Habla de otra mujer"],
      answer: 0,
      why: "Le habla directamente a ella con *Lei*: es el trato formal.",
    },
    {
      type: "choice",
      prompt: "«Siamo di Córdoba.» ¿Quién habla?",
      options: ["Una sola persona", "Un grupo que se incluye", "Un grupo del que no forma parte"],
      answer: 1,
      why: "*Siamo* es la forma de *noi*: el que habla se incluye.",
    },
    {
      type: "choice",
      prompt: "«Arrivederci, signora!» ¿Qué se está haciendo?",
      options: ["Saludar al llegar", "Despedirse con formalidad", "Presentarse"],
      answer: 1,
      why: "*Arrivederci* es el chau formal.",
    },
  ],
  exercises: [
    { type: "fill", prompt: "Io ___ argentina.", answers: ["sono"], why: "Con *io* va *sono*." },
    { type: "fill", prompt: "Tu ___ di Roma?", answers: ["sei"], why: "Con *tu* va *sei*." },
    { type: "fill", prompt: "Lei ___ la signora Rossi.", answers: ["è"], why: "Con *lui/lei/Lei* va *è*, con tilde: sin tilde (*e*) significa \"y\"." },
    { type: "fill", prompt: "Noi ___ in vacanza.", answers: ["siamo"], why: "Con *noi* va *siamo*." },
    { type: "fill", prompt: "Voi ___ italiani?", answers: ["siete"], why: "Con *voi* va *siete*." },
    { type: "fill", prompt: "Loro ___ turisti.", answers: ["sono"], why: "*Sono* sirve para *io* y para *loro*." },
    { type: "fill", prompt: "Mi ___ Laura. (me llamo)", answers: ["chiamo"], why: "*Mi chiamo* = me llamo." },
    {
      type: "choice",
      prompt: "Hablás con una señora mayor en el banco. ¿Qué le preguntás?",
      options: ["Come stai?", "Come sta?", "Come state?"],
      answer: 1,
      why: "A una persona mayor o desconocida se le habla de *Lei*: *Come sta?*",
    },
    {
      type: "choice",
      prompt: "Entrás a un restaurante a las nueve de la noche. ¿Qué decís?",
      options: ["Buongiorno", "Buonasera", "Arrivederci"],
      answer: 1,
      why: "De noche se saluda con *Buonasera*.",
    },
    {
      type: "choice",
      prompt: "¿Cómo decís «Ellos son de Bolonia»?",
      options: ["Siamo di Bologna", "Sono di Bologna", "Siete di Bologna"],
      answer: 1,
      why: "*Loro sono* → *Sono di Bologna*.",
    },
  ],
};
