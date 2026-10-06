import { useState } from "react";
import { useApp } from "../../app/state";
import { READY_UNITS } from "../../content/curriculum";
import { toISODate } from "../../domain/dates";
import { Icon } from "../../ui/Icon";

export function Setup() {
  const { today, setStart, setStartUnit } = useApp();
  const [value, setValue] = useState(toISODate(today));
  const [unit, setUnit] = useState(1);

  return (
    <div className="card stack" style={{ marginTop: "10vh" }}>
      <Icon name="target" size={30} />
      <h1 className="title">Empecemos</h1>
      <p className="sub">
        Son 24 unidades, unos seis meses. No hay semanas fijas: el plan avanza contigo. Si un día no estudias, mañana sigue lo mismo; si tienes más tiempo, sigues con lo que viene. La fecha solo sirve para medir tu ritmo.
      </p>
      <div className="field">
        <label htmlFor="start">Fecha en que empiezas</label>
        <input id="start" className="input" type="date" value={value} onChange={(e) => setValue(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="unit">¿Desde dónde empiezas?</label>
        <select id="unit" className="input" value={unit} onChange={(e) => setUnit(Number(e.target.value))}>
          <option value={1}>Desde cero (unidad 1)</option>
          {READY_UNITS.filter((u) => u.n > 1).map((u) => (
            <option key={u.id} value={u.n}>Ya sé lo anterior: empezar en la unidad {u.n}</option>
          ))}
        </select>
        <p className="sub">Si ya sabes saludar y presentarte, empieza más adelante. Siempre puedes cambiarlo en Ajustes.</p>
      </div>
      <button className="btn primary block" type="button" disabled={!value} onClick={() => { setStartUnit(unit); setStart(value); }}>
        Empezar
      </button>
    </div>
  );
}
