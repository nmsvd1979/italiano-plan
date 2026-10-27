import { expect, test, type Page } from "@playwright/test";

const BASE = "/italiano-plan/";
const AUDIO_COUNT = 588;

/** Entra directo a Hoy (con fecha de inicio) y espera a que el service worker controle la página. */
async function open(page: Page, hash = "") {
  await page.addInitScript(() => {
    if (!localStorage.getItem("italianPlan.startDate")) localStorage.setItem("italianPlan.startDate", "2026-10-01");
  });
  await page.goto(`${BASE}${hash}`);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise((r) => navigator.serviceWorker.addEventListener("controllerchange", r, { once: true }));
  });
}

const cacheKeys = (page: Page, nameIncludes: string) =>
  page.evaluate(async (n) => {
    const name = (await caches.keys()).find((k) => k.includes(n));
    return name ? (await (await caches.open(name)).keys()).map((r) => new URL(r.url).pathname) : [];
  }, nameIncludes);

test("el precache es solo la app: sin mp3 y bajo 2 MB", async ({ page }) => {
  await open(page);
  const keys = await cacheKeys(page, "precache");
  expect(keys.length).toBeGreaterThan(5);
  expect(keys.filter((k) => k.endsWith(".mp3"))).toEqual([]);
  expect(await cacheKeys(page, "audio-v1")).toEqual([]);
  const bytes = await page.evaluate(async () => {
    const c = await caches.open((await caches.keys()).find((k) => k.includes("precache"))!);
    let sum = 0;
    for (const r of await c.keys()) sum += (await (await c.match(r))!.blob()).size;
    return sum;
  });
  expect(bytes).toBeLessThan(2 * 1024 * 1024);
});

test("descarga el audio, y sin conexión la app, las rutas y el audio con Range funcionan tras cerrar y reabrir", async ({ page, context }) => {
  await open(page, "#/ajustes");
  await page.getByRole("button", { name: "Usar sin conexión" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Listo para usar sin conexión" })).toBeVisible({ timeout: 60_000 });
  expect(await cacheKeys(page, "audio-v1")).toHaveLength(AUDIO_COUNT);

  // "Cerrar la app": una página nueva, ya sin conexión.
  await page.close();
  await context.setOffline(true);
  const offline = await context.newPage();
  await offline.addInitScript(() => localStorage.setItem("italianPlan.startDate", "2026-10-01"));

  const routes: [string, RegExp][] = [
    ["", /Italiano/],
    ["#/ajustes", /Ajustes/],
    ["#/plan", /Plan/i],
    ["#/gramatica/u01", /./],
    ["#/practica/u01", /./],
    ["#/pronunciacion/u01", /./],
    ["#/dictado/u01", /./],
    ["#/dialogo/u01", /./],
    ["#/vocabulario/u01", /./],
  ];
  for (const [hash, text] of routes) {
    await offline.goto(`${BASE}${hash}`);
    await expect(offline.locator("#root")).not.toBeEmpty();
    await expect(offline.locator("main")).toContainText(text);
  }

  // Audio con petición Range (como la hace Safari): debe responder 206 con el trozo pedido.
  await offline.goto(`${BASE}`);
  await offline.evaluate(() => navigator.serviceWorker.ready);
  const { status, contentRange, length, full } = await offline.evaluate(async () => {
    const index = (await (await fetch("audio-index.json")).json()) as { url: string; bytes: number }[];
    const first = index[0];
    const res = await fetch(`/italiano-plan/${first.url}`, { headers: { Range: "bytes=0-99" } });
    const buf = await res.arrayBuffer();
    return { status: res.status, contentRange: res.headers.get("Content-Range"), length: buf.byteLength, full: first.bytes };
  });
  expect(status).toBe(206);
  expect(length).toBe(100);
  expect(contentRange).toBe(`bytes 0-99/${full}`);

  // Y el elemento <audio> carga sus metadatos desde la caché.
  const duration = await offline.evaluate(
    () =>
      new Promise<number>((resolve, reject) => {
        const a = new Audio("/italiano-plan/audio/abitare--langpao.mp3");
        a.addEventListener("loadedmetadata", () => resolve(a.duration));
        a.addEventListener("error", () => reject(new Error("audio no carga sin conexión")));
      }),
  );
  expect(duration).toBeGreaterThan(0);

  // Sin conexión, lo que necesita internet lo dice.
  await offline.goto(`${BASE}#/shadowing/u01`);
  await expect(offline.locator("main")).toContainText("Necesita internet");
});

test("una descarga cortada se reanuda sin empezar de cero", async ({ page }) => {
  await open(page, "#/ajustes");
  // Estado de una descarga interrumpida: ya hay 200 audios guardados.
  const seeded = await page.evaluate(async () => {
    const index = (await (await fetch("audio-index.json")).json()) as { url: string }[];
    const cache = await caches.open("audio-v1");
    for (const e of index.slice(0, 200)) await cache.put(`/italiano-plan/${e.url}`, await fetch(`/italiano-plan/${e.url}`));
    return (await cache.keys()).length;
  });
  expect(seeded).toBe(200);

  await page.reload();
  const requested: string[] = [];
  page.on("request", (r) => r.url().endsWith(".mp3") && requested.push(r.url()));
  await expect(page.locator("main")).toContainText(`Audio: 200 de ${AUDIO_COUNT}`);
  await page.getByRole("button", { name: "Reanudar descarga" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Listo para usar sin conexión" })).toBeVisible({ timeout: 60_000 });

  expect(await cacheKeys(page, "audio-v1")).toHaveLength(AUDIO_COUNT);
  expect(new Set(requested).size).toBe(AUDIO_COUNT - 200);
});

test("pantalla de rescate si la app no arranca", async ({ page }) => {
  await page.route("**/assets/index-*.js", (route) => route.abort());
  await page.goto(BASE);
  await expect(page.locator("#root")).toContainText("No pude cargar la app", { timeout: 20_000 });
  await expect(page.locator("#root")).toContainText("Listo para usar sin conexión");
});
