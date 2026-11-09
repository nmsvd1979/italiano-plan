import { useApp } from "../../app/state";
import { goBack, href, routeQuery } from "../../app/route";
import { AREA_NAME, WEAK_AREA, type Area } from "../../domain/evaluation";
import { learnedUnits } from "../../domain/practice";
import { PRACTICE_AREAS, areaTarget } from "../../domain/practiceAreas";
import { getLevelTests } from "../../domain/storage";
import { Icon } from "../../ui/Icon";

const linkStyle = { textAlign: "center", textDecoration: "none" } as const;

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
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">Práctica extra</div>
          <h1 className="title">Practicar por habilidad</h1>
        </div>
      </header>
      <section className="card stack">
        <p className="sub">
          Elige una habilidad y practica con unidades que ya viste. No suma al avance del plan. {learned.length === 0 ? "Todavía no hay unidades vistas: empieza por la lección de la primera semana." : ""}
        </p>
      </section>
      {PRACTICE_AREAS.map((area) => {
        const target = areaTarget(area, learned, today);
        const emphasized = focus === area || weak.includes(area);
        return (
          <section key={area} className="card stack">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <b>{AREA_NAME[area]}</b>
              {weak.includes(area) && <span className="pill accent">Floja en tu última prueba</span>}
            </div>
            {target ? (
              <>
                <p className="sub">{target.detail}.</p>
                <a className={`btn${emphasized ? " primary" : ""} block`} href={href(target.to)} style={linkStyle}>Practicar {AREA_NAME[area].toLowerCase()}</a>
              </>
            ) : <p className="sub">Todavía no hay nada que practicar aquí.</p>}
          </section>
        );
      })}
    </>
  );
}
