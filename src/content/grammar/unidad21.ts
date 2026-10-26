import type { Lesson } from "./types";

export const unidad21: Lesson = {
  "unit": "u21",
  "title": "Pronombres combinados",
  "situation": "Decir «te lo doy», «se lo digo» sin repetir objetos",
  "rule": [
    {
      "kind": "p",
      "text": "Cuando en la misma frase hay un pronombre indirecto (*a mí, a ti, a él…*) y uno directo (*lo, la, li, le*), se juntan **en este orden: indirecto + directo**. El indirecto cambia de forma: *mi → me*, *ti → te*, *ci → ce*, *vi → ve*, y *gli / le → glie-* (pegado al directo)."
    },
    {
      "kind": "table",
      "head": [
        "",
        "lo",
        "la",
        "li",
        "le",
        "ne"
      ],
      "rows": [
        [
          "a mí (*mi*)",
          "*me lo*",
          "*me la*",
          "*me li*",
          "*me le*",
          "*me ne*"
        ],
        [
          "a ti (*ti*)",
          "*te lo*",
          "*te la*",
          "*te li*",
          "*te le*",
          "*te ne*"
        ],
        [
          "a él / ella / usted (*gli, le*)",
          "*glielo*",
          "*gliela*",
          "*glieli*",
          "*gliele*",
          "*gliene*"
        ],
        [
          "a nosotros (*ci*)",
          "*ce lo*",
          "*ce la*",
          "*ce li*",
          "*ce le*",
          "*ce ne*"
        ],
        [
          "a ustedes (*vi*)",
          "*ve lo*",
          "*ve la*",
          "*ve li*",
          "*ve le*",
          "*ve ne*"
        ]
      ]
    },
    {
      "kind": "p",
      "text": "**Dónde van.** Antes del verbo conjugado: *Te lo do domani. Glielo dico.* Con infinitivo, el par se pega al final (el infinitivo pierde la *-e*): *Puoi spiegarmelo?* · *Voglio dirtelo.* Con el imperativo de *tu*, también pegado: *Dammelo!* (¡dámelo!, con *m* doble) · *Dimmelo!* Con *ho / ha*, *lo* y *la* se apostrofan y el participio concuerda: *Me l'ha data* (la chiave) · *Gliel'ho detta* (la verità)."
    },
    {
      "kind": "p",
      "text": "**Con ne:** *Hai dei biglietti? Sì, te ne do due.* · *Gliene parlo io.* (yo le hablo de eso). El par con *ne* termina en *-ne* y no cambia con el género."
    }
  ],
  "transfer": "En español el orden es el mismo (*se lo doy*, *te lo digo*), así que la idea es conocida; lo nuevo es que el italiano pega *glielo* en **una sola palabra** y que no distingue *le / les*: *glielo* sirve para él, ella, usted y también para ellos (*glielo do* = se lo doy). Y cuidado: no escribas *gli lo* ni *li ti*: el orden siempre es indirecto + directo.",
  "examples": [
    {
      "it": "Mi presti la penna? Sì, te la presto.",
      "es": "¿Me prestas la pluma? Sí, te la presto."
    },
    {
      "it": "Marco me l'ha dato ieri.",
      "es": "Marco me lo dio ayer."
    },
    {
      "it": "Hai detto la verità a Luca? Sì, gliel'ho detta.",
      "es": "¿Le dijiste la verdad a Luca? Sí, se la dije."
    },
    {
      "it": "Vuoi il mio numero? Te lo do subito.",
      "es": "¿Quieres mi número? Te lo doy enseguida."
    },
    {
      "it": "Puoi spiegarmelo ancora una volta?",
      "es": "¿Puedes explicármelo otra vez?"
    },
    {
      "it": "Hai dei biglietti? Sì, te ne do due.",
      "es": "¿Tienes entradas? Sí, te doy dos."
    }
  ],
  "notice": [
    {
      "type": "choice",
      "prompt": "«Te lo do domani.» ¿Qué dice?",
      "options": [
        "Te lo doy mañana",
        "Me lo das mañana",
        "Se lo doy a él mañana"
      ],
      "answer": 0,
      "why": "*Te lo* = a ti, lo."
    },
    {
      "type": "choice",
      "prompt": "«Glielo dico.» ¿A quién se lo dice?",
      "options": [
        "A él, a ella o a usted",
        "A mí",
        "A ti"
      ],
      "answer": 0,
      "why": "*Glielo* reúne *gli / le + lo*."
    },
    {
      "type": "choice",
      "prompt": "«Dammelo!» ¿Qué dice?",
      "options": [
        "¡Dámelo!",
        "¡Dáselo!",
        "¡Dímelo!"
      ],
      "answer": 0,
      "why": "*Dammelo* = *da'* + *me* + *lo*."
    }
  ],
  "exercises": [
    {
      "type": "fill",
      "prompt": "Mi presti la penna? Sì, ___ presto.",
      "answers": [
        "te la"
      ],
      "why": "A ti, la pluma: *te la*."
    },
    {
      "type": "fill",
      "prompt": "Vuoi il mio numero? ___ do subito. (a ti, el número)",
      "answers": [
        "Te lo"
      ],
      "why": "*Te lo*."
    },
    {
      "type": "fill",
      "prompt": "Hai detto la verità a Luca? Sì, ___ detta.",
      "answers": [
        "gliel'ho"
      ],
      "why": "*Gliela* + *ho* → *gliel'ho*; *detta* concuerda con *la verità*."
    },
    {
      "type": "fill",
      "prompt": "Ti piace la mia giacca? ___ presto domani. (a ti, la chaqueta)",
      "answers": [
        "Te la"
      ],
      "why": "*Te la presto*."
    },
    {
      "type": "fill",
      "prompt": "Il biglietto? ___ mando oggi. (a él)",
      "answers": [
        "Glielo"
      ],
      "why": "*Glielo mando*."
    },
    {
      "type": "fill",
      "prompt": "Le chiavi? ___ do domani. (a ustedes, las llaves)",
      "answers": [
        "Ve le"
      ],
      "why": "*Ve le do*."
    },
    {
      "type": "fill",
      "prompt": "Quante mele? ___ do tre. (a ti, de ellas)",
      "answers": [
        "Te ne"
      ],
      "why": "*Te ne do*."
    },
    {
      "type": "fill",
      "prompt": "Mi presti i libri? Sì, ___ presto. (a ti, los)",
      "answers": [
        "te li"
      ],
      "why": "*Te li presto*."
    },
    {
      "type": "choice",
      "prompt": "«Se lo digo» (a él)",
      "options": [
        "Glielo dico.",
        "Se lo dico.",
        "Lo gli dico."
      ],
      "answer": 0,
      "why": "*Gli + lo = glielo*."
    },
    {
      "type": "choice",
      "prompt": "«Te lo explico»",
      "options": [
        "Te lo spiego.",
        "Ti lo spiego.",
        "Lo ti spiego."
      ],
      "answer": 0,
      "why": "*Ti + lo = te lo*."
    },
    {
      "type": "choice",
      "prompt": "«¿Me lo das?»",
      "options": [
        "Me lo dai?",
        "Mi lo dai?",
        "Lo mi dai?"
      ],
      "answer": 0,
      "why": "*Mi + lo = me lo*."
    },
    {
      "type": "choice",
      "prompt": "«Dámelo»",
      "options": [
        "Dammelo!",
        "Dalomi!",
        "Damilo!"
      ],
      "answer": 0,
      "why": "*Da'* + *me* + *lo*."
    },
    {
      "type": "choice",
      "prompt": "La llave: «Marco me la dio ayer»",
      "options": [
        "Marco me l'ha data ieri.",
        "Marco me l'ha dato ieri.",
        "Marco mi l'ha data ieri."
      ],
      "answer": 0,
      "why": "*La chiave* es femenino: *data*."
    },
    {
      "type": "choice",
      "prompt": "«Se la damos a ella» (la torta)",
      "options": [
        "Gliela diamo.",
        "Se la diamo.",
        "Gli la diamo."
      ],
      "answer": 0,
      "why": "*Le + la = gliela*."
    },
    {
      "type": "choice",
      "prompt": "«Nos lo dicen»",
      "options": [
        "Ce lo dicono.",
        "Ci lo dicono.",
        "Lo ci dicono."
      ],
      "answer": 0,
      "why": "*Ci + lo = ce lo*."
    },
    {
      "type": "choice",
      "prompt": "«Te doy dos» (de ellas)",
      "options": [
        "Te ne do due.",
        "Ti ne do due.",
        "Te lo do due."
      ],
      "answer": 0,
      "why": "*Ti + ne = te ne*."
    }
  ]
};
