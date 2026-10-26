import type { Lesson } from "./types";

export const unidad18: Lesson = {
  "unit": "u18",
  "title": "Teléfono, mensajes y mails",
  "situation": "Hablar por teléfono y escribir mensajes formales e informales",
  "rule": [
    {
      "kind": "p",
      "text": "**Al teléfono.** Se contesta con *Pronto?* y las frases son casi siempre las mismas:"
    },
    {
      "kind": "table",
      "head": [
        "Situación",
        "Italiano"
      ],
      "rows": [
        [
          "Contestar",
          "*Pronto?*"
        ],
        [
          "Presentarte",
          "*Sono Laura Mora.*"
        ],
        [
          "Pedir hablar con alguien",
          "*Posso parlare con Anna?*"
        ],
        [
          "Pedir que esperen",
          "*Un attimo, per favore.* / *Resti in linea.*"
        ],
        [
          "No oír bien",
          "*Non La sento bene. Può ripetere?*"
        ],
        [
          "Dejar un recado",
          "*Può dirle che ho chiamato?*"
        ],
        [
          "Despedirte",
          "*Grazie, arrivederci.* / *Ciao, a dopo!*"
        ]
      ]
    },
    {
      "kind": "p",
      "text": "**Mensajes y mails: formal (Lei) o informal (tu).** Elige el registro desde la primera línea y no lo mezcles:"
    },
    {
      "kind": "table",
      "head": [
        "",
        "Formal (*Lei*)",
        "Informal (*tu*)"
      ],
      "rows": [
        [
          "Saludo",
          "*Gentile signora Rossi,*",
          "*Ciao Marco,* / *Caro Marco,*"
        ],
        [
          "Motivo",
          "*Le scrivo per chiedere…*",
          "*Ti scrivo per chiederti…*"
        ],
        [
          "Adjunto",
          "*In allegato trova il documento.*",
          "*Ti allego il documento.*"
        ],
        [
          "Despedida",
          "*Cordiali saluti*",
          "*A presto* / *Un abbraccio*"
        ]
      ]
    },
    {
      "kind": "p",
      "text": "**Dos palabras muy útiles.** *Per* + infinitivo = para: *Ti chiamo per chiedere un'informazione.* *Tra* (o *fra*) + tiempo = dentro de: *Ti richiamo tra dieci minuti. Arrivo tra mezz'ora.* Compáralo con *fa* (hace), que mira hacia atrás: *L'ho chiamato dieci minuti fa.*"
    },
    {
      "kind": "p",
      "text": "**Recíproco.** Para hablar de cosas que se hacen entre dos: *ci sentiamo* (nos hablamos), *ci vediamo* (nos vemos), *ci scriviamo* (nos escribimos). *Ci sentiamo domani!* es una despedida muy común."
    }
  ],
  "transfer": "En español contestas *aló*, *bueno* o *diga*; en italiano es *Pronto?* (que también significa *listo*). Con *tra* (dentro de) no uses *in*: *tra dieci minuti*, no *in dieci minuti* (eso diría cuánto tarda algo). *Telefonare* lleva *a* y el pronombre indirecto (*gli telefono*); *chiamare* lleva pronombre directo (*lo chiamo*). Y en un mail formal, *Le / Suo / Sua* se escriben con mayúscula.",
  "examples": [
    {
      "it": "Pronto? Sono Laura. Posso parlare con Marco?",
      "es": "¿Aló? Soy Laura. ¿Puedo hablar con Marco?"
    },
    {
      "it": "Resti in linea, per favore.",
      "es": "Espere en la línea, por favor."
    },
    {
      "it": "Non La sento bene: può ripetere?",
      "es": "No lo oigo bien: ¿puede repetir?"
    },
    {
      "it": "Ti richiamo tra dieci minuti.",
      "es": "Te vuelvo a llamar dentro de diez minutos."
    },
    {
      "it": "Le scrivo per chiedere un'informazione.",
      "es": "Le escribo para pedir una información."
    },
    {
      "it": "Ci sentiamo domani, ciao!",
      "es": "¡Nos hablamos mañana, chao!"
    }
  ],
  "notice": [
    {
      "type": "choice",
      "prompt": "«Pronto? Chi parla?» ¿Qué pasa?",
      "options": [
        "Contestan el teléfono y preguntan quién llama",
        "Piden la cuenta en un restaurante",
        "Se despiden"
      ],
      "answer": 0,
      "why": "*Pronto* es la forma de contestar; *chi parla?* = ¿quién habla?"
    },
    {
      "type": "choice",
      "prompt": "«Ti richiamo tra dieci minuti.» ¿Cuándo?",
      "options": [
        "Dentro de diez minutos",
        "Hace diez minutos",
        "Durante diez minutos"
      ],
      "answer": 0,
      "why": "*Tra* + tiempo = dentro de."
    },
    {
      "type": "choice",
      "prompt": "«Gentile signora Rossi, Le scrivo per…» ¿Qué registro es?",
      "options": [
        "Formal",
        "Informal",
        "Con un amigo cercano"
      ],
      "answer": 0,
      "why": "*Gentile* y *Le* marcan el trato de *Lei*."
    }
  ],
  "exercises": [
    {
      "type": "fill",
      "prompt": "___? Sono Laura. (al contestar el teléfono)",
      "answers": [
        "Pronto"
      ],
      "why": "Se contesta con *Pronto?*"
    },
    {
      "type": "fill",
      "prompt": "___ parlare con Anna? (puedo)",
      "answers": [
        "Posso"
      ],
      "why": "*Posso parlare con…?*"
    },
    {
      "type": "fill",
      "prompt": "Un ___, per favore. (momento)",
      "answers": [
        "attimo"
      ],
      "why": "*Un attimo*."
    },
    {
      "type": "fill",
      "prompt": "___ in linea, per favore. (Lei, restare)",
      "answers": [
        "Resti"
      ],
      "why": "Orden con *Lei*: *Resti*."
    },
    {
      "type": "fill",
      "prompt": "Non La ___ bene. (oigo)",
      "answers": [
        "sento"
      ],
      "why": "*Sentire* con *io*: *sento*."
    },
    {
      "type": "fill",
      "prompt": "Ti richiamo ___ dieci minuti. (dentro de)",
      "answers": [
        "tra",
        "fra"
      ],
      "why": "*Tra / fra* + tiempo = dentro de."
    },
    {
      "type": "fill",
      "prompt": "Ti scrivo ___ chiederti un favore. (para)",
      "answers": [
        "per"
      ],
      "why": "*Per* + infinitivo = para."
    },
    {
      "type": "fill",
      "prompt": "Le scrivo ___ prenotare una camera. (para)",
      "answers": [
        "per"
      ],
      "why": "*Per* + infinitivo."
    },
    {
      "type": "fill",
      "prompt": "Ci ___ domani! (nos hablamos)",
      "answers": [
        "sentiamo"
      ],
      "why": "*Ci sentiamo*."
    },
    {
      "type": "fill",
      "prompt": "Ci ___ alle otto. (nos vemos)",
      "answers": [
        "vediamo"
      ],
      "why": "*Ci vediamo*."
    },
    {
      "type": "fill",
      "prompt": "Cordiali ___. (saludos)",
      "answers": [
        "saluti"
      ],
      "why": "*Cordiali saluti* es la despedida formal."
    },
    {
      "type": "fill",
      "prompt": "In ___ trova il documento. (adjunto)",
      "answers": [
        "allegato"
      ],
      "why": "*In allegato*."
    },
    {
      "type": "fill",
      "prompt": "Arrivo ___ mezz'ora. (dentro de)",
      "answers": [
        "tra",
        "fra"
      ],
      "why": "*Tra mezz'ora*."
    },
    {
      "type": "fill",
      "prompt": "Posso lasciare un ___? (recado)",
      "answers": [
        "messaggio"
      ],
      "why": "*Un messaggio*."
    },
    {
      "type": "choice",
      "prompt": "Contestas el teléfono:",
      "options": [
        "Pronto?",
        "Arrivederci?",
        "Buonanotte?"
      ],
      "answer": 0,
      "why": "*Pronto?*"
    },
    {
      "type": "choice",
      "prompt": "Despedida de un mail formal:",
      "options": [
        "Cordiali saluti",
        "Un abbraccio",
        "Ciao ciao"
      ],
      "answer": 0,
      "why": "*Cordiali saluti*."
    },
    {
      "type": "choice",
      "prompt": "Saludo para un amigo en un mensaje:",
      "options": [
        "Caro Marco,",
        "Gentile signor Marco,",
        "Egregio Marco,"
      ],
      "answer": 0,
      "why": "*Caro Marco* es informal."
    },
    {
      "type": "choice",
      "prompt": "«Te llamo dentro de una hora»",
      "options": [
        "Ti chiamo tra un'ora.",
        "Ti chiamo da un'ora.",
        "Ti chiamo fa un'ora."
      ],
      "answer": 0,
      "why": "*Tra un'ora* = dentro de una hora."
    },
    {
      "type": "choice",
      "prompt": "«Le escribo para pedir información»",
      "options": [
        "Le scrivo per chiedere un'informazione.",
        "Le scrivo a chiedere informazione.",
        "Le scrivo di chiedere informazione."
      ],
      "answer": 0,
      "why": "*Per* + infinitivo."
    }
  ]
};
