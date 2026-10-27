import { useEffect, useState } from "react";

export type PersistState = "persistent" | "not-persistent" | "unsupported";

type StorageLike = Pick<StorageManager, "persist" | "persisted"> | undefined;

/**
 * Pide al navegador que no borre los datos de la app si hay poco espacio.
 * No muestra nada por sí sola; el navegador decide (en iOS suele aprobarlo si la app está en la pantalla de inicio).
 */
export async function requestPersistence(storage: StorageLike = globalThis.navigator?.storage): Promise<PersistState> {
  if (!storage || typeof storage.persist !== "function") return "unsupported";
  try {
    if (typeof storage.persisted === "function" && (await storage.persisted())) return "persistent";
    return (await storage.persist()) ? "persistent" : "not-persistent";
  } catch {
    return "not-persistent";
  }
}

/** Pide el modo persistente al abrir la app y devuelve el resultado para mostrarlo en Ajustes. */
export function usePersistence(): PersistState | "checking" {
  const [state, setState] = useState<PersistState | "checking">("checking");
  useEffect(() => {
    let alive = true;
    requestPersistence().then((s) => alive && setState(s));
    return () => { alive = false; };
  }, []);
  return state;
}
