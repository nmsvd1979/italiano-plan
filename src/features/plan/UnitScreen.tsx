import { useApp } from "../../app/state";
import { goBack } from "../../app/route";
import { COURSE } from "../../content/course";
import { getPhase, getUnit } from "../../content/curriculum";
import { internalRoute } from "../../app/links";
import { legacyNote, legacyNoteText } from "../../domain/continuity";
import { blockDone, daysOf, isSoon, unitCycleProgress } from "../../domain/cycle";
import { Icon } from "../../ui/Icon";

export function UnitScreen({ id }: { id: string }) {
  const { steps, course, rawCourse, canDo, toggleCanDo } = useApp();
  const unit = getUnit(id);
  if (!unit) return <p className="sub">No existe esa unidad.</p>;

  const phase = getPhase(unit.phase);
  const up = unitCycleProgress(unit.id, course);
  const marked = canDo[unit.id] ?? [];
  const note = unit.ready ? legacyNote(unit, rawCourse) : null;
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

          {note && (
            <p className="note">
              <Icon name="info" size={16} />
              <span>{legacyNoteText(note)}</span>
            </p>
          )}

          {COURSE.filter((c) => c.unit === unit.id).map((step) => (
            <section key={step.id} className="card stack">
              <div className="eyebrow">{step.part ? `Semana ${step.part}` : "Semana"} · 7 días · {up.done} de {up.total} bloques en total</div>
              {daysOf(step).map((day) => (
                <div key={day.day} className="session">
                  <b>Día {day.day} · {day.name}</b>
                  <ul>
                    {day.blocks.map((b) => {
                      const soon = isSoon(b, unit);
                      const done = !soon && blockDone(step, day.day, b, course);
                      return (
                        <li key={b.id} className={done ? "done" : ""}>
                          <Icon name={done ? "check" : b.icon} size={16} /> {b.name} <span>· {soon ? "en preparación" : `${b.minutes} min`}{b.core && !soon ? " · esencial" : ""}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </section>
          ))}
        </>
      )}
    </>
  );
}
