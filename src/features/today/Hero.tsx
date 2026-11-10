import { useState } from "react";
import { CORE_WEEKS } from "../../content/course";
import { getPhase, getUnit } from "../../content/curriculum";
import { getLesson } from "../../content/grammar";
import { blockRoute } from "../../app/blockRoute";
import { href } from "../../app/route";
import { CourseProgress, Slot, blockDone, dayComplete, daysFor } from "../../domain/cycle";
import { estimatedMinutes } from "../../domain/minutes";
import { forPart } from "../../domain/parts";
import { SessionItem, nextItem } from "../../domain/session";
import { Icon } from "../../ui/Icon";
import { AudioButton } from "../../ui/AudioButton";

export const estimated = (i: SessionItem, srsCards: number) => estimatedMinutes(i.block, srsCards);

/** Tarjeta oscura de Hoy: qué toca, cuánto falta y un solo botón que abre la sesión guiada. */
export function Hero({ essential, srsCards, first, short }: { essential: SessionItem[]; srsCards: number; first: Slot; short: boolean }) {
  const unit = getUnit(first.step.unit);
  const phase = getPhase(first.step.phase ?? unit?.phase ?? 6);
  const next = nextItem(essential);
  const current = next?.slot ?? first;
  const doneCount = essential.filter((i) => i.done).length;
  const left = essential.filter((i) => !i.done).reduce((n, i) => n + estimated(i, srsCards), 0);
  const label = current.step.kind === "bridge" ? "Puente a B1 (opcional)" : `Semana ${current.step.week} de ${CORE_WEEKS}`;
  const title = current.day.day <= 7 ? `Día ${current.day.day} · ${current.day.name}` : current.day.name;
  return (
    <section className="card ink hero">
      <div className="eyebrow">{label} · Fase {phase.id}</div>
      <h1 className="title">{title}</h1>
      {unit && <a className="hero-unit it" href={href(`/unidad/${unit.id}`)}>{unit.title}</a>}
      <div className="seg" aria-hidden="true">
        {essential.map((i) => <i key={i.key} className={i.done ? "done" : i === next ? "now" : ""} />)}
      </div>
      <p className="sub">
        {next ? `${doneCount} de ${essential.length} bloques esenciales · faltan ${left} min` : "Lo esencial de hoy está listo"}
      </p>
      <ol className="hero-list">
        {essential.map((i) => {
          const route = blockRoute(i.slot.step, i.slot.day, i.block, true);
          return (
            <li key={i.key} className={i.done ? "done" : i === next ? "now" : ""}>
              <span className="hero-mark">{i.done ? <Icon name="check" size={12} /> : null}</span>
              {route && !i.done ? <a href={route.to}>{i.block.name}</a> : <span>{i.block.name}</span>}
              <small>{estimated(i, srsCards)} min</small>
            </li>
          );
        })}
      </ol>
      <a className="btn primary block" href={href("/sesion")}>
        {next ? `${doneCount > 0 ? "Seguir" : "Empezar"} sesión · ${left} min` : "Ver qué sigue"}
      </a>
      {short && <p className="sub hero-short">Modo corto: solo lo esencial.</p>}
    </section>
  );
}

/** Los 7 días del ciclo de la semana: hecho, hoy y pendiente. Al tocar un día se ve qué trae. */
export function WeekStrip({ slot, course }: { slot: Slot; course: CourseProgress }) {
  const days = daysFor(slot.step, course);
  const [open, setOpen] = useState<number | null>(null);
  const unit = getUnit(slot.step.unit);
  const short = (n: string) => ({ "Leer y escuchar": "Leer", Consolidar: "Repaso", Practicar: "Practicar" }[n] ?? n);
  const shown = days.find((d) => d.day === open);
  return (
    <section className="week">
      <div className="eyebrow">Tu semana</div>
      <div className="dot-strip">
        {days.map((d) => {
          const done = dayComplete(slot.step, d, course);
          const now = d.day === slot.day.day;
          const cls = done ? "done" : now ? "now" : d.day === 7 ? "test" : "";
          return (
            <button key={d.day} type="button" aria-pressed={open === d.day} aria-label={`Día ${d.day}: ${d.name}${done ? ", hecho" : ""}`} onClick={() => setOpen(open === d.day ? null : d.day)}>
              <span className={`dot ${cls}`}>{done ? <Icon name="check" size={13} /> : d.day}</span>
              {short(d.name)}
            </button>
          );
        })}
      </div>
      {shown && unit && (
        <ul className="week-day">
          {shown.blocks.map((b) => (
            <li key={b.id} className={blockDone(slot.step, shown.day, b, course) ? "done" : ""}>
              <Icon name={b.icon} size={16} /> {b.name} <small>{b.minutes} min{b.core ? "" : " · recomendado"}</small>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** El primer ejemplo de la lección de la semana, para oír una frase real cada día. Sin lección, no se muestra. */
export function WeekPhrase({ slot }: { slot: Slot }) {
  const lesson = getLesson(slot.step.unit);
  if (!lesson) return null;
  const ex = forPart(slot.step.unit, slot.step.part, "examples", lesson.examples)[0]?.item;
  if (!ex) return null;
  return (
    <section className="card flat phrase">
      <div>
        <div className="eyebrow">Frase de la semana</div>
        <p className="it phrase-it">{ex.it}</p>
        <p className="sub">{ex.es}</p>
      </div>
      <AudioButton text={ex.it} />
    </section>
  );
}
