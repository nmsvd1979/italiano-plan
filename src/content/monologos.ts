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
  "u13": {
    prompt: "Estás en una tienda: cuenta que compraste una chaqueta, que no te queda, que quieres devolverla y cuánto pagaste.",
    points: [
      "Explicas el problema (*è troppo piccola*).",
      "Usas el pronombre directo (*Vorrei restituirla*, *L'ho pagata…*).",
      "Dices cuánto pagaste y que conservas el recibo (*lo scontrino*).",
    ],
    frames: ["Ho comprato ___ ieri, ma è troppo ___.", "Vorrei restituirlo / restituirla.", "L'ho pagato / pagata ___ euro e ho ancora lo scontrino."],
    model: "Buongiorno, ho comprato questa giacca ieri, ma è troppo piccola. Vorrei restituirla. L'ho pagata trenta euro e ho ancora lo scontrino.",
    seconds: [65, 52, 38],
  },
  "u14#A": {
    prompt: "Cuenta adónde vas cada semana, cuánto demoras en llegar y qué compras con cantidad.",
    points: [
      "Usas *ci* para el lugar (*ci vado a piedi*).",
      "Dices cuánto toma con *ci vuole* (*Ci vuole un'ora*).",
      "Usas *ne* para la cantidad (*ne vorrei due chili*).",
    ],
    frames: ["Vado a / al ___ ogni sabato: ci vado ___.", "Ci vuole / Ci vogliono ___ per arrivare.", "Vorrei ___: ne vorrei ___."],
    model: "Vado al mercato ogni sabato: ci vado a piedi. Ci vuole un'ora per arrivare. Vorrei delle mele: ne vorrei due chili.",
    seconds: [65, 52, 38],
  },
  "u14#B": {
    prompt: "Dale indicaciones a un turista (trato formal) para llegar a la estación y adónde bajar en metro.",
    points: [
      "Usas el imperativo formal (*vada*, *giri*, *prenda*, *scenda*).",
      "Dices hasta dónde con *fino a* y la dirección (*a destra*).",
      "Dices dónde queda la estación (*dopo il ponte*).",
    ],
    frames: ["Vada dritto fino a / al / alla ___ e giri a ___.", "La stazione è dopo il / la ___.", "Prenda la metro e scenda a ___."],
    model: "Vada dritto fino al semaforo e giri a destra. La stazione è dopo il ponte. Prenda la metro e scenda a Termini.",
    seconds: [65, 52, 38],
  },
  "u15#A": {
    prompt: "Cuenta tus planes para el próximo año: adónde irás, qué estudiarás y qué esperas.",
    points: [
      "Usas el futuro (*andrò*, *studierò*, *visiterò*).",
      "Dices cuándo con *l'anno prossimo* o *tra…*.",
      "Dices lo que esperas o lo incierto (*spero di…*, *forse*).",
    ],
    frames: ["L'anno prossimo andrò ___ e studierò ___.", "Visiterò ___ e forse ___.", "Spero di ___."],
    model: "L'anno prossimo andrò in Italia e studierò italiano ogni giorno. Visiterò Roma e forse Firenze. Spero di tornare in Italia in estate.",
    seconds: [65, 52, 38],
  },
  "u15#B": {
    prompt: "Invita a una amiga a una fiesta con cortesía: pídele un favor, dale un consejo y dile qué pasa si viene.",
    points: [
      "Pides un favor con cortesía (*Potresti…?*).",
      "Das un consejo con *dovresti* + infinitivo.",
      "Dices qué pasa si viene con *se* + presente (*Se vieni, …*).",
    ],
    frames: ["Ciao ___! Sabato c'è una festa a casa mia: vieni?", "Potresti portare ___? Dovresti prendere ___.", "Se vieni, sono molto contento / contenta."],
    model: "Ciao Anna! Sabato c'è una festa a casa mia: vieni? Potresti portare un dolce? Dovresti prendere un taxi, perché casa mia è lontana. Se vieni, sono molto contenta.",
    seconds: [70, 56, 40],
  },
  "u16": {
    prompt: "Le escribes a una amiga porque te sientes mal: cuéntale qué te duele y pídele ayuda con cortesía.",
    points: [
      "Dices que no estás bien (*non sto bene*).",
      "Dices qué tienes (*Ho mal di testa*, *un po' di febbre*).",
      "Pides ayuda con cortesía (*Mi serve…*, *puoi aiutarmi, per favore?*).",
    ],
    frames: ["Oggi non sto bene. Ho ___ e un po' di ___.", "Mi serve ___.", "Puoi aiutarmi, per favore?"],
    model: "Ciao Anna, oggi non sto bene. Ho mal di testa e un po' di febbre. Mi serve una farmacia vicina: puoi aiutarmi, per favore?",
    seconds: [65, 52, 38],
  },
  "u17": {
    prompt: "Llamas por un anuncio de arriendo: di qué buscas, pregunta el precio y los gastos, y propón cuándo verlo.",
    points: [
      "Dices qué buscas (*Cerco un appartamento in affitto…*).",
      "Preguntas el precio y los gastos (*Quanto costa l'affitto? Le spese sono incluse?*).",
      "Propones cuándo verlo (*Vorrei vederlo sabato mattina*).",
    ],
    frames: ["Buongiorno, cerco ___ in affitto vicino a / al ___.", "Quanto costa ___? Le spese sono ___?", "Vorrei vederlo ___."],
    model: "Buongiorno, cerco un appartamento in affitto vicino al centro. Quanto costa l'affitto al mese? Le spese sono incluse? Vorrei vederlo sabato mattina.",
    seconds: [70, 56, 40],
  },
  "u18": {
    prompt: "Llamas por teléfono: preséntate, pide hablar con alguien y di que llamarás de nuevo.",
    points: [
      "Te presentas al teléfono (*Pronto? Sono…*).",
      "Pides hablar con alguien (*Posso parlare con…?*).",
      "Dices que llamarás más tarde (*Ti richiamo tra…*).",
    ],
    frames: ["Pronto? Sono ___.", "Posso parlare con ___?", "Ti richiamo tra ___ minuti."],
    model: "Pronto? Sono Laura. Posso parlare con Marco? Ah, sei tu! Ti richiamo tra dieci minuti.",
    seconds: [60, 48, 35],
  },
  "u19": {
    prompt: "Presenta tu ciudad, cuánto hace que vives allí, que estudias italiano y cuándo llegaste a Italia.",
    points: [
      "Dices desde cuándo con *da* (*abito qui da dieci anni*, *studio italiano da tre mesi*).",
      "Describes lo que se hace con *si* impersonal (*si mangia bene*, *si può visitare…*).",
      "Dices hace cuánto que pasó algo con *fa* (*tre giorni fa*).",
    ],
    frames: ["Abito a ___ da ___.", "Studio italiano da ___. A ___ si mangia ___.", "Sono arrivato / arrivata a ___ ___ giorni fa."],
    model: "Mi chiamo Laura e abito a Santiago da dieci anni. Studio italiano da tre mesi e mi piace molto. A Santiago si mangia bene e si può visitare la montagna. Sono arrivata in Italia tre giorni fa.",
    seconds: [75, 60, 45],
  },
  "u20": {
    prompt: "Cuenta lo que te dijo un amigo ayer, une las ideas con conectores y da tu opinión.",
    points: [
      "Cuentas lo que dijo con *mi ha detto che…*.",
      "Unes ideas con *quindi*, *però* o *comunque*.",
      "Das tu opinión con *secondo me*.",
    ],
    frames: ["Ieri ___ mi ha detto che ___, quindi ___.", "Comunque secondo me ___."],
    model: "Ieri Marco mi ha detto che era stanco, quindi non è venuto alla festa. Comunque secondo me è stata una buona decisione.",
    seconds: [70, 56, 40],
  },
  "u24": {
    prompt: "Cuenta un viaje del año pasado: qué hiciste, cómo era el tiempo, qué opinas y qué harías con más tiempo.",
    points: [
      "Cuentas lo que hiciste con el *passato prossimo* y ordenas con *prima… poi…*.",
      "Describes cómo era con el imperfecto (*faceva caldo*).",
      "Das tu opinión (*Penso che sia stata…*) y dices qué harías con más tiempo (*Se avessi più tempo, resterei…*).",
    ],
    frames: ["L'anno scorso sono andato / andata ___ con ___.", "Faceva ___ e il cielo era ___.", "Prima abbiamo visitato ___, poi siamo andati / andate a ___.", "Penso che sia stato / stata ___. Se avessi più tempo, ___."],
    model: "L'anno scorso sono andata in Italia con un'amica. Faceva caldo e il cielo era azzurro. Prima abbiamo visitato Roma, poi siamo andate a Firenze in treno. Penso che sia stata un'esperienza bellissima. Se avessi più tempo, resterei un mese.",
    seconds: [110, 90, 70],
  },
};

export const getMonologue = (stepId: string): Monologue | undefined => MONOLOGOS[stepId];
export const hasMonologue = (stepId: string): boolean => stepId in MONOLOGOS;
export const monologueIds = (): string[] => Object.keys(MONOLOGOS);
