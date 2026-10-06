import { useState } from "react";
import { useApp } from "../../app/state";
import { goBack } from "../../app/route";
import { RESOURCES } from "../../content/plan";
import { toISODate } from "../../domain/dates";
import type { ThemeChoice } from "../../domain/storage";
import { Icon } from "../../ui/Icon";

const THEMES: { value: ThemeChoice; label: string }[] = [
  { value: "system", label: "Sistema" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
];

const SHORTCUTS: [key: string, label: string][] = [
  ["quizlet", "Quizlet · Mis tarjetas"],
  ["quizletSet", "Quizlet · Set de 5000 palabras"],
  ["forvo", "Forvo · Pronunciación de una palabra"],
  ["cbi", "Coffee Break Italian"],
  ["podcastitalianoPrincipiante", "Podcast Italiano Principiante"],
  ["podcastitaliano", "Podcast Italiano"],
  ["podcastitalianoTranscript", "Podcast Italiano · Transcripciones"],
];

function reminderStatus(enabled: boolean, time: string): string {
  if (!("Notification" in window)) return "Este navegador no soporta notificaciones.";
  if (Notification.permission === "denied") return "Bloqueadas en el navegador. Habilitalas desde la configuración del sitio.";
  if (Notification.permission === "granted" && enabled) return `Activo: te avisa a las ${time} si todavía no marcaste nada hoy.`;
  return `Inactivo. Activalo para recibir un aviso a las ${time}.`;
}

export function Settings() {
  const { startDate, settings, setStart, patchSettings, resetProgress, resetAll } = useApp();
  const [, force] = useState(0);

  const enableReminder = async () => {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    patchSettings({ reminderEnabled: perm === "granted" });
    force((n) => n + 1);
  };

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <h1 className="title">Ajustes</h1>
      </header>

      <section className="card stack">
        <div className="field">
          <label htmlFor="start">Fecha de inicio del plan</label>
          <input
            id="start" className="input" type="date"
            value={startDate ? toISODate(startDate) : ""}
            onChange={(e) => e.target.value && setStart(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Apariencia</label>
          <div className="segmented" role="group" aria-label="Apariencia">
            {THEMES.map((t) => (
              <button key={t.value} type="button" aria-pressed={settings.theme === t.value} onClick={() => patchSettings({ theme: t.value })}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="card stack">
        <div className="eyebrow">Recordatorio diario</div>
        <div className="field">
          <label htmlFor="rtime">Hora del aviso</label>
          <input id="rtime" className="input" type="time" value={settings.reminderTime}
            onChange={(e) => patchSettings({ reminderTime: e.target.value })} />
        </div>
        <div className="row">
          <button className="btn primary" type="button" onClick={enableReminder}>Activar</button>
          <button className="btn" type="button" onClick={() => patchSettings({ reminderEnabled: false })}>Desactivar</button>
        </div>
        <p className="sub">{reminderStatus(settings.reminderEnabled, settings.reminderTime)}</p>
        <p className="note">
          <Icon name="info" size={16} />
          <span>
            Las notificaciones del navegador solo funcionan mientras la app está abierta o en segundo plano, según lo que permita el
            sistema. No hay un servidor que empuje avisos, así que con la app cerrada del todo no llega nada.
          </span>
        </p>
      </section>

      <section className="card">
        <div className="eyebrow" style={{ marginBottom: 6 }}>Accesos directos</div>
        <div className="link-list">
          {SHORTCUTS.map(([k, label]) => (
            <a key={k} href={RESOURCES[k].url} target="_blank" rel="noopener noreferrer">
              {label} <Icon name="external" size={16} />
            </a>
          ))}
        </div>
      </section>

      <section className="card stack">
        <div className="eyebrow">Datos</div>
        <p className="sub">Todo se guarda solo en este teléfono. No hay cuenta ni sincronización.</p>
        <div className="row">
          <button className="btn danger" type="button"
            onClick={() => window.confirm("¿Borrar todo el progreso marcado? La fecha de inicio se mantiene.") && resetProgress()}>
            Borrar progreso
          </button>
          <button className="btn danger" type="button"
            onClick={() => window.confirm("¿Reiniciar el plan? Se borra el progreso y la app vuelve a pedir la fecha de inicio.") && resetAll()}>
            Reiniciar plan
          </button>
        </div>
      </section>
    </>
  );
}
