import type { Lesson } from "./types";

export const unidad09: Lesson = {
  unit: "u09",
  title: "Passato prossimo con avere",
  situation: "Contar qué hiciste",
  rule: [
    {
      kind: "p",
      text: "El **passato prossimo** cuenta lo que ya pasó. Se arma con el presente de *avere* (*ho, hai, ha, abbiamo, avete, hanno*) más el **participio pasado**.",
    },
    {
      kind: "table",
      head: ["Infinitivo", "Participio", "Ejemplo"],
      rows: [
        ["parl*are*", "parl*ato*", "*Ho parlato con Marco.*"],
        ["vend*ere*", "vend*uto*", "*Hai venduto la bici?*"],
        ["dorm*ire*", "dorm*ito*", "*Abbiamo dormito bene.*"],
      ],
    },
    {
      kind: "p",
      text: "Participios irregulares que vas a usar todo el tiempo:",
    },
    {
      kind: "table",
      head: ["fare", "prendere", "dire", "vedere", "mettere", "scrivere", "leggere", "aprire", "bere"],
      rows: [["fatto", "preso", "detto", "visto", "messo", "scritto", "letto", "aperto", "bevuto"]],
    },
    {
      kind: "p",
      text: "**Marcadores**: *ieri* (ayer), *ieri sera*, *la settimana scorsa* (la semana pasada), *due giorni fa* (hace dos días). Las palabras *già* (ya), *non… ancora* (todavía no), *mai* (alguna vez / nunca) van **entre** *avere* y el participio: *Ho già mangiato.* · *Non ho ancora visto il Colosseo.* · *Hai mai provato il tiramisù?*",
    },
  ],
  transfer:
    "Con *avere* te va a salir natural porque el español usa *haber* (*he comido*). Dos diferencias: en italiano *ho mangiato* sirve tanto para \"he comido\" como para \"comí\" (ayer: *Ieri ho mangiato la pizza*), y *già / mai / ancora* se meten en el medio: *Ho già mangiato*, no *Ho mangiato già*.",
  examples: [
    { it: "Ieri ho visitato il Colosseo.", es: "Ayer visité el Coliseo." },
    { it: "Abbiamo mangiato una pizza fantastica.", es: "Comimos una pizza fantástica." },
    { it: "Ho già comprato i biglietti.", es: "Ya compré los pasajes." },
    { it: "Non ho ancora visto la Fontana di Trevi.", es: "Todavía no vi la Fontana di Trevi." },
    { it: "Hai mai provato il tiramisù?", es: "¿Probaste alguna vez el tiramisú?" },
    { it: "Che cosa avete fatto sabato?", es: "¿Qué hicieron el sábado?" },
  ],
  notice: [
    {
      type: "choice",
      prompt: "«Ho già mangiato.» ¿Tiene hambre?",
      options: ["Sí, no comió", "No, ya comió", "No se sabe"],
      answer: 1,
      why: "*Già* = ya: la acción está hecha.",
    },
    {
      type: "choice",
      prompt: "«Non ho ancora finito.» ¿Terminó?",
      options: ["Sí", "Todavía no", "Nunca va a terminar"],
      answer: 1,
      why: "*Non… ancora* = todavía no.",
    },
    {
      type: "choice",
      prompt: "«Abbiamo preso un taxi.» ¿Quién tomó el taxi?",
      options: ["Un grupo que incluye a quien habla", "Una sola persona", "Un grupo ajeno"],
      answer: 0,
      why: "*Abbiamo* es el *avere* de *noi*.",
    },
  ],
  exercises: [
    { type: "fill", prompt: "Ieri io ___ mangiato la pizza. (avere)", answers: ["ho"], why: "Con *io*: *ho* + participio." },
    { type: "fill", prompt: "Tu ___ parlato con il padrone di casa?", answers: ["hai"], why: "Con *tu*: *hai*." },
    { type: "fill", prompt: "Noi ___ dormito bene.", answers: ["abbiamo"], why: "Con *noi*: *abbiamo*." },
    { type: "fill", prompt: "Ho ___ la porta. (aprire)", answers: ["aperto"], why: "*Aprire → aperto* (irregular)." },
    { type: "fill", prompt: "Che cosa hai ___ ieri? (fare)", answers: ["fatto"], why: "*Fare → fatto* (irregular)." },
    { type: "fill", prompt: "Ho ___ un caffè. (prendere)", answers: ["preso"], why: "*Prendere → preso* (irregular)." },
    { type: "fill", prompt: "Hanno ___ la lettera. (scrivere)", answers: ["scritto"], why: "*Scrivere → scritto* (irregular)." },
    { type: "fill", prompt: "Ho ___ comprato i biglietti. (ya)", answers: ["già"], why: "*Già* (ya) va entre *ho* y el participio, con tilde." },
    {
      type: "choice",
      prompt: "«Todavía no vi el Coliseo»",
      options: ["Non ho ancora visto il Colosseo", "Ho non ancora visto il Colosseo", "Non ancora ho visto il Colosseo"],
      answer: 0,
      why: "*Non* va antes de *ho* y *ancora* entre *ho* y el participio.",
    },
    {
      type: "choice",
      prompt: "«Ayer comimos pizza»",
      options: ["Ieri abbiamo mangiato la pizza", "Ieri siamo mangiato la pizza", "Ieri mangiamo avere pizza"],
      answer: 0,
      why: "*Mangiare* usa *avere*: *abbiamo mangiato*.",
    },
  ],
};
