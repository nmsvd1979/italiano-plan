import type { Lesson } from "./types";

export const semana07: Lesson = {
  week: 7,
  title: "Passato prossimo con essere y concordancia",
  situation: "Contar un viaje",
  rule: [
    {
      kind: "p",
      text: "Algunos verbos forman el passato prossimo con **essere** (*sono, sei, è, siamo, siete, sono*) y no con *avere*. Regla práctica: **movimiento, cambio de estado y verbos reflexivos** van con *essere*.",
    },
    {
      kind: "table",
      head: ["Verbo", "Participio", "Ejemplo"],
      rows: [
        ["*andare*", "andato", "*Sono andato a Firenze.*"],
        ["*venire*", "venuto", "*Sei venuta con noi?*"],
        ["*partire / arrivare*", "partito / arrivato", "*Siamo arrivati tardi.*"],
        ["*tornare / uscire*", "tornato / uscito", "*Sono uscita alle otto.*"],
        ["*essere / stare*", "stato", "*Siamo stati a Roma.*"],
        ["*nascere*", "nato", "*Sono nato nel 1990.*"],
        ["*alzarsi* (reflexivo)", "alzato", "*Mi sono alzata presto.*"],
      ],
    },
    {
      kind: "p",
      text: "**Concordancia.** Con *essere* el participio cambia como un adjetivo y concuerda con el sujeto: *-o* (él), *-a* (ella), *-i* (varios), *-e* (varias mujeres). *Marco è andato*, *Anna è andata*, *Marco e Anna sono andati*, *Anna e Giulia sono andate*. Con *avere* el participio no cambia: *Anna ha mangiato*.",
    },
  ],
  transfer:
    "Acá está la trampa más grande del pasado. En español *he ido* usa *haber*, así que sale *ho andato*. Es incorrecto: es *sono andato*. Y el participio con *essere* concuerda en género y número, algo que el español no hace con *haber*.",
  examples: [
    { it: "Sono andata a Firenze in treno.", es: "Fui a Florencia en tren (habla una mujer)." },
    { it: "Siamo arrivati alle dieci di sera.", es: "Llegamos a las diez de la noche." },
    { it: "Ieri mi sono alzato tardi.", es: "Ayer me levanté tarde." },
    { it: "Siete stati a Venezia?", es: "¿Estuvieron en Venecia?" },
    { it: "Le mie amiche sono partite domenica.", es: "Mis amigas se fueron el domingo." },
    { it: "Sono nato a Buenos Aires.", es: "Nací en Buenos Aires." },
  ],
  notice: [
    {
      type: "choice",
      prompt: "«È andata a Roma.» ¿Quién fue?",
      options: ["Un hombre", "Una mujer", "Se puede cualquiera de los dos"],
      answer: 1,
      why: "El participio *andata* termina en *-a*: sujeto femenino.",
    },
    {
      type: "choice",
      prompt: "«Siamo tornate tardi.» ¿Quiénes volvieron?",
      options: ["Solo mujeres (nosotras)", "Hombres o grupo mixto", "Una persona"],
      answer: 0,
      why: "*Tornate* (*-e*) concuerda con un grupo de mujeres.",
    },
    {
      type: "choice",
      prompt: "«Sono partiti ieri.» ¿Quiénes se fueron?",
      options: ["Varios hombres o un grupo mixto", "Una mujer", "Varias mujeres"],
      answer: 0,
      why: "*Partiti* (*-i*) es plural masculino o mixto.",
    },
  ],
  exercises: [
    { type: "fill", prompt: "Ieri io ___ andato al mercato. (essere)", answers: ["sono"], why: "*Andare* va con *essere*: *sono andato*." },
    { type: "fill", prompt: "Anna è ___ a casa. (tornare)", answers: ["tornata"], why: "Anna es mujer: *tornata*." },
    { type: "fill", prompt: "Marco è ___ presto. (partire)", answers: ["partito"], why: "Marco es varón: *partito*." },
    { type: "fill", prompt: "Marco e Anna sono ___ in ritardo. (arrivare)", answers: ["arrivati"], why: "Grupo mixto: plural masculino *arrivati*." },
    { type: "fill", prompt: "Giulia e Sara sono ___ al cinema. (andare)", answers: ["andate"], why: "Solo mujeres: *andate*." },
    { type: "fill", prompt: "Noi ci ___ divertiti. (essere)", answers: ["siamo"], why: "Los reflexivos van con *essere*: *ci siamo divertiti*." },
    { type: "fill", prompt: "Siete ___ a Venezia? (essere, plural)", answers: ["stati"], why: "*Essere → stato*; con *voi* mixto: *stati*." },
    {
      type: "choice",
      prompt: "«Fui a Florencia» (habla un varón)",
      options: ["Ho andato a Firenze", "Sono andato a Firenze", "Sono andata a Firenze"],
      answer: 1,
      why: "*Andare* usa *essere* y concuerda con quien habla (varón): *andato*.",
    },
    {
      type: "choice",
      prompt: "«Ayer comí pasta»",
      options: ["Ieri sono mangiato la pasta", "Ieri ho mangiato la pasta", "Ieri ho mangiata la pasta"],
      answer: 1,
      why: "*Mangiare* va con *avere* y el participio no cambia.",
    },
    {
      type: "choice",
      prompt: "«Me levanté a las seis» (habla una mujer)",
      options: ["Mi ho alzata alle sei", "Mi sono alzata alle sei", "Mi sono alzato alle sei"],
      answer: 1,
      why: "Reflexivo → *essere*, y concuerda con quien habla (mujer): *alzata*.",
    },
  ],
};
