import { useMemo, useState } from "react";
import { useApp } from "../../app/state";
import { goBack, href } from "../../app/route";
import { CORE_WEEKS } from "../../content/course";
import { UNITS } from "../../content/curriculum";
import {
  Gap, UnitView, backupRecent, diagnosticSessions, setPostponed, setUsePrevious, startDiagnostic, startHere, startingPoint,
} from "../../domain/continuity";
import { planSeed } from "../../domain/continuitySeed";
import { formatDateHuman } from "../../domain/dates";
import { loadSrs } from "../../domain/srs";
import { getPhaseTests, getReview } from "../../domain/storage";
import { Icon } from "../../ui/Icon";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

const VERDICT_LABEL = { dominada: "Dominada", repasar: "Para repasar", rehacer: "Por rehacer" } as const;
const MARK_LABEL = {
  completa: "Marcada completa", parcial: "Parcial", tocada: "Empezada", nueva: "Por empezar", omitida: "Omitida",
} as const;

/** Etiqueta, estilo y detalle de una unidad en la lista. */
function describeUnit(v: UnitView): { label: string; cls: string; detail: string } {
  const { marks } = v;
  const done = marks.total > 0 ? `${marks.done} de ${marks.total} actividades marcadas` : "Sin actividades marcadas";
  if (!v.unit.ready) return { label: "Pronto", cls: "soon", detail: "Aún sin contenido" };
  if (marks.state === "omitida") return { label: MARK_LABEL.omitida, cls: "done", detail: "Anterior a la unidad desde la que empiezas" };
  if (v.verdict) {
    const how = v.source === "diagnostico" ? "según el diagnóstico" : v.source === "saltado" ? "diagnóstico saltado" : "según tus marcas";
    const parts = v.parts ? ` · semana A: ${v.parts.A ? VERDICT_LABEL[v.parts.A].toLowerCase() : "—"}, B: ${v.parts.B ? VERDICT_LABEL[v.parts.B].toLowerCase() : "—"}` : "";
    return { label: VERDICT_LABEL[v.verdict], cls: v.verdict === "dominada" ? "done" : "current", detail: `${done} · ${how}${parts}` };
  }
  const extra = marks.byPhaseTest ? " · prueba de fase aprobada" : "";
  const cls = marks.state === "completa" ? "done" : marks.state === "nueva" ? "next" : "current";
  return { label: MARK_LABEL[marks.state], cls, detail: `${done}${extra}` };
}

function GapRow({ gap, onPostpone }: { gap: Gap; onPostpone: (postponed: boolean) => void }) {
  const unit = UNITS.find((u) => u.id === gap.step.unit);
  const status = gap.done ? "Hecho" : !gap.ready ? "En preparación" : gap.postponed ? "Pospuesto" : "Pendiente";
  return (
    <div className="unit-row">
      <span className="unit-num">{unit?.n}</span>
      <span className="unit-main">
        <b>{unit?.title}</b>
        <small>
          {gap.ready ? `Versión comprimida de ${gap.length} días más la mini-prueba` : "Se agregará cuando tenga contenido"}
        </small>
      </span>
      <span className="status">{status}</span>
      {gap.ready && !gap.done && (
        <button type="button" className="btn" onClick={() => onPostpone(!gap.postponed)}>
          {gap.postponed ? "Traer de vuelta" : "Posponer"}
        </button>
      )}
    </div>
  );
}

