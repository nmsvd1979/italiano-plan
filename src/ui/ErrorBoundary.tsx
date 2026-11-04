import { Component, type ErrorInfo, type ReactNode } from "react";
import { backupFileName, buildBackup, serializeBackup } from "../domain/backup";

/** Última red de seguridad: si algo falla al pintar, en lugar de una pantalla en blanco se ofrece reintentar, guardar lo que hay o empezar limpio. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  private save = () => {
    const blob = new Blob([serializeBackup(buildBackup(window.localStorage))], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = backupFileName();
    a.click();
    URL.revokeObjectURL(a.href);
  };

  private reset = () => {
    if (!window.confirm("Se borrará todo el progreso guardado en este dispositivo. ¿Seguro? Guarda una copia antes si quieres conservarlo.")) return;
    Object.keys(window.localStorage).filter((k) => k.startsWith("italianPlan.")).forEach((k) => window.localStorage.removeItem(k));
    window.location.hash = "#/";
    window.location.reload();
  };

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="app">
        <section className="card stack">
          <h1 className="title">Algo falló al abrir la app</h1>
          <p className="sub">Puede ser un dato guardado dañado. Tu progreso sigue en este dispositivo: primero guarda una copia y después reintenta.</p>
          <button type="button" className="btn primary block" onClick={() => window.location.reload()}>Reintentar</button>
          <button type="button" className="btn block" onClick={this.save}>Guardar copia de lo que hay</button>
          <button type="button" className="btn danger block" onClick={this.reset}>Borrar los datos de la app y empezar de nuevo</button>
        </section>
      </main>
    );
  }
}
