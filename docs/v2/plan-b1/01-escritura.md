# Frente 1 · Escritura: extensión y semana B

## Qué es
(a) En las 7 unidades partidas (u02, u03, u05, u06, u07, u14, u15) la semana B vuelve a pedir la misma consigna que la A. (b) La meta de escritura es muy corta: 8–20 palabras por unidad frente a 30–60 del CILS A2 y 100–120 / 50–80 del CILS B1 (`_fuentes.md` §4). (c) El motor de corrección ya sabe comprobar «formas meta» (`mustInclude`), pero **ninguna de las 28 consignas las trae**.

## Evidencia
- `getWriting(unit)` (`src/content/writing.ts`, última función) devuelve lo mismo para A y B; `WritingScreen.tsx` no lee `part`; `blockRoute.ts` ya pasa `?part=`. (F-cont-01.)
- `minWordsOf` (`src/domain/writingCheck.ts`) = `minWords ?? max(8, minChars/6)`. Medido hoy: u01 8 · u02–u06 12 · u07–u10 13 · u11–u15 15 · u16 13 · u17 15 · u18–u20 17 · u21 15 · u22 17 · u23 18 · u24 20 · u25 8 · u26–u28 12.
- Medido hoy: 0 de 28 consignas con `mustInclude` (el campo existe en la interfaz `WritingTask` y en `checkWriting`, sin datos).
- En el curso real la persona pasa por la semana B de u02, u03 y u05 dentro de sus primeras 9 semanas.

## Cómo se arma
**Código (PR 1, pequeño).**
1. `getWriting(unit, part?)`: busca primero la clave `u02#B` (mismo formato que el id del paso) y, si no existe, la de la unidad. Así el PR es compatible con el contenido actual.
2. `WritingScreen` lee `part` del hash (igual que `RolePlayScreen`, que ya recibe `part`) y se lo pasa.
3. `appLexicon()` (`src/content/lexicon.ts`) suma también las consignas de partes.
4. Campo opcional nuevo `extend?: { prompt: string; minWords: number; model: string; mustInclude?: string[][] }` en `WritingTask`. Cuando el texto base está completo, la pantalla ofrece «Ampliar el texto» con la segunda consigna (misma capa 1 `checkWriting`, misma capa 3 `claudeMessage`). Es un botón opcional: no cambia los minutos del bloque (13 min) ni lo que marca el bloque como hecho.
5. Reutiliza: `checkWriting`, `minWordsOf`, `writingLevel`, `highlightForms`, `targetForms`, `claudeMessage`. **Claves de guardado:** `WritingScreen` guarda texto, corrección y reescritura por **unidad** (`getWritingTexts`/`saveFix`/`saveRewrite` con `unit`, líneas 11, 53–54, 73, 250). Con consigna B distinta, A y B se pisarían. Solución sin migración: la semana A conserva la clave actual (`u02`) y solo la B usa `u02#B`; así no se cambia ninguna clave existente (regla de `CLAUDE.md`). Test: guardar en A y en B no se mezcla.

