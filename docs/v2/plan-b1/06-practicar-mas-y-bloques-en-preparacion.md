# Frente 6 · «Practicar más» y los 4 bloques «en preparación»

Dos temas, **dos PR distintos**: (6a) «Practicar más» (código, sin italiano nuevo) y (6b) los cuatro bloques (código + contenido, uno por uno).

## 6a · «Practicar más»

### Qué es
El plan maestro (registro del 29-oct) lo da por decidido y no existe: `grep "Practicar más" src` → 0. Hoy hay «Hacer más hoy» (adelanta el día siguiente del ciclo, `Today.tsx:117`) y, al acabar, un único botón al repaso espaciado. La práctica libre `/practica/uXX` (10 ítems al azar de la unidad con semilla diaria) solo se enlaza desde la pantalla de la unidad y saca siempre de un banco de 14–30 ejercicios.

### Evidencia
- Banco de práctica **distinto** y ya escrito (medido en la auditoría): 616 ejercicios de lección + 336 sin pista + 280 dictados = **1.232**. (Los 350 ítems de `pruebas.json` se excluyen a propósito: son la reserva de las pruebas; usarlos para practicar los quemaría.) A 10 ítems por sesión son ~120 sesiones sin repetir.
- `capacidad.md` §b: a 120 min/día el curso se agota el día 53; sin «Practicar más» «el minuto 100 no sirve».
- Piezas que ya existen: `domain/practice.ts` (`candidatesOf`, `dueCandidates`), `domain/review.ts` (`rng`, `shuffle`, estado de errados), `PracticeScreen` (modos `review` / `due`), `SinPistaRunner`, `TestRunner` (evaluación, con corrección y puntos), `dictationDiff.ts`, pantalla de dictado.

