import { useApp } from "../../app/state";
import { goBack, href } from "../../app/route";
import { PHASES, UNITS, UnitMeta } from "../../content/curriculum";
import { currentUnit, unitProgress } from "../../domain/curriculum";
import { Icon } from "../../ui/Icon";

export function PlanScreen() {
  const { steps, progress } = useApp();
  const current = currentUnit(steps, progress);

  const state = (unit: UnitMeta): { label: string; cls: string; detail: string } => {
    if (!unit.ready) return { label: "Pronto", cls: "soon", detail: "Aún sin contenido" };
    const up = unitProgress(unit, steps, progress);
    if (unit.n < progress.startUnit) return { label: "Sabida", cls: "done", detail: "Marcada al empezar" };
    if (up.total > 0 && up.done === up.total) return { label: "Completa", cls: "done", detail: `${up.sessionsDone} de 6 sesiones` };
    if (unit.id === current?.id) return { label: "Actual", cls: "current", detail: `${up.sessionsDone} de 6 sesiones` };
    return { label: up.done > 0 ? "En curso" : "Siguiente", cls: "next", detail: `${up.sessionsDone} de 6 sesiones` };
  };

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">24 unidades · unos 6 meses a tu ritmo</div>
          <h1 className="title">Plan completo</h1>
        </div>
      </header>

      <p className="sub">
        Cada unidad son 6 sesiones. Avanzas a tu ritmo: si un día no estudias, mañana sigue lo mismo; si tienes más tiempo,
        sigues con lo que viene. Las unidades con "pronto" se están preparando.
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
