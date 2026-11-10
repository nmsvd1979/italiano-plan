import { useApp } from "../../app/state";
import { loadLog } from "../../domain/activityLog";
import { AREAS, AREA_NAME, WEAK_AREA } from "../../domain/evaluation";
import { STRAND_NAME, activeWords, areaAccuracy, recallRate, strandMinutes, type Strand } from "../../domain/panel";
import { loadSrs } from "../../domain/srs";
import { Bars } from "../../ui/Bars";

/** Aciertos por habilidad en las pruebas de 30 días, con la línea del umbral. */
export function Skills() {
  const { today } = useApp();
  const acc = areaAccuracy(loadLog(window.localStorage), today);
  const rows = AREAS.filter((a) => acc[a]?.total).map((a) => {
    const value = (acc[a]!.correct / acc[a]!.total) * 100;
    return { label: AREA_NAME[a], value, text: `${Math.round(value)} %`, weak: value < WEAK_AREA * 100 };
  });
  return (
    <section className="card stack">
      <div className="eyebrow">Aciertos por habilidad · 30 días</div>
      {rows.length === 0 ? <p className="sub">Todavía no hay pruebas con resultado por área.</p> : <Bars rows={rows} max={100} mark={WEAK_AREA} />}
      {rows.length > 0 && <p className="note">La línea marca el {Math.round(WEAK_AREA * 100)} %: por debajo, conviene reforzar esa habilidad.</p>}
    </section>
  );
}

/** Minutos de la semana por hebra del método. */
export function Strands() {
  const { today } = useApp();
  const mins = strandMinutes(loadLog(window.localStorage), today);
  const rows = (Object.keys(STRAND_NAME) as Strand[]).map((s) => ({ label: STRAND_NAME[s], value: mins[s], text: `${Math.round(mins[s])} min` }));
  return (
    <section className="card stack">
      <div className="eyebrow">Minutos por hebra · 7 días</div>
      <Bars rows={rows} max={Math.max(30, ...rows.map((r) => r.value))} />
    </section>
  );
}

/** Palabras activas y recuerdo real del repaso espaciado (30 días). */
export function useSrsFigures(): { words: number; recall: string } {
  const { today } = useApp();
  const srs = loadSrs(window.localStorage);
  const recall = recallRate(srs, today);
  return { words: activeWords(srs), recall: recall.rate === null ? "" : ` · recuerdo ${Math.round(recall.rate * 100)} %` };
}

export const NOT_MEASURABLE = "Lo que no se puede medir aquí: la pronunciación y la escritura reales. Se aproximan con tu autoevaluación y con la corrección opcional con Claude.";
