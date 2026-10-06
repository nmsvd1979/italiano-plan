export interface DialogueLine {
  who: "A" | "B";
  it: string;
  es: string;
}

export interface Dialogue {
  /** Quién es cada rol, para elegir cuál interpretas. */
  roles: { A: string; B: string };
  /** El papel que se propone por defecto al aprendiz (el que pide, compra o pregunta). */
  you?: "A" | "B";
  /** La escena, en una frase. */
  setting: string;
  lines: DialogueLine[];
}

const l = (who: "A" | "B", it: string, es: string): DialogueLine => ({ who, it, es });

/** Diálogos cortos para leer, escuchar y decir en voz alta (sin micrófono: tú te oyes y te corriges). */
const DIALOGUES: Record<string, Dialogue> = {
  u01: {
    roles: { A: "Recepcionista", B: "Huésped" },
    setting: "Llegas a un hotel en Italia y te presentas.",
    lines: [
      l("A", "Buongiorno, signora! Benvenuta.", "Buenos días, señora. Bienvenida."),
      l("B", "Buongiorno! Sono Laura Rossi. Ho una prenotazione.", "Buenos días. Soy Laura Rossi. Tengo una reserva."),
      l("A", "Piacere, signora Rossi. Lei è italiana?", "Mucho gusto, señora Rossi. ¿Usted es italiana?"),
      l("B", "No, sono straniera. Sono qui in vacanza.", "No, soy extranjera. Estoy aquí de vacaciones."),
      l("A", "Che bello! Come sta?", "¡Qué lindo! ¿Cómo está?"),
      l("B", "Bene, grazie. E Lei?", "Bien, gracias. ¿Y usted?"),
      l("A", "Bene, grazie. Ecco la chiave: camera dodici.", "Bien, gracias. Aquí está la llave: habitación doce."),
      l("B", "Grazie mille! Arrivederci.", "¡Muchas gracias! Hasta luego."),
    ],
  },
  u02: {
    roles: { A: "Amigo", B: "Marco" },
    setting: "Un amigo te pregunta por tu departamento nuevo.",
    lines: [
      l("A", "Ciao Marco! Hai un appartamento nuovo?", "¡Hola Marco! ¿Tienes un departamento nuevo?"),
      l("B", "Sì! C'è una cucina grande e ci sono due camere.", "¡Sí! Hay una cocina grande y dos habitaciones."),
      l("A", "Che bello! Ci sono negozi vicino?", "¡Qué lindo! ¿Hay tiendas cerca?"),
      l("B", "Sì, c'è un supermercato e ci sono due bar in piazza.", "Sí, hay un supermercado y dos bares en la plaza."),
      l("A", "Mi piacciono i bar italiani!", "¡Me gustan los bares italianos!"),
      l("B", "A me piace il caffè. Ho una camera per te.", "A mí me gusta el café. Tengo una habitación para ti."),
    ],
  },
  u03: {
    roles: { A: "Pasajero", B: "Boletería" },
    you: "A",
    setting: "Compras un boleto de tren en la boletería.",
    lines: [
      l("A", "Un biglietto per Firenze, per favore.", "Un boleto a Florencia, por favor."),
      l("B", "Certo. Per che ora?", "Claro. ¿Para qué hora?"),
      l("A", "Alle diciotto e trenta.", "A las 18:30."),
      l("B", "C'è un treno alle diciotto e quarantacinque.", "Hay un tren a las 18:45."),
      l("A", "Va bene. Quanto costa?", "Está bien. ¿Cuánto cuesta?"),
      l("B", "Costa ventidue euro e cinquanta.", "Cuesta 22,50 euros."),
      l("A", "Ecco venticinque euro.", "Aquí tiene veinticinco euros."),
      l("B", "Ecco il resto: due euro e cinquanta. Buon viaggio!", "Aquí está el vuelto: 2,50 euros. ¡Buen viaje!"),
    ],
  },
  u04: {
    roles: { A: "Camarero", B: "Cliente" },
    setting: "Pides el desayuno en un bar.",
    lines: [
      l("A", "Buongiorno! Cosa prende?", "¡Buenos días! ¿Qué va a tomar?"),
      l("B", "Vorrei un cappuccino e un cornetto, per favore.", "Quisiera un capuchino y un croissant, por favor."),
      l("A", "Subito. Vuole altro?", "Enseguida. ¿Quiere algo más?"),
      l("B", "Sì, posso avere un bicchiere d'acqua?", "Sí, ¿puedo pedir un vaso de agua?"),
      l("A", "Certo, ecco.", "Claro, aquí tiene."),
      l("B", "Posso avere il conto?", "¿Puedo pedir la cuenta?"),
      l("A", "Sono quattro euro e cinquanta.", "Son 4,50 euros."),
      l("B", "Ecco. Grazie e arrivederci!", "Aquí tiene. ¡Gracias y hasta luego!"),
    ],
  },
  u05: {
    roles: { A: "Turista", B: "Pasante" },
    you: "A",
    setting: "Preguntas cómo llegar a la estación.",
    lines: [
      l("A", "Scusi, dov'è la stazione?", "Disculpe, ¿dónde está la estación?"),
      l("B", "È a sinistra, vicino al semaforo.", "Está a la izquierda, cerca del semáforo."),
      l("A", "È lontano?", "¿Está lejos?"),
      l("B", "No, a piedi sono cinque minuti.", "No, a pie son cinco minutos."),
      l("A", "Grazie! Vado a Firenze in treno.", "¡Gracias! Voy a Florencia en tren."),
      l("B", "Buon viaggio!", "¡Buen viaje!"),
    ],
  },
  u06: {
    roles: { A: "Vendedora", B: "Cliente" },
    setting: "Compras una chaqueta en una tienda.",
    lines: [
      l("A", "Buongiorno, posso aiutarla?", "Buenos días, ¿puedo ayudarla?"),
      l("B", "Sì, cerco una giacca nera.", "Sí, busco una chaqueta negra."),
      l("A", "Questa giacca è molto bella. Che taglia porta?", "Esta chaqueta es muy linda. ¿Qué talla usa?"),
      l("B", "Porto la quarantaquattro. Posso provare quella verde?", "Uso la cuarenta y cuatro. ¿Puedo probarme esa verde?"),
      l("A", "Certo, il camerino è là.", "Claro, el probador está allá."),
      l("B", "Quanto costa?", "¿Cuánto cuesta?"),
      l("A", "Costa sessanta euro.", "Cuesta sesenta euros."),
      l("B", "La prendo, grazie.", "La llevo, gracias."),
    ],
  },
  u07: {
    roles: { A: "Amiga", B: "Sara" },
    setting: "Dos amigas conversan por teléfono sobre su día.",
    lines: [
      l("A", "Ciao Sara, che stai facendo?", "Hola Sara, ¿qué estás haciendo?"),
      l("B", "Sto cucinando. E tu?", "Estoy cocinando. ¿Y tú?"),
      l("A", "Sto studiando. A che ora ti alzi domani?", "Estoy estudiando. ¿A qué hora te levantas mañana?"),
      l("B", "Mi alzo alle sette. Di solito mi sveglio presto.", "Me levanto a las siete. Normalmente me despierto temprano."),
      l("A", "Anch'io. Ci sentiamo dopo cena?", "Yo también. ¿Hablamos después de cenar?"),
      l("B", "Sì, dopo cena sono libera.", "Sí, después de cenar estoy libre."),
      l("A", "Perfetto, a dopo!", "¡Perfecto, hasta luego!"),
    ],
  },
  u08: {
    roles: { A: "Marta", B: "Paolo" },
    setting: "Se conocen en un curso de italiano.",
    lines: [
      l("A", "Ciao, come ti chiami?", "Hola, ¿cómo te llamas?"),
      l("B", "Mi chiamo Paolo. E tu?", "Me llamo Paolo. ¿Y tú?"),
      l("A", "Marta. Dove abiti, Paolo?", "Marta. ¿Dónde vives, Paolo?"),
      l("B", "Abito a Bologna. Quanti anni hai?", "Vivo en Bolonia. ¿Cuántos años tienes?"),
      l("A", "Ho ventotto anni. Perché studi italiano?", "Tengo 28 años. ¿Por qué estudias italiano?"),
      l("B", "Perché voglio vivere in Italia. Non capisco ancora niente!", "Porque quiero vivir en Italia. ¡Todavía no entiendo nada!"),
      l("A", "Non è vero, parli molto bene!", "No es verdad, ¡hablas muy bien!"),
    ],
  },
  u09: {
    roles: { A: "Amiga", B: "Tú" },
    setting: "Cuentas qué hiciste el fin de semana.",
    lines: [
      l("A", "Che cosa hai fatto sabato?", "¿Qué hiciste el sábado?"),
      l("B", "Ho visitato il Colosseo con degli amici.", "Visité el Coliseo con unos amigos."),
      l("A", "Avete mangiato fuori?", "¿Comieron afuera?"),
      l("B", "Sì, abbiamo mangiato una pizza fantastica.", "Sí, comimos una pizza fantástica."),
      l("A", "Hai già visto la Fontana di Trevi?", "¿Ya viste la Fontana di Trevi?"),
      l("B", "Non ancora. E tu, hai già comprato i biglietti?", "Todavía no. Y tú, ¿ya compraste los boletos?"),
      l("A", "Sì, li ho comprati ieri.", "Sí, los compré ayer."),
    ],
  },
  u10: {
    roles: { A: "Amiga", B: "Viajera" },
    setting: "Una amiga te pregunta por tu viaje.",
    lines: [
      l("A", "Sei tornata ieri?", "¿Volviste ayer?"),
      l("B", "Sì, sono arrivata ieri sera.", "Sí, llegué anoche."),
      l("A", "Dove sei andata?", "¿Adónde fuiste?"),
      l("B", "Sono andata a Firenze in treno con delle amiche.", "Fui a Florencia en tren con unas amigas."),
      l("A", "Siete state lì una settimana?", "¿Estuvieron allá una semana?"),
      l("B", "Sì, siamo partite domenica e siamo tornate sabato.", "Sí, salimos el domingo y volvimos el sábado."),
      l("A", "Che bel viaggio!", "¡Qué lindo viaje!"),
      l("B", "Mi sono divertita molto.", "Me divertí mucho."),
    ],
  },
  u11: {
    roles: { A: "Amigo", B: "Tú" },
    setting: "Cuentas cómo era tu infancia.",
    lines: [
      l("A", "Dove abitavi da piccola?", "¿Dónde vivías de chica?"),
      l("B", "Abitavo a Torino con i miei nonni.", "Vivía en Turín con mis abuelos."),
      l("A", "Com'era la tua casa?", "¿Cómo era tu casa?"),
      l("B", "Era grande e aveva un giardino.", "Era grande y tenía un jardín."),
      l("A", "Che cosa facevi d'estate?", "¿Qué hacías en verano?"),
      l("B", "Giocavo in giardino con mio fratello.", "Jugaba en el jardín con mi hermano."),
      l("A", "E la scuola?", "¿Y la escuela?"),
      l("B", "Mentre andavo a scuola, incontravo sempre il mio amico Luca.", "Mientras iba a la escuela, siempre me encontraba con mi amigo Luca."),
    ],
  },
  u12: {
    roles: { A: "Cliente", B: "Verdulero" },
    you: "A",
    setting: "Compras en el mercado.",
    lines: [
      l("A", "Buongiorno, vorrei del pane e dei pomodori.", "Buenos días, quisiera pan y unos tomates."),
      l("B", "Ecco. I pomodori di oggi sono più buoni di quelli di ieri.", "Aquí tiene. Los tomates de hoy son mejores que los de ayer."),
      l("A", "Quanto costano?", "¿Cuánto cuestan?"),
      l("B", "Tre euro al chilo.", "Tres euros el kilo."),
      l("A", "Il formaggio è buono?", "¿El queso es bueno?"),
      l("B", "Sì, è il migliore del mercato!", "¡Sí, es el mejor del mercado!"),
      l("A", "Allora un etto di formaggio, per favore.", "Entonces cien gramos de queso, por favor."),
      l("B", "Altro? — No, grazie. Va bene così.", "¿Algo más? — No, gracias. Así está bien."),
    ],
  },
  u13: {
    roles: { A: "Cliente", B: "Vendedor" },
    you: "A",
    setting: "Devuelves una chaqueta que te quedó chica.",
    lines: [
      l("A", "Buongiorno, ho comprato questa giacca ieri, ma è troppo piccola.", "Buenos días, compré esta chaqueta ayer, pero me queda muy chica."),
      l("B", "Vuole restituirla?", "¿Quiere devolverla?"),
      l("A", "Sì, ho ancora lo scontrino.", "Sí, todavía tengo el recibo."),
      l("B", "La può cambiare con una taglia più grande.", "Puede cambiarla por una talla más grande."),
      l("A", "Perfetto. La provo subito.", "Perfecto. Me la pruebo enseguida."),
      l("B", "Ecco la taglia grande. Le va bene?", "Aquí está la talla más grande. ¿Le queda bien?"),
      l("A", "Sì, la prendo!", "¡Sí, me la llevo!"),
    ],
  },
  u14: {
    roles: { A: "Turista", B: "Pasante" },
    you: "A",
    setting: "Pides indicaciones con el trato formal.",
    lines: [
      l("A", "Scusi, per andare alla stazione?", "Disculpe, ¿cómo llego a la estación?"),
      l("B", "Vada dritto e giri a destra al semaforo.", "Siga derecho y gire a la derecha en el semáforo."),
      l("A", "Devo attraversare il ponte?", "¿Tengo que cruzar el puente?"),
      l("B", "Sì, attraversi il ponte e continui fino alla piazza.", "Sí, cruce el puente y siga hasta la plaza."),
      l("A", "È lontano?", "¿Está lejos?"),
      l("B", "No, dieci minuti a piedi.", "No, diez minutos a pie."),
      l("A", "Grazie mille!", "¡Muchas gracias!"),
      l("B", "Prego.", "De nada."),
    ],
  },
  u15: {
    roles: { A: "Amiga", B: "Tú" },
    setting: "Hablas de tus planes para el próximo año.",
    lines: [
      l("A", "Che programmi hai per l'anno prossimo?", "¿Qué planes tienes para el año próximo?"),
      l("B", "Andrò in Italia e studierò italiano.", "Iré a Italia y estudiaré italiano."),
      l("A", "Dove abiterai?", "¿Dónde vivirás?"),
      l("B", "Forse a Bologna. Mi dai un consiglio?", "Quizás en Bolonia. ¿Me das un consejo?"),
      l("A", "Dovresti cercare una camera presto.", "Deberías buscar una habitación pronto."),
      l("B", "Hai ragione! Cercherò domani.", "¡Tienes razón! Buscaré mañana."),
      l("A", "Potresti mandarmi una foto della città?", "¿Podrías mandarme una foto de la ciudad?"),
      l("B", "Certo, te la mando!", "¡Claro, te la mando!"),
    ],
  },
};

export function getDialogue(unit: string): Dialogue | undefined {
  return DIALOGUES[unit];
}
