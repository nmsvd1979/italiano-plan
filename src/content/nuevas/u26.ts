// Unidad nueva u26 (G1): personas y familia. Se conecta sola a los registros porque está en NUEVAS (index.ts).
// Evidencia de cada frase: docs/v2/revision-fuentes.md (G1-u26).
import type { Lesson } from "../grammar/types";
import type { Dialogue } from "../dialogues";
import type { DictationItem } from "../dictation";
import type { VocabItem } from "../vocab";
import type { WritingTask } from "../writing";
import type { PronUnit } from "../pronunciation";

const lesson: Lesson = {
  unit: "u26",
  title: "Familia, describir personas y decir a qué te dedicas",
  situation: "Conoces a alguien en Italia y hablan de su familia, de cómo es una persona y de su trabajo",
  rule: [
    {
      kind: "table",
      head: ["Familia", "Italiano"],
      rows: [
        ["padres", "*il padre* (*il papà*) · *la madre* (*la mamma*) · *i genitori*"],
        ["hermanos", "*il fratello* · *la sorella* · *i fratelli*"],
        ["hijos", "*il figlio* · *la figlia* · *i figli*"],
        ["abuelos, tíos, primos", "*il nonno* · *la nonna* · *lo zio* · *la zia* · *il cugino* · *la cugina*"],
        ["pareja", "*il marito* · *la moglie*"],
      ],
    },
    {
      kind: "p",
      text: "Igual que en español, el plural masculino sirve para un grupo mixto: *i fratelli* son «los hermanos» o «los hermanos y hermanas»; *i figli*, «los hijos»; *gli zii*, «los tíos». Con un familiar en singular no hay artículo (*mia madre, mio fratello*), y en plural sí (*i miei genitori*), como viste en la unidad 6.",
    },
    {
      kind: "p",
      text: "**Hablar de tu familia.** *Hai fratelli o sorelle?* → *Ho due fratelli.* · *Ho una sorella maggiore e un fratello minore.* · *Sono figlio unico* (hombre) / *Sono figlia unica* (mujer). Con una persona mayor o a quien tratas de *Lei*: *Ha fratelli o sorelle?*",
    },
    {
      kind: "p",
      text: "**Describir a una persona.** Con *essere*: *Lui è molto alto. Lei è piuttosto bassa.* El adjetivo concuerda (*alto, alta, alti, alte*). Para el pelo y los ojos se usa *avere* con el sustantivo en **plural**: *Ha i capelli biondi e lunghi. Ha gli occhi marroni.* Colores del pelo: *biondi, castani, neri, rossi, grigi, bianchi*; de los ojos: *azzurri, verdi, marroni, neri*. Carácter: *simpatico, gentile, intelligente*.",
    },
    {
      kind: "p",
      text: "**El trabajo.** *Che lavoro fai?* Puedes responder con *essere*: *Sono uno studente. Sono un insegnante.* O con *fare* + artículo: *Faccio l'architetto. Faccio il musicista.* Con la tercera persona: *Mia madre fa l'insegnante.*",
    },
    {
      kind: "table",
      head: ["País", "Nacionalidad (m. / f.)"],
      rows: [
        ["il Cile", "*cileno* / *cilena*"],
        ["l'Argentina · il Perù · il Messico", "*argentino/a* · *peruviano/a* · *messicano/a*"],
        ["la Spagna · la Colombia · il Brasile", "*spagnolo/a* · *colombiano/a* · *brasiliano/a*"],
        ["la Francia · la Germania · l'Italia", "*francese* · *tedesco/a* · *italiano/a*"],
      ],
    },
    {
      kind: "p",
      text: "Los que terminan en *-o* cambian a *-a* en femenino (*cileno → cilena*); los que terminan en *-e* son iguales para los dos (*francese*). Para decir de dónde eres: *Di dove sei? — Sono cileno / Sono cilena* o, como en la unidad 25, *Sono di Santiago.*",
    },
  ],
  transfer:
    "Ojo, en español: (1) el pelo se dice en singular (*tiene el pelo largo*), pero en italiano *i capelli* va en **plural**: *ha i capelli lunghi*. (2) *Nipote* es a la vez «sobrino/a» y «nieto/a»: el contexto decide. (3) *Ragazzo / ragazza* puede ser «chico/a» o «novio/a». (4) Las nacionalidades se escriben con **minúscula**: *sono cileno*, no *Cileno*. (5) Para el trabajo suena natural *Faccio il…* (no *Sono il…*) con el artículo determinado.",
  examples: [
    { it: "Ho due fratelli e una sorella.", es: "Tengo dos hermanos y una hermana." },
    { it: "Hai fratelli o sorelle? — Sono figlio unico.", es: "¿Tienes hermanos o hermanas? — Soy hijo único." },
    { it: "Ho una sorella maggiore e un fratello minore.", es: "Tengo una hermana mayor y un hermano menor." },
    { it: "Mia madre fa l'insegnante e mio padre è un medico.", es: "Mi madre es profesora y mi padre es médico." },
    { it: "Che lavoro fai? — Faccio l'architetto.", es: "¿A qué te dedicas? — Soy arquitecto." },
    { it: "Lui è molto alto, lei è piuttosto bassa.", es: "Él es muy alto, ella es bastante baja." },
    { it: "Lei ha i capelli biondi e lunghi.", es: "Ella tiene el pelo rubio y largo." },
    { it: "Di dove sei? — Sono cileno.", es: "¿De dónde eres? — Soy chileno." },
  ],
  notice: [
    {
      type: "choice",
      prompt: "«Ha i capelli neri e ricci.» ¿Qué se describe?",
      options: ["El pelo", "Los ojos", "La ropa"],
      answer: 0,
      why: "*I capelli* es el pelo (siempre en plural en italiano). Los ojos serían *gli occhi*.",
    },
    {
      type: "choice",
      prompt: "«Ho due nipoti.» ¿Qué puede significar *nipoti*?",
      options: ["Sobrinos o nietos", "Primos o tíos", "Cuñados o suegros"],
      answer: 0,
      why: "*Nipote* sirve para «sobrino/a» y para «nieto/a»; el contexto decide.",
    },
    {
      type: "choice",
      prompt: "«Sono figlia unica.» ¿Quién habla?",
      options: ["Una mujer sin hermanos", "Un hombre sin hermanos", "Una mujer con una hermana"],
      answer: 0,
      why: "*Figlia* es femenino y *unica* significa que no hay más hijos: es hija única.",
    },
  ],
  exercises: [
    { type: "fill", prompt: "___ due fratelli. (tengo)", answers: ["Ho"], why: "*Ho due fratelli* = tengo dos hermanos (*avere*)." },
    { type: "fill", prompt: "Hai ___ o sorelle? (hermanos)", answers: ["fratelli"], why: "*Fratelli* es el plural de *fratello*." },
    { type: "fill", prompt: "Mio ___ è il fratello di mia madre. (tío)", answers: ["zio"], why: "*Lo zio* es el hermano de la madre o del padre." },
    { type: "fill", prompt: "Mia ___ è la madre di mia madre. (abuela)", answers: ["nonna"], why: "*La nonna* = la abuela." },
    { type: "fill", prompt: "Ho una sorella maggiore e un ___ minore. (hermano)", answers: ["fratello"], why: "*Fratello* es hermano; *minore*, menor." },
    { type: "fill", prompt: "Sono ___ unico. (hijo, soy hombre)", answers: ["figlio"], why: "Un hombre dice *figlio unico*; una mujer, *figlia unica*." },
    { type: "fill", prompt: "Lei ha i ___ biondi. (pelo)", answers: ["capelli"], why: "*I capelli* = el pelo, en plural." },
    { type: "fill", prompt: "Lui ha gli ___ verdi. (de los ojos)", answers: ["occhi"], why: "*Gli occhi* = los ojos." },
    { type: "fill", prompt: "Marco è molto ___, ma Anna è bassa. (de gran estatura)", answers: ["alto"], why: "*Alto* = alto; es el contrario de *basso*." },
    { type: "fill", prompt: "Che ___ fai? (¿a qué te dedicas?)", answers: ["lavoro"], why: "*Che lavoro fai?* = ¿a qué te dedicas?" },
    { type: "fill", prompt: "___ l'architetto. (yo, con *fare*)", answers: ["Faccio"], why: "*Faccio l'architetto* = soy arquitecto; *fare* + artículo." },
    { type: "fill", prompt: "Mia madre ___ l'insegnante. (ella, con *fare*)", answers: ["fa"], why: "Tercera persona de *fare*: *fa*." },
    { type: "fill", prompt: "Sono ___. (soy chileno)", answers: ["cileno"], why: "Nacionalidad en minúscula: *sono cileno*." },
    { type: "fill", prompt: "Maria viene da Buenos Aires: è ___. (nacionalidad, mujer)", answers: ["argentina"], why: "Femenino de *argentino*: *argentina*." },
    { type: "fill", prompt: "Pierre è ___. (de Francia)", answers: ["francese"], why: "*Francese* termina en *-e* y no cambia." },
    { type: "choice", prompt: "«Mis padres» en italiano:", options: ["i miei genitori", "i miei parenti", "le mie genitori"], answer: 0, why: "*I genitori* son los padres; *i parenti* son los parientes." },
    { type: "choice", prompt: "Eres mujer y quieres decir que no tienes hermanos:", options: ["Sono figlia unica.", "Sono figlio unico.", "Sono una figlia sola."], answer: 0, why: "Para una mujer: *figlia unica*." },
    { type: "choice", prompt: "Preguntas a un señor mayor si tiene hermanos:", options: ["Ha fratelli o sorelle?", "Hai fratelli o sorelle?", "Ho fratelli o sorelle?"], answer: 0, why: "Con *Lei*: *Ha…?*. *Hai* es para amigos." },
    { type: "choice", prompt: "«Tiene el pelo rubio y largo»:", options: ["Ha i capelli biondi e lunghi.", "Ha il capello biondo e lungo.", "È capelli biondi e lunghi."], answer: 0, why: "*I capelli* va en plural y con *avere*." },
  ],
};

