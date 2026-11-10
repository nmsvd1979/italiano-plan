import { useMemo, useState } from "react";
import { COURSE } from "../../content/course";
import { getUnit } from "../../content/curriculum";
import { useApp } from "../../app/state";
import { useSrsCards } from "../../app/blockTimer";
import { href, routeQuery } from "../../app/route";
import { dayComplete, recommendedLeft, todaySlots, weekComplete } from "../../domain/cycle";
import { diffInDays, parseISODate, toISODate } from "../../domain/dates";
import { computeStreak, daysSinceLastStudy } from "../../domain/progress";
import { endedShort, estimatedMinutes } from "../../domain/minutes";
import { loadTimings } from "../../domain/timing";
import { backupAdvice } from "../../domain/backup";
import { canOfferSeed } from "../../domain/seed";
import { AREA_NAME, type Area } from "../../domain/evaluation";
import { reinforcementAreas } from "../../domain/panel";
import { loadFixes, rewritesDue } from "../../domain/writingFix";
import { nextCatchup, startingPoint } from "../../domain/continuity";
import { coreFinished, routeAfterCore } from "../../domain/ruta";
import { candidatesOf, dueCandidates, learnedUnits } from "../../domain/practice";
import { getLevelTests, getPhaseTests, getReview } from "../../domain/storage";
import { Icon } from "../../ui/Icon";
import { BlockRow } from "./BlockRow";
import { OfflineBanner } from "./OfflineBanner";
import { Hero, WeekPhrase, WeekStrip } from "./Hero";
import { SessionItem, sessionItems } from "../../domain/session";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function Today() {
  const { startDate, today, course, doneToday, completions, settings, progress } = useApp();
  const srsCards = useSrsCards(progress, today);
  const [extra, setExtra] = useState(() => Number(routeQuery().get("mas")) || 0);
  if (!startDate) return null;

  const streak = computeStreak(completions, today);
  const { shown, finished } = todaySlots(course, doneToday, extra);
  const first = shown[0];
  const allDone = shown.length > 0 && shown.every((s) => dayComplete(s.step, s.day, course));
  const left = recommendedLeft(shown, course, settings.shortMode);
  const { essential, optional } = sessionItems(shown, course, settings.shortMode);
  // Lo esencial de lo que se muestra, para avisar si terminó rápido y destacar «Hacer más hoy».
  const timings = loadTimings(window.localStorage);
  const endedEarly = allDone && endedShort(
    essential.map((i) => ({ key: i.key, estimated: estimatedMinutes(i.block, srsCards), done: i.done, core: true })),
    timings,
  );
  const hour = new Date().getHours();
  const greeting = hour < 6 ? "Buonanotte." : hour < 13 ? "Buongiorno." : hour < 19 ? "Buon pomeriggio." : "Buonasera.";

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          Italiano
        </div>
        <div className="topbar-actions">
          <a className="pill streak" href={href("/progreso")} aria-label={`Racha de ${streak} días. Ver progreso`}>
            <Icon name="flame" size={16} /> {streak}
          </a>
          <a className="pill pill-btn" href={href("/ajustes")} aria-label="Ajustes">
            <Icon name="sliders" size={18} />
          </a>
        </div>
      </header>

      {finished ? (
        <>
          <RutaCard />
          <OfflineBanner />
          <div className="notices">
            <BackupReminder />
            <SeedOffer />
            <ContinuityNotices />
            <RewriteDue />
            <PhaseControl />
          </div>
        </>
      ) : (
        <>
          <p className="display greeting">{greeting}</p>
          {coreFinished(course) && <BridgeNote />}
          <Hero essential={essential} srsCards={srsCards} first={first} short={settings.shortMode} />
          <WeekStrip slot={essential.find((i) => !i.done)?.slot ?? first} course={course} />
          <WeekPhrase slot={first} />
          <ShortModeSwitch />
          {(optional.length > 0 || allDone) && (
            <MoreTime
              optional={optional} srsCards={srsCards} allDone={allDone} left={left} endedEarly={endedEarly}
              onMore={() => setExtra((e) => e + 1)}
            />
          )}
          <OfflineBanner />
          <div className="notices">
            <LegacyReview />
            <PhaseControl />
            <BackupReminder />
            <SeedOffer />
            <ContinuityNotices />
            <RewriteDue />
            <Reinforcement />
          </div>
        </>
      )}
    </>
  );
}

