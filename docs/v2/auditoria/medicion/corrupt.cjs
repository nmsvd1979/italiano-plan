const { chromium } = require("@playwright/test");
const keys = ["italianPlan.completions","italianPlan.settings","italianPlan.review","italianPlan.shadowing","italianPlan.phaseTests","italianPlan.skipped","italianPlan.startUnit","italianPlan.canDo","italianPlan.writing","italianPlan.v2.progress","italianPlan.v2.seedApplied","italianPlan.v2.miniTests","italianPlan.v2.timing","italianPlan.v2.sinpista","italianPlan.v2.writingFix","italianPlan.v2.levelTests","italianPlan.log.v1","italianPlan.srs.v1","italianPlan.startDate"];
const vals = { roto: "{roto", nulo: "null", numero: "123", arreglo: "[]", cadena: '"x"', objeto: "{}" };
const routes = ["/", "/progreso", "/plan", "/ajustes", "/tarjetas", "/repaso"];
(async () => {
  const b = await chromium.launch();
  const bad = [];
  for (const route of routes) for (const k of keys) for (const [vn, v] of Object.entries(vals)) {
    const ctx = await b.newContext(); const page = await ctx.newPage();
    const errs = [];
    page.on("pageerror", (e) => errs.push(String(e).slice(0, 120)));
    await page.addInitScript(([k, v]) => { localStorage.clear(); localStorage.setItem("italianPlan.startDate", "2026-11-01"); localStorage.setItem(k, v); }, [k, v]);
    await page.goto("http://localhost:4180/italiano-plan/#" + route);
    await page.waitForTimeout(350);
    const len = await page.evaluate(() => (document.querySelector("main")?.innerText ?? "").length);
    if (errs.length || len < 20) bad.push({ route, k, vn, len, err: errs[0] });
    await ctx.close();
  }
  console.log("COMBINACIONES MALAS", bad.length);
  for (const x of bad) console.log(JSON.stringify(x));
  await b.close();
})();
