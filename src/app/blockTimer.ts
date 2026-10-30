import { useEffect, useMemo } from "react";
import { routeQuery } from "./route";
import { blockMinutes } from "../domain/cycle";
import { BlockClock, addTiming, ensureTimings } from "../domain/timing";
import { addMinutes, parseBlockKey } from "../domain/activityLog";
import { toISODate } from "../domain/dates";
import { loadSrs } from "../domain/srs";
import { buildQueue, eligibleUnits } from "../domain/srsQueue";
import type { Progress } from "../domain/curriculum";

const BLOCKS = blockMinutes();
const BEATS = ["pointerdown", "keydown", "scroll", "touchstart"] as const;

/** Clave del bloque que se está haciendo (`?k=…` en la ruta), si es un bloque del ciclo. */
const openBlock = (): string | null => {
  const k = routeQuery().get("k");
  return k && BLOCKS.has(k) ? k : null;
};

/**
 * Mide el tiempo real de cada bloque abierto desde Hoy: solo con la pantalla visible, y sin contar las pausas de más de
 * 2 minutos sin tocar nada. Guarda en italianPlan.v2.timing al cambiar de pantalla, ocultar la app o cerrarla.
 */
export function useBlockTimer(): void {
  useEffect(() => {
    ensureTimings(window.localStorage);
    let clock: BlockClock | null = null;

    const flush = () => {
      const slice = clock?.take();
      if (clock && slice) {
        addTiming(window.localStorage, clock.key, slice);
        const b = parseBlockKey(clock.key);
        if (b) addMinutes(window.localStorage, toISODate(new Date()), b.unit, b.activity, slice.ms / 60000);
      }
    };
    const sync = () => {
      const k = openBlock();
      if (clock && clock.key === k) return;
      if (clock) { clock.beat(Date.now()); flush(); }
      clock = k ? new BlockClock(k, Date.now()) : null;
      if (clock && document.visibilityState === "hidden") clock.hide(Date.now());
    };
    const beat = () => clock?.beat(Date.now());
    const onVisibility = () => {
      if (!clock) return;
      if (document.visibilityState === "hidden") { clock.hide(Date.now()); flush(); }
      else clock.show(Date.now());
    };
    const onLeave = () => { clock?.hide(Date.now()); flush(); };

    sync();
    window.addEventListener("hashchange", sync);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onLeave);
    for (const e of BEATS) window.addEventListener(e, beat, { passive: true, capture: true });
    return () => {
      onLeave();
      window.removeEventListener("hashchange", sync);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onLeave);
      for (const e of BEATS) window.removeEventListener(e, beat, { capture: true });
    };
  }, []);
}

/** Tarjetas en la cola de hoy (vencidas y nuevas), para estimar los minutos del repaso espaciado. */
export function useSrsCards(progress: Pick<Progress, "done">, today: Date): number {
  return useMemo(
    () => buildQueue({ state: loadSrs(window.localStorage), today, eligibleUnits: eligibleUnits(progress) }).items.length,
    [progress, today],
  );
}