const vocab: VocabItem[] = [
  { it: "la famiglia", es: "la familia" },
  { it: "il padre", es: "el padre" },
  { it: "la madre", es: "la madre" },
  { it: "i genitori", es: "los padres" },
  { it: "il fratello", es: "el hermano" },
  { it: "la sorella", es: "la hermana" },
  { it: "il figlio", es: "el hijo" },
  { it: "la figlia", es: "la hija" },
  { it: "il nonno", es: "el abuelo" },
  { it: "la nonna", es: "la abuela" },
  { it: "lo zio", es: "el tío" },
  { it: "la zia", es: "la tía" },
  { it: "il cugino", es: "el primo" },
  { it: "il marito", es: "el marido" },
  { it: "la moglie", es: "la esposa" },
  { it: "alto", es: "alto" },
  { it: "basso", es: "bajo" },
  { it: "simpatico", es: "simpático" },
  { it: "i capelli", es: "el pelo" },
  { it: "gli occhi", es: "los ojos" },
  { it: "il lavoro", es: "el trabajo" },
  { it: "l'insegnante", es: "el profesor / la profesora" },
];

const dictation: DictationItem[] = [
  { it: "Ho due fratelli e una sorella.", es: "Tengo dos hermanos y una hermana." },
  { it: "Hai fratelli o sorelle?", es: "¿Tienes hermanos o hermanas?" },
  { it: "Sono figlio unico.", es: "Soy hijo único." },
  { it: "Ho una sorella maggiore e un fratello minore.", es: "Tengo una hermana mayor y un hermano menor." },
  { it: "Mia madre fa l'insegnante.", es: "Mi madre es profesora." },
  { it: "Che lavoro fai?", es: "¿A qué te dedicas?" },
  { it: "Faccio l'architetto.", es: "Soy arquitecto." },
  { it: "Lei ha i capelli biondi e lunghi.", es: "Ella tiene el pelo rubio y largo." },
  { it: "Lui è molto alto.", es: "Él es muy alto." },
  { it: "Sono cileno, di Santiago.", es: "Soy chileno, de Santiago." },
];

