# Italiano — plan de italiano A0→A2 (28 unidades)

App personal (una sola persona, sin cuenta, sin servidor) para aprender italiano de cero a A2, con un puente opcional a B1. Es una PWA: se instala en la pantalla de inicio del iPhone y todo se guarda en el `localStorage` de ese teléfono.

Hecha con Vite + React + TypeScript. Publicada en GitHub Pages: <https://nmsvd1979.github.io/italiano-plan/>

## Qué incluye

| Actividad | Cómo funciona |
|---|---|
| Ciclo de 7 días | Cada semana del curso (35: 32 del núcleo y 3 del puente a B1) sigue siete días: entrar, regla, practicar, hablar, leer y escuchar, producir y consolidar. Cada bloque tiene su duración; los esenciales son ~108 de los ~188 min de la semana. |
| Repaso espaciado | Tarjetas propias con `ts-fsrs`: palabras de la unidad (reconocer y escribir), y las frases que fallaste (completar, dictado). Hasta 8 palabras nuevas por día. |
| Palabras | Día 1: las palabras de la unidad. Días 3 a 5: la ampliación con frase de ejemplo. |
| Gramática | Una lección por unidad (partida en semana A y B en siete), con regla, contraste con el español, ejemplos con audio y ejercicios con corrección inmediata. Práctica guiada y práctica sin pista (12 ejercicios por unidad). |
| Pronunciación | Un contraste nuevo por semana: pares mínimos con grabaciones nativas (Lingua Libre) y repetir y comparar con tu grabación. |
| Dictado, lectura, escritura | Dictado de 10 frases por unidad con tres niveles, un texto graduado con preguntas por semana y escritura guiada con corrección. |
| Diálogos y shadowing | Un diálogo por unidad (escuchar, repetir, hacer un papel y grabarte) y shadowing con las líneas del diálogo y del texto; el de video de YouTube es un extra. |
| Pruebas | Mini-prueba semanal (≥ 75 % para avanzar), test de fase y prueba de nivel A2, con una reserva de ítems distintos de los de práctica. |
| Audio | Clips de voz sintética Serena para las frases y grabaciones nativas para las palabras; sin ninguno, la voz italiana del sistema. Se baja aparte para usar la app sin conexión. |
| Progreso | Racha, avance por unidad y fase, mapa de calor, copia de seguridad y «Tu punto de partida» para quien ya estudió. |

## Cómo avanza el plan

No depende del calendario: la app siempre ofrece el primer día pendiente. Faltar un día no pierde nada.

- **Modo corto:** solo los bloques esenciales. «Hacer más hoy» suma el día siguiente.
- **Mini-prueba:** si no se aprueba, se agregan dos días de repaso dirigido y otra versión de la prueba.
- **Continuidad:** quien ya marcó unidades en la versión anterior no las repite; las unidades nuevas (u25–u28) se cierran en versión comprimida.
- **Contenido:** las 28 unidades están activas. Pendientes de verificar a mano: el audio de los clips, el italiano con fuentes (`docs/dudas-italiano.md`) y los videos de shadowing. La auditoría más reciente está en `docs/v2/auditoria/_final.md`.

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
src/content/curriculum.ts      las 28 unidades, fases y objetivos "puedo…"
src/content/course.ts          las 35 semanas del curso (orden y partes A/B)
src/domain/cycle.ts            el ciclo de 7 días, el modo corto y las reglas de avance
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

Las grabaciones de pronunciación son de [Lingua Libre](https://lingualibre.org/) (Wikimedia Commons, licencia CC BY-SA 4.0). Los créditos de cada archivo están en `public/audio/ATTRIBUZIONI.md`. Las palabras que aún no tienen grabación están en `AUDIO_PENDING` (`src/content/pronunciation/index.ts`) y se leen con la voz del sistema: corre `npm run audio` en tu computador y quita de esa lista las que ya tengan archivo (el test te avisa). Para agregar palabras: súmalas a `units.json` (pronunciación) o a `vocab.json` (vocabulario) y corre `npm run audio`; el script es idempotente y regenera los créditos de todos los archivos.

## Shadowing sin video verificado

Para las unidades que no figuran en `SHADOWING` (`src/content/shadowing.ts`) la pantalla ofrece una búsqueda guiada en YouTube y pide pegar el link del video elegido. Cuando verifiques un video con oEmbed, agrégalo a `SHADOWING` y quita la unidad de `SHADOWING_SEARCH`.

## Revisión del italiano

`npx vite-node scripts/export-revision.ts` genera `docs/revision-italiano.md` (todo el italiano de la app, con instrucciones para un revisor nativo) y un archivo por fase. Se vuelve a generar cada vez que cambia el contenido.

## Publicación

Cada push a `main` corre los tests, hace el build y publica con GitHub Actions (`.github/workflows/deploy.yml`). En el repositorio, GitHub Pages debe estar en *Source: GitHub Actions*.

## Limitaciones conocidas

- El recordatorio usa la Notification API: solo funciona con la app abierta o en segundo plano. No hay servidor que envíe avisos, así que con la app cerrada no llega nada.
- Los datos viven solo en el navegador del teléfono: borrar los datos del sitio o desinstalar la app borra el progreso.
- Los links a Quizlet y Spotify abren la app instalada solo si esas apps lo permiten; no se usan esquemas nativos.

## Sobre el contenido

Gramática, pronunciación y shadowing se diseñaron a partir de investigación en adquisición de segundas lenguas (instrucción explícita, práctica espaciada y mezclada, entrenamiento perceptivo con varias voces, shadowing con material comprensible) y del sílabo oficial de italiano L2 (QCER / CLIQ).
