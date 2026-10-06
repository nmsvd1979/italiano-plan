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
  has: { vocab?: boolean; writing?: boolean; dictation?: boolean; dialogue?: boolean };
}

const u = (
  n: number, title: string, ready: boolean, canDo: string[],
  has: UnitMeta["has"] = {},
): UnitMeta => ({
  id: `u${String(n).padStart(2, "0")}`,
  n,
  title,
  phase: Math.ceil(n / 4),
  canDo,
  ready,
  checkpoint: n % 4 === 0,
  has,
});

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
    "Puedo entender indicaciones básicas.",
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
  u(16, "Salud y emergencias", false, [
    "Puedo explicar qué me duele y pedir ayuda médica.",
    "Puedo entender instrucciones de un médico o farmacéutico.",
    "Puedo pedir ayuda en una emergencia.",
  ]),
  u(17, "Casa, alquiler y trámites", false, [
    "Puedo preguntar por un alquiler y entender las condiciones.",
    "Puedo explicar un problema en la casa.",
    "Puedo entender y rellenar un trámite básico.",
  ]),
  u(18, "Teléfono, mensajes y mails", false, [
    "Puedo hacer y contestar una llamada simple.",
    "Puedo escribir un mensaje o mail informal y uno formal.",
  ]),
  u(19, "Impersonal, da + tiempo y stare per", false, [
    "Puedo decir cómo se hacen las cosas en general (si impersonale).",
    "Puedo decir desde cuándo hago algo.",
    "Puedo anunciar algo que está por pasar.",
  ]),
  u(20, "Discurso indirecto y conectores", false, [
    "Puedo contar lo que otra persona dijo.",
    "Puedo enlazar ideas con conectores en una conversación.",
  ]),
  u(21, "Pronombres combinados", false, [
    "Puedo usar glielo, me lo, te la en frases cotidianas.",
    "Puedo entender estos pronombres cuando los oigo.",
  ]),
  u(22, "Congiuntivo presente en uso", false, [
    "Puedo expresar una opinión con penso che / credo che.",
    "Puedo expresar un deseo o una duda.",
  ]),
  u(23, "Hipótesis: periodo ipotetico", false, [
    "Puedo hablar de posibilidades con se + presente.",
    "Puedo plantear una hipótesis con se + congiuntivo imperfetto.",
  ]),
  u(24, "Repaso general y proyecto final", false, [
    "Puedo contar una experiencia completa: presente, pasado y planes.",
    "Puedo resolver situaciones de viaje y de vida diaria con seguridad.",
  ]),
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
