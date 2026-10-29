import type { CourseStep } from "../../content/course";
import { useOnline } from "../../app/offline";
import { useApp } from "../../app/state";
import { blockResources, blockRoute } from "../../app/blockRoute";
import { Block, CycleDay, blockKey } from "../../domain/cycle";
import { Icon } from "../../ui/Icon";

interface Props {
  step: CourseStep;
  day: CycleDay;
  block: Block;
  done: boolean;
  /** El bloque aún no tiene herramienta o contenido. */
  soon: boolean;
  /** Minutos que se muestran (el repaso espaciado cambia según la cola de hoy). */
  minutes: number;
}

export function BlockRow({ step, day, block, done, soon, minutes }: Props) {
  const { setDone } = useApp();
  const online = useOnline();
  const key = blockKey(step.id, day.day, block.id);
  const route = soon ? undefined : blockRoute(step, day, block);
  const resources = soon ? [] : blockResources(step, block);
  const needsInternet = !!block.needsInternet || resources.length > 0;
  return (
    <div className={`activity${done ? " done" : ""}${soon ? " soon" : ""}`}>
      <div className="activity-icon"><Icon name={block.icon} size={20} /></div>
      <div className="activity-main">
        <div className="activity-head">
          <span className="activity-name">{block.name}</span>
          <span className="activity-min">{minutes} min</span>
          {!block.core && !soon && <span className="activity-unit">Recomendado</span>}
          {soon && <span className="net-tag">En preparación</span>}
          {needsInternet && !soon && <span className="net-tag">Necesita internet</span>}
        </div>
        {soon && <p className="activity-hint">Todavía no está listo. No hace falta para completar el día.</p>}
        {needsInternet && !online && !done && !soon && <p className="activity-hint">Sin conexión: déjalo para cuando tengas internet.</p>}
        {(route || resources.length > 0) && (
          <div className="activity-links">
            {route && (
              <a className="chip primary" href={route.to}>
                {route.label} <Icon name="play" size={14} />
              </a>
            )}
            {resources.map((r) => (
              <a key={r.url} className="chip" href={r.url} target="_blank" rel="noopener noreferrer">
                {r.name} <Icon name="external" size={14} />
              </a>
            ))}
          </div>
        )}
      </div>
      {!soon && block.kind !== "mini" && (
        <input
          className="check"
          type="checkbox"
          checked={done}
          onChange={(e) => setDone(key, e.target.checked)}
          aria-label={`${block.name}: ${done ? "hecho" : "pendiente"}`}
        />
      )}
    </div>
  );
}
