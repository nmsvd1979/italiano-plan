import { describe, expect, it } from "vitest";
import { formatDiagnostic, type DiagnosticData } from "./diagnostics";

const base: DiagnosticData = {
  version: "2.0.0", buildDate: "2026-10-27T12:00:00.000Z", now: "2026-10-28T09:00:00.000Z",
  appInstalled: true, audioDone: 312, audioTotal: 588, persistent: "persistent", online: false,
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)",
  caches: [{ name: "workbox-precache-v2", entries: 40, bytes: 700_000 }, { name: "audio-v1", entries: 312, bytes: 5_400_000 }],
  worker: "active", controlled: true, storage: { usage: 6_000_000, quota: 1_000_000_000 },
};

describe("formatDiagnostic", () => {
  it("incluye todo lo que hace falta para entender un fallo sin conexión", () => {
    const t = formatDiagnostic(base);
    for (const s of [
      "Versión: 2.0.0", "2026-10-27T12:00:00.000Z", "App instalada y controlada por el service worker: sí",
      "Audio descargado: 312/588", "Almacenamiento persistente: sí", "navigator.onLine: false",
      "Mozilla/5.0 (iPhone", "workbox-precache-v2: 40 archivos, 0.7 MB", "audio-v1: 312 archivos, 5.4 MB",
    ]) expect(t).toContain(s);
  });
  it("marca lo que falla", () => {
    const t = formatDiagnostic({ ...base, appInstalled: false, persistent: "not-persistent", caches: [], worker: "sin registro", controlled: false, storage: undefined });
    expect(t).toContain("controlada por el service worker: no");
    expect(t).toContain("Almacenamiento persistente: no");
    expect(t).toContain("Cachés (0):");
    expect(t).toContain("n/d");
  });
});
