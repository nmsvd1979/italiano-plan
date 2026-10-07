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
};

export function getWriting(unit: string): WritingTask | undefined {
  return WRITING[unit];
}
