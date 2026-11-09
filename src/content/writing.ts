import { NUEVAS } from "./nuevas";
import { WRITING_EXTRAS } from "./writing-extend";

export interface WritingTask {
  /** La consigna, en español. */
  prompt: string;
  /** Un texto modelo en italiano, que se muestra después de intentarlo. */
  model: string;
  /** Lista para corregirte tú mismo. */
  checklist: string[];
  /** Mínimo de caracteres (referencia antigua). El mínimo que se exige es de palabras: `minWords`, o `minChars / 6` si no se fijó. */
  minChars: number;
  // Datos de la corrección automática (docs/v2/05 E4). Todos son opcionales: si faltan, la app usa lo que hay y no inventa.
  // Límite de contenido pendiente de escribir (por unidad): `mustInclude`, `frames` y `keywords` no existen todavía.
  /** Mínimo de palabras. */
  minWords?: number;
  /** Formas meta que debe usar el texto: cada elemento es un grupo de alternativas aceptadas (basta una). */
  mustInclude?: string[][];
  /** Marcos de frase para las unidades del nivel «marcos» (ej. «Ayer yo ___ y después ___»). */
  frames?: string[];
  /** Palabras clave para reconstruir el texto (nivel «reconstruir»); si faltan, salen del modelo. */
  keywords?: string[];
  /** Ampliación opcional del mismo texto (docs/v2/plan-b1/01): una segunda consigna que sube la extensión. No cambia lo que da el bloque por hecho. */
  extend?: WritingExtension;
}

export interface WritingExtension {
  /** Qué agregar al texto, en español. */
  prompt: string;
  /** Palabras en total (el texto completo, no solo lo agregado). */
  minWords: number;
  /** Texto modelo ampliado, en italiano. */
  model: string;
  mustInclude?: string[][];
}

