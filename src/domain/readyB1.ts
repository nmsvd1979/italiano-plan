import { COURSE } from "../content/course";
import type { LogEntry } from "./activityLog";
import { PASS_RATIO } from "./cycle";
import { PASS_LEVEL, WEAK_AREA } from "./evaluation";
import { B1_PASS, b1Key, type B1Results } from "./practicaB1";
import { recallRate } from "./panel";
import type { MiniTests } from "./storage";
import type { SrsState } from "./srs";

// Panel «Listo para B1» (docs/v2/plan-b1/10): seis luces con evidencias que ya guarda la app. Es una lista de pruebas, no una
// nota ni un diagnóstico, y los umbrales son del proyecto (el del CILS B1 no se pudo abrir): ninguna luz «sin datos» cuenta como verde.

export type LightState = "verde" | "ambar" | "sin";

export interface Light {
  id: "a2" | "regularidad" | "memoria" | "puente" | "largas" | "produccion";
  name: string;
  state: LightState;
  /** Qué se midió, con las cifras. */
  detail: string;
  /** Qué hacer si no está verde. */
  next?: string;
}

export interface ReadyInput {
  levelTests: { date: string; correct: number; total: number; byArea: Record<string, { correct: number; total: number }> }[];
  mini: MiniTests;
  srs: SrsState;
  log: LogEntry[];
  b1: B1Results;
  /** Ids de los textos largos que existen (para saber cuántas preguntas hay en total). */
  b1Ids: { lectura: string[]; escucha: string[] };
  /** Unidades del puente cuyo texto ampliado cumple palabras mínimas y formas meta. */
  writingDone: string[];
  today: Date;
}

export const BRIDGE_UNITS = ["u21", "u22", "u23"];
/** Preguntas que se piden por tipo (3 textos × 4) y aciertos mínimos (el mismo 75 %). */
export const B1_QUESTIONS_NEEDED = 12;
/** Respuestas de repaso espaciado mínimas para fiarse del recuerdo (criterio propio) y recuerdo pedido (`11` §4). */
export const RECALL_MIN_ANSWERS = 100;
export const RECALL_PASS = 0.8;
/** Semanas que se miran para la regularidad y cuántas deben aprobarse a la primera. */
export const REGULAR_WINDOW = 4;
export const REGULAR_NEED = 3;

const pct = (x: number): string => `${Math.round(x * 100)} %`;

function a2Light(i: ReadyInput): Light {
  const tests = i.levelTests.filter((t) => t.total > 0);
  const base = { id: "a2" as const, name: "A2 firme" };
  if (tests.length === 0) return { ...base, state: "sin", detail: "Todavía no hiciste la prueba de nivel A2.", next: "Haz la prueba de nivel A2 (dos veces, en días distintos)." };
  const days = new Set(tests.filter((t) => t.correct / t.total >= PASS_LEVEL).map((t) => t.date));
  const last = tests[tests.length - 1];
  const weak = Object.entries(last.byArea).filter(([a, s]) => a !== "produccion" && s.total > 0 && s.correct / s.total < WEAK_AREA).map(([a]) => a);
  const ok = days.size >= 2 && weak.length === 0;
  const detail = `${days.size} de 2 días con ≥ ${pct(PASS_LEVEL)} (último intento ${pct(last.correct / last.total)})${weak.length ? `; áreas bajo ${pct(WEAK_AREA)}: ${weak.join(", ")}` : ""}.`;
  return { ...base, state: ok ? "verde" : "ambar", detail, next: ok ? undefined : "Repite la prueba otro día; si un área bajó de 70 %, refuérzala en «Practicar más»." };
}

function regularLight(i: ReadyInput): Light {
  const base = { id: "regularidad" as const, name: "Regularidad semanal" };
  const ids = COURSE.filter((s) => s.kind === "core" && (i.mini[s.id] ?? []).length > 0).map((s) => s.id).slice(-REGULAR_WINDOW);
  if (ids.length < REGULAR_WINDOW) return { ...base, state: "sin", detail: `Hay mini-pruebas en ${ids.length} de las ${REGULAR_WINDOW} últimas semanas que se miran.`, next: "Haz la mini-prueba de cada semana." };
  const first = ids.filter((id) => i.mini[id][0].total > 0 && i.mini[id][0].correct / i.mini[id][0].total >= PASS_RATIO).length;
  const ok = first >= REGULAR_NEED;
  return { ...base, state: ok ? "verde" : "ambar", detail: `${first} de las últimas ${REGULAR_WINDOW} mini-pruebas aprobadas a la primera (≥ ${pct(PASS_RATIO)}).`, next: ok ? undefined : "Repasa la semana antes de la mini-prueba." };
}

