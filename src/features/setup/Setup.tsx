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
        Elige el día en que arranca tu plan de doce semanas. Desde ahí la app calcula sola en qué semana y fase estás, cada día.
      </p>
      <div className="field">
        <label htmlFor="start">Fecha de inicio</label>
        <input id="start" className="input" type="date" value={value} onChange={(e) => setValue(e.target.value)} />
      </div>
      <button className="btn primary block" type="button" disabled={!value} onClick={() => setStart(value)}>
        Empezar el plan
      </button>
    </div>
  );
}
