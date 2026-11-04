# Frente 4 · Conectores y estructuras con 0–1 apariciones

## Qué es
Cuatro piezas de la lista CILS A2 (y, la mayoría, de la del CILS B1) que la app casi no practica: *non solo… ma anche*, *infatti*, las **relativas con *che***, y las **exclamativas**. La auditoría las marcó «hueco» o «parcial» (`capacidad.md` §d). Este frente las completa y agrega las pocas estructuras del sillabo B1 que el curso aún no toca.

## Evidencia (recontado hoy sobre `src/content`, sin tests)
| Estructura | Apariciones | Dónde está | Estado |
|---|---|---|---|
| *non solo… ma anche* | **0** (`non solo` 0, `ma anche` 0) | — | hueco |
| *infatti* | 6, todas como vocabulario, frase de G3 o palabra de pronunciación | `vocab.json`, `vocab-g3.json`, `pron-sequence.json` | **0 ejercicios**; no está en la tabla de conectores de la lección u20 |
| Relativo *che* | lección en u17 (`unidad17.ts`, bloque «Relativo che»); aparece en frases sueltas (≈ 55 coincidencias de «che» + verbo) | u17 | parcial: una sola unidad lo enseña |
| Exclamativas (*Che bello!*, *Che peccato!*) | 27 apariciones, casi todas en diálogos (reconocimiento) | `dialogues.ts`, `lectura.json`, `sinpista.json`; ejemplo y 2 ejercicios en u20 | parcial: se oyen mucho, se producen en una unidad |
| *poiché / siccome* (causales, CILS B1) | 4 | vocabulario | no se enseñan |
| *ciascuno* (indefinido del sillabo B1) | **0** | — | hueco (*nessuno* 46, *ogni*/*qualche* sí, u27) |
| *dunque* | 2 | — | solo reconocimiento |

El CILS A2 las lista como «coordinate con *o, invece, allora, infatti, non solo… ma anche*», «relative con *che*» y «esclamative»; el B1 (hoy) lista coordinadas copulativas/adversativas/declarativas, subordinadas causales y temporales, relativas explícitas y exclamativas (`_fuentes.md` §3). *Poiché* y *dunque* no figuran en esas listas; *ciascuno* sí figura en los indefinidos del B1.

## Cómo se arma
Cada estructura se **enseña primero** (lección) y después se practica; nada se agrega solo como ejercicio.

1. ***Non solo… ma anche* + *infatti*** → u20 (semana 31, «Conectores»). Archivo `src/content/grammar/unidad20.ts`:
   - Lección: una fila más en la tabla de conectores para *infatti* («de hecho / en efecto», confirma lo anterior) y un párrafo corto para *non solo… ma anche* («no solo… sino también»). Una «trampa del español» solo se escribe si una fuente la confirma.
   - 2 ejemplos nuevos (la lección debe seguir con ≥ 5 y los `examples` pasan a 10), 1 ítem `notice`, **8 ejercicios por estructura = 16 ejercicios** (al final del arreglo `exercises`; ids posicionales, ver `03`).
   - Reciclaje: 1 dictado en u20 (`dictation.ts`) y 1 ítem de `sinpista.json` de tipo `transform` (unir dos frases con *non solo… ma anche*) en u20; 1 ítem `fill` en u24 (repaso general).
2. **Relativas con *che*** → no se duplica la lección de u17: se agregan **8 ejercicios** en u17 (sujeto y objeto, `fill` y `transform`) y **4 en u20** (unir dos frases con *che*; hoy u20 es la unidad de unir ideas) + 2 `sinpista` `transform` en u17 + 1 lectura de u24 que use dos relativas. Para B1 (relativas explícitas) se agrega en el puente (`09`) un ejemplo de *il quale/cui* **solo si** una fuente abierta lo confirma como uso corriente; si no, queda en `docs/dudas-italiano.md` y no entra.
3. **Exclamativas** → u20 ya enseña *Che + sustantivo/adjetivo*. Se agregan **8 ejercicios** (producir: *Che bello!*, *Che peccato!*; *Che buono!* y *Quanto è bello!* solo si una fuente abierta los confirma) y se hace una pasada en u25–u28 (frases de supervivencia) no para enseñarlas sino para que aparezcan como reconocimiento en los diálogos (ya aparecen).
4. ***Poiché / siccome / ciascuno*** → **no se agregan** al núcleo: el CILS B1 pide subordinadas causales en general (no nombra *poiché* ni *siccome*) y la app ya produce la causa con *perché*; *ciascuno* sí lo nombra; se anotan en el puente como «reconocer» (`09`), con 4 ejercicios de reconocimiento en u22/u23. Decisión D6 de `_plan.md` si la persona quiere ir por el examen.

**Total de contenido nuevo del frente:** ≈ 16 + 8 + 4 + 8 + 4 = **40 ejercicios**, 3 ejemplos, 2 ítems `notice`, ~4 ítems de `sinpista`/dictado, ≈ 6 textos cortos de lección. Es más que los «~32 ejercicios» de `capacidad.md` §e porque suma lo que ese cálculo no contó: la lección, el reciclaje y las relativas de u17.

## Cómo se verifica el italiano
- **Fuente primaria de la forma:** diccionario o sitio institucional abierto para *non solo… ma anche* y *infatti* (Treccani, Accademia della Crusca u otro). **No se consultó ninguna hoy**; la afirmación de que son formas corrientes viene del sillabo CILS A2 que las lista (capacidad §d). Antes de escribir, V2: una frase de ejemplo real por estructura con URL en `docs/v2/revision-fuentes.md`.
- Frases con *infatti* tienen que tener el contraste correcto (*infatti* confirma lo dicho; no se usa como «en cambio»); se verifica en V2.
- Cualquier construcción dudosa (*ma pure*, *quanto è* + adjetivo, *il quale*) → `docs/dudas-italiano.md`, sin audio, y se usa la alternativa confirmada.
- Pasada V3 independiente con la lista de G5.

## Tests nuevos
1. `structures.coverage.test.ts`: cuenta, sobre `exercisesOf`, `examples`, `dictation` y `sinpista`, apariciones por estructura (regex) con piso mínimo: *non solo… ma anche* ≥ 8, *infatti* ≥ 8, relativas ≥ 12 (u17+u20), exclamativas ≥ 10. El piso impide que un PR futuro borre la cobertura.
2. Los tests existentes de lección (≥ 5 ejemplos, ≥ 3 `notice`, `fill` con un `___`, pista sin respuesta, cada respuesta se califica) cubren la forma.
3. Test de apilado: los ids existentes de u17 y u20 no cambian (ver `03`).

## Tamaño y orden
Un solo PR `contenido` (S–M): u20 (lección + 28 ejercicios) y u17 (8 ejercicios + 2 sinpista). Depende de que `03` fije la regla de «solo al final». Es **tardío en el curso** (semana 28 y 31): no urge para quien estudia dos meses; entra después de los frentes que ella verá antes.

## Dependencias
`03` (regla de ids). `04` alimenta `10-listo-para-b1.md` (qué preguntas hay en la prueba de nivel).

## Qué no se puede medir
Si estas cuatro estructuras eran de verdad la causa de que alguien no entienda un texto B1: el sillabo las lista, pero el efecto sobre la comprensión no se puede medir con el código.