### Cómo se arma
**Código (1 PR, M).**
- Ruta `#/practicar` (+ `?area=lectura|escucha|gramatica|escritura`) y botón «Practicar más» en Hoy: visible cuando `allDone` o `finished` (junto a «Hacer más hoy», no en su lugar).
- Mezcla de tres fuentes con un solo corredor: ejercicios de lección (`exercisesOf`), sin pista (`getSinPista`) y dictados (`getDictation`) **solo de unidades ya vistas** (`learnedUnits`, ya corregida en #59, y las del ciclo nuevo).
- «No vistos»: una clave **nueva** `italianPlan.v2.practiceSeen` = lista de ids ya servidos por «Practicar más». Prioridad: nunca vistos → vistos hace más tiempo → errados antes (`dueCandidates`). Es una clave nueva, no cambia ninguna existente; hay que sumarla a `backup.ts` (exportar/importar con validación de forma, `storageShape.test.ts`) y a «Borrar progreso».
- Con `?area=` filtra por habilidad usando el mapeo de `evaluation.ts` (`AREAS`): lectura → lecturas de pasos ya hechos (preguntas), escucha → dictado + sin pista «listen», gramática → lección + sin pista, escritura → enlace al `extend` de `01`.
- Tope de sesión 10 ítems; al terminar muestra aciertos por tema y ofrece «Otra tanda». Si no quedan no vistos, lo dice y vuelve a los más antiguos (nunca una pantalla vacía).
- **No** suma al avance del ciclo (`blockKey`), solo a `appendLog` con `activity: "practicar"`, para no inflar el progreso semanal.
- Reutiliza: `learnedUnits`, `candidatesOf`, `dueCandidates`, `rng/shuffle`, `SinPistaRunner`/`TestRunner`, `weakAreas` (para sugerir el área tras la prueba de nivel).

**Contenido.** Ninguno.

### Cómo se verifica el italiano
No hay italiano nuevo: usa contenido ya escrito y verificado.

### Tests nuevos
`practicar.test.ts`: no sirve ids ya vistos mientras queden; con todo visto devuelve los más antiguos; solo unidades aprendidas; excluye `pruebas.json`; determinista con semilla; el estado sobrevive a `export`/`import`. Test de forma del estado en `storageShape.test.ts`.

### Tamaño, orden y dependencias
1 PR `feat` M. Depende de nada (#59 ya fusionado). Lo usan `05` y `10`.

---

## 6b · Los 4 bloques «en preparación»

### Qué es y evidencia
`cycle.ts` define cuatro `soon(...)` que ocupan **21 min de los 188 min nominales de cada semana** (735 min en 35 semanas, 11 %) y se muestran como «en preparación» todos los días. Efecto doble: ruido en Hoy, y los 188 min por semana de la auditoría (`medicion/minutos.ts`, suma de `Block.minutes` de `daysOf()`) los incluyen: la semana con contenido real son **167 min**. No verifiqué si `pace.ts` o `dayMinutes` los excluyen al mostrar «minutos de hoy»; el PR 6b-0 debe comprobarlo.

| Bloque | Día · min | Qué prometía (`docs/v2/05`) | Qué hace falta |
|---|---|---|---|
| Dos frases propias | 2 · 5 | Escribir dos frases con lo recién visto | código S + 35 consignas |
| Texto corto nuevo | 3 · 6 | Un segundo texto leído | 35 textos nuevos (decisión) |
| Números y frases a velocidad | 4 · 4 | Dictado de números a velocidad (u01–u03) | ≈ 60 ítems + clips + pantalla pequeña |
| Volver a contar sin mirar | 6 · 6 | Reproducir lo leído/oído sin mirar | cubierto por `02` (monólogo) |

### Paso previo (PR 6b-0, S, **antes de que ella estudie**): dejar de mostrar lo que no existe
`daysOf` (o `visibleBlocks`) omite los bloques `soon` mientras no tengan contenido, y `minutes.ts`/`pace.ts` no los cuentan. Resultado: la semana nominal pasa de 188 a 167 min y desaparecen 4 filas «en preparación». Cuando se construya cada bloque, vuelve con `needs` o `only` (lista de pasos donde existe). Tests de `cycle.test.ts` (conteo de bloques) y `simulation.test.ts` se ajustan; la simulación de `flujo.md` hay que volver a correrla (`medicion/sim.ts`) porque los días saldrán ~11 % más cortos.

### Cómo se arma cada uno
1. **Dos frases propias.** Archivo nuevo `src/content/propias.json` (clave = id del paso): `{ prompt, mustInclude: string[][], model: [string, string] }`. Pantalla reutilizando `WritingScreen` en modo corto: `minWords` 8, `checkWriting` con `mustInclude`, capa 3 (`claudeMessage`) opcional. **35 piezas** (35 consignas + 70 frases modelo). Depende de `01-PR1` (`getWriting` por parte).
2. **Texto corto nuevo.** **Opción recomendada: no escribir 35 textos nuevos.** Convertirlo en «Releer y escuchar un texto anterior»: la pantalla de lectura (`LecturaScreen`) abre el texto de una semana ya cerrada (`getLectura(stepId)`), sin traducción visible y con audio (los 146 párrafos ya tienen clip). Contenido: 0; código S. Si la persona prefiere textos realmente nuevos: 35 textos de 50–90 palabras con 2 preguntas (≈ 2.800 palabras de italiano nuevo, mismo esquema `Lectura`); se hace en un frente propio, no aquí.
3. **Números y frases a velocidad.** Solo existe en u25 (números 0–10), u01 y u03 (A/B). Hay que quitarlo del resto de semanas (parte del PR 6b-0: pasa a `only: ["u25","u01","u03#A","u03#B"]`). Contenido: `src/content/velocidad.json` con ≈ 15 ítems por semana × 4 = **≈ 60** (`{ it: "settantaquattro", n: "74" }`, precios, horas, teléfonos). Pantalla: `dictationDiff` + reproducción con `playbackRate` creciente (0,9 → 1,0 → 1,15); los clips se generan con Piper (`07`). El número en cifras es verificable de forma exacta (la escritura de los números está en las reglas de u03); lo no trivial —*ventidue*, *trentatré*, la elisión— se contrasta con fuente abierta.
4. **Volver a contar sin mirar.** Se reemplaza por «Hablar sin mirar» (monólogo, `02`). Si se decide no hacerlo, el bloque se elimina del ciclo.

### Cómo se verifica el italiano
Frases propias y velocidad llevan italiano nuevo: léxico acumulado ≥ 95 %, V1 `verificar-fuentes.mjs`, V2 para números/precios/horas, V3 segunda pasada, dudas a `docs/dudas-italiano.md` (sin audio hasta resolver).

### Tests nuevos
- `cycle.test.ts`: ningún día lista bloques `soon`; `weekMinutes() === 167` (valor pinneado, se actualiza a propósito si se construye algo); los pasos `only` tienen el bloque y los demás no.
- `propias.test.ts`: un registro por paso; cada `model` cumple su `mustInclude`; ≥ 8 palabras.
- `velocidad.test.ts`: `n` coincide con `it` (tabla de numerales independiente en el test); un clip por ítem.

### Tamaño y orden
PR 6b-0 (S, `fix`) → 6b-1 propias (M) → 6b-2 texto anterior (S) → 6b-3 velocidad (M, depende de `07`) → monólogo (`02`).

### Dependencias
6b-0 no depende de nada y conviene **ya**. 6b-1 ← `01` PR 1. 6b-3 ← `07`.

### Qué no se puede medir
Cuánto tarda cada bloque nuevo (nominal 4–6 min es un supuesto). Si aportan a la meta: las valoraciones por actividad (1–3) de `11` §4 son el único dato previsto, y requieren uso real.
