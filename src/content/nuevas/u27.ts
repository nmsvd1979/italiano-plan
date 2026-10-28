// Unidad nueva u27 (G1): tiempo libre, gustos y clima. Se conecta sola a los registros porque está en NUEVAS (index.ts).
// Evidencia de cada frase: docs/v2/revision-fuentes.md (G1-u27).
import type { Lesson } from "../grammar/types";
import type { Dialogue } from "../dialogues";
import type { DictationItem } from "../dictation";
import type { VocabItem } from "../vocab";
import type { WritingTask } from "../writing";
import type { PronUnit } from "../pronunciation";

const lesson: Lesson = {
  unit: "u27",
  title: "Tiempo libre, saber y conocer, clima e indefinidos",
  situation: "Charlas con alguien en Italia: qué haces en tu tiempo libre, qué sabes hacer, qué tiempo hace",
  rule: [
    {
      kind: "p",
      text: "**Tiempo libre.** *Che cosa ti piace fare nel tempo libero?* → *Nel mio tempo libero, mi piace guardare film italiani.* · *Nel tempo libero leggo molto.* Cada actividad pide su verbo: *giocare a* + deporte (*gioco a calcio*), *fare* + actividad (*faccio sport, faccio escursioni*), *suonare* + instrumento (*suono la chitarra*).",
    },
    {
      kind: "table",
      head: ["", "sapere", "conoscere"],
      rows: [
        ["io", "*so*", "*conosco*"],
        ["tu", "*sai*", "*conosci*"],
        ["lui / lei / Lei", "*sa*", "*conosce*"],
        ["noi", "*sappiamo*", "*conosciamo*"],
        ["voi", "*sapete*", "*conoscete*"],
        ["loro", "*sanno*", "*conoscono*"],
      ],
    },
    {
      kind: "p",
      text: "**Sapere** va con *che, se, dove* o con un infinitivo («saber hacer algo»): *Scusi, sa dov'è la stazione?* · *So cucinare.* **Conoscere** va con una persona o un lugar: *Conosci già i miei fratelli?* · *Conosco bene Milano.* Como en español (*saber / conocer*), pero cuidado con *Non lo so* («no lo sé»).",
    },
    {
      kind: "p",
      text: "**El tiempo.** *Che tempo fa?* → *Fa caldo. Fa freddo. Fa fresco. Fa bello. Fa brutto.* Con verbos: *Piove. Nevica.* Con *c'è*: *C'è il sole. C'è nebbia. C'è vento.* Y con *essere*: *È nuvoloso.* Las estaciones: *la primavera, l'estate, l'autunno, l'inverno*.",
    },
    {
      kind: "table",
      head: ["Indefinido", "Cómo se usa", "Ejemplo"],
      rows: [
        ["*ogni*", "no cambia; siempre con un sustantivo singular", "*ogni giorno*"],
        ["*qualche*", "no cambia; sustantivo singular con sentido plural", "*qualche volta*"],
        ["*alcuni / alcune*", "plural; con sustantivo plural", "*alcuni libri*"],
        ["*tutto / tutta / tutti / tutte*", "concuerda; con artículo", "*tutti i giorni*"],
        ["*altro / altra / altri / altre*", "concuerda con el sustantivo", "*un altro caffè*"],
      ],
    },
  ],
  transfer:
    "Ojo, en español: (1) *suonare* es «tocar» un instrumento; no uses *toccare*, que es «tocar» con la mano. (2) *Fa caldo* es «hace calor» (el ambiente); *ho caldo* es «tengo calor» (tú): no mezcles *fa* y *ho*. (3) *Qualche* lleva el sustantivo en **singular** aunque signifique «algunos»: *qualche volta*, no *qualche volte*. (4) *Ogni* es «cada» y también va en singular: *ogni giorno*. (5) *Tutti i giorni* lleva artículo, igual que «todos los días».",
  examples: [
    { it: "Che cosa ti piace fare nel tempo libero?", es: "¿Qué te gusta hacer en tu tiempo libre?" },
    { it: "Nel mio tempo libero, mi piace guardare film italiani.", es: "En mi tiempo libre me gusta ver películas italianas." },
    { it: "Mi piace molto giocare a calcio.", es: "Me gusta mucho jugar al fútbol." },
    { it: "Scusi, sa dov'è la stazione?", es: "Disculpe, ¿sabe dónde está la estación?" },
    { it: "Conosco bene Milano.", es: "Conozco bien Milán." },
    { it: "Che tempo fa oggi? — Fa freddo e piove.", es: "¿Qué tiempo hace hoy? — Hace frío y llueve." },
    { it: "C'è il sole, ma fa fresco.", es: "Hay sol, pero hace fresco." },
    { it: "Tutti i giorni vado in palestra.", es: "Todos los días voy al gimnasio." },
  ],
  notice: [
    {
      type: "choice",
      prompt: "«Sa dov'è la stazione?» ¿Qué pregunta?",
      options: ["Si alguien sabe dónde está la estación", "Si alguien conoce a alguien de la estación", "Si la estación está abierta"],
      answer: 1,
      why: "*Sapere* + *dove* = saber dónde está algo.",
    },
    {
      type: "choice",
      prompt: "«Ho caldo» y «Fa caldo»: ¿cuál habla del ambiente?",
      options: ["Ho caldo", "Fa caldo", "Las dos"],
      answer: 1,
      why: "*Fa caldo* = hace calor (el tiempo). *Ho caldo* = yo tengo calor.",
    },
    {
      type: "choice",
      prompt: "«Qualche volta vado al cinema.» ¿Qué significa?",
      options: ["Nunca voy al cine", "Algunas veces voy al cine", "Voy al cine cada día"],
      answer: 1,
      why: "*Qualche volta* = algunas veces, a veces.",
    },
  ],
  exercises: [
    { type: "fill", prompt: "Mi piace ___ a calcio. (jugar)", answers: ["giocare"], why: "*Giocare a* + deporte: *giocare a calcio*." },
    { type: "fill", prompt: "Nel tempo libero ___ molto. (yo leo)", answers: ["leggo"], why: "*Nel tempo libero leggo molto.*" },
    { type: "fill", prompt: "___ sport tre volte alla settimana. (yo hago)", answers: ["Faccio"], why: "*Faccio sport*: *fare* + actividad." },
    { type: "fill", prompt: "Io ___ cucinare. (sé, con infinitivo)", answers: ["so"], why: "*Sapere* + infinitivo: *So cucinare.*" },
    { type: "fill", prompt: "___ già i miei fratelli? (tú, ¿conoces…?)", answers: ["Conosci"], why: "*Conoscere* va con personas: *Conosci già i miei fratelli?*" },
    { type: "fill", prompt: "Scusi, ___ dov'è la stazione? (usted, sabe)", answers: ["sa"], why: "Con *Lei*, *sapere* se conjuga *sa*." },
    { type: "fill", prompt: "Noi non ___ la verità. (sabemos)", answers: ["sappiamo"], why: "*Sappiamo* es la forma de *noi* de *sapere*." },
    { type: "fill", prompt: "Che ___ fa oggi? (clima)", answers: ["tempo"], why: "*Che tempo fa?* = ¿qué tiempo hace?" },
    { type: "fill", prompt: "In inverno ___ freddo. (hace)", answers: ["fa"], why: "El clima se dice con *fare*: *fa freddo*." },
    { type: "fill", prompt: "Oggi ___ e prendo l'ombrello. (llueve)", answers: ["piove"], why: "*Piove* = llueve." },
    { type: "choice", prompt: "Quieres decir que hay niebla:", options: ["C'è nebbia.", "Fa nebbia.", "È nebbia."], answer: 0, why: "La niebla se dice con *c'è*: *c'è nebbia*." },
    { type: "fill", prompt: "Tutti ___ giorni vado in palestra. (artículo plural)", answers: ["i"], why: "*Tutti i giorni* lleva artículo." },
    { type: "fill", prompt: "Ho ___ domanda. (alguna, en singular)", answers: ["qualche"], why: "*Qualche* + sustantivo singular; *alcune domande* sería con plural." },
    { type: "fill", prompt: "Vuoi ___ caffè? (otro)", answers: ["un altro"], why: "*Un altro caffè* = otro café." },
    { type: "choice", prompt: "Quieres decir que tocas la guitarra:", options: ["Suono la chitarra.", "Tocco la chitarra.", "Gioco la chitarra."], answer: 0, why: "*Suonare* se usa con instrumentos." },
    { type: "choice", prompt: "Quieres decir «Conozco bien Milán»:", options: ["Conosco bene Milano.", "So bene Milano.", "Sono bene Milano."], answer: 0, why: "*Conoscere* va con lugares y personas." },
    { type: "choice", prompt: "Preguntas qué tiempo hace:", options: ["Che tempo fa?", "Che tempo è?", "Come tempo fa?"], answer: 0, why: "La pregunta fija es *Che tempo fa?*" },
    { type: "choice", prompt: "«Cada día» en italiano:", options: ["ogni giorno", "ogni giorni", "tutto giorno"], answer: 0, why: "*Ogni* no cambia y va con un sustantivo singular." },
    { type: "choice", prompt: "«Algunos libros»:", options: ["alcuni libri", "qualche libri", "ogni libri"], answer: 0, why: "*Alcuni* lleva plural; *qualche* lleva singular (*qualche libro*)." },
  ],
};