function memoryLight(i: ReadyInput): Light {
  const base = { id: "memoria" as const, name: "Memoria" };
  const r = recallRate(i.srs, i.today);
  if (r.rate === null || r.answers < RECALL_MIN_ANSWERS) return { ...base, state: "sin", detail: `${r.answers} de ${RECALL_MIN_ANSWERS} respuestas de repaso en 30 días.`, next: "Sigue con el repaso espaciado cada día." };
  const ok = r.rate >= RECALL_PASS;
  return { ...base, state: ok ? "verde" : "ambar", detail: `Recuerdo real ${pct(r.rate)} en 30 días (${r.answers} respuestas; se pide ≥ ${pct(RECALL_PASS)}).`, next: ok ? undefined : "No saltes los repasos vencidos." };
}

function bridgeLight(i: ReadyInput): Light {
  const base = { id: "puente" as const, name: "Puente a B1" };
  const passed = BRIDGE_UNITS.filter((u) => (i.mini[u] ?? []).some((a) => a.passed));
  const tried = BRIDGE_UNITS.filter((u) => (i.mini[u] ?? []).length > 0);
  if (tried.length === 0) return { ...base, state: "sin", detail: "Todavía no hay mini-pruebas del puente (u21, u22, u23).", next: "Haz las tres semanas del puente." };
  const ok = passed.length === BRIDGE_UNITS.length;
  return { ...base, state: ok ? "verde" : "ambar", detail: `${passed.length} de 3 mini-pruebas del puente aprobadas.`, next: ok ? undefined : "Termina y aprueba la mini-prueba de cada semana del puente." };
}

function longLight(i: ReadyInput): Light {
  const base = { id: "largas" as const, name: "Lectura y escucha largas" };
  const sum = (kind: "lectura" | "escucha") => {
    let c = 0, t = 0, seen = 0;
    for (const id of i.b1Ids[kind]) {
      const r = i.b1[b1Key(kind, id)];
      if (!r) continue;
      seen++;
      c += r.best; t += r.total;
    }
    return { c, t, seen, of: i.b1Ids[kind].length };
  };
  const l = sum("lectura"), e = sum("escucha");
  if (l.seen + e.seen === 0) return { ...base, state: "sin", detail: "Todavía no hiciste ninguna actividad de Práctica B1.", next: "Haz las lecturas y escuchas de «Práctica B1»." };
  const enough = l.t >= B1_QUESTIONS_NEEDED && e.t >= B1_QUESTIONS_NEEDED;
  const ok = enough && l.c / l.t >= B1_PASS && e.c / e.t >= B1_PASS;
  const part = (n: string, x: ReturnType<typeof sum>) => `${n}: ${x.c} de ${x.t} preguntas (${x.seen} de ${x.of} textos)`;
  return {
    ...base, state: ok ? "verde" : "ambar",
    detail: `${part("lectura", l)}; ${part("escucha", e)}. Se piden ≥ ${pct(B1_PASS)} sobre ${B1_QUESTIONS_NEEDED} preguntas de cada tipo.`,
    next: ok ? undefined : enough ? "Repite los textos donde fallaste." : "Faltan textos por hacer (o por publicar).",
  };
}

function productionLight(i: ReadyInput): Light {
  const base = { id: "produccion" as const, name: "Producción" };
  const mono = BRIDGE_UNITS.filter((u) => i.log.some((e) => e.unit === u && e.activity === "monologo" && (e.total ?? 0) > 0 && e.correct === e.total));
  const written = BRIDGE_UNITS.filter((u) => i.writingDone.includes(u));
  const detail = `Textos ampliados: ${written.length} de 3; monólogos con todos los puntos marcados: ${mono.length} de 3. No mide corrección ni pronunciación.`;
  if (written.length + mono.length === 0) return { ...base, state: "sin", detail, next: "Escribe el texto ampliado y haz el monólogo de cada semana del puente." };
  const ok = written.length === 3 && mono.length === 3;
  return { ...base, state: ok ? "verde" : "ambar", detail, next: ok ? undefined : "Completa lo que falte en las semanas del puente." };
}

export function readyB1(i: ReadyInput): { lights: Light[]; ready: boolean } {
  const lights = [a2Light(i), regularLight(i), memoryLight(i), bridgeLight(i), longLight(i), productionLight(i)];
  return { lights, ready: lights.every((l) => l.state === "verde") };
}
