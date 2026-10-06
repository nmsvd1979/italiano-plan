import { useApp } from "../../app/state";
import { goBack } from "../../app/route";
import { TOTAL_WEEKS } from "../../content/plan";
import { addDays, diffInDays, monthShort, toISODate } from "../../domain/dates";
import { plannedCountForDate, weekDateRange } from "../../domain/planState";
import { aggregateProgress, computeStreak, doneCountForDate, heatLevel } from "../../domain/progress";
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
  const { today, completions } = useApp();
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
    const planned = plannedCountForDate(d);
    const done = doneCountForDate(completions, d);
    const level = future ? 0 : heatLevel(done, planned);
    const iso = toISODate(d);
    return (
      <i
        key={iso}
        data-l={level}
        className={`${future ? "future" : ""} ${iso === todayISO ? "today" : ""}`.trim()}
        title={`${iso}: ${done}/${planned}`}
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
  const { startDate, today, plan, completions } = useApp();
  if (!startDate || !plan) return null;

  const streak = computeStreak(completions, today);
  const week = aggregateProgress(completions, weekDateRange(startDate, plan.weekNumber));
  const phaseDates = plan.phase.weeks.flatMap((w) => weekDateRange(startDate, w));
  const phase = aggregateProgress(completions, phaseDates);

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
          <span className="pill streak"><Icon name="flame" size={16} /> {streak} {streak === 1 ? "día" : "días"} seguidos</span>
          <span className="pill accent">Semana {plan.weekNumber} de {TOTAL_WEEKS}</span>
        </div>
        <Bar label="Esta semana" done={week.done} planned={week.planned} />
        <Bar label={plan.phase.title} done={phase.done} planned={phase.planned} />
        <Tracker startDate={startDate} completions={completions} currentWeek={plan.weekNumber} />
      </section>

      <section className="card stack">
        <div className="eyebrow">Últimos 90 días</div>
        <Heatmap />
      </section>
    </>
  );
}
