import { useApp } from "../../app/state";
import { goBack } from "../../app/route";
import { getPhase, getUnit, sessionsOf } from "../../content/curriculum";
import { internalRoute } from "../../app/links";
import { unitProgress } from "../../domain/curriculum";
import { Icon } from "../../ui/Icon";

export function UnitScreen({ id }: { id: string }) {
  const { steps, progress, canDo, toggleCanDo } = useApp();
  const unit = getUnit(id);
  if (!unit) return <p className="sub">No existe esa unidad.</p>;

  const phase = getPhase(unit.phase);
  const up = unitProgress(unit, steps, progress);
  const marked = canDo[unit.id] ?? [];
  const mine = steps.filter((s) => s.unit.id === unit.id);

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/plan" onClick={(e) => { e.preventDefault(); goBack("/plan"); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">Unidad {unit.n} · Fase {phase.id}</div>
          <h1 className="title">{unit.title}</h1>
        </div>
      </header>

      {!unit.ready && (
        <section className="callout">
          <div className="callout-title"><Icon name="hourglass" size={18} /> Pronto</div>
          <p>Esta unidad todavía no tiene su contenido. El plan la salta por ahora y la incluye cuando esté lista.</p>
        </section>
      )}

      <section className="card stack">
        <div className="eyebrow">Al terminar, puedo…</div>
        <p className="sub">Marca lo que ya logras hacer. Es para ti: no cambia el plan.</p>
        <ul className="cando-check">
          {unit.canDo.map((t, i) => (
            <li key={t}>
              <label>
                <input className="check small" type="checkbox" checked={marked.includes(i)} onChange={() => toggleCanDo(unit.id, i)} />
                <span>{t}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      {unit.ready && (
        <>
          <section className="card stack">
            <div className="eyebrow">Para repasar cuando quieras</div>
            <div className="activity-links">
              {mine.filter((s) => !["test", "review"].includes(s.activity.id)).filter((s, i, a) => a.findIndex((x) => x.activity.id === s.activity.id) === i).map((s) => {
                const link = internalRoute(s);
                return link ? <a key={s.key} className="chip primary" href={link.to}>{s.activity.name} <Icon name="play" size={14} /></a> : null;
              })}
            </div>
          </section>

          <section className="card stack">
            <div className="eyebrow">Las 6 sesiones · {up.done} de {up.total} actividades</div>
            {sessionsOf(unit).map((session) => (
              <div key={session.index} className="session">
                <b>Sesión {session.index}</b>
                <ul>
                  {session.activities.map((a) => {
                    const key = `${unit.id}.s${session.index}.${a.id}`;
                    const done = progress.done.has(key) || unit.n < progress.startUnit;
                    return (
                      <li key={key} className={done ? "done" : ""}>
                        <Icon name={done ? "check" : a.icon} size={16} /> {a.name} <span>· {a.minutes} min</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </section>
        </>
      )}
    </>
  );
}
