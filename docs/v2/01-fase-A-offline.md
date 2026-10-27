# Fase A — Que la app cargue sin conexión en el iPhone

## Síntoma
Sin conexión, en el iPhone, «simplemente no cargaba la app». No hubo error visible ni pantalla parcial.

## Lo que se sabe y lo que no
- Verificado (Chromium, `vite preview`, sin red): el service worker se registra, 600 archivos quedan en caché, todas las rutas y un mp3 cargan. El fallo del iPhone no se reprodujo.
- Verificado en el código: `vite.config.ts` precachea 605 archivos (~10,5 MB, 588 mp3) en la instalación; `registerType: "autoUpdate"`; el `sw.js` generado incluye `NavigationRoute` hacia `index.html`, `skipWaiting` y `clientsClaim`.
- No verificado (hipótesis, en orden de probabilidad):
  1. **La instalación del service worker nunca terminó.** La precarga de Workbox es de todo o nada: si una de las ~605 peticiones falla, se corta o iOS suspende el worker (por ejemplo, al cerrar la app o bloquear el teléfono durante la descarga con datos móviles), el worker no se instala y no queda nada en caché. «No cargaba» encaja con esto.
  2. Se abrió la app instalada sin haber completado una primera carga con conexión.
  3. Desalojo del almacenamiento por iOS tras días sin uso (en apps instaladas en pantalla de inicio la regla de 7 días de WebKit no debería aplicar; no verificado).
  4. Estado antiguo atascado de una versión previa del service worker.
- Riesgo adicional no verificado: Safari pide audio con peticiones `Range`; si el service worker responde un archivo completo (200) sin soportar rangos, el audio puede no reproducirse sin conexión aunque la app cargue.

## Diseño

### A1. Separar la app del audio
- `workbox.globPatterns`: `["**/*.{js,css,html,woff2,png,webmanifest}"]` y `globIgnores: ["audio/**"]`. La precarga queda en ~0,7 MB y la instalación casi no puede fallar.
- Audio: `workbox.runtimeCaching` con
  - `urlPattern: ({url}) => url.pathname.startsWith("/italiano-plan/audio/")`
  - `handler: "CacheFirst"`
  - `options: { cacheName: "audio-v1", rangeRequests: true, cacheableResponse: { statuses: [200] } }`
  - sin `expiration` (no se debe borrar solo).
  `cacheName` fijo y distinto del precache: `cleanupOutdatedCaches` no lo toca en las actualizaciones.

### A2. Gestor de descarga («Usar sin conexión»)
Nuevo `src/app/offlineAudio.ts` + tarjeta en Ajustes y banner en Hoy la primera vez.
- Lista de audios: generada en el build a `public/audio-index.json` (`[{url, bytes, unit}]`) por un script `scripts/build-audio-index.mjs` que se ejecuta en `prebuild`. La lista de verdad es el índice, no una constante a mano.
- Descarga desde la página (no desde el worker): por lotes de 4 en paralelo, `fetch(url)` → `cache.put(url, response)` en `caches.open("audio-v1")`. Reintento 3 veces con espera creciente. Se puede pausar y reanudar: se calcula lo que falta comparando el índice con `cache.keys()`.
- Orden: primero la unidad actual y la siguiente, luego el resto.
- Progreso visible: «Audio: 312 de 588 · 5,4 MB». Estado final «Todo listo para usar sin conexión».
- Antes de empezar: `navigator.storage.estimate()` y, si hay poco espacio, avisar. Pedir `navigator.storage.persist()` (ya está en `src/app/persist.ts`) al terminar y mostrar el resultado.
- Si falta un audio sin conexión: `speak()` con la voz del sistema como respaldo (ya existe) y marca discreta «voz del sistema».

