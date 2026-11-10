import type { ReactNode } from "react";
import { Icon } from "../Icon";

/** Letras con tilde del italiano para los campos de texto. */
export const ACCENTS = ["à", "è", "é", "ì", "ò", "ù"];

export function AccentBar({ disabled, onPick }: { disabled?: boolean; onPick: (c: string) => void }) {
  return (
    <div className="accents" aria-label="Letras con tilde">
      {ACCENTS.map((c) => (
        <button key={c} type="button" className="it" disabled={disabled} onClick={() => onPick(c)}>{c}</button>
      ))}
    </div>
  );
}

/** Progreso del ejercicio: un tramo por ejercicio (hasta 12) o una barra continua si son más. */
export function ExerciseProgress({ index, total, done }: { index: number; total: number; done: boolean }) {
  const filled = index + (done ? 1 : 0);
  return (
    <div className="runner-progress" aria-label={`Ejercicio ${index + 1} de ${total}`}>
      {total <= 12 ? (
        <div className="seg" aria-hidden="true">
          {Array.from({ length: total }, (_, i) => <i key={i} className={i < filled ? "done" : i === index ? "now" : ""} />)}
        </div>
      ) : (
        <div className="bar"><i style={{ width: `${(filled / total) * 100}%` }} /></div>
      )}
      <span>{index + 1} de {total}</span>
    </div>
  );
}

export interface ChoiceItem {
  /** Posición de la opción en el ejercicio (lo que se guarda al elegir). */
  value: number;
  label: ReactNode;
  state?: "right" | "wrong" | "";
}

/** Opciones grandes de respuesta única. Es un grupo de radios: se elige y luego se comprueba. */
export function Choice({ items, selected, disabled, onSelect }: { items: ChoiceItem[]; selected: number | null; disabled?: boolean; onSelect: (value: number) => void }) {
  return (
    <div className="options" role="radiogroup">
      {items.map((o) => (
        <button
          key={o.value} type="button" role="radio" aria-checked={selected === o.value}
          className={`option ${selected === o.value ? "picked" : ""} ${o.state ?? ""}`}
          disabled={disabled} onClick={() => onSelect(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export type Tone = "correct" | "almost" | "wrong";

/** Respuesta del ejercicio: titular, la respuesta correcta si hace falta y la explicación. */
export function Feedback({ tone, head, children }: { tone: Tone; head: string; children?: ReactNode }) {
  return (
    <div className={`feedback ${tone}`} role="status">
      <div className="feedback-head">
        <Icon name={tone === "wrong" ? "x" : "check"} size={18} />
        {head}
      </div>
      {children}
    </div>
  );
}

/** Marco del ejercicio: progreso arriba, contenido y, abajo, la respuesta y el botón siempre a la vista. */
export function ExerciseShell({ index, total, done, tone, feedback, action, children }: {
  index: number; total: number; done: boolean; tone?: Tone; feedback?: ReactNode; action: ReactNode; children: ReactNode;
}) {
  return (
    <div className="runner">
      <ExerciseProgress index={index} total={total} done={done} />
      {children}
      <div className={`exercise-foot${tone ? ` ${tone}` : ""}`}>
        {feedback}
        {action}
      </div>
    </div>
  );
}
