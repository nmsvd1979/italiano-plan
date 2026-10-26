import type { Lesson } from "./types";

export const unidad17: Lesson = {
  "unit": "u17",
  "title": "Casa, alquiler y trámites",
  "situation": "Buscar un departamento / apartamento, resolver problemas de la casa y hacer un trámite",
  "rule": [
    {
      "kind": "p",
      "text": "**Preguntar por un alquiler (arriendo).** *Cerco un appartamento in affitto.* · *Quanto costa l'affitto al mese?* · *Le spese sono incluse?* (los gastos) · *È arredato?* (¿está amueblado?) · *Posso vederlo?* En Italia suele pedirse un *contratto* (contrato) y una *caparra* (depósito de garantía)."
    },
    {
      "kind": "p",
      "text": "**Los pisos usan ordinales.** Concuerdan en género y número como un adjetivo:"
    },
    {
      "kind": "table",
      "head": [
        "Número",
        "Ordinal",
        "Ejemplo"
      ],
      "rows": [
        [
          "1",
          "*primo*",
          "*Abito al primo piano.*"
        ],
        [
          "2",
          "*secondo*",
          "*Il secondo piano è libero.*"
        ],
        [
          "3",
          "*terzo*",
          "*Abito al terzo piano.*"
        ],
        [
          "4",
          "*quarto*",
          "*La quarta porta a destra.*"
        ],
        [
          "5",
          "*quinto*",
          "*Siamo al quinto piano.*"
        ],
        [
          "6 a 10",
          "*sesto, settimo, ottavo, nono, decimo*",
          "*Il decimo piano.*"
        ]
      ]
    },
    {
      "kind": "p",
      "text": "La planta baja es *il piano terra*. En Italia el primer piso (*primo piano*) está un nivel **sobre** la calle, no a nivel de calle."
    },
    {
      "kind": "p",
      "text": "**Relativo che.** Une dos frases y no cambia nunca (sirve para personas y cosas, sujeto u objeto): *L'appartamento che ho visto è luminoso.* · *La persona che abita sopra è simpatica.* Para lugares se usa *dove*: *Il quartiere dove abito è tranquillo.*"
    },
    {
      "kind": "p",
      "text": "**Problemas en la casa.** *Non funziona il riscaldamento.* (no funciona la calefacción) · *Manca l'acqua calda.* (falta agua caliente) · *Mancano le chiavi.* (faltan las llaves). *Mancare* funciona como *piacere*: lo que falta es el sujeto, y el verbo concuerda con él. También: *Il rubinetto perde.* (la llave gotea) · *Si è rotto il frigorifero.* (se rompió el refrigerador)."
    },
    {
      "kind": "p",
      "text": "**Trámites.** *Ho bisogno di un documento.* · *Per il contratto ci vuole il codice fiscale.* / *ci vogliono due documenti.* (*ci vuole* + singular, *ci vogliono* + plural: hace falta) · *Devo compilare il modulo e firmare qui.* · *Vorrei prendere un appuntamento.* (sacar una cita / hora)."
    }
  ],
  "transfer": "En español *piso* puede ser un departamento o una planta; en italiano, *piano* es solo la planta y el departamento es *l'appartamento*. *Affitto* es el alquiler (arriendo) que pagas; *affittare* significa tanto tomar en alquiler como dar en alquiler, y el contexto lo aclara. Y *che* no tiene versiones como *el cual* o *quien* a este nivel: siempre *che*. Con *ci vuole / ci vogliono* no uses *volere* personal: no es *voglio*, es lo que hace falta.",
  "examples": [
    {
      "it": "Cerco un appartamento in affitto vicino al centro.",
      "es": "Busco un departamento / apartamento en alquiler cerca del centro."
    },
    {
      "it": "L'affitto è seicento euro al mese, spese incluse.",
      "es": "El alquiler son seiscientos euros al mes, gastos incluidos."
    },
    {
      "it": "Abito al terzo piano, ma non c'è l'ascensore.",
      "es": "Vivo en el tercer piso, pero no hay ascensor."
    },
    {
      "it": "Il riscaldamento non funziona: può mandare qualcuno?",
      "es": "La calefacción no funciona: ¿puede enviar a alguien?"
    },
    {
      "it": "L'appartamento che ho visto ieri è luminoso.",
      "es": "El departamento / apartamento que vi ayer es luminoso."
    },
    {
      "it": "Per il contratto ci vogliono due documenti e il codice fiscale.",
      "es": "Para el contrato hacen falta dos documentos y el código fiscal."
    }
  ],
  "notice": [
    {
      "type": "choice",
      "prompt": "«Abito al quinto piano.» ¿Dónde vive?",
      "options": [
        "En el quinto piso",
        "En la quinta casa",
        "Cinco pisos más abajo"
      ],
      "answer": 0,
      "why": "*Al quinto piano* = en el quinto piso."
    },
    {
      "type": "choice",
      "prompt": "«Manca l'acqua calda.» ¿Qué pasa?",
      "options": [
        "No hay agua caliente",
        "Hay mucha agua caliente",
        "El agua está cara"
      ],
      "answer": 0,
      "why": "*Manca* = falta."
    },
    {
      "type": "choice",
      "prompt": "«Ci vogliono due settimane.» ¿Qué dice?",
      "options": [
        "Hacen falta dos semanas",
        "Quiere dos semanas",
        "Hay dos semanas"
      ],
      "answer": 0,
      "why": "*Ci vogliono* + plural = hacen falta."
    }
  ],
  "exercises": [
    {
      "type": "fill",
      "prompt": "Abito al ___ piano. (tercer)",
      "answers": [
        "terzo"
      ],
      "why": "*Terzo piano*."
    },
    {
      "type": "fill",
      "prompt": "Il negozio è al ___ piano. (primer)",
      "answers": [
        "primo"
      ],
      "why": "*Primo piano*."
    },
    {
      "type": "fill",
      "prompt": "Abito al ___ piano. (5.º)",
      "answers": [
        "quinto"
      ],
      "why": "*Quinto piano*."
    },
    {
      "type": "fill",
      "prompt": "L'ufficio è al piano ___. (planta baja)",
      "answers": [
        "terra"
      ],
      "why": "*Piano terra*."
    },
    {
      "type": "fill",
      "prompt": "L'appartamento ___ ho visto è bello. (que)",
      "answers": [
        "che"
      ],
      "why": "*Che* une las dos frases."
    },
    {
      "type": "fill",
      "prompt": "Il quartiere ___ abito è tranquillo. (donde)",
      "answers": [
        "dove"
      ],
      "why": "Para un lugar: *dove*."
    },
    {
      "type": "fill",
      "prompt": "Il riscaldamento non ___. (funciona)",
      "answers": [
        "funziona"
      ],
      "why": "*Funzionare → funziona*."
    },
    {
      "type": "fill",
      "prompt": "___ l'acqua calda. (falta)",
      "answers": [
        "Manca"
      ],
      "why": "Lo que falta es singular: *manca*."
    },
    {
      "type": "fill",
      "prompt": "___ le chiavi. (faltan)",
      "answers": [
        "Mancano"
      ],
      "why": "Lo que falta es plural: *mancano*."
    },
    {
      "type": "fill",
      "prompt": "Per il contratto ___ due documenti. (hacen falta)",
      "answers": [
        "ci vogliono"
      ],
      "why": "Plural: *ci vogliono*."
    },
    {
      "type": "fill",
      "prompt": "Per il contratto ___ il codice fiscale. (hace falta)",
      "answers": [
        "ci vuole"
      ],
      "why": "Singular: *ci vuole*."
    },
    {
      "type": "fill",
      "prompt": "Ho ___ di un documento. (necesidad)",
      "answers": [
        "bisogno"
      ],
      "why": "*Avere bisogno di* = necesitar."
    },
    {
      "type": "fill",
      "prompt": "Devo ___ il modulo. (rellenar)",
      "answers": [
        "compilare"
      ],
      "why": "*Compilare il modulo*."
    },
    {
      "type": "fill",
      "prompt": "Devo ___ qui. (firmar)",
      "answers": [
        "firmare"
      ],
      "why": "*Firmare*."
    },
    {
      "type": "fill",
      "prompt": "Quanto costa l'___ al mese? (alquiler)",
      "answers": [
        "affitto"
      ],
      "why": "*L'affitto*."
    },
    {
      "type": "fill",
      "prompt": "L'appartamento è ___? (amueblado)",
      "answers": [
        "arredato",
        "ammobiliato"
      ],
      "why": "*Arredato* o *ammobiliato*."
    },
    {
      "type": "choice",
      "prompt": "«Vivo en el segundo piso»",
      "options": [
        "Abito al secondo piano.",
        "Abito nel secondo piano.",
        "Abito a secondo piano."
      ],
      "answer": 0,
      "why": "*Al secondo piano*: *a + il*."
    },
    {
      "type": "choice",
      "prompt": "«La casa que busco es grande»",
      "options": [
        "La casa che cerco è grande.",
        "La casa chi cerco è grande.",
        "La casa quale cerco è grande."
      ],
      "answer": 0,
      "why": "*Che* no cambia."
    },
    {
      "type": "choice",
      "prompt": "«No funciona la lavadora»",
      "options": [
        "Non funziona la lavatrice.",
        "Non funzionano la lavatrice.",
        "Non è funziona la lavatrice."
      ],
      "answer": 0,
      "why": "*La lavatrice* es singular: *funziona*."
    },
    {
      "type": "choice",
      "prompt": "«Quisiera sacar una cita»",
      "options": [
        "Vorrei prendere un appuntamento.",
        "Vorrei prendere un'appuntamento.",
        "Voglio fare appuntamento."
      ],
      "answer": 0,
      "why": "*Appuntamento* es masculino: *un appuntamento*."
    }
  ]
};
