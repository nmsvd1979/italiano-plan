# Italiano — plan adaptativo de 24 unidades

App personal (una sola persona, sin cuenta, sin servidor) para seguir un plan de italiano de 24 unidades (unos seis meses). Es una PWA: se instala en la pantalla de inicio del iPhone y todo se guarda en el `localStorage` de ese teléfono.

Hecha con Vite + React + TypeScript. Publicada en GitHub Pages: <https://nmsvd1979.github.io/italiano-plan/>

## Qué incluye

| Actividad | Cómo funciona |
|---|---|
| Vocabulario | Quizlet (externo): un set de 5000 palabras y tus tarjetas. Además, ~20 palabras por unidad con audio (nativo donde existe), quiz y botón «Copiar para Quizlet». |
| Gramática | Una lección propia por unidad con regla, contraste con el español, ejemplos con audio y ejercicios con corrección inmediata. Los errados vuelven con repaso espaciado. |
| Pronunciación | Pares mínimos con grabaciones nativas (Lingua Libre) y práctica de repetir en voz alta. |
| Shadowing | Estudio sobre un video de Easy Italian por unidad, con 5 pasos, velocidad, fragmento en bucle y subtítulos que se pueden tapar. |
| Dictado | Frases cortas por unidad: escuchas con la voz italiana del sistema y escribes (la tilde que falta cuenta como «casi»). |
| Escritura guiada | Una consigna por unidad, lista para corregirte tú mismo y un texto modelo que se ve después de escribir. |
| Diálogos | Un diálogo por unidad: lees, escuchas y dices en voz alta tu parte (ves solo la pista en español). |
| Input | Podcasts en Spotify según la fase, con el número de episodio que toca. |
| Checkpoints | Test de fase en las unidades 4, 8, 12, 16, 20 y 24, con puntaje por tema y nivel (firme / casi / a repasar). |
| Progreso | Racha, avance por unidad y fase, ritmo (al día, detrás o adelante), fecha estimada de fin, mapa de calor de 90 días y recordatorio diario. |

## Cómo avanza el plan

No depende del calendario. El currículo es una lista ordenada de actividades: cada unidad tiene 6 sesiones, y la app siempre ofrece la primera actividad pendiente.

- **Faltar un día no pierde nada:** mañana sigue lo mismo.
- **Adelantarse:** en Hoy eliges cuánto tiempo tienes (15, 30, 60 o 90 min) y la app arma el día con lo que sigue; "Si tienes más tiempo" suma más.
- **Dejar algo para después** lo manda a Pendientes (máximo 3 a la vez, las más antiguas primero).
- **Orden garantizado:** la práctica nunca va antes de su lección, y el test de fase espera a todas las lecciones de su fase.
- **Ritmo y proyección:** en Ajustes eliges cuántas sesiones por semana quieres sostener; Hoy dice si vas al día y estima la fecha de fin con tu ritmo real de las últimas dos semanas.
- **Unidades "pronto":** figuran en el Plan, pero el flujo diario las salta hasta que tengan contenido.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173/italiano-plan/
npm test         # lógica, contenido de gramática y audio
npm run build    # tsc + build de producción en dist/
```

Para abrirla desde el celular en la misma red: `npm run dev -- --host`.

## Dónde está cada cosa

```
src/content/curriculum.ts      las 24 unidades, fases, objetivos "puedo…" y las 6 sesiones de cada una
src/content/plan.ts            catálogo de actividades y recursos externos (editable a mano)
src/content/grammar/           una lección por unidad
src/content/vocab.json, dictation.ts, writing.ts, dialogues.ts   vocabulario, dictados, escritura y diálogos por unidad
src/content/pronunciation/     units.json (pares y palabras) + manifest.json (audio, generado)
src/content/shadowing.ts       videos por unidad y pasos del protocolo
src/domain/                    lógica pura con tests (motor del plan, ritmo, racha, repaso, tests de fase)
src/features/                  pantallas
src/theme/                     tokens de color y estilos (claro y oscuro)
scripts/fetch-lingualibre.mjs  baja el audio nativo y genera las atribuciones
```

Para cambiar actividades, minutos o links se edita `src/content/plan.ts`; para agregar una unidad, `src/content/curriculum.ts` (con `ready: true` cuando tenga lección, pronunciación y shadowing).

## Audio

Las grabaciones de pronunciación son de [Lingua Libre](https://lingualibre.org/) (Wikimedia Commons, licencia CC BY-SA 4.0). Los créditos de cada archivo están en `public/audio/ATTRIBUZIONI.md`. Para agregar palabras: súmalas a `units.json` (pronunciación) o a `vocab.json` (vocabulario) y corre `npm run audio`; el script es idempotente y regenera los créditos de todos los archivos.

## Publicación

Cada push a `main` corre los tests, hace el build y publica con GitHub Actions (`.github/workflows/deploy.yml`). En el repositorio, GitHub Pages debe estar en *Source: GitHub Actions*.

## Limitaciones conocidas

- El recordatorio usa la Notification API: solo funciona con la app abierta o en segundo plano. No hay servidor que envíe avisos, así que con la app cerrada no llega nada.
- Los datos viven solo en el navegador del teléfono: borrar los datos del sitio o desinstalar la app borra el progreso.
- Los links a Quizlet y Spotify abren la app instalada solo si esas apps lo permiten; no se usan esquemas nativos.

## Sobre el contenido

Gramática, pronunciación y shadowing se diseñaron a partir de investigación en adquisición de segundas lenguas (instrucción explícita, práctica espaciada y mezclada, entrenamiento perceptivo con varias voces, shadowing con material comprensible) y del sílabo oficial de italiano L2 (QCER / CLIQ).
