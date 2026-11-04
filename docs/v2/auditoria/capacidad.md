# Auditoría final · 7. Capacidad y suficiencia del contenido (4-nov-2026, `main` en f3d1fc6)

Todo lo cuantitativo sale del código (`medicion/inv.ts`, `minutos.ts`, `sim.ts`, `sim2.ts`, `post.ts`, `depth.ts`, `cov.ts`); lo que es juicio mío lo digo. Donde no se puede medir, digo qué falta. Formato de hallazgos como `_backlog.md`.

## Hallazgos de esta área
| id | Hallazgo | Evidencia | Propuesta | Sev. |
|---|---|---|---|---|
| F-cap-01 | **Hay ~1.400 palabras con frase y 35 contrastes de pronunciación escritos, probados por tests y fusionados, que la app nunca muestra.** G3: 829 palabras ampliadas (`vocab-g3.json`, `extra`) + 574 del mazo general (`base-frecuente.json`); G6: `pron-sequence.json` (35 pasos, 99 pares, 279 palabras, 367 glosas). Quien estudia ve 20–23 palabras por unidad y la pronunciación por unidad. | `getWords` solo lo importan `lexicon.ts` y `scripts/lexico-acumulado.ts`; `loadGeneralDeck` y `sequence.ts` solo los tests. `VocabScreen.tsx:33` usa `getVocab`. El mazo extra que sí está conectado es `data/quizlet-1400.json` (1.231 palabras sin cruce con las unidades, activable en Ajustes). | Conectarlos es **código** (pequeño) y no exige contenido nuevo: ver §e. | A |
| F-cap-02 | **El curso dura ~7 meses a 30 min/día, no 6, y a ritmo alto se acaba pronto.** 188 min por semana × 35 semanas = **6.580 min (≈ 110 h)**; a 30 min/día: **222 días** (simulado con el repaso espaciado y los repasos dirigidos). Con 60 min: 108 días; 90 min: 71; 120 min: 53. El README dice «unos seis meses». | §b. | — | M |
| F-cap-03 | **Quien ya marcó u01–u24 solo tiene 6–26 días de contenido nuevo** (u25–u28 comprimidas) y después únicamente el repaso espaciado. | §b, tabla de simulación. | §e (flojo/hueco). | A |
| F-cap-04 | **735 min (11 %) del ciclo son bloques «en preparación»** sin herramienta ni contenido (ver F-flujo-07). | `minutos.ts`: 21 min por semana. | Construir o quitar. | M |
| F-cap-05 | **Producción escrita y oral escasa para A2.** Una consigna de escritura por unidad (28 para 35 semanas; 7 repetidas en la semana B), con mínimo efectivo de 8–20 palabras (el CILS A2 pide 30–60 en la tarea 1). Producción oral: un solo diálogo por unidad (rol), sin monólogo ni descripción de imágenes (el CILS A2 evalúa un monólogo de ~2 min), y **sin retroalimentación automática**: el estudiante se autoevalúa. | §c, §d. | §e. | M |
| F-cap-06 | **Ocho unidades con menos de 8 ejercicios por «Puedo…»** (u01, u03, u04, u08, u16, u17, u19, u25); u25 es la más corta (14 ejercicios para 3 «Puedo…»). Para llegar a ≥ 10 por «Puedo…» faltan **117 ejercicios** en total. | §c. | §e (flojo). | M |
| F-cap-07 | **Volumen uniforme sin importar la dificultad.** Cada unidad lleva exactamente 12 ejercicios sin pista, 10 dictados, 4 u 8 ítems de gramática de prueba; u11 (imperfecto y *passato prossimo*, «la unidad más difícil del A2» según el backlog) tiene los mismos que u01. | `inv.ts`. | Ajustar las cuotas por unidad en `07-fase-G` si se amplía. | L |
| F-cap-08 | **Casi un tercio del tiempo semanal vuelve sobre los mismos dos contenidos**: el diálogo (4 pasadas, 32 min) y las palabras (4 pasadas, 24 min) = 56 de 188 min (30 %). Es repetición deliberada (docs/v2/04), pero con diálogos de 60–89 palabras y 20 palabras por semana es lo que más pronto cansa. | `minutos.ts`. | Con G3 conectado las palabras de las pasadas 3–4 pueden ser nuevas. | L |

## a) Inventario por unidad (cifras del código)
Definiciones: **Sem.** = semanas del curso que usa la unidad (A/B suman 2). **Ejercicios** = los de la lección (`fill` entre paréntesis); **Notice** = ítems de comprensión; **Sin pista** = `sinpista.json`; **Pruebas L/E/G** = lectura/escucha/gramática de `pruebas.json` (por unidad; en las partidas se reparten por parte); **Pron.** = pares mínimos y palabras de `units.json`/`nuevas`; **Tarjetas de palabras** = palabras de `getVocab` (una tarjeta de reconocer, y luego otra de escribir); **Clips** = frases del manifiesto de voz sintética cuya primera unidad es esa y que tienen archivo; **Nativas** = grabaciones de Lingua Libre del índice con esa unidad.

