import type { CSSProperties } from "react";
import { UNITS } from "../../content/curriculum";
import { useApp } from "../../app/state";
import { href } from "../../app/route";
import { currentUnit, unitProgress } from "../../domain/curriculum";
import { Icon } from "../../ui/Icon";

/** Una barra por unidad: llena según lo avanzado; ★ marca los checkpoints; punteada = aún sin contenido. */
export function Tracker() {
  const { steps, progress } = useApp();
  const current = currentUnit(steps, progress);
  const cells = UNITS.map((unit) => {
    const { done, total } = unit.ready ? unitProgress(unit, steps, progress) : { done: 0, total: 0 };
    const pct = total > 0 ? done / total : 0;
    const cls = [
      "tracker-cell",
      unit.id === current?.id ? "current" : "",
      unit.ready ? "" : "soon",
    ].filter(Boolean).join(" ");
    return (
      <a key={unit.id} className={cls} href={href(`/unidad/${unit.id}`)} style={{ "--fill": `${Math.round(pct * 100)}%` } as CSSProperties}
        title={`Unidad ${unit.n}${unit.checkpoint ? " · checkpoint" : ""}${unit.ready ? "" : " · pronto"}`}
        aria-label={`Unidad ${unit.n}: ${unit.title}`}>
        {unit.checkpoint && <span className="tracker-star"><Icon name="star" size={11} /></span>}
      </a>
    );
  });
  return <div className="tracker" role="group" aria-label={`Unidad ${current?.n ?? UNITS.length} de ${UNITS.length}`}>{cells}</div>;
}
