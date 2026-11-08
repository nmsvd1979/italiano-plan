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
};

export const getMonologue = (stepId: string): Monologue | undefined => MONOLOGOS[stepId];
export const hasMonologue = (stepId: string): boolean => stepId in MONOLOGOS;
export const monologueIds = (): string[] => Object.keys(MONOLOGOS);
