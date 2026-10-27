import { describe, expect, it, vi } from "vitest";
import {
  BACKUP_VERSION, LAST_BACKUP_KEY, backupAdvice, backupFileName, backupKeys, buildBackup, deliverBackup,
  markBackupDone, parseBackup, restoreBackup, serializeBackup, type DeliverEnv, type EnumerableKV,
} from "./backup";
import { KEYS } from "./storage";
import { requestPersistence } from "../app/persist";

class FakeStore implements EnumerableKV {
  private map = new Map<string, string>();
  /** Si se define, el próximo setItem de esa clave falla una vez (simula quedarse sin espacio a mitad de la escritura). */
  failOn: string | null = null;
  get length() { return this.map.size; }
  key(i: number) { return [...this.map.keys()][i] ?? null; }
  getItem(k: string) { return this.map.get(k) ?? null; }
  setItem(k: string, v: string) {
    if (this.failOn === k) {
      this.failOn = null;
      throw new DOMException("sin espacio", "QuotaExceededError");
    }
    this.map.set(k, v);
  }
  removeItem(k: string) { this.map.delete(k); }
  snapshot() { return Object.fromEntries([...this.map].sort(([a], [b]) => a.localeCompare(b))); }
}

/** Un almacenamiento con todas las claves de la app, con formatos reales. */
function filled(): FakeStore {
  const s = new FakeStore();
  s.setItem(KEYS.startDate, "2026-09-01");
  s.setItem(KEYS.startUnit, "3");
  s.setItem(KEYS.lastNotified, "2026-10-20");
  s.setItem(KEYS.completions, JSON.stringify({ "2026-09-01": { "u03:lesson": true, "u03:vocab": true }, "2026-09-02": { "u03:practice": true } }));
  s.setItem(KEYS.settings, JSON.stringify({ reminderTime: "21:00", reminderEnabled: true, theme: "dark", sessionsPerWeek: 5, dailyMinutes: 45 }));
  s.setItem(KEYS.review, JSON.stringify({ "u03:ex1": { box: 2, due: "2026-09-10" } }));
  s.setItem(KEYS.shadowing, JSON.stringify({ ieyLUxtwch4: { a: 10, b: 50 } }));
  s.setItem(KEYS.phaseTests, JSON.stringify({ "1": [{ date: "2026-09-20", correct: 8, total: 10, byTopic: { saludos: { correct: 4, total: 5 } } }] }));
  s.setItem(KEYS.skipped, JSON.stringify(["u03:dictation"]));
  s.setItem(KEYS.canDo, JSON.stringify({ u01: [0, 1] }));
  s.setItem(KEYS.writing, JSON.stringify({ u02: "Mi chiamo Nicolás. Sono cileno." }));
  return s;
}

const NOW = new Date("2026-10-27T12:00:00Z");

describe("copia de seguridad: ida y vuelta", () => {
  it("exporta todas las claves italianPlan.* con versión y fecha", () => {
    const store = filled();
    store.setItem("otraApp.dato", "x");
    const b = buildBackup(store, NOW);
    expect(b.version).toBe(BACKUP_VERSION);
    expect(b.exportedAt).toBe("2026-10-27T12:00:00.000Z");
    expect(Object.keys(b.data).sort()).toEqual(Object.values(KEYS).sort());
    expect(b.data["otraApp.dato"]).toBeUndefined();
  });

  it("no incluye la marca de última copia", () => {
    const store = filled();
    markBackupDone(store, NOW);
    expect(backupKeys(store)).not.toContain(LAST_BACKUP_KEY);
    expect(buildBackup(store, NOW).data[LAST_BACKUP_KEY]).toBeUndefined();
  });

  it("exportar y luego importar en otro dispositivo deja los datos idénticos", () => {
    const origin = filled();
    const text = serializeBackup(buildBackup(origin, NOW));
    const parsed = parseBackup(text);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const target = new FakeStore();
    restoreBackup(parsed.backup, target);
    const { [LAST_BACKUP_KEY]: restoredMark, ...rest } = target.snapshot();
    expect(rest).toEqual(origin.snapshot());
    expect(restoredMark).toBe(NOW.toISOString());
    expect(parsed.ignored).toEqual([]);
  });

  it("el resumen cuenta marcas, días, repaso, textos y tests", () => {
    const parsed = parseBackup(serializeBackup(buildBackup(filled(), NOW)));
    if (!parsed.ok) throw new Error(parsed.error);
    expect(parsed.summary).toMatchObject({
      startDate: "2026-09-01", startUnit: 3, marks: 3, days: 2, reviewItems: 1, writingTexts: 1, phaseTests: 1,
    });
  });

  it("importar reemplaza: lo que no está en la copia se borra y lo ajeno no se toca", () => {
    const target = new FakeStore();
    target.setItem(KEYS.startDate, "2025-01-01");
    target.setItem(KEYS.writing, JSON.stringify({ u09: "viejo" }));
    target.setItem("otraApp.dato", "x");
    const small = new FakeStore();
    small.setItem(KEYS.startDate, "2026-09-01");
    small.setItem(KEYS.completions, JSON.stringify({ "2026-09-01": { a: true } }));
    const parsed = parseBackup(serializeBackup(buildBackup(small, NOW)));
    if (!parsed.ok) throw new Error(parsed.error);
    restoreBackup(parsed.backup, target);
    expect(target.getItem(KEYS.startDate)).toBe("2026-09-01");
    expect(target.getItem(KEYS.writing)).toBeNull();
    expect(target.getItem("otraApp.dato")).toBe("x");
  });

  it("si falla a mitad por falta de espacio, deja el progreso anterior intacto", () => {
    const target = filled();
    const before = target.snapshot();
    const other = new FakeStore();
    other.setItem(KEYS.startDate, "2026-01-01");
    other.setItem(KEYS.completions, JSON.stringify({ "2026-01-02": { z: true } }));
    const parsed = parseBackup(serializeBackup(buildBackup(other, NOW)));
    if (!parsed.ok) throw new Error(parsed.error);
    target.failOn = KEYS.completions;
    expect(() => restoreBackup(parsed.backup, target)).toThrow();
    target.failOn = null;
    expect(target.snapshot()).toEqual(before);
  });

  it("no cambia las claves existentes de localStorage", () => {
    expect(KEYS).toEqual({
      startDate: "italianPlan.startDate",
      completions: "italianPlan.completions",
      settings: "italianPlan.settings",
      lastNotified: "italianPlan.lastNotifiedDate",
      review: "italianPlan.review",
      shadowing: "italianPlan.shadowing",
      phaseTests: "italianPlan.phaseTests",
      skipped: "italianPlan.skipped",
      startUnit: "italianPlan.startUnit",
      canDo: "italianPlan.canDo",
      writing: "italianPlan.writing",
    });
  });

  it("el nombre del archivo lleva la fecha", () => {
    expect(backupFileName(new Date(2026, 9, 5))).toBe("italiano-plan-copia-2026-10-05.json");
  });
});

