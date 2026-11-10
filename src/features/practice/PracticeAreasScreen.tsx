import { useApp } from "../../app/state";
import { href, routeQuery } from "../../app/route";
import { AREA_NAME, WEAK_AREA, type Area } from "../../domain/evaluation";
import { learnedUnits } from "../../domain/practice";
import { PRACTICE_AREAS, areaTarget } from "../../domain/practiceAreas";
import { getLevelTests } from "../../domain/storage";
import { Icon } from "../../ui/Icon";

/** Áreas floja en el último intento de la prueba de nivel (sin la producción autoevaluada). */
function weakFromLastTest(): Area[] {
  const last = [...getLevelTests(window.localStorage)].reverse().find((t) => t.total > 0);
  if (!last) return [];
  return PRACTICE_AREAS.filter((a) => a !== "produccion" && (last.byArea[a]?.total ?? 0) > 0 && last.byArea[a].correct / last.byArea[a].total < WEAK_AREA);
}

/** «Practicar por habilidad»: un atajo por área a la práctica extra, sin tocar el avance del plan. */
export function PracticeAreasScreen() {
  const { today, progress } = useApp();
  const learned = learnedUnits(progress);
  const focus = routeQuery().get("area");
  const weak = weakFromLastTest();

  return (
    <>
      <header className="screen-head">
        <div>
          <div className="eyebrow">Práctica extra</div>
          <h1 className="title">Practicar por habilidad</h1>
        </div>
      </header>
      <section className="card stack">
        <p className="sub">
          Práctica extra con unidades que ya viste. No suma al avance del plan. {learned.length === 0 ? "Todavía no hay unidades vistas: empieza por la lección de la primera semana." : ""}
        </p>
        <div className="tool-grid">
          <a className="tool" href={href("/tarjetas")}><Icon name="cards" size={18} /><span>Repaso espaciado</span></a>
          <a className="tool" href={href("/practicar")}><Icon name="repeat" size={18} /><span>Practicar más</span></a>
        </div>
      </section>
      <section className="card">
        <div className="eyebrow">Por habilidad</div>
        <div className="unit-list">
          {PRACTICE_AREAS.map((area) => {
            const target = areaTarget(area, learned, today);
            const emphasized = focus === area || weak.includes(area);
            const body = (
              <>
                <span className="unit-main">
                  <b>{AREA_NAME[area]}</b>
                  <small>{target ? `${target.detail}.` : "Todavía no hay nada que practicar aquí."}</small>
                </span>
                {weak.includes(area) && <span className="net-tag weak-tag">Floja</span>}
                {target && <Icon name="chevronRight" size={18} />}
              </>
            );
            return target
              ? <a key={area} className={`unit-row area-row${emphasized ? " emphasized" : ""}`} href={href(target.to)}>{body}</a>
              : <div key={area} className="unit-row soon">{body}</div>;
          })}
        </div>
      </section>
    </>
  );
}
