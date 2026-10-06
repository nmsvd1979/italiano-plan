import type { Lesson } from "./types";

export const semana04: Lesson = {
  week: 4,
  title: "Preposiciones con verbos de movimiento y falsos amigos",
  situation: "Moverte por la ciudad (repaso de la fase 1)",
  rule: [
    {
      kind: "p",
      text: "Con los verbos de movimiento el italiano reparte el trabajo que en español hace casi solo *a*:",
    },
    {
      kind: "table",
      head: ["Preposición", "Se usa con", "Ejemplo"],
      rows: [
        ["*a*", "ciudades y lugares puntuales", "*Vado a Roma.* · *Vado a casa.*"],
        ["*in*", "países, regiones y medios de transporte", "*Vivo in Italia.* · *Vado in treno.*"],
        ["*da*", "personas y profesionales (a casa de…)", "*Vado da Marco.* · *Vado dal medico.*"],
      ],
    },
    {
      kind: "p",
      text: "Excepción útil: *a piedi* (caminando). **Preposiciones articuladas**: *a, di, da, in, su* se fusionan con el artículo (*a + il = al*, *in + la = nella*). *Con* y *per* normalmente no se fusionan.",
    },
    {
      kind: "table",
      head: ["", "il", "lo", "l'", "la", "i", "gli", "le"],
      rows: [
        ["*a*", "al", "allo", "all'", "alla", "ai", "agli", "alle"],
        ["*di*", "del", "dello", "dell'", "della", "dei", "degli", "delle"],
        ["*da*", "dal", "dallo", "dall'", "dalla", "dai", "dagli", "dalle"],
        ["*in*", "nel", "nello", "nell'", "nella", "nei", "negli", "nelle"],
        ["*su*", "sul", "sullo", "sull'", "sulla", "sui", "sugli", "sulle"],
      ],
    },
    {
      kind: "table",
      head: ["Falso amigo", "Significa", "No es"],
      rows: [
        ["*burro*", "manteca / mantequilla", "burro (animal)"],
        ["*salire*", "subir", "salir (eso es *uscire*)"],
        ["*caldo*", "caliente / calor", "—"],
        ["*largo*", "ancho", "largo (eso es *lungo*)"],
        ["*camera*", "habitación", "cámara"],
        ["*guardare*", "mirar", "guardar (eso es *conservare*)"],
        ["*bicchiere*", "vaso", "—"],
      ],
    },
  ],
  transfer:
    "En español dices *voy a Italia*, *voy a Roma* y *voy a casa de Marco* con la misma *a*; en italiano son tres: *in Italia*, *a Roma*, *da Marco*. Y no confundas *salire* (subir) con *salir*: para salir de un lugar usa *uscire*.",
  examples: [
    { it: "Vado a Firenze in treno.", es: "Voy a Florencia en tren." },
    { it: "Domani vado dal medico.", es: "Mañana voy al médico." },
    { it: "Il museo è nella piazza, di fronte alla stazione.", es: "El museo está en la plaza, frente a la estación." },
    { it: "Scendo alla prossima fermata.", es: "Bajo en la próxima parada." },
    { it: "Vorrei del burro, per favore.", es: "Quisiera manteca, por favor." },
    { it: "Esco dall'hotel alle nove.", es: "Salgo del hotel a las nueve." },
  ],
  notice: [
    {
      type: "choice",
      prompt: "«Vado da Marco.» ¿Adónde va?",
      options: ["A la ciudad llamada Marco", "A la casa de Marco", "Al supermercado"],
      answer: 1,
      why: "*Da* + persona = a casa de esa persona.",
    },
    {
      type: "choice",
      prompt: "En el hotel te dicen: «La camera è al secondo piano.» ¿Qué es la *camera*?",
      options: ["Una cámara de fotos", "La habitación", "El baño"],
      answer: 1,
      why: "*Camera* es habitación: falso amigo de *cámara*.",
    },
    {
      type: "choice",
      prompt: "«Il pane è sul tavolo.» ¿Dónde está el pan?",
      options: ["Sobre la mesa", "Bajo la mesa", "Dentro de la mesa"],
      answer: 0,
      why: "*Sul* = *su* + *il*: sobre el.",
    },
    {
      type: "choice",
      prompt: "Quieres decir «salgo de la estación». ¿Cuál es correcto?",
      options: ["Salgo dalla stazione", "Esco dalla stazione", "Scendo dalla stazione"],
      answer: 1,
      why: "Salir de un lugar es *uscire*. *Salgo* en italiano significa \"subo\".",
    },
  ],
  exercises: [
    { type: "fill", prompt: "Vado ___ Roma. (ciudad)", answers: ["a"], why: "Las ciudades llevan *a*." },
    { type: "fill", prompt: "Vivo ___ Italia.", answers: ["in"], why: "Los países llevan *in*." },
    { type: "fill", prompt: "Vado ___ treno.", answers: ["in"], why: "Medio de transporte: *in treno*." },
    { type: "fill", prompt: "Stasera vado ___ Marco.", answers: ["da"], why: "A casa de una persona: *da*." },
    { type: "fill", prompt: "Il museo è ___ piazza. (en la)", answers: ["nella"], why: "*in + la = nella*." },
    { type: "fill", prompt: "Vado ___ mercato. (a + il)", answers: ["al"], why: "*a + il = al*." },
    { type: "fill", prompt: "Il libro è ___ tavolo. (sobre el)", answers: ["sul"], why: "*su + il = sul*." },
    { type: "fill", prompt: "Esco ___ hotel alle nove. (da + l')", answers: ["dall'", "dall'hotel"], why: "*da + l' = dall'*." },
    {
      type: "choice",
      prompt: "Quieres decir que bajas del tren en la próxima estación.",
      options: ["Salgo alla prossima", "Scendo alla prossima", "Esco alla prossima"],
      answer: 1,
      why: "Bajar es *scendere*; *salire* es subir.",
    },
    {
      type: "choice",
      prompt: "Reservas una habitación doble. ¿Qué dices?",
      options: ["Una camera doppia", "Una fotocamera doppia", "Un burro doppio"],
      answer: 0,
      why: "*Camera* es habitación; la cámara de fotos es *fotocamera*.",
    },
  ],
};
