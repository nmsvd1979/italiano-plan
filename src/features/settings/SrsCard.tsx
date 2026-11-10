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
      <label className="switch-row">
        <span><b>Palabras frecuentes</b><small>{LIMITS.freqNewPerDay} nuevas al día</small></span>
        <input type="checkbox" role="switch" className="switch" checked={freqOn} onChange={toggleFreq} />
      </label>
      <p className="sub">
        Las palabras más comunes del italiano que las unidades no traen, con su frase. Solo tarjetas de reconocer.
        {freqStarted > 0 ? ` Ya empezaste ${freqStarted}.` : ""} Si lo apagas, no salen más nuevas y las que ya empezaste siguen su repaso.
      </p>
      <label className="switch-row">
        <span><b>Mazo extra de Quizlet</b><small>{LIMITS.quizletNewPerDay} palabras nuevas al día</small></span>
        <input type="checkbox" role="switch" className="switch" checked={on} onChange={toggle} />
      </label>
      <p className="sub">
        Palabras del mazo de 1.400 términos que todavía no están en las unidades. Solo tarjetas de reconocer.
        {extra > 0 ? ` Ya empezaste ${extra}.` : ""} Si lo apagas, no salen más nuevas y las que ya empezaste siguen su repaso.
      </p>
    </section>
  );
}