| Unidad | Sem. | Ejemplos | Notice | Ejercicios (fill) | Palabras | Dictado | Diálogo (líneas · palabras) | Lecturas (n · palabras · preg.) | Escritura (n · mín. pal.) | Pruebas L/E/G | Sin pista | Shadow. (videos) | Pron. (pares · palabras) | Tarjetas de palabras | Clips | Nativas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| u01 | 1 | 6 | 4 | 20 (13) | 20 | 10 | 12 · 61 | 1 · 72 · 4 | 1 · 8 | 3/3/4 | 12 | 2 | 4 · 7 | 20 | 32 | 72 |
| u02 | 2 | 8 | 3 | 30 (22) | 20 | 10 | 10 · 75 | 2 · 172 · 8 | 1 · 12 | 6/6/8 | 12 | 2 | 5 · 8 | 20 | 39 | 83 |
| u03 | 2 | 8 | 3 | 23 (18) | 20 | 10 | 12 · 66 | 2 · 113 · 8 | 1 · 12 | 6/6/8 | 12 | 2 | 4 · 8 | 20 | 43 | 97 |
| u04 | 1 | 6 | 3 | 20 (16) | 21 | 10 | 12 · 62 | 1 · 85 · 4 | 1 · 12 | 3/3/4 | 12 | 2 | 3 · 3 | 21 | 33 | 58 |
| u05 | 2 | 6 | 4 | 27 (21) | 20 | 10 | 12 · 62 | 2 · 176 · 8 | 1 · 12 | 6/6/8 | 12 | 2 | 0 · 11 | 20 | 38 | 73 |
| u06 | 2 | 8 | 3 | 24 (20) | 20 | 10 | 12 · 74 | 2 · 174 · 8 | 1 · 12 | 6/6/8 | 12 | 2 | 5 · 10 | 20 | 45 | 80 |
| u07 | 2 | 8 | 3 | 30 (23) | 20 | 10 | 11 · 65 | 2 · 193 · 8 | 1 · 13 | 6/6/8 | 12 | 2 | 2 · 6 | 20 | 39 | 64 |
| u08 | 1 | 8 | 3 | 20 (16) | 20 | 10 | 11 · 64 | 1 · 98 · 4 | 1 · 13 | 3/3/4 | 12 | 2 | 3 · 8 | 20 | 30 | 54 |
| u09 | 1 | 8 | 3 | 27 (22) | 20 | 10 | 11 · 68 | 1 · 110 · 4 | 1 · 13 | 3/3/4 | 12 | 2 | 2 · 9 | 20 | 32 | 68 |
| u10 | 1 | 9 | 3 | 30 (21) | 20 | 10 | 12 · 63 | 1 · 111 · 4 | 1 · 13 | 3/3/4 | 12 | 2 | 2 · 6 | 20 | 37 | 64 |
| u11 | 1 | 9 | 3 | 28 (19) | 20 | 10 | 10 · 67 | 1 · 126 · 4 | 1 · 15 | 3/3/4 | 12 | 2 | 2 · 7 | 20 | 34 | 56 |
| u12 | 1 | 12 | 3 | 25 (19) | 20 | 10 | 13 · 74 | 1 · 117 · 4 | 1 · 15 | 3/3/4 | 12 | 2 | 2 · 8 | 20 | 38 | 68 |
| u13 | 1 | 6 | 3 | 22 (17) | 20 | 10 | 12 · 72 | 1 · 101 · 4 | 1 · 15 | 3/3/4 | 12 | 2 | 5 · 6 | 20 | 35 | 58 |
| u14 | 2 | 8 | 3 | 25 (18) | 20 | 10 | 12 · 62 | 2 · 207 · 8 | 1 · 15 | 6/6/8 | 12 | 2 | 4 · 5 | 20 | 42 | 54 |
| u15 | 2 | 6 | 3 | 26 (19) | 20 | 10 | 12 · 64 | 2 · 224 · 8 | 1 · 15 | 6/6/8 | 12 | 2 | 3 · 6 | 20 | 39 | 53 |
| u16 | 1 | 7 | 3 | 20 (14) | 23 | 10 | 10 · 64 | 1 · 119 · 4 | 1 · 13 | 3/3/4 | 12 | 2 | 2 · 10 | 23 | 31 | 54 |
| u17 | 1 | 6 | 3 | 20 (16) | 23 | 10 | 11 · 74 | 1 · 139 · 4 | 1 · 15 | 3/3/4 | 12 | 2 | 2 · 8 | 23 | 39 | 63 |
| u18 | 1 | 6 | 3 | 19 (14) | 22 | 10 | 12 · 70 | 1 · 123 · 4 | 1 · 17 | 3/3/4 | 12 | 2 | 2 · 8 | 22 | 40 | 61 |
| u19 | 1 | 6 | 3 | 18 (13) | 20 | 10 | 9 · 69 | 1 · 121 · 4 | 1 · 17 | 3/3/4 | 12 | 2 | 0 · 10 | 20 | 32 | 46 |
| u20 | 1 | 8 | 4 | 20 (12) | 20 | 10 | 8 · 70 | 1 · 122 · 4 | 1 · 17 | 3/3/4 | 12 | 2 | 0 · 8 | 20 | 23 | 44 |
| u21 | 1 | 6 | 3 | 16 (8) | 20 | 10 | 8 · 60 | 1 · 125 · 4 | 1 · 15 | 3/3/4 | 12 | 2 | 0 · 8 | 20 | 33 | 41 |
| u22 | 1 | 7 | 3 | 18 (6) | 20 | 10 | 10 · 73 | 1 · 135 · 4 | 1 · 17 | 3/3/4 | 12 | 2 | 2 · 8 | 20 | 35 | 50 |
| u23 | 1 | 6 | 3 | 16 (11) | 20 | 10 | 10 · 71 | 1 · 149 · 4 | 1 · 18 | 3/3/4 | 12 | 2 | 2 · 8 | 20 | 39 | 49 |
| u24 | 1 | 6 | 3 | 21 (16) | 20 | 10 | 10 · 89 | 1 · 163 · 4 | 1 · 20 | 3/3/4 | 12 | 2 | 7 · 8 | 20 | 27 | 33 |
| u25 | 1 | 8 | 3 | 14 (9) | 22 | 10 | 12 · 66 | 1 · 59 · 4 | 1 · 8 | 3/3/4 | 12 | 2 | 4 · 8 | 22 | 37 | 37 |
| u26 | 1 | 8 | 3 | 19 (15) | 22 | 10 | 10 · 79 | 1 · 109 · 4 | 1 · 12 | 3/3/4 | 12 | 2 | 3 · 8 | 22 | 38 | 38 |
| u27 | 1 | 8 | 3 | 19 (13) | 22 | 10 | 8 · 60 | 1 · 90 · 4 | 1 · 12 | 3/3/4 | 12 | 2 | 3 · 10 | 22 | 32 | 32 |
| u28 | 1 | 9 | 3 | 19 (14) | 22 | 10 | 10 · 62 | 1 · 100 · 4 | 1 · 12 | 3/3/4 | 12 | 2 | 3 · 8 | 22 | 35 | 35 |
| **Total** | **35** | **207** | **87** | **616 (445)** | **577** | **280** | **302 · 1906** | **35 · 3633 · 140** | **28 · —** | **105/105/140** | **336** | **56** | **76 · 218** | **577** | **997** | **1585** |

