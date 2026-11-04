import { UNITS } from "../../../../src/content/curriculum";
import { buildQueue, LIMITS } from "../../../../src/domain/srsQueue";
import { applyReview, emptySrs, newSrsCard, unlockProdCards, type RatingValue, type SrsState } from "../../../../src/domain/srs";
import { rng } from "../../../../src/domain/review";
import { addDays, parseISODate } from "../../../../src/domain/dates";
import { wordsOfUnit, loadQuizletDeck } from "../../../../src/domain/srsDeck";
const units = UNITS.filter((u) => u.ready).map((u) => u.id);
const total = units.reduce((n, u) => n + wordsOfUnit(u).length, 0);
const quizlet = (await import("../../../../data/quizlet-1400.json")).default.filter((e: any) => e.enApp === null);
function run(mode: "una" | "todo", withQ: boolean) {
  const rand = rng("post-" + mode); let srs: SrsState = emptySrs(); const start = parseISODate("2026-12-01");
  if (withQ) srs = { ...srs, options: { quizlet: true } } as any;
  const rows: string[] = [];
  for (let d = 0; d < 365; d++) {
    const today = addDays(start, d); let cards = 0; let sessions = 0;
    for (;;) {
      const q = buildQueue({ state: srs, today, eligibleUnits: units, quizlet: withQ ? quizlet as any : [] });
      if (q.items.length === 0) break;
      let n = 0;
      for (const it of q.items) { if (n >= LIMITS.session) break; const c = it.type === "due" ? it.card : newSrsCard(it.candidate, today); srs = unlockProdCards(applyReview(srs, c, rand() < 0.9 ? 3 : 1, today, 8000), today); n++; }
      cards += n; sessions++;
      if (mode === "una" || cards >= 200) break;
    }
    const recog = Object.values(srs.cards).filter((c: any) => c.kind === "recog" && c.deck !== "quizlet").length;
    const rq = Object.values(srs.cards).filter((c: any) => c.kind === "recog" && c.deck === "quizlet").length;
    if ([0, 6, 13, 29, 59, 89, 119, 179, 364].includes(d)) rows.push("d" + (d + 1) + ": tarjetas_dia=" + cards + " min~" + Math.ceil(cards * 15 / 60) + " palabras_app=" + recog + "/" + total + " extra=" + rq + " total_tarj=" + Object.keys(srs.cards).length);
  }
  console.log("MODE", mode, withQ ? "con mazo extra" : "sin mazo extra"); console.log(rows.join("\n"));
}
run("una", false); run("todo", false); run("todo", true);
console.log("palabras en app", total, "mazo extra disponible", quizlet.length);
