import { useApp } from "../../app/state";
import { goBack, href } from "../../app/route";
import { PHASES, UNITS, UnitMeta } from "../../content/curriculum";
import { unitCycleProgress, unitSettled } from "../../domain/cycle";
import { Icon } from "../../ui/Icon";

export function PlanScreen() {
  const { course, current } = useApp();
  // La siguiente es la primera unidad disponible, sin avance, después de la actual.
  const nextId = UNITS.find((u) => u.ready && current && u.n > current.n && unitCycleProgress(u.id, course).done === 0)?.id;

  const state = (unit: UnitMeta): { label: string; cls: string; detail: string } => {
    if (!unit.ready) return { label: "Pronto", cls: "soon", detail: "Aún sin contenido" };
    const up = unitCycleProgress(unit.id, course);
    const detail = `${up.done} de ${up.total} bloques`;
    if (unit.n < course.startUnit) return { label: "Sabida", cls: "done", detail: "Marcada al empezar" };
    if (unitSettled(unit, course) || (up.total > 0 && up.done === up.total)) return { label: "Completa", cls: "done", detail };
    if (unit.id === current?.id) return { label: "Actual", cls: "current", detail };
    const label = up.done > 0 ? "En curso" : unit.id === nextId ? "Siguiente" : "Más adelante";
    return { label, cls: "next", detail };
  };

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">{UNITS.length} unidades · 32 semanas de núcleo</div>
          <h1 className="title">Plan completo</h1>
        </div>
      </header>

      <p className="sub">
        Cada semana del curso son 7 días de unos 30 minutos (15 en modo corto). Avanzas a tu ritmo: si un día no estudias,
        mañana sigue lo mismo; si tienes más tiempo, puedes hacer más hoy. Las unidades con "pronto" se están preparando.
      </p>

      {PHASES.map((phase) => (
        <section key={phase.id} className="card stack">
          <div>
            <div className="eyebrow">Fase {phase.id}</div>
            <h2 className="unit-title">{phase.title}</h2>
            <p className="sub">{phase.goal}</p>
          </div>
          <div className="unit-list">
            {UNITS.filter((u) => u.phase === phase.id).map((unit) => {
              const st = state(unit);
              return (
                <a key={unit.id} className={`unit-row ${st.cls}`} href={href(`/unidad/${unit.id}`)}>
                  <span className="unit-num">{unit.n}</span>
                  <span className="unit-main">
                    <b>{unit.title}</b>
                    <small>{st.detail}{unit.checkpoint ? " · incluye test de fase" : ""}</small>
                  </span>
                  <span className={`status status-${st.cls}`}>{st.label}</span>
                </a>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
