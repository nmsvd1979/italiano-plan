import type { Activity, Resource } from "../../content/plan";
import { useApp } from "../../app/state";
import { Icon } from "../../ui/Icon";

interface Props {
  activity: Activity;
  done: boolean;
  resources: Resource[];
  /** Ruta interna (herramienta propia) que abre esta actividad, si la tiene. */
  to?: string;
  toLabel?: string;
}

export function ActivityRow({ activity, done, resources, to, toLabel }: Props) {
  const { setDone } = useApp();
  return (
    <div className={`activity${done ? " done" : ""}`}>
      <div className="activity-icon"><Icon name={activity.icon} size={20} /></div>
      <div className="activity-main">
        <div className="activity-head">
          <span className="activity-name">{activity.name}</span>
          <span className="activity-min">{activity.minutes} min</span>
        </div>
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
          </div>
        )}
      </div>
      <input
        className="check"
        type="checkbox"
        checked={done}
        onChange={(e) => setDone(activity.id, e.target.checked)}
        aria-label={`${activity.name}: ${done ? "hecha" : "pendiente"}`}
      />
    </div>
  );
}
