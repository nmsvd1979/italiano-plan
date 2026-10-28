import { useState } from "react";
import { Icon } from "../../ui/Icon";
import { speak, type SpeakReport } from "../../ui/speech";
import { INSTALL_VOICE_HELP } from "../../ui/VoiceNotice";

const PHRASE = "Buongiorno, mi chiamo Marco. Come stai?";

const RESULT: Record<SpeakReport["result"], string> = {
  started: "Empezó a sonar.",
  error: "El sistema devolvió un error al hablar.",
  silent: "La orden se envió, pero no empezó a sonar.",
  unsupported: "Este navegador no tiene síntesis de voz.",
};

/** Prueba de la voz del sistema: cuántas voces hay, cuántas son italianas y cuál se usó. */
export function VoiceCard() {
  const [report, setReport] = useState<SpeakReport | null>(null);
  const [busy, setBusy] = useState(false);

  const test = async () => {
    setBusy(true);
    try {
      setReport(await speak(PHRASE));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card stack">
      <div className="eyebrow">Probar la voz italiana</div>
      <p className="sub">
        Los parlantes de los ejemplos y el dictado usan la voz italiana del sistema. Toca el botón: deberías oír
        «{PHRASE}». Sube el volumen y quita el modo silencio del teléfono.
      </p>
      <button type="button" className="btn primary" disabled={busy} onClick={() => void test()}>
        <Icon name="sound" size={18} /> {busy ? "Probando…" : "Probar la voz"}
      </button>

      {report && (
        <div className="stack" role="status">
          <ul className="candos">
            <li>Voces en el dispositivo: {report.voices}</li>
            <li>Voces italianas: {report.italian}</li>
            <li>Voz usada: {report.used ? `${report.used.name} (${report.used.lang})` : "ninguna elegida; el sistema decidió por el idioma it-IT"}</li>
            <li>Resultado: {RESULT[report.result]}{report.error ? ` (${report.error})` : ""}</li>
          </ul>
          {report.italian === 0 && report.voices > 0 && (
            <p className="note">
              <Icon name="info" size={16} />
              <span>
                No hay voz italiana. {INSTALL_VOICE_HELP} Después vuelve a probar. Mientras, el audio de la app necesita
                internet (grabaciones nativas) o esa voz.
              </span>
            </p>
          )}
          {report.voices === 0 && report.result !== "unsupported" && (
            <p className="note">
              <Icon name="info" size={16} />
              <span>
                El navegador no entregó ninguna voz. Cierra y vuelve a abrir la app, y prueba de nuevo. Si sigue igual,
                {" "}{INSTALL_VOICE_HELP.charAt(0).toLowerCase() + INSTALL_VOICE_HELP.slice(1)}
              </span>
            </p>
          )}
          {report.italian > 0 && report.result !== "started" && (
            <p className="note">
              <Icon name="info" size={16} />
              <span>
                Hay voz italiana pero no sonó. Revisa el volumen y el interruptor de silencio, y que la voz esté descargada
                (Ajustes → Accesibilidad → Contenido leído → Voces → Italiano).
              </span>
            </p>
          )}
        </div>
      )}
    </section>
  );
}