Notas: «Lecturas… palabras» usa `Lectura.palabras`; «Diálogo» cuenta líneas y palabras en italiano; el total de 1.585 archivos de audio del índice = 588 nativos + 997 clips (la columna «Clips» suma 997: las frases de unidades partidas se cuentan en su unidad, sin A/B; las 5 frases excluidas no tienen clip). Los **videos de shadowing** son 2 por unidad (principal y alternativo); ninguno se vio ni se escuchó (ver `_final.md`). Tarjetas de repaso: además de las 577 de reconocer, el motor crea 577 de escribir (`unlockProdCards`), las de completar/dictado solo nacen de fallos, y el mazo extra aporta 1.231 si se activa. No se cuentan aparte «ejemplos de vocabulario» porque G3 no está conectado (F-cap-01).

## b) Tiempo disponible de estudio
### Minutos del motor (nominales)
`medicion/minutos.ts` suma `Block.minutes` de `daysOf()`; todas las semanas son iguales (el repaso espaciado se toma en 5 min por sesión):

| | Minutos |
|---|---|
| Por día de la semana (días 1 a 7) | 30 · 25 · 24 · 26 · 30 · 23 · 30 |
| **Por semana (modo normal)** | **188** (esenciales 108 · recomendados 80) |
| «En preparación» (no disponibles) | 21 por semana |
| Curso completo: 32 semanas núcleo + 3 del puente | 6.016 + 564 = **6.580 min ≈ 110 h** (solo esenciales: 3.780 min ≈ 63 h; «en preparación»: 735 min) |
| A 30 min/día | 219 días nominales; **222 simulados** (con repaso espaciado variable y repasos dirigidos) |

Nada de esto se mide con uso real: la app guarda tiempos reales (`timing`), pero no hay datos. Los minutos son **nominales**.

