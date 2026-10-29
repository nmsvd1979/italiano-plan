import { getUnit } from "../content/curriculum";
import { findExercise } from "../content/grammar";
import { getDictation } from "../content/dictation";
import { addDays, diffInDays, parseISODate, startOfDay, toISODate } from "./dates";
import type { UnitView, Verdict } from "./continuity";
import { loadContinuity, saveContinuity } from "./continuity";
import type { ReviewState } from "./review";
import { dayOf, loadSrs, saveSrs, seedSrsCard, type SrsCard } from "./srs";
import { sentenceItemId, wordsOfUnit } from "./srsDeck";
import { getReview, type KV } from "./storage";

// Siembra del repaso espaciado desde el progreso previo (docs/v2/14 §6).
// Solo AGREGA tarjetas en `italianPlan.srs.v1`: nunca cambia ni borra una tarjeta que ya exista, y no toca
// ninguna clave antigua (el Leitner de `review` se lee, no se modifica). Es idempotente.

/** Tope de tarjetas sembradas con vencimiento el mismo día, contando las que ya tenías. */
export const SEED_PER_DAY = 25;
/** Los vencimientos se reparten en estos días, desde mañana. */
export const SEED_WINDOW_DAYS = 14;

/** Estado inicial (docs/v2/14 §6): estabilidad en días y dificultad FSRS (1 a 10). */
export const SEED_STATE: Record<"dominada" | "repasar" | "lapso", { stability: number; difficulty: number }> = {
  dominada: { stability: 7, difficulty: 5 },
  repasar: { stability: 2, difficulty: 6 },
  /** Ejercicio que fallaste y tienes en el repaso por cajas: una tarjeta con 1 lapso. */
  lapso: { stability: 1, difficulty: 7 },
};

type Seedable = Exclude<Verdict, "rehacer">;

interface Candidate {
  kind: SrsCard["kind"];
  itemId: string;
  unit: string;
  state: keyof typeof SEED_STATE;
  /** Día más temprano permitido (0 = hoy, 1 = mañana). */
  earliest: number;
  lapses: number;
}

export interface SeedPlan {
  cards: SrsCard[];
  /** Unidades que quedan sembradas con esta pasada. */
  units: string[];
  /** Tarjetas que no entraron en los 14 días y quedan como palabras nuevas normales de la cola. */
  left: number;
}

/** Unidades que se siembran: dominadas o por repasar, con contenido, que no se sembraron antes. */
export function seedableUnits(views: UnitView[], already: readonly string[]): { unit: string; verdict: Seedable }[] {
  return views
    .filter((v) => v.unit.ready && v.unit.n <= 24 && (v.verdict === "dominada" || v.verdict === "repasar") && !already.includes(v.unit.id))
    .map((v) => ({ unit: v.unit.id, verdict: v.verdict as Seedable }));
}

/** Candidatas en orden de prioridad: fallos del repaso, luego lo que toca repasar, luego lo dominado; lo más reciente primero. */
function candidates(units: { unit: string; verdict: Seedable }[], review: ReviewState, today: Date): Candidate[] {
  const byRecent = [...units].sort((a, b) => (getUnit(b.unit)?.n ?? 0) - (getUnit(a.unit)?.n ?? 0));
  const out: Candidate[] = [];

  // Ejercicios de completar que fallaste y siguen en el repaso por cajas: vencen en su fecha original (o mañana, si ya pasó).
  const mine = new Set(byRecent.map((u) => u.unit));
  for (const [id, entry] of Object.entries(review)) {
    const found = findExercise(id);
    if (!found || found.exercise.type !== "fill" || !mine.has(found.unit)) continue;
    const earliest = Math.max(1, diffInDays(parseISODate(entry.due), today));
    out.push({ kind: "cloze", itemId: id, unit: found.unit, state: "lapso", earliest, lapses: 1 });
  }

  for (const verdict of ["repasar", "dominada"] as const) {
    for (const { unit } of byRecent.filter((u) => u.verdict === verdict)) {
      for (const w of wordsOfUnit(unit)) out.push({ kind: "recog", itemId: w.itemId, unit, state: verdict, earliest: 1, lapses: 0 });
      for (const d of getDictation(unit) ?? []) out.push({ kind: "listen", itemId: sentenceItemId(unit, d.it), unit, state: verdict, earliest: 1, lapses: 0 });
    }
  }
  return out;
}

/**
 * Calcula las tarjetas a sembrar sin escribir nada. Los vencimientos se reparten parejo en 14 días desde mañana,
 * con un máximo de 25 por día contando las tarjetas que ya tienes. Lo que no cabe no se siembra: queda como palabra nueva
 * normal (la cola ya limita cuántas introduce por día).
 */
export function planSeed(
  views: UnitView[], already: readonly string[], review: ReviewState, existing: Record<string, SrsCard>, now: Date,
): SeedPlan {
  const units = seedableUnits(views, already);
  const today = startOfDay(now);
  const load = new Map<string, number>();
  for (const c of Object.values(existing)) load.set(dayOf(c.fsrs.due), (load.get(dayOf(c.fsrs.due)) ?? 0) + 1);

  const todo = candidates(units, review, today).filter((c, i, all) =>
    !existing[`${c.kind}:${c.itemId}`] && all.findIndex((x) => x.kind === c.kind && x.itemId === c.itemId) === i);
  const perDay = Math.min(SEED_PER_DAY, Math.max(1, Math.ceil(todo.length / SEED_WINDOW_DAYS)));

  const cards: SrsCard[] = [];
  const horizon = SEED_WINDOW_DAYS + 60;
  todo.forEach((c, i) => {
    const target = Math.max(c.earliest, 1 + Math.floor(i / perDay));
    let day = target;
    while (day <= horizon && (load.get(toISODate(addDays(today, day))) ?? 0) >= SEED_PER_DAY) day++;
    // Las tarjetas nuevas no pasan de la ventana; los fallos con vencimiento original lejano sí conservan su fecha.
    if (day > horizon || (day > SEED_WINDOW_DAYS && c.earliest <= SEED_WINDOW_DAYS)) return;
    const due = addDays(today, day);
    due.setHours(12, 0, 0, 0);
    load.set(toISODate(due), (load.get(toISODate(due)) ?? 0) + 1);
    const { stability, difficulty } = SEED_STATE[c.state];
    cards.push(seedSrsCard({ kind: c.kind, itemId: c.itemId, unit: c.unit, stability, difficulty, lapses: c.lapses, due }, now));
  });
  return { cards, units: units.map((u) => u.unit), left: todo.length - cards.length };
}

/**
 * Siembra el repaso: agrega las tarjetas que faltan y anota qué unidades quedaron sembradas.
 * Una segunda llamada con las mismas unidades no agrega nada. Devuelve cuántas tarjetas agregó.
 */
export function applySeedReview(store: KV, views: UnitView[], now: Date = new Date()): number {
  const cont = loadContinuity(store);
  const srs = loadSrs(store);
  const plan = planSeed(views, cont.seeded?.units ?? [], getReview(store), srs.cards, now);
  if (plan.units.length === 0) return 0;
  const cards = { ...srs.cards };
  for (const c of plan.cards) if (!cards[c.id]) cards[c.id] = c;
  // Primero las tarjetas y después la anotación: si algo falla entre las dos, repetir no duplica nada.
  saveSrs({ ...srs, cards }, store);
  saveContinuity(store, {
    ...cont,
    seeded: { date: toISODate(now), units: [...(cont.seeded?.units ?? []), ...plan.units], cards: (cont.seeded?.cards ?? 0) + plan.cards.length },
  });
  return plan.cards.length;
}
