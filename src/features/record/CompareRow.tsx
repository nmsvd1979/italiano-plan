import { useState } from "react";
import { Icon } from "../../ui/Icon";
import { playModel, playRecording, stopAudio } from "../../ui/modelAudio";

interface Props {
  /** Lo que dice el modelo. */
  text: string;
  /** Audio nativo del modelo, si hay (si no, voz del sistema). */
  file?: string;
  /** Tu grabación, si hay. */
  url?: string;
  rate?: number;
}

/** «Modelo → Tú»: el modelo suena y, cuando termina, suena tu grabación. Con botones sueltos para repetir cada uno. */
export function CompareRow({ text, file, url, rate }: Props) {
  const [busy, setBusy] = useState(false);
  const run = async (steps: (() => Promise<void>)[]) => {
    if (busy) { stopAudio(); setBusy(false); return; }
    setBusy(true);
    for (const step of steps) await step();
    setBusy(false);
  };
  const model = () => playModel(text, file, rate);
  const mine = () => (url ? playRecording(url) : Promise.resolve());
  return (
    <div className="row" style={{ flexWrap: "wrap" }}>
      <button type="button" className="chip" onClick={() => void run([model])}><Icon name="sound" size={14} /> Modelo</button>
      {url && (
        <>
          <button type="button" className="chip" onClick={() => void run([mine])}><Icon name="mic" size={14} /> Tú</button>
          <button type="button" className="chip primary" onClick={() => void run([model, mine])}>
            <Icon name={busy ? "pause" : "play"} size={14} /> {busy ? "Detener" : "Modelo → Tú"}
          </button>
        </>
      )}
    </div>
  );
}