/** «Si te queda tiempo»: los bloques recomendados, plegados, y cuando lo esencial está hecho, qué más practicar. */
function MoreTime({ optional, srsCards, allDone, left, endedEarly, onMore }: {
  optional: SessionItem[]; srsCards: number; allDone: boolean; left: number; endedEarly: boolean; onMore: () => void;
}) {
  return (
    <section className="card flat more-time">
      {allDone && (
        <div className="banner-done">
          <Icon name="check" size={18} />{" "}
          {left > 0
            ? `Lo esencial de hoy está listo. ${left === 1 ? "Queda 1 bloque recomendado" : `Quedan ${left} bloques recomendados`}.`
            : "Listo por hoy. Si tienes más tiempo, puedes seguir."}
        </div>
      )}
      {allDone && endedEarly && <p className="sub">Terminaste lo esencial en menos tiempo del estimado: aún te queda tiempo para sumar más.</p>}
      {optional.length > 0 && (
        <details open={allDone}>
          <summary>Si te queda tiempo <small>{plural(optional.length, "bloque", "bloques")}</small></summary>
          <div className="activities">
            {optional.map((i) => (
              <BlockRow
                key={i.key} step={i.slot.step} day={i.slot.day} block={i.block} done={i.done}
                minutes={estimatedMinutes(i.block, srsCards)} soon={false} session
              />
            ))}
          </div>
        </details>
      )}
      {allDone && (
        <div className="link-list">
          <a href={href("/practicar")}>Practicar más <Icon name="chevronRight" size={18} /></a>
          <a href={href("/practicar-area")}>Practicar por habilidad <Icon name="chevronRight" size={18} /></a>
          <button type="button" className="link-btn" onClick={onMore}>Hacer más hoy <Icon name="chevronRight" size={18} /></button>
          <p className="note">«Practicar más» repasa lo ya visto, sin adelantar semanas. «Hacer más hoy» adelanta el siguiente día del ciclo, que luego se estudia con menos espacio entre días.</p>
        </div>
      )}
    </section>
  );
}

/** Refuerzo de la fase: las áreas por debajo de 70 % en la prueba de la fase anterior ofrecen práctica extra de esa área. */
function Reinforcement() {
  const { current } = useApp();
  if (!current) return null;
  if (current.id === "u24") {
    return (
      <section className="card stack">
        <div className="eyebrow">Fin del núcleo</div>
        <p className="sub">Estás en la última unidad. Cuando termines, la prueba de nivel A2 (25–30 min) mide dónde quedaste.</p>
        <a className="btn" href={href("/prueba-nivel")}>Prueba de nivel A2</a>
      </section>
    );
  }
  const areas = reinforcementAreas(getPhaseTests(), current.phase);
  if (areas.length === 0) return null;
  const u = current.id;
  const to: Record<Area, [string, string]> = {
    lectura: [`/lectura/${u}`, "Leer un texto"],
    escucha: [`/dictado/${u}`, "Hacer un dictado"],
    gramatica: ["/repaso", "Repaso mixto"],
    vocabulario: ["/tarjetas", "Repaso espaciado"],
    produccion: [`/escritura/${u}`, "Escribir"],
  };
  return (
    <section className="card stack">
      <div className="eyebrow">Refuerzo de esta fase</div>
      <p className="sub">En la prueba de la fase anterior te costaron: {areas.map((a) => AREA_NAME[a].toLowerCase()).join(", ")}. Suma un poco de práctica extra cuando tengas tiempo.</p>
      <div className="row">
        {areas.map((a) => <a key={a} className="chip primary" href={href(to[a][0])}>{AREA_NAME[a]}: {to[a][1]}</a>)}
      </div>
    </section>
  );
}

/** A los 3 días de guardar una versión corregida con Claude, se propone reescribir el texto desde la consigna en español. */
function RewriteDue() {
  const { today } = useApp();
  const due = rewritesDue(loadFixes(window.localStorage), today);
  if (due.length === 0) return null;
  const [dueUnit, dueSuffix] = due[0].split("#");
  const unit = getUnit(dueUnit);
  return (
    <section className="card stack">
      <div className="eyebrow">Reescribir desde el español</div>
      <p className="sub">
        Hace unos días corregiste tu texto de la unidad {unit?.n}. ¿Lo escribes otra vez, sin mirar la versión corregida?
        {due.length > 1 ? ` (Hay ${due.length} pendientes.)` : ""}
      </p>
      <a className="btn" href={href(`/escritura/${dueUnit}?${dueSuffix ? `part=${dueSuffix}&` : ""}reescribir=1`)}>Reescribir</a>
    </section>
  );
}

/** Aviso cuando pasan más de 14 días sin copia de seguridad. */
function BackupReminder() {
  const advice = backupAdvice(window.localStorage);
  if (!advice.due) return null;
  return (
    <a className="card flat review-card notice" href={href("/ajustes")}>
      <div>
        <div className="eyebrow">Copia de seguridad</div>
        <p className="sub">
          {advice.never ? `Llevas ${advice.days} días sin hacer una copia.` : `Hace ${advice.days} días que no haces una copia.`}{" "}
          Toca para guardarla.
        </p>
      </div>
      <Icon name="info" size={22} />
    </a>
  );
}

