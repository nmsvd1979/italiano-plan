import type { Lesson } from "./types";

export const semana09: Lesson = {
  week: 9,
  title: "Pronombres directos e indirectos",
  situation: "Comprar, devolver y pedir cosas",
  rule: [
    {
      kind: "p",
      text: "Los pronombres evitan repetir el objeto. **Directo** = *qué / a quién* (*lo veo*). **Indirecto** = *a quién* (*le doy*). Van antes del verbo conjugado.",
    },
    {
      kind: "table",
      head: ["", "directo", "indirecto"],
      rows: [
        ["yo / a mí", "*mi*", "*mi*"],
        ["vos / a vos", "*ti*", "*ti*"],
        ["él / lo", "*lo*", "*gli*"],
        ["ella / la", "*la*", "*le*"],
        ["nosotros", "*ci*", "*ci*"],
        ["ustedes", "*vi*", "*vi*"],
        ["ellos / los", "*li*", "*gli*"],
        ["ellas / las", "*le*", "*gli*"],
      ],
    },
    {
      kind: "p",
      text: "*Compro la giacca* → **la** compro. · *Vedo Marco* → **lo** vedo. · *Telefono a Anna* → **le** telefono. · *Do il libro a lui* → **gli** do il libro.",
    },
    {
      kind: "p",
      text: "**Con infinitivo** el pronombre puede ir al final pegado (*Voglio vederlo*) o antes del verbo conjugado (*Lo voglio vedere*). **Con passato prossimo**, *lo / la / li / le* hacen concordar el participio: *Ho comprato la giacca → L'ho comprata.* · *Ho visto i ragazzi → Li ho visti.*",
    },
    {
      kind: "p",
      text: "Cuando se juntan dos (a él + lo), *gli* + *lo* se funden en **glielo**: *Glielo do* (se lo doy). Por ahora alcanza con reconocerlo.",
    },
  ],
  transfer:
    "Cuidado con *le*: en español *le* es para él y para ella, pero en italiano *gli* es a él y *le* es a ella. El plural masculino directo es *li* (no *los*). Y algo que el español no hace: con *l'ho comprata* el participio concuerda con lo que reemplaza el pronombre.",
  examples: [
    { it: "La giacca è bella: la compro.", es: "La chaqueta es bonita: la compro." },
    { it: "Hai visto Marco? Sì, l'ho visto ieri.", es: "¿Viste a Marco? Sí, lo vi ayer." },
    { it: "Telefono ad Anna: le chiedo l'indirizzo.", es: "Llamo a Anna: le pido la dirección." },
    { it: "Ho comprato le scarpe e le porto subito.", es: "Compré los zapatos y los llevo ya." },
    { it: "Vorrei restituirlo: è troppo piccolo.", es: "Quisiera devolverlo: es demasiado chico." },
    { it: "Il libro? Glielo do domani.", es: "¿El libro? Se lo doy mañana." },
  ],
  notice: [
    {
      type: "choice",
      prompt: "«Gli telefono domani.» ¿A quién llama?",
      options: ["A él (o a ellos)", "A ella", "A vos"],
      answer: 0,
      why: "*Gli* es el indirecto masculino; para ella sería *le*.",
    },
    {
      type: "choice",
      prompt: "«L'ho comprata ieri.» ¿Qué compró?",
      options: ["Un objeto femenino (la giacca)", "Un objeto masculino (il libro)", "Varios objetos femeninos"],
      answer: 0,
      why: "*Comprata* (*-a*) concuerda con algo femenino singular.",
    },
    {
      type: "choice",
      prompt: "«Li ho visti al mercato.» ¿Qué vio?",
      options: ["A él", "A ellos (varios)", "A ella"],
      answer: 1,
      why: "*Li* + *visti* (*-i*): varios masculinos o mixtos.",
    },
  ],
  exercises: [
    { type: "fill", prompt: "La giacca è bella: ___ compro. (pronombre directo)", answers: ["la"], why: "Reemplaza *la giacca*: *la*." },
    { type: "fill", prompt: "Vedo Marco: ___ vedo ogni giorno. (a él)", answers: ["lo"], why: "Objeto directo masculino: *lo*." },
    { type: "fill", prompt: "Anna? ___ telefono stasera. (a ella)", answers: ["le"], why: "Indirecto femenino: *le*." },
    { type: "fill", prompt: "Paolo? ___ do il libro. (a él)", answers: ["gli"], why: "Indirecto masculino: *gli*." },
    { type: "fill", prompt: "Le scarpe? ___ porto domani. (las)", answers: ["le"], why: "Directo femenino plural: *le*." },
    { type: "fill", prompt: "Ho comprato la giacca: l'ho ___. (comprare)", answers: ["comprata"], why: "El participio concuerda con *la giacca*: *comprata*." },
    { type: "fill", prompt: "Ho visto i ragazzi: ___ ho visti.", answers: ["li"], why: "Directo masculino plural: *li*." },
    {
      type: "choice",
      prompt: "«Quiero verlo» (a él)",
      options: ["Voglio vederlo", "Voglio vederli", "Voglio vederla"],
      answer: 0,
      why: "Infinitivo + *lo* pegado: *vederlo*.",
    },
    {
      type: "choice",
      prompt: "«Les pido la cuenta (a ellos)»",
      options: ["Le chiedo il conto", "Gli chiedo il conto", "Li chiedo il conto"],
      answer: 1,
      why: "Indirecto para ellos: *gli*.",
    },
    {
      type: "choice",
      prompt: "«Se lo doy mañana» (el libro, a él)",
      options: ["Gli lo do domani", "Glielo do domani", "Lo gli do domani"],
      answer: 1,
      why: "*Gli* + *lo* = *glielo*.",
    },
  ],
};