### Simulación de 60 días (y hasta el fin)
Supuestos y método: `flujo.md`. «Contenido nuevo disponible» = semanas del curso aún no cerradas.

| Min/día | Modo | Semanas cerradas a los 60 días | **Día en que se acaba el curso** | Qué ocurre en la ventana de 60 días |
|---|---|---|---|---|
| 15 | normal | 5 de 35 | 355 | hay contenido todos los días; solo se llega al 14 % |
| 30 | normal | 9 de 35 | 222 | idem (26 %) |
| 30 | corto | 20 de 35 | 106 | ver F-flujo-01: el repaso espaciado queda vacío |
| 60 | normal | 19 de 35 | 108 | idem (54 %) |
| 90 | normal | 29 de 35 | 71 | idem (83 %); se acaba 11 días después de la ventana |
| 120 | normal | 35 de 35 | **53** | **el contenido se agota el día 53**; los últimos 4–7 días de la ventana quedan sin nada nuevo |
| 15 / 30 / 60 con **u01–u24 marcadas** | normal | — | **26 / 13 / 6** | solo quedan u25–u28 comprimidas |

**Cuándo se agota o se vuelve repetitivo.** El curso no se agota dentro de 60 días con 15 a 90 min/día. Se agota con unos **110 min/día** (6.580 min ÷ 60 días; simulado: 53 días a 120 min, 71 a 90). Repetitivo lo es **por diseño** desde el primer día: el 30 % del tiempo semanal vuelve sobre el mismo diálogo y las mismas 20 palabras (F-cap-08), y la práctica libre de gramática (`/practica/uXX`, 10 ítems al azar de la unidad con semilla diaria) saca de un banco de 14–30 ejercicios, así que los ítems se repiten pronto (no medí el solapamiento entre sesiones). Con u01–u24 marcadas todo esto cambia: el contenido nuevo dura **menos de un mes**.

### ¿Qué hay cuando se acaba? («Practicar más»)
No existe un botón «Practicar más» (F-flujo-06). Al terminar, Hoy muestra «Terminaste lo disponible» y un botón al repaso espaciado. Lo que queda es:
| Actividad | Cuánto da (medido o leído del código) |
|---|---|
| Repaso espaciado (`/tarjetas`) | Con una sesión de 20 tarjetas al día: **5 min/día durante todo el año simulado** (tope por sesión), 543 de 577 palabras introducidas al día 365. Sin tope de sesiones («Seguir repasando»): carga de **18 min/día hacia el día 30**, 15 min hacia el 60, **2–3 min/día desde el día 120** (577 palabras ya maduras, FSRS espacia hasta meses). Con el mazo extra activado (+5 tarjetas nuevas/día de 1.231): hasta 24 min/día hacia el día 30 y 6 min/día al año. `medicion/post.ts`. |
| Repaso mixto (`/repaso`) y práctica libre (`/practica/uXX`) | `/repaso` está **roto** para quien usa el ciclo nuevo (F-cod-01). `/practica/uXX`: 10 ítems por sesión, mismos 14–30 ejercicios; sin novedad. |
| Pruebas | Prueba de fase (6) y prueba de nivel A2: finitas, con reserva de 350 ítems (`pruebas.json`: 105 de lectura, 105 de escucha, 140 de gramática, 10 por semana). |
| Shadowing con video (YouTube, extra del día 7), podcasts por fase | Necesitan internet; son enlaces externos y no se pueden medir. |
| Contenido escrito sin conectar | **~1.400 palabras con frase + 35 contrastes** (F-cap-01): ~175 días de 8 palabras nuevas por día (1.403 ÷ 8). Se rellenaría con código, no con contenido nuevo. |

## c) Profundidad por tema («Puedo…» de `curriculum.ts`)
Criterio y límites: **no hay etiqueta que ligue cada ejercicio a una estructura**, así que uso el «Puedo…» como unidad de medida (2–3 por unidad, 70 en total) y cuento *todo* lo que practica la unidad. Umbral del encargo: «~10 ejercicios por estructura»; marco **flojo** a quien tenga menos de 8 ejercicios de lección por «Puedo…» (la medida más estricta) y aviso aparte si el total de ítems de práctica (ejercicios + *notice* + sin pista + gramática de prueba + dictado) por «Puedo…» baja de 14 (ninguna lo hace: el mínimo es 14,3 en u25). *Ítems totales* no incluye el repaso espaciado de fallos. **Producción escrita** = ejercicios `fill` + 9 ejercicios sin pista de ordenar/traducir/corregir/transformar (igual en todas). Las cuatro habilidades se evalúan por *existencia* de material, no por calidad.

