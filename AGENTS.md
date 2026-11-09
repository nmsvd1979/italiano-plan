# italiano-plan — guía para Codex

App personal para aprender italiano (A0→A2) de un hispanohablante chileno. PWA instalada en iPhone. 28 unidades en 35 semanas (32 del núcleo + 3 del puente a B1); cada semana sigue el ciclo de 7 días de `src/domain/cycle.ts`.

## Stack y comandos
- Vite + React 19 + TypeScript + vite-plugin-pwa. Rutas con hash (`#/gramatica/u16`, `#/practica`, `#/shadowing`…).
- Datos del usuario solo en `localStorage` (`italianPlan.*`). No hay backend.
- `npm ci` · `npm test` (Vitest, ~1.440 tests) · `npm run build` · `npm run audio` (baja grabaciones de Lingua Libre, CC BY-SA 4.0).
- `npm run test:e2e` (Playwright + Chromium, prueba el build real sin conexión; primera vez: `npx playwright install chromium`).
- Sin conexión: el precache del service worker es solo la app (<2 MB, sin mp3; `postbuild` lo comprueba). El audio se baja aparte a la caché `audio-v1` desde Ajustes, según `public/audio-index.json` (lo genera `prebuild` y `npm run audio`).
- Despliegue: GitHub Pages en cada push a `main` (el CI corre tests y build).

## Reglas de git (obligatorias)
- NUNCA hacer push directo a `main`: publica la app al instante. Trabajar en una rama `feat/…` o `fix/…` y abrir pull request.
- Un tema por pull request. Mensajes de commit en español, claros.
- Antes de abrir el PR: `npm test` y `npm run build` en verde.

## Idioma
- Texto de la interfaz y explicaciones: español neutro con tuteo. Sin voseo ni regionalismos (`lang.test.ts` lo vigila).
- Contenido en italiano: no inventar. Si hay duda, anotarla en `docs/dudas-italiano.md` en vez de "arreglarla" a ojo.

## Restricciones del contenido (las verifican los tests)
- Lección: ≥5 ejemplos, ≥3 ítems "notice", ≥10 ejercicios. Ejercicio `fill`: exactamente un `___`; la pista entre paréntesis no puede contener la respuesta. Cada respuesta debe calificarse como correcta.
- Sin `**…*x*…**` anidado ni asteriscos sueltos.
- Vocabulario 18–24 ítems por unidad; dictado ≥5; escritura `minChars` ≤120; diálogo ≥6 líneas con roles A/B.
- Cada palabra de pronunciación necesita audio nativo o estar en `AUDIO_PENDING`; cada palabra de un par mínimo necesita entrada en GLOSS.
- Práctica sin pista: 12 por unidad (2 ordenar, 3 traducir, 2 corregir, 2 transformar, 2 diálogo, 1 oído; 6 por semana en unidades partidas). Lectura: un texto por semana con 4 preguntas (3 de opción múltiple y 1 breve). Pruebas: 3 de lectura, 3 de escucha y 4 de gramática por semana. Los ítems de las unidades partidas (u02, u03, u05, u06, u07, u14, u15) se reparten en `src/content/partes.ts`.

## Audio y licencias
- Grabaciones: Lingua Libre (CC BY-SA 4.0). Mantener `public/audio/ATTRIBUZIONI.md` al día. Si se agrega voz sintética, marcarla como sintética y registrar la licencia del modelo.
- Frases: voz sintética Piper `it_IT-serena-high` (CC BY 4.0, decisión en `docs/v2/decision-voz.md`), clips en `public/audio/tts/<sha1[0..12]>.mp3`. `npm run tts:extraer` arma `scripts/tts/frases.json` (respeta `scripts/tts/exclusiones.json`, las frases sin confirmar de `docs/dudas-italiano.md`); `npm run tts:generar -- --modelo <it_IT-serena-high.onnx>` genera solo lo que cambió. Si cambias un texto en italiano, vuelve a correr ambos y commitea los clips.
- `say(texto)` (`src/ui/speech.ts`): clip de la frase → grabación nativa de la palabra suelta → voz del sistema `it-IT` (muestra «voz del sistema»). `playModel` (`src/ui/modelAudio.ts`, rol, shadowing propio y comparar) usa el mismo orden: archivo nativo, clip, voz del sistema.

## Cosas que NO hacer
- No borrar progreso del usuario ni cambiar las claves de `localStorage` sin migración.
- No agregar servicios de pago, cuentas ni rastreo.
- No marcar como verificado algo que no se probó (videos, audios, iPhone).
