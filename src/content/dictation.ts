export interface DictationItem {
  it: string;
  es: string;
}

/** Frases cortas (A1-A2) con el vocabulario y la gramática de cada unidad. */
const DICTATION: Record<string, DictationItem[]> = {
  u01: [
    { it: "Buongiorno, sono Laura.", es: "Buenos días, soy Laura." },
    { it: "Come sta, signora?", es: "¿Cómo está, señora?" },
    { it: "Sono di Roma.", es: "Soy de Roma." },
    { it: "Siamo in vacanza.", es: "Estamos de vacaciones." },
    { it: "Mi chiamo Marco.", es: "Me llamo Marco." },
    { it: "Arrivederci e grazie.", es: "Hasta luego y gracias." },
  ],
  u02: [
    { it: "Ci sono due bar in piazza.", es: "Hay dos bares en la plaza." },
    { it: "C'è un supermercato vicino.", es: "Hay un supermercado cerca." },
    { it: "Ho un appartamento con una camera.", es: "Tengo un departamento / apartamento con una habitación." },
    { it: "Mi piace il caffè.", es: "Me gusta el café." },
    { it: "Gli studenti hanno gli zaini.", es: "Los estudiantes tienen las mochilas." },
    { it: "Hai fame?", es: "¿Tienes hambre?" },
  ],
  u03: [
    { it: "Sono le otto e mezza.", es: "Son las ocho y media." },
    { it: "Il treno parte alle diciotto e trenta.", es: "El tren sale a las 18:30." },
    { it: "Costa dodici euro e cinquanta.", es: "Cuesta 12,50 euros." },
    { it: "Oggi è martedì, sei ottobre.", es: "Hoy es martes, 6 de octubre." },
    { it: "Ho ventotto anni.", es: "Tengo 28 años." },
    { it: "Il museo apre alle nove.", es: "El museo abre a las nueve." },
  ],
  u04: [
    { it: "Vorrei un caffè, per favore.", es: "Quisiera un café, por favor." },
    { it: "Posso avere il conto?", es: "¿Puedo pedir la cuenta?" },
    { it: "Prendo un cappuccino e un cornetto.", es: "Tomo un capuchino y un croissant." },
    { it: "Dobbiamo prenotare un tavolo.", es: "Tenemos que reservar una mesa." },
    { it: "Non capisco: può ripetere?", es: "No entiendo: ¿puede repetir?" },
    { it: "Finisco di lavorare alle otto.", es: "Termino de trabajar a las ocho." },
  ],
  u05: [
    { it: "Vado a Roma in treno.", es: "Voy a Roma en tren." },
    { it: "Domani vado dal medico.", es: "Mañana voy al médico." },
    { it: "Il museo è nella piazza.", es: "El museo está en la plaza." },
    { it: "Scendo alla prossima fermata.", es: "Bajo en la próxima parada." },
    { it: "Esco dall'hotel alle nove.", es: "Salgo del hotel a las nueve." },
    { it: "Vorrei una camera doppia.", es: "Quisiera una habitación doble." },
  ],
  u06: [
    { it: "Questa borsa è mia.", es: "Este bolso es mío." },
    { it: "Quel cappello rosso è bello.", es: "Ese sombrero rojo es lindo." },
    { it: "Posso provare quella giacca?", es: "¿Puedo probarme esa chaqueta?" },
    { it: "Vorrei due magliette bianche.", es: "Quisiera dos camisetas blancas." },
    { it: "Che taglia porta?", es: "¿Qué talla usa?" },
    { it: "Di chi è questo zaino?", es: "¿De quién es esta mochila?" },
  ],
  u07: [
    { it: "Mi sveglio alle sette.", es: "Me despierto a las siete." },
    { it: "Di solito mi alzo presto.", es: "Normalmente me levanto temprano." },
    { it: "Sto cucinando la cena.", es: "Estoy cocinando la cena." },
    { it: "Dopo cena mi lavo i denti.", es: "Después de cenar me lavo los dientes." },
    { it: "Sono stanco, ma sto bene.", es: "Estoy cansado, pero estoy bien." },
    { it: "Che cosa stai facendo?", es: "¿Qué estás haciendo?" },
  ],
  u08: [
    { it: "Dove abiti?", es: "¿Dónde vives?" },
    { it: "Perché studi italiano?", es: "¿Por qué estudias italiano?" },
    { it: "Non capisco niente.", es: "No entiendo nada." },
    { it: "Non c'è nessuno qui.", es: "No hay nadie aquí." },
    { it: "Vado spesso al mercato.", es: "Voy a menudo al mercado." },
    { it: "Quanti anni hai?", es: "¿Cuántos años tienes?" },
  ],
  u09: [
    { it: "Ieri ho visitato il Colosseo.", es: "Ayer visité el Coliseo." },
    { it: "Abbiamo mangiato una pizza.", es: "Comimos una pizza." },
    { it: "Ho già comprato i biglietti.", es: "Ya compré los boletos / pasajes." },
    { it: "Non ho ancora visto la fontana.", es: "Todavía no vi la fuente." },
    { it: "Hai mai provato il tiramisù?", es: "¿Probaste alguna vez el tiramisú?" },
    { it: "Che cosa avete fatto sabato?", es: "¿Qué hicieron el sábado?" },
  ],
  u10: [
    { it: "Sono andata a Firenze in treno.", es: "Fui a Florencia en tren." },
    { it: "Siamo arrivati alle dieci.", es: "Llegamos a las diez." },
    { it: "Ieri mi sono alzato tardi.", es: "Ayer me levanté tarde." },
    { it: "Siete stati a Venezia?", es: "¿Estuvieron en Venecia?" },
    { it: "Le mie amiche sono partite.", es: "Mis amigas se fueron." },
    { it: "Sono nata a Milano.", es: "Nací en Milán." },
  ],
  u11: [
    { it: "Da piccola abitavo a Torino.", es: "De chica vivía en Turín." },
    { it: "Faceva freddo e pioveva.", es: "Hacía frío y llovía." },
    { it: "Mentre aspettavo il treno, ho letto un libro.", es: "Mientras esperaba el tren, leí un libro." },
    { it: "Di solito mangiavamo alle otto.", es: "Normalmente comíamos a las ocho." },
    { it: "Quando ero giovane, viaggiavo molto.", es: "Cuando era joven, viajaba mucho." },
    { it: "Ieri sera siamo andati al ristorante.", es: "Anoche fuimos al restaurante." },
  ],
  u12: [
    { it: "Roma è più grande di Torino.", es: "Roma es más grande que Turín." },
    { it: "Questo ristorante è il migliore.", es: "Este restaurante es el mejor." },
    { it: "La pizza è buonissima.", es: "La pizza está buenísima." },
    { it: "Vorrei del pane e dei pomodori.", es: "Quisiera pan y unos tomates." },
    { it: "Marco parla meglio di me.", es: "Marco habla mejor que yo." },
    { it: "Hai dell'acqua?", es: "¿Tienes agua?" },
  ],
  u13: [
    { it: "La giacca è bella: la compro.", es: "La chaqueta es linda: la compro." },
    { it: "L'ho visto ieri.", es: "Lo vi ayer." },
    { it: "Le telefono domani.", es: "La llamo mañana." },
    { it: "Vorrei restituirlo.", es: "Quisiera devolverlo." },
    { it: "Glielo do domani.", es: "Se lo doy mañana." },
    { it: "Li ho comprati ieri.", es: "Los compré ayer." },
  ],
  u14: [
    { it: "Vada dritto e giri a destra.", es: "Siga derecho y gire a la derecha." },
    { it: "Ne vorrei due fette.", es: "Quisiera dos rebanadas." },
    { it: "Ci vado ogni sabato.", es: "Voy todos los sábados." },
    { it: "Prenda la metro.", es: "Tome el metro." },
    { it: "Dimmi dov'è la fermata.", es: "Dime dónde está la parada." },
    { it: "Non parlare così in fretta.", es: "No hables tan rápido." },
  ],
  u15: [
    { it: "Domani visiterò il Colosseo.", es: "Mañana visitaré el Coliseo." },
    { it: "L'anno prossimo andrò a Roma.", es: "El año próximo iré a Roma." },
    { it: "Potrebbe ripetere, per favore?", es: "¿Podría repetir, por favor?" },
    { it: "Vorrei prenotare un tavolo.", es: "Quisiera reservar una mesa." },
    { it: "Dovresti prendere un taxi.", es: "Deberías tomar un taxi." },
    { it: "Sarà in ritardo.", es: "Debe de estar atrasado." },
  ],
};

export function getDictation(unit: string): DictationItem[] | undefined {
  return DICTATION[unit];
}
