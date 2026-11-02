import { useState } from "react";
import type { Block } from "../../content/grammar";
import { Icon } from "../../ui/Icon";
import { Rich } from "../../ui/Rich";

function RuleBlock({ block }: { block: Block }) {
  if (block.kind === "p") return <p className="rule-p"><Rich text={block.text} /></p>;
  if (block.kind === "list") {
    return <ul className="rule-list">{block.items.map((t) => <li key={t}><Rich text={t} /></li>)}</ul>;
  }
  return (
    <div className="table-scroll">
      <table className="rule-table">
        <thead><tr>{block.head.map((h, i) => <th key={i}><Rich text={h} /></th>)}</tr></thead>
        <tbody>
          {block.rows.map((row, r) => (
            <tr key={r}>{row.map((c, i) => <td key={i}><Rich text={c} /></td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Primero los bloques de la regla corta; los marcados `detail` quedan aparte, en su orden. */
export function splitRule(rule: Block[]): { main: Block[]; detail: Block[] } {
  return { main: rule.filter((b) => !b.detail), detail: rule.filter((b) => b.detail) };
}

export function RuleView({ rule, open, onToggle, panelId }: { rule: Block[]; open: boolean; onToggle: () => void; panelId: string }) {
  const { main, detail } = splitRule(rule);
  return (
    <>
      {main.map((b, i) => <RuleBlock key={i} block={b} />)}
      {detail.length > 0 && (
        <>
          <button type="button" className="rule-more" aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
            <Icon name="chevronDown" size={16} /> Más detalle
          </button>
          {open && <div id={panelId} className="stack">{detail.map((b, i) => <RuleBlock key={i} block={b} />)}</div>}
        </>
      )}
    </>
  );
}

/** El estado abierto/cerrado vive solo en memoria: al volver a abrir la lección empieza plegada. */
export function RuleSection({ rule, unit }: { rule: Block[]; unit: string }) {
  const [open, setOpen] = useState(false);
  return <RuleView rule={rule} open={open} onToggle={() => setOpen((o) => !o)} panelId={`rule-detail-${unit}`} />;
}