describe("copia de seguridad: archivos dañados", () => {
  const valid = () => JSON.parse(serializeBackup(buildBackup(filled(), NOW)));

  it("rechaza texto que no es JSON o está cortado", () => {
    expect(parseBackup("esto no es json").ok).toBe(false);
    const cut = serializeBackup(buildBackup(filled(), NOW)).slice(0, 200);
    const r = parseBackup(cut);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/dañado/);
  });

  it("rechaza JSON que no es una copia", () => {
    expect(parseBackup("[]").ok).toBe(false);
    expect(parseBackup("null").ok).toBe(false);
    expect(parseBackup('{"hola":1}').ok).toBe(false);
    expect(parseBackup(JSON.stringify({ ...valid(), app: "otra-app" })).ok).toBe(false);
  });

  it("rechaza si faltan los datos o la fecha", () => {
    const noData = valid(); delete noData.data;
    expect(parseBackup(JSON.stringify(noData)).ok).toBe(false);
    expect(parseBackup(JSON.stringify({ ...valid(), exportedAt: "ayer" })).ok).toBe(false);
    expect(parseBackup(JSON.stringify({ ...valid(), data: {} })).ok).toBe(false);
  });

  it("rechaza un valor con formato inesperado y no escribe nada", () => {
    const bad = valid();
    bad.data[KEYS.completions] = "{no es json";
    const r = parseBackup(JSON.stringify(bad));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain(KEYS.completions);
    for (const [key, value] of [
      [KEYS.skipped, '{"a":1}'], [KEYS.completions, "[]"], [KEYS.startDate, "mañana"], [KEYS.startUnit, "0"], [KEYS.settings, "5"],
    ] as const) {
      const c = valid();
      c.data[key] = value;
      expect(parseBackup(JSON.stringify(c)).ok, key).toBe(false);
    }
    const nonText = valid();
    nonText.data[KEYS.startUnit] = 3;
    expect(parseBackup(JSON.stringify(nonText)).ok).toBe(false);
  });

  it("rechaza claves que no son de la app", () => {
    const c = valid();
    c.data["otraApp.dato"] = "x";
    expect(parseBackup(JSON.stringify(c)).ok).toBe(false);
  });

  it("una clave italianPlan.* desconocida se omite y se avisa", () => {
    const c = valid();
    c.data["italianPlan.futuro"] = "algo";
    const r = parseBackup(JSON.stringify(c));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.ignored).toEqual(["italianPlan.futuro"]);
      expect(r.backup.data["italianPlan.futuro"]).toBeUndefined();
    }
  });
});

describe("copia de seguridad: versión desconocida", () => {
  const withVersion = (version: unknown) => JSON.stringify({ ...JSON.parse(serializeBackup(buildBackup(filled(), NOW))), version });

  it("rechaza una versión más nueva y pide actualizar la app", () => {
    const r = parseBackup(withVersion(BACKUP_VERSION + 1));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/más nueva/);
  });

  it("rechaza una versión más vieja que no reconoce", () => {
    expect(parseBackup(withVersion(0)).ok).toBe(false);
  });

  it("rechaza si no hay versión o no es un número", () => {
    expect(parseBackup(withVersion(undefined)).ok).toBe(false);
    expect(parseBackup(withVersion("1")).ok).toBe(false);
    expect(parseBackup(withVersion(1.5)).ok).toBe(false);
  });
});

