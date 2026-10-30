import { useApp } from "../../app/state";
import { loadLog } from "../../domain/activityLog";
import { AREAS, AREA_NAME, WEAK_AREA } from "../../domain/evaluation";
import { STRAND_NAME, activeWords, areaAccuracy, recallRate, strandMinutes, studiedDays, type Strand } from "../../domain/panel";
import { loadSrs } from "../../domain/srs";

/** Barras horizontales en SVG propio, sin librerías. */
function Bars({ rows, max, unit, mark }: { rows: { label: string; value: number }[]; max: number; unit: string; mark?: number }) {
  const h = 26;
  return (
    <svg viewBox={`0 0 320 ${rows.length * h}`} width="100%" role="img" aria-label={rows.map((r) => `${r.label}: ${Math.round(r.value)} ${unit}`).join(", ")}>
      {rows.map((r, i) => (
        <g key={r.label} transform={`translate(0 ${i * h})`}>
          <text x="0" y="16" fontSize="12" fill="currentColor">{r.label}</text>
          <rect x="90" y="5" width="170" height="12" rx="6" fill="currentColor" opacity="0.12" />
          <rect x="90" y="5" width={Math.max(0, Math.min(1, max ? r.value / max : 0)) * 170} height="12" rx="6" fill="var(--accent)" />
          {mark !== undefined && <line x1={90 + mark * 170} x2={90 + mark * 170} y1="2" y2="20" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />}
          <text x="268" y="16" fontSize="12" fill="currentColor">{Math.round(r.value)} {unit}</text>
        </g>
      ))}
    </svg>
  );
}

/** Panel de progreso (docs/v2/06 F5) con datos reales; F6: lo que no se puede medir se dice. */
export function Panel() {
  const { today, completions } = useApp();
  const srs = loadSrs(window.localStorage);
  const log = loadLog(window.localStorage);
  const recall = recallRate(srs, today);
  const acc = areaAccuracy(log, today);
  const mins = strandMinutes(log, today);
  const days = studiedDays(completions, today);
  const accRows = AREAS.filter((a) => acc[a]?.total).map((a) => ({ label: AREA_NAME[a], value: (acc[a]!.correct / acc[a]!.total) * 100 }));
  const strandRows = (Object.keys(STRAND_NAME) as Strand[]).map((s) => ({ label: STRAND_NAME[s], value: mins[s] }));
  const maxMin = Math.max(30, ...strandRows.map((r) => r.value));

  return (
    <>
      <section className="card stack">
        <div className="eyebrow">Repaso espaciado (30 días)</div>
        <div className="row" style={{ gap: 24 }}>
          <div><div className="score">{recall.rate === null ? "—" : `${Math.round(recall.rate * 100)} %`}</div><p className="sub">recuerdo real{recall.answers ? ` · ${recall.answers} respuestas` : ""}</p></div>
          <div><div className="score">{activeWords(srs)}</div><p className="sub">palabras activas (estabilidad ≥ 21 días)</p></div>
        </div>
        {recall.rate === null && <p className="sub">Aún no hay suficientes repasos para medir el recuerdo.</p>}
      </section>

      <section className="card stack">
        <div className="eyebrow">Aciertos por habilidad (pruebas de 30 días)</div>
        {accRows.length === 0 ? <p className="sub">Todavía no hay pruebas con resultado por área.</p> : <Bars rows={accRows} max={100} unit="%" mark={WEAK_AREA} />}
      </section>

      <section className="card stack">
        <div className="eyebrow">Minutos por hebra (7 días)</div>
        <Bars rows={strandRows} max={maxMin} unit="min" />
      </section>

      <section className="card stack">
        <div className="eyebrow">Días estudiados (14 días)</div>
        <svg viewBox="0 0 280 28" width="100%" role="img" aria-label={`${days.filter((d) => d.studied).length} de ${days.length} días estudiados`}>
          {days.map((d, i) => <circle key={d.date} cx={10 + i * 20} cy="14" r="7" fill={d.studied ? "var(--accent)" : "currentColor"} opacity={d.studied ? 1 : 0.15}><title>{d.date}</title></circle>)}
        </svg>
        <p className="sub">{days.filter((d) => d.studied).length} de {days.length} días.</p>
      </section>

      <p className="note">
        Lo que no se puede medir aquí: la pronunciación y la escritura reales. Se aproximan con tu autoevaluación y con la corrección opcional con Claude.
      </p>
    </>
  );
}