/** «Tu punto de partida» (docs/v2/14 §2 y §5): qué unidades cuentan como dominadas, parciales o por empezar, y desde dónde sigue el plan. */
export function StartingPoint() {
  const { today, rawCourse, continuity, updateContinuity, seedReview } = useApp();
  const [seeded, setSeeded] = useState<number | null>(null);
  const tests = useMemo(() => getPhaseTests(), []);
  const point = useMemo(() => startingPoint(rawCourse, tests, continuity), [rawCourse, tests, continuity]);
  const recent = backupRecent(window.localStorage, today);

  const sessions = diagnosticSessions(point.views);
  const diagnosable = point.views.filter((v) => v.diagnosable);
  const decided = point.views.filter((v) => v.verdict !== null);
  const seedPlan = useMemo(
    () => planSeed(point.views, continuity.seeded?.units ?? [], getReview(window.localStorage), loadSrs(window.localStorage).cards, today),
    [point.views, continuity.seeded, today, seeded],
  );

  // Esta pantalla solo lee. Lo que escribe (decisión, siembra) pide confirmar si no hay copia reciente.
  const guarded = (action: () => void) => () => {
    if (!recent && !window.confirm("No tienes una copia de seguridad de los últimos 14 días. Esta acción no cambia tus marcas, pero conviene tener una copia antes (Ajustes → Copia de seguridad). ¿Continuar sin copia?")) return;
    action();
  };

  const nextText = point.next
    ? `${point.next.step.kind === "bridge" ? "Puente a B1" : `Semana ${point.next.step.week} de ${CORE_WEEKS}`}: ${UNITS.find((u) => u.id === point.next!.step.unit)?.title}${point.next.step.part ? ` (semana ${point.next.step.part})` : ""}, día ${point.next.day.day}`
    : "Terminaste todo lo disponible.";

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">{formatDateHuman(today)}</div>
          <h1 className="title">Tu punto de partida</h1>
        </div>
      </header>

      <section className="card stack">
        <div className="eyebrow">Copia de seguridad</div>
        {recent ? (
          <p className="sub">Tienes una copia de los últimos 14 días. Esta pantalla no cambia ni borra ninguna de tus marcas.</p>
        ) : (
          <>
            <p className="sub">
              Antes de decidir nada, guarda una copia: en Ajustes, toca «Copia de seguridad» y luego «Guardar copia».
              Esta pantalla no cambia ni borra tus marcas, pero la copia es tu seguro.
            </p>
            <a className="btn block" href={href("/ajustes")} style={{ textAlign: "center", textDecoration: "none" }}>Ir a Ajustes</a>
          </>
        )}
      </section>

      <section className="card stack">
        <div className="eyebrow">Desde dónde sigue el plan</div>
        <p className="title" style={{ fontSize: 18 }}>{nextText}</p>
        <p className="sub">
          Marcar una actividad dice que la hiciste, no que la recuerdas. Por eso una unidad puede estar «marcada completa»
          y aun así convenir repasarla; el diagnóstico (opcional) lo comprueba.
        </p>
        {continuity.usePrevious && (
          <p className="note"><Icon name="info" size={16} /><span>Estás usando el plan anterior: el plan ignora lo de esta pantalla. Abajo puedes volver.</span></p>
        )}
      </section>

      <section className="card">
        <div className="eyebrow" style={{ marginBottom: 6 }}>Tus {UNITS.length} unidades</div>
        <div className="unit-list">
          {point.views.map((v) => {
            const st = describeUnit(v);
            return (
              <a key={v.unit.id} className={`unit-row ${st.cls}`} href={href(`/unidad/${v.unit.id}`)}>
                <span className="unit-num">{v.unit.n}</span>
                <span className="unit-main"><b>{v.unit.title}</b><small>{st.detail}</small></span>
                <span className={`status status-${st.cls}`}>{st.label}</span>
              </a>
            );
          })}
        </div>
      </section>

      {point.hasMarks && (
        <section className="card stack">
          <div className="eyebrow">Qué hacer con lo que ya estudiaste</div>
          {continuity.decision && !continuity.usePrevious && (
            <p className="note" role="status">
              <Icon name="check" size={16} />
              <span>Elegiste: {continuity.decision === "diagnostico" ? "hacer el diagnóstico" : "empezar donde estás"}. Puedes cambiarlo cuando quieras.</span>
            </p>
          )}
          {diagnosable.length > 0 ? (
            <>
              <p className="sub">
                <b>Diagnóstico (opcional, recomendado):</b> {plural(diagnosable.length, "unidad", "unidades")} con ejercicios sin pista,
                unos 3 minutos por unidad, repartidos en {plural(sessions.length, "sesión", "sesiones")}. Puedes pausar y retomar; «Saltar» deja la unidad para repasar.
              </p>
              <div className="stack">
                {sessions.map((s) => (
                  <a
                    key={s.n} className="btn block" style={{ textAlign: "center", textDecoration: "none" }}
                    href={href(`/punto-de-partida/diagnostico?s=${s.n}`)}
                    onClick={() => updateContinuity((c) => (c.decision ? c : startDiagnostic(c, new Date())))}
                  >
                    Sesión {s.n} · {s.units.map((u) => `u${String(u.unit.n).padStart(2, "0")}`).join(", ")}
                    {s.pending === 0 ? " · lista" : ""}
                  </a>
                ))}
              </div>
            </>
          ) : (
            <p className="sub">Ninguna unidad está completa ni parcial, así que no hay nada que diagnosticar todavía. El plan empieza con lo que sigue.</p>
          )}
          <button type="button" className="btn block" onClick={guarded(() => updateContinuity((c) => startHere(c, new Date())))}>
            Empezar donde estoy
          </button>
          <p className="sub">«Empezar donde estoy» da por dominadas las unidades que marcaste completas. No cambia tus marcas.</p>
        </section>
      )}

      {decided.length > 0 && !continuity.usePrevious && (
        <section className="card stack">
          <div className="eyebrow">Repaso espaciado</div>
          {continuity.seeded && (
            <p className="note" role="status">
              <Icon name="check" size={16} />
              <span>Ya sembraste {plural(continuity.seeded.cards, "tarjeta", "tarjetas")} ({continuity.seeded.units.length} {continuity.seeded.units.length === 1 ? "unidad" : "unidades"}).</span>
            </p>
          )}
          {seedPlan.units.length > 0 ? (
            <>
              <p className="sub">
                Se sembrarían {plural(seedPlan.cards.length, "tarjeta", "tarjetas")} de {plural(seedPlan.units.length, "unidad", "unidades")}, repartidas en 14 días y con un máximo de 25 por día,
                para que no se junten el primer día. Las que no caben se siguen introduciendo poco a poco en «Palabras de la unidad», como siempre.
              </p>
              <button
                type="button" className="btn primary block"
                onClick={guarded(() => setSeeded(seedReview()))}
              >
                Sembrar repaso espaciado
              </button>
            </>
          ) : (
            !continuity.seeded && <p className="sub">Todavía no hay unidades dominadas ni para repasar. Cuando las haya, podrás sembrar su repaso aquí.</p>
          )}
        </section>
      )}

      {point.catchup.length > 0 && !continuity.usePrevious && (
        <section className="card stack">
          <div className="eyebrow">Puesta al día de lo nuevo</div>
          <p className="sub">
            Lo que esta versión trae y la anterior no tenía. Nunca repite la lección ni los ejercicios que ya hiciste.
            En Hoy aparece un bloque de hasta 8 minutos cuando no estás en modo corto.
          </p>
          {point.catchup.map(({ view, items }) => (
            <div key={view.unit.id} className="stack">
              <b>Unidad {view.unit.n} · {view.unit.title}</b>
              {items.map((i) => (
                <div key={i.blockId} className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <span>{i.name} · {i.minutes} min</span>
                  {i.done ? <span className="status status-done">Hecho</span>
                    : i.to ? <a className="btn" href={href(i.to)}>Abrir</a>
                    : <span className="status">En preparación</span>}
                </div>
              ))}
              {view.verdict === "repasar" && (continuity.units[view.unit.id]?.diagnostic?.failed.length ?? 0) > 0 && (
                <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <span>Repaso dirigido: {plural(continuity.units[view.unit.id]!.diagnostic!.failed.length, "ejercicio", "ejercicios")} que fallaste</span>
                  {continuity.units[view.unit.id]?.directedDone
                    ? <span className="status status-done">Hecho</span>
                    : <a className="btn" href={href(`/punto-de-partida/repaso/${view.unit.id}`)}>Abrir</a>}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {point.gaps.length > 0 && (
        <section className="card stack">
          <div className="eyebrow">Huecos por cerrar</div>
          <p className="sub">
            Unidades nuevas de esta versión cuya posición ya pasaste. Se estudian en versión comprimida y al comienzo del siguiente tramo.
            Puedes posponerlas hasta el final del tramo, no saltarlas.
          </p>
          <div className="unit-list">
            {point.gaps.map((g) => (
              <GapRow key={g.step.id} gap={g} onPostpone={(p) => updateContinuity((c) => setPostponed(c, g.step.id, p))} />
            ))}
          </div>
        </section>
      )}

      <section className="card stack">
        <div className="eyebrow">Volver al plan anterior</div>
        <p className="sub">
          {continuity.usePrevious
            ? "Ahora el plan usa solo tus marcas, como antes. Si quieres, vuelve a usar lo de esta pantalla."
            : "El plan vuelve a usar solo tus marcas, como antes de esta pantalla. No borra nada: tus marcas, el diagnóstico y las tarjetas sembradas se quedan guardados."}
        </p>
        <button type="button" className="btn block" onClick={() => updateContinuity((c) => setUsePrevious(c, !c.usePrevious))}>
          {continuity.usePrevious ? "Usar de nuevo mi punto de partida" : "Volver al plan anterior"}
        </button>
      </section>
    </>
  );
}
