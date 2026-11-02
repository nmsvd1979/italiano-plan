import { useEffect, useState } from "react";
import { useApp } from "../../app/state";
import { goBack } from "../../app/route";
import { READY_UNITS, getPhase, getUnit } from "../../content/curriculum";
import { findExercise } from "../../content/grammar";
import { audioFiles, getPronUnit } from "../../content/pronunciation";
import { loadPruebas } from "../../content/pruebas";
import { toISODate } from "../../domain/dates";
import { appendLog } from "../../domain/activityLog";
import { AREAS, phaseBattery, scoreAreas, totalOf, weakAreas, WEAK_AREA, AREA_NAME, type AreaScores, type Battery } from "../../domain/evaluation";
import { SOUND_TOPIC, levelOf } from "../../domain/phaseTest";
import { buildTrials } from "../../domain/pronunciation";
import { loadSrs } from "../../domain/srs";
import { addPhaseTest, getPhaseTests, getReview, saveReview } from "../../domain/storage";
import { recordResult } from "../../domain/review";
import { Icon } from "../../ui/Icon";
import { ResultView } from "../evaluacion/ResultView";
import { TestRunner, type TestResult } from "../evaluacion/TestRunner";
import { SoundTrials } from "../pronunciation/SoundTrials";

const SOUND_TRIALS = 6;

/** Prueba de fase (docs/v2/06 F3): las cinco áreas con ítems de las unidades de la fase, más la parte de oído (cuenta en escucha). */
export function PhaseTestScreen({ phase }: { phase: number }) {
  const { today, completeActivity } = useApp();
  const info = getPhase(phase);
  const phaseUnits = READY_UNITS.filter((u) => u.phase === phase);
  const [battery, setBattery] = useState<Battery | null>(null);
  const [stage, setStage] = useState<"test" | "sound" | "result">("test");
  const [results, setResults] = useState<TestResult[]>([]);
  const [scores, setScores] = useState<AreaScores | null>(null);

  const [trials] = useState(() => {
    const seen = new Set<string>();
    const pairs = phaseUnits.flatMap((u) => getPronUnit(u.id)?.pairs ?? []).filter((p) => !seen.has(p.join()) && seen.add(p.join()));
    return buildTrials(pairs, audioFiles, SOUND_TRIALS, `${toISODate(today)}:test-sound:${phase}`);
  });

  useEffect(() => {
    let off = false;
    void loadPruebas().then((p) => { if (!off) setBattery(phaseBattery(phaseUnits.map((u) => u.id), p, loadSrs(window.localStorage), `${toISODate(today)}:test:${phase}`)); });
    return () => { off = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const finishAll = (rs: TestResult[], sounds: boolean[]) => {
    const all = [...rs.map((r) => ({ area: r.item.area, points: r.points })), ...sounds.map((c) => ({ area: "escucha" as const, points: c ? 1 : 0 }))];
    const s = scoreAreas(all);
    const t = totalOf(s);
    const byTopic: Record<string, { correct: number; total: number }> = {};
    const add = (topic: string, ok: number) => { const x = (byTopic[topic] ??= { correct: 0, total: 0 }); x.total++; x.correct += ok; };
    for (const r of rs) add(r.item.area === "gramatica" ? r.item.unit : r.item.area, r.points);
    for (const c of sounds) add(SOUND_TOPIC, c ? 1 : 0);
    addPhaseTest(phase, { date: toISODate(today), correct: t.correct, total: t.total, byTopic, byArea: s as Record<string, { correct: number; total: number }> });
    for (const a of AREAS) if (s[a]) appendLog(window.localStorage, { date: toISODate(today), unit: phaseUnits[0]?.id ?? "u01", activity: `fase${phase}:${a}`, minutes: 0, correct: s[a]!.correct, total: s[a]!.total });
    completeActivity("test", getUnit(`u${String(phase * 4).padStart(2, "0")}`)?.id);
    setScores(s);
    setStage("result");
  };

  const onAnswer = ({ item, points }: TestResult) => {
    if (item.area === "gramatica" && findExercise(item.id)) saveReview(recordResult(getReview(), item.id, points === 1, today));
  };

  const afterTest = (rs: TestResult[]) => {
    setResults(rs);
    if (trials.length > 0) setStage("sound");
    else finishAll(rs, []);
  };

  const previous = Object.entries(getPhaseTests())
    .filter(([p]) => Number(p) < phase)
    .map(([p, list]) => ({ phase: Number(p), last: list[list.length - 1] }))
    .filter((x) => x.last);
  const t = scores ? totalOf(scores) : null;
  const level = t ? levelOf(t.correct, t.total) : null;
  const weak = scores ? weakAreas(scores) : [];

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">Checkpoint · {info.title}</div>
          <h1 className="title">Test de fase</h1>
        </div>
      </header>

      {stage === "test" && (
        <section className="card stack">
          {!battery ? <p className="sub">Cargando…</p> : battery.items.length === 0 ? <p className="sub">Esta fase todavía no tiene ítems de prueba.</p> : (
            <>
              <p className="sub">Lectura, escucha, gramática, vocabulario y producción de las unidades de la fase. Sin pistas: responde con lo que ya sabes.</p>
              {battery.missing.length > 0 && <p className="note" role="status">Faltan ítems de {battery.missing.map((a) => AREA_NAME[a].toLowerCase()).join(", ")}{battery.grammarOnly.length ? ` en ${battery.grammarOnly.join(", ")}` : ""}: esas partes no se evalúan todavía.</p>}
              <TestRunner items={battery.items} onAnswer={onAnswer} onFinish={afterTest} />
            </>
          )}
        </section>
      )}

      {stage === "sound" && (
        <section className="card stack">
          <p className="sub">Parte de oído: elige la palabra que escuchas.</p>
          <SoundTrials trials={trials} doneLabel="Ver resultado" onDone={(r) => finishAll(results, r)} />
        </section>
      )}

      {stage === "result" && scores && battery && level && (
        <>
          <section className="card stack">
            <div className="eyebrow">Resultado</div>
            <span className="pill accent" style={{ alignSelf: "flex-start" }}>{level.label}</span>
            <p className="sub">{level.text}</p>
            <ResultView scores={scores} battery={battery} />
            {weak.length > 0 && <p className="sub">Con menos del {Math.round(WEAK_AREA * 100)} %: {weak.map((a) => AREA_NAME[a]).join(", ")}. En Hoy verás un refuerzo de esas áreas durante la fase siguiente.</p>}
          </section>
          {previous.length > 0 && <p className="sub">{previous.map((x) => `Test de la fase ${x.phase}: ${Math.round(x.last.correct * 10) / 10} de ${x.last.total}`).join(" · ")}</p>}
          <a className="btn primary block" href="#/" style={{ textAlign: "center", textDecoration: "none" }}>Volver a Hoy</a>
        </>
      )}
    </>
  );
}
