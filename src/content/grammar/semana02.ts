import type { Lesson } from "./types";

export const semana02: Lesson = {
  week: 2,
  title: "Artículos, c'è / ci sono, avere y piacere",
  situation: "Describir tu barrio o alojamiento y decir qué te gusta",
  rule: [
    {
      kind: "p",
      text: "En italiano el artículo cambia según la primera letra de la palabra que sigue. Es lo más distinto del español.",
    },
    {
      kind: "table",
      head: ["", "masculino", "femenino"],
      rows: [
        ["consonante", "*il* libro · *i* libri", "*la* casa · *le* case"],
        ["s + consonante, z, gn, ps", "*lo* studente · *gli* studenti", "*la* scuola · *le* scuole"],
        ["vocal", "*l'*amico · *gli* amici", "*l'*amica · *le* amiche"],
      ],
    },
    {
      kind: "p",
      text: "**Un / una**: *un* libro, *uno* studente, *una* casa, *un'*amica (con apóstrofo solo en femenino). **Plural**: *-o → -i* (*libro → libri*), *-a → -e* (*casa → case*), *-e → -i* (*studente → studenti*).",
    },
    {
      kind: "table",
      head: ["avere", "ejemplo"],
      rows: [
        ["io *ho*", "*Ho un appartamento.*"],
        ["tu *hai*", "*Hai fame?*"],
        ["lui/lei *ha*", "*Ha trent'anni.*"],
        ["noi *abbiamo*", "*Abbiamo una camera.*"],
        ["voi *avete*", "*Avete il conto?*"],
        ["loro *hanno*", "*Hanno due figli.*"],
      ],
    },
    {
      kind: "p",
      text: "**C'è / ci sono** = hay. Uno solo: *C'è un supermercato vicino.* Varios: *Ci sono due bar.* **Piacere** funciona como *gustar*: lo que gusta es el sujeto. *Mi piace il caffè* (singular), *Mi piacciono i gelati* (plural).",
    },
  ],
  transfer:
    "En español *el, la, los, las* no cambian; en italiano sí: *il tavolo*, pero *lo zaino* y *l'amico*. Con *piacere* pasa lo mismo que con *gustar*: *mi piacciono i gelati* = me gustan los helados. No digas *io piaccio il gelato*.",
  examples: [
    { it: "C'è un supermercato vicino a casa.", es: "Hay un supermercado cerca de casa." },
    { it: "Ci sono due bar in piazza.", es: "Hay dos bares en la plaza." },
    { it: "L'appartamento ha una camera e un bagno.", es: "El departamento tiene una habitación y un baño." },
    { it: "Mi piace il caffè, ma non mi piacciono i dolci.", es: "Me gusta el café, pero no me gustan los dulces." },
    { it: "Hai fame? Io ho sete.", es: "¿Tenés hambre? Yo tengo sed." },
    { it: "Gli studenti hanno gli zaini.", es: "Los estudiantes tienen las mochilas." },
  ],
  notice: [
    {
      type: "choice",
      prompt: "«Mi piacciono i gelati.» ¿Qué dice?",
      options: ["Me gusta un helado", "Me gustan los helados", "Les gustan los helados a ellos"],
      answer: 1,
      why: "*Piacciono* + *i gelati* (plural): lo que gusta son varios.",
    },
    {
      type: "choice",
      prompt: "«C'è un bar» o «Ci sono due bar»: ¿cuál habla de uno solo?",
      options: ["C'è un bar", "Ci sono due bar", "Las dos"],
      answer: 0,
      why: "*C'è* (singular) vs. *ci sono* (plural).",
    },
    {
      type: "choice",
      prompt: "«Gli amici arrivano» y «Le amiche arrivano»: ¿cuál habla solo de mujeres?",
      options: ["Gli amici", "Le amiche", "Las dos"],
      answer: 1,
      why: "*Le amiche* es el plural femenino; *gli amici* es masculino (o un grupo mixto).",
    },
  ],
  exercises: [
    { type: "fill", prompt: "___ libro (el)", answers: ["il"], why: "Masculino delante de consonante: *il*." },
    { type: "fill", prompt: "___ studente (el)", answers: ["lo"], why: "Delante de *s* + consonante va *lo*." },
    { type: "fill", prompt: "___ amica (la)", answers: ["l'", "l'amica"], why: "Delante de vocal se usa *l'* (*l'amica*)." },
    { type: "fill", prompt: "___ case (las)", answers: ["le"], why: "Plural femenino: *le*." },
    { type: "fill", prompt: "___ zaini (los)", answers: ["gli"], why: "Plural de *lo zaino*: *gli zaini*." },
    { type: "fill", prompt: "Ho ___ amico italiano. (artículo indefinido)", answers: ["un"], why: "*Amico* es masculino: *un amico*." },
    { type: "fill", prompt: "Mi ___ la pizza. (me gusta)", answers: ["piace"], why: "La pizza es singular: *piace*." },
    {
      type: "choice",
      prompt: "«Me gustan los gelati»",
      options: ["Mi piace i gelati", "Mi piacciono i gelati", "Io piaccio i gelati"],
      answer: 1,
      why: "Plural → *piacciono*. El que siente va con *mi*.",
    },
    {
      type: "choice",
      prompt: "«Hay tres supermercados cerca»",
      options: ["C'è tre supermercati", "Ci sono tre supermercati", "Ho tre supermercati"],
      answer: 1,
      why: "Plural → *ci sono*.",
    },
    {
      type: "choice",
      prompt: "«Tenemos una habitación»",
      options: ["Abbiamo una camera", "Siamo una camera", "Avete una camera"],
      answer: 0,
      why: "*Noi abbiamo* = tenemos.",
    },
  ],
};
