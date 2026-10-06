import { useApp } from "../../app/state";
import { goBack } from "../../app/route";
import { PHASES, UNITS, getPhase } from "../../content/curriculum";
import { currentUnit, unitProgress } from "../../domain/curriculum";
import { addDays, diffInDays, monthShort, toISODate } from "../../domain/dates";
import { computeStreak, heatLevel, minutesOn } from "../../domain/progress";
import { getPhaseTests } from "../../domain/storage";
import { Icon } from "../../ui/Icon";
import { Tracker } from "../today/Tracker";

function Bar({ label, done, planned }: { label: string; done: number; planned: number }) {
  return (
    <div className="bar-block">
      <div className="bar-label"><span>{label}</span><b>{done} de {planned}</b></div>
      <div className="bar"><i style={{ width: `${planned ? (done / planned) * 100 : 0}%` }} /></div>
    </div>
  );
}

function Heatmap() {
  const { today, completions, steps } = useApp();
  const minutesByKey = new Map(steps.map((x) => [x.key, x.activity.minutes]));
  const first = addDays(today, -89);
  const start = addDays(first, -first.getDay()); // alineado a domingo: columnas = semanas
  const total = Math.ceil((diffInDays(today, start) + 1) / 7) * 7;
  const todayISO = toISODate(today);

  const months: string[] = [];
  let last = -1;
  for (let c = 0; c < total / 7; c++) {
    const d = addDays(start, c * 7);
    months.push(d.getMonth() !== last ? monthShort(d) : "");
    last = d.getMonth();
  }

  const cells = Array.from({ length: total }, (_, i) => {
    const d = addDays(start, i);
    const future = d > today;
    const minutes = minutesOn(completions, d, minutesByKey);
    const level = future ? 0 : heatLevel(minutes);
    const iso = toISODate(d);
    return (
      <i
        key={iso}
        data-l={level}
        className={`${future ? "future" : ""} ${iso === todayISO ? "today" : ""}`.trim()}
        title={`${iso}: ${minutes} min`}
      />
    );
  });

  return (
    <>
      <div className="heat-scroll">
        <div className="heat-months">{months.map((m, i) => <span key={i}>{m}</span>)}</div>
        <div className="heat">{cells}</div>
      </div>
      <div className="heat-legend">
        menos <i data-l="0" /><i data-l="1" /><i data-l="2" /><i data-l="3" /> más
      </div>
    </>
  );
}

export function Progress() {
  const { startDate, today, steps, progress, completions } = useApp();
  if (!startDate) return null;

  const streak = computeStreak(completions, today);
  const unit = currentUnit(steps, progress);
  const phase = getPhase(unit?.phase ?? PHASES.length);
  const mineUnit = unit ? unitProgress(unit, steps, progress) : { done: 0, total: 0 };
  const phaseSteps = steps.filter((s) => s.unit.phase === phase.id);
  const phaseDone = phaseSteps.filter((s) => progress.done.has(s.key) || s.unit.n < progress.startUnit).length;
  const allDone = steps.filter((s) => progress.done.has(s.key) || s.unit.n < progress.startUnit).length;
  const tests = Object.entries(getPhaseTests()).map(([p, list]) => ({ phase: Number(p), last: list[list.length - 1] })).filter((t) => t.last);
  const readyCount = UNITS.filter((u) => u.ready).length;

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <h1 className="title">Progreso</h1>
      </header>

      <section className="card stack">
        <div className="row">
          <span className="pill streak"><Icon name="flame" size={16} /> {streak} {streak === 1 ? "día seguido" : "días seguidos"}</span>
          {unit && <span className="pill accent">Unidad {unit.n} de {UNITS.length}</span>}
        </div>
        {unit && <Bar label={`Unidad ${unit.n}`} done={mineUnit.done} planned={mineUnit.total} />}
        <Bar label={`Fase ${phase.id} · ${phase.title}`} done={phaseDone} planned={phaseSteps.length} />
        <Bar label={`Todo lo disponible (${readyCount} de ${UNITS.length} unidades)`} done={allDone} planned={steps.length} />
        <Tracker />
      </section>

      {tests.length > 0 && (
        <section className="card stack">
          <div className="eyebrow">Tests de fase</div>
          {tests.map((t) => (
            <div key={t.phase} className="bar-block">
              <div className="bar-label"><span>Fase {t.phase} · {getPhase(t.phase).title}</span><b>{t.last.correct} de {t.last.total}</b></div>
              <div className="bar"><i style={{ width: `${t.last.total ? (t.last.correct / t.last.total) * 100 : 0}%` }} /></div>
            </div>
          ))}
        </section>
      )}

      <section className="card stack">
        <div className="eyebrow">Últimos 90 días</div>
        <Heatmap />
      </section>
    </>
  );
}