const dialogue: Dialogue = {
  roles: { A: "Compañera de curso", B: "Tú" },
  you: "B",
  setting: "En el descanso del curso de italiano, hablas con una compañera sobre la familia.",
  lines: [
    { who: "A", it: "Hai fratelli o sorelle?", es: "¿Tienes hermanos o hermanas?" },
    { who: "B", it: "Sì, ho una sorella maggiore e un fratello minore. E tu?", es: "Sí, tengo una hermana mayor y un hermano menor. ¿Y tú?" },
    { who: "A", it: "Io sono figlia unica. Che lavoro fa tua sorella?", es: "Yo soy hija única. ¿A qué se dedica tu hermana?" },
    { who: "B", it: "Mia sorella fa l'insegnante. Mio fratello è ancora uno studente.", es: "Mi hermana es profesora. Mi hermano todavía es estudiante." },
    { who: "A", it: "E i tuoi genitori?", es: "¿Y tus padres?" },
    { who: "B", it: "Mio padre è un medico e mia madre fa l'architetto.", es: "Mi padre es médico y mi madre es arquitecta." },
    { who: "A", it: "Tua sorella è alta?", es: "¿Tu hermana es alta?" },
    { who: "B", it: "Sì, è molto alta e ha i capelli biondi e lunghi.", es: "Sí, es muy alta y tiene el pelo rubio y largo." },
    { who: "A", it: "Io ho i capelli castani e gli occhi verdi.", es: "Yo tengo el pelo castaño y los ojos verdes." },
    { who: "B", it: "Che bello! Allora ci vediamo domani, ciao!", es: "¡Qué bonito! Entonces nos vemos mañana, ¡chao!" },
  ],
};

