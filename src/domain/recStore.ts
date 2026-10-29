// Grabaciones propias en IndexedDB `italianPlan-rec` (docs/v2/05 E1): máximo 20 recientes por actividad.
// No viajan en la copia de seguridad (esa solo copia localStorage); Ajustes lo avisa.

export const REC_DB = "italianPlan-rec";
export const REC_STORE = "recordings";
export const MAX_PER_ACTIVITY = 20;

export interface Recording {
  id: number;
  /** Actividad a la que pertenece, ej. `u04:rol` o `u04:pron:cane`. */
  activity: string;
  /** Instante de la grabación (ms). */
  at: number;
  mime: string;
  blob: Blob;
}

export interface RecStore {
  add(activity: string, blob: Blob, mime: string, at: number): Promise<Recording>;
  /** De la más reciente a la más antigua. */
  list(activity: string): Promise<Recording[]>;
  clearAll(): Promise<void>;
}

/** Ids que sobran: las más antiguas por encima del máximo. */
export function idsToPrune(entries: { id: number; at: number }[], max = MAX_PER_ACTIVITY): number[] {
  return [...entries].sort((a, b) => b.at - a.at || b.id - a.id).slice(max).map((e) => e.id);
}

/** Almacén en memoria con las mismas reglas que el de IndexedDB (pruebas y respaldo si IndexedDB no está disponible). */
export class MemoryRecStore implements RecStore {
  private rows: Recording[] = [];
  private seq = 0;
  async add(activity: string, blob: Blob, mime: string, at: number): Promise<Recording> {
    const row: Recording = { id: ++this.seq, activity, at, mime, blob };
    this.rows.push(row);
    const drop = new Set(idsToPrune(this.rows.filter((r) => r.activity === activity)));
    this.rows = this.rows.filter((r) => !drop.has(r.id));
    return row;
  }
  async list(activity: string): Promise<Recording[]> {
    return this.rows.filter((r) => r.activity === activity).sort((a, b) => b.at - a.at || b.id - a.id);
  }
  async clearAll(): Promise<void> {
    this.rows = [];
  }
}

const wrap = <T>(req: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

const done = (tx: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });

function open(factory: IDBFactory): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = factory.open(REC_DB, 1);
    req.onupgradeneeded = () => {
      const store = req.result.createObjectStore(REC_STORE, { keyPath: "id", autoIncrement: true });
      store.createIndex("activity", "activity");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** El almacén real. Lanza al usarlo si IndexedDB no está disponible (navegación privada, etc.). */
export function idbRecStore(factory: IDBFactory | undefined = typeof indexedDB !== "undefined" ? indexedDB : undefined): RecStore {
  const db = () => (factory ? open(factory) : Promise.reject(new Error("IndexedDB no disponible")));
  return {
    async add(activity, blob, mime, at) {
      const conn = await db();
      try {
        const tx = conn.transaction(REC_STORE, "readwrite");
        const store = tx.objectStore(REC_STORE);
        const id = (await wrap(store.add({ activity, at, mime, blob }))) as number;
        const rows = (await wrap(store.index("activity").getAll(activity))) as Recording[];
        for (const old of idsToPrune(rows)) store.delete(old);
        await done(tx);
        return { id, activity, at, mime, blob };
      } finally {
        conn.close();
      }
    },
    async list(activity) {
      const conn = await db();
      try {
        const rows = (await wrap(conn.transaction(REC_STORE).objectStore(REC_STORE).index("activity").getAll(activity))) as Recording[];
        return rows.sort((a, b) => b.at - a.at || b.id - a.id);
      } finally {
        conn.close();
      }
    },
    async clearAll() {
      const conn = await db();
      try {
        const tx = conn.transaction(REC_STORE, "readwrite");
        tx.objectStore(REC_STORE).clear();
        await done(tx);
      } finally {
        conn.close();
      }
    },
  };
}
