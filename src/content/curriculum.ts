import { getDialogue } from "./dialogues";
import { getDictation } from "./dictation";
import { getVocab } from "./vocab";
import { getWriting } from "./writing";
import {
  Activity, DIALOGUE, DICTATION, LESSON, MIXED_REVIEW, PHASE_TEST, PRACTICE, VOCAB, WRITING,
  input, pron, quizlet, shadowing,
} from "./plan";

// El plan avanza por progreso, no por calendario: una unidad = un tema con 6 sesiones.
// El orden de abajo es el orden en que se estudia. Una unidad "ready: false" figura en el Plan
// como "pronto" y el flujo diario la salta hasta que tenga contenido.

export interface Phase {
  id: number;
  title: string;
  /** Meta de la fase, en términos de lo que puedes hacer. */
  goal: string;
}

export const PHASES: Phase[] = [
  { id: 1, title: "Primer contacto", goal: "Presentarte, entender números y hora, y pedir lo básico (A1 inicial)." },
  { id: 2, title: "Moverte y pedir", goal: "Desenvolverte por la ciudad, describir cosas y hacer preguntas simples (A1)." },
  { id: 3, title: "Contar el pasado", goal: "Contar qué hiciste y cómo eran las cosas, y comparar (A1 firme / A2 inicial)." },
  { id: 4, title: "Hablar de personas y planes", goal: "Hablar de otras personas, hacer planes y manejar una consulta de salud (A2 inicial)." },
  { id: 5, title: "Vivir allá", goal: "Resolver casa, trámites, teléfono y mensajes (A2)." },
  { id: 6, title: "Hacia B1", goal: "Expresar opiniones e hipótesis y contar una experiencia completa (A2 sólido)." },
];

/**
 * Qué ítems de la unidad van a una de sus dos semanas (A o B): índices dentro de cada lista del contenido.
 * Lo que no se asigna a una parte se asigna a ambas como repaso (docs/v2/13 §4), así que `{}` significa
 * "todo en las dos". Los índices los asigna el carril de contenido (G2); aquí solo se fija la forma.
 */
export type UnitPartItems = Partial<Record<"examples" | "notice" | "exercises" | "vocab" | "dictation", number[]>>;
export type UnitParts = { A: UnitPartItems; B: UnitPartItems };

export interface UnitMeta {
  /** "u04": estable aunque se agreguen unidades. */
  id: string;
  n: number;
  title: string;
  phase: number;
  /** "Puedo…" que deberías lograr al terminar la unidad. */
  canDo: string[];
  /** true cuando la unidad ya tiene todo su contenido escrito. */
  ready: boolean;
  /** Unidades 4, 8, 12, 16, 20 y 24: su última sesión incluye el test de fase. */
  checkpoint: boolean;
  /** Contenido opcional ya escrito para esta unidad (las actividades sin contenido se omiten). */
  has: { vocab: boolean; writing: boolean; dictation: boolean; dialogue: boolean };
  /** Solo en las unidades que el curso reparte en semana A y B (u02, u03, u05, u06, u07, u14, u15). */
  parts?: UnitParts;
}

/** Las unidades partidas en dos semanas (docs/v2/13 §1.2). Los ítems de cada parte los asigna el carril G2. */
const SPLIT_UNITS: ReadonlySet<number> = new Set([2, 3, 5, 6, 7, 14, 15]);

/**
 * `phase` solo se pasa en las unidades nuevas (u25–u28), que no siguen el reparto de a cuatro;
 * en las demás es la fase de siempre. `checkpoint` solo vale en u04…u24 (el test de fase actual).
 */
const u = (n: number, title: string, ready: boolean, canDo: string[], phase = Math.ceil(n / 4)): UnitMeta => {
  const id = `u${String(n).padStart(2, "0")}`;
  return {
    id,
    n,
    title,
    phase,
    canDo,
    ready,
    checkpoint: n <= 24 && n % 4 === 0,
    has: { vocab: !!getVocab(id), writing: !!getWriting(id), dictation: !!getDictation(id), dialogue: !!getDialogue(id) },
    ...(SPLIT_UNITS.has(n) ? { parts: { A: {}, B: {} } } : {}),
  };
};

