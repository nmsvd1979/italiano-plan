# Reparto de tareas: Claude en el chat y Claude Code en el Mac

Fecha: 27-oct-2026. Esta página define **quién hace cada pull request** del orden de `11-plan-maestro-vivo.md` §3 y cómo se coordinan, para que no se pisen.

## 1. Criterio (por qué este reparto)
Es el mismo modelo en los dos lados; lo que cambia es **lo que cada entorno puede tocar**, no la inteligencia:

| | Claude en el chat (nube) | Claude Code en el Mac |
|---|---|---|
| Ve la app funcionando y en un iPhone | No (puede capturar el navegador de la nube, pero no el iPhone ni Safari) | Sí: servidor local, Safari, simulador si hay Xcode, ve la interfaz |
| Internet | Lista restringida (npm, GitHub, algunas páginas) | Completo (voces de Piper, Lingua Libre, YouTube) |
| Contexto del proyecto | Toda la auditoría, el temario, las fuentes y las decisiones de esta conversación | Solo lo que lea del repo (`CLAUDE.md`, `docs/v2/`) |
| Costo de equivocarse | Bajo en contenido (se corrige en un PR) | Alto en código de interfaz si no lo ve |

Conclusión: **un solo dueño por carpeta** para evitar conflictos y para que la arquitectura sea coherente.
- **Código de la app (`src/` excepto `src/content/`, `vite.config.ts`, el service worker, estilos, interfaz): Claude Code.** Es quien ve la pantalla, prueba el flujo real y mantiene un diseño ordenado y consistente.
- **Contenido y verificación (`src/content/**`, datos de curso, `docs/`, `scripts/` de verificación): Claude en el chat.** Es quien tiene el hilo lingüístico y de fuentes, y quien escribe el temario ya decidido.

## 2. Reparto por pull request
| # | Carril | Contenido | Dueño | Cómo se hace |
|---|---|---|---|---|
| 1 | A | Offline | **Code** | Prompt A (`10`). Necesita servidor local, service worker, red real. Tú pruebas en iPhone. |
| 2 | H1 | `course.ts`, partes A/B, claves v2, backup v2 | **Code** | Prompt H1. Yo dejo el esquema en `13` §4 y `14` §7; Code lo implementa y escribe las pruebas de migración con los tres respaldos sintéticos. |
| 3 | G0 | Correcciones de la auditoría (3 PR) | **Chat** | Contenido con fuente (`_verificacion.md`). |
| 4 | B | SRS (`ts-fsrs`) | **Code** | Prompt B. Lógica + interfaz de tarjetas. |
| 5 | G1 | u25–u28 (4 PR) | **Chat** | Mismo formato que las unidades actuales; pasan los tests de contenido. |
| 6 | G2 | Partición A/B (datos) | **Chat** | Después de H1 (usa `parts`). |
| 7 | D | Ciclo de 7 días, modo corto, «Hacer más hoy» | **Code** | Prompt D. Es el corazón de la interfaz diaria. |
| 8 | H2 | Continuidad (punto de partida, diagnóstico, siembra) | **Code** | Prompt H2. El banco de ítems del diagnóstico lo etiqueto yo (A/B, nivel) en un PR de contenido. |
| 9–12 | G3–G7 | Vocabulario, textos graduados, práctica, pronunciación, puente B1, u20, u24 | **Chat** | En lotes por PR; cada uno con informe V1/V2. |
| 13 | E | Producción (dictado por niveles, escritura, grabar, shadowing propio) | **Code** | Prompt E. Micrófono y IndexedDB: solo se prueban en el dispositivo. |
| 14 | F | Evaluación (mini-prueba, fase, nivel A2, panel) | **Code** | Prompt F. Los ítems de prueba los escribo yo (G). |
| 15 | G-R | Segunda pasada independiente | **Chat, en una sesión nueva** | Que no vea el borrador original (independencia real). |
| 16 | C1 | Prueba A/B de voz | **Code** | Descarga las voces (internet completo). Tú escuchas y eliges. |
| 17 | C2 | Audio en lote, reproductor, selector | **Code** | Solo de lo que pasó G-R y no figura en `dudas-italiano.md`. |

**Además, siempre:**
- **Chat revisa cada PR de Code** contra la especificación (`01`–`06`): lee el diff con la API de GitHub, corre pruebas y lista desviaciones. Es la segunda mirada independiente.
- **Code revisa cada PR de contenido** en lo que solo él ve: cómo se ve la unidad en la app (lecciones largas, tablas que se desbordan en pantalla de iPhone, orden de bloques).
- **Chat mantiene `docs/v2/`** (plan, registro de cambios, prompts) y atiende tus informes de uso.

## 3. Reglas para no pisarnos
1. **Fuente de verdad: `main`.** Cada uno hace `git pull` antes de empezar y trabaja en su rama (`fix/…`, `feat/…`, `contenido/…`, `docs/…`). Nunca push a `main`.
2. **Carpetas separadas:** Code no edita `src/content/**` salvo para adaptar un tipo (y lo avisa en el PR); Chat no edita `src/` fuera de `content/`.
3. **Contratos primero:** si un cambio de código necesita un campo nuevo en el contenido (o al revés), el esquema se escribe en `docs/v2/` y se fusiona **antes** del código que lo usa.
4. **Un tema por PR** (`CLAUDE.md`). Todo PR trae `npm test` y `npm run build` en verde, y dice qué verificó y qué no.
5. **El registro de cambios** (`11` §8) lo actualiza quien cambie el plan.
6. **Dudas de italiano** van a `docs/dudas-italiano.md`; una frase «sin confirmar» no recibe audio.
7. **Cada PR de Code termina con una lista corta de pruebas para ti** en el iPhone (qué abrir, qué debería pasar, qué reportar).

## 4. Qué haces tú
Fusionar PR, probar en el iPhone lo marcado, escuchar la prueba de voces (C1) y pegar en Claude Code el prompt del carril que toque. Nada más.

## 5. Primeros pasos
1. **Code:** Prompt A (offline). Es el único con riesgo técnico real y lo que te impide hoy usar la app sin conexión.
2. **Chat, en paralelo:** G0, primera tanda (8 unidades).
3. Cuando A esté fusionado: **Code** toma H1 (Prompt H1) y **Chat** sigue con G0 y G1.

## 6. Nota sobre los prompts de `10`
Los prompts **A, B, C1, C2, D, E, F, H1 y H2** son los que pegas en Claude Code. Los **G0–G7** y **G-revisión** quedan como especificación de los carriles de contenido: los ejecuta Claude en el chat (G-revisión, en una sesión nueva). Si algún día prefieres que Code haga un lote de contenido, el mismo prompt sirve.