| Unidad | «Puedo…» | Ejercicios | por «Puedo…» | Total de ítems de práctica* | por «Puedo…» | Producción escrita** | Lectura | Escucha | Habla | Valoración |
|---|---|---|---|---|---|---|---|---|---|---|
| u01 | 3 | 20 | 6.7 | 50 | 16.7 | 22 | sí (1 texto, 3 ítems de prueba) | sí (dictado 10, 1 escucha sin pista, 3 de prueba) | rol 1 · shadowing · 7 palabras | **flojo** (< 8 ejercicios por «Puedo…») |
| u02 | 3 | 30 | 10.0 | 63 | 21.0 | 31 | sí (2 textos, 6 ítems de prueba) | sí (dictado 10, 1 escucha sin pista, 6 de prueba) | rol 1 · shadowing · 8 palabras | ok |
| u03 | 3 | 23 | 7.7 | 56 | 18.7 | 27 | sí (2 textos, 6 ítems de prueba) | sí (dictado 10, 1 escucha sin pista, 6 de prueba) | rol 1 · shadowing · 8 palabras | **flojo** (< 8 ejercicios por «Puedo…») |
| u04 | 3 | 20 | 6.7 | 49 | 16.3 | 25 | sí (1 texto, 3 ítems de prueba) | sí (dictado 10, 1 escucha sin pista, 3 de prueba) | rol 1 · shadowing · 3 palabras | **flojo** (< 8 ejercicios por «Puedo…») |
| u05 | 3 | 27 | 9.0 | 61 | 20.3 | 30 | sí (2 textos, 6 ítems de prueba) | sí (dictado 10, 1 escucha sin pista, 6 de prueba) | rol 1 · shadowing · 11 palabras | sin pares mínimos |
| u06 | 3 | 24 | 8.0 | 57 | 19.0 | 29 | sí (2 textos, 6 ítems de prueba) | sí (dictado 10, 1 escucha sin pista, 6 de prueba) | rol 1 · shadowing · 10 palabras | ok |
| u07 | 3 | 30 | 10.0 | 63 | 21.0 | 32 | sí (2 textos, 6 ítems de prueba) | sí (dictado 10, 1 escucha sin pista, 6 de prueba) | rol 1 · shadowing · 6 palabras | ok |
| u08 | 3 | 20 | 6.7 | 49 | 16.3 | 25 | sí (1 texto, 3 ítems de prueba) | sí (dictado 10, 1 escucha sin pista, 3 de prueba) | rol 1 · shadowing · 8 palabras | **flojo** (< 8 ejercicios por «Puedo…») |
| u09 | 2 | 27 | 13.5 | 56 | 28.0 | 31 | sí (1 texto, 3 ítems de prueba) | sí (dictado 10, 1 escucha sin pista, 3 de prueba) | rol 1 · shadowing · 9 palabras | ok |
| u10 | 2 | 30 | 15.0 | 59 | 29.5 | 30 | sí (1 texto, 3 ítems de prueba) | sí (dictado 10, 1 escucha sin pista, 3 de prueba) | rol 1 · shadowing · 6 palabras | ok |
| u11 | 2 | 28 | 14.0 | 57 | 28.5 | 28 | sí (1 texto, 3 ítems de prueba) | sí (dictado 10, 1 escucha sin pista, 3 de prueba) | rol 1 · shadowing · 7 palabras | ok |
| u12 | 3 | 25 | 8.3 | 54 | 18.0 | 28 | sí (1 texto, 3 ítems de prueba) | sí (dictado 10, 1 escucha sin pista, 3 de prueba) | rol 1 · shadowing · 8 palabras | ok |
| u13 | 2 | 22 | 11.0 | 51 | 25.5 | 26 | sí (1 texto, 3 ítems de prueba) | sí (dictado 10, 1 escucha sin pista, 3 de prueba) | rol 1 · shadowing · 6 palabras | ok |
| u14 | 2 | 25 | 12.5 | 58 | 29.0 | 27 | sí (2 textos, 6 ítems de prueba) | sí (dictado 10, 1 escucha sin pista, 6 de prueba) | rol 1 · shadowing · 5 palabras | ok |
| u15 | 3 | 26 | 8.7 | 59 | 19.7 | 28 | sí (2 textos, 6 ítems de prueba) | sí (dictado 10, 1 escucha sin pista, 6 de prueba) | rol 1 · shadowing · 6 palabras | ok |
| u16 | 3 | 20 | 6.7 | 49 | 16.3 | 23 | sí (1 texto, 3 ítems de prueba) | sí (dictado 10, 1 escucha sin pista, 3 de prueba) | rol 1 · shadowing · 10 palabras | **flojo** (< 8 ejercicios por «Puedo…») |
| u17 | 3 | 20 | 6.7 | 49 | 16.3 | 25 | sí (1 texto, 3 ítems de prueba) | sí (dictado 10, 1 escucha sin pista, 3 de prueba) | rol 1 · shadowing · 8 palabras | **flojo** (< 8 ejercicios por «Puedo…») |
| u18 | 2 | 19 | 9.5 | 48 | 24.0 | 23 | sí (1 texto, 3 ítems de prueba) | sí (dictado 10, 1 escucha sin pista, 3 de prueba) | rol 1 · shadowing · 8 palabras | ok |
| u19 | 3 | 18 | 6.0 | 47 | 15.7 | 22 | sí (1 texto, 3 ítems de prueba) | sí (dictado 10, 1 escucha sin pista, 3 de prueba) | rol 1 · shadowing · 10 palabras | **flojo** (< 8 ejercicios por «Puedo…»); sin pares mínimos |
| u20 | 2 | 20 | 10.0 | 50 | 25.0 | 21 | sí (1 texto, 3 ítems de prueba) | sí (dictado 10, 1 escucha sin pista, 3 de prueba) | rol 1 · shadowing · 8 palabras | sin pares mínimos |
| u21 | 2 | 16 | 8.0 | 45 | 22.5 | 17 | sí (1 texto, 3 ítems de prueba) | sí (dictado 10, 1 escucha sin pista, 3 de prueba) | rol 1 · shadowing · 8 palabras | poca producción escrita; sin pares mínimos |
| u22 | 2 | 18 | 9.0 | 47 | 23.5 | 15 | sí (1 texto, 3 ítems de prueba) | sí (dictado 10, 1 escucha sin pista, 3 de prueba) | rol 1 · shadowing · 8 palabras | poca producción escrita |
| u23 | 2 | 16 | 8.0 | 45 | 22.5 | 20 | sí (1 texto, 3 ítems de prueba) | sí (dictado 10, 1 escucha sin pista, 3 de prueba) | rol 1 · shadowing · 8 palabras | ok |
| u24 | 2 | 21 | 10.5 | 50 | 25.0 | 25 | sí (1 texto, 3 ítems de prueba) | sí (dictado 10, 1 escucha sin pista, 3 de prueba) | rol 1 · shadowing · 8 palabras | ok |
| u25 | 3 | 14 | 4.7 | 43 | 14.3 | 18 | sí (1 texto, 3 ítems de prueba) | sí (dictado 10, 1 escucha sin pista, 3 de prueba) | rol 1 · shadowing · 8 palabras | **flojo** (< 8 ejercicios por «Puedo…»); poca producción escrita |
| u26 | 2 | 19 | 9.5 | 48 | 24.0 | 24 | sí (1 texto, 3 ítems de prueba) | sí (dictado 10, 1 escucha sin pista, 3 de prueba) | rol 1 · shadowing · 8 palabras | ok |
| u27 | 2 | 19 | 9.5 | 48 | 24.0 | 22 | sí (1 texto, 3 ítems de prueba) | sí (dictado 10, 1 escucha sin pista, 3 de prueba) | rol 1 · shadowing · 10 palabras | ok |
| u28 | 2 | 19 | 9.5 | 48 | 24.0 | 23 | sí (1 texto, 3 ítems de prueba) | sí (dictado 10, 1 escucha sin pista, 3 de prueba) | rol 1 · shadowing · 8 palabras | ok |

