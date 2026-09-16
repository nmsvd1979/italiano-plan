/**
 * plan.js — CONFIGURACIÓN DEL PLAN DE ITALIANO
 * ------------------------------------------------------------
 * Este archivo es el ÚNICO que deberías tocar si querés ajustar
 * el plan (actividades, minutos, recursos, fases, checkpoints).
 * La lógica de la app (app.js) lee esta configuración y no hace
 * falta modificarla para cambiar el contenido del plan.
 *
 * Estructura:
 *  - resources: catálogo de links externos, identificados por una clave (key).
 *    Cada link es https:// normal, abierto en pestaña nueva — nada de
 *    esquemas nativos (app://...), así el sistema operativo decide solo
 *    si abre la app instalada o el navegador.
 *  - phaseResources: qué recursos usar para las actividades "genéricas"
 *    (input) según la fase (1, 2 o 3). Cada valor es un array de keys:
 *    si tiene más de una key, se muestra un botón por cada una.
 *  - phases: las 3 fases de 4 semanas, con título y foco temático.
 *  - dayTemplates: la rutina semanal tipo, una entrada por día de la
 *    semana (0=domingo … 6=sábado, igual que Date.getDay() en JS).
 *  - checkpointWeeks: semanas de autoevaluación (fin de fase).
 *  - totalWeeks: duración total del plan.
 * ------------------------------------------------------------
 */