### A3. Estado y diagnóstico visibles
Ampliar `useOfflineStatus()` con tres indicadores en Ajustes: (1) app instalada y controlada por el service worker, (2) audio descargado X/Y, (3) almacenamiento persistente sí/no. Un botón «Copiar diagnóstico» que copia al portapapeles: versión, fecha de build, estado de los tres indicadores, `navigator.onLine`, user agent, `caches.keys()` y su tamaño. Sirve para que el usuario pegue el resultado si algo falla.

### A4. Pantalla de rescate si no carga
En `index.html`, antes del bundle, un script mínimo en línea: si en 10 s `#root` sigue vacío, mostrar texto «No pude cargar la app. Si estás sin conexión, ábrela una vez con internet y espera el mensaje “Listo para usar sin conexión”.» Así un fallo ya no se ve como pantalla en blanco.

### A5. Actividades que necesitan internet
Marcar con etiqueta «Necesita internet» el shadowing con YouTube, los podcasts y cualquier enlace externo (ya hay `src/app/links.ts`). Sin conexión: mostrar la etiqueta y un aviso en vez de un frame roto. Estas actividades pasan a «extras» (ver `04`).

### A6. Actualizaciones
Mantener `autoUpdate`, pero no recargar con una sesión de ejercicios abierta: usar `registerSW` con `onNeedRefresh` y aplicar la actualización al volver a Hoy. Probar que una versión nueva no vacía `audio-v1`.

## Pruebas automáticas
- Unitarias: cálculo de lo que falta por descargar (dado un índice y un conjunto de claves en caché), reintentos, orden de prioridad.
- Build: un test que falla si el precache incluye algún `.mp3` o supera 2 MB, y si `audio-index.json` no coincide con `public/audio`.
- Playwright con Chromium (patrón del repo): instalar, descargar audio, pasar a offline, recargar, recorrer rutas, reproducir un mp3 con petición Range (comprobar respuesta 206).

## Prueba obligatoria en el iPhone (la hace el usuario; sin ella no se cierra la fase)
**Variante que no toca tu progreso (recomendada, decisión del 27-oct):**
1. En la app instalada: Ajustes → copia de seguridad → exportar (queda el archivo como seguro). No borres datos del sitio.
2. Prueba de «instalación desde cero» en una **pestaña de Safari** (no en el icono): según WebKit, la app de la pantalla de inicio y Safari guardan datos por separado, así que esa prueba no mueve tu avance. Sigue los pasos 3 a 5 de abajo en esa pestaña (en una pestaña no hay «modo avión con la app cerrada»: cierra Safari del todo y ábrelo sin red).
3. Si funciona, actualiza el icono instalado sin desinstalarlo: ábrelo con internet, vuelve a Hoy y toca «Usar sin conexión» para bajar el audio. Tu progreso queda en su sitio porque no se borra nada.
4. Si algo falla o quieres confirmar que el icono instalado funciona en frío, usa la variante de abajo (esa **sí** borra los datos; solo con copia exportada).

**Variante desde cero (borra todo; solo con copia exportada):**
1. Desinstalar el icono antiguo. En Ajustes de iPhone → Safari → Avanzado → Datos de sitios web, borrar `nmsvd1979.github.io`.
2. Abrir la dirección en Safari con Wi-Fi, «Añadir a pantalla de inicio», abrir desde el icono.
3. Dejar la app abierta y con la pantalla encendida hasta ver «Listo para usar sin conexión» y el audio completo.
4. Modo avión. Cerrar la app del todo (deslizar). Abrirla de nuevo.
5. Recorrer una sesión completa: lección, ejercicios, audio de una palabra, pronunciación, dictado.
6. Repetir el paso 4 al día siguiente y a los 7 días.
7. Si algo falla: Ajustes → «Copiar diagnóstico» y pegarlo a Claude.

## Criterios de aceptación
- Precache < 2 MB y sin mp3.
- Con el audio descargado, todo el contenido de estudio funciona en modo avión tras cerrar y reabrir la app.
- Una descarga interrumpida se reanuda sin empezar de cero.
- El audio se reproduce sin conexión en iPhone (comprobado por el usuario) o queda documentado qué falla.
