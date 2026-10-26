import type { Lesson } from "./types";

export const unidad19: Lesson = {
  "unit": "u19",
  "title": "Impersonal, da + tiempo y stare per",
  "situation": "Decir cómo se hacen las cosas, desde cuándo haces algo y qué está por pasar",
  "rule": [
    {
      "kind": "p",
      "text": "**El si impersonal** dice cómo se hacen las cosas en general (en español, *se*): *si* + verbo en tercera persona. *Qui si parla italiano.* (aquí se habla italiano) · *In Italia si mangia tardi.* (en Italia se come tarde). Si lo que sigue es plural, el verbo va en plural: *Si vendono biglietti qui.* (aquí se venden boletos / pasajes)."
    },
    {
      "kind": "table",
      "head": [
        "Pregunta útil",
        "Italiano"
      ],
      "rows": [
        [
          "Cómo se dice…",
          "*Come si dice «gracias» in italiano?*"
        ],
        [
          "Cómo se escribe…",
          "*Come si scrive questa parola?*"
        ],
        [
          "Dónde se compra…",
          "*Dove si comprano i biglietti?*"
        ],
        [
          "¿Se puede…?",
          "*Si può entrare?* / *Si può fumare?*"
        ],
        [
          "¿Se habla…?",
          "*Si parla spagnolo?*"
        ]
      ]
    },
    {
      "kind": "p",
      "text": "**Desde cuándo y durante cuánto tiempo.** Para algo que empezó en el pasado y **sigue ahora**, el italiano usa el **presente** con *da*: *Studio italiano da tre mesi.* (llevo tres meses estudiando italiano). Compara las tres palabras:"
    },
    {
      "kind": "table",
      "head": [
        "Palabra",
        "Significa",
        "Ejemplo"
      ],
      "rows": [
        [
          "*da* + presente",
          "desde / llevo… haciendo (sigue)",
          "*Studio italiano da tre mesi.*"
        ],
        [
          "*per* + passato prossimo",
          "durante (ya terminó)",
          "*Ho studiato per tre mesi.*"
        ],
        [
          "*fa* (después del tiempo)",
          "hace… (momento pasado)",
          "*Sono arrivato tre giorni fa.*"
        ],
        [
          "*da quanto tempo?*",
          "¿hace cuánto? / ¿desde cuándo?",
          "*Da quanto tempo abiti qui?*"
        ]
      ]
    },
    {
      "kind": "p",
      "text": "*Da* también va con un punto de partida: *Lavoro qui da lunedì.* (desde el lunes) · *Abito qui dal 2020.* (desde 2020) · *Da quando abiti a Roma?* (¿desde cuándo vives en Roma?). Con *da poco* (hace poco) y *da molto* (hace mucho) también va el presente: *Sono qui da poco.*"
    },
    {
      "kind": "p",
      "text": "**Estar por hacer algo:** *stare per* + infinitivo. *Il treno sta per partire.* (el tren está por salir) · *Sto per uscire.* (estoy por salir / estoy a punto de salir) · *Stavo per chiamarti.* (estaba por llamarte)."
    }
  ],
  "transfer": "En español *llevo tres meses estudiando* tiene un verbo especial; en italiano no hace falta: el presente basta con *da*: *studio da tre mesi*. No digas *ho studiato da tre mesi* si todavía estudias. Y *si* impersonal no es el *si* de «sí» ni el reflexivo *si* (*si lava*): aquí se traduce con «se» impersonal (*si mangia bene*, se come bien).",
  "examples": [
    {
      "it": "Qui si parla italiano e spagnolo.",
      "es": "Aquí se habla italiano y español."
    },
    {
      "it": "Come si dice «mañana» in italiano?",
      "es": "¿Cómo se dice «mañana» en italiano?"
    },
    {
      "it": "Studio italiano da tre mesi.",
      "es": "Llevo tres meses estudiando italiano."
    },
    {
      "it": "Abito a Santiago da dieci anni.",
      "es": "Vivo en Santiago desde hace diez años."
    },
    {
      "it": "Sono arrivato in Italia tre giorni fa.",
      "es": "Llegué a Italia hace tres días."
    },
    {
      "it": "Il treno sta per partire!",
      "es": "¡El tren está por salir!"
    }
  ],
  "notice": [
    {
      "type": "choice",
      "prompt": "«Studio italiano da due mesi.» ¿Qué dice?",
      "options": [
        "Lleva dos meses estudiando y sigue",
        "Estudió dos meses y terminó",
        "Va a estudiar dos meses"
      ],
      "answer": 0,
      "why": "*Da* + presente = algo que empezó y continúa."
    },
    {
      "type": "choice",
      "prompt": "«Si mangia bene qui.» ¿Qué significa?",
      "options": [
        "Aquí se come bien",
        "Yo como bien aquí",
        "Mañana comemos"
      ],
      "answer": 0,
      "why": "*Si* + tercera persona = se impersonal."
    },
    {
      "type": "choice",
      "prompt": "«Sto per uscire.» ¿Qué dice?",
      "options": [
        "Está por salir, a punto de salir",
        "Salió ayer",
        "Sale todos los días"
      ],
      "answer": 0,
      "why": "*Stare per* = estar por / estar a punto de."
    }
  ],
  "exercises": [
    {
      "type": "fill",
      "prompt": "Studio italiano ___ tre mesi. (desde hace)",
      "answers": [
        "da"
      ],
      "why": "*Da* + tiempo + presente."
    },
    {
      "type": "fill",
      "prompt": "Ho studiato ___ tre mesi. (durante)",
      "answers": [
        "per"
      ],
      "why": "Terminado: *per* + passato prossimo."
    },
    {
      "type": "fill",
      "prompt": "Sono arrivato tre giorni ___. (hace)",
      "answers": [
        "fa"
      ],
      "why": "*Fa* va después del tiempo."
    },
    {
      "type": "fill",
      "prompt": "___ quanto tempo abiti qui? (¿hace cuánto?)",
      "answers": [
        "Da"
      ],
      "why": "*Da quanto tempo…?*"
    },
    {
      "type": "fill",
      "prompt": "Qui ___ parla italiano. (se)",
      "answers": [
        "si"
      ],
      "why": "*Si* + tercera persona."
    },
    {
      "type": "fill",
      "prompt": "Come si ___ «gracias» in italiano? (decir)",
      "answers": [
        "dice"
      ],
      "why": "*Come si dice…?*"
    },
    {
      "type": "fill",
      "prompt": "Come si ___ questa parola? (escribir)",
      "answers": [
        "scrive"
      ],
      "why": "*Come si scrive…?*"
    },
    {
      "type": "fill",
      "prompt": "Il treno ___ per partire. (está)",
      "answers": [
        "sta"
      ],
      "why": "*Stare per*: *il treno sta per partire*."
    },
    {
      "type": "fill",
      "prompt": "Sto ___ uscire. (por)",
      "answers": [
        "per"
      ],
      "why": "*Stare per* + infinitivo."
    },
    {
      "type": "fill",
      "prompt": "Abito qui ___ un anno. (desde hace)",
      "answers": [
        "da"
      ],
      "why": "*Da* + presente."
    },
    {
      "type": "fill",
      "prompt": "Lavoro qui ___ lunedì. (desde)",
      "answers": [
        "da"
      ],
      "why": "*Da lunedì*."
    },
    {
      "type": "fill",
      "prompt": "Dove si ___ i biglietti? (comprar, plural)",
      "answers": [
        "comprano"
      ],
      "why": "Plural: *si comprano*."
    },
    {
      "type": "fill",
      "prompt": "Si ___ italiano qui? (hablar)",
      "answers": [
        "parla"
      ],
      "why": "*Si parla*."
    },
    {
      "type": "choice",
      "prompt": "«Llevo dos años viviendo en Chile»",
      "options": [
        "Abito in Cile da due anni.",
        "Ho abitato in Cile da due anni.",
        "Abito in Cile per due anni fa."
      ],
      "answer": 0,
      "why": "Sigue ahora: presente + *da*."
    },
    {
      "type": "choice",
      "prompt": "«Ayer estudié dos horas»",
      "options": [
        "Ieri ho studiato per due ore.",
        "Ieri studio da due ore.",
        "Ieri ho studiato da due ore."
      ],
      "answer": 0,
      "why": "Terminado: *per* + passato prossimo."
    },
    {
      "type": "choice",
      "prompt": "«¿Se puede entrar?»",
      "options": [
        "Si può entrare?",
        "Se può entrare?",
        "Si puoi entrare?"
      ],
      "answer": 0,
      "why": "*Si* + tercera persona: *si può*."
    },
    {
      "type": "choice",
      "prompt": "«El tren está por salir»",
      "options": [
        "Il treno sta per partire.",
        "Il treno è per partire.",
        "Il treno parte per."
      ],
      "answer": 0,
      "why": "*Stare per* + infinitivo."
    },
    {
      "type": "choice",
      "prompt": "«Hace una semana»",
      "options": [
        "una settimana fa",
        "da una settimana fa",
        "per una settimana fa"
      ],
      "answer": 0,
      "why": "*Fa* va después del tiempo."
    }
  ]
};