export const UNITS: UnitMeta[] = [
  u(1, "Essere, tu y Lei, saludos", true, [
    "Puedo saludar y despedirme según la hora y la formalidad.",
    "Puedo presentarme y decir de dónde soy.",
    "Puedo elegir entre tu y Lei según con quién hablo.",
  ]),
  u(2, "Artículos, c'è / ci sono, avere y piacere", true, [
    "Puedo nombrar cosas con el artículo correcto.",
    "Puedo decir qué hay en un lugar y qué tengo.",
    "Puedo decir qué me gusta y qué no.",
  ]),
  u(3, "Números, hora, fechas y precios", true, [
    "Puedo entender y decir números hasta el cien.",
    "Puedo preguntar y decir la hora.",
    "Puedo entender un precio y decir una fecha.",
  ]),
  u(4, "Presente, volere / potere / dovere y vorrei", true, [
    "Puedo pedir en un bar o restaurante con cortesía.",
    "Puedo decir qué hago, qué quiero y qué puedo o debo hacer.",
    "Puedo pedir la cuenta y entender lo que me responden.",
  ]),
  u(5, "Moverte por la ciudad y falsos amigos", true, [
    "Puedo decir adónde voy y cómo, con la preposición correcta.",
    "Puedo evitar los falsos amigos más comunes.",
    "Puedo preguntar dónde está algo y entender «a destra», «a sinistra» y «dritto».",
  ]),
  u(6, "Posesivos, demostrativos, adjetivos y colores", true, [
    "Puedo decir de quién es algo y señalar lo que quiero.",
    "Puedo describir objetos y ropa con colores y tamaños.",
    "Puedo comprar algo simple en una tienda.",
  ]),
  u(7, "Reflexivos, rutina y stare + gerundio", true, [
    "Puedo contar mi rutina diaria.",
    "Puedo decir qué estoy haciendo ahora.",
    "Puedo distinguir essere de stare.",
  ]),
  u(8, "Preguntas, negación, frecuencia y cantidad", true, [
    "Puedo hacer preguntas con dove, quando, quanto, come y perché.",
    "Puedo negar y decir con qué frecuencia hago algo.",
    "Puedo decir cuánto o cuántos quiero.",
  ]),
  u(9, "Passato prossimo con avere", true, [
    "Puedo contar qué hice, con ya, todavía no y alguna vez.",
    "Puedo usar los participios irregulares más comunes.",
  ]),
  u(10, "Passato prossimo con essere", true, [
    "Puedo contar un viaje: adónde fui, cuándo llegué y cuándo volví.",
    "Puedo hacer concordar el participio con el sujeto.",
  ]),
  u(11, "Imperfetto y passato prossimo", true, [
    "Puedo describir cómo eran las cosas y qué hacía de costumbre.",
    "Puedo contar una historia mezclando fondo y hechos puntuales.",
  ]),
  u(12, "Comparativos, superlativos y partitivo", true, [
    "Puedo comparar precios, tamaños y lugares.",
    "Puedo decir que algo es el mejor o el más caro.",
    "Puedo pedir una cantidad indefinida (del pane, dei pomodori).",
  ]),
  u(13, "Pronombres directos e indirectos", true, [
    "Puedo evitar repetir objetos con lo, la, li, le.",
    "Puedo decir a quién le doy o le pido algo con gli y le.",
  ]),
  u(14, "Ci, ne e imperativo", true, [
    "Puedo pedir una cantidad con ne.",
    "Puedo dar y pedir indicaciones con el imperativo.",
  ]),
  u(15, "Futuro y condizionale", true, [
    "Puedo hablar de planes futuros.",
    "Puedo pedir favores con cortesía (potrebbe, vorrei).",
    "Puedo dar un consejo.",
  ]),
  u(16, "Salud y emergencias", true, [
    "Puedo explicar qué me duele y pedir ayuda médica.",
    "Puedo entender instrucciones de un médico o farmacéutico.",
    "Puedo pedir ayuda en una emergencia.",
  ]),
  u(17, "Casa, alquiler y trámites", true, [
    "Puedo preguntar por un alquiler y entender las condiciones.",
    "Puedo explicar un problema en la casa.",
    "Puedo entender y rellenar un trámite básico.",
  ]),
  u(18, "Teléfono, mensajes y mails", true, [
    "Puedo hacer y contestar una llamada simple.",
    "Puedo escribir un mensaje o mail informal y uno formal.",
  ]),
  u(19, "Impersonal, da + tiempo y stare per", true, [
    "Puedo decir cómo se hacen las cosas en general (si impersonale).",
    "Puedo decir desde cuándo hago algo.",
    "Puedo anunciar algo que está por pasar.",
  ]),
  u(20, "Discurso indirecto y conectores", true, [
    "Puedo contar lo que otra persona dijo.",
    "Puedo enlazar ideas con conectores en una conversación.",
  ]),
  u(21, "Pronombres combinados", true, [
    "Puedo usar glielo, me lo, te la en frases cotidianas.",
    "Puedo entender estos pronombres cuando los oigo.",
  ]),
  u(22, "Congiuntivo presente en uso", true, [
    "Puedo expresar una opinión con penso che / credo che.",
    "Puedo expresar un deseo o una duda.",
  ]),
  u(23, "Hipótesis: periodo ipotetico", true, [
    "Puedo hablar de posibilidades con se + presente.",
    "Puedo plantear una hipótesis con se + congiuntivo imperfetto.",
  ]),
  u(24, "Repaso general y proyecto final", true, [
    "Puedo contar una experiencia completa: presente, pasado y planes.",
    "Puedo resolver situaciones de viaje y de vida diaria con seguridad.",
  ]),
  // u25–u28: su contenido lo escribe el carril G1. Hasta entonces, "pronto" y fuera del flujo diario.
  // El orden de estudio está en COURSE (course.ts), no en este arreglo.
  u(25, "Alfabeto, deletreo y supervivencia", false, [
    "Puedo deletrear mi nombre y entender un deletreo.",
    "Puedo pedir que me repitan o me hablen más despacio.",
  ], 1),
  u(26, "Personas y familia", false, [
    "Puedo hablar de mi familia y describir a una persona.",
    "Puedo decir a qué me dedico y de qué país soy.",
  ], 2),
  u(27, "Tiempo libre, gustos y clima", false, [
    "Puedo contar qué hago en mi tiempo libre.",
    "Puedo hablar del clima y de las estaciones.",
  ], 2),
  u(28, "Comer fuera", false, [
    "Puedo entender un menú y pedir una comida completa.",
    "Puedo avisar de una alergia o preferencia y pedir la cuenta.",
  ], 3),
];

