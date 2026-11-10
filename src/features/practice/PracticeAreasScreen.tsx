import { useApp } from "../../app/state";
import { useSrsCards } from "../../app/blockTimer";
import { srsMinutes } from "../../domain/minutes";
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

const AREA_ICON: Record<Area, "book" | "list" | "ear" | "pen" | "target"> = {
  gramatica: "book", vocabulario: "list", escucha: "ear", lectura: "book", produccion: "pen",
};

/** «Practicar»: lo que toca repasar y un atajo por habilidad a la práctica extra, sin tocar el avance del plan. */
export function PracticeAreasScreen() {
  const { today, progress } = useApp();
  const srsCards = useSrsCards(progress, today);
  const learned = learnedUnits(progress);
  const focus = routeQuery().get("area");
  const weak = weakFromLastTest();

  return (
    <>
      <header className="screen-head">
        <div>
          <div className="eyebrow">Práctica extra</div>
          <h1 className="title">Practicar</h1>
        </div>
      </header>
      <p className="sub">
        Con unidades que ya viste. No suma al avance del plan. {learned.length === 0 ? "Todavía no hay unidades vistas: empieza por la lección de la primera semana." : ""}
      </p>

      <a className="card ink due-card" href={href("/tarjetas")}>
        <span>
          <span className="eyebrow">{srsCards > 0 ? "Toca repasar" : "Repaso espaciado"}</span>
          <b className="due-title">{srsCards > 0 ? `${srsCards} ${srsCards === 1 ? "tarjeta" : "tarjetas"}` : "Nada por repasar ahora"}</b>
          <span className="sub">{srsCards > 0 ? `unos ${srsMinutes(srsCards)} min` : "Las tarjetas nuevas salen de las palabras de cada unidad."}</span>
        </span>
        <span className="dot done due-go"><Icon name="play" size={16} /></span>
      </a>

      <div className="area-grid">
        {PRACTICE_AREAS.map((area) => {
          const target = areaTarget(area, learned, today);
          const isWeak = weak.includes(area) && !!target;
          const body = (
            <>
              <Icon name={AREA_ICON[area]} size={20} />
              <b>{AREA_NAME[area]}</b>
              <small>{isWeak ? "para reforzar" : target ? target.detail : "Todavía no hay nada que practicar aquí."}</small>
            </>
          );
          const cls = `area-tile${isWeak ? " weak" : ""}${focus === area ? " focus" : ""}${area === "produccion" ? " wide" : ""}`;
          return target
            ? <a key={area} className={cls} href={href(target.to)}>{body}</a>
            : <div key={area} className={`${cls} off`}>{body}</div>;
        })}
      </div>

      <a className="card flat review-card" href={href("/practicar")}>
        <span><b>Mezcla sin pistas</b><small className="sub"> Un poco de todo, 10 ejercicios de lo ya visto</small></span>
        <Icon name="chevronRight" size={18} />
      </a>
    </>
  );
}
