import { useState } from "react";
import { useApp } from "../../app/state";
import { toISODate } from "../../domain/dates";
import { Icon } from "../../ui/Icon";

export function Setup() {
  const { today, setStart } = useApp();
  const [value, setValue] = useState(toISODate(today));

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
      <button className="btn primary block" type="button" disabled={!value} onClick={() => setStart(value)}>
        Empezar
      </button>
    </div>
  );
}
