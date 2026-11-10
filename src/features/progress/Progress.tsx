import { useApp } from "../../app/state";
import { PHASES, UNITS, getPhase } from "../../content/curriculum";
import { COURSE } from "../../content/course";
import { blockMinutes, unitCycleProgress, weekProgress } from "../../domain/cycle";
import { addDays, diffInDays, monthShort, toISODate } from "../../domain/dates";
import { computeStreak, heatLevel, minutesOn } from "../../domain/progress";
import { getPhaseTests } from "../../domain/storage";
import { loadTimings, withMeasured } from "../../domain/timing";
import { Icon } from "../../ui/Icon";
import { DayBars } from "../../ui/Bars";
import { NOT_MEASURABLE, Skills, useSrsFigures, Strands } from "./Panel";

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

const DAY = ["do", "lu", "ma", "mi", "ju", "vi", "sá"];

/** Minutos de cada uno de los últimos 7 días (de más antiguo a hoy). */
function useWeekMinutes() {
  const { today, completions, steps } = useApp();
  const byKey = withMeasured(
    new Map([...steps.map((x): [string, number] => [x.key, x.activity.minutes]), ...blockMinutes()]),
    loadTimings(window.localStorage),
  );
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(today, i - 6);
    return { label: DAY[d.getDay()], minutes: Math.round(minutesOn(completions, d, byKey)), today: i === 6 };
  });
}

export function Progress() {
  const { startDate, today, course, current, completions, canDo } = useApp();
  const week = useWeekMinutes();
  const { words, recall } = useSrsFigures();
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
  const weekTotal = week.reduce((n, d) => n + d.minutes, 0);
  const marked = canDo[unit?.id ?? ""] ?? [];
  const achieved = Object.values(canDo).reduce((n, list) => n + list.length, 0);

  return (
    <>
      <header className="screen-head">
        <h1 className="title">Progreso</h1>
      </header>

      <section className="stats">
        <div className="card flat stat"><b>{streak}</b><small>{streak === 1 ? "día seguido" : "días seguidos"}</small></div>
        <div className="card flat stat"><b>{weekTotal}′</b><small>esta semana</small></div>
        <div className="card flat stat"><b>{words}</b><small>palabras activas{recall}</small></div>
      </section>

      <section className="card stack">
        <div className="eyebrow">Minutos · 7 días</div>
        <DayBars days={week} />
      </section>

      <section className="card stack">
        <div className="eyebrow">Avance</div>
        {unit && <Bar label={`Unidad ${unit.n} · bloques`} done={mineUnit.done} planned={mineUnit.total} />}
        <Bar label={`Fase ${phase.id} · ${phase.title}`} done={phaseTotals.done} planned={phaseTotals.total} />
        <Bar label={`Todo lo disponible (${readyCount} de ${UNITS.length} unidades)`} done={allTotals.done} planned={allTotals.total} />
      </section>

      <Skills />

      {unit && (
        <section className="card stack">
          <div className="eyebrow">Ya puedes…</div>
          <ul className="cando-list">
            {unit.canDo.map((t, i) => (
              <li key={t} className={marked.includes(i) ? "yes" : ""}><Icon name={marked.includes(i) ? "check" : "target"} size={16} /> {t}</li>
            ))}
          </ul>
          <p className="sub">{achieved} {achieved === 1 ? "logro marcado" : "logros marcados"} en total. Los marcas desde cada unidad.</p>
        </section>
      )}

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

      <Strands />

      <section className="card flat link-list">
        <a href="#/listo-b1"><span><b>¿Listo para B1?</b><small className="sub"> Las seis evidencias</small></span><Icon name="chevronRight" size={18} /></a>
        <a href="#/prueba-nivel"><span><b>Prueba de nivel A2</b><small className="sub"> 25–30 min</small></span><Icon name="chevronRight" size={18} /></a>
      </section>

      <details className="card flat heat-details">
        <summary>Últimos 90 días</summary>
        <Heatmap />
      </details>

      <p className="note">{NOT_MEASURABLE}</p>
    </>
  );
}
