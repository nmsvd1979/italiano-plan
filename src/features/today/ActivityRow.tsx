import type { Resource } from "../../content/plan";
import { useOnline } from "../../app/offline";
import { useApp } from "../../app/state";
import type { Step } from "../../domain/curriculum";
import { Icon } from "../../ui/Icon";

interface Props {
  step: Step;
  done: boolean;
  resources: Resource[];
  /** Ruta interna (herramienta propia) que abre esta actividad, si la tiene. */
  to?: string;
  toLabel?: string;
  /** Texto de apoyo bajo el nombre (ej. qué episodio toca). */
  hint?: string;
  /** Muestra "Dejar para después". */
  canSkip?: boolean;
}

export function ActivityRow({ step, done, resources, to, toLabel, hint, canSkip }: Props) {
  const { setDone, setSkipped } = useApp();
  const online = useOnline();
  const { activity } = step;
  // El shadowing carga YouTube y los recursos son enlaces externos: ninguno funciona sin conexión.
  const needsInternet = activity.kind === "shadowing" || resources.length > 0;
  return (
    <div className={`activity${done ? " done" : ""}`}>
      <div className="activity-icon"><Icon name={activity.icon} size={20} /></div>
      <div className="activity-main">
        <div className="activity-head">
          <span className="activity-name">{activity.name}</span>
          <span className="activity-min">{activity.minutes} min</span>
          {step.unit && <span className="activity-unit">U{step.unit.n}</span>}
          {needsInternet && <span className="net-tag">Necesita internet</span>}
        </div>
        {hint && !done && <p className="activity-hint">{hint}</p>}
        {needsInternet && !online && !done && <p className="activity-hint">Sin conexión: déjala para cuando tengas internet.</p>}
        {(to || resources.length > 0) && (
          <div className="activity-links">
            {to && (
              <a className="chip primary" href={to}>
                {toLabel ?? "Empezar"} <Icon name="play" size={14} />
              </a>
            )}
            {resources.map((r) => (
              <a key={r.url} className="chip" href={r.url} target="_blank" rel="noopener noreferrer">
                {r.name} <Icon name="external" size={14} />
              </a>
            ))}
            {canSkip && !done && (
              <button type="button" className="chip" onClick={() => setSkipped(step.key, true)}>Dejar para después</button>
            )}
          </div>
        )}
        {canSkip && !done && !to && resources.length === 0 && (
          <div className="activity-links">
            <button type="button" className="chip" onClick={() => setSkipped(step.key, true)}>Dejar para después</button>
          </div>
        )}
      </div>
      <input
        className="check"
        type="checkbox"
        checked={done}
        onChange={(e) => setDone(step.key, e.target.checked)}
        aria-label={`${activity.name}: ${done ? "hecha" : "pendiente"}`}
      />
    </div>
  );
}
