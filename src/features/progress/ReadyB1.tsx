import { useEffect, useState } from "react";
import { useApp } from "../../app/state";
import { goBack, href } from "../../app/route";
import { loadPracticaB1 } from "../../content/lazy";
import { appLexicon } from "../../content/lexicon";
import { getWriting } from "../../content/writing";
import { loadLog } from "../../domain/activityLog";
import { loadB1 } from "../../domain/practicaB1";
import { BRIDGE_UNITS, readyB1, type LightState } from "../../domain/readyB1";
import { loadSrs } from "../../domain/srs";
import { getLevelTests, getMiniTests, getWritingTexts } from "../../domain/storage";
import { checkWriting } from "../../domain/writingCheck";
import { Icon } from "../../ui/Icon";

const LABEL: Record<LightState, string> = { verde: "Listo", ambar: "En camino", sin: "Sin datos" };
const NEXT_LINK: Record<string, string> = { a2: "/prueba-nivel", largas: "/practica-b1" };

/** ¿El texto ampliado de la unidad cumple las palabras mínimas y usa todas las formas meta? */
function writingDone(unit: string): boolean {
  const task = getWriting(unit, null);
  const ext = task?.extend;
  const text = getWritingTexts(window.localStorage)[unit];
  if (!task || !ext || !text) return false;
  const c = checkWriting(text, { ...task, minWords: ext.minWords, mustInclude: ext.mustInclude }, appLexicon());
  return c.complete && c.missingForms.length === 0;
}

/** «Listo para B1» (docs/v2/plan-b1/10): seis evidencias, ninguna es una nota ni el criterio de un examen. */
export function ReadyB1Screen() {
  const { today } = useApp();
  const [ids, setIds] = useState<{ lectura: string[]; escucha: string[] } | null>(null);
  useEffect(() => {
    let off = false;
    void loadPracticaB1().then((m) => { if (!off) setIds({ lectura: Object.keys(m.B1_LECTURAS), escucha: Object.keys(m.B1_ESCUCHAS) }); });
    return () => { off = true; };
  }, []);

  const store = window.localStorage;
  const { lights, ready } = readyB1({
    levelTests: getLevelTests(store), mini: getMiniTests(store), srs: loadSrs(store), log: loadLog(store), b1: loadB1(store),
    b1Ids: ids ?? { lectura: [], escucha: [] }, writingDone: BRIDGE_UNITS.filter(writingDone), today,
  });

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">Después del puente</div>
          <h1 className="title">Listo para B1</h1>
        </div>
      </header>
      <section className="card stack">
        <span className="pill accent self-start">{ready ? "Las seis evidencias están completas" : "Todavía faltan evidencias"}</span>
        <p className="sub">
          Son seis evidencias de lo que ya guarda la app. No es una nota ni un diagnóstico, y los umbrales son criterios del proyecto, no los de un examen
          (el del CILS B1 no se pudo consultar). Una luz «sin datos» nunca cuenta como lista. No mide corrección de lo escrito ni de lo hablado,
          ni la pronunciación: eso solo lo puede juzgar una persona.
        </p>
      </section>
      {lights.map((l) => (
        <section key={l.id} className="card stack">
          <div className="row between">
            <b>{l.name}</b>
            <span className={`status ${l.state === "verde" ? "status-done" : l.state === "ambar" ? "status-amber" : ""}`}>{LABEL[l.state]}</span>
          </div>
          <p className="sub">{l.detail}</p>
          {l.next && (
            <p className="sub">
              {l.next}{NEXT_LINK[l.id] && <> <a className="chip inline" href={href(NEXT_LINK[l.id])}>Ir <Icon name="chevronRight" size={14} /></a></>}
            </p>
          )}
        </section>
      ))}
    </>
  );
}