/** Botón opcional: marca lo que ya estudiaste antes de la v2 (u01, sesiones 1–5). Solo si aquí no hay marcas de u01. */
function SeedOffer() {
  const { completions, applyAdvance } = useApp();
  const [added, setAdded] = useState<number | null>(null);
  // Depende de las marcas guardadas: se vuelve a evaluar cuando cambian.
  const offer = useMemo(() => canOfferSeed(window.localStorage), [completions]);
  if (added !== null) {
    return (
      <p className="note" role="status">
        <Icon name="check" size={16} />
        <span>Listo: se marcaron {plural(added, "actividad", "actividades")} de la unidad 1. Puedes desmarcar cualquiera desde la unidad.</span>
      </p>
    );
  }
  if (!offer) return null;
  return (
    <section className="card flat">
      <div className="eyebrow">Tu avance anterior</div>
      <p className="sub">Si ya estudiaste la unidad 1 (sesiones 1 a 5) antes de esta versión, puedes marcarla de una vez. No borra ni cambia nada de lo que ya tengas.</p>
      <button type="button" className="btn block" onClick={() => setAdded(applyAdvance())}>
        Aplicar mi avance anterior (u01, sesiones 1–5)
      </button>
    </section>
  );
}

/**
 * Continuidad (docs/v2/14): invitación a revisar «Tu punto de partida» mientras no lo hayas decidido, aviso del plan anterior
 * y el bloque de puesta al día (hasta 8 min, solo en modo normal). No escribe nada por sí sola.
 */
function ContinuityNotices() {
  const { rawCourse, continuity, settings } = useApp();
  const point = useMemo(() => startingPoint(rawCourse, getPhaseTests(), continuity), [rawCourse, continuity]);
  const catchup = settings.shortMode ? null : nextCatchup(continuity, point.catchup);
  return (
    <>
      {continuity.usePrevious && (
        <a className="card flat review-card notice" href={href("/punto-de-partida")}>
          <div>
            <div className="eyebrow">Plan anterior</div>
            <p className="sub">Estás usando el plan anterior: solo cuentan tus marcas. Toca para volver a Tu punto de partida.</p>
          </div>
          <Icon name="info" size={22} />
        </a>
      )}
      {!continuity.usePrevious && !continuity.decision && point.hasMarks && (
        <a className="card flat review-card notice" href={href("/punto-de-partida")}>
          <div>
            <div className="eyebrow">Tu punto de partida</div>
            <p className="sub">Ya tienes avance. Mira qué unidades cuentan como dominadas, parciales o por empezar. No cambia tus marcas.</p>
          </div>
          <Icon name="map" size={22} />
        </a>
      )}
      {catchup?.to && (
        <a className="card flat review-card notice" href={href(catchup.to)}>
          <div>
            <div className="eyebrow">Puesta al día · {catchup.minutes} min</div>
            <p className="sub">{catchup.name} de la unidad {Number(catchup.unit.slice(1))}: lo nuevo de esta versión. Es opcional.</p>
          </div>
          <Icon name="mic" size={22} />
        </a>
      )}
    </>
  );
}

/** «Hoy tengo poco tiempo»: solo los bloques esenciales. Se recuerda hasta que se cambie. */
function ShortModeSwitch() {
  const { settings, patchSettings, today } = useApp();
  const iso = toISODate(today);
  const weekend = today.getDay() === 0 || today.getDay() === 6;
  const longShort = settings.shortMode && !!settings.shortSince && diffInDays(today, parseISODate(settings.shortSince)) >= 3;
  return (
    <div className="short-mode">
      <label className="switch-row">
        <span><b>Hoy tengo poco tiempo</b><small>Solo lo esencial, unos 15 min</small></span>
        <input
          type="checkbox" role="switch" className="switch" checked={settings.shortMode}
          onChange={(e) => patchSettings({ shortMode: e.target.checked, shortSince: e.target.checked ? iso : undefined })}
        />
      </label>
      {longShort && weekend && (
        <p className="note">
          <Icon name="info" size={16} />
          <span>Llevas varios días en modo corto. Si hoy tienes más tiempo, puedes volver al modo normal.</span>
        </p>
      )}
    </div>
  );
}

