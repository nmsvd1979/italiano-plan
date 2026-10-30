import { useState } from "react";
import { recStore } from "../record/useRecorder";

/** Las grabaciones de voz viven en IndexedDB de este dispositivo; la copia de seguridad no las incluye (docs/v2/05 E1). */
export function RecordingsCard() {
  const [message, setMessage] = useState<string | null>(null);
  const clear = async () => {
    if (!window.confirm("¿Borrar todas tus grabaciones de voz de este teléfono?")) return;
    try {
      await recStore().clearAll();
      setMessage("Grabaciones borradas.");
    } catch {
      setMessage("No se pudieron borrar. Inténtalo de nuevo.");
    }
  };
  return (
    <section className="card stack">
      <div className="eyebrow">Grabaciones de voz</div>
      <p className="sub">
        Las grabaciones de «Grabar y comparar» se guardan solo en este teléfono (hasta 20 recientes por actividad) y <b>no viajan en la copia de seguridad</b>:
        si cambias de teléfono o reinstalas la app, se pierden. Nunca se envían a ningún servidor.
      </p>
      <button type="button" className="btn danger" onClick={() => void clear()}>Borrar mis grabaciones</button>
      {message && <p className="sub" role="status">{message}</p>}
    </section>
  );
}
