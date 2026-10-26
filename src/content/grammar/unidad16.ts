import type { Lesson } from "./types";

export const unidad16: Lesson = {
  "unit": "u16",
  "title": "Salud y emergencias",
  "situation": "Explicar qué te duele, entender al médico y pedir ayuda",
  "rule": [
    {
      "kind": "p",
      "text": "**Decir qué te duele.** Hay tres formas muy comunes. **1)** *Ho mal di* + parte del cuerpo, sin artículo: *Ho mal di testa, mal di gola, mal di denti, mal di stomaco.* **2)** *Mi fa male* + lo que duele, con artículo: *Mi fa male la schiena. Mi fanno male i piedi.* Funciona como *piacere*: lo que duele es el sujeto, así que el verbo concuerda con él (*fa* / *fanno*). **3)** *Ho la* + síntoma: *Ho la febbre, la tosse, il raffreddore.*"
    },
    {
      "kind": "table",
      "head": [
        "Singular",
        "Plural",
        "Español"
      ],
      "rows": [
        [
          "*la testa*",
          "*le teste*",
          "cabeza"
        ],
        [
          "*la gola*",
          "*le gole*",
          "garganta"
        ],
        [
          "*lo stomaco*",
          "*gli stomaci*",
          "estómago"
        ],
        [
          "*la schiena*",
          "*le schiene*",
          "espalda"
        ],
        [
          "*la mano*",
          "*le mani*",
          "mano"
        ],
        [
          "*il braccio*",
          "*le braccia*",
          "brazo"
        ],
        [
          "*il piede*",
          "*i piedi*",
          "pie"
        ],
        [
          "*la gamba*",
          "*le gambe*",
          "pierna"
        ],
        [
          "*l'occhio*",
          "*gli occhi*",
          "ojo"
        ],
        [
          "*l'orecchio*",
          "*le orecchie*",
          "oreja / oído"
        ],
        [
          "*il dente*",
          "*i denti*",
          "diente"
        ]
      ]
    },
    {
      "kind": "p",
      "text": "**Lo que te dicen el médico y el farmacéutico** suele venir en forma de *Lei* (la que viste en la unidad 14): *Prenda una compressa due volte al giorno. Beva molta acqua. Riposi. Non faccia sforzi.* O con *deve*: *Deve restare a letto.* Para el horario: *prima / dopo i pasti* (antes / después de las comidas), *ogni otto ore* (cada ocho horas), *tre volte al giorno* (tres veces al día), *la mattina e la sera*."
    },
    {
      "kind": "p",
      "text": "**Indefinidos útiles:** *qualcosa* (algo), *niente* (nada), *qualcuno* (alguien), *nessuno* (nadie). Con *niente* y *nessuno* detrás del verbo el italiano pide *non* antes: *Non ho niente. Non c'è nessuno.* Si van antes del verbo, no hay *non*: *Nessuno risponde.* Para tranquilizar: *Non è niente di grave.* (no es nada grave)."
    },
    {
      "kind": "p",
      "text": "**Pedir ayuda.** *Aiuto!* · *Mi serve un medico.* (necesito un médico; *servire* funciona como *piacere*: *Mi servono le medicine*) · *Chiami un'ambulanza!* · *Dov'è il pronto soccorso?* (urgencias) · *Ho bisogno di aiuto.* En Italia el número único de emergencias es el *112*; la ambulancia (*118*) y la policía (*113*) también funcionan."
    }
  ],
  "transfer": "En español *me duele la cabeza*; en italiano lo más natural es *ho mal di testa* (sin artículo) o *mi fa male la testa* (con artículo). No digas *ho dolore la testa*. Con partes en plural el verbo cambia: *mi fanno male gli occhi*. Y con *niente / nessuno* después del verbo hace falta *non*: *non ho niente*, nunca *ho niente* (que significaría lo contrario de lo que quieres).",
  "examples": [
    {
      "it": "Ho mal di testa e ho la febbre.",
      "es": "Tengo dolor de cabeza y fiebre."
    },
    {
      "it": "Mi fanno male i piedi.",
      "es": "Me duelen los pies."
    },
    {
      "it": "Prenda una compressa dopo i pasti.",
      "es": "Tome una pastilla después de las comidas."
    },
    {
      "it": "Non è niente di grave.",
      "es": "No es nada grave."
    },
    {
      "it": "Chiami un'ambulanza, per favore!",
      "es": "¡Llame a una ambulancia, por favor!"
    },
    {
      "it": "Mi serve un medico: dov'è il pronto soccorso?",
      "es": "Necesito un médico: ¿dónde están las urgencias?"
    },
    {
      "it": "Ha qualcosa per la tosse?",
      "es": "¿Tiene algo para la tos?"
    }
  ],
  "notice": [
    {
      "type": "choice",
      "prompt": "«Mi fanno male le gambe.» ¿Qué le pasa?",
      "options": [
        "Le duelen las piernas",
        "Tiene fiebre",
        "Quiere comprar zapatos"
      ],
      "answer": 0,
      "why": "*Mi fanno male* + plural = me duelen."
    },
    {
      "type": "choice",
      "prompt": "«Prenda una compressa due volte al giorno.» ¿Qué debe hacer?",
      "options": [
        "Tomar una pastilla dos veces al día",
        "Tomar dos pastillas una sola vez",
        "Comprar dos cajas"
      ],
      "answer": 0,
      "why": "*Prenda* es la orden con *Lei*; *due volte al giorno* = dos veces al día."
    },
    {
      "type": "choice",
      "prompt": "«Non ho niente.» ¿Qué significa?",
      "options": [
        "No tengo nada",
        "Tengo algo",
        "No tengo a nadie"
      ],
      "answer": 0,
      "why": "*Non… niente* = nada."
    }
  ],
  "exercises": [
    {
      "type": "fill",
      "prompt": "Ho ___ di testa. (dolor)",
      "answers": [
        "mal"
      ],
      "why": "*Ho mal di testa*: *mal di* + parte del cuerpo, sin artículo."
    },
    {
      "type": "fill",
      "prompt": "Mi ___ male i piedi. (duelen)",
      "answers": [
        "fanno"
      ],
      "why": "Lo que duele es plural (*i piedi*): *mi fanno male*."
    },
    {
      "type": "fill",
      "prompt": "Mi fa male ___ schiena.",
      "answers": [
        "la"
      ],
      "why": "Con *mi fa male* la parte del cuerpo lleva artículo: *la schiena*."
    },
    {
      "type": "fill",
      "prompt": "Ho la ___. (fiebre)",
      "answers": [
        "febbre"
      ],
      "why": "*La febbre*, con doble *b*."
    },
    {
      "type": "fill",
      "prompt": "Ho la ___ e il raffreddore. (tos)",
      "answers": [
        "tosse"
      ],
      "why": "*La tosse*."
    },
    {
      "type": "fill",
      "prompt": "Mi ___ un medico. (necesito)",
      "answers": [
        "serve"
      ],
      "why": "*Servire* como *piacere*: *mi serve* + singular."
    },
    {
      "type": "fill",
      "prompt": "Mi ___ le medicine. (necesito, plural)",
      "answers": [
        "servono"
      ],
      "why": "*Le medicine* es plural: *mi servono*."
    },
    {
      "type": "fill",
      "prompt": "___ un'ambulanza! (Lei, chiamare, orden)",
      "answers": [
        "Chiami"
      ],
      "why": "Orden con *Lei*: *Chiami*."
    },
    {
      "type": "fill",
      "prompt": "___ molta acqua. (Lei, bere, orden)",
      "answers": [
        "Beva"
      ],
      "why": "Orden de *Lei* de *bere*: *Beva*."
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
      "prompt": "Non c'è ___. (nadie)",
      "answers": [
        "nessuno"
      ],
      "why": "*Non c'è nessuno*."
    },
    {
      "type": "fill",
      "prompt": "Ha ___ per la tosse? (algo)",
      "answers": [
        "qualcosa"
      ],
      "why": "*Qualcosa* = algo."
    },
    {
      "type": "fill",
      "prompt": "Mi fanno male ___ mani. (las)",
      "answers": [
        "le"
      ],
      "why": "*Mani* es femenino plural: *le mani*."
    },
    {
      "type": "fill",
      "prompt": "Una compressa tre volte al ___. (día)",
      "answers": [
        "giorno"
      ],
      "why": "*Tre volte al giorno*."
    },
    {
      "type": "choice",
      "prompt": "«Me duele la garganta»",
      "options": [
        "Ho mal di gola.",
        "Ho dolore la gola.",
        "Mi duole gola."
      ],
      "answer": 0,
      "why": "*Ho mal di gola* es la forma habitual."
    },
    {
      "type": "choice",
      "prompt": "«Tome una pastilla después de las comidas» (a usted)",
      "options": [
        "Prenda una compressa dopo i pasti.",
        "Prende una compressa dopo i pasti.",
        "Prendere compressa dopo pasti."
      ],
      "answer": 0,
      "why": "Orden con *Lei*: *prenda*."
    },
    {
      "type": "choice",
      "prompt": "«Llame a una ambulancia»",
      "options": [
        "Chiami un'ambulanza!",
        "Chiama una ambulanza!",
        "Chiamare ambulanza!"
      ],
      "answer": 0,
      "why": "A un desconocido: *Chiami*, con *Lei*."
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
      "why": "Detrás del verbo, *niente* pide *non*."
    },
    {
      "type": "choice",
      "prompt": "«Me duelen los ojos»",
      "options": [
        "Mi fanno male gli occhi.",
        "Mi fa male gli occhi.",
        "Mi fanno male l'occhio."
      ],
      "answer": 0,
      "why": "*Gli occhi* es plural: *mi fanno male*."
    },
    {
      "type": "choice",
      "prompt": "¿Qué número único de emergencias funciona en Italia?",
      "options": [
        "112",
        "911",
        "000"
      ],
      "answer": 0,
      "why": "En Italia y en toda la Unión Europea: *112*."
    }
  ]
};
