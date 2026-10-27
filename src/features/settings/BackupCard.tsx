import { useRef, useState } from "react";
import { PersistState, requestPersistence, usePersistence } from "../../app/persist";
import {
  BackupSummary, backupAdvice, backupFileName, buildBackup, deliverBackup, markBackupDone, parseBackup,
  restoreBackup, serializeBackup, summarizeBackup, type Backup, type DeliverEnv,
} from "../../domain/backup";
import { parseISODate } from "../../domain/dates";
import { Icon } from "../../ui/Icon";

const fmt = (d: Date) => d.toLocaleDateString("es", { dateStyle: "medium" });
/** Fecha y hora de la copia (instante exacto). */
const fmtInstant = (iso: string) => fmt(new Date(iso));
/** Día sin hora ("2026-08-15"): se lee como día local, no como UTC (que en Chile se correría un día). */
const fmtDay = (iso: string) => fmt(parseISODate(iso));
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function downloadFile(file: File): void {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

const browserEnv = (): DeliverEnv => ({
  canShare: typeof navigator.canShare === "function" ? (d) => navigator.canShare(d) : undefined,
  share: typeof navigator.share === "function" ? (d) => navigator.share(d) : undefined,
  download: downloadFile,
});

function describe(s: BackupSummary): string[] {
  return [
    `${plural(s.marks, "actividad marcada", "actividades marcadas")} en ${plural(s.days, "día", "días")}`,
    s.startDate ? `empezaste el ${fmtDay(s.startDate)}${s.startUnit ? `, desde la unidad ${s.startUnit}` : ""}` : "sin fecha de inicio",
    plural(s.reviewItems, "ejercicio en repaso", "ejercicios en repaso"),
    plural(s.writingTexts, "texto de escritura", "textos de escritura"),
    plural(s.phaseTests, "test de fase", "tests de fase"),
  ];
}

const PERSIST_TEXT: Record<PersistState | "checking", string> = {
  checking: "Comprobando el almacenamiento…",
  persistent: "Almacenamiento protegido: el navegador no debería borrar los datos de la app si falta espacio.",
  "not-persistent": "El navegador no confirmó el almacenamiento protegido: si el teléfono se queda sin espacio, podría borrar los datos de la app. Por eso conviene guardar copias.",
  unsupported: "Este navegador no permite pedir almacenamiento protegido. Guarda copias para no perder el progreso.",
};

interface PendingImport {
  backup: Backup;
  summary: BackupSummary;
  current: BackupSummary;
  ignored: string[];
}

export function BackupCard() {
  const fileInput = useRef<HTMLInputElement>(null);
  const persistence = usePersistence();
  const [advice, setAdvice] = useState(() => backupAdvice(window.localStorage));
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [pending, setPending] = useState<PendingImport | null>(null);
  const [busy, setBusy] = useState(false);

  const doExport = () => {
    // Todo lo que sigue hasta share() es síncrono: Safari exige que se llame dentro del toque.
    void requestPersistence();
    const now = new Date();
    const json = serializeBackup(buildBackup(window.localStorage, now));
    const file = new File([json], backupFileName(now), { type: "application/json" });
    setBusy(true);
    deliverBackup(file, browserEnv())
      .then((result) => {
        if (result === "cancelled") {
          setMessage({ kind: "error", text: "No se guardó la copia: cerraste la hoja de compartir." });
          return;
        }
        markBackupDone(window.localStorage, now);
        setAdvice(backupAdvice(window.localStorage, now));
        setMessage({
          kind: "ok",
          text: result === "shared"
            ? "Copia lista. Guárdala en Archivos o iCloud Drive, o envíatela, para que no dependa de este teléfono."
            : `Se descargó «${file.name}». Revisa que haya quedado en Archivos y guárdala también fuera del teléfono.`,
        });
      })
      .catch(() => setMessage({ kind: "error", text: "No se pudo crear la copia. Inténtalo de nuevo." }))
      .finally(() => setBusy(false));
  };

  const onPick = async (file: File | undefined) => {
    setMessage(null);
    setPending(null);
    if (!file) return;
    let text: string;
    try {
      text = await file.text();
    } catch {
      setMessage({ kind: "error", text: "No se pudo leer el archivo." });
      return;
    }
    const result = parseBackup(text);
    if (!result.ok) {
      setMessage({ kind: "error", text: result.error });
      return;
    }
    setPending({
      backup: result.backup,
      summary: result.summary,
      current: summarizeBackup(buildBackup(window.localStorage)),
      ignored: result.ignored,
    });
  };

  const confirmImport = () => {
    if (!pending) return;
    try {
      restoreBackup(pending.backup, window.localStorage);
    } catch {
      setPending(null);
      setMessage({ kind: "error", text: "No se pudo restaurar (¿sin espacio?). Tu progreso anterior quedó como estaba." });
      return;
    }
    setPending(null);
    setMessage({ kind: "ok", text: "Copia restaurada. Recargando la app…" });
    setTimeout(() => window.location.reload(), 900);
  };

  return (
    <section className="card stack">
      <div className="eyebrow">Copia de seguridad</div>
      <p className="sub">
        Guarda tu progreso en un archivo para no perderlo si se borran los datos del navegador, cambias de teléfono o reinstalas la app.
      </p>

      {advice.due && (
        <p className="note" role="status">
          <Icon name="info" size={16} />
          <span>
            {advice.never
              ? `Nunca has hecho una copia y llevas ${advice.days} días con la app.`
              : `Hace ${advice.days} días que no haces una copia.`}{" "}
            Hazla ahora.
          </span>
        </p>
      )}

      <div className="row">
        <button className="btn primary" type="button" disabled={busy} onClick={doExport}>Exportar copia</button>
        <button className="btn" type="button" onClick={() => fileInput.current?.click()}>Importar copia</button>
        <input
          ref={fileInput} type="file" accept="application/json,.json" hidden
          onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; void onPick(f); }}
        />
      </div>

      {message && (
        <p className="sub" role="status" style={message.kind === "error" ? { color: "var(--bad)" } : undefined}>{message.text}</p>
      )}

      {pending && (
        <div className="stack" role="alertdialog" aria-label="Confirmar restauración">
          <p><b>Copia del {fmtInstant(pending.summary.exportedAt)}</b></p>
          <ul className="candos">{describe(pending.summary).map((t) => <li key={t}>{t}</li>)}</ul>
          <p className="sub">Lo que tienes ahora en este teléfono:</p>
          <ul className="candos">{describe(pending.current).map((t) => <li key={t}>{t}</li>)}</ul>
          <p className="note">
            <Icon name="info" size={16} />
            <span>
              Si continúas, todo el progreso actual se <b>reemplaza</b> por el de la copia. No se puede deshacer.
              {pending.ignored.length > 0 && ` ${pending.ignored.length} dato(s) de la copia no se reconocen y se omitirán.`}
            </span>
          </p>
          <div className="row">
            <button className="btn danger" type="button" onClick={confirmImport}>Reemplazar mi progreso</button>
            <button className="btn" type="button" onClick={() => setPending(null)}>Cancelar</button>
          </div>
        </div>
      )}

      <p className="sub">{PERSIST_TEXT[persistence]}</p>
    </section>
  );
}
