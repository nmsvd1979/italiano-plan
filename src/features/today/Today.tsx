import { useState } from "react";
import { PHASES, getPhase } from "../../content/curriculum";
import { useApp } from "../../app/state";
import { internalRoute, resolveResources, stepHint } from "../../app/links";
import { href } from "../../app/route";
import { Step, currentUnit, isFinished, pendingSteps, planDay, unitProgress } from "../../domain/curriculum";
import { formatDateHuman } from "../../domain/dates";
import { paceOf } from "../../domain/pace";
import { candidatesOf, dueCandidates, learnedUnits } from "../../domain/practice";
import { computeStreak, daysSinceLastStudy } from "../../domain/progress";
import { backupAdvice } from "../../domain/backup";
import { getReview } from "../../domain/storage";
import { Icon } from "../../ui/Icon";
import { ProgressRing } from "../../ui/ProgressRing";
import { ActivityRow } from "./ActivityRow";
import { OfflineBanner } from "./OfflineBanner";
import { Tracker } from "./Tracker";

const BUDGETS = [15, 30, 60, 90];
const MAX_PENDING = 3;

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function Today() {
  const { startDate, today, steps, progress, completions, settings } = useApp();
  if (!startDate) return null;

  const streak = computeStreak(completions, today);
  const finished = isFinished(steps, progress);
  const unit = currentUnit(steps, progress);
  const phase = unit ? getPhase(unit.phase) : PHASES[PHASES.length - 1];
  const pace = paceOf({
    steps, progress, completions, start: startDate, today, sessionsPerWeek: settings.sessionsPerWeek,
  });
  const up = unit ? unitProgress(unit, steps, progress) : null;

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
          <a className="pill pill-btn" href={href("/plan")} aria-label="Plan completo">
            <Icon name="map" size={18} />
          </a>
          <a className="pill pill-btn" href={href("/ajustes")} aria-label="Ajustes">
            <Icon name="sliders" size={18} />
          </a>
        </div>
      </header>

      <OfflineBanner />
      <BackupReminder />

      {unit && up && !finished && (
        <a href={href(`/unidad/${unit.id}`)} className="unit-head">
          <span className="eyebrow">Unidad {unit.n} de 24 · Fase {phase.id} · sesión {Math.min(6, up.sessionsDone + 1)} de 6</span>
          <b>{unit.title}</b>
        </a>
      )}

      {finished ? (
        <section className="card stack">
          <Icon name="trophy" size={28} />
          <h1 className="title">Terminaste lo disponible</h1>
          <p className="sub">
            Completaste todas las unidades con contenido. Las demás figuran como "pronto" en el Plan: cuando se agreguen, aparecen aquí.
            Mientras, el repaso mixto y el shadowing libre siguen disponibles.
          </p>
          <a className="btn block" href={href("/repaso")} style={{ textAlign: "center", textDecoration: "none" }}>Repaso mixto</a>
        </section>
      ) : (
        <>
          <DayCard />
          {unit && up && (
            <section className="card">
              <div className="eyebrow">Tu avance</div>
              <p className="sub" style={{ marginTop: 6 }}>{up.done} de {up.total} actividades de la unidad {unit.n}. Al terminarla podrás:</p>
              <ul className="candos">
                {unit.canDo.map((t) => <li key={t}>{t}</li>)}
              </ul>
              <Tracker />
              <div className={`pace pace-${pace.status}`}>
                <b>
                  {pace.status === "ontrack" && "Al día con tu ritmo"}
                  {pace.status === "behind" && `Vas ${plural(pace.sessions, "sesión", "sesiones")} detrás del ritmo`}
                  {pace.status === "ahead" && `Vas ${plural(pace.sessions, "sesión", "sesiones")} adelante del ritmo`}
                </b>
                {pace.endDate && <span>Con este ritmo terminas las unidades disponibles hoy el {formatDateHuman(pace.endDate)}.</span>}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}

/** Aviso cuando pasan más de 14 días sin copia de seguridad. */
function BackupReminder() {
  const advice = backupAdvice(window.localStorage);
  if (!advice.due) return null;
  return (
    <a className="card flat review-card" href={href("/ajustes")}>
      <div>
        <div className="eyebrow">Copia de seguridad</div>
        <p className="sub">
          {advice.never ? `Llevas ${advice.days} días sin hacer una copia.` : `Hace ${advice.days} días que no haces una copia.`}{" "}
          Toca para guardarla.
        </p>
      </div>
      <Icon name="info" size={22} />
    </a>
  );
}

function DayCard() {
  const { today, steps, progress, doneToday, settings, patchSettings, completions } = useApp();
  const [extra, setExtra] = useState(0);
  const budget = settings.dailyMinutes + extra;
  const plan = planDay(steps, progress, doneToday, budget);

  const pending = pendingSteps(steps, progress).slice(0, MAX_PENDING);
  const doneCount = plan.items.filter((i) => i.done).length;
  const complete = plan.items.length > 0 && doneCount === plan.items.length;
  const minutes = plan.items.reduce((n, i) => n + i.step.activity.minutes, 0);

  const since = daysSinceLastStudy(completions, today);
  const due = dueCandidates(candidatesOf(learnedUnits(progress)), getReview(), today).length;

  const sameDayLessonAndPractice = plan.items.some((i) => i.step.activity.id === "lesson" && i.done)
    && plan.items.some((i) => i.step.activity.id === "practice");

  const row = (step: Step, done: boolean, canSkip: boolean) => {
    const link = internalRoute(step);
    return (
      <ActivityRow
        key={step.key}
        step={step}
        done={done}
        resources={resolveResources(step)}
        to={link?.to}
        toLabel={link?.label}
        hint={stepHint(step, steps, progress.startUnit)}
        canSkip={canSkip}
      />
    );
  };

  return (
    <>
      {due > 0 && (
        <a className="card flat review-card" href={href("/repaso-pendiente")}>
          <div>
            <div className="eyebrow">{since !== null && since >= 3 ? `Vuelves después de ${since} días` : "Repaso pendiente"}</div>
            <p className="sub">
              {since !== null && since >= 3
                ? `Empieza con un repaso corto: ${plural(due, "ejercicio vencido", "ejercicios vencidos")}.`
                : `${plural(due, "ejercicio que fallaste está", "ejercicios que fallaste están")} listo${due === 1 ? "" : "s"} para volver.`}
            </p>
          </div>
          <Icon name="repeat" size={22} />
        </a>
      )}

      <section className="card">
        <div className="hero-row">
          <div>
            <div className="eyebrow">Hoy · {formatDateHuman(today)}</div>
            <h1 className="title" style={{ marginTop: 4 }}>{plan.items.length > 0 ? `${minutes} min de estudio` : "Nada por hacer hoy"}</h1>
            <p className="sub">Elige cuánto tiempo tienes; el plan se ajusta.</p>
          </div>
          <ProgressRing done={doneCount} planned={plan.items.length} />
        </div>

        <div className="segmented budget" role="group" aria-label="Tiempo disponible hoy">
          {BUDGETS.map((m) => (
            <button key={m} type="button" aria-pressed={settings.dailyMinutes === m}
              onClick={() => { patchSettings({ dailyMinutes: m }); setExtra(0); }}>
              {m} min
            </button>
          ))}
        </div>

        {plan.items.length > 0 ? (
          <div className="activities">
            {plan.items.map(({ step, done }) => row(step, done, true))}
          </div>
        ) : (
          <p className="sub" style={{ marginTop: 12 }}>
            {plan.blocked
              ? "Lo que sigue depende de algo que dejaste para después. Hazlo desde Pendientes y el plan continúa."
              : "Ya no queda nada disponible por ahora."}
          </p>
        )}

        {sameDayLessonAndPractice && (
          <p className="note" style={{ marginTop: 12 }}>
            <Icon name="info" size={16} />
            <span>Hiciste la lección hoy. La práctica rinde más si la dejas para otro día; si prefieres, toca "Dejar para después".</span>
          </p>
        )}
        {complete && (
          <div className="banner-done"><Icon name="check" size={18} /> Listo por hoy. Si tienes más tiempo, sigue abajo.</div>
        )}
      </section>

      {pending.length > 0 && (
        <section className="card">
          <div className="eyebrow">Pendientes</div>
          <p className="sub">Cosas que dejaste para después. Hazlas cuando quieras.</p>
          <div className="activities">{pending.map((step) => row(step, false, false))}</div>
        </section>
      )}

      {plan.ahead.length > 0 && (
        <section className="card flat">
          <div className="eyebrow">Si tienes más tiempo</div>
          <ul className="ahead">
            {plan.ahead.map((s) => (
              <li key={s.key}>{s.activity.name} <span>· {s.activity.minutes} min · U{s.unit.n}</span></li>
            ))}
          </ul>
          <button type="button" className="btn block"
            onClick={() => setExtra((e) => e + plan.ahead.reduce((n, s) => n + s.activity.minutes, 0))}>
            Sumar a hoy ({plan.ahead.reduce((n, s) => n + s.activity.minutes, 0)} min)
          </button>
        </section>
      )}
    </>
  );
}
