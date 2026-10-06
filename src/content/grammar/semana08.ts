import type { Lesson } from "./types";

export const semana08: Lesson = {
  week: 8,
  title: "Imperfetto y passato prossimo",
  situation: "Describir y narrar el pasado (repaso de la fase 2)",
  rule: [
    {
      kind: "p",
      text: "El **imperfetto** describe cómo eran las cosas, lo habitual y lo que estaba pasando. Se forma con la raíz del infinitivo más la terminación:",
    },
    {
      kind: "table",
      head: ["", "parlare", "vendere", "dormire", "essere"],
      rows: [
        ["io", "parl*avo*", "vend*evo*", "dorm*ivo*", "*ero*"],
        ["tu", "parl*avi*", "vend*evi*", "dorm*ivi*", "*eri*"],
        ["lui/lei", "parl*ava*", "vend*eva*", "dorm*iva*", "*era*"],
        ["noi", "parl*avamo*", "vend*evamo*", "dorm*ivamo*", "*eravamo*"],
        ["voi", "parl*avate*", "vend*evate*", "dorm*ivate*", "*eravate*"],
        ["loro", "parl*avano*", "vend*evano*", "dorm*ivano*", "*erano*"],
      ],
    },
    {
      kind: "p",
      text: "Irregulares frecuentes: *fare → facevo*, *dire → dicevo*, *bere → bevevo*. Los demás se forman con regularidad.",
    },
    {
      kind: "table",
      head: ["Imperfetto", "Passato prossimo"],
      rows: [
        ["Descripción y estados: *Faceva caldo.* *Era stanco.*", "Hechos concretos y terminados: *Ieri ho visto un film.*"],
        ["Costumbre: *Da bambino giocavo a calcio.*", "Algo que pasó una vez: *Sabato sono andato allo stadio.*"],
        ["Acción en curso: *Mentre mangiavo…*", "…que interrumpe otra: *…è arrivato Marco.*"],
      ],
    },
    {
      kind: "p",
      text: "Se combinan en la misma frase: *Mentre camminavo (acción de fondo), ho visto (hecho puntual) il Colosseo.* Pistas del imperfetto: *di solito, sempre, ogni giorno, da piccolo, mentre*.",
    },
  ],
  transfer:
    "Esto lo sabes hacer en español: *comía* ≈ *mangiavo* (imperfetto) y *comí / he comido* ≈ *ho mangiato* (passato prossimo). La diferencia es que en italiano no aparece el *pretérito indefinido* (*comí*) en el habla del norte: usas el passato prossimo, que cubre los dos casos.",
  examples: [
    { it: "Da piccola abitavo a Torino.", es: "De chica vivía en Turín." },
    { it: "Faceva freddo e pioveva.", es: "Hacía frío y llovía." },
    { it: "Mentre aspettavo il treno, ho letto un libro.", es: "Mientras esperaba el tren, leí un libro." },
    { it: "Ieri sera siamo andati al ristorante.", es: "Anoche fuimos al restaurante." },
    { it: "Di solito mangiavamo alle otto.", es: "Generalmente comíamos a las ocho." },
    { it: "Quando ero giovane, viaggiavo molto.", es: "Cuando era joven, viajaba mucho." },
  ],
  notice: [
    {
      type: "choice",
      prompt: "«Da bambino giocavo a calcio.» ¿Qué dice?",
      options: ["Jugó un partido una vez", "Jugaba habitualmente de chico", "Va a jugar"],
      answer: 1,
      why: "*Giocavo* es imperfetto y *da bambino* confirma la costumbre.",
    },
    {
      type: "choice",
      prompt: "«Ieri ho visto un film.» ¿Es un hecho puntual o una costumbre?",
      options: ["Un hecho puntual terminado", "Una costumbre", "Una descripción"],
      answer: 0,
      why: "*Ieri* + passato prossimo: un hecho concreto y cerrado.",
    },
    {
      type: "choice",
      prompt: "«Mentre dormivo, è suonato il telefono.» ¿Qué interrumpe a qué?",
      options: ["El sueño interrumpe el llamado", "El llamado interrumpe el sueño", "Pasan separados"],
      answer: 1,
      why: "*Dormivo* es lo que estaba pasando; *è suonato* es el hecho que lo interrumpe.",
    },
  ],
  exercises: [
    { type: "fill", prompt: "Da piccola io ___ a Torino. (abitare)", answers: ["abitavo"], why: "Costumbre en el pasado: imperfetto, *abitavo*." },
    { type: "fill", prompt: "Quando ero giovane, ___ molto. (io, viaggiare)", answers: ["viaggiavo"], why: "*Viaggiare → viaggiavo*." },
    { type: "fill", prompt: "Di solito noi ___ alle otto. (mangiare)", answers: ["mangiavamo"], why: "*Di solito* pide imperfetto: *mangiavamo*." },
    { type: "fill", prompt: "Faceva freddo e ___. (piovere)", answers: ["pioveva"], why: "Descripción del clima: *pioveva*." },
    { type: "fill", prompt: "Io ___ stanco. (essere, imperfetto)", answers: ["ero"], why: "*Essere → ero*." },
    { type: "fill", prompt: "Loro ___ sempre in ritardo. (essere, imperfetto)", answers: ["erano"], why: "*Essere → erano*." },
    { type: "fill", prompt: "Mentre ___ il treno, ho letto. (io, aspettare)", answers: ["aspettavo"], why: "*Mentre* + acción de fondo: *aspettavo*." },
    {
      type: "choice",
      prompt: "«Ayer a la noche vimos una película»",
      options: ["Ieri sera vedevamo un film", "Ieri sera abbiamo visto un film", "Ieri sera siamo visto un film"],
      answer: 1,
      why: "Hecho puntual y terminado: passato prossimo (*abbiamo visto*).",
    },
    {
      type: "choice",
      prompt: "«Cuando era chico, vivía en Roma»",
      options: ["Quando ero piccolo, ho abitato a Roma", "Quando ero piccolo, abitavo a Roma", "Quando sono piccolo, abitavo a Roma"],
      answer: 1,
      why: "Los dos verbos describen un período del pasado: imperfetto (*ero*, *abitavo*).",
    },
    {
      type: "choice",
      prompt: "«Mientras caminaba, vi el Coliseo»",
      options: ["Mentre camminavo, ho visto il Colosseo", "Mentre ho camminato, vedevo il Colosseo", "Mentre camminavo, vedevo il Colosseo"],
      answer: 0,
      why: "*Camminavo* = acción de fondo; *ho visto* = hecho puntual.",
    },
  ],
};
