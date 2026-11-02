import { useEffect, useState } from "react";
import { useApp } from "../../app/state";
import { goBack } from "../../app/route";
import { READY_UNITS } from "../../content/curriculum";
import { loadPruebas } from "../../content/pruebas";
import { toISODate } from "../../domain/dates";
import { appendLog } from "../../domain/activityLog";
import { AREAS, AREA_NAME, PASS_LEVEL, levelBattery, scoreAreas, totalOf, weakAreas, type AreaScores, type Battery } from "../../domain/evaluation";
import { loadSrs } from "../../domain/srs";
import { addLevelTest, getLevelTests } from "../../domain/storage";
import { Icon } from "../../ui/Icon";
import { ResultView } from "../evaluacion/ResultView";
import { TestRunner, type TestResult } from "../evaluacion/TestRunner";

/** Prueba de nivel A2 (docs/v2/06 F4): al final del núcleo (u24). Misma estructura que las pruebas de fase, 25–30 min. */
export function LevelTestScreen() {
  const { today } = useApp();
  const [battery, setBattery] = useState<Battery | null>(null);
  const [scores, setScores] = useState<AreaScores | null>(null);
  const attempts = getLevelTests().length;

  useEffect(() => {
    let off = false;
    void loadPruebas().then((p) => {
      if (off) return;
      const units = READY_UNITS.filter((u) => u.n <= 24).map((u) => u.id);
      setBattery(levelBattery(units, p, loadSrs(window.localStorage), `level:${attempts}`));
    });
    return () => { off = true; };
  }, [attempts]);

  const finish = (rs: TestResult[]) => {
    const s = scoreAreas(rs.map((r) => ({ area: r.item.area, points: r.points })));
    const t = totalOf(s);
    addLevelTest({ date: toISODate(today), correct: t.correct, total: t.total, byArea: s as Record<string, { correct: number; total: number }> });
    for (const a of AREAS) if (s[a]) appendLog(window.localStorage, { date: toISODate(today), unit: "u24", activity: `nivel:${a}`, minutes: 0, correct: s[a]!.correct, total: s[a]!.total });
    setScores(s);
  };

  const t = scores ? totalOf(scores) : null;
  const passed = t ? t.total > 0 && t.correct / t.total >= PASS_LEVEL : false;
  const weak = scores ? weakAreas(scores) : [];

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">Fin del núcleo</div>
          <h1 className="title">Prueba de nivel A2</h1>
        </div>
      </header>
      <section className="card stack">
        {!battery ? <p className="sub">Cargando…</p> : scores && t ? (
          <>
            <span className="pill accent" style={{ alignSelf: "flex-start" }}>{passed ? "Nivel A2 alcanzado" : "Todavía no"}</span>
            <p className="sub">
              {passed ? `Llegaste al ${Math.round(PASS_LEVEL * 100)} % que se pide.` : `Para el nivel hace falta ${Math.round(PASS_LEVEL * 100)} %. Refuerza ${weak.length ? weak.map((a) => AREA_NAME[a].toLowerCase()).join(", ") : "lo que fallaste"} y vuelve a intentarlo cuando quieras.`}
              {" "}Los umbrales son provisionales y se ajustan con tus datos reales.
            </p>
            <ResultView scores={scores} battery={battery} />
            <a className="btn primary block" href="#/" style={{ textAlign: "center", textDecoration: "none" }}>Volver a Hoy</a>
          </>
        ) : (
          <>
            <p className="sub">{battery.items.length} ítems, unos 25–30 minutos, sin pistas. No cambia tu progreso.</p>
            {battery.missing.length > 0 && <p className="note" role="status">Faltan ítems de {battery.missing.map((a) => AREA_NAME[a].toLowerCase()).join(", ")}: esas áreas no se evalúan todavía.</p>}
            <TestRunner items={battery.items} onFinish={finish} />
          </>
        )}
      </section>
    </>
  );
}
