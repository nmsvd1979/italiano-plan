import { useState } from "react";
import { useApp } from "../../app/state";
import { copyText, collectDiagnostic, formatDiagnostic } from "../../app/diagnostics";
import { useOfflineStatus } from "../../app/offline";
import { pauseAudioDownload, startAudioDownload, useAudioDownload } from "../../app/offlineAudio";
import { usePersistence } from "../../app/persist";
import { audioPriorityUnits } from "../../app/offlineUnits";
import { Icon } from "../../ui/Icon";

const mb = (n: number) => `${(n / 1e6).toFixed(1).replace(".", ",")} MB`;

export function readyMessage(appReady: boolean, audioDone: boolean): string {
  if (appReady && audioDone) return "Listo para usar sin conexión";
  if (appReady) return "La app ya funciona sin conexión; falta bajar el audio.";
  return "Todavía no está lista sin conexión. Mantén la app abierta con internet unos segundos y ciérrala y ábrela de nuevo.";
}

export function OfflineCard() {
  const { current } = useApp();
  const offline = useOfflineStatus();
  const audio = useAudioDownload();
  const persistent = usePersistence();
  const [diag, setDiag] = useState<{ text: string; copied: boolean } | null>(null);

  const appReady = offline.state === "ready";
  const audioDone = audio.phase === "done";
  const downloading = audio.phase === "downloading";
  const pct = audio.total ? Math.round((audio.done / audio.total) * 100) : 0;

  const copy = async () => {
    const text = formatDiagnostic(await collectDiagnostic(audio, persistent));
    setDiag({ text, copied: await copyText(text) });
  };

  return (
    <section className="card stack">
      <div className="eyebrow">Versión y modo sin conexión</div>
      <p className="sub">
        Versión {__APP_VERSION__} · compilada el {new Date(__BUILD_DATE__).toLocaleString("es", { dateStyle: "medium", timeStyle: "short" })}
      </p>

      <p className={`offline offline-${appReady && audioDone ? "ready" : offline.state}`} role="status">
        {offline.state === "checking" && "Comprobando…"}
        {offline.state === "unsupported" && "Este navegador no permite guardar la app para usarla sin conexión."}
        {(offline.state === "ready" || offline.state === "pending") && readyMessage(appReady, audioDone)}
      </p>

      <ul className="indicators">
        <li className={appReady ? "ok" : ""}>
          <b>App instalada</b> {appReady ? `sí · ${offline.state === "ready" ? offline.files : 0} archivos` : "todavía no"}
        </li>
        <li className={audioDone ? "ok" : ""}>
          <b>Audio descargado</b> {audio.phase === "unsupported" ? "no disponible" : `${audio.done} de ${audio.total} · ${mb(audio.bytesDone)}`}
        </li>
        <li className={persistent === "persistent" ? "ok" : ""}>
          <b>Almacenamiento persistente</b> {persistent === "persistent" ? "sí" : persistent === "checking" ? "comprobando…" : "no"}
        </li>
      </ul>

      {audio.phase !== "unsupported" && (
        <>
          <div className="bar-block">
            <div className="bar-label"><span>Audio: {audio.done} de {audio.total} · {mb(audio.bytesDone)}</span><b>{pct}%</b></div>
            <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${pct}%` }} /></div>
          </div>
          {audio.lowSpace && (
            <p className="note"><Icon name="info" size={16} /><span>Queda poco espacio en este dispositivo para el audio ({mb(audio.bytesTotal - audio.bytesDone)}). Libera espacio antes de bajarlo.</span></p>
          )}
          {audio.message && <p className="note"><Icon name="info" size={16} /><span>{audio.message}</span></p>}
          <div className="row">
            {downloading ? (
              <button type="button" className="btn" onClick={pauseAudioDownload}>Pausar</button>
            ) : (
              !audioDone && (
                <button type="button" className="btn primary" onClick={() => void startAudioDownload(audioPriorityUnits(current))}>
                  {audio.phase === "paused" || audio.done > 0 ? "Reanudar descarga" : "Usar sin conexión"}
                </button>
              )
            )}
            <button type="button" className="btn" onClick={() => void copy()}>Copiar diagnóstico</button>
          </div>
        </>
      )}
      {audio.phase === "unsupported" && <button type="button" className="btn" onClick={() => void copy()}>Copiar diagnóstico</button>}

      {diag && (
        <div className="field">
          <p className="sub">{diag.copied ? "Copiado. Pégalo en el chat con Claude." : "No se pudo copiar solo: selecciona el texto y cópialo."}</p>
          <textarea className="input" readOnly rows={8} value={diag.text} onFocus={(e) => e.currentTarget.select()} />
        </div>
      )}

      <p className="note">
        <Icon name="info" size={16} />
        <span>Sin conexión funcionan lecciones, ejercicios, audio, dictado, escritura y diálogos. Los videos de YouTube, los podcasts y los enlaces a Quizlet y Spotify siempre necesitan internet.</span>
      </p>
    </section>
  );
}