describe("aviso de más de 14 días sin copia", () => {
  const day = 86_400_000;
  const withProgress = () => {
    const s = new FakeStore();
    s.setItem(KEYS.startDate, "2026-09-01");
    s.setItem(KEYS.completions, JSON.stringify({ "2026-09-02": { a: true } }));
    return s;
  };

  it("avisa pasados 14 días desde la última copia", () => {
    const s = withProgress();
    markBackupDone(s, new Date(NOW.getTime() - 15 * day));
    expect(backupAdvice(s, NOW)).toEqual({ due: true, days: 15, never: false });
  });

  it("no avisa a los 14 días justos ni antes", () => {
    const s = withProgress();
    markBackupDone(s, new Date(NOW.getTime() - 14 * day));
    expect(backupAdvice(s, NOW).due).toBe(false);
    markBackupDone(s, new Date(NOW.getTime() - 3 * day));
    expect(backupAdvice(s, NOW).due).toBe(false);
  });

  it("si nunca hubo copia, cuenta desde la fecha de inicio", () => {
    const r = backupAdvice(withProgress(), NOW);
    expect(r.never).toBe(true);
    expect(r.due).toBe(true);
    expect(r.days).toBe(56);
    const recent = withProgress();
    recent.setItem(KEYS.startDate, "2026-10-20");
    expect(backupAdvice(recent, NOW).due).toBe(false);
  });

  it("no avisa si no hay progreso que perder", () => {
    const s = new FakeStore();
    s.setItem(KEYS.startDate, "2026-01-01");
    expect(backupAdvice(s, NOW).due).toBe(false);
    s.setItem(KEYS.completions, "{}");
    expect(backupAdvice(s, NOW).due).toBe(false);
  });

  it("no revienta con datos dañados", () => {
    const s = new FakeStore();
    s.setItem(KEYS.completions, "{roto");
    s.setItem(LAST_BACKUP_KEY, "no-es-fecha");
    expect(backupAdvice(s, NOW).due).toBe(false);
  });
});

describe("entregar la copia: compartir con archivo o descargar", () => {
  const file = new File(["{}"], "copia.json", { type: "application/json" });

  it("usa la hoja de compartir cuando puede enviar archivos", async () => {
    const env: DeliverEnv = { canShare: () => true, share: vi.fn().mockResolvedValue(undefined), download: vi.fn() };
    expect(await deliverBackup(file, env)).toBe("shared");
    expect(env.share).toHaveBeenCalledWith({ files: [file], title: expect.any(String) });
    expect(env.download).not.toHaveBeenCalled();
  });

  it("descarga cuando no existe navigator.share", async () => {
    const env: DeliverEnv = { download: vi.fn() };
    expect(await deliverBackup(file, env)).toBe("downloaded");
    expect(env.download).toHaveBeenCalledWith(file);
  });

  it("descarga cuando canShare no acepta archivos", async () => {
    const env: DeliverEnv = { canShare: () => false, share: vi.fn(), download: vi.fn() };
    expect(await deliverBackup(file, env)).toBe("downloaded");
    expect(env.share).not.toHaveBeenCalled();
  });

  it("si share falla por otra razón, cae a la descarga", async () => {
    const env: DeliverEnv = {
      canShare: () => true, share: vi.fn().mockRejectedValue(new DOMException("sin gesto", "NotAllowedError")), download: vi.fn(),
    };
    expect(await deliverBackup(file, env)).toBe("downloaded");
    expect(env.download).toHaveBeenCalled();
  });

  it("si la persona cierra la hoja de compartir, no descarga ni cuenta como copia", async () => {
    const env: DeliverEnv = {
      canShare: () => true, share: vi.fn().mockRejectedValue(new DOMException("cancelado", "AbortError")), download: vi.fn(),
    };
    expect(await deliverBackup(file, env)).toBe("cancelled");
    expect(env.download).not.toHaveBeenCalled();
  });
});

describe("almacenamiento persistente", () => {
  it("pide persist() y devuelve el resultado", async () => {
    const persist = vi.fn().mockResolvedValue(true);
    expect(await requestPersistence({ persist, persisted: async () => false })).toBe("persistent");
    expect(persist).toHaveBeenCalledOnce();
    expect(await requestPersistence({ persist: async () => false, persisted: async () => false })).toBe("not-persistent");
  });

  it("no vuelve a pedir si ya es persistente", async () => {
    const persist = vi.fn();
    expect(await requestPersistence({ persist, persisted: async () => true })).toBe("persistent");
    expect(persist).not.toHaveBeenCalled();
  });

  it("avisa si el navegador no lo soporta o falla", async () => {
    expect(await requestPersistence(undefined)).toBe("unsupported");
    expect(await requestPersistence({ persist: async () => { throw new Error("x"); }, persisted: async () => false })).toBe("not-persistent");
  });
});
