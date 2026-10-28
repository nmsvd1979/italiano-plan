import { useEffect, useState } from "react";

// Rutas por hash (#/ajustes): funcionan en GitHub Pages y dentro de la PWA sin configurar el servidor.

/** Ruta con sus parámetros: si cambia solo el `?…`, la pantalla igual se vuelve a pintar. */
function currentFull(): string {
  const h = window.location.hash.replace(/^#/, "");
  return h.startsWith("/") ? h : "/";
}

/** Parámetros de la ruta actual (`#/practica/u02?part=A&n=7`): parte A/B, tamaño, bloque que se está haciendo. */
export function routeQuery(): URLSearchParams {
  const h = window.location.hash;
  const i = h.indexOf("?");
  return new URLSearchParams(i >= 0 ? h.slice(i + 1) : "");
}

export function useRoute(): string {
  const [full, setFull] = useState(currentFull);
  useEffect(() => {
    const on = () => {
      setFull(currentFull());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return full.split("?")[0];
}

export function href(path: string): string {
  return `#${path}`;
}

export function goBack(fallback = "/"): void {
  if (window.history.length > 1) window.history.back();
  else window.location.hash = fallback;
}
