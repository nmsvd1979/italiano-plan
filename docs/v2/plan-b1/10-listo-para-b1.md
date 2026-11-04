# Frente 10 · Cómo medir «listo para B1» con lo que ya existe

## Qué es
Hoy la app no responde «¿ya puedo empezar B1?». Tiene piezas sueltas (prueba de nivel A2, pruebas de fase, mini-pruebas, tarjetas, panel), pero no un criterio que las junte ni un umbral con sentido para B1. Este frente define **qué luces se miran, con qué umbral y qué falta**, usando solo lo que ya hay más lo que traen los frentes 1, 2 y 9.

## Lo que ya existe (leído en el código)
| Pieza | Dónde | Qué mide | Umbral actual |
|---|---|---|---|
| Prueba de nivel A2 | `LevelTestScreen.tsx`, `evaluation.ts: levelBattery` | 30 ítems: lectura 6, escucha 6, gramática 10, vocabulario 6, producción 2 (autoevaluada) | `PASS_LEVEL` 0,8 (total); `WEAK_AREA` 0,7 por área. **Propios, provisionales** (`11` §4) |
| Pruebas de fase (F1–F5) | `PhaseTestScreen`, `phaseBattery` | mismas 5 áreas por fase | `levelOf`: ≥ 0,8 «Nivel firme», ≥ 0,6 «Casi» |
| Mini-prueba semanal | `miniBattery`, `MiniTestScreen` | 20 ítems de 5 áreas | `PASS_RATIO` / `PASS_MINI` 0,75 |
| Repaso espaciado | `panel.ts: recallRate, activeWords` | recuerdo real de tarjetas | `11` §4: ≥ 80 % con ≥ 2 repasos |
| Panel | `Panel.tsx`, `areaAccuracy` | acierto por área en 30 días | — |
| Registro de actividad | `appendLog` | minutos y aciertos por actividad | — |

## Problemas que impiden usarlas como medida de B1 (medidos o leídos)
1. **La prueba de nivel A2 es A2, no B1:** su batería toma ítems de `pruebas.json`, que se escribieron para unidades A2 y el puente (lectura de ~60–150 palabras).
2. **Mezcla mal las unidades:** `LevelTestScreen` usa `u.n <= 24` (incluye u21–u23, excluye u25–u28). Se corrige en `05`.
3. **La «producción» vale 2 de 30 puntos y es autoevaluada** (`pointsOf`: 3/2/1 → 1/0,5/0): el 6,7 % de la nota es lo que la persona dice de sí misma.
4. **Tamaño de muestra:** 28 ítems objetivos. Aritmética de binomial (no medición de la app): si el dominio real fuera 80 %, la nota observada oscila ±15 puntos (95 %). Una sola prueba no distingue 70 % de 90 %.
5. **No hay ítem B1:** ni lectura larga, ni escucha larga, ni escritura larga (`09`).
6. **El umbral de aprobación del CILS B1 no se pudo abrir** (`_fuentes.md` §2); por eso **ningún umbral de este plan es el del examen**.

## Propuesta: «Panel Listo para B1» (seis luces)
Una pantalla (`#/listo-b1`), enlazada desde el Panel y desde la tarjeta «Ruta» de `05`. Cada luz es verde / ámbar / sin datos. **No es una nota ni un diagnóstico**: es una lista de evidencias.

