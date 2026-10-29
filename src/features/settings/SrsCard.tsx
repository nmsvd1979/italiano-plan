import { useState } from "react";
import { generalOn, loadSrs, saveSrs } from "../../domain/srs";
import { LIMITS } from "../../domain/srsQueue";

/** Opciones del repaso espaciado: el mazo general de frecuencia (activado por defecto). */
export function SrsCard() {
  const [state, setState] = useState(() => loadSrs(window.localStorage));
  // Las tarjetas del antiguo mazo de Quizlet siguen guardadas, pero ya no se cuentan ni se muestran.
  const cards = Object.values(state.cards).filter((c) => c.deck !== "quizlet");
  const general = cards.filter((c) => c.deck === "general").length;
  const on = generalOn(state);

  const toggle = () => {
    const next = { ...state, options: { ...state.options, general: !on } };
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
        <input type="checkbox" checked={on} onChange={toggle} style={{ width: 24, height: 24 }} />
        <span>Mazo general de frecuencia: {LIMITS.generalNewPerDay} palabras nuevas al día</span>
      </label>
      <p className="sub">
        Palabras comunes del italiano que no pertenecen a una unidad concreta, de las más frecuentes a las menos, con una frase de ejemplo.
        {general > 0 ? ` Ya empezaste ${general}.` : ""} Si lo apagas, no salen más nuevas y las que ya empezaste siguen su repaso.
      </p>
    </section>
  );
}
