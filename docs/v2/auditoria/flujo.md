# Auditoría final · 4. Flujo de estudio (4-nov-2026, `main` en f3d1fc6)

Mismo formato que `_backlog.md`. **Qué es esto:** una simulación con el motor real (`todaySlots`, `blockDone`, `dayComplete`, `weekComplete`, `remedialDays`, `courseWithContinuity`, `buildQueue`, `applyReview` de `ts-fsrs`), no una estimación. Scripts: `medicion/sim.ts` (progreso nuevo, con 15/30/60/90/120 min/día y modo corto) y `medicion/sim2.ts` (progreso nuevo frente a «u01–u24 marcadas»).

## Cómo se simula (y qué no se sabe)
- Cada día natural el estudiante tiene un presupuesto de minutos. Abre Hoy, hace los bloques del primer día pendiente en orden y, si le sobra tiempo, pulsa «Hacer más hoy» (`extra += 1`) y sigue con el día siguiente. Empieza un bloque si cabe en lo que queda (con 2 min de tolerancia) o si es el primero del día; lo que no cabe espera a mañana.
- Duraciones: las del motor (`Block.minutes`); el repaso espaciado usa `srsMinutes(tarjetas de la cola real)` (15 s por tarjeta, 1–10 min). **No hay tiempos reales medidos** (la app los mide en `timing`, pero no hay uso real todavía): los minutos son nominales.
- Mini-prueba: se aprueba con probabilidad 0,85 (semilla fija); al fallar se insertan los 2 días de repaso dirigido. Repaso espaciado: una sesión por día (tope `LIMITS.session` = 20 tarjetas), 90 % «Bien» y 10 % «Otra vez». Ese 85/90 % es un supuesto mío, no un dato. No se simulan tarjetas `cloze`/`listen` creadas por fallos (suman cola).
- «Modo normal» = todos los bloques con contenido; «modo corto» = solo los *core* (`visibleBlocks(day, unit, true)`).

## Resultados
| Escenario | Semanas cerradas a los 60 días | Día en que se acaba el contenido del curso | Minutos/día medios hasta el fin |
|---|---|---|---|
| Progreso nuevo · 15 min · normal | 5 de 35 | **355** | 12,6 |
| Progreso nuevo · 30 min · normal | 9 de 35 | **222** | 28,5 |
| Progreso nuevo · 60 min · normal | 19 de 35 | **108** | 57,9 |
| Progreso nuevo · 90 min · normal | 29 de 35 | **71** | 88,5 |
| Progreso nuevo · 120 min · normal | 35 de 35 | **53** (los últimos 4 días de la ventana de 60 quedan sin actividad) | 119 |
| Progreso nuevo · 15 min · corto | 7 de 35 | 293 | 10,6 |
| Progreso nuevo · 30 min · corto | 20 de 35 | 106 | 28,0 |
| **u01–u24 marcadas** · 15 min · normal | — (quedan 4 semanas) | **26** | 12,0 |
| **u01–u24 marcadas** · 30 min · normal | — | **13** | 28,3 |
| **u01–u24 marcadas** · 60 min · normal | — | **6** | 63,3 |

