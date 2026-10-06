// Recursos externos y catálogo de actividades. El currículo (unidades, sesiones) está en curriculum.ts.
// Los links externos son https normales (nada de esquemas nativos): así el sistema decide si abre
// la app instalada o el navegador.

export type IconKey =
  | "cards" | "headphones" | "mic" | "book" | "ear" | "repeat" | "target" | "sound"
  | "pen" | "list" | "chat";

export type ActivityKind =
  | "quizlet" | "pronunciation" | "input" | "shadowing" | "vocab" | "grammarLesson"
  | "grammarPractice" | "writing" | "dictation" | "dialogue" | "mixedReview" | "phaseTest";

export interface Resource {
  name: string;
  url: string;
}

export interface Activity {
  /** Id corto dentro de la sesión. La clave completa es `unidad.sesión.id` (ej. u04.s2.lesson). */
  id: string;
  kind: ActivityKind;
  name: string;
  minutes: number;
  icon: IconKey;
  /** Claves de RESOURCES, o "input", que se resuelve según la fase de la unidad. */
  resources?: string[];
}

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

/**
 * Recursos de la actividad "input" según la fase de la unidad. Cada grupo es una secuencia de
 * episodios: la app indica el número de episodio que toca (ver episodeNumber en domain/curriculum).
 */
export const PHASE_INPUT: Record<number, { group: string; resources: string[] }> = {
  1: { group: "cbi", resources: ["cbi"] },
  2: { group: "cbi", resources: ["cbi"] },
  3: { group: "principiante", resources: ["podcastitalianoPrincipiante"] },
  4: { group: "principiante", resources: ["podcastitalianoPrincipiante"] },
  5: { group: "pi", resources: ["podcastitaliano", "podcastitalianoTranscript"] },
  6: { group: "pi", resources: ["podcastitaliano", "podcastitalianoTranscript"] },
};

export const INPUT_GROUP_NAME: Record<string, string> = {
  cbi: "Coffee Break Italian",
  principiante: "Podcast Italiano Principiante",
  pi: "Podcast Italiano",
};

const quizlet = (minutes: number, id = "quizlet", name = "Quizlet"): Activity => ({
  id, kind: "quizlet", name, minutes, icon: "cards", resources: ["quizletSet", "quizlet"],
});
const pron: Activity = { id: "pron", kind: "pronunciation", name: "Pronunciación", minutes: 4, icon: "ear" };
const input = (minutes: number, id = "input", name = "Input"): Activity => ({
  id, kind: "input", name, minutes, icon: "headphones", resources: ["input"],
});
const shadowing = (minutes: number, id = "shadow"): Activity => ({
  id, kind: "shadowing", name: "Shadowing", minutes, icon: "mic",
});

/** Actividades opcionales: solo aparecen en una unidad si esa unidad tiene su contenido. */
export const VOCAB: Activity = { id: "vocab", kind: "vocab", name: "Palabras de la unidad", minutes: 7, icon: "list" };
export const WRITING: Activity = { id: "writing", kind: "writing", name: "Escritura guiada", minutes: 10, icon: "pen" };
export const DICTATION: Activity = { id: "dictation", kind: "dictation", name: "Dictado", minutes: 10, icon: "ear" };
export const DIALOGUE: Activity = { id: "dialogue", kind: "dialogue", name: "Diálogo en voz alta", minutes: 8, icon: "chat" };

export const LESSON: Activity = { id: "lesson", kind: "grammarLesson", name: "Lección de gramática", minutes: 15, icon: "book" };
export const PRACTICE: Activity = { id: "practice", kind: "grammarPractice", name: "Práctica de gramática", minutes: 12, icon: "book" };
export const MIXED_REVIEW: Activity = { id: "review", kind: "mixedReview", name: "Repaso mixto", minutes: 7, icon: "repeat" };
export const PHASE_TEST: Activity = { id: "test", kind: "phaseTest", name: "Test de fase", minutes: 20, icon: "target" };

export { quizlet, pron, input, shadowing };
