// «Números a velocidad» (docs/v2/plan-b1/06, 6b-3): la persona oye un número en italiano, cada vez un poco más rápido, y lo escribe
// en cifras. Solo existe en las semanas donde se enseñan los números (u25, u01, u03). El texto en italiano sale de `numeroIt`; el test
// lo contrasta con una tabla escrita a mano, aparte.

const UNIDADES = ["zero", "uno", "due", "tre", "quattro", "cinque", "sei", "sette", "otto", "nove", "dieci", "undici", "dodici", "tredici", "quattordici", "quindici", "sedici", "diciassette", "diciotto", "diciannove"];
const DECINE = ["", "", "venti", "trenta", "quaranta", "cinquanta", "sessanta", "settanta", "ottanta", "novanta"];

/** El número (0 a 1000) en italiano: ventuno, ventotto, trentatré, centotto, centottanta, duecentoquarantotto. */
export function numeroIt(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 1000) throw new RangeError(`numeroIt: ${n} fuera de 0 a 1000`);
  if (n < 20) return UNIDADES[n];
  if (n < 100) {
    const d = Math.floor(n / 10);
    const u = n % 10;
    if (u === 0) return DECINE[d];
    // Delante de uno y de otto la decena pierde la vocal final; el tre lleva tilde.
    const base = u === 1 || u === 8 ? DECINE[d].slice(0, -1) : DECINE[d];
    return base + (u === 3 ? "tré" : UNIDADES[u]);
  }
  if (n === 1000) return "mille";
  const c = Math.floor(n / 100);
  const resto = n % 100;
  const centenas = c === 1 ? "cento" : `${UNIDADES[c]}cento`;
  if (resto === 0) return centenas;
  // *cento* pierde la o delante de *ottanta* y de los que empiezan con *otto* (centotto, centottanta).
  const sinO = resto === 8 || (resto >= 80 && resto < 90);
  return (sinO ? centenas.slice(0, -1) : centenas) + (resto === 3 ? "tré" : numeroIt(resto));
}

export interface NumeroItem {
  n: number;
  it: string;
}

/** Números de cada semana (id del paso). Mezclan los que suenan parecido (13/30, 14/40…) y las formas con elisión o tilde. */
const NUMEROS: Record<string, number[]> = {
  u25: [3, 8, 0, 5, 10, 7, 2, 9, 4, 1, 6, 12, 14, 11, 13],
  u01: [13, 30, 14, 40, 15, 50, 16, 60, 17, 70, 18, 80, 19, 90, 20],
  "u03#A": [21, 23, 28, 31, 33, 38, 45, 51, 56, 67, 73, 81, 88, 93, 99],
  "u03#B": [100, 101, 108, 115, 120, 180, 200, 248, 303, 418, 505, 650, 777, 999, 1000],
};

export const hasVelocidad = (stepId: string): boolean => stepId in NUMEROS;
export const getVelocidad = (stepId: string): NumeroItem[] | undefined => NUMEROS[stepId]?.map((n) => ({ n, it: numeroIt(n) }));
export const allVelocidad = (): NumeroItem[] => Object.values(NUMEROS).flatMap((l) => l.map((n) => ({ n, it: numeroIt(n) })));
