import { COURSE } from "../../../../src/content/course";
import { getUnit } from "../../../../src/content/curriculum";
import { daysOf, remedialDays, isSoon, blockKey, blockDone, dayComplete, todaySlots, visibleBlocks, weekComplete, type CourseProgress, type Block } from "../../../../src/domain/cycle";
import { estimatedMinutes, srsMinutes } from "../../../../src/domain/minutes";
import { buildQueue, eligibleUnits, LIMITS } from "../../../../src/domain/srsQueue";
import { applyReview, emptySrs, newSrsCard, unlockProdCards, type RatingValue, type SrsState } from "../../../../src/domain/srs";
import { rng } from "../../../../src/domain/review";
import { addDays, parseISODate, toISODate } from "../../../../src/domain/dates";
import { learnedUnits } from "../../../../src/domain/practice";

import { sessionsOf, UNITS } from "../../../../src/content/curriculum";
import { courseWithContinuity, emptyContinuity } from "../../../../src/domain/continuity";
import { writeFileSync } from "node:fs";
interface Out { budget: number; short: boolean; days: number; finishedDay: number | null; perDay: number[]; srsAvg: number; remedial: number; steps: number }
function run(budget: number, short: boolean, horizon: number, seed: string, legacy: boolean, passP = 0.85): any {
  const rand = rng(seed);
  const done = new Set<string>();
  if (legacy) for (const u of UNITS.filter((x) => x.n <= 24)) for (const ss of sessionsOf(u)) for (const a of ss.activities) done.add(`${u.id}.s${ss.index}.${a.id}`);
  const mini: any = {};
  let srs: SrsState = emptySrs();
  const start = parseISODate("2026-11-01");
  const spent: number[] = []; const note: string[] = []; let finishedDay: number | null = null;
  let remedialBlocks = 0; const srsMins: number[] = []; const kindsByDay: Record<string, number>[] = [];
  const stepEnd: Record<string, number> = {};
  for (let d = 0; d < horizon; d++) {
    const today = addDays(start, d); const iso = toISODate(today);
    const marked = new Set<string>(); let used = 0; let did = 0; const kinds: Record<string, number> = {};
    const p = (): CourseProgress => courseWithContinuity({ done, startUnit: 1, mini }, {}, emptyContinuity());
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
  // tras terminar: solo tarjetas, 60 dias
  const post: number[] = [];
  for (let d = horizon; d < horizon + 0; d++) post.push(0);
  const recog = Object.values(srs.cards).filter((c) => c.kind === "recog").length, prod = Object.values(srs.cards).filter((c) => c.kind === "prod").length;
  return { recog, prod, budget, short, finishedDay, spent, remedialBlocks, srsAvg: srsMins.length ? srsMins.reduce((a, b) => a + b, 0) / srsMins.length : 0,
    cards: Object.keys(srs.cards).length, stepEnd, kindsByDay, srsLen: srs.log.length, learnedAfter: learnedUnits({ done, skipped: new Set(), startUnit: 1 } as any), firstSteps: Object.entries(stepEnd).sort((a: any, b: any) => a[1] - b[1]).map(([k, v]) => k + '@' + v).join(' ') };
}

const out: any[] = [];
for (const legacy of [false, true]) for (const budget of [15, 30, 60]) out.push({ legacy, ...run(budget, false, 500, "b-" + budget, legacy) });
writeFileSync("docs/v2/auditoria/medicion/salida/sim2.json", JSON.stringify(out));
for (const r of out) console.log("RUN", r.legacy ? "u01-u24 marcadas" : "nuevo", r.budget, "fin", r.finishedDay, "recog", r.recog, "prod", r.prod, "dirigidos", r.remedialBlocks, "\n   ", r.firstSteps.split(" ").slice(0, 8).join(" "), "...", r.firstSteps.split(" ").slice(-3).join(" "));