- **Orden**: en todas las corridas las 35 semanas se cierran **una vez cada una y en el orden de `COURSE`** (u25, u01, u02#A…); ninguna marca se repite (las claves de bloque son únicas) y no se salta ninguna semana. Los huecos de u25–u28 en «u01–u24 marcadas» se hacen en el orden u25 → u26 → u27 → u28, comprimidos a 3 o 4 días (días 1, 2, 3, 6 + mini-prueba; u25 solo 1, 2, 3 + mini): se cierran en 4, 11, 18 y 25 días a 15 min/día. Las semanas de u01–u24 aparecen como cerradas desde el día 0 (valen como completas por la cobertura heredada ≥ 85 %).
- **Repaso dirigido** (días 8+): entre 8 y 18 bloques «Repasar lo que fallaste» por corrida completa (fallos de mini-prueba simulados); cada fallo añade 2 días, como especifica `remedialDays`.
- **Fin del contenido**: al terminar, `todaySlots` devuelve `finished` y Hoy muestra «Terminaste lo disponible» con un solo botón («Repaso espaciado»).

## Hallazgos
| id | Hallazgo | Evidencia | Propuesta | Sev. |
|---|---|---|---|---|
| F-flujo-01 | **El modo corto deja el repaso espaciado vacío para siempre.** Las palabras solo entran a la cola cuando se hizo el bloque «Palabras de la unidad» (`wordsSeen`), y ese bloque no es *core*: en modo corto no se muestra. Resultado: 0 tarjetas creadas en toda la corrida; el bloque «Repaso espaciado» (que sí es *core* todos los días) dura 1 min y no tiene nada. También desaparecen dictado, pronunciación, shadowing y «Puedo…» (esto es por diseño). | `medicion/sim.ts`: corridas «corto», `tarjetas 0`, `srs_min_medio 1.0`. `cycle.ts:wordsSeen`, `srsQueue.ts:eligibleUnits`. | Que `eligibleUnits` incluya las unidades de las semanas ya empezadas, o que el modo corto conserve un bloque de palabras. | A |
| F-flujo-02 | **El día 7 depende de un bloque que hoy está roto** (`Repaso mixto`, *core*): ver F-cod-01. El motor lo da por hecho en la simulación; en la app real el estudiante tendría que marcarlo a mano. | `codigo.md` F-cod-01. | Corregir `learnedUnits`. | A |
| F-flujo-03 | **Con u01–u24 marcadas el curso se acaba en 6–26 días.** Quedan 4 semanas comprimidas (u25–u28). Después solo queda el repaso espaciado (y el repaso mixto, que ahora está roto, F-cod-01). No hay mensaje que explique que lo demás (puente a B1) ya estaba marcado. | `medicion/sim2.ts` (3 últimas filas de la tabla). Las unidades del puente u21–u23 también valen como hechas por la cobertura heredada. | Si el usuario real llega con u01–u24 marcadas, el contenido no cubre más de un mes: ver `capacidad.md` §b y §e para qué lo llena. | A |
| F-flujo-04 | **A presupuestos altos el ciclo semanal se comprime.** A 120 min/día se avanzan ~4,6 días del ciclo por día natural (35 semanas = 245 días de ciclo en 53 días): el diálogo de entrada, la repetición, la reescucha y el rol (4 pasadas de la misma conversación) caen todos el mismo día natural, y las 8 palabras nuevas/día del repaso espaciado no alcanzan al curso (ver F-flujo-05). Hoy no hay tope ni aviso. | `medicion/sim.ts`: 120 min → 35 semanas en 53 días, es decir ~4,6 semanas del curso por semana natural. | Aceptable si es decisión; si no, limitar «Hacer más hoy» a un día adicional por jornada natural y ofrecer práctica libre. | M |
| F-flujo-05 | **El repaso espaciado va por detrás del curso.** Con una sesión de 20 tarjetas al día, al terminar el curso se habían introducido **314 (15 min/día), 377 (30) y 418 (60) de las 577 palabras** (54–72 %). La cola bloquea palabras nuevas cuando hay más de 40 vencidas (`blockNewAbove`) y cada sesión cubre 20. Con sesiones sin tope (`post.ts`, «todo») se introducen las 577 en ~90 días. | `medicion/sim2.ts` (`recog`), `medicion/post.ts`. Supuesto: una sesión por día. | Decidir si el vocabulario debe terminar en la cola antes del fin del curso; si sí, subir la sesión o separar «nuevas» de «vencidas». | M |
| F-flujo-06 | **«Practicar más» no existe en la app.** El plan maestro (registro del 29-oct) lo da por decidido; en el código solo hay «Hacer más hoy» (agrega el día siguiente del ciclo) y, al terminar el curso, el botón «Repaso espaciado». La práctica libre por unidad (`/practica/uXX`) solo se enlaza desde la pantalla de unidad. | `grep "Practicar más" src` → 0; `Today.tsx:117,98-108`. | Ver `capacidad.md` §e (requiere código). | M |
| F-flujo-07 | **Cuatro bloques siguen «en preparación» y no cuentan para nada**: «Dos frases propias» (5 min), «Texto corto nuevo» (6), «Números y frases a velocidad» (4), «Volver a contar sin mirar» (6): **21 min por semana, 735 min en el curso (11 %)** que figuran en el ciclo pero no tienen herramienta ni contenido. | `cycle.ts` (`soon(...)`); `medicion/sim.ts` (sección NOMINAL: `soon 735`). | Construirlos o quitarlos del ciclo (el plan los describe en `docs/v2/05`). | M |

## Lo que no se pudo medir
Duración real de cada bloque (no hay datos de uso), si el estudiante abandonaría antes (el «Días completados / días posibles ≥ 70 %» del plan §4), y cómo se comportan las tarjetas `cloze`/`listen` que se crean por fallos (añaden cola). Para medirlo hace falta la telemetría local de `timing` y `activityLog` de uso real.
