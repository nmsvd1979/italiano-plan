// Monólogo guiado (docs/v2/plan-b1/02): una consigna por semana del curso para hablar sin leer, en tres vueltas con menos
// tiempo cada vez. Clave = id del paso (`u25`, `u02#B`). Fases 1 a 3 (semanas 1 a 21); el resto llega en PR de contenido.

export interface Monologue {
  /** Qué decir, en español. */
  prompt: string;
  /** Puntos que cubrir, en español (3 a 5). */
  points: string[];
  /** Marcos en italiano para las primeras semanas. */
  frames?: string[];
  /** Texto modelo en italiano (se escucha y se ve después de la primera vuelta). */
  model: string;
  /** Tiempo máximo de cada vuelta, en segundos, de mayor a menor. */
  seconds: [number, number, number];
}

const MONOLOGOS: Record<string, Monologue> = {
  u25: {
    prompt: "Preséntate en voz alta: di cómo te llamas, de dónde eres y cómo se escribe tu nombre.",
    points: ["Dices cómo te llamas (*Mi chiamo…*).", "Dices de dónde eres (*Sono di…*).", "Deletreas tu nombre, al menos cuatro letras."],
    frames: ["Mi chiamo ___.", "Sono di ___.", "Si scrive ___."],
    model: "Ciao! Mi chiamo Laura. Sono di Santiago. Si scrive elle, a, u, erre, a.",
    seconds: [45, 35, 25],
  },
  u01: {
    prompt: "Preséntate con formalidad a una familia anfitriona: saluda, di tu nombre y de dónde eres, y cuenta que estás de vacaciones.",
    points: [
      "Saludas según la hora (*Buonasera*, *Buongiorno*).",
      "Dices tu nombre (*Mi chiamo…*).",
      "Dices de dónde eres (*Sono di…*).",
      "Dices que estás de vacaciones (*Sono qui in vacanza*).",
    ],
    frames: ["Buonasera! Piacere di conoscervi.", "Mi chiamo ___ e sono di ___.", "Sono qui in vacanza."],
    model: "Buonasera! Piacere di conoscervi. Mi chiamo Laura e sono di Santiago. Sono qui in vacanza. A presto!",
    seconds: [50, 40, 30],
  },
  "u02#A": {
    prompt: "Describe tu casa: qué hay (una cosa y varias) y qué tienes.",
    points: [
      "Dices qué tienes con *ho* (*Ho un appartamento…*).",
      "Dices qué hay con *c'è* (una cosa) y *ci sono* (varias).",
      "Nombras al menos tres cosas, cada una con su artículo.",
    ],
    frames: ["Ho un / una ___.", "C'è un / una ___.", "Ci sono due ___."],
    model: "Ho un appartamento piccolo. C'è una cucina e ci sono due camere. Ho un tavolo e due sedie.",
    seconds: [55, 45, 35],
  },
  "u02#B": {
    prompt: "Describe tu barrio: qué hay, dónde queda cada cosa y qué te gusta.",
    points: [
      "Dices qué hay con *c'è* y *ci sono*.",
      "Dices dónde queda algo (*vicino a…*, *lontano*).",
      "Dices qué te gusta o no (*mi piace*, *non mi piacciono*).",
    ],
    frames: ["Nel mio quartiere c'è ___.", "___ è vicino a ___ (alla, al, all').", "Mi piace ___. Non mi piacciono ___."],
    model: "Nel mio quartiere c'è una piazza e ci sono due bar. La farmacia è vicino alla piazza. Mi piace la piazza, ma non mi piacciono i bar.",
    seconds: [60, 50, 40],
  },
  "u03#A": {
    prompt: "Di qué hora es, a qué hora abre un lugar y cuántos años tienes.",
    points: [
      "Dices la hora (*Sono le…*).",
      "Dices a qué hora abre y cierra un lugar (*alle…*).",
      "Dices tu edad (*Ho… anni*).",
    ],
    frames: ["Sono le ___. (Con la una: È l'una.)", "Il museo apre alle ___ e chiude ___. (Con la una: all'una.)", "Ho ___ anni."],
    model: "Sono le otto e mezza. Il museo apre alle nove e chiude all'una. Ho ventotto anni.",
    seconds: [50, 40, 25],
  },
  "u03#B": {
    prompt: "Di la fecha de hoy y el precio de dos cosas.",
    points: [
      "Dices la fecha (*Oggi è il…*).",
      "Dices el precio de una cosa con *costa*.",
      "Dices el precio de varias cosas con *costano*.",
    ],
    frames: ["Oggi è il ___.", "Il caffè costa ___.", "I biscotti costano ___."],
    model: "Oggi è il dieci marzo. Il caffè costa un euro e venti. I biscotti costano tre euro.",
    seconds: [50, 40, 25],
  },
  "u04": {
    prompt: "Estás en un bar: saluda, pide algo con cortesía y pide la cuenta.",
    points: [
      "Saludas (*Buongiorno*).",
      "Pides con cortesía (*Vorrei… per favore*).",
      "Pides la cuenta (*Posso avere il conto?*).",
    ],
    frames: ["Buongiorno! Vorrei ___, per favore.", "Posso avere ___?"],
    model: "Buongiorno! Vorrei un cappuccino e un cornetto, per favore. Posso avere il conto? Grazie.",
    seconds: [55, 45, 30],
  },
  "u05#A": {
    prompt: "Cuenta cómo vas a tres lugares: con qué transporte vas y a casa de quién.",
    points: [
      "Dices a qué lugar vas con *a* (*Vado a…*).",
      "Dices cómo vas con *in* o *a piedi* (*in autobus*, *in treno*).",
      "Dices a casa de quién vas con *da* (*Vado da…*).",
    ],
    frames: ["Vado al ___ in ___.", "Vado da ___ a piedi.", "Domani vado a ___ in ___."],
    model: "Vado al lavoro in autobus. Il sabato vado da Marco a piedi. Domani vado a Firenze in treno.",
    seconds: [55, 45, 30],
  },
  "u05#B": {
    prompt: "Explícale a alguien cómo llegar a la farmacia: qué hay derecho, a la derecha y a la izquierda.",
    points: [
      "Dices qué hay de frente con *dritto* (*Dritto c'è…*).",
      "Dices qué hay con *a destra* y *a sinistra*.",
      "Nombras al menos dos lugares con *c'è*.",
    ],
    frames: ["Dritto c'è ___.", "All'angolo, a destra, c'è ___.", "A sinistra c'è ___."],
    model: "Dritto c'è il semaforo. All'angolo, a destra, c'è la farmacia. A sinistra c'è il bar.",
    seconds: [50, 40, 28],
  },
  "u06#A": {
    prompt: "Muestra tus cosas: di qué es tuyo y qué es de otra persona, y señala algo cerca y algo lejos.",
    points: [
      "Usas posesivos con artículo (*la mia borsa*, *il mio cappello*).",
      "Señalas con *questa / quella* (cerca y lejos).",
      "Usas un posesivo en plural (*i miei amici*).",
    ],
    frames: ["Questa è la mia ___ (sustantivo femenino) e quella è la tua.", "Il mio ___ è ___.", "I miei ___ abitano a ___."],
    model: "Questa è la mia borsa e quella è la tua. Il mio cappello è nero. I miei amici abitano a Roma.",
    seconds: [55, 45, 30],
  },
  "u06#B": {
    prompt: "Describe lo que llevas puesto hoy, una prenda tuya y una prenda que te gusta.",
    points: [
      "Nombras prendas con su color después del sustantivo (*una maglietta bianca*).",
      "Dices cuál es tuya con un posesivo (*La mia giacca è verde*).",
      "Señalas algo que te gusta con *quel / quella*.",
    ],
    frames: ["Oggi porto una ___ e ___.", "La mia ___ è ___.", "Mi piace quel / quella ___."],
    model: "Oggi porto una maglietta bianca e pantaloni neri. La mia giacca è verde. Mi piace quel cappello rosso.",
    seconds: [55, 45, 30],
  },
  "u26": {
    prompt: "Presenta a tu familia: cuántos hermanos tienes, a qué se dedican tus padres y cómo es uno de tus familiares.",
    points: [
      "Dices cuántos hermanos tienes (*Ho una sorella e un fratello*).",
      "Dices a qué se dedican tus padres (*fa l'insegnante*, *è un medico*).",
      "Describes a una persona (*è alta*, *ha i capelli…*).",
    ],
    frames: ["Ho ___ e ___.", "Mia madre fa ___ e mio padre è ___.", "Mia sorella è ___ e ha i capelli ___."],
    model: "Ho una sorella e un fratello. Mia madre fa l'insegnante e mio padre è un medico. Mia sorella è alta e ha i capelli castani.",
    seconds: [60, 48, 35],
  },
  "u07#A": {
    prompt: "Cuenta tu rutina de la mañana, desde que te despiertas hasta que sales al trabajo.",
    points: [
      "Usas verbos reflexivos (*mi sveglio*, *mi alzo*, *mi lavo*).",
      "Ordenas con *poi* o *dopo*.",
      "Dices a qué hora haces algo (*alle…*).",
    ],
    frames: ["Di solito mi sveglio alle ___ e mi alzo ___.", "Poi mi lavo e prendo ___.", "Vado al lavoro alle ___."],
    model: "Di solito mi sveglio alle sette e mi alzo subito. Poi mi lavo e prendo un caffè. Vado al lavoro alle otto.",
    seconds: [60, 48, 35],
  },
  "u07#B": {
    prompt: "Cuéntale a un amigo qué estás haciendo ahora y cómo estás.",
    points: [
      "Dices qué haces ahora con *sto* + gerundio.",
      "Dices cómo estás (*sono stanco*, *sto bene*).",
      "Preguntas *Che stai facendo?*.",
    ],
    frames: ["Adesso sto ___ (gerundio).", "Sono ___ (stanco / stanca), ma sto ___.", "E tu, che stai ___?"],
    model: "Ciao! Adesso sto cucinando. Sono stanco, ma sto bene. E tu, che stai facendo?",
    seconds: [50, 40, 28],
  },
  "u08": {
    prompt: "Haz tres preguntas para conocer a alguien y cuenta qué haces con frecuencia y qué nunca haces.",
    points: [
      "Haces al menos tres preguntas con palabras interrogativas (*Come… ? Dove… ? Quanti…?*).",
      "Dices qué haces con frecuencia con *spesso*.",
      "Dices qué nunca haces con *non… mai*.",
    ],
    frames: ["Come ___? Dove ___? Quanti ___?", "Io vado spesso a / al ___.", "Non ___ mai ___."],
    model: "Come ti chiami? Dove abiti? Quanti anni hai? Io vado spesso al cinema, ma non mangio mai la carne.",
    seconds: [60, 48, 35],
  },
  "u27": {
    prompt: "Habla de tu tiempo libre y del tiempo que hace hoy.",
    points: [
      "Dices qué te gusta hacer con *mi piace* + infinitivo.",
      "Dices un deporte o pasatiempo con *giocare a…* o *guardare…*.",
      "Dices el tiempo de hoy (*c'è il sole*, *fa fresco*) y lo unes con *ma*.",
    ],
    frames: ["Nel mio tempo libero mi piace ___ e giocare a ___.", "Oggi c'è ___, ma fa ___."],
    model: "Nel mio tempo libero mi piace guardare film e giocare a calcio. Oggi c'è il sole, ma fa fresco.",
    seconds: [60, 48, 35],
  },
  "u09": {
    prompt: "Cuenta qué hiciste el fin de semana pasado (tres cosas) y algo que todavía no hiciste.",
    points: [
      "Cuentas lo que hiciste con *ho* + participio (*ho mangiato*).",
      "Usas al menos un participio irregular (*ho visto*, *ho fatto*).",
      "Dices algo que todavía no hiciste con *non… ancora* (*Non ho ancora finito…*).",
    ],
    frames: ["Sabato ho ___ (participio) con amici.", "Ho visto ___ e ho comprato ___.", "Non ho ancora ___ (participio)."],
    model: "Sabato ho mangiato una pizza con amici. Ho visto un film e ho comprato un libro. Non ho ancora finito il libro.",
    seconds: [60, 48, 35],
  },
  "u10": {
    prompt: "Cuenta un viaje: adónde fuiste, en qué viajaste, a qué hora llegaron y cuándo volvieron.",
    points: [
      "Dices adónde fuiste con *sono andato / andata* (el participio concuerda con quien habla).",
      "Dices a qué hora llegaron con *siamo arrivati alle…*.",
      "Dices cuándo volvieron con *siamo tornati…*.",
    ],
    frames: ["Sono andato / andata a ___ in ___.", "Siamo arrivati alle / all' ___.", "Siamo tornati ___."],
    model: "Sono andata a Firenze in treno. Siamo arrivati alle dieci. Siamo tornati lunedì sera.",
    seconds: [60, 48, 35],
  },
  "u11": {
    prompt: "Cuenta cómo era tu infancia y algo que pasó un día mientras jugabas.",
    points: [
      "Describes tu infancia con el imperfecto (*abitavo*, *giocavo*).",
      "Usas *mentre* + imperfecto para la acción de fondo.",
      "Cuentas lo que pasó de pronto con el *passato prossimo* (*ho trovato*).",
    ],
    frames: ["Da piccolo / piccola abitavo ___.", "D'estate giocavo ___.", "Un giorno, mentre ___, ho / sono ___."],
    model: "Da piccola abitavo in una casa grande con mio nonno. D'estate giocavo in giardino. Un giorno, mentre giocavo, ho trovato un gatto.",
    seconds: [65, 52, 38],
  },
  "u12": {
    prompt: "Compara dos ciudades, pide tres cosas en el mercado y di qué es lo más caro.",
    points: [
      "Comparas con *più… di* (*più grande di…*).",
      "Pides con partitivo (*del pane*, *dei pomodori*).",
      "Dices lo más caro con el superlativo (*il più caro*).",
    ],
    frames: ["___ è più ___ di ___.", "Vorrei del / della / dei / delle ___ e ___.", "Il ___ è il più caro del mercato (uno de los tres, en singular)."],
    model: "Roma è più grande di Torino, ma Torino è più tranquilla. Vorrei del pane, dei pomodori e del formaggio. Il formaggio è il più caro del mercato.",
    seconds: [65, 52, 38],
  },
  "u28": {
    prompt: "Estás en un restaurante: avisa que reservaste, cuenta tu alergia y pide la cuenta.",
    points: [
      "Dices que reservaste (*Ho prenotato per…*).",
      "Avisas de tu alergia o dieta (*Sono vegetariano*, *Sono allergico a…*).",
      "Pides la cuenta con cortesía (*Il conto, per favore*).",
    ],
    frames: ["Buonasera! Ho prenotato per ___ persone.", "Sono ___ e sono allergico / allergica a ___ (al, alla, alle).", "Il conto, per favore."],
    model: "Buonasera! Ho prenotato per due persone. Sono vegetariano e sono allergico alle noci. Il conto, per favore.",
    seconds: [60, 48, 35],
  },
};

export const getMonologue = (stepId: string): Monologue | undefined => MONOLOGOS[stepId];
export const hasMonologue = (stepId: string): boolean => stepId in MONOLOGOS;
export const monologueIds = (): string[] => Object.keys(MONOLOGOS);
