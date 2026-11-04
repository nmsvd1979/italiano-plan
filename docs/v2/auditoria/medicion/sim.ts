import { COURSE } from "../../../../src/content/course";
import { getUnit } from "../../../../src/content/curriculum";
import { daysOf, remedialDays, isSoon, blockKey, blockDone, dayComplete, todaySlots, visibleBlocks, weekComplete, type CourseProgress, type Block } from "../../../../src/domain/cycle";
import { estimatedMinutes, srsMinutes } from "../../../../src/domain/minutes";
import { buildQueue, eligibleUnits, LIMITS } from "../../../../src/domain/srsQueue";
import { applyReview, emptySrs, newSrsCard, unlockProdCards, type RatingValue, type SrsState } from "../../../../src/domain/srs";
import { rng } from "../../../../src/domain/review";
import { addDays, parseISODate, toISODate } from "../../../../src/domain/dates";
import { learnedUnits } from "../../../../src/domain/practice";

// ---- (b1) minutos nominales por semana, con el motor
const nominal: any[] = [];
for (const s of COURSE) {
  const u = getUnit(s.unit)!;
  let all = 0, core = 0, soon = 0, nb = 0, srsN = 0;
  for (const d of daysOf(s)) for (const b of d.blocks) {
    if (isSoon(b, u)) { soon += b.minutes; continue; }
    all += b.minutes; nb++; if (b.core) core += b.minutes; if (b.kind === "srs") srsN += b.minutes;
  }
  nominal.push({ id: s.id, kind: s.kind, week: s.week, all, core, soon, nb, srsN });
}
const tot = (k: string, f = (_: any) => true) => nominal.filter(f).reduce((n, r) => n + r[k], 0);
console.log("NOMINAL", JSON.stringify({ pasos: nominal.length, core_weeks: nominal.filter((r) => r.kind === "core").length,
  all_core_kind: tot("all", (r) => r.kind === "core"), all_bridge: tot("all", (r) => r.kind === "bridge"), all: tot("all"), essential: tot("core"), soon: tot("soon"), srsFixed: tot("srsN"),
  weekMin: Math.min(...nominal.map((r) => r.all)), weekMax: Math.max(...nominal.map((r) => r.all)) }));
console.log("PERWEEK", nominal.map((r) => r.id + ":" + r.all + "/" + r.core + "/" + r.soon).join(" "));
const dayMin = daysOf(COURSE[0]).map((d) => d.blocks.reduce((n, b) => n + (isSoon(b, getUnit("u01")!) ? 0 : b.minutes), 0));
console.log("DAYMIN u25", dayMin.join(","));

// ---- (b2) simulacion
interface Out { budget: number; short: boolean; days: number; finishedDay: number | null; perDay: number[]; srsAvg: number; remedial: number; steps: number }
function run(budget: number, short: boolean, horizon: number, seed: string, passP = 0.85): any {
  const rand = rng(seed);
  const done = new Set<string>();
  const mini: any = {};
  let srs: SrsState = emptySrs();
  const start = parseISODate("2026-11-01");
  const spent: number[] = []; const note: string[] = []; let finishedDay: number | null = null;
  let remedialBlocks = 0; const srsMins: number[] = []; const kindsByDay: Record<string, number>[] = [];
  const stepEnd: Record<string, number> = {};
  for (let d = 0; d < horizon; d++) {
    const today = addDays(start, d); const iso = toISODate(today);
    const marked = new Set<string>(); let used = 0; let did = 0; const kinds: Record<string, number> = {};
    const p = (): CourseProgress => ({ done, startUnit: 1, mini });
    let extra = 0;
    outer: for (;;) {
      const { shown, finished } = todaySlots(p(), marked, extra);
      if (finished) { if (finishedDay === null) finishedDay = d; break; }
      let progressed = false;
      for (const slot of shown) {
        const u = getUnit(slot.step.unit)!;
        for (const b of visibleBlocks(slot.day, u, short)) {
          if (isSoon(b, u) || blockDone(slot.step, slot.day.day, b, p())) continue;
          // minutos del bloque: el SRS segun la cola real de hoy
          let cards = 0; let q;
          if (b.kind === "srs") { q = buildQueue({ state: srs, today, eligibleUnits: eligibleUnits({ done }) }); cards = Math.min(LIMITS.session, q.items.length); }
          const min = estimatedMinutes(b, cards);
          if (did > 0 && used + min > budget + 2) { break outer; }
          // hacer el bloque
          if (b.kind === "srs" && q) {
            let n = 0;
            for (const it of q.items) {
              if (n >= LIMITS.session) break;
              const card = it.type === "due" ? it.card : newSrsCard(it.candidate, today);
              const r: RatingValue = rand() < 0.9 ? 3 : 1;
              srs = unlockProdCards(applyReview(srs, card, r, today, 8000), today); n++;
            }
            srsMins.push(min);
          }
          if (b.kind === "mini") {
            const ok = rand() < passP;
            (mini[slot.step.id] ??= []).push({ date: iso, correct: ok ? 8 : 4, total: 10, passed: ok });
          } else done.add(blockKey(slot.step.id, slot.day.day, b.id));
          marked.add(blockKey(slot.step.id, slot.day.day, b.id));
          if (b.id.startsWith("failed")) remedialBlocks++;
          used += min; did++; kinds[b.kind] = (kinds[b.kind] ?? 0) + min; progressed = true;
          if (used >= budget) break outer;
        }
        if (used >= budget) break outer;
      }
      // todo lo mostrado esta hecho: «Hacer mas hoy»
      const before = todaySlots(p(), marked, extra).shown.length;
      extra++;
      const after = todaySlots(p(), marked, extra).shown.length;
      if (after === before && !progressed) break;
    }
    for (const s of COURSE) if (stepEnd[s.id] === undefined && weekComplete(s, p())) stepEnd[s.id] = d;
    spent.push(used); kindsByDay.push(kinds);
    if (finishedDay !== null && d > finishedDay + 3) break;
  }
  return { budget, short, finishedDay, spent, remedialBlocks, srsAvg: srsMins.length ? srsMins.reduce((a, b) => a + b, 0) / srsMins.length : 0,
    cards: Object.keys(srs.cards).length, stepEnd, kindsByDay, srsLen: srs.log.length, learnedAfter: learnedUnits({ done, skipped: new Set(), startUnit: 1 } as any) };
}
const results: any[] = [];
for (const budget of [15, 30, 60, 90, 120]) for (const short of [false, true]) {
  if (short && budget > 30) continue;
  results.push(run(budget, short, 500, "aud-" + budget));
}
import { writeFileSync } from "node:fs";
writeFileSync("docs/v2/auditoria/medicion/salida/sim.json", JSON.stringify(results));
for (const r of results) {
  const first60 = r.spent.slice(0, 60);
  const idle = first60.filter((x: number) => x === 0).length;
  const mean60 = first60.reduce((a: number, b: number) => a + b, 0) / Math.max(1, first60.length);
  console.log("RUN", r.budget, r.short ? "corto" : "normal", "fin_contenido_dia", r.finishedDay, "dias_ejecutados", r.spent.length, "min_medio_60d", mean60.toFixed(1), "dias_vacios_60d", idle, "srs_min_medio", r.srsAvg.toFixed(1), "repasos_dirigidos", r.remedialBlocks, "tarjetas", r.cards, "learned_legacy", r.learnedAfter.length);
}
