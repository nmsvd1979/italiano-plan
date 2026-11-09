// «Dos frases propias» (docs/v2/plan-b1/06, 6b-1): una consigna corta por semana del curso (clave = id del paso) para escribir
// dos frases con lo recién visto. `mustInclude`: grupos de alternativas (basta una forma de cada grupo). `model`: dos frases
// que cumplen la consigna, que se ven después de intentarlo. `minWords` por defecto: 8.
export interface Propias {
  prompt: string;
  mustInclude: string[][];
  model: [string, string];
  minWords?: number;
}

export const DEFAULT_MIN_WORDS = 8;

const PROPIAS: Record<string, Propias> = {
  u25: { prompt: "Di cómo te llamas y de dónde eres, y pide que te repitan algo.", mustInclude: [["mi chiamo", "sono"], ["ripetere"]], model: ["Mi chiamo Laura e sono di Santiago.", "Puoi ripetere, per favore?"] },
  u01: { prompt: "Preséntate con formalidad: saluda según la hora y di que te da gusto conocerlos.", mustInclude: [["buongiorno", "buonasera", "salve"], ["piacere"]], model: ["Buonasera, piacere!", "Mi chiamo Laura e sono di Santiago."] },
  "u02#A": { prompt: "Di qué hay en tu habitación y qué te gusta de ella.", mustInclude: [["c'è", "ci sono"], ["mi piace", "mi piacciono"]], model: ["Nella mia camera c'è un letto e ci sono due sedie.", "Mi piace la finestra grande."] },
  "u02#B": { prompt: "Di dónde está una cosa de tu casa y cuántas cosas de otro tipo tienes.", mustInclude: [["vicino", "lontano", "sopra", "sotto", "accanto", "davanti", "dietro", "a destra", "a sinistra"], ["ho"]], model: ["Il tavolo è vicino alla finestra.", "Ho due sedie e un divano."] },
  "u03#A": { prompt: "Di a qué hora abre un lugar y cuánto cuesta algo.", mustInclude: [["alle"], ["costa", "costano"]], model: ["Il bar apre alle otto.", "Un caffè costa un euro."] },
  "u03#B": { prompt: "Escribe la fecha de hoy y la fecha de tu cumpleaños.", mustInclude: [["oggi"], ["compleanno"]], model: ["Oggi è il dieci novembre.", "Il mio compleanno è il tre marzo."] },
  u04: { prompt: "Pide algo en un bar con *vorrei* y di qué tienes que hacer hoy.", mustInclude: [["vorrei"], ["devo", "posso"]], model: ["Vorrei un caffè e un cornetto, per favore.", "Oggi devo studiare per un'ora."] },
  "u05#A": { prompt: "Di cómo vas al trabajo y adónde vas el fin de semana.", mustInclude: [["vado"], ["sabato", "domenica", "domani", "fine settimana", "weekend"]], model: ["Vado al lavoro in metro.", "Sabato vado da un amico."] },
  "u05#B": { prompt: "Escribe dos indicaciones para llegar a un lugar: qué hay de frente y qué hay a la derecha.", mustInclude: [["dritto", "diritto", "avanti"], ["a destra", "a sinistra"]], model: ["Sempre dritto c'è un semaforo.", "A destra c'è la farmacia."] },
  "u06#A": { prompt: "Describe una prenda tuya con su color.", mustInclude: [["la mia", "il mio", "i miei", "le mie"]], model: ["La mia giacca è verde.", "Il mio cappello è nero e molto bello."] },
  "u06#B": { prompt: "Señala dos prendas de una tienda con *quel* y *questa* (o *questo*).", mustInclude: [["quel", "quella", "quello", "quei", "quelle", "quell'"], ["questa", "questo", "questi", "queste"]], model: ["Quel cappello è molto bello.", "Questa gonna è rosa."] },
  u26: { prompt: "Cuenta a qué se dedica alguien de tu familia y cómo es otra persona.", mustInclude: [["mia madre", "mio padre", "mio fratello", "mia sorella", "mio nonno", "mia nonna", "mio zio", "mia zia", "mio cugino", "mia cugina", "mio marito", "mia moglie", "mio figlio", "mia figlia"], ["fa", "è"]], model: ["Mia madre fa l'insegnante.", "Mio fratello è alto e ha i capelli neri."] },
  "u07#A": { prompt: "Cuenta tu mañana con dos verbos reflexivos y ordénala con *poi* o *dopo*.", mustInclude: [["mi sveglio", "mi alzo", "mi lavo", "mi vesto", "mi faccio la doccia", "mi preparo", "mi riposo"], ["poi", "dopo"]], model: ["Mi sveglio alle sette e mi lavo.", "Poi prendo un caffè."] },
  "u07#B": { prompt: "Di qué estás haciendo ahora tú y qué hace otra persona.", mustInclude: [["sto"], ["sta", "stanno"]], model: ["Adesso sto leggendo un libro.", "Il mio amico sta dormendo."] },
  u08: { prompt: "Hazle a alguien nuevo dos preguntas con palabras interrogativas distintas.", mustInclude: [["dove", "di dove", "quando", "quanto", "quanti", "quante"], ["come", "perché", "che cosa", "cosa", "chi", "quale"]], model: ["Dove abiti e quanti anni hai?", "Perché studi italiano?"], minWords: 7 },
  u27: { prompt: "Di qué haces en tu tiempo libre y qué tiempo hace hoy.", mustInclude: [["gioco", "leggo", "faccio", "suono", "vado", "guardo", "ascolto", "nuoto", "corro", "esco", "cucino"], ["fa", "piove", "c'è il sole", "nevica", "c'è vento", "tira vento", "è nuvoloso"]], model: ["Nel tempo libero gioco a calcio.", "Oggi piove e fa freddo."] },
  u09: { prompt: "Cuenta dos cosas que hiciste ayer.", mustInclude: [["ho mangiato", "ho visto", "ho comprato", "ho fatto", "ho letto", "ho bevuto", "ho dormito", "ho studiato", "ho lavorato", "ho giocato", "ho cucinato", "ho parlato", "ho ascoltato", "ho guardato", "ho incontrato"], ["ieri"]], model: ["Ieri ho mangiato una pizza.", "Poi ho visto un film."] },
  u10: { prompt: "Di adónde fuiste y cuándo volviste.", mustInclude: [["sono andato", "sono andata", "siamo andati", "siamo andate", "sono stato", "sono stata", "siamo stati", "siamo state"], ["sono tornato", "sono tornata", "siamo tornati", "siamo tornate"]], model: ["Sono andata a Roma in treno.", "Sono tornata domenica sera."] },
  u11: { prompt: "Di cómo eras de niño o niña y qué hacías siempre.", mustInclude: [["da piccolo", "da piccola", "da bambino", "da bambina", "quando ero"], ["giocavo", "abitavo", "andavo", "mangiavo", "ero", "avevo", "facevo", "guardavo", "leggevo"]], model: ["Da piccola abitavo con mia nonna.", "Giocavo sempre in giardino."] },
  u12: { prompt: "Compara dos cosas que conoces (transportes, ciudades, comidas).", mustInclude: [["più", "meno"]], model: ["Il treno è più comodo dell'autobus.", "L'autobus costa meno."] },
  u28: { prompt: "Reserva una mesa y avisa de una preferencia o alergia.", mustInclude: [["prenotare", "ho prenotato", "un tavolo", "avete un tavolo"], ["sono allergico", "sono allergica", "sono vegetariano", "sono vegetariana", "non mangio", "sono celiaco", "sono celiaca", "senza glutine", "sono intollerante"]], model: ["Vorrei prenotare un tavolo per tre persone.", "Non mangio carne."] },
  u13: { prompt: "Cuenta qué hiciste con algo que compraste, con un pronombre (*l'ho…*).", mustInclude: [["l'ho", "li ho", "le ho"]], model: ["Ho comprato una giacca e l'ho pagata trenta euro.", "Ora la porto sempre."] },
  "u14#A": { prompt: "Dile a un turista (con *Lei*) cómo llegar a la estación.", mustInclude: [["vada", "giri", "prenda", "scenda", "attraversi", "continui", "segua", "torni"]], model: ["Vada dritto e giri a destra.", "La stazione è dopo il ponte."] },
  "u14#B": { prompt: "Dile a un amigo (con *tu*) qué hacer y qué no hacer.", mustInclude: [["vai", "gira", "prendi", "continua", "attraversa", "segui"], ["non dimenticare", "non attraversare", "non aspettare", "non andare", "non prendere", "non girare", "non fare", "non correre"]], model: ["Vai dritto e gira a sinistra.", "Non dimenticare le chiavi."] },
  "u15#A": { prompt: "Cuenta dos planes tuyos con futuro.", mustInclude: [["andrò", "farò", "studierò", "verrò", "partirò", "comprerò", "visiterò", "sarò", "avrò", "tornerò", "lavorerò", "vedrò", "resterò", "andremo", "faremo"]], model: ["Domani studierò due ore.", "L'anno prossimo andrò in Italia."] },
  "u15#B": { prompt: "Pide un favor con cortesía y da un consejo.", mustInclude: [["potresti", "potrebbe", "vorrei"], ["dovresti", "dovrebbe"]], model: ["Potresti aiutarmi con la valigia?", "Dovresti uscire presto, perché il treno parte alle sei."] },
  u16: { prompt: "Di qué te duele y qué necesitas.", mustInclude: [["ho mal di", "mi fa male", "mi fanno male"], ["mi serve", "mi servono", "ho bisogno di"]], model: ["Ho mal di testa e un po' di febbre.", "Mi serve una medicina."] },
  u17: { prompt: "Pregunta dos cosas sobre un departamento en alquiler.", mustInclude: [["quanto costa", "è arredato", "ascensore", "le spese", "quante camere", "quante stanze", "è libero", "posso vederlo", "riscaldamento"]], model: ["Quanto costa l'affitto al mese?", "Le spese sono incluse?"] },
  u18: { prompt: "Escribe el saludo y la despedida de un mensaje formal a un hotel.", mustInclude: [["gentile", "buongiorno"], ["cordiali saluti", "distinti saluti"]], model: ["Gentile Direzione, Le scrivo per chiedere informazioni su una camera.", "Cordiali saluti."] },
  u19: { prompt: "Di desde cuándo haces algo y qué se hace en tu ciudad.", mustInclude: [["da"], ["si mangia", "si può", "si beve", "si vede", "si mangiano", "si va", "si fa", "si parla", "si trova"]], model: ["Studio italiano da sei mesi.", "A Santiago si mangia molto bene."] },
  u20: { prompt: "Cuenta lo que te dijo alguien, con *mi ha detto che*.", mustInclude: [["mi ha detto che", "mi ha chiesto se", "mi hanno detto che"]], model: ["Marco mi ha detto che era stanco.", "Quindi non è venuto."] },
  u24: { prompt: "Cuenta un recuerdo de un viaje con *prima… poi…* y una descripción en imperfecto.", mustInclude: [["prima"], ["poi", "dopo"], ["era", "erano", "faceva", "c'era", "c'erano", "pioveva", "ero", "avevo"]], model: ["Prima abbiamo visitato Roma, poi siamo andati a Napoli.", "Faceva molto caldo."] },
  u21: { prompt: "Responde a una pregunta (por ejemplo, «¿me prestas el libro?») con un pronombre combinado (*te lo*, *gliela*…).", mustInclude: [["te lo", "te la", "te li", "te le", "me lo", "me la", "me li", "me le", "glielo", "gliela", "glieli", "gliele", "gliel'ho", "gliel'ha", "ce l'ho"]], model: ["Il libro? Te lo presto domani.", "La chiave gliel'ho data ieri."] },
  u22: { prompt: "Da una opinión con *penso che* y expresa una esperanza (*spero che* + otra persona, o *spero di* + infinitivo).", mustInclude: [["penso che", "credo che"], ["spero che", "spero di"]], model: ["Penso che sia una buona idea.", "Spero che tu venga con noi."] },
  u23: { prompt: "Di qué harías si tuvieras más tiempo o si pudieras elegir.", mustInclude: [["se avessi", "se fossi", "se potessi", "se avessimo", "se potessimo", "se fosse", "se ci fosse"]], model: ["Se avessi più tempo, viaggerei di più.", "Se potessi, andrei in Sicilia."] },
};

export const getPropias = (stepId: string): Propias | undefined => PROPIAS[stepId];
export const hasPropias = (stepId: string): boolean => stepId in PROPIAS;
export const allPropias = (): [string, Propias][] => Object.entries(PROPIAS);
