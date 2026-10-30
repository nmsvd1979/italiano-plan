import { useEffect } from "react";
import { Icon } from "../../ui/Icon";
import { useRecorder, type Take } from "./useRecorder";

interface Props {
  /** Actividad de la grabación en IndexedDB (ej. `u04:rol`). */
  activity: string;
  label?: string;
  /** Avisa cuando hay una grabación nueva, o `null` cuando no se puede grabar (modo sin grabación). */
  onTake?: (take: Take | null) => void;
  /** Avisa si el micrófono no está disponible o se negó el permiso. */
  onUnusable?: () => void;
}

const WHY: Record<string, string> = {
  denied: "No diste permiso al micrófono.",
  unsupported: "Este navegador no puede grabar.",
  failed: "No se pudo grabar.",
};

/** Botón Grabar / Detener con reproducción de lo grabado. Sin micrófono muestra por qué y deja seguir sin grabar. */
export function RecordTake({ activity, label = "Grabar", onTake, onUnusable }: Props) {
  const { status, take, start, stop, usable } = useRecorder(activity);
  useEffect(() => { onTake?.(take); }, [take]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!usable) onUnusable?.(); }, [usable]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!usable) {
    return <p className="note" role="status"><Icon name="info" size={16} /><span>{WHY[status]} Sigue sin grabar: dilo en voz alta y compáralo de oído con el modelo.</span></p>;
  }
  return (
    <div className="stack">
      {status === "recording" ? (
        <button type="button" className="btn rec-on" onClick={() => void stop()}>
          <Icon name="pause" size={16} /> Detener
        </button>
      ) : (
        <button type="button" className="btn" onClick={() => void start()}>
          <Icon name="mic" size={16} /> {take ? "Grabar otra vez" : label}
        </button>
      )}
      {status === "recording" && <p className="sub" role="status">Grabando…</p>}
      {take && (
        <>
          <audio controls src={take.url} aria-label="Tu grabación" />
          {!take.saved && <p className="sub">No se pudo guardar en este dispositivo: solo la oyes mientras no cierres la pantalla.</p>}
        </>
      )}
    </div>
  );
}
