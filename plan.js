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
    // "/latest/*" es, literalmente, el único path de quizlet.com que Quizlet
    // registra como Universal Link en su propio apple-app-site-association
    // (verificado en https://quizlet.com/.well-known/apple-app-site-association).
    // La portada "/" NO está en esa lista → por eso antes abría el sitio de
    // marketing en vez de la app.
    quizlet: { name: "Quizlet", url: "https://quizlet.com/latest/" },
    cbi: {
      name: "Coffee Break Italian",
      url: "https://podcasts.apple.com/us/podcast/coffee-break-italian/id958179457",
    },
    // podcasts.apple.com es dominio propio de Apple: SIEMPRE abre la app
    // Podcasts nativa en iPhone (no depende de que Podcast Italiano
    // configure nada). Esta es la URL canónica actual (sin redirect).
    podcastitaliano: {
      name: "Podcast Italiano",
      url: "https://podcasts.apple.com/us/podcast/podcast-italiano-learn-italian-intermediate-advanced/id1163599279",
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
    // italki NO tiene apple-app-site-association configurado en italki.com
    // (verificado: /.well-known/apple-app-site-association devuelve error,
    // no existe el archivo) → ningún link https a este dominio puede abrir
    // la app nativa automáticamente, siempre cae en el navegador. Como no
    // se puede forzar la app sin usar un esquema itaki:// fràgil (lo que
    // pediste evitar), al menos apunta directo a la pestaña correcta.
    italki: {
      name: "italki — Community (gratis)",
      url: "https://www.italki.com/en/community/for-you",
    },
    // hellotalk.com SÍ tiene Universal Link, pero solo para "/ios" — es el
    // único path de su apple-app-site-association (verificado en
    // https://www.hellotalk.com/apple-app-site-association). Con la app
    // instalada abre directo adentro; si no está instalada, esa misma URL
    // muestra una página 404 del sitio (no un cartel de App Store) — es una
    // limitación real de cómo HelloTalk configuró su propio dominio.
    hellotalk: {
      name: "HelloTalk",
      url: "https://www.hellotalk.com/ios",
    },
    // Forvo tiene app nativa ("Forvo Pronunciation") pero forvo.com NO tiene
    // apple-app-site-association (verificado: 404) → no hay forma de que un
    // link https abra la app sola. Queda el buscador web, que es lo único
    // funcional posible sin usar un esquema de URL nativo.
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
