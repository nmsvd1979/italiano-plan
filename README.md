# Italiano — plan de 12 semanas

App personal (una sola persona, sin cuenta, sin servidor) para seguir un plan de italiano de 12 semanas. Es una PWA: se instala en la pantalla de inicio del iPhone y todo se guarda en el `localStorage` de ese teléfono.

Hecha con Vite + React + TypeScript. Publicada en GitHub Pages: <https://nmsvd1979.github.io/italiano-plan/>

## Qué incluye

| Actividad | Cómo funciona |
|---|---|
| Vocabulario | Quizlet (externo): un set de 5000 palabras y tus tarjetas. |
| Gramática | 12 lecciones propias (una por semana) con regla, contraste con el español, ejemplos con audio y ejercicios con corrección inmediata. Los errados vuelven con repaso espaciado. |
| Pronunciación | Pares mínimos con grabaciones nativas (Lingua Libre) y práctica de repetir en voz alta. |
| Shadowing | Estudio sobre un video de Easy Italian por semana, con 5 pasos, velocidad, fragmento en bucle y subtítulos que se pueden tapar. |
| Input | Podcasts en Spotify según la fase. |
| Checkpoints | Test de fase en las semanas 4, 8 y 12, con puntaje por tema. |
| Progreso | Racha, progreso semanal y por fase, mapa de calor de 90 días y recordatorio diario. |

La fecha de inicio es lo único que se configura: semana, fase y rutina de cada día se calculan solos.

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
src/content/plan.ts            fases, rutina semanal, recursos externos (editable a mano)
src/content/grammar/           una lección por semana
src/content/pronunciation/     weeks.json (pares y palabras) + manifest.json (audio, generado)
src/content/shadowing.ts       videos por semana y pasos del protocolo
src/domain/                    lógica pura con tests (fechas, plan, racha, repaso, tests de fase)
src/features/                  pantallas
src/theme/                     tokens de color y estilos (claro y oscuro)
scripts/fetch-lingualibre.mjs  baja el audio nativo y genera las atribuciones
```

Para cambiar el plan (actividades, minutos, links) se edita `src/content/plan.ts`; la lógica no hace falta tocarla.

## Audio

Las grabaciones de pronunciación son de [Lingua Libre](https://lingualibre.org/) (Wikimedia Commons, licencia CC BY-SA 4.0). Los créditos de cada archivo están en `public/audio/ATTRIBUZIONI.md`. Para agregar palabras: súmalas a `weeks.json` y corre `npm run audio`.

## Publicación

Cada push a `main` corre los tests, hace el build y publica con GitHub Actions (`.github/workflows/deploy.yml`). En el repositorio, GitHub Pages debe estar en *Source: GitHub Actions*.

## Limitaciones conocidas

- El recordatorio usa la Notification API: solo funciona con la app abierta o en segundo plano. No hay servidor que envíe avisos, así que con la app cerrada no llega nada.
- Los datos viven solo en el navegador del teléfono: borrar los datos del sitio o desinstalar la app borra el progreso.
- Los links a Quizlet y Spotify abren la app instalada solo si esas apps lo permiten; no se usan esquemas nativos.

## Sobre el contenido

Gramática, pronunciación y shadowing se diseñaron a partir de investigación en adquisición de segundas lenguas (instrucción explícita, práctica espaciada y mezclada, entrenamiento perceptivo con varias voces, shadowing con material comprensible) y del sílabo oficial de italiano L2 (QCER / CLIQ).
