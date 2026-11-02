import { useApp } from "../../app/state";
import { goBack } from "../../app/route";
import { PHASES, UNITS, getPhase } from "../../content/curriculum";
import { COURSE } from "../../content/course";
import { blockMinutes, unitCycleProgress, weekProgress } from "../../domain/cycle";
import { addDays, diffInDays, monthShort, toISODate } from "../../domain/dates";
import { computeStreak, heatLevel, minutesOn } from "../../domain/progress";
import { getPhaseTests } from "../../domain/storage";
import { loadTimings, withMeasured } from "../../domain/timing";
import { Icon } from "../../ui/Icon";
import { Tracker } from "../today/Tracker";
import { Panel } from "./Panel";

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
  const minutesByKey = withMeasured(
    new Map([...steps.map((x): [string, number] => [x.key, x.activity.minutes]), ...blockMinutes()]),
    loadTimings(window.localStorage),
  );
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
  const { startDate, today, course, current, completions } = useApp();
  if (!startDate) return null;

  const streak = computeStreak(completions, today);
  const unit = current;
  const phase = getPhase(unit?.phase ?? PHASES.length);
  const mineUnit = unit ? unitCycleProgress(unit.id, course) : { done: 0, total: 0 };
  const sum = (steps: typeof COURSE) => steps.reduce((acc, s) => {
    const w = weekProgress(s, course);
    return { done: acc.done + w.done, total: acc.total + w.total };
  }, { done: 0, total: 0 });
  const ready = COURSE.filter((s) => UNITS.find((u) => u.id === s.unit)?.ready);
  const phaseTotals = sum(ready.filter((s) => s.phase === phase.id));
  const allTotals = sum(ready);
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
        {unit && <Bar label={`Unidad ${unit.n} · bloques`} done={mineUnit.done} planned={mineUnit.total} />}
        <Bar label={`Fase ${phase.id} · ${phase.title}`} done={phaseTotals.done} planned={phaseTotals.total} />
        <Bar label={`Todo lo disponible (${readyCount} de ${UNITS.length} unidades)`} done={allTotals.done} planned={allTotals.total} />
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

      <Panel />

      <a className="btn block" href="#/prueba-nivel" style={{ textAlign: "center", textDecoration: "none" }}>Prueba de nivel A2</a>

      <section className="card stack">
        <div className="eyebrow">Últimos 90 días</div>
        <Heatmap />
      </section>
    </>
  );
}
