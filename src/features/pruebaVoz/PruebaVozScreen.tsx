import { useState } from "react";
import { goBack } from "../../app/route";
import { FRASES_PRUEBA } from "../../content/pruebaVoz";
import { Icon } from "../../ui/Icon";
import { stopAudio } from "../../ui/modelAudio";
import { speak } from "../../ui/speech";
import {
  CLAVE_RESULTADO, ETIQUETAS, aleatorizar, armarResultado,
  type Orden, type Resultado, type Voz, type Votos,
} from "./logic";

// Se mezcla una sola vez por sesión (por carga de la página), aunque la pantalla se vuelva a abrir.
let orden: Orden | null = null;
const ordenDeSesion = (): Orden => (orden ??= aleatorizar(FRASES_PRUEBA.map((f) => f.id)));

const NOMBRE: Record<Voz, string> = { c1: "Candidato 1", c2: "Candidato 2", sistema: "Voz del sistema" };

/** Los mp3 se piden al reproducir (no entran al precache); el nombre no revela la voz: -x es el candidato 1, -y el 2. */
function sonar(id: string, it: string, voz: Voz): void {
  stopAudio();
  if (voz === "sistema") {
    void speak(it);
    return;
  }
  const audio = new Audio(`${import.meta.env.BASE_URL}audio-prueba/${id}-${voz === "c1" ? "x" : "y"}.mp3`);
  void audio.play();
}

/** Prueba A/B en ciego de la voz de las frases (docs/v2/03 C1). Solo se llega por URL (#/prueba-voz). */
export function PruebaVozScreen() {
  const mezcla = ordenDeSesion();
  const [votos, setVotos] = useState<Votos>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const hechas = Object.keys(votos).length;

  const ver = () => {
    const r = armarResultado(mezcla, votos, new Date().toISOString());
    window.localStorage.setItem(CLAVE_RESULTADO, JSON.stringify(r));
    setResultado(r);
  };

  return (
    <>
      <header className="screen-head">
        <a className="back" href="#/" onClick={(e) => { e.preventDefault(); stopAudio(); goBack(); }} aria-label="Volver">
          <Icon name="arrowLeft" size={20} />
        </a>
        <h1 className="title">Prueba de voz</h1>
      </header>
      <p className="sub">
        Toca A, B y C en cada frase y marca la que suene más natural y se entienda mejor. No se dice qué voz es cuál hasta el final.
      </p>

      {FRASES_PRUEBA.map((f, i) => (
        <section className="card stack" key={f.id}>
          <b>Frase {i + 1} de {FRASES_PRUEBA.length}</b>
          <div style={{ display: "flex", gap: 8 }}>
            {ETIQUETAS.map((et, k) => (
              <button key={et} type="button" className="btn" style={{ flex: 1 }} onClick={() => sonar(f.id, f.it, mezcla[f.id][k])} aria-label={`Escuchar ${et}`}>
                {et}
              </button>
            ))}
          </div>
          <div className="field">
            <label>¿Cuál suena más natural y se entiende mejor?</label>
            <div className="segmented" role="group" aria-label={`Frase ${i + 1}: la mejor`}>
              {ETIQUETAS.map((et, k) => (
                <button key={et} type="button" aria-pressed={votos[f.id] === k} onClick={() => setVotos((v) => ({ ...v, [f.id]: k }))}>
                  {et}
                </button>
              ))}
            </div>
          </div>
        </section>
      ))}

      <button type="button" className="btn primary block" disabled={hechas === 0} onClick={ver}>
        Ver resultado ({hechas}/{FRASES_PRUEBA.length})
      </button>

      {resultado && (
        <section className="card stack" aria-live="polite">
          <b>Resultado</b>
          {(Object.keys(NOMBRE) as Voz[]).map((v) => (
            <div key={v}>{NOMBRE[v]}: <b>{resultado.total[v]}</b> {resultado.total[v] === 1 ? "voto" : "votos"}</div>
          ))}
          <p className="sub">Guardado en este dispositivo (italianPlan.v2.pruebaVoz).</p>
        </section>
      )}
    </>
  );
}