**Contenido (PR 2–5, por fase).** Archivo: `src/content/writing.ts` (mapa `WRITING`, igual esquema `WritingTask`; las unidades u25–u28 viven en `src/content/nuevas/uNN.ts`, campo `writing`).
- **7 consignas B** (`u02#B`, `u03#B`, `u05#B`, `u06#B`, `u07#B`, `u14#B`, `u15#B`): cada una usa lo que enseña la semana B según `docs/v2/13` §2 (p. ej. u02B: *piacere*, plurales especiales, preposiciones de lugar; u03B: fechas y precios; u05B: direcciones y carteles; u06B: adjetivos y comprar ropa; u07B: *stare* + gerundio e irregulares; u14B: imperativo; u15B: condicional de cortesía e invitar). Modelo en italiano + 4 ítems de lista + `mustInclude`.
- **`mustInclude` para las 35 consignas** (28 + 7): 2–4 grupos de alternativas por consigna, sacados de las formas en cursiva que la propia lista de autocorrección ya cita (hoy `targetForms` las extrae por patrón; aquí se vuelven explícitas).
- **`extend` para las 35**: una segunda consigna que sube la extensión por escalón. Escalera propuesta (propia, no del CILS; el CILS solo da los extremos): u25–u04 → 20–25 palabras; u05–u08/u27 → 30–35; u09–u12/u28 → 40–45; u13–u16 → 50–60 (rango A2 del CILS); u17–u20, u24 → 60–70; puente u21–u23 → 80–100 (rango B1 del CILS). Ítems: 35 consignas `extend` (prompt + modelo + 1–2 `mustInclude`).
- **Modelos alargados**: los 28 modelos actuales miden entre 16 palabras (u25) y 48 (u24), medido hoy; ninguno queda por debajo de su propio `minWords` (hoy se cumple; el test lo mantiene). Los modelos de los escalones altos hay que alargarlos para que lleguen a su nuevo mínimo.
- Tipos de tarea a repartir en las `extend` (tomados de la lista B1/A2 del CILS): descripción de persona/lugar, relato de un episodio (diario), carta informal (agradecer, pedir información, contar), instrucciones. Una de cada tipo por fase como mínimo.

**Total contenido nuevo del frente:** 7 consignas B + 35 `extend` + 35 conjuntos de `mustInclude` = **77 piezas** (≈ 42 textos modelo nuevos en italiano de 25–110 palabras).

## Cómo se verifica el italiano
- Los modelos se escriben **solo con el léxico y las estructuras acumuladas hasta esa semana**: `scripts/lexico-acumulado.ts` / `.py` lista las palabras desconocidas; objetivo ≥ 95 % de palabras conocidas (`07` G3 regla 1).
- V1: `node scripts/verificar-fuentes.mjs` sobre todo el texto nuevo; cada forma no reconocida se justifica en el PR (`auditoria/_verificacion.md` §5).
- V2: toda construcción que no esté ya enseñada en la unidad se contrasta con una fuente abierta (diccionario, Crusca, sitio institucional) y se anota en `docs/v2/revision-fuentes.md`. Para los tipos de texto, el CILS A2/B1 (`_fuentes.md`) describe el género, no el italiano concreto.
- V3: segunda pasada G-R con la lista de `07` G5 (concordancia, artículos, preposiciones articuladas, tildes, participios con *essere*).
- Lo dudoso va a `docs/dudas-italiano.md` y esa frase **no se usa de modelo** ni recibe audio.

## Tests nuevos
`src/content/writing.test.ts` (no existe hoy):
1. cada paso de `COURSE` resuelve una consigna (`getWriting(unit, part)`); en las 7 partidas la B es distinta de la A (`prompt` y `model`);
2. el `model` de cada consigna supera su propio `checkWriting(...).complete` y cubre todos sus `mustInclude` (`missingForms` vacío);
3. `minWords` no baja al avanzar de escalón (monótono por fase) y cada `extend.minWords` es mayor que el de la base;
4. cada grupo de `mustInclude` aparece en el modelo (evita formas imposibles);
5. sin voseo (`lang.test.ts` ya cubre `src/`).

## Tamaño y orden
- PR 1 `feat` código (S–M). PR 1b `test` incluido en PR 1.
- PR 2 `contenido` 7 consignas B + `mustInclude` de F1–F2 (M).
- PR 3–5 `contenido` `extend` + `mustInclude` por fases (M cada uno, 3 PR: F1–F2, F3–F4, F5–F6+puente).
- Un tema por PR: el código no se mezcla con el contenido.

## Dependencias
PR 1 no depende de nada. Los PR de contenido dependen de PR 1. El `extend` del puente se hace junto con `09-puente-b1.md`. El monólogo (`02`) usa la misma escalera `writingLevel`.

## Qué no se puede medir
Si el texto escrito es *correcto* (la capa 1 solo cuenta palabras, léxico y formas meta; la corrección real sigue siendo copiar el mensaje a Claude, capa 3, que depende de la persona). Cuántas palabras escribe de verdad en 13 minutos: sin datos.
