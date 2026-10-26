import type { Lesson } from "./types";

export const unidad23: Lesson = {
  "unit": "u23",
  "title": "Hipótesis: periodo ipotetico",
  "situation": "Hablar de posibilidades, sueños y consejos con «si»",
  "rule": [
    {
      "kind": "p",
      "text": "El **periodo ipotetico** une una condición (*se…*) con su consecuencia. Hay tres tipos según qué tan real sea la condición:"
    },
    {
      "kind": "table",
      "head": [
        "Tipo",
        "Estructura",
        "Ejemplo"
      ],
      "rows": [
        [
          "Real o posible",
          "*se* + presente → presente / futuro / imperativo",
          "*Se piove, resto a casa.* · *Se avrò tempo, verrò.*"
        ],
        [
          "Irreal o improbable (ahora)",
          "*se* + congiuntivo imperfetto → condizionale",
          "*Se avessi tempo, viaggerei.*"
        ],
        [
          "Irreal en el pasado (solo reconocer)",
          "*se* + trapassato congiuntivo → condizionale passato",
          "*Se avessi studiato, avrei superato l'esame.*"
        ]
      ]
    },
    {
      "kind": "p",
      "text": "El **congiuntivo imperfetto** es el que necesitas para el segundo tipo. Se forma con la raíz del infinitivo:"
    },
    {
      "kind": "table",
      "head": [
        "",
        "essere",
        "avere",
        "parlare",
        "prendere",
        "dormire"
      ],
      "rows": [
        [
          "io",
          "fossi",
          "avessi",
          "parlassi",
          "prendessi",
          "dormissi"
        ],
        [
          "tu",
          "fossi",
          "avessi",
          "parlassi",
          "prendessi",
          "dormissi"
        ],
        [
          "lui / lei",
          "fosse",
          "avesse",
          "parlasse",
          "prendesse",
          "dormisse"
        ],
        [
          "noi",
          "fossimo",
          "avessimo",
          "parlassimo",
          "prendessimo",
          "dormissimo"
        ],
        [
          "voi",
          "foste",
          "aveste",
          "parlaste",
          "prendeste",
          "dormiste"
        ],
        [
          "loro",
          "fossero",
          "avessero",
          "parlassero",
          "prendessero",
          "dormissero"
        ]
      ]
    },
    {
      "kind": "p",
      "text": "Raíces irregulares que conviene recordar: *fare → facessi*, *dare → dessi*, *stare → stessi*, *dire → dicessi*, *bere → bevessi*. *Potere, volere, dovere* y *andare* son regulares: *potessi, volessi, dovessi, andassi*. El **condizionale** de la consecuencia ya lo conoces (*viaggerei, comprerei, resterei*)."
    },
    {
      "kind": "p",
      "text": "**Consejos y deseos.** *Se fossi in te, andrei dal medico.* (si yo fuera tú, iría al médico) · *Se fossi in Lei, prenderei un taxi.* · *Magari avessi più tempo!* (¡ojalá tuviera más tiempo!)."
    }
  ],
  "transfer": "El segundo tipo se parece mucho al español: *si tuviera tiempo, viajaría* = *se avessi tempo, viaggerei*. La trampa es poner el condizionale después de *se*: *se avrei tempo* o *se avrebbe* están mal. El condizionale va solo en la consecuencia. En la lengua hablada también oirás *se avevo tempo, venivo*; es coloquial, y en el examen o por escrito se prefiere la forma que ves aquí.",
  "examples": [
    {
      "it": "Se piove, resto a casa.",
      "es": "Si llueve, me quedo en casa."
    },
    {
      "it": "Se avrò tempo, verrò con te.",
      "es": "Si tengo tiempo, iré contigo."
    },
    {
      "it": "Se avessi più tempo, viaggerei di più.",
      "es": "Si tuviera más tiempo, viajaría más."
    },
    {
      "it": "Se fossi ricco, comprerei una casa a Roma.",
      "es": "Si fuera rico, compraría una casa en Roma."
    },
    {
      "it": "Se fossi in te, andrei dal medico.",
      "es": "Si yo fuera tú, iría al médico."
    },
    {
      "it": "Se potessi, resterei qui.",
      "es": "Si pudiera, me quedaría aquí."
    }
  ],
  "notice": [
    {
      "type": "choice",
      "prompt": "«Se avessi tempo, viaggerei.» ¿Tiene tiempo?",
      "options": [
        "No, es una situación irreal",
        "Sí, tiene mucho",
        "Tendrá tiempo mañana"
      ],
      "answer": 0,
      "why": "*Se* + congiuntivo imperfetto expresa algo irreal o improbable."
    },
    {
      "type": "choice",
      "prompt": "«Se piove, resto a casa.» ¿Qué tipo de condición es?",
      "options": [
        "Una posibilidad real",
        "Algo imposible",
        "Algo que ya pasó"
      ],
      "answer": 0,
      "why": "*Se* + presente = posibilidad real."
    },
    {
      "type": "choice",
      "prompt": "«Se fossi in te, andrei.» ¿Qué hace?",
      "options": [
        "Da un consejo",
        "Da una orden",
        "Cuenta un hecho"
      ],
      "answer": 0,
      "why": "*Se fossi in te…* es la fórmula del consejo."
    }
  ],
  "exercises": [
    {
      "type": "fill",
      "prompt": "Se ___ tempo, viaggerei. (io, avere)",
      "answers": [
        "avessi"
      ],
      "why": "*Avere → avessi*."
    },
    {
      "type": "fill",
      "prompt": "Se ___ ricco, comprerei una casa. (io, essere)",
      "answers": [
        "fossi"
      ],
      "why": "*Essere → fossi*."
    },
    {
      "type": "fill",
      "prompt": "Se tu ___ qui, andremmo al cinema. (essere)",
      "answers": [
        "fossi"
      ],
      "why": "*Essere → fossi* con *tu*."
    },
    {
      "type": "fill",
      "prompt": "Se ___ in te, andrei dal medico. (io, essere)",
      "answers": [
        "fossi"
      ],
      "why": "*Se fossi in te*."
    },
    {
      "type": "fill",
      "prompt": "Se potessi, ___ qui. (io, restare, condizionale)",
      "answers": [
        "resterei"
      ],
      "why": "Consecuencia: condizionale, *resterei*."
    },
    {
      "type": "fill",
      "prompt": "Se avessi tempo, ___ di più. (io, viaggiare, condizionale)",
      "answers": [
        "viaggerei"
      ],
      "why": "*Viaggiare* → *viaggerei* (pierde la *i*)."
    },
    {
      "type": "fill",
      "prompt": "Se lui ___ studiare, passerebbe l'esame. (volere)",
      "answers": [
        "volesse"
      ],
      "why": "*Volere → volesse*."
    },
    {
      "type": "fill",
      "prompt": "Se noi ___ più soldi, compreremmo una macchina. (avere)",
      "answers": [
        "avessimo"
      ],
      "why": "*Avere → avessimo*."
    },
    {
      "type": "fill",
      "prompt": "Se voi ___ qui, saremmo contenti. (essere)",
      "answers": [
        "foste"
      ],
      "why": "*Essere → foste*."
    },
    {
      "type": "fill",
      "prompt": "Se tu ___ sport, staresti meglio. (fare)",
      "answers": [
        "facessi"
      ],
      "why": "*Fare → facessi*."
    },
    {
      "type": "fill",
      "prompt": "Se loro ___ tempo, verrebbero. (avere)",
      "answers": [
        "avessero"
      ],
      "why": "*Avere → avessero*."
    },
    {
      "type": "choice",
      "prompt": "«Si tuviera tiempo, viajaría»",
      "options": [
        "Se avessi tempo, viaggerei.",
        "Se avrei tempo, viaggerei.",
        "Se avessi tempo, viaggio."
      ],
      "answer": 0,
      "why": "*Se* + congiuntivo imperfetto + condizionale."
    },
    {
      "type": "choice",
      "prompt": "«Si yo fuera tú, iría al médico»",
      "options": [
        "Se fossi in te, andrei dal medico.",
        "Se sarei in te, andrei dal medico.",
        "Se fossi in te, andare dal medico."
      ],
      "answer": 0,
      "why": "Nunca condizionale después de *se*."
    },
    {
      "type": "choice",
      "prompt": "«Si llueve, me quedo en casa» (posibilidad real)",
      "options": [
        "Se piove, resto a casa.",
        "Se piovesse, resto a casa.",
        "Se pioverebbe, resto a casa."
      ],
      "answer": 0,
      "why": "Real: *se* + presente."
    },
    {
      "type": "choice",
      "prompt": "«Si pudiera, me quedaría»",
      "options": [
        "Se potessi, resterei.",
        "Se posso, resterei.",
        "Se potessi, resto."
      ],
      "answer": 0,
      "why": "Irreal: congiuntivo imperfetto + condizionale."
    },
    {
      "type": "choice",
      "prompt": "«Si estudiaras, aprobarías»",
      "options": [
        "Se studiassi, passeresti l'esame.",
        "Se studi, passeresti l'esame.",
        "Se studiassi, passi l'esame."
      ],
      "answer": 0,
      "why": "Irreal: *studiassi* + *passeresti*."
    }
  ]
};
