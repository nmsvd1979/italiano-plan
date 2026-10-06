import type { Lesson } from "./types";

export const semana11: Lesson = {
  week: 11,
  title: "Futuro semplice y condizionale",
  situation: "Hacer planes y pedir favores con cortesía",
  rule: [
    {
      kind: "p",
      text: "El **futuro** se forma con el infinitivo sin la *-e* final y las terminaciones *-ò, -ai, -à, -emo, -ete, -anno*. En los verbos en *-are* la *a* pasa a *e*.",
    },
    {
      kind: "table",
      head: ["", "parlare", "prendere", "dormire", "essere", "avere"],
      rows: [
        ["io", "parler*ò*", "prender*ò*", "dormir*ò*", "sar*ò*", "avr*ò*"],
        ["tu", "parler*ai*", "prender*ai*", "dormir*ai*", "sar*ai*", "avr*ai*"],
        ["lui/lei", "parler*à*", "prender*à*", "dormir*à*", "sar*à*", "avr*à*"],
        ["noi", "parler*emo*", "prender*emo*", "dormir*emo*", "sar*emo*", "avr*emo*"],
        ["voi", "parler*ete*", "prender*ete*", "dormir*ete*", "sar*ete*", "avr*ete*"],
        ["loro", "parler*anno*", "prender*anno*", "dormir*anno*", "sar*anno*", "avr*anno*"],
      ],
    },
    {
      kind: "p",
      text: "Con raíz irregular: *andare → andrò*, *fare → farò*, *venire → verrò*, *potere → potrò*, *dovere → dovrò*, *volere → vorrò*, *vedere → vedrò*. Y también sirve para suponer: *Sarà in ritardo* (debe de estar atrasado). Para un futuro cercano se usa mucho el presente: *Domani vado a Roma.*",
    },
    {
      kind: "p",
      text: "El **condizionale** usa la misma raíz del futuro con otras terminaciones (*-ei, -esti, -ebbe, -emmo, -este, -ebbero*). Sirve para ser cortés y dar consejos.",
    },
    {
      kind: "table",
      head: ["Uso", "Ejemplo"],
      rows: [
        ["Pedir con cortesía", "*Potrebbe aiutarmi?* (¿podría ayudarme?)"],
        ["Pedir algo", "*Vorrei un tavolo per due.*"],
        ["Dar un consejo", "*Dovresti riposare un po'.* (deberías descansar)"],
        ["Deseo", "*Mi piacerebbe visitare Venezia.*"],
      ],
    },
  ],
  transfer:
    "Se parece mucho al español (*hablaré, hablaría*), por eso es fácil: *parlerò, parlerei*. Ojo con la ortografía y la tilde final del futuro (*parlerò*, *parlerà*) y con los verbos con raíz irregular: *andrò*, *verrò*, *vorrò* no se forman con el infinitivo completo.",
  examples: [
    { it: "Domani visiterò il Colosseo.", es: "Mañana visitaré el Coliseo." },
    { it: "L'anno prossimo andrò a Roma.", es: "El año próximo iré a Roma." },
    { it: "Sarà in ritardo: non risponde.", es: "Debe de estar atrasado: no contesta." },
    { it: "Potrebbe ripetere, per favore?", es: "¿Podría repetir, por favor?" },
    { it: "Vorrei prenotare un tavolo per le otto.", es: "Quisiera reservar una mesa para las ocho." },
    { it: "Dovresti prendere un taxi: è lontano.", es: "Deberías tomar un taxi: está lejos." },
  ],
  notice: [
    {
      type: "choice",
      prompt: "«Partirò domani.» ¿Cuándo sale?",
      options: ["Ayer", "Hoy", "Mañana"],
      answer: 2,
      why: "*Partirò* es futuro (*-ò*).",
    },
    {
      type: "choice",
      prompt: "«Sarà stanco.» ¿Qué expresa?",
      options: ["Una suposición", "Un hecho seguro", "Una orden"],
      answer: 0,
      why: "El futuro también sirve para suponer: debe de estar cansado.",
    },
    {
      type: "choice",
      prompt: "«Potresti aiutarmi?» ¿Es una orden o un pedido cortés?",
      options: ["Un pedido cortés", "Una orden", "Una pregunta sobre el pasado"],
      answer: 0,
      why: "El condizionale (*potresti*) suaviza el pedido.",
    },
  ],
  exercises: [
    { type: "fill", prompt: "Domani io ___ il museo. (visitare)", answers: ["visiterò"], why: "-are → *-erò*: *visiterò*." },
    { type: "fill", prompt: "Tu ___ a Roma? (andare)", answers: ["andrai"], why: "Raíz irregular *andr-*: *andrai*." },
    { type: "fill", prompt: "Noi ___ in treno. (viaggiare)", answers: ["viaggeremo"], why: "-are → *-eremo*; *viaggiare* pierde la *i*: *viaggeremo*." },
    { type: "fill", prompt: "Lui ___ stanco. (essere, futuro)", answers: ["sarà"], why: "*Essere* → *sarà*." },
    { type: "fill", prompt: "Io ___ venire. (potere, futuro)", answers: ["potrò"], why: "*Potere* → *potrò*." },
    { type: "fill", prompt: "___ aiutarmi? (Lei, potere, cortés)", answers: ["potrebbe"], why: "Condizionale de *Lei*: *potrebbe*." },
    { type: "fill", prompt: "___ un caffè. (io, volere, cortés)", answers: ["vorrei"], why: "Condizionale de *volere*: *vorrei*." },
    {
      type: "choice",
      prompt: "«Mañana iré a Roma»",
      options: ["Domani andrò a Roma", "Domani andare a Roma", "Domani anderò a Roma"],
      answer: 0,
      why: "*Andare* tiene raíz irregular: *andrò*, no *anderò*.",
    },
    {
      type: "choice",
      prompt: "Quieres pedirle con cortesía a un desconocido que te ayude.",
      options: ["Aiutami!", "Potrebbe aiutarmi?", "Tu aiuti me?"],
      answer: 1,
      why: "Condizionale + *Lei* es el pedido cortés.",
    },
    {
      type: "choice",
      prompt: "Un amigo está resfriado. ¿Qué consejo le das?",
      options: ["Devi riposare!", "Dovresti riposare.", "Dovrà riposare."],
      answer: 1,
      why: "*Dovresti* (condizionale) es un consejo amable.",
    },
  ],
};
