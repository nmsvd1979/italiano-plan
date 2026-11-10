import { goBack, href } from "../app/route";
import { Icon } from "./Icon";

/** Pantalla sin contenido: siempre deja una salida (la PWA del iPhone no tiene botón «atrás»). */
export function EmptyState({ message, title = "Todavía no" }: { message: string; title?: string }) {
  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <h1 className="title">{title}</h1>
      </header>
      <section className="card stack">
        <p className="sub">{message}</p>
        <a className="btn primary block" href={href("/")}>Volver a Hoy</a>
      </section>
    </>
  );
}
