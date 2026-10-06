import type { CSSProperties } from "react";
import { CHECKPOINT_WEEKS, TOTAL_WEEKS } from "../../content/plan";
import { aggregateProgress } from "../../domain/progress";
import { weekDateRange } from "../../domain/planState";
import type { Completions } from "../../domain/storage";
import { Icon } from "../../ui/Icon";

interface Props {
  startDate: Date;
  completions: Completions;
  currentWeek: number;
}

/** 12 barras, una por semana: llena según lo completado; ★ marca los checkpoints. */
export function Tracker({ startDate, completions, currentWeek }: Props) {
  const cells = Array.from({ length: TOTAL_WEEKS }, (_, i) => {
    const week = i + 1;
    const past = week <= currentWeek;
    const { planned, done } = past
      ? aggregateProgress(completions, weekDateRange(startDate, week))
      : { planned: 0, done: 0 };
    const pct = planned > 0 ? done / planned : 0;
    const cls = [
      "tracker-cell",
      week === currentWeek ? "current" : "",
      week > currentWeek ? "future" : "",
      week < currentWeek && done === 0 ? "missed" : "",
    ].filter(Boolean).join(" ");
    return (
      <div key={week} className={cls} style={{ "--fill": `${Math.round(pct * 100)}%` } as CSSProperties}
        title={`Semana ${week}${CHECKPOINT_WEEKS[week] ? " · checkpoint" : ""}`}>
        {CHECKPOINT_WEEKS[week] && (
          <span className="tracker-star"><Icon name="star" size={11} /></span>
        )}
      </div>
    );
  });
  return <div className="tracker" role="img" aria-label={`Semana ${currentWeek} de ${TOTAL_WEEKS}`}>{cells}</div>;
}
