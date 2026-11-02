import { useState } from "react";
import { useApp } from "../../app/state";
import { goBack } from "../../app/route";
import { getUnit } from "../../content/curriculum";
import { getDictation } from "../../content/dictation";
import type { CoursePart } from "../../content/course";
import { forPart } from "../../domain/parts";
import { recordFailure } from "../../domain/srs";
import { sentenceItemId } from "../../domain/srsDeck";
import type { Grade } from "../../domain/grading";
import {
  LEVEL_HELP, LEVEL_LABEL, NORMAL_RATE, SLOW_RATE, assemble, diffDictation, holeIndexes, levelOfPhase, partialCount, tokenize,
  type DictationDiff,
} from "../../domain/dictationDiff";
import { Icon } from "../../ui/Icon";
import { speak } from "../../ui/speech";
import { VoiceNotice } from "../../ui/VoiceNotice";

const ACCENTS = ["à", "è", "é", "ì", "ò", "ù"];

export function DictationScreen({ unit, part }: { unit: string; part?: CoursePart | null }) {
  const { completeActivity } = useApp();
  const all = getDictation(unit);
  const items = all && forPart(unit, part, "dictation", all).map(({ item }) => item);
  const meta = getUnit(unit);
  // El nivel sube con el curso: con huecos (u01–u08), parcial (u09–u16), completo (u17 en adelante).
  const level = levelOfPhase(meta?.phase ?? 5);
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [fields, setFields] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const [diff, setDiff] = useState<DictationDiff | null>(null);
  const [plays, setPlays] = useState(0);
  const [results, setResults] = useState<{ grade: Grade; plays: number }[]>([]);
  const [finished, setFinished] = useState(false);

  if (!items) return <p className="sub">Esta unidad todavía no tiene dictado.</p>;

  const item = items[index];
  const last = index === items.length - 1;
  const correct = results.filter((r) => r.grade !== "wrong").length;
  const grade = diff?.grade ?? null;
  const tokens = tokenize(item.it);
  const holes = holeIndexes(item.it);
  const shownCount = partialCount(item.it);
  const written = level === "huecos" ? fields : text;
  const canCheck = level === "huecos" ? holes.some((_, k) => (fields[k] ?? "").trim() !== "") : text.trim() !== "";

  const play = (rate: number) => {
    setPlays((n) => n + 1);
    void speak(item.it, rate);
  };

  const check = () => {
    if (grade || !canCheck) return;
    const d = diffDictation(assemble(level, item.it, written), item.it);
    setDiff(d);
    if (d.grade !== "correct") recordFailure(window.localStorage, { kind: "listen", itemId: sentenceItemId(unit, item.it), unit });
    setResults((r) => [...r, { grade: d.grade, plays }]);
  };

  const type = (c: string) => {
    if (level === "huecos") setFields((f) => Object.assign([...holes.map((_, k) => f[k] ?? "")], { [active]: (f[active] ?? "") + c }));
    else setText((t) => t + c);
  };

  const next = () => {
    if (!last) {
      setIndex(index + 1);
      setText("");
      setFields([]);
      setActive(0);
      setDiff(null);
      setPlays(0);
      return;
    }
    completeActivity("dictation", unit);
    setFinished(true);
  };

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">Unidad {meta?.n} · Dictado · {LEVEL_LABEL[level]}</div>
          <h1 className="title">Escribe lo que oyes</h1>
        </div>
      </header>

      <VoiceNotice needed="Sin voz italiana el dictado no sirve." />

      <section className="card stack">
        {finished ? (
          <>
            <div className="score">{correct} de {items.length}</div>
            <p className="sub">Escuchaste cada frase {(results.reduce((n, r) => n + r.plays, 0) / items.length).toFixed(1).replace(".", ",")} veces en promedio.</p>
            <p className="sub">Las frases que fallaste, léelas en voz alta una vez y vuelve a intentarlo otro día.</p>
            <a className="btn primary block" href="#/" style={{ textAlign: "center", textDecoration: "none" }}>Volver a Hoy</a>
          </>
        ) : (
          <div className="runner">
            <div className="runner-progress" aria-label={`Frase ${index + 1} de ${items.length}`}>
              <div className="bar"><i style={{ width: `${((index + (grade ? 1 : 0)) / items.length) * 100}%` }} /></div>
              <span>{index + 1} de {items.length}</span>
            </div>
            <p className="runner-prompt">{LEVEL_HELP[level]}</p>
            <div className="row">
              <button type="button" className="listen-btn" onClick={() => play(NORMAL_RATE)}>
                <Icon name="sound" size={26} /> Escuchar
              </button>
              <button type="button" className="chip" onClick={() => play(SLOW_RATE)}>Más lento</button>
            </div>
            <p className="sub" aria-live="polite">{plays === 0 ? "Aún no la has escuchado." : `La escuchaste ${plays} ${plays === 1 ? "vez" : "veces"}.`}</p>

            {level === "huecos" && (
              <p className="dict-sentence">
                {tokens.map((t, i) => {
                  const k = holes.indexOf(i);
                  return k < 0 ? (
                    <span key={i}>{t.text} </span>
                  ) : (
                    <input
                      key={i} className="input dict-hole" value={fields[k] ?? ""} disabled={!!grade}
                      size={Math.max(4, t.norm.length + 1)}
                      autoCapitalize="off" autoCorrect="off" spellCheck={false} autoComplete="off"
                      aria-label={`Palabra que falta ${k + 1}`}
                      onFocus={() => setActive(k)}
                      onChange={(e) => setFields((f) => Object.assign([...holes.map((_, q) => f[q] ?? "")], { [k]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && (grade ? next() : check())}
                    />
                  );
                })}
              </p>
            )}
            {level === "parcial" && <p className="dict-sentence">{tokens.slice(0, shownCount).map((t) => t.text).join(" ")} …</p>}
            {level !== "huecos" && (
              <input
                className="input" value={text} disabled={!!grade}
                autoCapitalize="off" autoCorrect="off" spellCheck={false} autoComplete="off"
                placeholder={level === "parcial" ? "Escribe el resto de la frase" : "Escribe la frase"}
                aria-label="Frase dictada"
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (grade ? next() : check())}
              />
            )}
            <div className="accents" aria-label="Letras con tilde">
              {ACCENTS.map((c) => (
                <button key={c} type="button" disabled={!!grade} onClick={() => type(c)}>{c}</button>
              ))}
            </div>

            {diff && grade && (
              <div className={`feedback ${grade}`} role="status">
                <div className="feedback-head">
                  <Icon name={grade === "wrong" ? "x" : "check"} size={18} />
                  {grade === "correct" && "¡Correcto!"}
                  {grade === "almost" && "Casi: revisa la tilde o el apóstrofo"}
                  {grade === "wrong" && "No era esa"}
                </div>
                <p className="dict-diff" aria-label="Frase correcta">
                  {diff.expected.map((t, i) => <span key={i} className={`dict-${t.mark}`}>{t.text} </span>)}
                </p>
                {grade !== "correct" && (
                  <p className="dict-diff dict-typed" aria-label="Lo que escribiste">
                    {diff.typed.map((t, i) => <span key={i} className={`dict-${t.mark}`}>{t.text} </span>)}
                  </p>
                )}
                {grade !== "correct" && <p className="dict-legend">Rojo: te faltó · gris: sobró · ámbar: tilde o apóstrofo.</p>}
                <p>{item.es}</p>
                <p className="dict-legend">La escuchaste {plays} {plays === 1 ? "vez" : "veces"}.</p>
              </div>
            )}

            {grade ? (
              <button className="btn primary block" type="button" onClick={next}>{last ? "Terminar" : "Siguiente"}</button>
            ) : (
              <button className="btn primary block" type="button" onClick={check} disabled={!canCheck}>Comprobar</button>
            )}
          </div>
        )}
      </section>
    </>
  );
}
