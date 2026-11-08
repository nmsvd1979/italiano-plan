// Monólogo guiado (docs/v2/plan-b1/02): una consigna por semana del curso para hablar sin leer, en tres vueltas con menos
// tiempo cada vez. Clave = id del paso (`u25`, `u02#B`). Por ahora hay dos de ejemplo; el resto llega en PR de contenido.

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
};

export const getMonologue = (stepId: string): Monologue | undefined => MONOLOGOS[stepId];
export const hasMonologue = (stepId: string): boolean => stepId in MONOLOGOS;
export const monologueIds = (): string[] => Object.keys(MONOLOGOS);
