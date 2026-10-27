import { registerSW } from "virtual:pwa-register";

/** Solo en Hoy: en una lección, ejercicio o dictado abierto no se recarga la app aunque haya una versión nueva. */
export function isSafeToUpdate(route: string): boolean {
  return route === "" || route === "/";
}

/**
 * Registra el service worker. Una versión nueva se descarga sola, pero se aplica (con recarga) al volver a Hoy.
 * La caché de audio ("audio-v1") no se toca en la actualización.
 */
export function registerServiceWorker(): void {
  let waiting = false;
  const route = () => window.location.hash.replace(/^#/, "");
  const tryApply = () => {
    if (!waiting || !isSafeToUpdate(route())) return;
    waiting = false;
    void updateSW(true);
  };
  const updateSW = registerSW({
    onNeedRefresh() {
      waiting = true;
      tryApply();
    },
  });
  window.addEventListener("hashchange", tryApply);
}
