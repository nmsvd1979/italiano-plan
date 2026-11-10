import { Score } from "../../ui/Score";
import { AREAS, AREA_NAME, WEAK_AREA, objectiveTotalOf, totalOf, type AreaScores, type Battery } from "../../domain/evaluation";

/** Resultado por área, con el aviso de lo que no se pudo evaluar. */
/** `objective`: el total no incluye la producción, que es autoevaluada (prueba de nivel). */
export function ResultView({ scores, battery, objective = false }: { scores: AreaScores; battery: Battery; objective?: boolean }) {
  const t = objective ? objectiveTotalOf(scores) : totalOf(scores);
  return (
    <div className="stack">
      <Score correct={t.correct} total={t.total} />
      {AREAS.filter((a) => scores[a]).map((a) => {
        const s = scores[a]!;
        const pct = s.total ? s.correct / s.total : 0;
        return (
          <div key={a} className="bar-block">
            <div className="bar-label"><span>{AREA_NAME[a]}{pct < WEAK_AREA ? " · por reforzar" : ""}</span><b>{Math.round(s.correct * 10) / 10} de {s.total}</b></div>
            <div className="bar"><i style={{ width: `${pct * 100}%` }} /></div>
          </div>
        );
      })}
      {objective && scores.produccion && (
        <p className="note">La producción es autoevaluada: se muestra, pero no cuenta en el total.</p>
      )}
      {battery.missing.length > 0 && (
        <p className="note" role="status">
          Esta prueba no evaluó {battery.missing.map((a) => AREA_NAME[a].toLowerCase()).join(", ")}: faltan ítems de prueba
          {battery.grammarOnly.length > 0 ? ` de ${battery.grammarOnly.join(", ")}` : ""}. Por ahora solo se mide lo que hay.
        </p>
      )}
    </div>
  );
}
