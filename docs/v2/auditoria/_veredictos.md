# Veredictos de la auditoría de contenido (u01–u24)

**Método.** Lectura completa de las 24 unidades (lección, ejemplos, preguntas de observación, ejercicios, vocabulario, dictado, escritura, diálogo, pronunciación) en `docs/revision-italiano.md`, más las métricas automáticas de `auditoria/uXX.md`. Fecha: 27-oct-2026. Quién: Claude (una sola lectora; la segunda pasada independiente y la muestra nativa siguen pendientes, ver `12`).
**Qué no cubre.** No hay hablante nativo: «It = C» significa «no encontré error de forma ni calco», no «verificado por un nativo». El shadowing (videos) no se juzga: depende de que el usuario escuche los marcados (u08, u10, u13, u14, u17, u19, u24).

Veredictos: **C** conservar · **A** ajustar (cambio menor, mismo lugar) · **R** reescribir o reubicar (cambia estructura o contenido).
Columnas: **T** tema y orden · **Rg** regla (claridad y longitud) · **Ex** ejercicios · **Di** diálogo · **Pr** pronunciación · **It** italiano.
**Vocabulario y dictado** no están en la tabla porque el veredicto es el mismo en las 24: vocabulario **R** (20 palabras sin frase ni etiqueta → ~50 con frase, `H-all-01`) y dictado **A** (6 → 10 frases con niveles, `H-all-02`).

## Matriz

