const fmt = (n: number) => n.toLocaleString("es", { maximumFractionDigits: 1 });

/** Puntaje de fin de actividad: «n de N» con el tono según el resultado y una frase corta. */
export function Score({ correct, total }: { correct: number; total: number }) {
  const ratio = total > 0 ? correct / total : 0;
  const tone = ratio >= 0.8 ? "good" : ratio >= 0.5 ? "warn" : "bad";
  const verdict = tone === "good" ? "Muy bien" : tone === "warn" ? "Vas bien: repasa lo que falló" : "Conviene repasar esto";
  return (
    <div>
      <div className={`score ${tone}`}>{fmt(correct)} de {total}</div>
      <p className="score-verdict">{verdict}</p>
    </div>
  );
}