/** Cada consigna usa lo que la unidad enseña. Es producción guiada: tú corriges con la lista. */
const WRITING: Record<string, WritingTask> = {
  u01: {
    prompt: "Escríbele un mensaje a tu familia anfitriona en Italia: salúdalos con formalidad, di tu nombre y de dónde eres.",
    model: "Buonasera! Piacere di conoscervi! Mi chiamo Laura e sono di Santiago. Sono qui in vacanza. A presto!",
    checklist: ["Saludé con *Buongiorno* o *Buonasera*.", "Usé *mi chiamo* y *sono di*.", "Los verbos concuerdan: *sono* con *io*, *siamo* con *noi*.", "Cerré con *A presto*, *Grazie* o *Arrivederci*."],
    minChars: 50,
    mustInclude: [["buonasera", "buongiorno"], ["mi chiamo"], ["sono di"]],
    extend: {
      prompt: "Agrega dos frases: dile a la familia que estás cansado o cansada y pregúntales de dónde son.",
      minWords: 20,
      model: "Buonasera! Piacere di conoscervi! Mi chiamo Laura e sono di Santiago. Sono qui in vacanza. Sono stanca. E voi, di dove siete? A presto!",
      mustInclude: [["di dove siete"], ["sono stanca", "sono stanco"]],
    },
  },
  u02: {
    prompt: "Describe tu casa o tu barrio: qué hay (una cosa y varias) y qué te gusta o no te gusta.",
    model: "Ho un appartamento piccolo. C'è una cucina e ci sono due camere. Vicino a casa c'è un supermercato. Mi piace il quartiere, ma non mi piacciono i bar rumorosi.",
    checklist: ["Usé *c'è* para una cosa y *ci sono* para varias.", "Usé *mi piace* con singular y *mi piacciono* con plural.", "Cada sustantivo lleva el artículo correcto (*il, lo, la, l', i, gli, le*).", "Conté al menos una cosa que tengo con *avere*."],
    minChars: 70,
    mustInclude: [["c'è"], ["ci sono"], ["mi piace", "mi piacciono"]],
    extend: {
      prompt: "Agrega una frase sobre algo que tienes en casa (con su artículo).",
      minWords: 25,
      model: "Ho un appartamento piccolo. C'è una cucina e ci sono due camere. Vicino a casa c'è un supermercato. Ho anche un tavolo e due sedie. Mi piace il quartiere, ma non mi piacciono i bar rumorosi.",
      mustInclude: [["ho"]],
    },
  },
  u03: {
    prompt: "Escríbele a un amigo para quedar: propón un día, una hora y di cuánto cuesta la entrada.",
    model: "Ciao Marco! Sabato sono libero. Il film inizia alle diciannove e il biglietto costa otto euro. Ti aspetto davanti al cinema alle diciotto e trenta.",
    checklist: ["Escribí la hora con *alle…* (o *all'una*).", "Escribí el precio con *costa* o *costano* y la palabra *euro*.", "Los días de la semana van en minúscula.", "Los números están bien escritos, pegados (*ventotto*, *trentadue*)."],
    minChars: 70,
    mustInclude: [["alle"], ["costa", "costano"], ["sabato", "domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì"]],
    extend: {
      prompt: "Agrega un segundo plan para otro día (por ejemplo, el miércoles): a qué hora abre un lugar y a qué hora cierra.",
      minWords: 25,
      model: "Ciao Marco! Sabato sono libero. Il film inizia alle diciannove e il biglietto costa otto euro. Ti aspetto davanti al cinema alle diciotto e trenta. Anche mercoledì sono libero: il museo apre alle nove e chiude all'una.",
      mustInclude: [["apre"], ["chiude"], ["mercoledì"]],
    },
  },
  u04: {
    prompt: "Cuéntale a un amigo qué pedirías en un bar y qué tienes que hacer después.",
    model: "Al bar prendo un cappuccino e un cornetto. Vorrei anche un bicchiere d'acqua, per favore. Poi devo andare al lavoro e torno a casa alle sei.",
    checklist: ["Pedí algo con *vorrei* o *prendo*.", "Usé *dovere* o *potere* con un infinitivo.", "Conjugué bien los verbos regulares (*-o, -i, -a*).", "Usé *per favore*."],
    minChars: 70,
    mustInclude: [["vorrei", "prendo"], ["devo", "posso"], ["per favore"]],
    extend: {
      prompt: "Agrega que pides la cuenta con cortesía, antes de irte.",
      minWords: 28,
      model: "Al bar prendo un cappuccino e un cornetto. Vorrei anche un bicchiere d'acqua, per favore. Posso avere il conto, per favore? Poi devo andare al lavoro e torno a casa alle sei.",
      mustInclude: [["posso avere il conto"]],
    },
  },
  u05: {
    prompt: "Cuenta cómo vas a tres lugares: al trabajo o la universidad, a casa de un amigo y a otra ciudad.",
    model: "Vado al lavoro in autobus. Il sabato vado da Marco a piedi. Domani vado a Firenze in treno e scendo alla stazione centrale.",
    checklist: ["Usé *a* con ciudades y *in* con países y transportes.", "Usé *da* con una persona.", "Fusioné bien las preposiciones (*al, nella, dalla*).", "No usé *salgo* cuando quería decir \"salgo de\" (eso es *esco*)."],
    minChars: 70,
  },
  u06: {
    prompt: "Describe lo que llevas puesto hoy (prendas y colores) y algo que te gustaría comprar.",
    model: "Oggi porto una maglietta bianca, pantaloni neri e scarpe marroni. La mia giacca è verde. Vorrei comprare un cappello rosso: quel cappello nel negozio è molto bello.",
    checklist: ["Los colores van después del sustantivo y concuerdan (*due borse rosse*).", "Usé un posesivo con su artículo (*la mia giacca*).", "Usé *questo* o *quello* para señalar algo.", "*Rosa*, *viola* y *blu* no cambian."],
    minChars: 70,
  },
  u07: {
    prompt: "Cuenta tu rutina de un día normal, de la mañana a la noche, y qué estás haciendo ahora.",
    model: "Di solito mi sveglio alle sette e mi alzo subito. Poi prendo un caffè e vado al lavoro. La sera mi lavo i denti e vado a letto. Adesso sto studiando italiano.",
    checklist: ["Usé al menos dos verbos reflexivos con su pronombre (*mi, ti, si*).", "Ordené el día con *prima, poi, dopo, di solito*.", "Usé *sto* + gerundio para lo que hago ahora.", "Usé *essere* para estados (*sono stanco*), no *stare*."],
    minChars: 80,
  },
  u08: {
    prompt: "Escribe cuatro preguntas para conocer a alguien y cuenta con qué frecuencia haces algo (y qué nunca haces).",
    model: "Come ti chiami? Dove abiti? Quanti anni hai? Perché studi italiano? Io vado spesso al cinema, ma non mangio mai la carne e non bevo molto caffè.",
    checklist: ["Usé al menos tres palabras interrogativas distintas.", "Usé *non* antes del verbo, y *mai* o *niente* si hace falta.", "Dije la frecuencia con *spesso, sempre, qualche volta…*.", "Concordé *molto/poco/troppo* con el sustantivo."],
    minChars: 80,
  },
  u09: {
    prompt: "Cuenta qué hiciste el fin de semana pasado (tres o cuatro cosas) y algo que todavía no hiciste.",
    model: "Sabato ho mangiato una pizza con amici. Ho visto un film e ho comprato un libro. Domenica ho dormito molto. Non ho ancora finito il libro.",
    checklist: ["Todos los verbos van con *avere* + participio.", "Usé participios irregulares correctos (*fatto, visto, letto*).", "Usé un marcador (*ieri, sabato, già, non… ancora*).", "*Già* o *ancora* van entre *avere* y el participio."],
    minChars: 80,
  },
  u10: {
    prompt: "Cuenta un viaje, real o inventado: adónde fuiste, cuándo llegaste y cuándo volviste.",
    model: "Sono andata a Firenze in treno. Siamo arrivati alle dieci. Ci siamo alzati presto e siamo usciti dall'albergo. Siamo tornati lunedì sera.",
    checklist: ["Los verbos de movimiento van con *essere*.", "El participio concuerda con el sujeto (*andata, arrivati*).", "Usé al menos un reflexivo en pasado (*mi sono alzato*).", "Dije cuándo con *ieri, domenica, alle dieci…*."],
    minChars: 80,
  },
  u11: {
    prompt: "Describe cómo era tu infancia (dónde vivías, qué hacías) y cuenta un recuerdo puntual.",
    model: "Da piccola abitavo in una casa grande con mio nonno. D'estate giocavo in giardino. Un giorno, mentre giocavo, ho trovato un gatto.",
    checklist: ["Usé *imperfetto* para lo habitual y las descripciones.", "Usé *passato prossimo* para el hecho puntual.", "Usé una pista (*da piccolo, di solito, mentre, un giorno*).", "Los verbos del imperfetto terminan en *-vo, -vi, -va, -vamo, -vate, -vano*."],
    minChars: 90,
  },
  u12: {
    prompt: "Compara dos ciudades o dos lugares que conoces, y escribe lo que comprarías en el mercado para una cena.",
    model: "Roma è più grande di Torino, ma Torino è più tranquilla. Per la cena vorrei del pane, dei pomodori e del formaggio. Il formaggio è il più caro del mercato.",
    checklist: ["Usé *più/meno… di* o *che* según corresponda.", "Usé al menos un superlativo (*il più…*, *-issimo*).", "Usé el partitivo (*del, dei, della…*) para pedir.", "No usé partitivo después de *non*."],
    minChars: 90,
  },
  u13: {
    prompt: "Escríbele a una tienda para devolver algo que compraste. Usa pronombres para no repetir el objeto.",
    model: "Buongiorno, ho comprato questa giacca ieri, ma è troppo piccola. Vorrei restituirla. L'ho pagata trenta euro e ho ancora lo scontrino. Posso cambiarla?",
    checklist: ["Usé *lo / la / li / le* en vez de repetir el objeto.", "Con *passato prossimo*, el participio concuerda (*l'ho pagata*).", "Pegué el pronombre al infinitivo (*restituirla*).", "Usé *a lui / a lei* con *gli / le* si había un destinatario."],
    minChars: 90,
  },
  u14: {
    prompt: "Dale indicaciones a un turista para llegar a la estación (usa el trato formal) y pide algo con *ne*.",
    model: "Vada dritto fino al semaforo e giri a destra. La stazione è dopo il ponte. Prenda la metro e scenda a Termini. Al mercato vorrei delle mele: ne vorrei due chili.",
    checklist: ["Usé el imperativo formal (*vada, giri, prenda*).", "Usé *dritto, a destra, a sinistra* y un punto de referencia.", "Usé *ne* para una cantidad.", "Usé *ci* para un lugar al menos una vez."],
    minChars: 90,
  },
  u15: {
    prompt: "Cuenta tus planes para el próximo año y pide un favor con cortesía.",
    model: "L'anno prossimo andrò in Italia e studierò italiano ogni giorno. Potrebbe aiutarmi con la prenotazione dell'albergo? Vorrei partire a settembre.",
    checklist: ["Usé al menos dos verbos en futuro (*andrò, studierò*).", "Pedí el favor con *potrebbe* o *vorrei*.", "Usé un marcador (*domani, l'anno prossimo, tra una settimana*).", "Usé las raíces irregulares donde correspondía (*andrò, farò, verrò*)."],
    minChars: 90,
  },
  u16: {
    prompt: "Estás en Italia y no te sientes bien: escríbele un mensaje a tu anfitriona para explicarle qué te duele y qué necesitas.",
    model: "Ciao Anna, oggi non sto bene. Ho mal di testa e un po' di febbre. Mi serve una farmacia vicina: puoi aiutarmi, per favore? Non ho niente per la tosse. Grazie mille!",
    checklist: [
      "Dije qué me duele con *ho mal di…* o *mi fa / mi fanno male*.",
      "Dije qué necesito con *mi serve* o *mi servono*.",
      "Pedí ayuda con *puoi* o *può* + infinitivo.",
      "Usé *niente*, *qualcosa* o *nessuno* con *non* cuando hacía falta.",
    ],
    minChars: 80,
  },
  u17: {
    prompt: "Escríbele al dueño de un departamento / apartamento que viste en un aviso: pregunta el precio, si está amueblado y pide una visita.",
    model: "Buongiorno, ho visto il Suo annuncio per l'appartamento in via Roma. Quanto costa l'affitto al mese? È arredato e le spese sono incluse? Vorrei vederlo sabato mattina, se possibile. Grazie e cordiali saluti.",
    checklist: [
      "Usé *Lei* con formalidad (*Suo*, *può*).",
      "Pregunté el precio con *quanto costa* y si está *arredato*.",
      "Pedí una visita con *vorrei* o *potrei*.",
      "Cerré con *Grazie* y un saludo formal.",
    ],
    minChars: 90,
  },
  u18: {
    prompt: "Escribe dos mensajes cortos: uno a un amigo para quedar mañana y uno formal a un hotel para pedir información.",
    model: "Ciao Marco! Domani sei libero? Ti chiamo tra dieci minuti. A presto!\n\nGentile signora, Le scrivo per chiedere informazioni sulla camera per il quindici maggio. Cordiali saluti, Laura Mora",
    checklist: [
      "Usé un saludo y una despedida distintos para cada registro.",
      "Usé *ti / tu* con el amigo y *Le / Lei* con el hotel.",
      "Usé *per* + infinitivo o *tra* + tiempo al menos una vez.",
      "Usé *Ciao* solo con el amigo y *Gentile… Cordiali saluti* con el hotel.",
    ],
    minChars: 100,
  },
  u19: {
    prompt: "Preséntate: cuenta desde cuándo estudias italiano, dónde vives y desde cuándo, y qué se hace en tu ciudad.",
    model: "Mi chiamo Laura e abito a Santiago da dieci anni. Studio italiano da tre mesi e mi piace molto. A Santiago si mangia bene e si può visitare la montagna. Sono arrivata in Italia tre giorni fa.",
    checklist: [
      "Usé *da* + tiempo con el presente (*studio da tre mesi*).",
      "Usé *si* + verbo para decir qué se hace en mi ciudad.",
      "Usé *fa* o *per* en una frase en pasado.",
      "Con *da* el verbo está en presente, no en passato prossimo.",
    ],
    minChars: 100,
  },
  u21: {
    prompt: "Un amigo te pide prestadas varias cosas antes de un viaje: respóndele diciendo qué le das y qué no, con pronombres combinados.",
    model: "Certo, il libro te lo presto volentieri. Il mio numero te lo scrivo qui sotto. La mappa non l'ho più: gliel'ho data ieri a Marco. Se vuoi, te ne mando due copie.",
    checklist: [
      "Usé al menos dos pronombres combinados (*te lo, te la, glielo…*).",
      "Los pronombres van antes del verbo conjugado.",
      "Con *l'ho / l'ha* el participio concuerda (*data, detta*).",
      "Escribí *glielo / gliela* pegado, en una sola palabra.",
    ],
    minChars: 90,
    mustInclude: [["te lo", "te la"], ["gliel'ho", "gliela", "glielo"]],
    extend: {
      prompt: "Amplía tu respuesta hasta unas 80 palabras: agrega qué más le llevas o le dejas (la guía, las llaves), qué ya entregaste a otra persona y ofrécele explicarle algo otra vez.",
      minWords: 70,
      model: "Certo, il libro te lo presto volentieri. Il mio numero te lo scrivo qui sotto. La mappa non l'ho più: gliel'ho data ieri a Marco. Del libro ho due copie: se vuoi, te ne mando una. La guida di Roma te la porto stasera, così domani puoi partire tranquillo. Le chiavi di casa te le lascio io domani mattina. La ricevuta del pacco? Gliel'ho consegnata subito, quindi non è un problema. Se ti serve altro, te lo spiego ancora una volta, volentieri. Buon viaggio!",
      mustInclude: [["te la"], ["te le"], ["gliel'ho consegnata", "gliel'ho consegnato"], ["te lo spiego"]],
    },
  },
  u22: {
    prompt: "Da tu opinión sobre un lugar que visitaste: qué piensas, qué esperas y qué es importante hacer.",
    model: "Penso che Roma sia una città bellissima. Credo che il Colosseo sia molto interessante. Spero che tu venga con me l'anno prossimo. È importante che noi arriviamo presto, perché c'è molta gente.",
    checklist: [
      "Usé *penso / credo che* + congiuntivo (*sia, abbia*).",
      "Usé *spero che* o *voglio che* con otra persona.",
      "Usé *è importante che* + congiuntivo.",
      "Con el mismo sujeto usé *di* + infinitivo, no *che*.",
    ],
    minChars: 100,
    mustInclude: [["penso che", "credo che"], ["spero che"]],
    extend: {
      prompt: "Amplía tu opinión hasta unas 80 palabras: agrega una duda (*dubito che*), qué quieres que hagan otros (*voglio che*) y qué sería mejor hacer.",
      minWords: 70,
      model: "Penso che Roma sia una città bellissima. Credo che il Colosseo sia molto interessante, ma penso che sia meglio visitarlo la mattina presto. Spero che tu venga con me l'anno prossimo. Voglio che anche i miei amici vedano questa città. È importante che noi arriviamo presto, perché c'è molta gente. Dubito che il tempo sia sempre bello, quindi è meglio che portiamo una giacca. Penso di tornare ancora in estate e spero che tu sia libero.",
      mustInclude: [["dubito che"], ["voglio che"], ["è meglio che"]],
    },
  },
  u23: {
    prompt: "Escribe tres sueños con «si»: qué harías si tuvieras más tiempo, dinero o libertad.",
    model: "Se avessi più tempo, viaggerei in tutta Italia. Se fossi ricca, comprerei una casa vicino al mare. Se potessi scegliere, vivrei a Roma per un anno. E tu, che cosa faresti?",
    checklist: [
      "Usé *se* + congiuntivo imperfetto (*avessi, fossi, potessi*).",
      "En la otra parte usé condizionale (*viaggerei, comprerei*).",
      "No puse condizionale después de *se*.",
      "Escribí al menos tres frases con *se*.",
    ],
    minChars: 110,
    mustInclude: [["se avessi", "se fossi"], ["se potessi"]],
    extend: {
      prompt: "Amplía tus sueños hasta unas 80 palabras: agrega qué harías si ganaras la lotería, un consejo con *se fossi in te* y una pregunta final para tu amigo.",
      minWords: 70,
      model: "Se avessi più tempo, viaggerei in tutta Italia. Se fossi ricca, comprerei una casa vicino al mare e ci passerei l'estate. Se potessi scegliere, vivrei a Roma per un anno. Se vincessi alla lotteria, cambierei lavoro e risparmierei una parte dei soldi. Se fossi in te, comincerei a risparmiare. Se ne avessi l'occasione, partirei subito. Se avessi un anno libero, andrei in Sicilia con la mia famiglia. Sarebbe bello parlarne insieme: e tu, che cosa faresti?",
      mustInclude: [["se vincessi"], ["se fossi in te"], ["faresti"]],
    },
  },
  u24: {
    prompt: "Proyecto final: cuenta un viaje o una experiencia completa. Di dónde fuiste, cómo era, qué hiciste, qué piensas y qué harás o harías.",
    model: "L'anno scorso sono andata in Italia con un'amica. Faceva caldo e il cielo era azzurro. Prima abbiamo visitato Roma, poi siamo andate a Firenze in treno. Penso che sia stata un'esperienza bellissima. Se avessi più tempo, resterei un mese. Spero di tornare l'anno prossimo.",
    checklist: [
      "Usé passato prossimo para los hechos e imperfetto para describir.",
      "Usé al menos dos conectores (*prima, poi, perché, mentre, però*).",
      "Di mi opinión con *secondo me* o *penso che*.",
      "Usé un plan (*spero di…, tornerò*) o una hipótesis (*se avessi…, resterei*).",
    ],
    minChars: 120,
  },
  u20: {
    prompt: "Cuenta lo que te dijo un amigo y da tu opinión, usando al menos tres conectores.",
    model: "Ieri Marco mi ha detto che era stanco, quindi non è venuto alla festa. Mi ha chiesto se volevo andare da lui, però avevo molto lavoro. Comunque secondo me è stata una buona decisione.",
    checklist: [
      "Usé *ha detto che* / *ha chiesto se* para contar lo que dijeron.",
      "Los verbos del discurso indirecto bajan un paso (*era, volevo*).",
      "Usé al menos tres conectores (*quindi, però, comunque, perché, invece*).",
      "Di mi opinión con *secondo me*.",
    ],
    minChars: 100,
  },
  // Semana B de las unidades partidas (docs/v2/plan-b1/01): consigna propia con lo que enseña esa semana.
  "u02#B": {
    prompt: "Describe una calle o una plaza de tu barrio: qué hay, dónde está cada cosa (cerca, lejos…) y qué te gusta.",
    model: "Nel mio quartiere c'è una piazza e ci sono due bar. La farmacia è vicino alla piazza e il supermercato è lontano. Il parco è vicino alla stazione. Mi piace la piazza, ma non mi piacciono i bar.",
    checklist: [
      "Dije qué hay con *c'è* (una cosa) y *ci sono* (varias).",
      "Dije dónde está cada cosa (*vicino a…*, *lontano*).",
      "Fusioné la preposición con el artículo (*alla piazza*, *alla stazione*).",
      "Usé *mi piace* con singular y *mi piacciono* con plural.",
    ],
    minChars: 72,
    mustInclude: [["c'è"], ["ci sono"], ["vicino"], ["mi piace", "mi piacciono"]],
    extend: {
      prompt: "Agrega una cosa que no te gusta del barrio y por qué (por ejemplo, que queda lejos).",
      minWords: 28,
      model: "Nel mio quartiere c'è una piazza e ci sono due bar. La farmacia è vicino alla piazza e il supermercato è lontano. Il parco è vicino alla stazione. Mi piace la piazza, ma non mi piacciono i bar. Non mi piace il supermercato perché è lontano.",
      mustInclude: [["non mi piace"], ["perché"]],
    },
  },
  "u03#B": {
    prompt: "Escribe el cartel de una cafetería: la fecha de hoy, tres productos con su precio y cuándo cierra.",
    model: "Oggi è il dieci marzo. Il caffè costa un euro e venti, il panino costa un euro e cinquanta e i biscotti costano tre euro. Il bar chiude il mercoledì.",
    checklist: [
      "Escribí la fecha con *il* + número + mes en minúscula (*il dieci marzo*).",
      "Usé *costa* con una cosa y *costano* con varias.",
      "Escribí el precio con los euros primero y los centavos después (*un euro e venti*).",
      "Escribí los números con letras y de corrido (*dieci*, *venti*, *cinquanta*).",
    ],
    minChars: 72,
    mustInclude: [["costa"], ["costano"], ["euro"]],
    extend: {
      prompt: "Agrega un cuarto producto con su precio y la fecha de mañana.",
      minWords: 25,
      model: "Oggi è il dieci marzo. Il caffè costa un euro e venti, il panino costa un euro e cinquanta e i biscotti costano tre euro. Il tè costa due euro e cinquanta. Domani è l'undici marzo. Il bar chiude il mercoledì.",
      mustInclude: [["tè"], ["domani"]],
    },
  },
  "u05#B": {
    prompt: "Escribe los letreros para llegar a un lugar: qué hay de frente, a la derecha y a la izquierda, y dónde están la entrada y la salida.",
    model: "Dritto c'è il semaforo. All'angolo, a destra, c'è la farmacia. A sinistra c'è il bar. L'entrata è a sinistra e l'uscita è a destra.",
    checklist: [
      "Usé *a destra*, *a sinistra* y *dritto*.",
      "Usé *c'è* para decir qué hay en cada lugar.",
      "Fusioné la preposición con el artículo cuando hizo falta (*all'angolo*).",
      "Usé *entrata* y *uscita* para la entrada y la salida.",
    ],
    minChars: 72,
    mustInclude: [["a destra"], ["a sinistra"], ["dritto"]],
  },
  "u06#B": {
    prompt: "Escribe el anuncio de una tienda de ropa: tres prendas con su color y qué se puede probar.",
    model: "Nel nostro negozio ci sono magliette bianche, una giacca verde e una gonna rosa. Quel cappello nero è molto bello. Puoi provare tutto nel camerino.",
    checklist: [
      "El color va después del sustantivo y concuerda (*magliette bianche*, *una giacca verde*).",
      "*Rosa* no cambia (*una gonna rosa*).",
      "Usé *quel / quella* para señalar una prenda.",
      "Usé *ci sono* para decir qué hay en la tienda.",
    ],
    minChars: 72,
    mustInclude: [["ci sono"], ["quel", "quella"]],
  },
  "u07#B": {
    prompt: "Escríbele un mensaje a un amigo que pregunta qué haces: cuéntale qué estás haciendo ahora (sto + gerundio) y cómo te sientes.",
    model: "Ciao Marco! Adesso sto cucinando e Anna sta studiando. Sono stanco, ma sto bene. E tu, che stai facendo?",
    checklist: [
      "Usé *sto* / *sta* + gerundio (*sto cucinando*).",
      "Formé bien el gerundio (*-ando* con verbos en *-are*; *-endo* con *-ere* e *-ire*).",
      "Usé *essere* para cansancio o ánimo (*sono stanco*) y *stare* en *sto bene*.",
      "Cerré con la pregunta *Che stai facendo?*",
    ],
    minChars: 84,
    frames: ["Adesso io sto ___ (gerundio).", "___ sta ___ (otra persona).", "Sono ___, ma sto ___."],
    mustInclude: [["sto"], ["sta"], ["sono stanco"]],
  },
  "u14#B": {
    prompt: "Dale a un amigo tres instrucciones cortas, con *tu*, para llegar a la estación: dos afirmativas y una negativa.",
    model: "Vai dritto fino al semaforo. Gira a destra. Non attraversare la strada in fretta.",
    checklist: [
      "Usé el imperativo de *tu* (*vai*, *gira*), no el de *Lei* (*vada*, *giri*).",
      "Para decir «no hagas» usé *non* + infinitivo (*non attraversare*).",
      "Usé *dritto*, *a destra* y *fino a*.",
      "Hablé con tono de amigo, sin *Lei*.",
    ],
    minChars: 84,
    frames: ["Vai ___ fino a ___.", "Gira ___.", "Non ___ la strada in fretta."],
    mustInclude: [["vai"], ["gira"], ["non attraversare"]],
  },
  "u15#B": {
    prompt: "Invita a una amiga a una fiesta con cortesía: pídele un favor, dale un consejo y dile qué pasa si viene.",
    model: "Ciao Anna! Sabato c'è una festa a casa mia: vieni? Potresti portare un dolce? Dovresti prendere un taxi, perché casa mia è lontana. Se vieni, sono molto contenta.",
    checklist: [
      "Pedí el favor con cortesía (*Potresti…?*).",
      "Aconsejé con *dovresti* + infinitivo.",
      "Usé *se* + presente para decir qué pasa si viene (*Se vieni, …*).",
      "Invité con una pregunta clara (*vieni?*).",
    ],
    minChars: 96,
    mustInclude: [["potresti"], ["dovresti"], ["se"]],
  },
};