| Unidad | T | Rg | Ex | Di | Pr | It | Resumen del veredicto |
|---|---|---|---|---|---|---|---|
| u01 | A | C | A | A | C | C | Buena base. Faltan nombre (*Come ti chiami?*), deletreo y acento; ejemplos «argentinos» → chilenos. |
| u02 | R | R | A | C | A | C | Cinco temas en una unidad (artículos, plurales especiales, avere, c'è/ci sono, piacere). Partir en A/B. |
| u03 | R | R | A | C | A | C | Cuatro temas (números, hora, fechas, precios). Partir en A/B. |
| u04 | A | A | A | A | R | C | Verbos regulares + modales + *vorrei*: contenido correcto. Pronunciación repite dobles con 3 palabras; diálogo de 35 palabras. |
| u05 | R | R | A | R | R | C | Cinco temas (preposiciones de movimiento, articuladas, falsos amigos, direcciones, andare/venire/uscire). Diálogo de 26 palabras y pares mínimos vacíos. |
| u06 | R | R | A | A | A | C | Posesivos, questo/quello, adjetivos, colores y bello/buono juntos. Partir; *bello/buono* y *quello* con artículo se difieren. |
| u07 | R | A | A | A | A | C | Reflexivos + *stare* + gerundio + cinco irregulares. Partir; los irregulares (*fare, dire, dare, stare, bere*) hacen falta antes. |
| u08 | A | A | A | C | A | A | Preguntas, negación, frecuencia, cantidad: correcto. Redacción confusa en «non + mai/niente»; palabra no vista (*mi alleno*). |
| u09 | C | C | A | C | R | C | Muy buena. Los participios irregulares se practican siempre con pista: añadir recuerdo sin pista. |
| u10 | A | C | A | C | R | A | Falta *piacere* en passato (*mi è piaciuto*, aparece sin enseñar en u24). Ejemplo con Buenos Aires. Pares repetidos de u03. |
| u11 | A | C | R | C | R | C | **La unidad más importante del A2 tiene solo 20 ejercicios.** Falta *c'era / c'erano*. Acento de la palabra llega demasiado tarde. |
| u12 | A | A | A | C | R | C | Comparativos, superlativos y partitivo: ok. Faltan pronombres tónicos (*di me, come te* se usan sin enseñar). *gli/li* aparece por 4.ª vez. |
| u13 | A | A | A | A | R | A | Etiquetas mezcladas en la tabla de pronombres. Falta enlazar con *mi piace / ti piace*. Redunda con u21. Pronunciación repite dobles. |
| u14 | R | R | A | A | R | C | Tres temas (ci, ne, imperativo tu/Lei/negativo). Partir. Falta *ci vuole*. Pronunciación es puro repaso sin contraste nuevo. |
| u15 | R | R | A | C | R | C | Cuatro temas (futuro, condizionale, se+presente, invitar). Partir. Pronunciación sin contraste nuevo. |
| u16 | C | A | A | C | A | A | La más útil para vivir allá. Regla de ~260 palabras: dividir con «más detalle». *Ecco a Lei* suena forzado (a la muestra nativa). |
| u17 | A | R | A | C | C | C | Ordinales + relativo *che* + problemas de casa + trámites: contenido bueno, regla demasiado larga. Diálogo de 73 palabras: modelo a seguir. |
| u18 | C | A | A | C | A | C | Buena. Recíproco (*ci sentiamo*) se usa desde u07 sin enseñar. |
| u19 | C | A | A | C | R | C | Muy buena (*da / per / fa*). La H muda tiene pares mínimos vacíos (*ho/o, ha/a, hanno/anno* sirven). |
| u20 | R | A | R | C | R | C | Se parte: **conectores = núcleo A2** (suben); discurso indirecto y congiuntivo = puente B1. Solo 10 ejercicios. |
| u21 | R | A | R | C | R | C | Pronombres combinados: no figuran en programas A2; se reconocen desde u13. Producción → puente B1. Un ejercicio incoherente. |
| u22 | A | A | R | C | A | A | Congiuntivo presente: correcto pero es B1. 13 de 18 ejercicios son conjugar con infinitivo entre paréntesis. «Creo tener razón» suena a calco. |
| u23 | A | A | A | A | A | C | Periodo ipotetico: el tipo 1 ya está en u15; tipo 2 es B1 (reconocer + fórmula *se fossi in te*). |
| u24 | R | C | A | A | A | C | Debe ser proyecto final + prueba A2, y no usar nada no enseñado (*c'era*, *mi è piaciuto*, *sia stata* aparecen sin enseñar). |

## Conteo (se verifica con `scripts/check-veredictos.mjs`)
Total de celdas: 24 unidades × 6 columnas = 144.

<!-- conteo-generado -->
Celdas: 144. Conservar (C): 45 · Ajustar (A): 65 · Reescribir o reubicar (R): 34.
Unidades con al menos una R: 19 de 24 (u02, u03, u04, u05, u06, u07, u09, u10, u11, u12, u13, u14, u15, u17, u19, u20, u21, u22, u24).

| Columna | C | A | R |
|---|---|---|---|
| T | 4 | 10 | 10 |
| Rg | 5 | 12 | 7 |
| Ex | 0 | 20 | 4 |
| Di | 15 | 8 | 1 |
| Pr | 2 | 10 | 12 |
| It | 19 | 5 | 0 |
<!-- fin-conteo -->

**Regla de propagación aplicada** (`11`, §4: «más de un tercio de las lecciones marcadas reescribir»). La regla se mide en la columna **Rg** (la lección): 7 de 24 unidades (29 %) tienen R en la regla, por debajo del umbral de un tercio. Resultado: G sigue siendo «ampliar y reordenar», no «reescribir todo». Las R de T y Pr son reubicaciones y partes (cambian el orden, no el italiano), y las R de Ex son ejercicios que se agregan o reemplazan en la capa de práctica.

## Hallazgos transversales (valen para varias unidades)
1. **Sobrecarga.** Siete unidades enseñan 4–5 temas en una sola unidad (u02, u03, u05, u06, u07, u14, u15). Con 6 sesiones de ~39 min, eso son 3–4 conceptos por sesión. Se parten en dos semanas (A/B) sin cambiar los ids de unidad.
2. **Huecos de temario** (detalle en `_temario.md`): alfabeto y deletreo; preguntar y decir el nombre; frases de supervivencia en clase; familia, profesiones y descripción de personas; tiempo libre y clima; *sapere*; *c'era*; pronombres tónicos; preposiciones de lugar básicas; *piacere* en passato; restaurante.
3. **Pronunciación desbalanceada.** Las consonantes dobles aparecen en 9 unidades (u02, u03, u04, u06, u10, u13, u15, u16, u18); *gli/li* en 5 (u07, u09, u12, u14, u24). En cambio **el acento de la palabra llega en u11**, y **qu (u08), h (u19), r/rr (u17)** son pistas aisladas. Cuatro unidades tienen «pares mínimos» vacíos (u05, u19, u20, u21). Reordenar: acento y vocales puras al arranque, un contraste nuevo por unidad, y repaso solo mediante SRS de oído.
4. **Ejercicios.** En las 24 unidades predomina «completar con pista (infinitivo entre paréntesis)»: entrena conjugar con ayuda. Falta: recuerdo sin pista, ordenar, corregir un error, traducir con varias respuestas, completar un diálogo, transformar. Las 24 mantienen el contenido; los ejercicios nuevos van como capa `practice`.
5. **Vocabulario.** 488 palabras en total, 20 por unidad, sin frase ni etiqueta. Hay formas conjugadas como «palabras» (*potrebbe, dovresti*), repeticiones entre unidades (*dire, dare, rispondere, numero, magari, perché*), y palabras usadas en ejercicios sin haberse enseñado (*mi alleno*, *freschi*). Meta del plan: ~50 por unidad con frase, género y artículo, sílaba tónica y etiqueta de transferencia.
6. **Input escaso.** Todo el input es: diálogo (≈40 palabras en promedio), dictado y videos externos sin verificar. Un curso A0→A2 necesita lectura y escucha graduadas de verdad: un texto por unidad como mínimo (ver `07`).
7. **Ejemplos «argentinos» para un usuario chileno.** u01 (Lucía argentina, Córdoba, Buenos Aires), u10 (*Sono nato a Buenos Aires*). Español chileno de referencia: *palta, durazno, polera, micro* donde corresponda, o se escriben las dos formas como ya se hace con «boleto / pasaje».
8. **Registro y tono.** Uso correcto de *tu / Lei* en las 24. Un punto a la muestra nativa: *Ecco a Lei* (u16), *più cinquanta di spese* (u17), *Le va bene / Le sta bene* (u13).
9. **Lo bueno que se conserva** (para que nadie lo «mejore» sin motivo): la nota «Ojo, en español…» de cada unidad (acertada en todas), las tres preguntas «Primero fíjate» (el mecanismo de descubrir antes de leer la regla), los diálogos de u16, u17 y u24 como modelo de longitud, la comparación *da / per / fa* de u19, y la explicación de *ho mangiato* = «he comido» y «comí» de u09.

## Decisiones que se derivan (con la regla de propagación aplicada)
| Hallazgo | Decisión | Dónde se refleja |
|---|---|---|
| Sobrecarga en 7 unidades | Partir en semana A y semana B (ids estables) | `13`, `04` |
| Huecos de temario | 4 unidades nuevas (u25–u28) más inserciones en u10, u11, u12, u13, u14 | `13`, `_temario.md` |
| u20–u23 | u20 = conectores (núcleo); el resto = «Puente a B1», opcional, reconocimiento + fórmulas | `13`, `04` D5 |
| Pronunciación desbalanceada | Secuencia nueva de contrastes, uno por unidad | `13` §pronunciación |
| u11 con 20 ejercicios | ≥ 40 ítems de práctica, intercalados con SRS | `07` |
| u24 usa lo no enseñado | u24 = proyecto final + prueba A2; solo estructuras ya vistas | `13`, `06` |
