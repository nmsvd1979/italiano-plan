import { useEffect, useRef } from "react";
import { startOfDay, toISODate } from "../domain/dates";
import { planStateForDate } from "../domain/planState";
import { hasAnyCompletion } from "../domain/progress";
import { KEYS } from "../domain/storage";
import { useApp } from "./state";

/**
 * Aviso de "todavía no marcaste nada hoy". Usa la Notification API, así que SOLO funciona
 * con la app abierta o en segundo plano (según lo que permita el navegador/iOS): no hay
 * backend ni Push, y con la app cerrada del todo no llega nada.
 */
export function useReminder(): void {
  const { startDate, completions, settings } = useApp();
  const latest = useRef({ startDate, completions, settings });
  latest.current = { startDate, completions, settings };

  useEffect(() => {
    const check = () => {
      const { startDate: start, completions: done, settings: s } = latest.current;
      if (!s.reminderEnabled || !start) return;
      if (!("Notification" in window) || Notification.permission !== "granted") return;

      const now = new Date();
      const today = startOfDay(now);
      const state = planStateForDate(start, today);
      if (state.notStarted || state.finished) return;

      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      if (hhmm < s.reminderTime) return;

      const iso = toISODate(today);
      if (localStorage.getItem(KEYS.lastNotified) === iso) return;
      if (!hasAnyCompletion(done, today)) {
        try {
          new Notification("Italiano — todavía no marcaste nada hoy", {
            body: "Unos minutos de Quizlet o de input y mantenés la racha.",
            icon: "/italiano-plan/icons/icon-192.png",
          });
        } catch {
          // Algunos navegadores móviles no permiten construir Notification directamente.
        }
      }
      localStorage.setItem(KEYS.lastNotified, iso);
    };

    check();
    const id = window.setInterval(check, 60_000);
    return () => window.clearInterval(id);
  }, []);
}
