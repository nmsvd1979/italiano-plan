interface Props {
  done: number;
  planned: number;
  size?: number;
}

export function ProgressRing({ done, planned, size = 58 }: Props) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = planned > 0 ? Math.min(1, done / planned) : 0;
  const complete = planned > 0 && done >= planned;
  const mid = size / 2;
  return (
    <svg
      className={`ring${complete ? " done" : ""}`}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`${done} de ${planned} actividades de hoy`}
    >
      <circle className="ring-track" cx={mid} cy={mid} r={r} strokeWidth={stroke} fill="none" />
      <circle
        className="ring-fill"
        cx={mid}
        cy={mid}
        r={r}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        transform={`rotate(-90 ${mid} ${mid})`}
      />
      <text className="ring-text" x={mid} y={mid} textAnchor="middle" dominantBaseline="central">
        {complete ? "✓" : `${done}/${planned}`}
      </text>
    </svg>
  );
}
