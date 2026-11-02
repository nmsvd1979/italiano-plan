import { describe, expect, it } from "vitest";
import { COURSE } from "../content/course";
import { AUDIO_PENDING, PRON_UNITS, audioFiles } from "../content/pronunciation";
import { blockRoute } from "../app/blockRoute";
import { BACKUP_APP, BACKUP_VERSION, buildBackup, parseBackup } from "./backup";
import { LOG_KEY, appendLog } from "./activityLog";
import { MAX_TRIALS, buildTrials, retryTrial, speakerOf } from "./pronunciation";
import { clearProgress, type KV } from "./storage";
import { daysOf } from "./cycle";

describe("serie de percepción (docs/v2/05 E2)", () => {
  it("la voz sale del nombre del archivo", () => {
    expect(speakerOf("cane--xana000.mp3")).toBe("xana000");
    expect(speakerOf("ci--langpao.mp3")).toBe("langpao");
  });

  it("con 3 o más voces disponibles en el contraste, los 8 intentos usan al menos 3 voces distintas", () => {
    let checked = 0;
    for (const u of PRON_UNITS) {
      const voices = new Set(u.pairs.flat().flatMap((w) => audioFiles(w).map(speakerOf)));
      if (voices.size < 3) continue;
      const trials = buildTrials(u.pairs, audioFiles, 8, `x:${u.unit}`);
      expect(trials.length, u.unit).toBe(8);
      expect(new Set(trials.map((t) => speakerOf(t.file))).size, u.unit).toBeGreaterThanOrEqual(3);
      checked++;
    }
    expect(checked).toBeGreaterThan(5);
  });

  it("los pares mínimos solo suenan con audio nativo (nunca sintético) y el objetivo es una de las dos opciones", () => {
    for (const u of PRON_UNITS) {
      for (const t of buildTrials(u.pairs, audioFiles, 8, `x:${u.unit}`)) {
        expect(audioFiles(t.target), `${u.unit}:${t.target}`).toContain(t.file);
        expect(AUDIO_PENDING).not.toContain(t.target);
        expect(t.options).toContain(t.target);
      }
    }
  });

  it("misma semilla = mismos intentos", () => {
    const u = PRON_UNITS.find((p) => p.pairs.length > 2)!;
    expect(buildTrials(u.pairs, audioFiles, 8, "a")).toEqual(buildTrials(u.pairs, audioFiles, 8, "a"));
  });

  it("si falla un contraste, el siguiente intento vuelve sobre ese mismo par, con otra voz si la hay", () => {
    let withOtherVoice = 0;
    for (const u of PRON_UNITS) {
      for (const t of buildTrials(u.pairs, audioFiles, 8, `x:${u.unit}`)) {
        const again = retryTrial(t, u.pairs, audioFiles, "r")!;
        expect(again, `${u.unit}:${t.target}`).not.toBeNull();
        expect([...again.options].sort()).toEqual([...t.options].sort());
        expect(audioFiles(again.target)).toContain(again.file);
        if (again.file !== t.file) withOtherVoice++;
      }
    }
    expect(withOtherVoice).toBeGreaterThan(0);
  });

  it("prefiere la misma palabra con otra voz; si no hay, la otra palabra del par con otra voz; en último caso, el mismo audio", () => {
    const files: Record<string, string[]> = { cane: ["cane--a.mp3", "cane--b.mp3"], cena: ["cena--a.mp3"] };
    const f = (w: string) => files[w] ?? [];
    const failed = { target: "cane", options: ["cane", "cena"] as [string, string], file: "cane--a.mp3" };
    expect(retryTrial(failed, [["cane", "cena"]], f, "r")).toMatchObject({ target: "cane", file: "cane--b.mp3" });
    const single = { target: "cena", options: ["cane", "cena"] as [string, string], file: "cena--a.mp3" };
    const again = retryTrial(single, [["cane", "cena"]], f, "r")!;
    expect(again.file).not.toBe("cena--a.mp3"); // la otra palabra del par, con otra voz
    expect([...again.options].sort()).toEqual(["cane", "cena"]);
    const lone = { target: "cena", options: ["cane", "cena"] as [string, string], file: "cena--a.mp3" };
    expect(retryTrial(lone, [["cane", "cena"]], (w) => (w === "cena" ? ["cena--a.mp3"] : []), "r")).toMatchObject({ target: "cena", file: "cena--a.mp3" });
    expect(retryTrial(failed, [["x", "y"]], f, "r")).toBeNull();
    expect(MAX_TRIALS).toBe(10);
  });
});

describe("rutas de grabar y comparar", () => {
  it("el diálogo con rol del día 4 y «Repetir y comparar» del día 4 abren las pantallas nuevas; los demás bloques, no", () => {
    for (const s of COURSE) {
      const days = daysOf(s);
      const find = (day: number, id: string) => days[day - 1].blocks.find((b) => b.id === id)!;
      expect(blockRoute(s, days[3], find(4, "roleplay"))!.to).toContain("mode=rol");
      expect(blockRoute(s, days[3], find(4, "compare"))!.to).toContain("mode=comparar");
      expect(blockRoute(s, days[3], find(4, "compare"))!.to).toContain("/pronunciacion/");
      expect(blockRoute(s, days[0], find(1, "dialogue"))!.to).not.toContain("mode=");
      expect(blockRoute(s, days[0], find(1, "repeat"))!.to).not.toContain("mode=");
      expect(blockRoute(s, days[0], find(1, "sound"))!.to).not.toContain("mode=");
      if (s.part) expect(blockRoute(s, days[3], find(4, "roleplay"))!.to).toContain(`part=${s.part}`);
    }
  });
});

describe("el registro de actividad en la copia de seguridad", () => {
  class Store implements KV {
    map = new Map<string, string>();
    get length() { return this.map.size; }
    key(i: number) { return [...this.map.keys()][i] ?? null; }
    getItem(k: string) { return this.map.get(k) ?? null; }
    setItem(k: string, v: string) { this.map.set(k, v); }
    removeItem(k: string) { this.map.delete(k); }
  }
  it("viaja en la copia, se valida como arreglo y «Borrar progreso» lo quita", () => {
    const store = new Store();
    appendLog(store, { date: "2026-11-01", unit: "u04", activity: "rol", minutes: 0, selfRating: 3 });
    const parsed = parseBackup(JSON.stringify(buildBackup(store)));
    expect(parsed.ok && parsed.backup.data[LOG_KEY]).toBe(store.getItem(LOG_KEY));
    expect(parsed.ok && parsed.ignored).toEqual([]);
    expect(parseBackup(JSON.stringify({ app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: new Date().toISOString(), data: { [LOG_KEY]: "{}" } })).ok).toBe(false);
    clearProgress(store);
    expect(store.getItem(LOG_KEY)).toBeNull();
  });
});
