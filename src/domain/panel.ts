import { Area, AREAS, WEAK_AREA, type AreaScores, weakAreas } from "./evaluation";
import type { LogEntry } from "./activityLog";
import { addDays, toISODate } from "./dates";
import type { SrsState } from "./srs";
import type { Completions, PhaseTests } from "./storage";

// Datos del panel de progreso (docs/v2/06 F5). Todo sale de lo que ya se guarda en el dispositivo.

export type Strand = "lengua" | "input" | "output" | "fluidez" | "medicion";
export const STRAND_NAME: Record<Strand, string> = {
  lengua: "Lengua", input: "Input", output: "Output", fluidez: "Fluidez", medicion: "Medición",
};

/** Hebra de cada bloque del ciclo (criterio propio, a partir de las cuatro hebras de Nation más la medición). */
const STRAND_OF: Record<string, Strand> = {
  srs: "lengua", words: "lengua", words3: "lengua", words4: "lengua", words5: "lengua", sound: "lengua", relisten: "lengua",
  lesson: "lengua", guided: "lengua", varied: "lengua", dictation: "lengua", review: "lengua", failed: "lengua", failed2: "lengua",
  dialogue: "input", text: "input", questions: "input", input: "input", shorttext: "input",
  repeat: "output", roleplay: "output", compare: "output", own: "output", writing: "output", retell: "output", cando: "output",
  shadowing: "fluidez", speed: "fluidez",
  mini: "medicion",
};
export const strandOf = (activity: string): Strand | null => STRAND_OF[activity] ?? null;

const since = (today: Date, days: number): string => toISODate(addDays(today, -(days - 1)));

/** Minutos por hebra en los últimos `days` días (por defecto, la semana). */
export function strandMinutes(log: LogEntry[], today: Date, days = 7): Record<Strand, number> {
  const from = since(today, days);
  const out: Record<Strand, number> = { lengua: 0, input: 0, output: 0, fluidez: 0, medicion: 0 };
  for (const e of log) {
    const s = strandOf(e.activity);
    if (s && e.date >= from && e.minutes > 0) out[s] += e.minutes;
  }
  return out;
}

/** Aciertos por área sumando las pruebas de los últimos `days` días (mini-pruebas, fases y nivel). */
export function areaAccuracy(log: LogEntry[], today: Date, days = 30): AreaScores {
  const from = since(today, days);
  const out: AreaScores = {};
  for (const e of log) {
    const m = e.activity.match(/^(?:mini|fase\d|nivel):(\w+)$/);
    if (!m || e.date < from || e.total === undefined || e.correct === undefined) continue;
    const a = m[1] as Area;
    if (!AREAS.includes(a)) continue;
    const s = (out[a] ??= { correct: 0, total: 0 });
    s.correct += e.correct;
    s.total += e.total;
  }
  return out;
}

/**
 * Recuerdo real del repaso en los últimos `days` días: respuestas distintas de «Otra vez» en tarjetas ya vistas
 * (la primera respuesta de cada tarjeta es una presentación nueva y no cuenta).
 */
export function recallRate(srs: SrsState, today: Date, days = 30): { rate: number | null; answers: number } {
  const from = since(today, days);
  const seen = new Set<string>();
  let ok = 0;
  let n = 0;
  for (const e of srs.log) {
    const first = !seen.has(e.cardId);
    seen.add(e.cardId);
    if (first || toISODate(new Date(e.at)) < from) continue;
    n++;
    if (e.rating >= 2) ok++;
  }
  return { rate: n === 0 ? null : ok / n, answers: n };
}

/** Palabras activas: tarjetas de reconocer o escribir con estabilidad ≥ 21 días (cada palabra cuenta una vez). */
export function activeWords(srs: SrsState): number {
  const words = new Set<string>();
  for (const c of Object.values(srs.cards)) {
    if ((c.kind === "recog" || c.kind === "prod") && c.fsrs.stability >= 21) words.add(c.itemId);
  }
  return words.size;
}

/** Días con algo marcado en los últimos `days` días, de más antiguo a hoy. */
export function studiedDays(completions: Completions, today: Date, days = 14): { date: string; studied: boolean }[] {
  return Array.from({ length: days }, (_, i) => {
    const date = toISODate(addDays(today, i - (days - 1)));
    return { date, studied: Object.values(completions[date] ?? {}).some(Boolean) };
  });
}

/** Áreas flojas (< 70 %) de la prueba de fase anterior a la fase en la que estás: la fase siguiente suma refuerzo de esas áreas. */
export function reinforcementAreas(tests: PhaseTests, currentPhase: number): Area[] {
  const list = tests[String(currentPhase - 1)];
  const last = list?.[list.length - 1];
  if (!last?.byArea) return [];
  return weakAreas(last.byArea as AreaScores);
}

export { WEAK_AREA };