/** Control de fase: aparece al terminar todas las semanas de una fase y todavía no lo hiciste. No bloquea nada. */
function PhaseControl() {
  const { course } = useApp();
  const tests = getPhaseTests();
  const due = [1, 2, 3, 4, 5].find((p) => {
    const steps = COURSE.filter((s) => s.phase === p && s.kind === "core" && getUnit(s.unit)?.ready);
    return steps.length > 0 && steps.every((s) => weekComplete(s, course)) && !(tests[p]?.length);
  });
  if (!due) return null;
  return (
    <a className="card flat review-card notice" href={href(`/test/${due}`)}>
      <div>
        <div className="eyebrow">Control F{due}</div>
        <p className="sub">Terminaste la fase {due}. Haz la prueba de fase cuando quieras: no bloquea el plan.</p>
      </div>
      <Icon name="target" size={22} />
    </a>
  );
}

/** Errores de ejercicios de otras prácticas que ya pueden volver (el repaso por cajas sigue funcionando). */
function LegacyReview() {
  const { today, progress, completions } = useApp();
  const since = daysSinceLastStudy(completions, today);
  const due = dueCandidates(candidatesOf(learnedUnits(progress)), getReview(), today).length;
  if (due === 0) return null;
  return (
    <a className="card flat review-card notice" href={href("/repaso-pendiente")}>
      <div>
        <div className="eyebrow">{since !== null && since >= 3 ? `Vuelves después de ${since} días` : "Repaso pendiente"}</div>
        <p className="sub">
          {since !== null && since >= 3
            ? `Empieza con un repaso corto: ${plural(due, "ejercicio vencido", "ejercicios vencidos")}.`
            : `${plural(due, "ejercicio que fallaste está", "ejercicios que fallaste están")} listo${due === 1 ? "" : "s"} para volver.`}
        </p>
      </div>
      <Icon name="repeat" size={22} />
    </a>
  );
}

/** Al terminar todas las semanas: la prueba de nivel A2 decide qué sigue (docs/v2/plan-b1/05). */
function RutaCard() {
  const route = routeAfterCore(getLevelTests(window.localStorage));
  const pct = (r: number) => Math.round(r * 100);
  return (
    <section className="card stack">
      <Icon name="trophy" size={28} />
      <h1 className="title">Terminaste el curso</h1>
      {route.stage === "sin-prueba" && (
        <p className="sub">Completaste todas las semanas. El siguiente paso es la prueba de nivel A2: dura unos 30 minutos y dice si ya puedes pasar a B1 o qué conviene reforzar.</p>
      )}
      {route.stage === "aprobada" && (
        <p className="sub">Tu última prueba de nivel A2 salió en {pct(route.ratio)} %. Sigue con «Práctica B1» (textos y audios más largos) y mira «Listo para B1» para ver qué evidencias te faltan.</p>
      )}
      {route.stage === "repasar" && (
        <p className="sub">
          Tu última prueba de nivel A2 salió en {pct(route.ratio)} %.{" "}
          {route.weak.length > 0 ? `Refuerza ${route.weak.map((a) => AREA_NAME[a].toLowerCase()).join(", ")} con «Practicar más» y vuelve a intentarla otro día.` : "Refuerza con «Practicar más» y vuelve a intentarla otro día."}
        </p>
      )}
      {route.stage === "aprobada" ? (
        <>
          <a className="btn primary block" href={href("/practica-b1")}>Práctica B1</a>
          <a className="btn block" href={href("/listo-b1")}>¿Listo para B1?</a>
          <a className="btn block" href={href("/prueba-nivel")}>Repetir la prueba de nivel A2</a>
        </>
      ) : (
        <>
          <a className={`btn${route.stage === "sin-prueba" ? " primary" : ""} block`} href={href("/prueba-nivel")}>
            {route.stage === "sin-prueba" ? "Prueba de nivel A2" : "Repetir la prueba de nivel A2"}
          </a>
          <a className={`btn${route.stage === "repasar" ? " primary" : ""} block`} href={href("/practicar")}>Practicar más</a>
          <a className="btn block" href={href(route.stage === "repasar" && route.weak.length > 0 ? `/practicar-area?area=${route.weak[0]}` : "/practicar-area")}>Practicar por habilidad</a>
        </>
      )}
      <a className="btn block" href={href("/tarjetas")}>Repaso espaciado</a>
    </section>
  );
}

/** Núcleo terminado pero quedan semanas del puente: avisa que son opcionales y ofrece la prueba. */
function BridgeNote() {
  return (
    <section className="card stack">
      <p className="sub">
        <b>Terminaste el núcleo A2.</b> Las semanas que siguen son el puente a B1 y son opcionales. Cuando quieras, haz la prueba de nivel A2 o mira «¿Listo para B1?».
      </p>
      <a className="btn block" href={href("/prueba-nivel")}>Prueba de nivel A2</a>
      <a className="btn block" href={href("/listo-b1")}>¿Listo para B1?</a>
    </section>
  );
}