**Lectura de la tabla.** Todas las unidades tienen las cuatro habilidades **representadas** (leer, escuchar, escribir, hablar), pero: (1) *hablar* es siempre un solo diálogo con autoevaluación y repetición de palabras; ninguna unidad entrena un monólogo; (2) *escribir* es una consigna por unidad más las respuestas de los ejercicios; (3) las unidades **flojas por ejercicios** son u25 (4,7), u19 (6,0), u01, u04, u08, u16, u17 (6,7), u03 (7,7); (4) u22 solo tiene 6 `fill` de 18 ejercicios (producción escrita baja en el congiuntivo, que es puente B1); (5) u03 tiene 11,5 ejercicios por semana (la menor del curso: 23 repartidos en 2 semanas).

## d) Cobertura frente a A2
**Fuentes que sí se leyeron.** (1) Centro CILS – Università per Stranieri di Siena, *Linee guida*, «2.1.2 Il livello CILS A2» (pp. 26–28), PDF alojado por el IIC de Buenos Aires: <https://iicbuenosaires.esteri.it/wp-content/uploads/2025/05/Contenuti-Livello-A2.pdf> (lo descargué y extraje el texto; contiene perfil, sillabo morfosintáctico receptivo y productivo, pragmática, léxico y las cinco abilità). (2) Lo ya contrastado en `_temario.md`: lista de contenidos del IIC Buenos Aires (es el mismo documento), programa de Ca' Foscari (<https://www.unive.it/data/insegnamento/618467/programma>) y el de la USC (B1; lo que empieza en B1). **Fuentes que no pude abrir:** la descripción del examen CELI 1 (A2) del Centro CVCL de la Università per Stranieri di Perugia (<https://www.unistrapg.it/sites/default/files/docs/certificazioni/celi-i-a2-descrizione-esame.pdf>, error de certificado al descargarla) y el *Profilo della lingua italiana*. **Aclaración:** el CILS es de Siena; el CELI es de Perugia. Regla de `_temario.md`: si una fuente no lista algo, digo «no figura en esa lista», no «no es A2».

