// Corre después de `vite build`: falla si el precache del service worker incluye audio o pesa 2 MB o más.
// El audio se baja aparte (gestor de descarga) para que la instalación del service worker casi no pueda fallar.

import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
export const MAX_PRECACHE_BYTES = 2 * 1024 * 1024;

/** URLs del manifiesto de precache que Workbox deja dentro de dist/sw.js. */
export function precacheUrls(swSource) {
  const urls = [];
  for (const m of swSource.matchAll(/\{[^{}]*?url:\s*"([^"]+)"[^{}]*?\}/g)) urls.push(m[1]);
  return urls;
}

export async function measurePrecache(dist = DIST) {
  const sw = await readFile(path.join(dist, "sw.js"), "utf8");
  const urls = precacheUrls(sw);
  let bytes = 0;
  for (const u of urls) bytes += (await stat(path.join(dist, u.split("?")[0]))).size;
  return { urls, bytes };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { urls, bytes } = await measurePrecache();
  const audio = urls.filter((u) => /\.mp3($|\?)|^audio\//.test(u));
  console.log(`precache: ${urls.length} archivos, ${(bytes / 1e6).toFixed(2)} MB`);
  if (urls.length === 0) throw new Error("No se encontró el manifiesto de precache en dist/sw.js");
  if (audio.length) throw new Error(`El precache incluye audio (${audio.length} archivos, p. ej. ${audio[0]})`);
  if (bytes >= MAX_PRECACHE_BYTES) throw new Error(`El precache pesa ${bytes} bytes (límite ${MAX_PRECACHE_BYTES})`);
}
