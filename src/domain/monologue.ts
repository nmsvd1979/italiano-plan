// Medidas del monólogo guiado (docs/v2/plan-b1/02). Sin reconocimiento de voz no se puede juzgar lo dicho: solo se mide
// cuánto duró cada vuelta frente a su límite y cuántos puntos marcó cubiertos la persona.

export type LapStatus = "justo" | "pasado" | "corto";

/** Una vuelta muy corta (menos del 40 % del límite) suele dejar puntos sin decir; una que pasa el límite pide más soltura. */
export const SHORT_RATIO = 0.4;

export function lapStatus(seconds: number, limit: number): LapStatus {
  if (seconds > limit) return "pasado";
  if (seconds < limit * SHORT_RATIO) return "corto";
  return "justo";
}

export const LAP_MESSAGE: Record<LapStatus, string> = {
  justo: "Buen tiempo.",
  pasado: "Te pasaste del tiempo: di lo mismo más seguido, sin detenerte a buscar cada palabra.",
  corto: "Quedó muy corto: revisa si dijiste todos los puntos.",
};

/** Actividad de la grabación en IndexedDB: `u02#B:mono:1`. */
export const monoActivity = (stepId: string, lap: number): string => `${stepId}:mono:${lap}`;

export const coveredCount = (covered: readonly boolean[]): number => covered.filter(Boolean).length;

export const MONO_QUESTIONS = ["¿Cubrí todos los puntos?", "¿Llegué al tiempo sin detenerme mucho?", "¿Se entiende lo que dije?"] as const;