export const READY_UNITS = UNITS.filter((x) => x.ready);

export function getUnit(id: string): UnitMeta | undefined {
  return UNITS.find((x) => x.id === id);
}

export function getPhase(id: number): Phase {
  return PHASES.find((p) => p.id === id) ?? PHASES[PHASES.length - 1];
}

export interface Session {
  /** 1 a 6. */
  index: number;
  activities: Activity[];
}

/** Las seis sesiones de una unidad. Las actividades opcionales sin contenido se omiten. */
export function sessionsOf(unit: UnitMeta): Session[] {
  const keep = (a: Activity, has: boolean | undefined): Activity[] => (has ? [a] : []);
  const s6: Activity[] = [
    quizlet(15, "quizlet", "Repaso Quizlet"),
    shadowing(25),
    input(30, "longinput", "Input largo"),
    ...keep(DIALOGUE, unit.has.dialogue),
    unit.checkpoint ? PHASE_TEST : MIXED_REVIEW,
  ];
  return [
    { index: 1, activities: [quizlet(8), pron, input(10), shadowing(8)] },
    { index: 2, activities: [...keep(VOCAB, unit.has.vocab), LESSON, quizlet(8)] },
    { index: 3, activities: [quizlet(8), pron, input(10), shadowing(8)] },
    { index: 4, activities: [quizlet(8), PRACTICE, ...keep(WRITING, unit.has.writing)] },
    { index: 5, activities: [quizlet(8), input(12), ...keep(DICTATION, unit.has.dictation)] },
    { index: 6, activities: s6 },
  ];
}