const writing: WritingTask = {
  prompt: "Preséntale tu familia a un compañero italiano en un mensaje corto: cuántos hermanos tienes, a qué se dedica alguien de tu familia y cómo es una persona (altura, pelo u ojos).",
  model: "Ciao! Ho una sorella e un fratello. Mia madre fa l'insegnante e mio padre è un medico. Mia sorella è alta e ha i capelli castani.",
  checklist: [
    "Dije cuántos hermanos tengo con *Ho…* (o *Sono figlio/a unico/a*).",
    "Dije a qué se dedica alguien con *fa l'…* o *è un…*.",
    "Describí a una persona con *è* (altura) y *ha i capelli…* (pelo) en plural.",
    "Escribí las nacionalidades, si las usé, con minúscula.",
  ],
  minChars: 70,
};

const pron: PronUnit = {
  unit: "u26",
  title: "El sonido gli en famiglia y figlio",
  tip: "El grupo **gli** suena como una *l* palatal: la lengua se apoya plana contra el paladar, como una *l* y una *y* pegadas. No se dice «li-gli»: en *fa-MI-glia* y *fi-glio* la *g* no suena aparte. Escucha los pares y fíjate en la diferencia con la *l* sola: *filo* ≠ *figlio*.",
  pairs: [["figlio", "filo"], ["moglie", "molle"], ["paglia", "pala"]],
  words: ["famiglia", "figlia", "figli", "nonno", "zio", "cugino", "fratello", "sorella"],
};

const gloss: Record<string, string> = {
  figlio: "hijo", filo: "hilo", moglie: "esposa", molle: "blando / mojado", paglia: "paja", pala: "pala",
  famiglia: "familia", figlia: "hija", figli: "hijos", nonno: "abuelo", zio: "tío", cugino: "primo", fratello: "hermano", sorella: "hermana",
};

export const u26 = {
  id: "u26",
  title: "Personas y familia",
  canDo: [
    "Puedo hablar de mi familia y describir a una persona.",
    "Puedo decir a qué me dedico y de qué país soy.",
  ],
  lesson,
  vocab,
  dictation,
  dialogue,
  writing,
  pron,
  gloss,
};
