import { useState } from "react";
import { audioPriorityUnits } from "../../app/offlineUnits";
import { dismissJustFinished, pauseAudioDownload, startAudioDownload, useAudioDownload } from "../../app/offlineAudio";
import { useOnline } from "../../app/offline";
import { useApp } from "../../app/state";
import { Icon } from "../../ui/Icon";

const DISMISSED = "italiano.offlineBannerDismissed";

// Es una preferencia de la sesión, no progreso: va en sessionStorage para no entrar en la copia de seguridad.
function wasDismissed(): boolean {
  try { return window.sessionStorage.getItem(DISMISSED) === "1"; } catch { return false; }
}

/** Aviso en Hoy para bajar el audio y poder usar la app sin conexión. */
export function OfflineBanner() {
  const { steps, progress } = useApp();
  const audio = useAudioDownload();
  const online = useOnline();
  const [dismissed, setDismissed] = useState(wasDismissed);

  if (audio.justFinished) {
    return (
      <section className="card flat review-card" role="status">
        <div>
          <div className="eyebrow">Sin conexión</div>
          <p className="sub"><b>Listo para usar sin conexión</b>. Audio completo: {audio.done} archivos.</p>
        </div>
        <button type="button" className="chip" onClick={dismissJustFinished}>Entendido</button>
      </section>
    );
  }
  if (audio.phase === "done" || audio.phase === "unsupported" || audio.phase === "checking") return null;

  const downloading = audio.phase === "downloading";
  if (dismissed && !downloading) return null;
  const pct = audio.total ? Math.round((audio.done / audio.total) * 100) : 0;

  return (
    <section className="card flat stack">
      <div className="eyebrow">Usar sin conexión</div>
      {downloading ? (
        <>
          <p className="sub">Descargando audio: {audio.done} de {audio.total} ({pct}%). Deja la app abierta con la pantalla encendida.</p>
          <div className="row"><button type="button" className="btn" onClick={pauseAudioDownload}>Pausar</button></div>
        </>
      ) : (
        <>
          <p className="sub">
            {online
              ? "Baja el audio (unos 10 MB) para que todo funcione sin internet. Mejor con Wi-Fi."
              : "Sin conexión no se puede bajar el audio. Hazlo cuando tengas internet."}
          </p>
          {audio.message && <p className="note"><Icon name="info" size={16} /><span>{audio.message}</span></p>}
          <div className="row">
            <button type="button" className="btn primary" disabled={!online} onClick={() => void startAudioDownload(audioPriorityUnits(steps, progress))}>
              {audio.done > 0 ? "Reanudar descarga" : "Usar sin conexión"}
            </button>
            <button type="button" className="chip" onClick={() => { try { window.sessionStorage.setItem(DISMISSED, "1"); } catch { /* sin sessionStorage: solo se oculta ahora */ } setDismissed(true); }}>
              Ahora no
            </button>
          </div>
        </>
      )}
    </section>
  );
}
