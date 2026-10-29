import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../../app/state";
import { goBack } from "../../app/route";
import { Icon } from "../../ui/Icon";
import { say, speak } from "../../ui/speech";
import { loadGeneralDeck, type GeneralWord } from "../../content/vocab";
import {
  applyReview, generalOn, loadSrs, newSrsCard, rerateLast, saveSrs, unlockProdCards, type RatingValue, type SrsCard, type SrsState,
} from "../../domain/srs";
import {
  choicesFor, contextOf, emptyContext, resolveCard, type DeckContext, type Resolved,
} from "../../domain/srsDeck";
import { easyRating, gradeWriting, ratingForChoice, ratingForWriting, typoRating, type WriteGrade } from "../../domain/srsGrade";
import {
  LIMITS, answeredToday, buildExtraBatch, buildQueue, eligibleUnits, nextDue, nothingToReviewText, seenPartsOf, type QueueItem,
} from "../../domain/srsQueue";

const ACCENTS = ["à", "è", "é", "ì", "ò", "ù"];

interface Entry {
  card: SrsCard;
  resolved: Resolved;
}

const KIND_LABEL: Record<string, string> = {
  recog: "Reconocer", prod: "Escribir la palabra", cloze: "Completar", listen: "Escuchar y escribir",
};

/** Texto que se muestra o se lee como respuesta modelo. */
function answerOf(r: Resolved): string[] {
  if (r.kind === "cloze") return r.answers;
  return [r.it];
}

function fullSentence(r: Extract<Resolved, { kind: "cloze" }>): string {
  return r.prompt.replace("___", r.answers[0]).replace(/\*/g, "");
}

