import type { Lesson } from "./types";

export const semana05: Lesson = {
  week: 5,
  title: "Verbos reflexivos, rutina y stare + gerundio",
  situation: "Contar tu día",
  rule: [
    {
      kind: "p",
      text: "Los verbos reflexivos llevan un pronombre delante (*mi, ti, si, ci, vi, si*) y se usan mucho para la rutina. Se conjugan como cualquier verbo regular.",
    },
    {
      kind: "table",
      head: ["", "svegliarsi (despertarse)", "ejemplo"],
      rows: [
        ["io", "*mi* sveglio", "*Mi sveglio alle sette.*"],
        ["tu", "*ti* svegli", "*A che ora ti alzi?*"],
        ["lui/lei", "*si* sveglia", "*Si veste in fretta.*"],
        ["noi", "*ci* svegliamo", "*Ci vediamo dopo.*"],
        ["voi", "*vi* svegliate", "*Vi lavate le mani?*"],
        ["loro", "*si* svegliano", "*Si riposano.*"],
      ],
    },
    {
      kind: "p",
      text: "Para ordenar el día: *prima* (primero), *poi* (después), *dopo* (luego), *di solito* (generalmente), *alle sette* (a las siete), *la mattina / il pomeriggio / la sera*.",
    },
    {
      kind: "p",
      text: "**Stare + gerundio** dice lo que estás haciendo ahora. Gerundio: *-are → -ando* (*parlare → parlando*, *mangiare → mangiando*) y *-ere / -ire → -endo* (*prendere → prendendo*, *dormire → dormendo*). *Sto mangiando* = estoy comiendo.",
    },
    {
      kind: "table",
      head: ["Para…", "Verbo", "Ejemplo"],
      rows: [
        ["lugar, profesión, característica", "*essere*", "*Sono a casa.* · *Sono stanco.*"],
        ["salud o ánimo en el momento", "*stare*", "*Sto bene.* · *Come stai?*"],
        ["acción en curso", "*stare* + gerundio", "*Sto studiando.*"],
      ],
    },
  ],
  transfer:
    "*Stare* no es *estar*. En español *estar* cubre lugar, estado y acción; en italiano el lugar y las características van con *essere* (*Sono a Milano*, *Sono stanco*), y *stare* queda para el bienestar (*Sto bene*) y la acción en curso (*Sto mangiando*). El error típico es decir *Sto a Milano* o *Sto stanco*.",
  examples: [
    { it: "Di solito mi sveglio alle sette e mi alzo subito.", es: "Generalmente me despierto a las siete y me levanto enseguida." },
    { it: "Dopo cena mi lavo i denti e vado a letto.", es: "Después de la cena me lavo los dientes y me acuesto." },
    { it: "Che stai facendo? Sto cucinando.", es: "¿Qué estás haciendo? Estoy cocinando." },
    { it: "Sono stanco, ma sto bene.", es: "Estoy cansado, pero estoy bien." },
    { it: "A che ora vi alzate la domenica?", es: "¿A qué hora se levantan los domingos?" },
    { it: "Sto aspettando il treno.", es: "Estoy esperando el tren." },
  ],
  notice: [
    {
      type: "choice",
      prompt: "«Mi lavo le mani.» ¿Quién se lava las manos?",
      options: ["Yo mismo", "Yo se las lavo a otro", "Él se las lava"],
      answer: 0,
      why: "*Mi* + verbo reflexivo: la acción vuelve sobre quien habla.",
    },
    {
      type: "choice",
      prompt: "«Sto mangiando» y «Mangio»: ¿cuál dice que ocurre ahora mismo?",
      options: ["Sto mangiando", "Mangio", "Las dos igual"],
      answer: 0,
      why: "*Stare* + gerundio marca la acción en curso.",
    },
    {
      type: "choice",
      prompt: "«Si alzano presto.» ¿Quiénes se levantan temprano?",
      options: ["Una persona", "Varias personas", "Yo"],
      answer: 1,
      why: "*Si alzano* es de *loro*: el verbo termina en *-ano*.",
    },
  ],
  exercises: [
    { type: "fill", prompt: "Io ___ sveglio alle sette.", answers: ["mi"], why: "Con *io* el pronombre es *mi*." },
    { type: "fill", prompt: "Tu ___ alzi presto?", answers: ["ti"], why: "Con *tu*: *ti*." },
    { type: "fill", prompt: "Lei ___ veste in fretta.", answers: ["si"], why: "Con *lui/lei*: *si*." },
    { type: "fill", prompt: "Noi ___ vediamo domani.", answers: ["ci"], why: "Con *noi*: *ci*." },
    { type: "fill", prompt: "Sto ___ la cena. (cucinare)", answers: ["cucinando"], why: "-are → *-ando*: *cucinando*." },
    { type: "fill", prompt: "Stiamo ___ il caffè. (prendere)", answers: ["prendendo"], why: "-ere → *-endo*: *prendendo*." },
    { type: "fill", prompt: "Che cosa ___ facendo? (tu)", answers: ["stai"], why: "*Stare* con *tu*: *stai*." },
    {
      type: "choice",
      prompt: "«Estoy cansado»",
      options: ["Sto stanco", "Sono stanco", "Ho stanco"],
      answer: 1,
      why: "Las características y estados físicos van con *essere*.",
    },
    {
      type: "choice",
      prompt: "«Estoy en Milán»",
      options: ["Sto a Milano", "Sono a Milano", "Sono in Milano"],
      answer: 1,
      why: "El lugar va con *essere*. Con ciudades, *a*.",
    },
    {
      type: "choice",
      prompt: "«Estoy leyendo el menú»",
      options: ["Sono leggendo il menù", "Sto leggendo il menù", "Leggo stando il menù"],
      answer: 1,
      why: "*Stare* + gerundio: *sto leggendo*.",
    },
  ],
};
