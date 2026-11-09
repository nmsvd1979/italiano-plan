import type { WritingExtension } from "./writing";

// Formas meta y ampliación opcional de las semanas de las fases 2 a 6 (docs/v2/plan-b1/01). Va aparte para no tocar las
// consignas originales: `getWriting` las junta con su consigna por clave de semana (`u05`, `u05#B`) y una consigna que ya trae
// sus propios `mustInclude` o `extend` los conserva. El modelo ampliado repite el modelo original y suma frases.
export interface WritingExtras {
  mustInclude?: string[][];
  extend: WritingExtension;
}

export const WRITING_EXTRAS: Record<string, WritingExtras> = {
  u05: {
    mustInclude: [["vado a"], ["vado da"]],
    extend: {
      prompt: "Agrega dos frases: cómo vas a la universidad o al supermercado y a qué hora sales de casa.",
      minWords: 32,
      model: "Vado al lavoro in autobus. Il sabato vado da Marco a piedi. Domani vado a Firenze in treno e scendo alla stazione centrale. Per andare all'università prendo la metro. Esco di casa alle otto e arrivo alle nove.",
      mustInclude: [["esco"], ["prendo"]],
    },
  },
  "u05#B": {
    extend: {
      prompt: "Agrega dos letreros más: dónde está el baño y qué hay después del semáforo.",
      minWords: 28,
      model: "Dritto c'è il semaforo. All'angolo, a destra, c'è la farmacia. A sinistra c'è il bar. L'entrata è a sinistra e l'uscita è a destra. Il bagno è a destra, vicino all'uscita. Dopo il semaforo c'è un supermercato.",
      mustInclude: [["il bagno"], ["dopo il semaforo"]],
    },
  },
  u06: {
    mustInclude: [["porto"], ["la mia"], ["vorrei"]],
    extend: {
      prompt: "Agrega cuál es tu prenda favorita, de qué color es y cuánto costó.",
      minWords: 36,
      model: "Oggi porto una maglietta bianca, pantaloni neri e scarpe marroni. La mia giacca è verde. Vorrei comprare un cappello rosso: quel cappello nel negozio è molto bello. La mia maglietta preferita è blu e costa venti euro. Non porto mai il rosso.",
      mustInclude: [["preferita", "preferito"], ["costa"]],
    },
  },
  "u06#B": {
    extend: {
      prompt: "Agrega el precio de dos prendas y el horario de la tienda.",
      minWords: 36,
      model: "Nel nostro negozio ci sono magliette bianche, una giacca verde e una gonna rosa. Quel cappello nero è molto bello. Puoi provare tutto nel camerino. La giacca costa quaranta euro e la gonna costa trenta euro. Il negozio apre alle nove e chiude alle sette.",
      mustInclude: [["costa"], ["apre"], ["chiude"]],
    },
  },
  u26: {
    mustInclude: [["ho"], ["ha i capelli", "ha gli occhi", "è alta", "è alto"]],
    extend: {
      prompt: "Agrega cuántos años tienen tus hermanos y qué les gusta hacer.",
      minWords: 31,
      model: "Ciao! Ho una sorella e un fratello. Mia madre fa l'insegnante e mio padre è un medico. Mia sorella è alta e ha i capelli castani. Mio fratello ha quindici anni e gli piace il calcio. Mia sorella ha venti anni e legge molto.",
      mustInclude: [["anni"], ["gli piace", "le piace"]],
    },
  },
  u07: {
    mustInclude: [["mi sveglio", "mi alzo", "mi lavo"], ["sto"]],
    extend: {
      prompt: "Agrega qué haces al mediodía y a qué hora cenas.",
      minWords: 38,
      model: "Di solito mi sveglio alle sette e mi alzo subito. Poi prendo un caffè e vado al lavoro. La sera mi lavo i denti e vado a letto. Adesso sto studiando italiano. A mezzogiorno pranzo con un amico. Ceno alle otto e dopo cena guardo la televisione.",
      mustInclude: [["pranzo"], ["ceno", "cena"]],
    },
  },
  "u07#B": {
    extend: {
      prompt: "Agrega qué están haciendo ahora otras dos personas y un plan para esta noche.",
      minWords: 33,
      model: "Ciao Marco! Adesso sto cucinando e Anna sta studiando. Sono stanco, ma sto bene. E tu, che stai facendo? Mio fratello sta guardando la televisione e mia madre sta leggendo. Stasera esco con degli amici.",
      mustInclude: [["sta guardando", "sta leggendo"], ["stasera"]],
    },
  },
  u08: {
    mustInclude: [["come", "dove"], ["perché", "quanti"], ["spesso", "sempre", "qualche volta"], ["mai", "niente"]],
    extend: {
      prompt: "Agrega dos preguntas más y algo que haces siempre.",
      minWords: 34,
      model: "Come ti chiami? Dove abiti? Quanti anni hai? Perché studi italiano? Che lavoro fai? Quando studi? Io vado spesso al cinema, ma non mangio mai la carne e non bevo molto caffè. Faccio sempre colazione al bar.",
      mustInclude: [["che lavoro", "quando"], ["sempre"]],
    },
  },
  u27: {
    mustInclude: [["gioco", "leggo", "suono"], ["so"], ["fa", "c'è il sole", "piove"]],
    extend: {
      prompt: "Agrega cuándo juegas y con quién, y qué tiempo hará mañana.",
      minWords: 36,
      model: "Ciao! Nel tempo libero leggo e gioco a calcio. So cucinare un po'. Oggi a Santiago c'è il sole, ma fa fresco. Il sabato gioco con gli amici e ogni domenica faccio una passeggiata. Domani piove: resto a casa.",
      mustInclude: [["ogni"], ["domani"]],
    },
  },
  u09: {
    mustInclude: [["ho mangiato", "ho visto", "ho comprato", "ho dormito"], ["ancora", "già"]],
    extend: {
      prompt: "Agrega dos cosas más que hiciste el domingo y una que todavía no hiciste.",
      minWords: 38,
      model: "Sabato ho mangiato una pizza con amici. Ho visto un film e ho comprato un libro. Domenica ho dormito molto. Non ho ancora finito il libro. Ho pulito la casa e ho telefonato a mia madre. Non ho ancora fatto la spesa.",
      mustInclude: [["ho pulito"], ["ho telefonato"]],
    },
  },
  u10: {
    mustInclude: [["sono andata", "sono andato", "siamo andati", "siamo andate"], ["ci siamo alzati", "mi sono alzato", "mi sono alzata", "ci siamo alzate"]],
    extend: {
      prompt: "Agrega qué hicieron en la ciudad y cuándo salieron de viaje.",
      minWords: 36,
      model: "Sono andata a Firenze in treno. Siamo arrivati alle dieci. Ci siamo alzati presto e siamo usciti dall'albergo. Siamo tornati lunedì sera. Siamo stati in centro tutto il giorno e siamo entrati in due musei. Siamo partiti sabato mattina.",
      mustInclude: [["siamo stati"], ["siamo partiti"]],
    },
  },
  u11: {
    mustInclude: [["abitavo", "giocavo"], ["un giorno", "mentre"]],
    extend: {
      prompt: "Agrega cómo era tu casa, qué hacía tu madre y qué pasó con el recuerdo.",
      minWords: 38,
      model: "Da piccola abitavo in una casa grande con mio nonno. D'estate giocavo in giardino. Un giorno, mentre giocavo, ho trovato un gatto. La casa era grande e tranquilla. Mia madre cucinava sempre il pranzo. Ho tenuto il gatto per molti anni.",
      mustInclude: [["la casa era"], ["cucinava"]],
    },
  },
  u12: {
    mustInclude: [["più", "meno"], ["del", "dei", "della", "delle"], ["il più", "la più"]],
    extend: {
      prompt: "Agrega una tercera comparación (con *meno*) y qué bebida llevarías a la cena.",
      minWords: 40,
      model: "Roma è più grande di Torino, ma Torino è più tranquilla. Per la cena vorrei del pane, dei pomodori e del formaggio. Il formaggio è il più caro del mercato. Milano è meno calda di Roma. Voglio anche del vino e dell'acqua per la cena.",
      mustInclude: [["meno"], ["del vino"]],
    },
  },
  u28: {
    mustInclude: [["ho prenotato", "avete un tavolo"], ["sono allergico", "sono allergica", "sono vegetariano", "sono vegetariana"], ["il servizio", "il conto"]],
    extend: {
      prompt: "Agrega a qué hora llegan y qué plato te gustaría pedir.",
      minWords: 30,
      model: "Ciao! Ho prenotato per due persone. Sono vegetariano e sono allergico alle noci. Il servizio è incluso? Arriviamo alle otto e mezza. Come primo vorrei la pasta e come secondo il pesce.",
      mustInclude: [["alle otto", "alle nove", "alle sette"], ["come primo", "come secondo"]],
    },
  },
  u13: {
    mustInclude: [["restituirla", "cambiarla"], ["l'ho pagata"]],
    extend: {
      prompt: "Agrega por qué no te gusta y qué prefieres: otro color o que te devuelvan el dinero.",
      minWords: 38,
      model: "Buongiorno, ho comprato questa giacca ieri, ma è troppo piccola. Vorrei restituirla. L'ho pagata trenta euro e ho ancora lo scontrino. Posso cambiarla? Non mi piace il colore: la voglio blu. Se non c'è, preferisco restituirla e riavere i soldi.",
      mustInclude: [["la voglio"], ["preferisco"]],
    },
  },
  u14: {
    mustInclude: [["vada", "giri", "prenda"], ["ne vorrei", "ne prendo"], ["dritto", "a destra", "a sinistra"]],
    extend: {
      prompt: "Agrega qué debe hacer el turista al llegar a la estación (trato formal).",
      minWords: 40,
      model: "Vada dritto fino al semaforo e giri a destra. La stazione è dopo il ponte. Prenda la metro e scenda a Termini. Al mercato vorrei delle mele: ne vorrei due chili. Alla stazione chieda il biglietto e poi salga sul treno.",
      mustInclude: [["chieda"], ["salga"]],
    },
  },
  "u14#B": {
    extend: {
      prompt: "Agrega dos instrucciones más con *tu*: qué hacer en la farmacia y a qué hora llegar.",
      minWords: 27,
      model: "Vai dritto fino al semaforo. Gira a destra. Non attraversare la strada in fretta. Poi entra nella farmacia e chiedi un'informazione. Arriva prima delle cinque, perché chiude presto.",
      mustInclude: [["entra"], ["arriva"]],
    },
  },
  u15: {
    mustInclude: [["andrò", "studierò", "farò", "verrò"], ["potrebbe", "vorrei"]],
    extend: {
      prompt: "Agrega qué harás allá y cuándo comprarás el pasaje (futuro).",
      minWords: 32,
      model: "L'anno prossimo andrò in Italia e studierò italiano ogni giorno. Potrebbe aiutarmi con la prenotazione dell'albergo? Vorrei partire a settembre. Visiterò Roma e Firenze e farò molte foto. Tra una settimana comprerò il biglietto.",
      mustInclude: [["visiterò"], ["tra una settimana", "tra un mese"]],
    },
  },
  "u15#B": {
    extend: {
      prompt: "Agrega una oferta con *se vuoi* y pídele que te avise si no puede venir.",
      minWords: 34,
      model: "Ciao Anna! Sabato c'è una festa a casa mia: vieni? Potresti portare un dolce? Dovresti prendere un taxi, perché casa mia è lontana. Se vieni, sono molto contenta. Se vuoi, puoi dormire da me. Se non puoi venire, dimmelo presto.",
      mustInclude: [["se vuoi"], ["se non puoi"]],
    },
  },
  u16: {
    mustInclude: [["ho mal di", "mi fa male", "mi fanno male"], ["mi serve", "mi servono"], ["puoi", "può"]],
    extend: {
      prompt: "Agrega desde cuándo te sientes mal y qué quieres hacer mañana.",
      minWords: 40,
      model: "Ciao Anna, oggi non sto bene. Ho mal di testa e un po' di febbre. Mi serve una farmacia vicina: puoi aiutarmi, per favore? Non ho niente per la tosse. Grazie mille! Sto male da ieri sera e non ho dormito. Domani vorrei restare a letto, ma devo uscire un momento.",
      mustInclude: [["da ieri", "da due giorni"], ["domani"]],
    },
  },
  u17: {
    mustInclude: [["il suo"], ["quanto costa"], ["arredato"], ["vorrei", "potrei"]],
    extend: {
      prompt: "Agrega si hay ascensor, si la calefacción funciona bien y si puedes llevar a un amigo a verlo.",
      minWords: 44,
      model: "Buongiorno, ho visto il Suo annuncio per l'appartamento in via Roma. Quanto costa l'affitto al mese? È arredato e le spese sono incluse? C'è l'ascensore? Il riscaldamento funziona bene? Posso portare un amico a vedere l'appartamento? Vorrei vederlo sabato mattina, se possibile. Grazie e cordiali saluti.",
      mustInclude: [["c'è l'ascensore"], ["riscaldamento"]],
    },
  },
  u18: {
    mustInclude: [["ti chiamo", "sei libero", "sei libera"], ["le scrivo"], ["cordiali saluti"]],
    extend: {
      prompt: "Agrega al mensaje del amigo dónde y a qué hora se ven, y al hotel cuántas noches quieres.",
      minWords: 38,
      model: "Ciao Marco! Domani sei libero? Ti chiamo tra dieci minuti. Ci vediamo alle sei davanti al cinema? A presto!\n\nGentile signora, Le scrivo per chiedere informazioni sulla camera per il quindici maggio. Vorrei restare per tre notti. Cordiali saluti, Laura Mora",
      mustInclude: [["ci vediamo"], ["tre notti", "due notti", "quattro notti"]],
    },
  },
  u19: {
    mustInclude: [["da tre mesi", "da dieci anni"], ["si mangia", "si può"], ["giorni fa", "anni fa", "mesi fa"]],
    extend: {
      prompt: "Agrega desde cuándo practicas un deporte o pasatiempo y qué se come y se bebe en tu ciudad.",
      minWords: 50,
      model: "Mi chiamo Laura e abito a Santiago da dieci anni. Studio italiano da tre mesi e mi piace molto. A Santiago si mangia bene e si può visitare la montagna. Sono arrivata in Italia tre giorni fa. Gioco a tennis da cinque anni. Nella mia città si mangia molto pesce e si beve vino.",
      mustInclude: [["da cinque anni", "da due anni"], ["si beve"]],
    },
  },
  u20: {
    mustInclude: [["mi ha detto che", "mi ha chiesto se"], ["quindi", "però", "comunque", "perché"], ["secondo me"]],
    extend: {
      prompt: "Agrega qué te dijo otra persona (con *invece*) y cómo terminó (con *infatti*).",
      minWords: 44,
      model: "Ieri Marco mi ha detto che era stanco, quindi non è venuto alla festa. Mi ha chiesto se volevo andare da lui, però avevo molto lavoro. Comunque secondo me è stata una buona decisione. Anna invece mi ha detto che stava bene: infatti è venuta alla festa.",
      mustInclude: [["invece"], ["infatti"]],
    },
  },
  u24: {
    mustInclude: [["prima"], ["poi", "dopo"], ["penso che", "secondo me"], ["se avessi", "spero di", "tornerò"]],
    extend: {
      prompt: "Amplía tu proyecto final hasta unas 70 palabras: agrega qué hicieron en cada ciudad, qué piensas del viaje y qué te gustaría hacer después.",
      minWords: 70,
      model: "L'anno scorso sono andata in Italia con un'amica. Faceva caldo e il cielo era azzurro. Prima abbiamo visitato Roma, poi siamo andate a Firenze in treno. Penso che sia stata un'esperienza bellissima. Se avessi più tempo, resterei un mese. Spero di tornare l'anno prossimo. A Roma abbiamo mangiato la pasta e visto il Colosseo, e a Firenze, mentre camminavamo, ha cominciato a piovere. Secondo me il viaggio è stato più bello perché eravamo insieme. Il prossimo anno vorrei imparare meglio l'italiano e andare anche a Venezia.",
      mustInclude: [["mentre"], ["secondo me"], ["vorrei"]],
    },
  },
};
