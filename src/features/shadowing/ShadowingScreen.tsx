import { useEffect, useRef, useState } from "react";
import { useApp } from "../../app/state";
import { goBack } from "../../app/route";
import { getUnit } from "../../content/curriculum";
import { SHADOWING, STEPS } from "../../content/shadowing";
import { getShadowing, saveShadowing } from "../../domain/storage";
import { isValidSegment, parseYouTubeId } from "../../domain/youtube";
import { Icon } from "../../ui/Icon";
import { YTPlayer, loadYouTube } from "./youtubeApi";

const RATES = [0.5, 0.75, 1];
const fmt = (t: number | null) => (t === null ? "—" : `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`);

function nearest(rate: number, available: number[]): number {
  return available.reduce((best, r) => (Math.abs(r - rate) < Math.abs(best - rate) ? r : best), available[0] ?? 1);
}

export function ShadowingScreen({ unit }: { unit: string }) {
  const { completeActivity } = useApp();
  const videos = SHADOWING[unit] ?? SHADOWING.u01;
  const meta = getUnit(unit);

  const [videoId, setVideoId] = useState(videos.main.id);
  const [pasted, setPasted] = useState("");
  const [pasteError, setPasteError] = useState(false);
  const [step, setStep] = useState(0);
  const [available, setAvailable] = useState<number[]>([1]);
  const [rate, setRate] = useState(1);
  const [cover, setCover] = useState<boolean>(STEPS[0].cover);
  const [a, setA] = useState<number | null>(null);
  const [b, setB] = useState<number | null>(null);
  const [loop, setLoop] = useState(false);
  const [gap, setGap] = useState(true);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const host = useRef<HTMLDivElement>(null);
  const player = useRef<YTPlayer | null>(null);
  const live = useRef({ a, b, loop, gap });
  live.current = { a, b, loop, gap };

  // Crea el reproductor una sola vez.
  useEffect(() => {
    let cancelled = false;
    loadYouTube()
      .then((YT) => {
        if (cancelled || !host.current) return;
        const el = document.createElement("div");
        host.current.appendChild(el);
        const p: YTPlayer = new YT.Player(el, {
          videoId,
          playerVars: { playsinline: 1, rel: 0, modestbranding: 1, cc_load_policy: 1, cc_lang_pref: "it", hl: "es" },
          events: {
            onReady: () => {
              player.current = p;
              setAvailable(p.getAvailablePlaybackRates());
              setReady(true);
            },
          },
        });
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      player.current?.destroy();
      player.current = null;
    };
  }, []);

  // Cambio de video: se carga y se restaura el fragmento guardado.
  useEffect(() => {
    if (!ready) return;
    player.current?.loadVideoById(videoId);
    const saved = getShadowing()[videoId];
    setA(saved?.a ?? null);
    setB(saved?.b ?? null);
    setLoop(false);
  }, [videoId, ready]);

  // Guarda el fragmento marcado.
  useEffect(() => {
    if (!ready) return;
    const all = getShadowing();
    if (isValidSegment(a, b)) all[videoId] = { a, b: b as number };
    else delete all[videoId];
    saveShadowing(all);
  }, [a, b, videoId, ready]);

  // Bucle del fragmento: al llegar al final, pausa un rato para repetir en voz alta y vuelve al inicio.
  useEffect(() => {
    let waiting = false;
    const id = window.setInterval(() => {
      const p = player.current;
      const s = live.current;
      if (!p || waiting || !s.loop || !isValidSegment(s.a, s.b)) return;
      if (p.getPlayerState() !== 1 || p.getCurrentTime() < (s.b as number)) return;
      const start = s.a as number;
      if (!s.gap) {
        p.seekTo(start, true);
        return;
      }
      waiting = true;
      p.pauseVideo();
      window.setTimeout(() => {
        p.seekTo(start, true);
        p.playVideo();
        waiting = false;
      }, ((s.b as number) - start) * 1000);
    }, 120);
    return () => window.clearInterval(id);
  }, []);

  // Cada paso del protocolo fija la velocidad y si los subtítulos van tapados.
  useEffect(() => {
    const s = STEPS[step];
    const r = nearest(s.rate, available);
    setRate(r);
    setCover(s.cover);
    if (ready) player.current?.setPlaybackRate(r);
  }, [step, ready, available]);

  const now = () => Math.round((player.current?.getCurrentTime() ?? 0) * 10) / 10;
  const markA = () => {
    const t = now();
    setA(t);
    if (b !== null && b - t < 1) setB(null);
  };
  const markB = () => {
    const t = now();
    if (a !== null && t - a >= 1) setB(t);
  };
  const changeRate = (r: number) => {
    setRate(r);
    player.current?.setPlaybackRate(r);
  };
  const chooseVideo = (id: string) => {
    setPasteError(false);
    setVideoId(id);
  };
  const usePasted = () => {
    const id = parseYouTubeId(pasted);
    if (id) {
      chooseVideo(id);
      setPasted("");
    } else setPasteError(true);
  };
  const finish = () => {
    completeActivity("shadow", unit);
    window.location.hash = "#/";
  };

  const current = STEPS[step];
  const segmentOk = isValidSegment(a, b);

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <div>
          <div className="eyebrow">Unidad {meta?.n} · Shadowing</div>
          <h1 className="title">Imita lo que oyes</h1>
        </div>
      </header>

      <section className="card stack">
        <div className="video-wrap">
          <div ref={host} className="video" />
          {cover && <div className="sub-cover" aria-hidden="true">Subtítulos tapados</div>}
        </div>
        {failed && (
          <p className="note"><Icon name="info" size={16} /><span>No se pudo cargar YouTube. Revisa tu conexión y vuelve a abrir esta pantalla.</span></p>
        )}
        <div className="row">
          <button type="button" className={`chip${videoId === videos.main.id ? " primary" : ""}`} onClick={() => chooseVideo(videos.main.id)}>
            {videos.main.title}
          </button>
          <button type="button" className={`chip${videoId === videos.alt.id ? " primary" : ""}`} onClick={() => chooseVideo(videos.alt.id)}>
            {videos.alt.title}
          </button>
        </div>
        <div className="field">
          <label htmlFor="yt">Otro video de YouTube</label>
          <div className="row" style={{ flexWrap: "nowrap" }}>
            <input id="yt" className="input" placeholder="Pega un link" value={pasted} onChange={(e) => setPasted(e.target.value)} />
            <button type="button" className="btn" onClick={usePasted}>Usar</button>
          </div>
          {pasteError && <p className="sub">Ese link no parece de un video de YouTube.</p>}
        </div>
      </section>

      <section className="card stack">
        <div className="eyebrow">Paso {step + 1} de {STEPS.length}</div>
        <h2 className="title" style={{ fontSize: 18 }}>{current.title}</h2>
        <p className="sub">{current.text}</p>
        <div className="steps" role="group" aria-label="Pasos">
          {STEPS.map((s, i) => (
            <button key={s.title} type="button" className={i === step ? "on" : i < step ? "past" : ""} onClick={() => setStep(i)} aria-label={`Paso ${i + 1}: ${s.title}`}>
              {i + 1}
            </button>
          ))}
        </div>
        <div className="row">
          <button type="button" className="btn" disabled={step === 0} onClick={() => setStep(step - 1)}>Anterior</button>
          <button type="button" className="btn primary" disabled={step === STEPS.length - 1} onClick={() => setStep(step + 1)}>Siguiente paso</button>
        </div>
      </section>

      <section className="card stack">
        <div className="eyebrow">Controles</div>
        <div className="row">
          {RATES.filter((r) => available.includes(r)).map((r) => (
            <button key={r} type="button" className={`chip${rate === r ? " primary" : ""}`} onClick={() => changeRate(r)}>{r}×</button>
          ))}
          <button type="button" className="chip" onClick={() => player.current?.seekTo(Math.max(0, now() - 3), true)}>
            <Icon name="rewind" size={16} /> −3 s
          </button>
          <button type="button" className="chip" onClick={() => setCover(!cover)}>
            <Icon name="captions" size={16} /> {cover ? "Mostrar subtítulos" : "Tapar subtítulos"}
          </button>
        </div>
        <div className="row">
          <button type="button" className="chip" onClick={markA}>Inicio · {fmt(a)}</button>
          <button type="button" className="chip" onClick={markB} disabled={a === null}>Fin · {fmt(b)}</button>
          <button type="button" className={`chip${loop ? " primary" : ""}`} disabled={!segmentOk} onClick={() => setLoop(!loop)}>
            <Icon name="repeat" size={16} /> Repetir fragmento
          </button>
        </div>
        <label className="note">
          <input type="checkbox" checked={gap} onChange={(e) => setGap(e.target.checked)} />
          <span>Al terminar el fragmento, pausar el mismo tiempo para repetir en voz alta.</span>
        </label>
        <p className="note"><Icon name="info" size={16} /><span>Elige un fragmento de 30 a 60 segundos: pulsa «Inicio» donde empieza y «Fin» donde termina.</span></p>
      </section>

      <button className="btn primary block" type="button" onClick={finish}>Terminé</button>
    </>
  );
}
