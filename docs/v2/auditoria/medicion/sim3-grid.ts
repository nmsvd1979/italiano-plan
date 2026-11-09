import { COURSE } from "../../../../src/content/course";
import { getUnit } from "../../../../src/content/curriculum";
import { daysOf, remedialDays, isSoon, blockKey, blockDone, dayComplete, todaySlots, visibleBlocks, weekComplete, type CourseProgress, type Block } from "../../../../src/domain/cycle";
import { estimatedMinutes, srsMinutes } from "../../../../src/domain/minutes";
import { buildQueue, eligibleUnits, LIMITS } from "../../../../src/domain/srsQueue";
import { extraWordsFor } from "../../../../src/domain/srsExtras";
import { wordsOfUnit } from "../../../../src/domain/srsDeck";
import { applyReview, emptySrs, newSrsCard, unlockProdCards, type RatingValue, type SrsState } from "../../../../src/domain/srs";
import { rng } from "../../../../src/domain/review";
import { addDays, parseISODate, toISODate } from "../../../../src/domain/dates";
import { learnedUnits } from "../../../../src/domain/practice";

import { sessionsOf, UNITS } from "../../../../src/content/curriculum";
import { courseWithContinuity, emptyContinuity } from "../../../../src/domain/continuity";
import { writeFileSync } from "node:fs";
interface Out { budget: number; short: boolean; days: number; finishedDay: number | null; perDay: number[]; srsAvg: number; remedial: number; steps: number }
function run(budget: number, short: boolean, horizon: number, seed: string, legacy: boolean, extras: boolean, passP = 0.85): any {
  const dueMax: number[] = []; let blockedDays = 0; let sessions = 0;
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
          if (b.kind === "srs") { q = buildQueue({ state: srs, today, eligibleUnits: eligibleUnits({ done }), extraWords: extras ? extraWordsFor({ done }) : undefined }); cards = Math.min(LIMITS.session, q.items.length); dueMax.push(q.dueTotal); if (q.newBlocked) blockedDays++; sessions++; }
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
  const elig = eligibleUnits({ done }); const base = elig.reduce((n, u) => n + wordsOfUnit(u).length, 0); const ex = extras ? [...extraWordsFor({ done }).values()].reduce((n, l) => n + l.length, 0) : 0;
  const recogIds = new Set(Object.values(srs.cards).filter((c) => c.kind === "recog").map((c) => c.itemId));
  return { elegibles: base + ex, introducidas: recogIds.size, dueMax: Math.max(0, ...dueMax), dueMed: dueMax.length ? Math.round(dueMax.reduce((a, b) => a + b, 0) / dueMax.length) : 0, blockedDays, sessions, recog, prod, budget, short, finishedDay, spent, remedialBlocks, srsAvg: srsMins.length ? srsMins.reduce((a, b) => a + b, 0) / srsMins.length : 0,
    cards: Object.keys(srs.cards).length, stepEnd, kindsByDay, srsLen: srs.log.length, learnedAfter: learnedUnits({ done, skipped: new Set(), startUnit: 1 } as any), firstSteps: Object.entries(stepEnd).sort((a: any, b: any) => a[1] - b[1]).map(([k, v]) => k + '@' + v).join(' ') };
}

const L: any = LIMITS;
const base = { session: L.session, blockNewAbove: L.blockNewAbove, newPerDay: L.newPerDay };
const grid: [number, number, number][] = (process.env.GRID ?? "20,40,8;30,40,8;30,60,8;30,80,8;40,80,8;20,80,8;30,60,12").split(";").map((g) => g.split(",").map(Number) as [number, number, number]);
for (const [session, block, nuevas] of grid) {
  L.session = session; L.blockNewAbove = block; L.newPerDay = nuevas;
  const r = run(30, false, 500, "b-30", false, true);
  console.log(`sesión ${session} · bloqueo >${block} · nuevas/día ${nuevas} → fin día ${r.finishedDay} · elegibles ${r.elegibles} · introducidas ${r.introducidas} (${Math.round(100 * r.introducidas / r.elegibles)} %) · vencidas máx ${r.dueMax} · media ${r.dueMed} · bloqueadas ${r.blockedDays}/${r.sessions} · min repaso/sesión ${r.srsAvg.toFixed(1)}`);
}
Object.assign(L, base);