| # | Luz | Fuente de datos (existente salvo indicación) | Verde cuando | De dónde sale el umbral |
|---|---|---|---|---|
| 1 | A2 firme | prueba de nivel A2, **solo los ítems objetivos** (producción fuera de la nota) | ≥ 0,8 en **dos intentos en días distintos** y ninguna área < 0,7 | `PASS_LEVEL`, `WEAK_AREA` (propios); los dos intentos por el punto 4 |
| 2 | Regularidad semanal | `miniTests` | mini-prueba aprobada (≥ 0,75) a la primera en ≥ 3 de las últimas 4 semanas | `11` §4 (provisional) |
| 3 | Memoria | `recallRate(srs)` | ≥ 0,8 con ≥ 100 respuestas | `11` §4 (provisional); el mínimo de respuestas es mío |
| 4 | Puente | respuestas de u21–u23 en `appendLog` (`mini` de esas semanas) | mini-pruebas de u21, u22 y u23 aprobadas | `PASS_RATIO` |
| 5 | Lectura y escucha largas (**nuevo**, `09`) | `b1:lectura` y `b1:escucha` | ≥ 9 de 12 preguntas en cada una (≥ 0,75) | `PASS_RATIO`; criterio propio |
| 6 | Producción (**nuevo**, `01`, `02`) | `extend` de u21–u23 completo (≥ 80 palabras, sin formas meta faltantes) y 3 monólogos de ≥ 100 s con todos los puntos tachados | las tres tareas escritas y los tres monólogos hechos | criterios propios; **no mide corrección** |

**«Listo» = las seis luces verdes.** Si falta alguna se dice cuál y qué hacer (por ejemplo, área floja → «Practicar más» con ese `area`, `06`). Una luz sin datos nunca cuenta como verde.

**Por qué estos umbrales y no otros.** Los tomo de lo que ya usa el proyecto porque el único externo que podría respaldar uno (el CILS B1) no se pudo abrir. Son **un compromiso razonable, no una validación**: no hay ningún estudio del proyecto que muestre que alguien con estas seis luces verdes aprueba un B1. Para validarlo haría falta un dato que hoy no existe: el resultado de la persona en una prueba B1 externa (por ejemplo, un simulacro oficial publicado) y compararlo con las luces. Hasta entonces el panel lo dice en pantalla («criterio del proyecto, no de un examen»).

## Cómo se arma
**Código (2 PR).**
- **PR 10a (S–M, `fix`/`feat`):** en `evaluation.ts`, `totalOf`/`pointsOf` excluyen `produccion` del puntaje de la prueba de nivel (siguen mostrándose como área autoevaluada); `LevelTestScreen` pide dos intentos para la luz 1 (guarda fecha por intento, ya lo hace `addLevelTest`).
- **PR 10b (M, `feat`):** `domain/readyB1.ts` (función pura `readyB1({levelTests, mini, srs, log, writing, recordings}) → Light[]`) y `features/progress/ReadyB1.tsx`. Reutiliza `getLevelTests`, `recallRate`, `areaAccuracy`, `weakAreas`, `loadLog`, `miniTests`, `AREA_NAME`. El monólogo y el `extend` entran cuando existan (`01`, `02`); hasta entonces esas luces dicen «sin datos».

**Contenido.** Ninguno propio; usa el de `09`. Se podría ampliar la reserva `pruebas.json` con **ítems de lectura/escucha más largos** para la prueba de nivel A2, pero eso es contenido nuevo no incluido en este frente (decisión D9).

## Cómo se verifica el italiano
No hay italiano propio en este frente.

## Tests nuevos
`readyB1.test.ts`: (1) sin datos → todas las luces «sin datos» y no «listo»; (2) una luz roja basta para no estar listo; (3) la producción autoevaluada no suma a la luz 1; (4) dos intentos el mismo día no cuentan como dos; (5) umbrales importados de las constantes de `evaluation.ts`/`cycle.ts`, nunca duplicados; `evaluation.test.ts`: `levelBattery` solo recibe pasos `core`.

## Tamaño y orden
10a → (después de `09` y `01`/`02`) 10b. La luz 1 puede salir antes sola.

## Dependencias
`05` (unidades de la prueba), `09` (lectura y escucha largas), `01`/`02` (producción), `06` («Practicar más» por área).

## Qué no se puede medir
Corrección de lo escrito y de lo hablado, pronunciación, velocidad de comprensión de voces reales, y si las luces predicen un B1. El plan **no inventa** un umbral externo: lo único medible hoy es regularidad, comprensión en preguntas cerradas y memoria.