/**
 * La consigna de una unidad o, en una unidad partida, la de su semana: la clave `u02#B` tiene prioridad sobre `u02`.
 * Mientras una semana B no tenga consigna propia, repite la de la unidad.
 */
export function getWriting(unit: string, part?: "A" | "B" | null): WritingTask | undefined {
  const own = part ? WRITING[`${unit}#${part}`] : undefined;
  const key = own ? `${unit}#${part}` : unit;
  return withExtras(key, own ?? WRITING[unit] ?? NUEVAS.find((n) => n.id === unit)?.writing);
}

/** Suma las formas meta y la ampliación de `writing-extend.ts` si la consigna no trae las suyas. */
function withExtras(key: string, task: WritingTask | undefined): WritingTask | undefined {
  const x = WRITING_EXTRAS[key];
  if (!task || !x) return task;
  return { ...task, mustInclude: task.mustInclude ?? x.mustInclude, extend: task.extend ?? x.extend };
}

/** Clave con la que se guarda el texto de una semana: la unidad, o `u02#B` para la semana B (la A conserva la clave de siempre). */
export const writingKey = (unit: string, part?: "A" | "B" | null): string => (part === "B" ? `${unit}#B` : unit);

/** Todas las consignas (también las de semanas B), para el léxico de la app. */
export function allWritingTasks(): WritingTask[] {
  return [
    ...Object.entries(WRITING).map(([k, t]) => withExtras(k, t)!),
    ...NUEVAS.flatMap((n) => (n.writing ? [withExtras(n.id, n.writing)!] : [])),
  ];
}
