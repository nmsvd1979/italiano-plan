import { useState } from "react";
import { loadSrs, saveSrs } from "../../domain/srs";
import { LIMITS } from "../../domain/srsQueue";

/** Opciones del repaso espaciado: por ahora, el mazo extra de Quizlet (desactivado por defecto). */
export function SrsCard() {
  const [state, setState] = useState(() => loadSrs(window.localStorage));
  const cards = Object.values(state.cards);
  const extra = cards.filter((c) => c.deck === "quizlet").length;
  const on = !!state.options?.quizlet;
  const freqOn = state.options?.freq !== false;
  const freqStarted = cards.filter((c) => c.deck === "freq").length;

  const toggle = () => {
    const next = { ...state, options: { ...state.options, quizlet: !on } };
    saveSrs(next, window.localStorage);
    setState(next);
  };

  const toggleFreq = () => {
    const next = { ...state, options: { ...state.options, freq: !freqOn } };
    saveSrs(next, window.localStorage);
    setState(next);
  };

  return (
    <section className="card stack">
      <div className="eyebrow">Repaso espaciado</div>
      <p className="sub">
        {cards.length === 0 ? "Todavía no tienes tarjetas." : `${cards.length} tarjetas guardadas (viajan en la copia de seguridad).`}
      </p>
      <label className="row" style={{ alignItems: "center", gap: 10 }}>
        <input type="checkbox" checked={freqOn} onChange={toggleFreq} style={{ width: 24, height: 24 }} />
        <span>Palabras frecuentes: {LIMITS.freqNewPerDay} nuevas al día</span>
      </label>
      <p className="sub">
        Las palabras más comunes del italiano que las unidades no traen, con su frase. Solo tarjetas de reconocer.
        {freqStarted > 0 ? ` Ya empezaste ${freqStarted}.` : ""} Si lo apagas, no salen más nuevas y las que ya empezaste siguen su repaso.
      </p>
      <label className="row" style={{ alignItems: "center", gap: 10 }}>
        <input type="checkbox" checked={on} onChange={toggle} style={{ width: 24, height: 24 }} />
        <span>Mazo extra de Quizlet: {LIMITS.quizletNewPerDay} palabras nuevas al día</span>
      </label>
      <p className="sub">
        Palabras del mazo de 1.400 términos que todavía no están en las unidades. Solo tarjetas de reconocer.
        {extra > 0 ? ` Ya empezaste ${extra}.` : ""} Si lo apagas, no salen más nuevas y las que ya empezaste siguen su repaso.
      </p>
    </section>
  );
}
