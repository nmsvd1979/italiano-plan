import { useState } from "react";
import { EmptyState } from "../../ui/EmptyState";
import { useApp } from "../../app/state";
import { goBack } from "../../app/route";
import { getLesson } from "../../content/grammar";
import { getUnit } from "../../content/curriculum";
import type { CoursePart } from "../../content/course";
import { forPart } from "../../domain/parts";
import { Icon } from "../../ui/Icon";
import { Rich } from "../../ui/Rich";
import { AudioButton } from "../../ui/AudioButton";
import { VoiceNotice } from "../../ui/VoiceNotice";
import { ExerciseRunner, RunnerItem } from "./ExerciseRunner";
import { RuleSection } from "./RuleSection";

export function LessonScreen({ unit, part }: { unit: string; part?: CoursePart | null }) {
  const { completeActivity } = useApp();
  const lesson = getLesson(unit);
  const meta = getUnit(unit);
  const [noticeDone, setNoticeDone] = useState(false);

  if (!lesson) return <EmptyState message="No existe la lección de esa unidad." />;

  const noticeItems: RunnerItem[] = forPart(unit, part, "notice", lesson.notice).map(({ item, index }) => ({ id: `n${unit}-${index}`, exercise: item }));
  const examples = forPart(unit, part, "examples", lesson.examples).map(({ item }) => item);

  const finish = () => {
    completeActivity("lesson", unit);
    window.location.hash = "#/";
  };

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">Unidad {meta?.n} · Lección</div>
          <h1 className="title">{lesson.title}</h1>
        </div>
      </header>

      <VoiceNotice />

      <section className="card stack">
        <div className="eyebrow">Situación</div>
        <p>{lesson.situation}</p>
      </section>

      <section className="card stack">
        <div className="eyebrow">La regla</div>
        <RuleSection rule={lesson.rule} unit={unit} />
      </section>

      <section className="callout">
        <div className="callout-title"><Icon name="info" size={18} /> Ojo, en español…</div>
        <p><Rich text={lesson.transfer} /></p>
      </section>

      <section className="card stack">
        <div className="eyebrow">Ejemplos</div>
        <div className="examples">
          {examples.map((ex) => (
            <div key={ex.it} className="example">
              <div>
                <div className="example-it">{ex.it}</div>
                <div className="example-es">{ex.es}</div>
              </div>
              <AudioButton text={ex.it} />
            </div>
          ))}
        </div>
        <p className="note"><Icon name="info" size={16} /><span>Audio con la voz italiana del sistema, solo para escuchar el ritmo de la frase.</span></p>
      </section>

      {noticeItems.length > 0 && <section className="card stack">
        <div className="eyebrow">Primero fíjate</div>
        <p className="sub">Antes de producir, nota cómo la forma cambia el significado.</p>
        {noticeDone ? (
          <p className="banner-done"><Icon name="check" size={18} /> Listo: ya puedes pasar a practicar.</p>
        ) : (
          <ExerciseRunner items={noticeItems} finishLabel="Seguir" onFinish={() => setNoticeDone(true)} />
        )}
      </section>}

      <button className="btn primary block" type="button" disabled={!noticeDone && noticeItems.length > 0} onClick={finish}>
        Terminé la lección
      </button>
    </>
  );
}
