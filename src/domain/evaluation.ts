import { getUnit } from "../content/curriculum";
import { exercisesOf, type Exercise } from "../content/grammar";
import type { CoursePart } from "../content/course";
import { forStep, hasReserve, type Pruebas } from "../content/pruebas";
import { wordsOfUnit } from "./srsDeck";
import type { SrsState } from "./srs";
import { Grade, gradeChoice, gradeFill } from "./grading";
import { forPart } from "./parts";
import { rng, shuffle } from "./review";

// Evaluación (docs/v2/06 F2–F4): cinco áreas, ítems de la reserva `pruebas.json` más vocabulario del SRS y producción autoevaluada.
// Una unidad sin reserva usa solo gramática (y lo avisa).

export type Area = "lectura" | "escucha" | "gramatica" | "vocabulario" | "produccion";
export const AREAS: Area[] = ["lectura", "escucha", "gramatica", "vocabulario", "produccion"];
export const AREA_NAME: Record<Area, string> = {
  lectura: "Lectura", escucha: "Escucha", gramatica: "Gramática", vocabulario: "Vocabulario", produccion: "Producción",
};

/** Umbrales provisionales (criterio propio, docs/v2/06 F4): pasar la mini-prueba, área floja en la prueba de fase, nivel A2. */
export const PASS_MINI = 0.75;
export const WEAK_AREA = 0.7;
export const PASS_LEVEL = 0.8;

export type TestItem =
  | { area: "lectura"; id: string; unit: string; text: string; q: string; options: string[]; answer: number; why: string }
  | { area: "escucha"; id: string; unit: string; it: string; q: string; options: string[]; answer: number; why: string }
  | { area: "gramatica"; id: string; unit: string; exercise: Exercise }
  | { area: "vocabulario"; id: string; unit: string; q: string; options: string[]; answer: number; why: string }
  | { area: "produccion"; id: string; unit: string; statement: string };

export interface Battery {
  items: TestItem[];
  /** Áreas que no se pudieron evaluar por falta de ítems de reserva. */
  missing: Area[];
  /** Unidades que usaron solo gramática. */
  grammarOnly: string[];
}

export const MINI_TARGET: Record<Area, number> = { lectura: 4, escucha: 4, gramatica: 6, vocabulario: 4, produccion: 2 };

const pick = <T,>(list: T[], n: number, seed: string): T[] => shuffle(list, rng(seed)).slice(0, n);

/** Ejercicios de gramática de la propia unidad (de la parte, si es A/B). */
function grammarPool(unit: string, part: CoursePart | null): TestItem[] {
  return forPart(unit, part, "exercises", exercisesOf(unit)).map(({ item }) => ({ area: "gramatica", id: item.id, unit, exercise: item.exercise }));
}

/** Vocabulario: las palabras de la unidad con menor estabilidad en el repaso; las que aún no tienen tarjeta, al final. */
export function vocabItems(unit: string, srs: SrsState, n: number, seed: string): TestItem[] {
  const words = wordsOfUnit(unit);
  if (words.length < 4) return [];
  const stability = (itemId: string) => srs.cards[`recog:${itemId}`]?.fsrs.stability;
  const withCard = words.filter((w) => stability(w.itemId) !== undefined).sort((a, b) => stability(a.itemId)! - stability(b.itemId)!);
  const without = pick(words.filter((w) => stability(w.itemId) === undefined), n, `${seed}:w`);
  const chosen = [...withCard, ...without].slice(0, n);
  return chosen.map((w): TestItem => {
    const others = [...new Set(words.filter((x) => x.es !== w.es).map((x) => x.es))];
    const options = shuffle([w.es, ...pick(others, 2, `${seed}:${w.itemId}`)], rng(`${seed}:o:${w.itemId}`));
    return { area: "vocabulario", id: `${unit}:v:${w.itemId}`, unit, q: `¿Qué significa «${w.it}»?`, options, answer: options.indexOf(w.es), why: `${w.it} = ${w.es}` };
  });
}

/** Producción autoevaluada: afirmaciones «Puedo…» de la unidad. */
export function productionItems(units: string[], n: number, seed: string): TestItem[] {
  const all = units.flatMap((u) => (getUnit(u)?.canDo ?? []).map((statement, i) => ({ unit: u, statement, i })));
  return pick(all, n, `${seed}:p`).map((c) => ({ area: "produccion", id: `${c.unit}:c${c.i}`, unit: c.unit, statement: c.statement }));
}

function reserveItems(p: Pruebas, unit: string, part: CoursePart | null, area: "lectura" | "escucha" | "gramatica"): TestItem[] {
  const u = p[unit];
  if (!u) return [];
  if (area === "lectura") return forStep(u.lectura, part).map((x, i) => ({ area, id: `${unit}:t:l${i}`, unit, text: x.text, q: x.q, options: x.options, answer: x.answer, why: x.why }));
  if (area === "escucha") return forStep(u.escucha, part).map((x, i) => ({ area, id: `${unit}:t:e${i}`, unit, it: x.it, q: x.q || "¿Qué dijo?", options: x.options, answer: x.answer, why: x.why }));
  return forStep(u.gramatica, part).map((x, i) => ({ area, id: `${unit}:t:g${i}`, unit, exercise: x }));
}