const vocab: VocabItem[] = [
  { it: "il tempo libero", es: "el tiempo libre" },
  { it: "la primavera", es: "la primavera" },
  { it: "l'autunno", es: "el otoño" },
  { it: "il sole", es: "el sol" },
  { it: "la pioggia", es: "la lluvia" },
  { it: "la neve", es: "la nieve" },
  { it: "il vento", es: "el viento" },
  { it: "caldo", es: "caliente / calor" },
  { it: "freddo", es: "frío" },
  { it: "nuvoloso", es: "nublado" },
  { it: "suonare", es: "tocar (un instrumento)" },
  { it: "il calcio", es: "el fútbol" },
  { it: "lo sport", es: "el deporte" },
  { it: "la musica", es: "la música" },
  { it: "il film", es: "la película" },
  { it: "camminare", es: "caminar" },
  { it: "ballare", es: "bailar" },
  { it: "cantare", es: "cantar" },
  { it: "nuotare", es: "nadar" },
  { it: "correre", es: "correr" },
  { it: "ogni", es: "cada" },
  { it: "qualche", es: "algún / algunos" },
];

const dictation: DictationItem[] = [
  { it: "Che cosa ti piace fare nel tempo libero?", es: "¿Qué te gusta hacer en tu tiempo libre?" },
  { it: "Nel tempo libero leggo molto.", es: "En mi tiempo libre leo mucho." },
  { it: "Mi piace molto giocare a calcio.", es: "Me gusta mucho jugar al fútbol." },
  { it: "Scusi, sa dov'è la stazione?", es: "Disculpe, ¿sabe dónde está la estación?" },
  { it: "Conosco bene Milano.", es: "Conozco bien Milán." },
  { it: "Che tempo fa oggi?", es: "¿Qué tiempo hace hoy?" },
  { it: "Oggi fa freddo e piove.", es: "Hoy hace frío y llueve." },
  { it: "C'è il sole, ma fa fresco.", es: "Hay sol, pero hace fresco." },
  { it: "Tutti i giorni vado in palestra.", es: "Todos los días voy al gimnasio." },
  { it: "Suono la chitarra ogni sera.", es: "Toco la guitarra cada noche." },
];

