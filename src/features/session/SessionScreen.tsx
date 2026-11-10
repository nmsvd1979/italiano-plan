import { useApp } from "../../app/state";
import { useSrsCards } from "../../app/blockTimer";
import { blockRoute } from "../../app/blockRoute";
import { href, routeQuery } from "../../app/route";
import { todaySlots } from "../../domain/cycle";
import { estimatedMinutes } from "../../domain/minutes";
import { nextItem, sessionItems } from "../../domain/session";
import { Icon } from "../../ui/Icon";
import { BlockRow } from "../today/BlockRow";
import { estimated } from "../today/Hero";

/** Sesión guiada: lleva de un bloque esencial al siguiente, con una pausa corta entre ellos, y cierra el día. */
export function SessionScreen() {
  const { course, doneToday, settings, progress, today } = useApp();
  const srsCards = useSrsCards(progress, today);
  const extra = Number(routeQuery().get("mas")) || 0;
  const { shown } = todaySlots(course, doneToday, extra);
  const { essential, optional } = sessionItems(shown, course, settings.shortMode);
  const next = nextItem(essential);
  const doneCount = essential.filter((i) => i.done).length;
  const pending = optional.filter((i) => !i.done);

  const head = (
    <header className="session-head">
      <a className="session-exit" href={href("/")}><Icon name="x" size={18} /> Salir</a>
      <span className="eyebrow">Sesión de hoy</span>
    </header>
  );

  if (!next) {
    return (
      <>
        {head}
        <section className="card ink session-done">
          <span className="session-check"><Icon name="check" size={28} /></span>
          <h1 className="title">Listo por hoy</h1>
          <p className="sub">
            {essential.length > 0 ? `Terminaste ${essential.length === 1 ? "el bloque esencial" : `los ${essential.length} bloques esenciales`}.` : "No hay bloques esenciales pendientes."}{" "}
            {pending.length > 0 ? `Quedan ${pending.length} recomendados si tienes tiempo.` : "Si tienes más tiempo, puedes seguir."}
          </p>
          <a className="btn primary block" href={href("/")}>Volver a Hoy</a>
        </section>
        {pending.length > 0 && (
          <section className="card flat">
            <div className="eyebrow">Si te queda tiempo</div>
            <div className="activities">
              {pending.map((i) => (
                <BlockRow
                  key={i.key} step={i.slot.step} day={i.slot.day} block={i.block} done={i.done}
                  minutes={estimatedMinutes(i.block, srsCards)} soon={false} session
                />
              ))}
            </div>
          </section>
        )}
        <section className="card flat link-list">
          <a href={href("/practicar")}>Practicar más <Icon name="chevronRight" size={18} /></a>
          <a href={href("/practicar-area")}>Practicar por habilidad <Icon name="chevronRight" size={18} /></a>
          <a href={href("/sesion?mas=1")}>Hacer más hoy <Icon name="chevronRight" size={18} /></a>
        </section>
        <p className="note">
          <Icon name="info" size={16} />
          <span>«Practicar más» repasa lo ya visto, sin adelantar semanas. «Hacer más hoy» adelanta el siguiente día del ciclo.</span>
        </p>
      </>
    );
  }

  const route = blockRoute(next.slot.step, next.slot.day, next.block, true);
  const index = essential.indexOf(next);
  return (
    <>
      {head}
      <div className="seg" aria-label={`Bloque ${index + 1} de ${essential.length}`}>
        {essential.map((i) => <i key={i.key} className={i.done ? "done" : i === next ? "now" : ""} />)}
      </div>
      {doneCount > 0 && (
        <div className="session-prev">
          <span className="dot done"><Icon name="check" size={14} /></span>
          <div><b>{doneCount === 1 ? "1 bloque hecho" : `${doneCount} bloques hechos`}</b><small>Vas bien: sigue con el siguiente.</small></div>
        </div>
      )}
      <section className="card session-next">
        <div className="eyebrow">Ahora · {index + 1} de {essential.length}</div>
        <div className="session-next-body">
          <span className="activity-icon"><Icon name={next.block.icon} size={22} /></span>
          <div>
            <h1 className="title">{next.block.name}</h1>
            <p className="sub">{estimated(next, srsCards)} min · {next.slot.day.name}</p>
          </div>
        </div>
        {route && <a className="btn primary block" href={route.to}>{doneCount > 0 ? "Seguir" : "Empezar"} · {route.label}</a>}
        <a className="btn ghost block" href={href("/")}>Dejarlo para después</a>
      </section>
    </>
  );
}
