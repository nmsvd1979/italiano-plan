import { useEffect, useState } from "react";

export type OfflineStatus =
  | { state: "unsupported" }
  | { state: "checking" }
  /** El service worker controla la página y estos archivos están guardados para usar sin conexión. */
  | { state: "ready"; files: number }
  /** Hay service worker, pero todavía no controla esta página (falta recargar) o no terminó de guardar. */
  | { state: "pending" };

async function precacheCount(): Promise<number> {
  const names = await caches.keys();
  const name = names.find((n) => n.includes("precache"));
  if (!name) return 0;
  return (await (await caches.open(name)).keys()).length;
}

/** Estado del modo sin conexión: sirve para comprobar que el service worker quedó instalado y activo. */
export function useOfflineStatus(): OfflineStatus {
  const [status, setStatus] = useState<OfflineStatus>(() =>
    "serviceWorker" in navigator && "caches" in window ? { state: "checking" } : { state: "unsupported" },
  );

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("caches" in window)) return;
    let cancelled = false;
    const check = async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      const files = await precacheCount();
      if (cancelled) return;
      setStatus(reg?.active && navigator.serviceWorker.controller && files > 0 ? { state: "ready", files } : { state: "pending" });
    };
    void check();
    navigator.serviceWorker.addEventListener("controllerchange", check);
    const id = window.setInterval(check, 3000);
    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener("controllerchange", check);
      window.clearInterval(id);
    };
  }, []);

  return status;
}
