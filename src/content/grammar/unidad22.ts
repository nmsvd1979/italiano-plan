import type { Lesson } from "./types";

export const unidad22: Lesson = {
  "unit": "u22",
  "title": "Congiuntivo presente en uso",
  "situation": "Expresar opiniones, deseos y dudas",
  "rule": [
    {
      "kind": "p",
      "text": "El **congiuntivo presente** se usa después de *che* cuando expresas una **opinión, un deseo, una duda o una emoción**: *Penso che sia vero.* · *Spero che tu stia bene.* · *Voglio che tu venga.* · *Dubito che arrivi.* · *Sono contento che tu sia qui.* También después de expresiones impersonales como *è importante che* y *bisogna che*."
    },
    {
      "kind": "table",
      "head": [
        "",
        "parlare",
        "prendere",
        "dormire",
        "essere",
        "avere"
      ],
      "rows": [
        [
          "che io",
          "parli",
          "prenda",
          "dorma",
          "sia",
          "abbia"
        ],
        [
          "che tu",
          "parli",
          "prenda",
          "dorma",
          "sia",
          "abbia"
        ],
        [
          "che lui / lei / Lei",
          "parli",
          "prenda",
          "dorma",
          "sia",
          "abbia"
        ],
        [
          "che noi",
          "parliamo",
          "prendiamo",
          "dormiamo",
          "siamo",
          "abbiamo"
        ],
        [
          "che voi",
          "parliate",
          "prendiate",
          "dormiate",
          "siate",
          "abbiate"
        ],
        [
          "che loro",
          "parlino",
          "prendano",
          "dormano",
          "siano",
          "abbiano"
        ]
      ]
    },
    {
      "kind": "p",
      "text": "Observa que *io, tu* y *lui / lei* son **iguales**: por eso a veces conviene decir el sujeto (*che tu venga*). Verbos irregulares muy usados:"
    },
    {
      "kind": "table",
      "head": [
        "Infinitivo",
        "che io / tu / lui",
        "che loro"
      ],
      "rows": [
        [
          "*andare*",
          "vada",
          "vadano"
        ],
        [
          "*fare*",
          "faccia",
          "facciano"
        ],
        [
          "*venire*",
          "venga",
          "vengano"
        ],
        [
          "*potere*",
          "possa",
          "possano"
        ],
        [
          "*volere*",
          "voglia",
          "vogliano"
        ],
        [
          "*dovere*",
          "debba",
          "debbano"
        ],
        [
          "*stare*",
          "stia",
          "stiano"
        ],
        [
          "*dire*",
          "dica",
          "dicano"
        ]
      ]
    },
    {
      "kind": "p",
      "text": "**Cuándo NO se usa.** Si el sujeto es el mismo en las dos partes, se usa *di* + infinitivo: *Penso di avere ragione.* (pienso que tengo razón) · *Spero di venire.* (espero venir). Y en las respuestas cortas: *Credo di sì. Credo di no.*"
    },
    {
      "kind": "p",
      "text": "**Cuándo SÍ se usa.** *Penso / credo / mi sembra che* (opinión) · *spero / voglio / preferisco che* (deseo) · *dubito / non sono sicuro che* (duda) · *sono contento che* (emoción) · *è importante / è meglio / bisogna che* (impersonal). Para algo que sabes con seguridad usa el indicativo: *So che Marco è in ritardo.*"
    }
  ],
  "transfer": "En español el subjuntivo también existe, pero con *creer que* y *pensar que* afirmativos usamos el indicativo (*creo que viene*); en italiano esas frases piden congiuntivo: *credo che venga*. Con *dudar que* y *esperar que* se parece al español. Ojo: *io, tu* y *lui* tienen la misma forma (*che io parli, che tu parli, che lui parli*); en español solo coinciden *yo* y *él*.",
  "examples": [
    {
      "it": "Penso che Marco sia in ritardo.",
      "es": "Pienso que Marco está atrasado."
    },
    {
      "it": "Credo che questo ristorante sia buono.",
      "es": "Creo que este restaurante es bueno."
    },
    {
      "it": "Spero che tu stia bene.",
      "es": "Espero que estés bien."
    },
    {
      "it": "Voglio che tu venga con noi.",
      "es": "Quiero que vengas con nosotros."
    },
    {
      "it": "È importante che voi parliate piano.",
      "es": "Es importante que ustedes hablen despacio."
    },
    {
      "it": "Penso di avere ragione.",
      "es": "Creo que tengo razón."
    }
  ],
  "notice": [
    {
      "type": "choice",
      "prompt": "«Credo che Anna abbia ragione.» ¿Qué verbo está en congiuntivo?",
      "options": [
        "credo",
        "abbia",
        "ragione"
      ],
      "answer": 1,
      "why": "*Abbia* es el congiuntivo de *avere*."
    },
    {
      "type": "choice",
      "prompt": "«Penso che sia vero.» ¿Qué expresa?",
      "options": [
        "Una opinión",
        "Una orden",
        "Un hecho seguro"
      ],
      "answer": 0,
      "why": "*Penso che* + congiuntivo = opinión."
    },
    {
      "type": "choice",
      "prompt": "«Voglio che tu venga.» ¿Quién viene?",
      "options": [
        "Tú",
        "Yo",
        "Nadie"
      ],
      "answer": 0,
      "why": "*Che tu venga*: el que viene eres tú."
    }
  ],
  "exercises": [
    {
      "type": "fill",
      "prompt": "Penso che Marco ___ in ritardo. (essere)",
      "answers": [
        "sia"
      ],
      "why": "*Essere → sia*."
    },
    {
      "type": "fill",
      "prompt": "Credo che lei ___ ragione. (avere)",
      "answers": [
        "abbia"
      ],
      "why": "*Avere → abbia*."
    },
    {
      "type": "fill",
      "prompt": "Spero che tu ___ bene. (stare)",
      "answers": [
        "stia"
      ],
      "why": "*Stare → stia*."
    },
    {
      "type": "fill",
      "prompt": "Voglio che tu ___ con noi. (venire)",
      "answers": [
        "venga"
      ],
      "why": "*Venire → venga*."
    },
    {
      "type": "choice",
      "prompt": "«Penso che loro siano a casa.» ¿Qué verbo está en congiuntivo?",
      "options": [
        "penso",
        "siano",
        "casa"
      ],
      "answer": 1,
      "why": "*Siano* es el congiuntivo de *essere* (loro)."
    },
    {
      "type": "choice",
      "prompt": "«Credo che voi parliate molto bene.» ¿Qué significa?",
      "options": [
        "Creo que ustedes hablan muy bien.",
        "Creo que ustedes hablaron muy bien.",
        "Quiero que ustedes hablen muy bien."
      ],
      "answer": 0,
      "why": "*Credo che* + congiuntivo expresa una opinión: creo que hablan muy bien."
    },
    {
      "type": "choice",
      "prompt": "«Spero che Anna arrivi presto.» ¿Qué significa?",
      "options": [
        "Anna llegó pronto.",
        "Espero que Anna llegue pronto.",
        "Anna llega pronto."
      ],
      "answer": 1,
      "why": "*Spero che* introduce un deseo: espero que llegue."
    },
    {
      "type": "choice",
      "prompt": "«È importante che noi arriviamo in tempo.» ¿Qué expresa?",
      "options": [
        "Algo que se considera importante",
        "Un recuerdo del pasado",
        "Una pregunta"
      ],
      "answer": 0,
      "why": "*È importante che* + congiuntivo = es importante que."
    },
    {
      "type": "choice",
      "prompt": "«Credo che lui dica la verità.» ¿Cuál es el infinitivo de *dica*?",
      "options": [
        "dare",
        "dividere",
        "dire"
      ],
      "answer": 2,
      "why": "*Dica* es el congiuntivo de *dire*."
    },
    {
      "type": "choice",
      "prompt": "«Voglio che loro restino qui.» ¿Qué quiere la persona?",
      "options": [
        "Que ellos se queden aquí",
        "Quedarse ella aquí",
        "Que ellos se vayan"
      ],
      "answer": 0,
      "why": "*Voglio che* + congiuntivo: quiero que se queden."
    },
    {
      "type": "fill",
      "prompt": "Penso ___ avere ragione. (mismo sujeto)",
      "answers": [
        "di"
      ],
      "why": "Mismo sujeto: *di* + infinitivo."
    },
    {
      "type": "choice",
      "prompt": "«Credo che lei vada a Roma.» ¿Cuál es el infinitivo de *vada*?",
      "options": [
        "vedere",
        "andare",
        "avere"
      ],
      "answer": 1,
      "why": "*Vada* es el congiuntivo de *andare*."
    },
    {
      "type": "fill",
      "prompt": "Non credo che lui ___ venire. (potere)",
      "answers": [
        "possa"
      ],
      "why": "*Potere → possa*."
    },
    {
      "type": "choice",
      "prompt": "«Creo que Marco viene»",
      "options": [
        "Credo che Marco venga.",
        "Credo che Marco vieni.",
        "Credo che Marco venire."
      ],
      "answer": 0,
      "why": "*Credo che* pide congiuntivo: *venga*."
    },
    {
      "type": "choice",
      "prompt": "«Espero que vengas»",
      "options": [
        "Spero che tu venga.",
        "Spero che tu vieni.",
        "Spero tu venire."
      ],
      "answer": 0,
      "why": "*Spero che* + congiuntivo."
    },
    {
      "type": "choice",
      "prompt": "«Creo que tengo razón»",
      "options": [
        "Credo di avere ragione.",
        "Credo che avere ragione.",
        "Credo di ho ragione."
      ],
      "answer": 0,
      "why": "Mismo sujeto: *di* + infinitivo."
    },
    {
      "type": "choice",
      "prompt": "«Dudo que sea verdad»",
      "options": [
        "Dubito che sia vero.",
        "Dubito che è vero.",
        "Dubito che essere vero."
      ],
      "answer": 0,
      "why": "*Dubito che* + congiuntivo."
    },
    {
      "type": "choice",
      "prompt": "«Es importante que estudies»",
      "options": [
        "È importante che tu studi.",
        "È importante che tu studii.",
        "È importante tu studiare."
      ],
      "answer": 0,
      "why": "*Studiare → studi* (una sola *i*)."
    }
  ]
};