const dialogue: Dialogue = {
  roles: { A: "Compañero de curso", B: "Tú" },
  you: "B",
  setting: "Un fin de semana largo: hablas con un compañero de curso sobre qué hacer.",
  lines: [
    { who: "A", it: "Che cosa ti piace fare nel tempo libero?", es: "¿Qué te gusta hacer en tu tiempo libre?" },
    { who: "B", it: "Mi piace molto giocare a calcio. E tu?", es: "Me gusta mucho jugar al fútbol. ¿Y tú?" },
    { who: "A", it: "Io suono la chitarra ogni sera. Sai suonare?", es: "Yo toco la guitarra cada noche. ¿Sabes tocar?" },
    { who: "B", it: "No, ma so cantare un po'. Conosci questa canzone?", es: "No, pero sé cantar un poco. ¿Conoces esta canción?" },
    { who: "A", it: "Sì, la conosco! Che tempo fa domani?", es: "¡Sí, la conozco! ¿Qué tiempo hace mañana?" },
    { who: "B", it: "Domani fa freddo e piove.", es: "Mañana hace frío y llueve." },
    { who: "A", it: "Allora restiamo a casa. Un altro caffè?", es: "Entonces nos quedamos en casa. ¿Otro café?" },
    { who: "B", it: "Sì, grazie! Qualche volta il maltempo è bello.", es: "¡Sí, gracias! A veces el mal tiempo es bonito." },
  ],
};

const writing: WritingTask = {
  prompt: "Escríbele un mensaje a un amigo italiano: cuéntale qué haces en tu tiempo libre, qué sabes hacer y qué tiempo hace hoy donde estás.",
  model: "Ciao! Nel tempo libero leggo e gioco a calcio. So cucinare un po'. Oggi a Santiago c'è il sole, ma fa fresco.",
  checklist: [
    "Dije qué hago en mi tiempo libre con el verbo correcto (*gioco a…*, *faccio…*, *suono…*).",
    "Usé *so* + infinitivo para decir qué sé hacer.",
    "Describí el tiempo con *fa…*, *c'è…* o *piove / nevica*.",
    "Usé *ogni*, *qualche* o *tutti* con la forma correcta (singular o plural).",
  ],
  minChars: 70,
};

const pron: PronUnit = {
  unit: "u27",
  title: "La s sorda y la s sonora",
  tip: "Una **s** sola entre vocales suele sonar sonora, como una *z* de *zero* en inglés (*casa, rosa*). La **doble ss** es siempre sorda y más tensa (*cassa, rossa*). Escucha los pares: la diferencia de sonido cambia el significado.",
  pairs: [["casa", "cassa"], ["rosa", "rossa"], ["mese", "messe"]],
  words: ["casa", "cassa", "rosa", "rossa", "mese", "messe", "estate", "primavera", "autunno", "inverno"],
};

const gloss: Record<string, string> = {
  casa: "casa", cassa: "caja / cajero", rosa: "rosa", rossa: "roja", mese: "mes", messe: "misa / cosecha",
  estate: "verano", primavera: "primavera", autunno: "otoño", inverno: "invierno",
};

export const u27 = {
  id: "u27",
  title: "Tiempo libre, gustos y clima",
  canDo: [
    "Puedo contar qué hago en mi tiempo libre.",
    "Puedo hablar del clima y de las estaciones.",
  ],
  lesson,
  vocab,
  dictation,
  dialogue,
  writing,
  pron,
  gloss,
};
