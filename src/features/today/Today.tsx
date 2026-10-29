import { useMemo, useState } from "react";
import { COURSE, CORE_WEEKS, type CoursePart } from "../../content/course";
import { getPhase, getUnit } from "../../content/curriculum";
import { useApp } from "../../app/state";
import { href } from "../../app/route";
import {
  Slot, blockDone, blockKey, dayComplete, isSoon, recommendedLeft, todaySlots, unitCycleProgress, visibleBlocks, weekComplete,
} from "../../domain/cycle";
import { diffInDays, parseISODate, toISODate } from "../../domain/dates";
import { computeStreak, daysSinceLastStudy } from "../../domain/progress";
import { backupAdvice } from "../../domain/backup";
import { canOfferSeed } from "../../domain/seed";
import { nextCatchup, startingPoint } from "../../domain/continuity";
import { candidatesOf, dueCandidates, learnedUnits } from "../../domain/practice";
import { getPhaseTests, getReview } from "../../domain/storage";
import { Icon } from "../../ui/Icon";
import { BlockRow } from "./BlockRow";
import { OfflineBanner } from "./OfflineBanner";
import { Tracker } from "./Tracker";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const partLabel = (p?: CoursePart) => (p ? ` · semana ${p}` : "");

export function Today() {
  const { startDate, today, course, current, completions, doneToday, settings } = useApp();
  const [extra, setExtra] = useState(0);
  if (!startDate) return null;

  const streak = computeStreak(completions, today);
  const { shown, finished } = todaySlots(course, doneToday, extra);
  const first = shown[0];
  const unit = current ?? (first ? getUnit(first.step.unit) : undefined);
  const weekNo = first?.step.week;
  const up = unit ? unitCycleProgress(unit.id, course) : null;
  const phase = getPhase(first?.step.phase ?? unit?.phase ?? 6);
  const allDone = shown.length > 0 && shown.every((s) => dayComplete(s.step, s.day, course));
  const left = recommendedLeft(shown, course, settings.shortMode);

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
          <a className="pill pill-btn" href={href("/plan")} aria-label="Plan completo">
            <Icon name="map" size={18} />
          </a>
          <a className="pill pill-btn" href={href("/ajustes")} aria-label="Ajustes">
            <Icon name="sliders" size={18} />
          </a>
        </div>
      </header>

      <OfflineBanner />
      <BackupReminder />
      <SeedOffer />
      <ContinuityNotices />

      {unit && first && !finished && (
        <a href={href(`/unidad/${unit.id}`)} className="unit-head">
          <span className="eyebrow">
            {first.step.kind === "bridge" ? "Puente a B1 (opcional)" : `Semana ${weekNo} de ${CORE_WEEKS}`} · Fase {phase.id}
          </span>
          <b>{getUnit(first.step.unit)?.title}{partLabel(first.step.part)}</b>
        </a>
      )}

      <ShortModeCard />
      <PhaseControl />

      {finished ? (
        <section className="card stack">
          <Icon name="trophy" size={28} />
          <h1 className="title">Terminaste lo disponible</h1>
          <p className="sub">
            Completaste todas las semanas con contenido. Las demás figuran como "pronto" en el Plan: cuando se agreguen, aparecen aquí.
            Mientras, el repaso espaciado y el repaso mixto siguen disponibles.
          </p>
          <a className="btn block" href={href("/tarjetas")} style={{ textAlign: "center", textDecoration: "none" }}>Repaso espaciado</a>
        </section>
      ) : (
        <>
          <LegacyReview />
          {shown.map((slot) => (
            <DayCard key={`${slot.step.id}.${slot.day.day}`} slot={slot} />
          ))}
          {allDone && (
            <section className="card stack">
              <div className="banner-done">
                <Icon name="check" size={18} />{" "}
                {left > 0
                  ? `Lo esencial de hoy está listo. ${left === 1 ? "Queda 1 bloque recomendado" : `Quedan ${left} bloques recomendados`}.`
                  : "Listo por hoy. Si tienes más tiempo, puedes seguir."}
              </div>
              <button type="button" className="btn block" onClick={() => setExtra((e) => e + 1)}>Hacer más hoy</button>
            </section>
          )}
          {unit && up && (
            <section className="card">
              <div className="eyebrow">Tu avance</div>
              <p className="sub" style={{ marginTop: 6 }}>
                {up.done} de {up.total} bloques de la unidad {unit.n}. Al terminarla podrás:
              </p>
              <ul className="candos">
                {unit.canDo.map((t) => <li key={t}>{t}</li>)}
              </ul>
              <Tracker />
              <p className="note" style={{ marginTop: 12 }}>
                <Icon name="info" size={16} />
                <span>No hay calendario: si un día no estudias, mañana sigue lo mismo. {settings.shortMode ? "Hoy ves solo lo esencial." : ""}</span>
              </p>
            </section>
          )}
        </>
      )}
    </>
  );
}