/** Mini-prueba de una semana: 20 ítems (4/4/6/4/2) si hay reserva; si no, solo gramática. Cada intento usa otra versión. */
export function miniBattery(stepId: string, unit: string, part: CoursePart | null, attempt: number, p: Pruebas, srs: SrsState, fallback: TestItem[]): Battery {
  const seed = `${stepId}:mini:${attempt}`;
  if (!hasReserve(p, unit, part)) return { items: fallback, missing: AREAS.filter((a) => a !== "gramatica"), grammarOnly: [unit] };
  const grammar = [...pick(reserveItems(p, unit, part, "gramatica"), MINI_TARGET.gramatica, `${seed}:gr`)];
  const top = pick(grammarPool(unit, part).filter((x) => !grammar.some((g) => g.id === x.id)), MINI_TARGET.gramatica - grammar.length, `${seed}:gp`);
  const items = [
    ...pick(reserveItems(p, unit, part, "lectura"), MINI_TARGET.lectura, `${seed}:l`),
    ...pick(reserveItems(p, unit, part, "escucha"), MINI_TARGET.escucha, `${seed}:e`),
    ...grammar, ...top,
    ...vocabItems(unit, srs, MINI_TARGET.vocabulario, seed),
    ...productionItems([unit], MINI_TARGET.produccion, seed),
  ];
  return { items, missing: AREAS.filter((a) => !items.some((i) => i.area === a)), grammarOnly: [] };
}

/** Prueba de fase: de cada unidad con reserva, lectura 1, escucha 1, gramática 3 y vocabulario 2; producción 2 en total. */
export function phaseBattery(units: string[], p: Pruebas, srs: SrsState, seed: string): Battery {
  const items: TestItem[] = [];
  const grammarOnly: string[] = [];
  for (const u of units) {
    const g = pick(grammarPool(u, null), 3, `${seed}:${u}:g`);
    if (!hasReserve(p, u)) { items.push(...g); grammarOnly.push(u); continue; }
    items.push(
      ...pick(reserveItems(p, u, null, "lectura"), 1, `${seed}:${u}:l`),
      ...pick(reserveItems(p, u, null, "escucha"), 1, `${seed}:${u}:e`),
      ...g, ...vocabItems(u, srs, 2, `${seed}:${u}`),
    );
  }
  const withReserve = units.filter((u) => !grammarOnly.includes(u));
  if (withReserve.length > 0) items.push(...productionItems(withReserve, 2, seed));
  return { items, missing: AREAS.filter((a) => !items.some((i) => i.area === a)), grammarOnly };
}

export const LEVEL_TARGET: Record<Area, number> = { lectura: 6, escucha: 6, gramatica: 10, vocabulario: 6, produccion: 2 };

/** Prueba de nivel A2 (≈ 30 ítems, 25–30 min): misma estructura, unidades repartidas y semilla distinta a la de las fases. */
export function levelBattery(units: string[], p: Pruebas, srs: SrsState, seed: string): Battery {
  const order = shuffle(units, rng(`${seed}:u`));
  const withR = order.filter((u) => hasReserve(p, u));
  const take = (area: "lectura" | "escucha" | "gramatica", n: number, from: string[]) =>
    from.slice(0, n).flatMap((u) => pick(reserveItems(p, u, null, area), 1, `${seed}:${u}:${area}`));
  const grammarFrom = (n: number) => order.slice(0, n).flatMap((u) => pick(grammarPool(u, null), 1, `${seed}:${u}:gp`));
  const items: TestItem[] = withR.length === 0
    ? grammarFrom(30)
    : [
      ...take("lectura", LEVEL_TARGET.lectura, withR),
      ...take("escucha", LEVEL_TARGET.escucha, [...withR].reverse()),
      ...grammarFrom(LEVEL_TARGET.gramatica),
      ...withR.slice(0, LEVEL_TARGET.vocabulario).flatMap((u) => vocabItems(u, srs, 1, `${seed}:${u}`)),
      ...productionItems(withR, LEVEL_TARGET.produccion, seed),
    ];
  return { items, missing: AREAS.filter((a) => !items.some((i) => i.area === a)), grammarOnly: order.filter((u) => !withR.includes(u)) };
}

/** Puntos de un ítem: 1 si acertó (también «casi»); producción: 1 / 0,5 / 0 según la autoevaluación 3 / 2 / 1. */
export function pointsOf(item: TestItem, response: number | string): number {
  switch (item.area) {
    case "gramatica": {
      const e = item.exercise;
      const g: Grade = e.type === "choice" ? gradeChoice(Number(response), e.answer) : gradeFill(String(response), e.answers);
      return g === "wrong" ? 0 : 1;
    }
    case "produccion": return (Number(response) - 1) / 2;
    default: return Number(response) === item.answer ? 1 : 0;
  }
}

export interface AreaScore { correct: number; total: number }
export type AreaScores = Partial<Record<Area, AreaScore>>;

export function scoreAreas(results: { area: Area; points: number }[]): AreaScores {
  const out: AreaScores = {};
  for (const r of results) {
    const s = (out[r.area] ??= { correct: 0, total: 0 });
    s.correct += r.points;
    s.total += 1;
  }
  return out;
}

export const totalOf = (s: AreaScores): AreaScore =>
  Object.values(s).reduce((a, x) => ({ correct: a.correct + x.correct, total: a.total + x.total }), { correct: 0, total: 0 });

/** Áreas con menos del 70 % (solo las que se evaluaron). */
export function weakAreas(s: AreaScores): Area[] {
  return AREAS.filter((a) => s[a] && s[a]!.total > 0 && s[a]!.correct / s[a]!.total < WEAK_AREA);
}

export interface LevelResult { date: string; correct: number; total: number; byArea: AreaScores }