export function ReviewScreen() {
  const { today, progress, completeActivity } = useApp();
  const units = useMemo(() => eligibleUnits(progress), [progress]);
  const seenParts = useMemo(() => seenPartsOf(progress), [progress]);
  const [srs, setSrs] = useState<SrsState>(() => loadSrs(window.localStorage));
  const [ctx, setCtx] = useState<DeckContext>(emptyContext);
  const [general, setGeneral] = useState<GeneralWord[]>([]);
  const [ready, setReady] = useState(false);
  const [batch, setBatch] = useState<Entry[]>([]);
  const [index, setIndex] = useState(0);
  const [info, setInfo] = useState<{ postponed: number; blocked: boolean } | null>(null);
  const [done, setDone] = useState(false);
  const [extraMode, setExtraMode] = useState(false);
  const marked = useRef(false);
  const latest = useRef(srs);
  latest.current = srs;

  const needsDeck = generalOn(srs) || Object.values(srs.cards).some((c) => c.deck === "general");

  // El mazo general se baja solo si está activado o ya hay tarjetas suyas (import dinámico: no pesa en la carga inicial).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const words = needsDeck ? await loadGeneralDeck() : [];
      if (cancelled) return;
      setGeneral(words);
      setCtx(contextOf(words));
      setReady(true);
    })();
    return () => { cancelled = true; };
    // Solo al abrir: el mazo no cambia mientras se repasa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const queueInput = (state: SrsState, words: GeneralWord[]) => ({ state, today, eligibleUnits: units, general: words, seenParts });

  const makeBatch = (state: SrsState, deck: DeckContext, words: GeneralWord[], extra = false) => {
    const q = buildQueue(queueInput(state, words));
    const now = new Date();
    const picked: Entry[] = [];
    const items = extra ? buildExtraBatch(queueInput(state, words)).items : q.items;
    setExtraMode(extra);
    for (const item of items as QueueItem[]) {
      if (picked.length >= LIMITS.session) break;
      const card = item.type === "due" ? item.card : newSrsCard(item.candidate, now);
      const resolved = resolveCard(card, deck);
      if (resolved) picked.push({ card, resolved });
    }
    setBatch(picked);
    setIndex(0);
    setDone(picked.length === 0);
    setInfo(extra ? null : { postponed: q.postponed, blocked: q.newBlocked });
  };

  useEffect(() => {
    if (ready) makeBatch(latest.current, ctx, general);
    // Una sola vez cuando el mazo está listo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Terminar la sesión (o no tener nada que repasar) cumple el bloque «Repaso espaciado» del día, una sola vez.
  useEffect(() => {
    if (ready && done && !marked.current) {
      marked.current = true;
      completeActivity("srs");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, done]);

  const commit = (next: SrsState) => {
    saveSrs(next, window.localStorage);
    setSrs(next);
  };

  const answered = answeredToday(srs, today);
  // «Seguir repasando» solo aparece si hay algo que armar: tarjetas vencidas o palabras nuevas.
  const canContinue = buildQueue(queueInput(srs, general)).items.length > 0;
  // Cuando ya no queda nada del día se ofrece «Practicar más».
  const extra = canContinue ? null : buildExtraBatch(queueInput(srs, general));

  const header = (
    <header className="screen-head">
      <a className="back" href="#/" onClick={(e) => { e.preventDefault(); goBack(); }} aria-label="Volver">
        <Icon name="arrowLeft" size={20} />
      </a>
      <div>
        <div className="eyebrow">Repaso espaciado</div>
        <h1 className="title">Tarjetas de hoy</h1>
      </div>
    </header>
  );

  if (!ready) return <>{header}<p className="sub">Cargando…</p></>;

  const entry = batch[index];

  return (
    <>
      {header}
      {info && info.postponed > 0 && (
        <p className="note">
          <Icon name="info" size={16} />
          <span>Llevas unos días sin repasar. Para no abrumarte, hoy se muestran solo {batch.length > 0 ? "las más atrasadas" : "algunas"} y se pospusieron {info.postponed} tarjetas.</span>
        </p>
      )}
      {info?.blocked && (
        <p className="note">
          <Icon name="info" size={16} />
          <span>Tienes muchas tarjetas vencidas: hoy no se agregan palabras nuevas hasta ponerte al día.</span>
        </p>
      )}

      {done || !entry ? (
        <section className="card stack">
          <Icon name="trophy" size={28} />
          <h2 className="title">{batch.length > 0 ? "Sesión lista" : "Nada por repasar ahora"}</h2>
          <p className="sub">
            {batch.length > 0
              ? `Respondiste ${batch.length} tarjetas. Llevas ${answered} hoy.`
              : units.length === 0 && Object.keys(srs.cards).length === 0
                ? "Las tarjetas nuevas salen de las palabras del bloque «Palabras de la unidad». Haz ese bloque en Hoy y vuelve."
                : nothingToReviewText(nextDue(srs, today))}
          </p>
          {extra && extra.blocked === "cap" && (
            <p className="sub">Llegaste al tope de {LIMITS.extraPerDay} tarjetas extra de hoy. Mañana puedes seguir.</p>
          )}
          {extra && extra.blocked === "empty" && (
            <p className="sub">Ya no quedan palabras nuevas disponibles. Tampoco hay tarjetas que venzan en los próximos {LIMITS.extraAheadDays} días.</p>
          )}
          {answered >= LIMITS.warnAt && (
            <p className="note"><Icon name="info" size={16} /><span>Ya llevas {answered} tarjetas hoy: es un buen momento para parar.</span></p>
          )}
          <div className="row">
            {canContinue && <button className="btn" type="button" onClick={() => makeBatch(srs, ctx, general)}>Seguir repasando</button>}
            {extra && extra.items.length > 0 && (
              <button className="btn" type="button" onClick={() => makeBatch(srs, ctx, general, true)}>Practicar más ({extra.items.length})</button>
            )}
            <a className="btn primary" href="#/" style={{ textAlign: "center", textDecoration: "none" }}>Volver a Hoy</a>
          </div>
        </section>
      ) : (
        <CardView
          key={`${index}:${entry.card.id}`}
          entry={entry}
          position={index + 1}
          total={batch.length}
          ctx={ctx}
          units={units}
          onAnswer={(rating, ms) => {
            const next = unlockProdCards(applyReview(latest.current, entry.card, rating, new Date(), ms, extraMode), new Date());
            commit(next);
          }}
          onRerate={(rating, ms) => commit(rerateLast(latest.current, entry.card, rating, new Date(), ms))}
          onNext={() => (index + 1 >= batch.length ? setDone(true) : setIndex(index + 1))}
          last={index + 1 >= batch.length}
          warn={answered >= LIMITS.warnAt}
        />
      )}
    </>
  );
}

interface CardViewProps {
  entry: Entry;
  position: number;
  total: number;
  ctx: DeckContext;
  units: string[];
  onAnswer: (rating: RatingValue, ms: number) => void;
  onRerate: (rating: RatingValue, ms: number) => void;
  onNext: () => void;
  last: boolean;
  warn: boolean;
}

function CardView({ entry, position, total, ctx, units, onAnswer, onRerate, onNext, last, warn }: CardViewProps) {
  const { card, resolved } = entry;
  const shownAt = useRef(Date.now());
  const [selected, setSelected] = useState<number | null>(null);
  const [hint, setHint] = useState(false);
  const [text, setText] = useState("");
  const [rating, setRating] = useState<RatingValue | null>(null);
  const [adjusted, setAdjusted] = useState(false);
  const [writeGrade, setWriteGrade] = useState<WriteGrade | null>(null);
  const elapsed = useRef(0);

  const choice = useMemo(
    () => (resolved.kind === "recog" ? choicesFor(card, resolved.es, ctx, units) : null),
    [card, resolved, ctx, units],
  );
  // La pista descarta la mitad de las opciones equivocadas.
  const hidden = useMemo(() => {
    if (!choice || !hint) return new Set<number>();
    const wrong = choice.options.map((_, i) => i).filter((i) => i !== choice.answerIndex);
    return new Set(wrong.slice(0, Math.floor(wrong.length / 2)));
  }, [choice, hint]);

  const answerChoice = (i: number) => {
    if (rating || !choice) return;
    setSelected(i);
    const r = ratingForChoice(i === choice.answerIndex, hint);
    elapsed.current = Date.now() - shownAt.current;
    setRating(r);
    onAnswer(r, elapsed.current);
  };

  const check = () => {
    if (rating || !text.trim()) return;
    const g = gradeWriting(text, answerOf(resolved));
    const r = ratingForWriting(g);
    elapsed.current = Date.now() - shownAt.current;
    setWriteGrade(g);
    setRating(r);
    onAnswer(r, elapsed.current);
  };

  const adjust = (r: RatingValue) => {
    setRating(r);
    setAdjusted(true);
    onRerate(r, elapsed.current);
  };

  const isWriting = resolved.kind !== "recog";
  const prompt =
    resolved.kind === "recog" ? resolved.it
      : resolved.kind === "prod" ? resolved.es
        : resolved.kind === "cloze" ? resolved.prompt
          : "Escucha y escribe la frase";

  const play = () => {
    if (resolved.kind === "cloze") speak(fullSentence(resolved));
    else if (resolved.kind === "listen") speak(resolved.it);
    else say(resolved.it);
  };

  const correct = isWriting ? writeGrade !== null && writeGrade !== "wrong" : selected !== null && selected === choice?.answerIndex;
  const feedbackClass = rating === null ? "" : correct ? (writeGrade === "close" ? "almost" : "correct") : "wrong";

  return (
    <div className="runner">
      <div className="runner-progress" aria-label={`Tarjeta ${position} de ${total}`}>
        <div className="bar"><i style={{ width: `${((position - 1 + (rating ? 1 : 0)) / total) * 100}%` }} /></div>
        <span>{position} de {total}</span>
      </div>
      <div className="eyebrow">{KIND_LABEL[card.kind]}{card.deck === "general" ? " · Mazo general" : ""}</div>

      <section className="card stack">
        <div className="hero-row">
          <p className="runner-prompt">
            {resolved.kind === "listen" && rating ? resolved.it : prompt}
          </p>
          {(resolved.kind !== "prod" || rating) && (
            <button type="button" className="audio-btn" style={{ width: 56, height: 56 }} onClick={play} aria-label="Escuchar">
              <Icon name="sound" size={26} />
            </button>
          )}
        </div>
        {resolved.kind === "prod" && <p className="sub">Escríbela en italiano, con artículo y tildes.</p>}
        {resolved.kind === "cloze" && !rating && <p className="sub">Completa lo que falta.</p>}
      </section>

      {choice ? (
        <>
          <div className="options" role="group" aria-label="Significado">
            {choice.options.map((o, i) => {
              if (hidden.has(i)) return null;
              const state = rating && i === choice.answerIndex ? "right" : rating && i === selected ? "wrong" : "";
              return (
                <button key={o} type="button" className={`option ${state}`} style={{ minHeight: 48 }} disabled={!!rating} onClick={() => answerChoice(i)}>
                  {o}
                </button>
              );
            })}
          </div>
          {!rating && !hint && (
            <button type="button" className="btn block" style={{ minHeight: 44 }} onClick={() => setHint(true)}>Pista (quita dos opciones)</button>
          )}
        </>
      ) : (
        <div className="stack">
          <input
            className="input" value={text} disabled={!!rating}
            autoCapitalize="off" autoCorrect="off" spellCheck={false} autoComplete="off"
            aria-label="Respuesta" placeholder={resolved.kind === "listen" ? "Escribe lo que oyes" : "Escribe tu respuesta"}
            onChange={(ev) => setText(ev.target.value)}
            onKeyDown={(ev) => ev.key === "Enter" && (rating ? onNext() : check())}
          />
          <div className="accents" aria-label="Letras con tilde">
            {ACCENTS.map((c) => (
              <button key={c} type="button" disabled={!!rating} onClick={() => setText((t) => t + c)}>{c}</button>
            ))}
          </div>
        </div>
      )}

      {rating && (
        <div className={`feedback ${feedbackClass}`} role="status">
          <div className="feedback-head">
            <Icon name={correct ? "check" : "x"} size={18} />
            {correct ? (writeGrade === "close" ? "Casi: revisa tildes y apóstrofos" : "¡Correcto!") : "No era esa"}
          </div>
          {resolved.kind === "recog" && <p><strong>{resolved.it}</strong> = {resolved.es}</p>}
          {resolved.kind === "recog" && resolved.ex && (
            <p className="row" style={{ alignItems: "center", gap: 8 }}>
              <button type="button" className="audio-btn" onClick={() => speak(resolved.ex!)} aria-label="Escuchar la frase">
                <Icon name="sound" size={18} />
              </button>
              <span><em>{resolved.ex}</em> {resolved.exEs}</span>
            </p>
          )}
          {resolved.kind === "prod" && <p>Respuesta: <strong>{resolved.it}</strong></p>}
          {resolved.kind === "cloze" && <><p>Frase completa: <strong>{fullSentence(resolved)}</strong></p><p>{resolved.why.replace(/\*/g, "")}</p></>}
          {resolved.kind === "listen" && <p>{resolved.es}</p>}
        </div>
      )}

      {rating && !adjusted && (
        <div className="row">
          {isWriting && rating === 1 && <button type="button" className="btn" style={{ minHeight: 44 }} onClick={() => adjust(typoRating(1))}>Me equivoqué al escribir</button>}
          {rating === 3 && <button type="button" className="btn" style={{ minHeight: 44 }} onClick={() => adjust(easyRating(3))}>Fácil</button>}
        </div>
      )}
      {warn && rating && <p className="note"><Icon name="info" size={16} /><span>Ya pasaste de 60 tarjetas hoy. Puedes parar cuando quieras.</span></p>}

      {rating ? (
        <button className="btn primary block" type="button" style={{ minHeight: 48 }} onClick={onNext}>{last ? "Terminar" : "Siguiente"}</button>
      ) : isWriting ? (
        <button className="btn primary block" type="button" style={{ minHeight: 48 }} onClick={check} disabled={!text.trim()}>Comprobar</button>
      ) : null}
    </div>
  );
}