### Gramática (sillabo CILS A2, receptivo y productivo)
| Elemento de la lista CILS A2 | En la app | Estado |
|---|---|---|
| Pronombres complemento directo e indirecto; átonos *lo, la, li, le*; formas tónicas | u13 (directos e indirectos), u12 (tónicos) | cubierto |
| *Si* impersonal | u19 | cubierto |
| Adjetivos indefinidos | u27 (+ apariciones en u08, u11, u13, u14, u16, u17 en lección) | cubierto |
| Numerales ordinales (*primo, secondo, terzo*) y cardinales | u03 (cardinales), u17 (ordinales) | cubierto |
| Preposiciones articuladas con *di, a, da, su* | u05 (+ u02, u06) | cubierto |
| Verbos regulares; irregulares *andare, bere, dare, dire, fare, stare, venire*; modales; *passato prossimo*; imperfetto | u04, u07, u09–u11 (cada verbo aparece en ≥ 7 lecciones; no verifiqué que cada uno tenga su cuadro completo) | cubierto |
| Frase simple: oraciones **exclamativas** | solo u20 (*Che bella idea!*, *Che peccato!*) | **parcial** (1 unidad, 2 ejercicios) |
| Subordinadas objetivas con *che*; temporales implícitas con *prima di* + infinitivo | u20 (*dire che*), u22; *prima di* en u14, u20, u23 | cubierto |
| Coordinadas con *o, invece, allora, infatti, non solo… ma anche* | *invece*: u07, u20; *allora*: 10 unidades; *infatti*: **1** aparición (u24); ***non solo… ma anche*: 0** | **hueco** (2 de 5 conectores) |
| Relativas con *che* centradas en el sujeto | solo u17 (lección), 2 unidades con apariciones | **parcial** |
| Hipotéticas con *se* | u15 (*se* + presente), u23 (puente) | cubierto |
| Concordancia nombre–adjetivo; adverbios frecuentes | u06; u08 | cubierto |

### Funciones, temas y textos
| Del perfil CILS A2 / `_temario.md` | En la app | Estado |
|---|---|---|
| Pedir y dar información; socializar | u01, u04, u08, u25 | cubierto |
| Opiniones simples | u20, u22, u24 (*penso che*, *secondo me*): tarde en el curso (fase 5–6) | cubierto, tardío |
| Invitar | u15 (+ apariciones en u07, u13, u18, u24) | cubierto |
| Disculparse | *scusi / scusa / mi dispiace* en u01, u05, u14, u15, u27; no hay un bloque propio | cubierto en uso, sin lección |
| Viajar, comer, alojarse, comprar, describir familia/personas/imágenes | u05/u10, u04/u28, u17, u06/u12, u26 (imágenes: **no** hay) | cubierto salvo describir imágenes |
| Salud, teléfono, tiempo libre y clima (no listados por CILS) | u16, u18, u27 | **sobra** respecto a esa lista (útil para vivir allá) |
| Textos para leer: anuncios, artículos cortos, publicidad/folletos, instrucciones, cartas, cuentos breves | Las 35 lecturas son de 35 tipos distintos: anuncio de tienda y de alquiler, columna de opinión corta, folleto de mercado, receta, instrucciones, mail formal e informal, carta de consejo, cuento breve y relato | cubierto |
| Textos para escuchar: diálogos, llamadas, avisos públicos, mensajes, **radio** | diálogos, dictados, lecturas con audio; llamadas en u18; avisos en la lectura de u05; radio solo en podcasts externos (input libre) | cubierto salvo radio |
| Producción escrita: descripción, relato tipo diario, pedido de información, carta informal | una consigna por unidad (u18 mail, u26 descripción, u09 diario…); mínimo 8–20 palabras | cubierto en tipo, **corto en extensión** |
| Producción oral: diálogo con examinador y **monólogo** de ~2 min | diálogo de rol por unidad; sin monólogo | **hueco** |
| Pronunciación (CILS A2 no la lista; solo dice «anche con forti interferenze della L1») | 76 pares mínimos + 218 palabras; vocales, dobles, *gli/gn*, acento; 99 pares más sin conectar (G6) | cubierto; 55 palabras sin grabación nativa |

