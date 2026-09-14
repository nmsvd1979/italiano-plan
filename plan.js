/**
 * plan.js — CONFIGURACIÓN DEL PLAN DE ITALIANO
 * ------------------------------------------------------------
 * Este archivo es el ÚNICO que deberías tocar si querés ajustar
 * el plan (actividades, minutos, recursos, fases, checkpoints).
 * La lógica de la app (app.js) lee esta configuración y no hace
 * falta modificarla para cambiar el contenido del plan.
 *
 * Estructura:
 *  - RESOURCES: catálogo de links externos, identificados por una clave (key).
 *  - PHASE_RESOURCES: qué recursos usar para las actividades "genéricas"
 *    (input, conversación, input largo) según la fase (1, 2 o 3).
 *  - PHASES: las 3 fases de 4 semanas, con título y foco temático.
 *  - DAY_TEMPLATES: la rutina semanal tipo, una entrada por día de la
 *    semana (0=domingo … 6=sábado, igual que Date.getDay() en JS).
 *  - CHECKPOINT_WEEKS: semanas de autoevaluación (fin de fase).
 *  - TOTAL_WEEKS: duración total del plan.
 * ------------------------------------------------------------
 */

window.PLAN_CONFIG = {
  totalWeeks: 12,

  // Catálogo de recursos externos. La "key" es lo que se referencia
  // desde DAY_TEMPLATES o PHASE_RESOURCES.
  resources: {
    quizlet: { name: "Quizlet", url: "https://quizlet.com/" },
    cbi: {
      name: "Coffee Break Italian",
      url: "https://podcasts.apple.com/us/podcast/coffee-break-italian/id958179457",
    },
    podcastitaliano: {
      name: "Podcast Italiano",
      url: "https://podcasts.apple.com/us/podcast/podcast-italiano-intermediate-advanced-italian-podcast/id1163599279",
    },
    newsslow: {
      name: "News in Slow Italian",
      url: "https://www.newsinslowitalian.com/",
    },
    oneworld: {
      name: "One World Italiano",
      url: "https://oneworlditaliano.com/en/",
    },
    falsosamigos: {
      name: "ItalianoSencillo (falsos amigos)",
      url: "https://www.italianosencillo.com/",
    },
    tembrica: {
      name: "Tembrica — Shadowing Studio",
      url: "https://tembrica.com/en/shadowing-studio",
    },
    italki: {
      name: "Abrir italki → pestaña Community (gratis)",
      url: "https://www.italki.com/",
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

  // Recursos sugeridos para actividades "genéricas" según la fase.
  // Las claves (input, conversation, longInput) son placeholders usados
  // en DAY_TEMPLATES; se resuelven acá según en qué fase estés.
  phaseResources: {
    1: {
      input: ["cbi"],
      conversation: ["hellotalk"],
      longInput: ["cbi"],
    },
    2: {
      input: ["podcastitaliano"],
      conversation: ["italki", "hellotalk"],
      longInput: ["podcastitaliano"],
    },
    3: {
      input: ["podcastitaliano", "newsslow"],
      conversation: ["italki", "hellotalk"],
      longInput: ["newsslow", "podcastitaliano"],
    },
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

  // Rutina semanal tipo. Cada actividad tiene:
  //   id                -> identificador único dentro del día (para guardar el check)
  //   name              -> texto que se muestra
  //   minutes           -> minutos estimados
  //   resources         -> array de keys (de RESOURCES o placeholders de phaseResources) — botón principal
  //   secondaryResources -> igual que resources, pero se muestran como botón chico/secundario
  dayTemplates: {
    1: {
      label: "Lunes",
      activities: [
        { id: "anki", name: "Quizlet (repetición espaciada)", minutes: 10, resources: ["quizlet"] },
        { id: "input", name: "Input comprensible", minutes: 15, resources: ["input"] },
        { id: "shadowing", name: "Shadowing", minutes: 5, resources: ["tembrica"] },
      ],
    },
    2: {
      label: "Martes",
      activities: [
        { id: "anki", name: "Quizlet (repetición espaciada)", minutes: 10, resources: ["quizlet"] },
        {
          id: "grammar",
          name: "Gramática dirigida",
          minutes: 15,
          resources: ["oneworld"],
          secondaryResources: ["falsosamigos"],
        },
      ],
    },
    3: {
      label: "Miércoles",
      activities: [
        { id: "anki", name: "Quizlet (repetición espaciada)", minutes: 10, resources: ["quizlet"] },
        { id: "input", name: "Input comprensible", minutes: 15, resources: ["input"] },
        { id: "shadowing", name: "Shadowing", minutes: 5, resources: ["tembrica"] },
      ],
    },
    4: {
      label: "Jueves",
      activities: [
        { id: "anki", name: "Quizlet (repetición espaciada)", minutes: 10, resources: ["quizlet"] },
        {
          id: "grammar",
          name: "Gramática dirigida",
          minutes: 15,
          resources: ["oneworld"],
          secondaryResources: ["falsosamigos"],
        },
      ],
    },
    5: {
      label: "Viernes",
      activities: [
        { id: "anki", name: "Quizlet (repetición espaciada)", minutes: 10, resources: ["quizlet"] },
        { id: "input", name: "Input comprensible", minutes: 15, resources: ["input"] },
      ],
    },
    6: {
      label: "Sábado (o domingo)",
      isWeekend: true,
      activities: [
        { id: "conversation", name: "Conversación real", minutes: 30, resources: ["conversation"] },
        { id: "anki_review", name: "Repaso Quizlet", minutes: 15, resources: ["quizlet"] },
        { id: "long_input", name: "Input largo", minutes: 35, resources: ["longInput"] },
      ],
    },
    0: {
      label: "Domingo (o sábado)",
      isWeekend: true,
      activities: [
        { id: "conversation", name: "Conversación real", minutes: 30, resources: ["conversation"] },
        { id: "anki_review", name: "Repaso Quizlet", minutes: 15, resources: ["quizlet"] },
        { id: "long_input", name: "Input largo", minutes: 35, resources: ["longInput"] },
      ],
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
