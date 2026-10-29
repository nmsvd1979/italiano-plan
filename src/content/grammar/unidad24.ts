import type { Lesson } from "./types";

export const unidad24: Lesson = {
  "unit": "u24",
  "title": "Repaso general y proyecto final",
  "situation": "Contar una experiencia completa y resolver situaciones de viaje",
  "rule": [
    {
      "kind": "p",
      "text": "Esta unidad no trae gramática nueva: es el mapa de todo lo que ya usas. Tu **proyecto final** es contar una experiencia completa, combinando varios tiempos. Antes, repasa para qué sirve cada uno:"
    },
    {
      "kind": "table",
      "head": [
        "Tiempo",
        "Para…",
        "Ejemplo"
      ],
      "rows": [
        [
          "*presente*",
          "lo que haces ahora o siempre",
          "*Abito a Santiago. Studio italiano.*"
        ],
        [
          "*passato prossimo*",
          "hechos terminados",
          "*Ieri sono andato al mercato.*"
        ],
        [
          "*imperfetto*",
          "cómo eran las cosas o lo que hacías",
          "*Da bambino abitavo a Roma.*"
        ],
        [
          "*futuro*",
          "planes y suposiciones",
          "*L'anno prossimo andrò in Italia.*"
        ],
        [
          "*condizionale*",
          "cortesía y consejos",
          "*Vorrei un caffè. Dovresti riposare.*"
        ],
        [
          "*congiuntivo*",
          "opinión, deseo, duda",
          "*Penso che sia vero.*"
        ],
        [
          "*se* + imperfetto",
          "hipótesis irreales",
          "*Se avessi tempo, viaggerei.*"
        ]
      ]
    },
    {
      "kind": "p",
      "text": "**Cómo contar una experiencia.** 1) Sitúa: *L'anno scorso sono andato in Italia con un amico.* 2) Describe el fondo con imperfetto: *Faceva caldo e il cielo era azzurro.* 3) Cuenta los hechos con passato prossimo: *Siamo arrivati a Roma e abbiamo visitato il Colosseo.* 4) Da tu opinión: *Penso che sia stata un'esperienza bellissima.* 5) Mira adelante: *Spero di tornare l'anno prossimo.* Enlaza con *prima, poi, dopo, alla fine, mentre, perché, quindi, però*. Para reconocer: *sia stata* (fue) es el congiuntivo del pasado, formado con *essere* en congiuntivo + participio; lo oirás mucho, y por ahora basta con entenderlo."
    },
    {
      "kind": "p",
      "text": "**Los ocho errores más comunes de quien habla español.** Corrígelos antes de entregar tu proyecto:"
    },
    {
      "kind": "table",
      "head": [
        "Error",
        "Correcto"
      ],
      "rows": [
        [
          "*Vado nella banca.*",
          "*Vado in banca.*"
        ],
        [
          "*Ho niente.*",
          "*Non ho niente.*"
        ],
        [
          "*Ho studiato da tre mesi.* (sigo estudiando)",
          "*Studio da tre mesi.*"
        ],
        [
          "*Più alto che me.*",
          "*Più alto di me.*"
        ],
        [
          "*Ho andato a Roma.*",
          "*Sono andato a Roma.*"
        ],
        [
          "*Se avrei tempo…*",
          "*Se avessi tempo…*"
        ],
        [
          "*Credo che viene.*",
          "*Credo che venga.*"
        ],
        [
          "*Mi piace i gelati.*",
          "*Mi piacciono i gelati.*"
        ]
      ]
    }
  ],
  "transfer": "Casi todos los errores vienen de copiar la estructura del español palabra por palabra. Antes de decir una frase, pregúntate tres cosas: ¿la acción terminó o describo el fondo (*passato prossimo* o *imperfetto*)? ¿necesito una preposición distinta (*a, in, da, di, per*)? ¿hay un pronombre o un *non* que el español no tiene? Con eso corriges la mayoría de los errores.",
  "examples": [
    {
      "it": "L'anno scorso sono andato in Italia con un amico.",
      "es": "El año pasado fui a Italia con un amigo."
    },
    {
      "it": "Faceva caldo e il cielo era azzurro.",
      "es": "Hacía calor y el cielo era azul."
    },
    {
      "it": "Prima abbiamo visitato il Colosseo, poi abbiamo mangiato.",
      "es": "Primero visitamos el Coliseo y después comimos."
    },
    {
      "it": "Penso che sia stata un'esperienza bellissima.",
      "es": "Pienso que fue una experiencia hermosísima."
    },
    {
      "it": "Se avessi più tempo, resterei un mese.",
      "es": "Si tuviera más tiempo, me quedaría un mes."
    },
    {
      "it": "Spero di tornare l'anno prossimo.",
      "es": "Espero volver el año próximo."
    }
  ],
  "notice": [
    {
      "type": "choice",
      "prompt": "«Faceva caldo e il cielo era azzurro.» ¿Qué hace esta frase?",
      "options": [
        "Describe el fondo de la escena",
        "Cuenta un hecho puntual",
        "Hace una predicción"
      ],
      "answer": 0,
      "why": "El *imperfetto* describe cómo eran las cosas."
    },
    {
      "type": "choice",
      "prompt": "«Siamo arrivati a Roma.» ¿Qué tiempo es?",
      "options": [
        "Passato prossimo",
        "Futuro",
        "Congiuntivo"
      ],
      "answer": 0,
      "why": "*Siamo arrivati* = *essere* + participio: passato prossimo."
    },
    {
      "type": "choice",
      "prompt": "«Se avessi tempo, resterei.» ¿Qué expresa?",
      "options": [
        "Una hipótesis irreal",
        "Un hecho seguro",
        "Una orden"
      ],
      "answer": 0,
      "why": "*Se* + congiuntivo imperfetto + condizionale."
    }
  ],
  "exercises": [
    {
      "type": "fill",
      "prompt": "Ieri io ___ al mercato. (andare)",
      "answers": [
        "sono andato",
        "sono andata"
      ],
      "why": "*Andare* usa *essere*: *sono andato / andata*."
    },
    {
      "type": "fill",
      "prompt": "Da bambino ___ a Roma. (abitare, imperfetto)",
      "answers": [
        "abitavo"
      ],
      "why": "Imperfetto: *abitavo*."
    },
    {
      "type": "fill",
      "prompt": "L'anno prossimo ___ in Italia. (io, andare, futuro)",
      "answers": [
        "andrò"
      ],
      "why": "Raíz irregular: *andrò*."
    },
    {
      "type": "fill",
      "prompt": "___ un caffè, per favore. (io, volere, cortés)",
      "answers": [
        "Vorrei"
      ],
      "why": "*Vorrei* es el pedido cortés."
    },
    {
      "type": "fill",
      "prompt": "Penso che lui ___ ragione. (avere)",
      "answers": [
        "abbia"
      ],
      "why": "*Penso che* + congiuntivo: *abbia*."
    },
    {
      "type": "fill",
      "prompt": "Se ___ tempo, viaggerei. (io, avere)",
      "answers": [
        "avessi"
      ],
      "why": "*Se* + congiuntivo imperfetto: *avessi*."
    },
    {
      "type": "fill",
      "prompt": "Studio italiano ___ tre mesi. (desde hace)",
      "answers": [
        "da"
      ],
      "why": "*Da* + presente."
    },
    {
      "type": "fill",
      "prompt": "Mi ___ male la testa. (duele)",
      "answers": [
        "fa"
      ],
      "why": "*Mi fa male* + singular."
    },
    {
      "type": "fill",
      "prompt": "Vado ___ banca.",
      "answers": [
        "in"
      ],
      "why": "Lugar habitual: *in banca*."
    },
    {
      "type": "fill",
      "prompt": "Non ho ___. (nada)",
      "answers": [
        "niente"
      ],
      "why": "*Non ho niente*."
    },
    {
      "type": "fill",
      "prompt": "Mi presti la penna? Sì, ___ presto.",
      "answers": [
        "te la"
      ],
      "why": "*Te la presto*."
    },
    {
      "type": "fill",
      "prompt": "Ti ___ tra dieci minuti. (volver a llamar)",
      "answers": [
        "richiamo"
      ],
      "why": "*Richiamare → richiamo*."
    },
    {
      "type": "fill",
      "prompt": "Marco è più alto ___ me. (que)",
      "answers": [
        "di"
      ],
      "why": "Comparar con un pronombre: *di*."
    },
    {
      "type": "fill",
      "prompt": "Ieri abbiamo ___ la pizza. (mangiare)",
      "answers": [
        "mangiato"
      ],
      "why": "Participio de *mangiare*: *mangiato*."
    },
    {
      "type": "fill",
      "prompt": "Mentre io ___, ha suonato il telefono. (dormire, imperfetto)",
      "answers": [
        "dormivo"
      ],
      "why": "Imperfetto: *dormivo*."
    },
    {
      "type": "fill",
      "prompt": "Spero che tu ___ bene. (stare)",
      "answers": [
        "stia"
      ],
      "why": "*Spero che* + congiuntivo: *stia*."
    },
    {
      "type": "choice",
      "prompt": "«Si fuera rico, compraría una casa»",
      "options": [
        "Se fossi ricco, comprerei una casa.",
        "Se sarei ricco, comprerei una casa.",
        "Se fossi ricco, compro una casa."
      ],
      "answer": 0,
      "why": "Congiuntivo imperfetto + condizionale."
    },
    {
      "type": "choice",
      "prompt": "«Llevo dos años viviendo en Italia»",
      "options": [
        "Abito in Italia da due anni.",
        "Ho abitato in Italia da due anni.",
        "Abito in Italia fa due anni."
      ],
      "answer": 0,
      "why": "Sigue ahora: presente + *da*."
    },
    {
      "type": "choice",
      "prompt": "Pides con cortesía que te ayuden:",
      "options": [
        "Potrebbe aiutarmi?",
        "Aiutami!",
        "Tu aiuti me?"
      ],
      "answer": 0,
      "why": "Condizionale + *Lei*."
    },
    {
      "type": "choice",
      "prompt": "«No tengo nada»",
      "options": [
        "Non ho niente.",
        "Ho niente.",
        "Non niente ho."
      ],
      "answer": 0,
      "why": "*Non* + verbo + *niente*."
    },
    {
      "type": "choice",
      "prompt": "«Nos vemos mañana»",
      "options": [
        "Ci vediamo domani.",
        "Noi vediamo domani.",
        "Si vediamo domani."
      ],
      "answer": 0,
      "why": "Recíproco: *ci vediamo*."
    }
  ]
};
