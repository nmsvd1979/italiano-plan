import { useApp } from "../../app/state";
import { href } from "../../app/route";
import { setUsePrevious } from "../../domain/continuity";

/** Entrada a «Tu punto de partida» y «Volver al plan anterior» (docs/v2/14 §5). Ninguno de los dos borra nada. */
export function ContinuityCard() {
  const { continuity, updateContinuity } = useApp();
  return (
    <section className="card stack">
      <div className="eyebrow">Tu punto de partida</div>
      <p className="sub">
        Revisa qué unidades cuentan como dominadas, parciales o por empezar, haz el diagnóstico opcional y decide desde dónde sigue el plan.
      </p>
      <a className="btn block" href={href("/punto-de-partida")} style={{ textAlign: "center", textDecoration: "none" }}>Abrir Tu punto de partida</a>
      <button type="button" className="btn block" onClick={() => updateContinuity((c) => setUsePrevious(c, !c.usePrevious))}>
        {continuity.usePrevious ? "Usar de nuevo mi punto de partida" : "Volver al plan anterior"}
      </button>
      <p className="sub">
        {continuity.usePrevious
          ? "Ahora el plan usa solo tus marcas, como antes."
          : "«Volver al plan anterior» hace que el plan use solo tus marcas, como antes. No borra tus marcas, el diagnóstico ni las tarjetas."}
      </p>
    </section>
  );
}
