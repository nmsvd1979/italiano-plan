import { AREAS, AREA_NAME, WEAK_AREA, totalOf, type AreaScores, type Battery } from "../../domain/evaluation";

/** Resultado por área, con el aviso de lo que no se pudo evaluar. */
export function ResultView({ scores, battery }: { scores: AreaScores; battery: Battery }) {
  const t = totalOf(scores);
  return (
    <div className="stack">
      <div className="score">{Math.round(t.correct * 10) / 10} de {t.total}</div>
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
      {battery.missing.length > 0 && (
        <p className="note" role="status">
          Esta prueba no evaluó {battery.missing.map((a) => AREA_NAME[a].toLowerCase()).join(", ")}: faltan ítems de prueba
          {battery.grammarOnly.length > 0 ? ` de ${battery.grammarOnly.join(", ")}` : ""}. Por ahora solo se mide lo que hay.
        </p>
      )}
    </div>
  );
}
