export interface BarRow {
  label: string;
  value: number;
  /** Texto del valor a la derecha («82 %», «12 min»). */
  text: string;
  /** Por debajo del umbral: se pinta en ocre. */
  weak?: boolean;
}

/** Barras horizontales con el valor a la vista. `mark` (0 a 1) dibuja una línea de umbral. */
export function Bars({ rows, max, mark }: { rows: BarRow[]; max: number; mark?: number }) {
  return (
    <ul className="bars">
      {rows.map((r) => (
        <li key={r.label} className={r.weak ? "weak" : ""}>
          <div className="bars-head"><span>{r.label}</span><b>{r.text}</b></div>
          <div className="bars-track">
            <i style={{ width: `${Math.max(0, Math.min(1, max ? r.value / max : 0)) * 100}%` }} />
            {mark !== undefined && <span style={{ left: `${mark * 100}%` }} />}
          </div>
        </li>
      ))}
    </ul>
  );
}

export interface DayBar {
  label: string;
  minutes: number;
  today?: boolean;
}

/** Columnas por día (la semana), con hoy marcado. */
export function DayBars({ days }: { days: DayBar[] }) {
  const max = Math.max(30, ...days.map((d) => d.minutes));
  return (
    <div className="daybars" role="img" aria-label={days.map((d) => `${d.label}: ${d.minutes} min`).join(", ")}>
      {days.map((d, i) => (
        <div key={i} className={d.today ? "today" : ""}>
          <small>{d.minutes > 0 ? d.minutes : ""}</small>
          <span><i style={{ height: `${Math.max(d.minutes > 0 ? 8 : 4, (d.minutes / max) * 100)}%` }} className={d.minutes > 0 ? "on" : ""} /></span>
          <em>{d.label}</em>
        </div>
      ))}
    </div>
  );
}
