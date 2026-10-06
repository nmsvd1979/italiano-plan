import { useEffect, useState } from "react";

// Rutas por hash (#/ajustes): funcionan en GitHub Pages y dentro de la PWA sin configurar el servidor.

function currentPath(): string {
  const h = window.location.hash.replace(/^#/, "");
  return h.startsWith("/") ? h : "/";
}

export function useRoute(): string {
  const [path, setPath] = useState(currentPath);
  useEffect(() => {
    const on = () => {
      setPath(currentPath());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return path;
}

export function href(path: string): string {
  return `#${path}`;
}

export function goBack(fallback = "/"): void {
  if (window.history.length > 1) window.history.back();
  else window.location.hash = fallback;
}
