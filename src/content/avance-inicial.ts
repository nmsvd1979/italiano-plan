// Avance real de la persona al cambiar a la v2 (docs/v2/14 §1, «Semilla de avance»): unidad 1, sesiones 1 a 5
// (17 de las 22 actividades). Queda en el repositorio para no depender de que el navegador conserve los datos.
// Se aplica solo con el botón de Hoy, nunca automáticamente (domain/seed.ts).

export interface AvanceInicial {
  /** Día (AAAA-MM-DD) en que se marcan las actividades: ese día o antes, sin inventar racha. */
  fecha: string;
  /** Unidad → sesiones completas (1 a 6). */
  unidades: Record<string, { sesiones: number[] }>;
}

export const AVANCE_INICIAL: AvanceInicial = {
  fecha: "2026-10-27",
  unidades: { u01: { sesiones: [1, 2, 3, 4, 5] } },
};
