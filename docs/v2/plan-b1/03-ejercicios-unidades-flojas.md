# Frente 3 · Ejercicios que faltan en las unidades flojas

## Qué es
`auditoria/capacidad.md` §c midió ejercicios de lección por «Puedo…» y marcó **flojas** las unidades con menos de 8. Son ocho, y para llegar a 10 por «Puedo…» faltan **117 ejercicios** en total.

**Corrección a la cifra del encargo.** Los 117 no están todos en las 8 unidades flojas: **85 están en las 8** (u25 +16, u19 +12, u01/u04/u08/u16/u17 +10 cada una, u03 +7) y **32 en otras 11** que quedan entre 8 y 10 por «Puedo…» (reconstruido de la tabla de capacidad §c: u05 +3, u06 +6, u12 +5, u15 +4, u18 +1, u21 +4, u22 +2, u23 +4, u26 +1, u27 +1, u28 +1). Si se quiere gastar menos, el mínimo defendible son los 85.

**El «10 por Puedo…» es un umbral de la auditoría, no una evidencia.** No hay etiqueta que ligue cada ejercicio a su «Puedo…» (capacidad §c). Lo que sí está medido: u25 tiene 14 ejercicios para 3 «Puedo…» (4,7), la media del curso es 616/70 = 8,8.

## Evidencia
Cifras por unidad en `capacidad.md` §c. Estado verificado hoy en el código (`exercisesOf`): u25 {fill 9, choice 5} · u19 {13, 5} · u01 {13, 7} · u04 {16, 4} · u08 {16, 4} · u16 {14, 6} · u17 {16, 4} · u03 {18, 5}. Las ocho unidades tienen además 12 ejercicios sin pista cada una (igual que el resto), 10 dictados y 3 ítems de prueba por área, así que no están vacías: les falta práctica de lección y de mini-prueba. La mini-prueba de la semana saca 8 ejercicios de `exercisesOf(unit)` (`miniTest.ts`), de modo que en u25 (14) y u19 (18) el banco se agota en 1–2 intentos.

## Cómo se arma
- **Dónde:** `src/content/grammar/unidadNN.ts` (u01–u24) o `src/content/nuevas/u25.ts` (u25), arreglo `exercises` de la lección. Esquema: `Exercise` de `grammar/types.ts` = `fill` (`prompt` con un solo `___`, `answers[]`, `hint`, `why`) o `choice` (`options`, `answer`, `why`).
- **Regla de oro: solo se agregan al final.** El id de un ejercicio es posicional (`u25-e00`, `u25-e01`…) y el repaso de errados (`italianPlan.*`, estado de `review`) y las tarjetas `cloze` del SRS lo usan. Insertar en medio rompería el progreso guardado (prohibido por `CLAUDE.md`). Un test lo vigila (abajo).
- **Unidades partidas que reciben ejercicios (u03, u05, u06, u15):** cada ejercicio nuevo se asigna a A o B en `src/content/partes.ts` (hoy u03 tiene 23 repartidos: 11–12 por semana, la menor del curso).
- **Reparto por «Puedo…»** (cada ítem nuevo declara en el comentario del PR a cuál sirve; se reparte parejo entre los 2–3):

