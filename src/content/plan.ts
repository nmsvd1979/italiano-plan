// Configuración del plan: fases, rutina semanal y recursos externos.
// Los links externos son https normales (nada de esquemas nativos): así el sistema
// decide si abre la app instalada o el navegador.

export type IconKey =
  | "cards" | "headphones" | "mic" | "book" | "ear" | "repeat" | "target" | "sound";

export type ActivityKind =
  | "quizlet"
  | "pronunciation"
  | "input"
  | "shadowing"
  | "grammarLesson"
  | "grammarPractice"
  | "mixedReview"
  | "phaseTest";

export interface Resource {
  name: string;
  url: string;
}

export interface Activity {
  /** Id estable para guardar el check. Se conservan los ids de la app anterior. */
  id: string;
  kind: ActivityKind;
  name: string;
  minutes: number;
  icon: IconKey;
  /** Claves de RESOURCES (o "input", que se resuelve según la fase). */
  resources?: string[];
}

export interface DayTemplate {
  label: string;
  activities: Activity[];
}

export interface Phase {
  id: 1 | 2 | 3;
  weeks: number[];
  title: string;
  focus: string;
}

export const TOTAL_WEEKS = 12;
export const CHECKPOINT_WEEKS: Record<number, { phase: 1 | 2 | 3; level: string }> = {
  4: { phase: 1, level: "A1" },
  8: { phase: 2, level: "A2" },
  12: { phase: 3, level: "A2 sólido" },
};

export const RESOURCES: Record<string, Resource> = {
  // La portada quizlet.com/ NO está entre los paths que Quizlet registra como Universal Link
  // (verificado en su apple-app-site-association): por eso abría el sitio y no la app.
  // "/latest/*" sí está registrado.
  quizletSet: {
    name: "Set de 5000 palabras",
    url: "https://quizlet.com/mx/879382781/vocabulario-espanol-italiano-5000-palabras-mas-usadas-flash-cards/",
  },
  quizlet: { name: "Mis tarjetas", url: "https://quizlet.com/latest/" },

  // open.spotify.com/show/* sí está registrado como Universal Link: abre la app de Spotify.
  cbi: { name: "Coffee Break Italian", url: "https://open.spotify.com/show/2PdBXXDEbSyR8fyd6RL5dR" },
  podcastitalianoPrincipiante: {
    name: "Podcast Italiano Principiante",
    url: "https://open.spotify.com/show/7etEyYB7O3BcGXlEPC3mOo",
  },
  podcastitaliano: {
    name: "Escuchar — Podcast Italiano",
    url: "https://open.spotify.com/show/1y4WrXQPfvoBCyWZBx5vFi",
  },
  // Spotify no trae transcripción: se abre el sitio del podcast.
  podcastitalianoTranscript: { name: "Ver transcripción", url: "https://podcastitaliano.com/" },

  // Para consultar la pronunciación de una palabra suelta: muchas voces nativas por palabra.
  forvo: { name: "Forvo", url: "https://forvo.com/" },
};

/** La actividad "input" apunta a recursos distintos según la fase. */
export const PHASE_INPUT: Record<1 | 2 | 3, string[]> = {
  1: ["cbi"],
  2: ["podcastitalianoPrincipiante"],
  3: ["podcastitaliano", "podcastitalianoTranscript"],
};

export const PHASES: Phase[] = [
  {
    id: 1,
    weeks: [1, 2, 3, 4],
    title: "Fase 1 — Cimientos",
    focus: "Presentarte, presente, pedir en un bar y moverte por la ciudad.",
  },
  {
    id: 2,
    weeks: [5, 6, 7, 8],
    title: "Fase 2 — Construcción",
    focus: "Contar tu rutina y el pasado: passato prossimo e imperfetto.",
  },
  {
    id: 3,
    weeks: [9, 10, 11, 12],
    title: "Fase 3 — Consolidación",
    focus: "Pronombres, futuro, condicional y contenido auténtico.",
  },
];

const quizlet = (minutes: number): Activity => ({
  id: "quizlet", kind: "quizlet", name: "Quizlet", minutes, icon: "cards",
  resources: ["quizletSet", "quizlet"],
});
const input = (minutes: number): Activity => ({
  id: "input", kind: "input", name: "Input", minutes, icon: "headphones", resources: ["input"],
});
const shadowing = (minutes: number): Activity => ({
  id: "shadowing", kind: "shadowing", name: "Shadowing", minutes, icon: "mic",
});
const pronunciation: Activity = {
  id: "pronunciation", kind: "pronunciation", name: "Pronunciación", minutes: 4, icon: "ear",
};

const monWed: DayTemplate = {
  label: "",
  activities: [{ ...quizlet(8) }, pronunciation, input(10), shadowing(8)],
};
const weekend: DayTemplate = {
  label: "",
  activities: [
    { ...quizlet(15), id: "quizlet_review", name: "Repaso Quizlet", icon: "repeat" },
    shadowing(25),
    { ...input(35), id: "long_input", name: "Input largo" },
    {
      id: "grammar_review", kind: "mixedReview", name: "Repaso mixto", minutes: 10, icon: "repeat",
    },
  ],
};

/** 0 = domingo … 6 = sábado, igual que Date.getDay(). */
export const DAY_TEMPLATES: Record<number, DayTemplate> = {
  1: { ...monWed, label: "Lunes" },
  2: {
    label: "Martes",
    activities: [
      quizlet(10),
      { id: "grammar", kind: "grammarLesson", name: "Lección de gramática", minutes: 15, icon: "book" },
    ],
  },
  3: { ...monWed, label: "Miércoles" },
  4: {
    label: "Jueves",
    activities: [
      quizlet(10),
      { id: "grammar_practice", kind: "grammarPractice", name: "Práctica de gramática", minutes: 15, icon: "book" },
    ],
  },
  5: { label: "Viernes", activities: [quizlet(10), input(15)] },
  6: { ...weekend, label: "Sábado (o domingo)" },
  0: { ...weekend, label: "Domingo (o sábado)" },
};

export const PHASE_TEST_ACTIVITY: Activity = {
  id: "phase_test", kind: "phaseTest", name: "Test de fase", minutes: 20, icon: "target",
};
