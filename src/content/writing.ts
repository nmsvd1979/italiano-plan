export interface WritingTask {
  /** La consigna, en español. */
  prompt: string;
  /** Un texto modelo en italiano, que se muestra después de intentarlo. */
  model: string;
  /** Lista para corregirte tú mismo. */
  checklist: string[];
  /** Mínimo de caracteres para dar el ejercicio por hecho. */
  minChars: number;
}

/** Cada consigna usa lo que la unidad enseña. Es producción guiada: tú corriges con la lista. */
const WRITING: Record<string, WritingTask> = {
  u01: {
    prompt: "Escríbele un mensaje a tu familia anfitriona en Italia: salúdalos con formalidad, di tu nombre y de dónde eres.",
    model: "Buonasera! Piacere di conoscervi! Mi chiamo Laura e sono di Santiago. Sono qui in vacanza. A presto!",
    checklist: ["Saludé con *Buongiorno* o *Buonasera*.", "Usé *mi chiamo* y *sono di*.", "Los verbos concuerdan: *sono* con *io*, *siamo* con *noi*.", "Cerré con *A presto*, *Grazie* o *Arrivederci*."],
    minChars: 50,
  },
  u02: {
    prompt: "Describe tu casa o tu barrio: qué hay (una cosa y varias) y qué te gusta o no te gusta.",
    model: "Ho un appartamento piccolo. C'è una cucina e ci sono due camere. Vicino a casa c'è un supermercato. Mi piace il quartiere, ma non mi piacciono i bar rumorosi.",
    checklist: ["Usé *c'è* para una cosa y *ci sono* para varias.", "Usé *mi piace* con singular y *mi piacciono* con plural.", "Cada sustantivo lleva el artículo correcto (*il, lo, la, l', i, gli, le*).", "Conté al menos una cosa que tengo con *avere*."],
    minChars: 70,
  },
  u03: {
    prompt: "Escríbele a un amigo para quedar: propón un día, una hora y di cuánto cuesta la entrada.",
    model: "Ciao Marco! Sabato sono libero. Il film inizia alle diciannove e il biglietto costa otto euro. Ti aspetto davanti al cinema alle diciotto e trenta.",
    checklist: ["Escribí la hora con *alle…* (o *all'una*).", "Escribí el precio con *costa* o *costano* y la palabra *euro*.", "Los días de la semana van en minúscula.", "Los números están bien escritos, pegados (*ventotto*, *trentadue*)."],
    minChars: 70,
  },
  u04: {
    prompt: "Cuéntale a un amigo qué pedirías en un bar y qué tienes que hacer después.",
    model: "Al bar prendo un cappuccino e un cornetto. Vorrei anche un bicchiere d'acqua, per favore. Poi devo andare al lavoro e torno a casa alle sei.",
    checklist: ["Pedí algo con *vorrei* o *prendo*.", "Usé *dovere* o *potere* con un infinitivo.", "Conjugué bien los verbos regulares (*-o, -i, -a*).", "Usé *per favore*."],
    minChars: 70,
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
  },
  u23: {
    prompt: "Escribe tres sueños con «si»: qué harías si tuvieras más tiempo, dinero o libertad.",
    model: "Se avessi più tempo, viaggerei in tutta l'Italia. Se fossi ricca, comprerei una casa vicino al mare. Se potessi scegliere, vivrei a Roma per un anno. E tu, che cosa faresti?",
    checklist: [
      "Usé *se* + congiuntivo imperfetto (*avessi, fossi, potessi*).",
      "En la otra parte usé condizionale (*viaggerei, comprerei*).",
      "No puse condizionale después de *se*.",
      "Escribí al menos tres frases con *se*.",
    ],
    minChars: 110,
  },
  u24: {
    prompt: "Proyecto final: cuenta un viaje o una experiencia completa. Di dónde fuiste, cómo era, qué hiciste, qué piensas y qué harás o harías.",
    model: "L'anno scorso sono andata in Italia con un'amica. Faceva caldo e c'era molta gente. Prima abbiamo visitato Roma, poi siamo andate a Firenze in treno. Penso che sia stata un'esperienza bellissima. Se avessi più tempo, resterei un mese. Spero di tornare l'anno prossimo.",
    checklist: [
      "Usé passato prossimo para los hechos e imperfetto para describir.",
      "Usé al menos dos conectores (*prima, poi, perché, mentre, però*).",
      "Di mi opinión con *penso che* + congiuntivo.",
      "Usé un plan (*spero di…, tornerò*) o una hipótesis (*se avessi…, resterei*).",
    ],
    minChars: 120,
  },
  u20: {
    prompt: "Cuenta lo que te dijo un amigo y da tu opinión, usando al menos tres conectores.",
    model: "Ieri Marco mi ha detto che era stanco, quindi non è venuto alla festa. Mi ha chiesto se volevo andare da lui, però avevo molto lavoro. Comunque penso che sia stata una buona decisione.",
    checklist: [
      "Usé *ha detto che* / *ha chiesto se* para contar lo que dijeron.",
      "Los verbos del discurso indirecto bajan un paso (*era, volevo*).",
      "Usé al menos tres conectores (*quindi, però, comunque, perché, invece*).",
      "Di mi opinión con *penso che* + congiuntivo.",
    ],
    minChars: 100,
  },
};

export function getWriting(unit: string): WritingTask | undefined {
  return WRITING[unit];
}