window.PLAN_CONFIG = {
  totalWeeks: 12,

  // Catálogo de recursos externos. La "key" es lo que se referencia
  // desde dayTemplates o phaseResources.
  resources: {
    // Set de arranque (español → italiano, 5000 palabras más usadas) +
    // acceso general para las tarjetas propias que el usuario va sumando.
    quizletSet: {
      name: "Set inicial: Vocabulario ES→IT (5000)",
      url: "https://quizlet.com/mx/879382781/vocabulario-espanol-italiano-5000-palabras-mas-usadas-flash-cards/",
    },
    // OJO: la portada "https://quizlet.com/" NO está en la lista de paths
    // que Quizlet registra en su propio apple-app-site-association -> por
    // eso ese botón caía siempre en el navegador. "/latest/*" sí está
    // registrado (verificado en quizlet.com/.well-known/apple-app-site-association),
    // así que este es el que realmente abre la app instalada.
    quizlet: { name: "Quizlet (mis tarjetas)", url: "https://quizlet.com/latest/" },

    // Input Fase 1 — principiante absoluto.
    cbi: {
      name: "Coffee Break Italian",
      url: "https://open.spotify.com/show/2PdBXXDEbSyR8fyd6RL5dR",
    },

    // Input puente Fase 1→2 — A2-B1. Show distinto de "Podcast Italiano".
    podcastitalianoPrincipiante: {
      name: "Podcast Italiano Principiante",
      url: "https://open.spotify.com/show/7etEyYB7O3BcGXlEPC3mOo",
    },

    // Input Fase 2-3 — intermedio/avanzado. Dos botones: Spotify no trae
    // transcripción, así que hace falta el sitio aparte para eso.
    podcastitaliano: {
      name: "Escuchar — Podcast Italiano",
      url: "https://open.spotify.com/show/1y4WrXQPfvoBCyWZBx5vFi",
    },
    podcastitalianoTranscript: {
      name: "Ver transcripción",
      url: "https://podcastitaliano.com/",
    },

    // Gramática — recorrido inicial. Se usa una sola vez, el primer día
    // de gramática de todo el plan (ver isFirstOccurrence en app.js).
    grammarStart: {
      name: "Empezar aquí — ItalianoSencillo",
      url: "https://www.italianosencillo.com/aprender-italiano-desde-cero",
      highlight: true,
    },
    // Gramática — consulta puntual, resto del plan.
    grammarSearch: {
      name: "Buscar tema de gramática",
      url: "https://www.italianosencillo.com/gramatica",
    },
    // Fallback si no se encuentra el tema en ItalianoSencillo. Es un blog
    // sin secuencia — por eso el texto dice "buscar", nunca "seguir curso".
    grammarFallback: {
      name: "Buscar tema puntual",
      url: "https://oneworlditaliano.com/en/",
    },

    tembrica: {
      name: "Tembrica — Shadowing Studio",
      url: "https://tembrica.com/en/shadowing-studio",
    },

    italki: {
      name: "italki Community (gratis)",
      url: "https://www.italki.com/en/community/for-you",
    },
    hellotalk: {
      name: "HelloTalk",
      url: "https://apps.apple.com/app/hellotalk/id557130558",
    },
    forvo: { name: "Forvo", url: "https://forvo.com/" },

    leveltest: {
      name: "Test de nivel A1/A2 (buscar online)",
      url: "https://www.google.com/search?q=test+italiano+A1+A2+online+gratis",
    },
  },

  // Recursos para la actividad "genérica" de input según la fase.
  // La clave "input" es un placeholder usado en dayTemplates; se resuelve
  // acá según en qué fase estés. Un array con más de una key = un botón
  // por cada recurso.
  phaseResources: {
    1: { input: ["cbi"] },
    2: { input: ["podcastitalianoPrincipiante"] },
    3: { input: ["podcastitaliano", "podcastitalianoTranscript"] },
  },

  phases: [
    {
      id: 1,
      weeks: [1, 2, 3, 4],
      title: "Fase 1 — Cimientos",
      focus:
        "Fonética italiana, presente indicativo, vocabulario básico, falsos amigos español-italiano.",
    },
    {
      id: 2,
      weeks: [5, 6, 7, 8],
      title: "Fase 2 — Construcción",
      focus:
        "Pasado (passato prossimo / imperfetto), pronombres, empieza la conversación real.",
    },
    {
      id: 3,
      weeks: [9, 10, 11, 12],
      title: "Fase 3 — Consolidación",
      focus:
        "Futuro / condicional, subjuntivo básico, conversación más frecuente, contenido auténtico.",
    },
  ],

  // Rutina semanal tipo. Se repite las 12 semanas — cambia el contenido
  // (vía phaseResources), no la estructura. Cada actividad tiene:
  //   id                 -> identificador único dentro del día (para guardar el check)
  //   icon               -> emoji decorativo
  //   name               -> texto que se muestra
  //   minutes            -> minutos estimados
  //   resources          -> array de keys — botón(es) principal(es)
  //   secondaryResources -> igual, pero se muestran como botón chico/secundario
  dayTemplates: {
    1: {
      label: "Lunes",
      activities: [
        { id: "quizlet", icon: "🧠", name: "Quizlet (repetición espaciada)", minutes: 10, resources: ["quizletSet", "quizlet"] },
        { id: "input", icon: "🎧", name: "Input comprensible", minutes: 15, resources: ["input"] },
        { id: "shadowing", icon: "🗣️", name: "Shadowing", minutes: 5, resources: ["tembrica"] },
      ],
    },
    2: {
      label: "Martes",
      activities: [
        { id: "quizlet", icon: "🧠", name: "Quizlet (repetición espaciada)", minutes: 10, resources: ["quizletSet", "quizlet"] },
        {
          id: "grammar",
          icon: "📚",
          name: "Gramática dirigida",
          minutes: 15,
          resources: ["grammarSearch"],
          secondaryResources: ["grammarFallback"],
        },
      ],
    },
    3: {
      label: "Miércoles",
      activities: [
        { id: "quizlet", icon: "🧠", name: "Quizlet (repetición espaciada)", minutes: 10, resources: ["quizletSet", "quizlet"] },
        { id: "input", icon: "🎧", name: "Input comprensible", minutes: 15, resources: ["input"] },
        { id: "shadowing", icon: "🗣️", name: "Shadowing", minutes: 5, resources: ["tembrica"] },
      ],
    },
    4: {
      label: "Jueves",
      activities: [
        { id: "quizlet", icon: "🧠", name: "Quizlet (repetición espaciada)", minutes: 10, resources: ["quizletSet", "quizlet"] },
        {
          id: "grammar",
          icon: "📚",
          name: "Gramática dirigida",
          minutes: 15,
          resources: ["grammarSearch"],
          secondaryResources: ["grammarFallback"],
        },
      ],
    },
    5: {
      label: "Viernes",
      activities: [
        { id: "quizlet", icon: "🧠", name: "Quizlet (repetición espaciada)", minutes: 10, resources: ["quizletSet", "quizlet"] },
        { id: "input", icon: "🎧", name: "Input comprensible", minutes: 15, resources: ["input"] },
      ],
    },
    6: {
      label: "Sábado (o domingo)",
      isWeekend: true,
      activities: [
        { id: "conversation", icon: "💬", name: "Conversación real", minutes: 30, resources: ["italki", "hellotalk"] },
        { id: "quizlet_review", icon: "🔁", name: "Repaso Quizlet", minutes: 15, resources: ["quizletSet", "quizlet"] },
        { id: "long_input", icon: "🎧", name: "Input más largo", minutes: 35, resources: ["input"] },
      ],
    },
    0: {
      label: "Domingo (o sábado)",
      isWeekend: true,
      activities: [
        { id: "conversation", icon: "💬", name: "Conversación real", minutes: 30, resources: ["italki", "hellotalk"] },
        { id: "quizlet_review", icon: "🔁", name: "Repaso Quizlet", minutes: 15, resources: ["quizletSet", "quizlet"] },
        { id: "long_input", icon: "🎧", name: "Input más largo", minutes: 35, resources: ["input"] },
      ],
    },
  },

  // Lista curada para la grilla "Recursos" de Configuración (accesos
  // directos generales, fuera del checklist de hoy). Se deja afuera
  // grammarStart (es para usar una sola vez, ya aparece destacado ese día)
  // y leveltest (ya aparece en el aviso de checkpoint).
  directoryResources: [
    "quizletSet",
    "quizlet",
    "cbi",
    "podcastitalianoPrincipiante",
    "podcastitaliano",
    "podcastitalianoTranscript",
    "grammarSearch",
    "grammarFallback",
    "tembrica",
    "italki",
    "hellotalk",
    "forvo",
  ],

  // El primer día de gramática de todo el plan usa "grammarStart" en vez
  // de "grammarSearch"/"grammarFallback" (ver isFirstGrammarDay en app.js).
  firstOccurrenceOverrides: {
    grammar: {
      resources: ["grammarStart"],
      secondaryResources: [],
    },
  },

  // Semanas de autoevaluación / checkpoint. También sirven como semana
  // de repaso puro si hay atraso (no hace falta sumar contenido nuevo).
  checkpointWeeks: {
    4: { level: "A1", note: "Fin Fase 1: autoevaluación de nivel A1." },
    8: { level: "A2", note: "Fin Fase 2: autoevaluación de nivel A2." },
    12: {
      level: "A2 sólido / cerca de B1",
      note: "Fin del plan: meta A2 sólido, comprensión cerca de B1.",
    },
  },
};
