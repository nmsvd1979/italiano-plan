import { CHECKPOINT_WEEKS, TOTAL_WEEKS } from "../../content/plan";
import { useApp } from "../../app/state";
import { internalRoute } from "../../app/links";
import { href } from "../../app/route";
import { formatDateHuman, toISODate } from "../../domain/dates";
import { activitiesForDate, dayLabel, resolveResources, weekDateRange } from "../../domain/planState";
import { aggregateProgress, computeStreak } from "../../domain/progress";
import { Icon } from "../../ui/Icon";
import { ProgressRing } from "../../ui/ProgressRing";
import { ActivityRow } from "./ActivityRow";
import { Tracker } from "./Tracker";

export function Today() {
  const { startDate, today, plan, completions } = useApp();
  if (!startDate || !plan) return null;

  const streak = computeStreak(completions, today);
  const checkpoint = CHECKPOINT_WEEKS[plan.weekNumber];
  const week = aggregateProgress(completions, weekDateRange(startDate, plan.weekNumber));

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          Italiano
        </div>
        <div className="topbar-actions">
          <a className="pill streak" href={href("/progreso")} aria-label={`Racha de ${streak} días. Ver progreso`}>
            <Icon name="flame" size={16} /> {streak}
          </a>
          <a className="pill pill-btn" href={href("/ajustes")} aria-label="Ajustes">
            <Icon name="sliders" size={18} />
          </a>
        </div>
      </header>

      {plan.notStarted ? (
        <div className="card stack">
          <Icon name="hourglass" size={28} />
          <h1 className="title">Tu plan todavía no empezó</h1>
          <p className="sub">Arranca el {formatDateHuman(startDate)}. Vuelve ese día y vas a ver tu primer checklist.</p>
        </div>
      ) : (
        <>
          <section className="card">
            <div className="row">
              <span className="pill accent">Semana {plan.weekNumber} de {TOTAL_WEEKS}</span>
              <span className="pill">{plan.phase.title}</span>
            </div>
            <p className="sub" style={{ marginTop: 10 }}>{plan.phase.focus}</p>
            <Tracker startDate={startDate} completions={completions} currentWeek={plan.weekNumber} />
          </section>

          {checkpoint && (
            <section className="checkpoint">
              <div className="checkpoint-icon"><Icon name="target" size={22} /></div>
              <div>
                <h3>Semana de checkpoint · nivel {checkpoint.level}</h3>
                <p>
                  El fin de semana haces el test de fase. Si vienes atrasada/o, esta semana también sirve de repaso, sin contenido nuevo.
                </p>
              </div>
            </section>
          )}

          {plan.finished ? (
            <section className="card stack">
              <Icon name="trophy" size={28} />
              <h1 className="title">Doce semanas cumplidas</h1>
              <p className="sub">Terminaste el plan. Mira tu historial en Progreso, o reinicia desde Ajustes para repasar.</p>
            </section>
          ) : (
            <DayCard />
          )}

          <a className="card flat bar-block" href={href("/progreso")} style={{ textDecoration: "none" }}>
            <div className="bar-label"><span>Esta semana</span><b>{week.done} de {week.planned}</b></div>
            <div className="bar"><i style={{ width: `${week.planned ? (week.done / week.planned) * 100 : 0}%` }} /></div>
          </a>
        </>
      )}
    </>
  );
}

function DayCard() {
  const { today, plan, completions } = useApp();
  if (!plan) return null;
  const iso = toISODate(today);
  const activities = activitiesForDate(today, plan.weekNumber);
  const doneIds = completions[iso] ?? {};
  const doneCount = activities.filter((a) => doneIds[a.id]).length;
  const complete = doneCount === activities.length;

  return (
    <section className="card">
      <div className="hero-row">
        <div>
          <div className="eyebrow">Hoy · día {plan.dayNumber}</div>
          <h1 className="title" style={{ marginTop: 4 }}>{dayLabel(today)}</h1>
          <p className="sub">{formatDateHuman(today)}</p>
        </div>
        <ProgressRing done={doneCount} planned={activities.length} />
      </div>
      <div className="activities">
        {activities.map((a) => {
          const link = internalRoute(a, plan.weekNumber);
          return (
            <ActivityRow
              key={a.id}
              activity={a}
              done={!!doneIds[a.id]}
              resources={resolveResources(a, plan.phase.id)}
              to={link?.to}
              toLabel={link?.label}
            />
          );
        })}
      </div>
      {complete && (
        <div className="banner-done"><Icon name="check" size={18} /> ¡Completaste el día! Sigue así.</div>
      )}
    </section>
  );
}
