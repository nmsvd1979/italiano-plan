# italiano-plan — guía para Claude Code

App personal para aprender italiano (A0→A2) de un hispanohablante chileno. PWA instalada en iPhone.

## Stack y comandos
- Vite + React 19 + TypeScript + vite-plugin-pwa. Rutas con hash (`#/gramatica/u16`, `#/practica`, `#/shadowing`…).
- Datos del usuario solo en `localStorage` (`italianPlan.*`). No hay backend.
- `npm ci` · `npm test` (Vitest, ~328 tests) · `npm run build` · `npm run audio` (baja grabaciones de Lingua Libre, CC BY-SA 4.0).
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

## Audio y licencias
- Grabaciones: Lingua Libre (CC BY-SA 4.0). Mantener `public/audio/ATTRIBUZIONI.md` al día. Si se agrega voz sintética, marcarla como sintética y registrar la licencia del modelo.
- Respaldo en la app: `speak()` con la voz del sistema `it-IT`.

## Cosas que NO hacer
- No borrar progreso del usuario ni cambiar las claves de `localStorage` sin migración.
- No agregar servicios de pago, cuentas ni rastreo.
- No marcar como verificado algo que no se probó (videos, audios, iPhone).