/** Aviso cuando pasan más de 14 días sin copia de seguridad. */
function BackupReminder() {
  const advice = backupAdvice(window.localStorage);
  if (!advice.due) return null;
  return (
    <a className="card flat review-card" href={href("/ajustes")}>
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
        <a className="card flat review-card" href={href("/punto-de-partida")}>
          <div>
            <div className="eyebrow">Plan anterior</div>
            <p className="sub">Estás usando el plan anterior: solo cuentan tus marcas. Toca para volver a Tu punto de partida.</p>
          </div>
          <Icon name="info" size={22} />
        </a>
      )}
      {!continuity.usePrevious && !continuity.decision && point.hasMarks && (
        <a className="card flat review-card" href={href("/punto-de-partida")}>
          <div>
            <div className="eyebrow">Tu punto de partida</div>
            <p className="sub">Ya tienes avance. Mira qué unidades cuentan como dominadas, parciales o por empezar. No cambia tus marcas.</p>
          </div>
          <Icon name="map" size={22} />
        </a>
      )}
      {catchup?.to && (
        <a className="card flat review-card" href={href(catchup.to)}>
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
function ShortModeCard() {
  const { settings, patchSettings, today } = useApp();
  const iso = toISODate(today);
  const weekend = today.getDay() === 0 || today.getDay() === 6;
  const longShort = settings.shortMode && !!settings.shortSince && diffInDays(today, parseISODate(settings.shortSince)) >= 3;
  return (
    <section className="card flat stack">
      <label className="row" style={{ alignItems: "center", gap: 10 }}>
        <input
          type="checkbox" checked={settings.shortMode} style={{ width: 24, height: 24 }}
          onChange={(e) => patchSettings({ shortMode: e.target.checked, shortSince: e.target.checked ? iso : undefined })}
        />
        <span><b>Hoy tengo poco tiempo</b> · solo lo esencial (unos 15 min)</span>
      </label>
      {longShort && weekend && (
        <p className="note">
          <Icon name="info" size={16} />
          <span>Llevas varios días en modo corto. Si hoy tienes más tiempo, puedes volver al modo normal.</span>
        </p>
      )}
    </section>
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
    <a className="card flat review-card" href={href(`/test/${due}`)}>
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
    <a className="card flat review-card" href={href("/repaso-pendiente")}>
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

/** Un día del ciclo: sus bloques según el modo (corto o normal). */
function DayCard({ slot }: { slot: Slot }) {
  const { course, settings } = useApp();
  const unit = getUnit(slot.step.unit);
  if (!unit) return null;
  const blocks = visibleBlocks(slot.day, unit, settings.shortMode);
  const live = blocks.filter((b) => !isSoon(b, unit));
  const minutes = live.reduce((n, b) => n + b.minutes, 0);
  const doneCount = live.filter((b) => blockDone(slot.step, slot.day.day, b, course)).length;
  const complete = dayComplete(slot.step, slot.day, course);
  const title = slot.day.day <= 7 ? `Día ${slot.day.day} de 7 · ${slot.day.name}` : slot.day.name;
  return (
    <section className="card">
      <div className="hero-row">
        <div>
          <div className="eyebrow">{unit.title}{partLabel(slot.step.part)}{course.continuity?.compressed.has(slot.step.id) ? " · hueco por cerrar" : ""}</div>
          <h2 className="title" style={{ marginTop: 4 }}>{title}</h2>
          <p className="sub">
            {minutes} min · {complete ? "esencial hecho" : `${doneCount} de ${live.length} hechos`}
          </p>
        </div>
      </div>
      <div className="activities">
        {blocks.map((b) => (
          <BlockRow
            key={blockKey(slot.step.id, slot.day.day, b.id)}
            step={slot.step} day={slot.day} block={b}
            done={blockDone(slot.step, slot.day.day, b, course)}
            soon={isSoon(b, unit)}
          />
        ))}
      </div>
    </section>
  );
}