| Unidad | + | Qué falta practicar (de sus «Puedo…» y su lección) | Tipo |
|---|---|---|---|
| u25 (semana 1) | 16 | deletrear (letras ↔ palabra), *Come si scrive…?*, *non capisco / può ripetere / più piano*, *Mi chiamo / Sono di* | 10 `fill`, 6 `choice` |
| u01 (sem. 2) | 10 | *tu / Lei* según el contexto, saludos por hora, *essere* | 7 `fill`, 3 `choice` |
| u03 (sem. 5–6) | 7 | números 20–100 escritos, hora, fechas, precios | 5 `fill`, 2 `choice` |
| u04 (sem. 7) | 10 | *volere/potere/dovere*, *vorrei*, pedir y pagar | 8 `fill`, 2 `choice` |
| u08 (sem. 15) | 10 | *dove/quando/quanto/come/perché*, *mai/niente*, cantidad | 8 `fill`, 2 `choice` |
| u16 (sem. 27) | 10 | partes del cuerpo y *mi fa male*, instrucciones de farmacia, emergencia | 7 `fill`, 3 `choice` |
| u17 (sem. 28) | 10 | alquiler, problemas de la casa, relativo *che*, ordinales | 8 `fill`, 2 `choice` |
| u19 (sem. 30) | 12 | *si* impersonal, *da* + tiempo, *stare per* | 9 `fill`, 3 `choice` |
| otras 11 | 32 | ver arriba; u22 +2 todos `fill` (hoy solo 6 `fill` de 18) | mayoría `fill` |
| **Total** | **117** | | |

- **Prioridad por cuándo se llega** (a 30 min/día se llega a la semana 9 en 60 días): primero u25, u01, u03, u04 (**43 ejercicios**), luego u05–u06 y u08; el resto después.
- Los ejercicios `fill` nuevos deben pedir **producir** una forma, no solo reconocerla; la proporción actual `fill`/`choice` (445/171 = 72 %) se mantiene.

## Cómo se verifica el italiano
Por ser ejercicios de formas ya enseñadas, el riesgo es el de siempre: una respuesta correcta que no está en `answers[]` o un distractor que en realidad es correcto. Protocolo de `07` G5: V1 `verificar-fuentes.mjs`; V2 para toda forma que no esté ya en la lección (tablas de conjugación, formas de *volere/potere/dovere*, números, que se contrastan con una fuente abierta, p. ej. diccionario o Crusca); V3 segunda pasada independiente con la lista de concordancias y tildes. `why` siempre explica por qué fallar. Los distractores deliberadamente incorrectos se anotan para no confundirlos con errores (como en `docs/dudas-italiano.md`, «distractores a propósito»). No se inventan estructuras: si el ejercicio necesita un uso que la lección no explica, se agrega primero a la lección o se descarta.

## Tests nuevos
Ya existen y seguirán vigilando: `grammar.test.ts` (un solo `___`, pista sin la respuesta, cada respuesta se califica como correcta, `why` presente), `partes.test.ts` (todo ítem en al menos una parte), `lang.test.ts`. Se agregan:
1. `exercises.append-only.test.ts`: instantánea de los ids y del `prompt` de los ejercicios existentes (hash por unidad) para que ningún PR reordene o edite los actuales; los nuevos solo se anexan. (Si se edita uno a propósito, se actualiza la instantánea con justificación en el PR.)
2. Mínimo por «Puedo…»: `exercisesOf(unit).length / canDo.length ≥ 8` (primer corte) y ≥ 10 (cuando termine el frente) para las 28 unidades; sube el piso y no puede bajar.
3. Para unidades partidas: cada parte conserva ≥ 10 ejercicios en `forPart(...)`.

## Tamaño y orden
Un PR por grupo de unidades de la misma fase (un tema por PR, ≈ 30–45 ejercicios cada uno):
1. u25 + u01 + u03 + u04 (43 ejercicios) — **antes** de que la persona llegue a la semana 5.
2. u05 + u06 + u08 (19).
3. u12 + u15 + u16 + u17 (29).
4. u18 + u19 + u21 + u22 + u23 + u26 + u27 + u28 (26).
El test de piso (2) se adelanta al PR 1 con un umbral por unidad que sube PR a PR.

## Dependencias
Ninguna en código. Conviene después de `01` solo si se quiere que las respuestas largas de producción usen la misma lista de formas meta; no es obligatorio.

## Qué no se puede medir
Si 10 por «Puedo…» es la cantidad correcta (es un criterio). La señal real vendrá de las mini-pruebas: `PASS_RATIO` 0,75 y `miniTests` guardados; no hay datos aún.