**Lo que sobra frente a esa lista** (y por tanto no cuenta para A2 estricto): u15 futuro y condizionale, u19 *da* + tiempo y *stare per*, u20 discurso indirecto (recortado), y **todo el puente a B1** (u21 pronombres combinados, u22 congiuntivo, u23 periodo ipotetico), que Ca' Foscari y la USC sitúan en B1. Está declarado como opcional; no es un defecto, pero explica los 564 min del puente.

## e) Conclusión
### 1) Suficiente tal como está
- **Gramática del núcleo A2**: cubre casi toda la lista CILS A2 (9 de 12 filas del cuadro anterior; 2 parciales —exclamativas y relativas— y 1 con hueco —conectores—).
- **Textos de lectura**: 35 textos (3.633 palabras, 35 tipos, 140 preguntas), un tipo de texto distinto por semana.
- **Dictado** (10 por unidad = 280), **ejemplos con audio** (207, todos con clip), **diálogos** (28 de 60–89 palabras con audio), **sin pista** (12 por unidad = 336), **pruebas** (350 ítems), **vocabulario base** (577 palabras con tarjetas).
- **Audio de frases**: 997 clips + 588 grabaciones, índice y caché coherentes (`offline-pwa.md`).

### 2) Flojo (propuesta y cuánto contenido haría falta)
| Tema | Propuesta | Cuánto | ¿Contenido o código? |
|---|---|---|---|
| Ejercicios por «Puedo…» en 8 unidades (u25, u19, u01, u04, u08, u16, u17, u03) | Más ejercicios de la estructura nueva | **117 ejercicios** hasta llegar a 10 por «Puedo…» (u25: +16; u19: +12; u01, u04, u08, u16, u17: +10 cada una; u03: +7; el resto: 32 más en 11 unidades) | contenido |
| Escritura | Dos consignas más por unidad y mínimos de 30–60 palabras desde la fase 3 | **+28 consignas** mínimo (hasta 2 por unidad) o 7 si solo se evita la repetición en la semana B | contenido (el motor ya corrige por `minWords`/`mustInclude`) |
| Producción oral | Un monólogo guiado de 1–2 minutos por unidad (rutina, familia, imagen, viaje) con el grabador que ya existe | **28 consignas** con modelo | contenido + una pantalla pequeña (consigna y grabación; el grabador y la comparación existen) |
| Conectores y estructuras con 0–1 apariciones | *non solo… ma anche*, *infatti*, relativas con *che*, exclamativas | ≈ 8 ejercicios por estructura (**~32**) en u20 y u24 | contenido |
| Pares mínimos vacíos (u05, u19, u20, u21) | Conectar G6 (trae pares para todas las semanas) | 0 contenido nuevo | código |
| Repaso mixto y práctica libre | Corregir `learnedUnits` y ofrecer una práctica libre sin límite («Practicar más») con ítems no vistos | 0 contenido; **código** | código |
| Palabras: 1 sola pasada nueva por semana | Conectar G3 (829 + 574 palabras con frase) como bloques 3–4 de palabras y como nuevas del SRS | 0 contenido | código |

### 3) Hueco total
- **Monólogo / descripción de imágenes** (oral, CILS A2): no hay nada. Contenido + pantalla pequeña.
- **Escucha de radio / avisos públicos grabados**: solo hay dictados y diálogos; nada con ruido de fondo, voces distintas ni velocidad normal (todo es la voz de Serena). Requiere audio nuevo (no sé si hay otra voz con licencia).
- **Los 4 bloques «en preparación»** (735 min): «Dos frases propias», «Texto corto nuevo», «Números y frases a velocidad», «Volver a contar sin mirar»: ni contenido ni código. Contenido: ítems de números/precios para u01–u03; el resto es una pantalla de escritura/relato libres.
- **Retroalimentación de la pronunciación y de lo hablado**: la app solo graba y deja comparar de oído. Medirlo o corregirlo automáticamente requiere reconocimiento de voz (no hay; en iOS tiene permisos y límites): fuera de alcance sin código nuevo y sin servicios externos (CLAUDE.md prohíbe cuentas y servicios de pago).

### Lo que hace falta para llenar horas extra (más de ~60 min/día)
Sin código nuevo no hay nada que haga útil el minuto 100: el curso se agota. Con **código pequeño**: (i) conectar G3 y G6 (≈ +1.400 palabras, +35 contrastes), (ii) un «Practicar más» que saque ejercicios no vistos (hay 616 + 336 + 350 = 1.302 ítems de práctica y prueba distintos), (iii) un modo de relectura/escucha de lecturas y diálogos pasados. Con **código mediano**: monólogo y reescritura corregida. Lo que no se puede medir con el código y haría falta saber: cuánto tarda de verdad cada bloque y cuántas sesiones al día aguanta quien estudia (necesita uso real).
