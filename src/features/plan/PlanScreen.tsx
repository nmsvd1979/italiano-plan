import { useApp } from "../../app/state";
import { href } from "../../app/route";
import { COURSE, CourseStep } from "../../content/course";
import { PHASES, UNITS, UnitMeta, getUnit } from "../../content/curriculum";
import { currentSlot, dayComplete, daysFor, unitCycleProgress, unitSettled, weekComplete } from "../../domain/cycle";
import { getPhaseTests } from "../../domain/storage";
import { Icon } from "../../ui/Icon";

/** Las unidades en el orden en que se estudian (una vez cada una, aunque se parta en semanas A y B). */
const ORDER: CourseStep[] = [...new Map(COURSE.map((s) => [s.unit, s])).values()];

export function PlanScreen() {
  const { course, current } = useApp();
  const slot = currentSlot(course);
  const phaseTests = getPhaseTests();
  const core = COURSE.filter((s) => s.kind === "core");
  const weeksDone = core.filter((s) => weekComplete(s, course)).length;
  const pct = Math.round((weeksDone / core.length) * 100);

  const state = (unit: UnitMeta): { label: string; cls: string; detail: string } => {
    if (!unit.ready) return { label: "Pronto", cls: "soon", detail: "Aún sin contenido" };
    const up = unitCycleProgress(unit.id, course);
    const detail = `${up.done} de ${up.total} bloques`;
    if (unit.n < course.startUnit) return { label: "Sabida", cls: "done", detail: "Marcada al empezar" };
    if (unitSettled(unit, course) || (up.total > 0 && up.done === up.total)) return { label: "Completa", cls: "done", detail };
    if (unit.id === current?.id) return { label: "Actual", cls: "current", detail };
    return { label: up.done > 0 ? "En curso" : "Más adelante", cls: up.done > 0 ? "now" : "next", detail };
  };

  return (
    <>
      <header className="screen-head">
        <div>
          <div className="eyebrow">{UNITS.length} unidades · {core.length} semanas de núcleo</div>
          <h1 className="title">Plan</h1>
        </div>
      </header>

      <section className="level" aria-label={`Avance del núcleo: ${pct} %`}>
        <div className="level-track"><i style={{ width: `${Math.max(pct, 2)}%` }} /><span style={{ left: `${Math.max(Math.min(pct, 98), 2)}%` }} /></div>
        <div className="level-ticks"><b>A0</b><b>A1</b><b>A2</b><a href={href("/practica-b1")}>B1 ›</a></div>
        <p className="sub">{weeksDone} de {core.length} semanas completas. Avanzas a tu ritmo: si un día no estudias, mañana sigue lo mismo.</p>
      </section>

      {PHASES.map((phase) => {
        const steps = ORDER.filter((s) => s.phase === phase.id);
        const units = steps.map((s) => ({ step: s, unit: getUnit(s.unit)! })).filter((x) => x.unit);
        if (units.length === 0) return null;
        const doneCount = units.filter(({ unit }) => state(unit).cls === "done").length;
        const hasCurrent = units.some(({ unit }) => unit.id === current?.id);
        return (
          <details key={phase.id} className="phase" open={hasCurrent}>
            <summary>
              <span className="eyebrow">Fase {phase.id} · {doneCount} de {units.length} unidades</span>
              <span className="phase-title it">{phase.title}</span>
              <span className="seg" aria-hidden="true">
                {units.map(({ unit }) => <i key={unit.id} className={state(unit).cls === "done" ? "done" : unit.id === current?.id ? "now" : ""} />)}
              </span>
            </summary>
            <p className="sub phase-goal">{phase.goal}</p>
            <ol className="timeline">
              {units.map(({ step, unit }) => {
                const st = state(unit);
                const pos = ORDER.indexOf(step) + 1;
                const isCurrent = unit.id === current?.id;
                const here = slot && slot.step.unit === unit.id ? slot : null;
                const days = isCurrent ? daysFor(here?.step ?? step, course) : [];
                const tested = phaseTests[unit.phase]?.length > 0;
                return (
                  <li key={unit.id} className={`tl-item ${st.cls}`}>
                    <span className={`dot ${st.cls === "done" ? "done" : isCurrent ? "now" : ""}`}>{st.cls === "done" ? <Icon name="check" size={13} /> : pos}</span>
                    {isCurrent ? (
                      <a className="card tl-current" href={href(`/unidad/${unit.id}`)}>
                        <span className="eyebrow">{step.kind === "bridge" ? "Puente a B1 · ahora" : `Semana ${step.week} · ahora`}</span>
                        <b className="unit-title">{unit.title}</b>
                        <span className="sub">{here ? `Día ${here.day.day} de 7 · ` : ""}{st.detail}</span>
                        <span className="seg" aria-hidden="true">
                          {days.map((d) => <i key={d.day} className={dayComplete(here?.step ?? step, d, course) ? "done" : d.day === here?.day.day ? "now" : ""} />)}
                        </span>
                      </a>
                    ) : (
                      <a className="tl-row" href={href(`/unidad/${unit.id}`)}>
                        <b>{unit.title}</b>
                        <small>{st.cls === "soon" ? st.detail : `${st.detail}${step.kind === "bridge" ? " · opcional" : ""}`}</small>
                      </a>
                    )}
                    {unit.checkpoint && (
                      <a className="tl-test" href={href(`/test/${unit.phase}`)}>
                        <span className={`dot test`}>{tested ? <Icon name="check" size={13} /> : "✦"}</span>
                        Test de fase{tested ? " · hecho" : ""}
                      </a>
                    )}
                  </li>
                );
              })}
            </ol>
          </details>
        );
      })}

      <section className="card flat link-list">
        <div className="eyebrow">Opcional</div>
        <a href={href("/practica-b1")}><span><b>Práctica B1</b><small className="sub"> Lecturas y audios más largos</small></span><Icon name="chevronRight" size={18} /></a>
        <a href={href("/listo-b1")}><span><b>Listo para B1</b><small className="sub"> Seis evidencias para empezar B1</small></span><Icon name="chevronRight" size={18} /></a>
      </section>
    </>
  );
}
