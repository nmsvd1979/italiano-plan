# Auditoría final · 2. Offline y PWA (4-nov-2026, `main` en f3d1fc6)

Mismo formato que `_backlog.md`. Lo comprobado fue con `npm run build`, `npm run test:e2e` (Chromium, `vite preview`) y scripts de cruce de archivos. **Nada se probó en Safari/iPhone** (ni la instalación en pantalla de inicio, ni el límite de caché de iOS, ni el comportamiento de `Range` en Safari): eso va a la lista «solo en el iPhone» de `_final.md`.

## Lo comprobado
| Comprobación | Resultado |
|---|---|
| Precache < 2 MB y sin mp3 | `postbuild`: **23 archivos, 1,44 MB** (límite 2 MB). e2e 1/4 lo confirma contra el service worker real. |
| Descarga de audio y uso sin conexión | e2e 2/4: descarga todo `audio-index.json` a `audio-v1`, cierra, desconecta y abre rutas con hash y audio con `Range`. e2e 3/4: una descarga cortada se reanuda. e2e 4/4: pantalla de rescate si la app no arranca. **4 de 4 pasan.** |
| Coherencia de los tres índices de audio | `public/audio-index.json` (588 nativos + 997 clips = 1.585 entradas, 24,4 MB: 10,3 nativos + 14,1 clips), `public/audio/tts/index.json` (997), `src/content/ttsClips.json` (997): **idénticos ids, ningún archivo faltante ni huérfano** (588 mp3 nativos en disco = 588 del índice = todos los del `manifest.json`; 997 mp3 en `tts/` = 997 ids). Ninguna entrada del índice sin `unit`. |
| Texto ↔ clip | `scripts/tts/frases.json`: 997 frases + 5 excluidas (sin confirmar o no italianas); el id de cada clip es el sha1 del texto normalizado y coincide con `ttsId()` de la app (lo vigila `src/ui/tts.test.ts`). |
| Rutas con hash | `route.ts` no necesita servidor: `#/…` con parámetros; las rutas desconocidas caen en Hoy (`App.tsx` devuelve `<Today />`). El e2e abre rutas sin conexión. |
| Licencias | `public/audio/ATTRIBUZIONI.md` (601 líneas) menciona CC BY-SA 4.0 (Lingua Libre) y la voz Serena/Piper (CC BY 4.0). No se revisó línea por línea contra cada archivo. |

## Hallazgos
| id | Hallazgo | Evidencia | Propuesta | Sev. |
|---|---|---|---|---|
| F-pwa-01 | **Nombre y descripción de la app dicen «24 unidades»** (instalada en la pantalla de inicio, título de pestaña y metadatos). Hoy son 28 unidades (32 semanas + 3 del puente). | `vite.config.ts:43-45`, `index.html:6-7`. | «Italiano — Plan de italiano A0→A2» (sin cifra) y regenerar. | L |
| F-pwa-02 | **`audio-v1` nunca se limpia.** No hay `cache.delete` en `offlineAudio.ts`; si cambia el texto de una frase, el clip nuevo se descarga y el viejo (otro sha1) queda para siempre; si se regraba un mp3 con el mismo nombre, `CacheFirst` y la comprobación por URL (`missingAudio`) sirven el viejo. | `src/app/offlineAudio.ts` (solo `listeners.delete`). Hoy el efecto es solo espacio (24,4 MB vigentes). | Al terminar una descarga, borrar de `audio-v1` las URL que ya no estén en `audio-index.json`; si se cambia un mp3 con el mismo nombre, renombrarlo o versionar la caché (`audio-v2`). | M |
| F-pwa-03 | **La actualización solo se aplica en Hoy** (`isSafeToUpdate`). Es una decisión consciente (no recargar con una sesión abierta). Sin comprobación periódica: en una PWA de iPhone que queda suspendida días, la versión nueva se detecta al abrir en frío. | `src/app/updates.ts`; `registerType: "prompt"`. No probado en iPhone. | Aceptable; solo documentarlo para quien espere ver cambios al instante. | L |
| F-pwa-04 | **El orden de descarga de audio usa `vocab.json` y no incluye el vocabulario de u25–u28** (viven en `src/content/nuevas/`). Las grabaciones nativas de sus palabras quedan con la unidad de pronunciación o `""`. Todas las entradas hoy tienen unidad, así que no se ve; solo afecta a la prioridad «primero lo que toca». | `scripts/build-audio-index.mjs:23-27`. | Incluir `nuevas` en el cálculo de `unitOfWord`. | L |
| F-pwa-05 | **Ruta de caché de audio fija** (`/italiano-plan/audio/` en `runtimeCaching`). Funciona porque `base` es `/italiano-plan/`; si se cambia el nombre del repositorio hay que cambiar dos sitios (`base` y el patrón). | `vite.config.ts:10,23`. | Derivar el patrón de `base`. | L |
| F-pwa-06 | **Audio fuera de línea con descarga incompleta**: la app cae a la voz del sistema si el archivo no está (`sayThrough`), pero no hay aviso de «faltan N archivos» fuera de Ajustes/Hoy, y la voz del sistema puede no ser italiana (ver F-cod-04 para el caso de red colgada). | `sayThrough` en `src/ui/speech.ts:236-251`. | Mantener el aviso «voz del sistema» (`SystemVoiceHint`). | L |

## Pendiente de ver en el iPhone
Instalación como PWA, cuota de caché de iOS con ~26 MB (precache + audio), `Range` en Safari con los clips de Serena, persistencia (`navigator.storage.persist`), comportamiento tras días sin abrir, y que el service worker tome el control en el primer arranque sin conexión.
