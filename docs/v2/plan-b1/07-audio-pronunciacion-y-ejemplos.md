# Frente 7 · Audio que falta: pronunciación semanal y frases de ejemplo

## Qué es
Tras el PR #64 (G6 y G3 conectados) la app muestra contenido que **no tiene audio propio**: las palabras de la pronunciación semanal y las frases de ejemplo de las palabras ampliadas. Esas pantallas caen a la voz del sistema (que en iOS depende de que haya una voz italiana instalada) o quedan mudas.

## Evidencia (medido hoy sobre `main` en `de16d6b`, con `npx vite-node` y las mismas funciones de la app)
| Qué | Cifra | Cómo |
|---|---|---|
| Palabras/frases distintas de la pronunciación semanal (35 pasos de `pron-sequence.json`) | **367** | `getPronStep` sobre los 35 ids |
| …sin grabación nativa (`audioFiles(w)` vacío) | **212** | = `PRON_AUDIO_PENDING` |
| …sin grabación nativa **y sin clip** (`clipFile(w)` nulo) | **175** | 212 − 37 que ya tienen clip |
| …de esas 175, frases con espacios (*Hai fame.*, *Dove vai?*, *come si dice*) | 27 | |
| …de esas 175, palabras de 1–2 letras (*ce, o, a, ai, lo, la*) | 6 | un TTS lee mal una sílaba suelta |
| Frases de ejemplo de G3 (`ex` de las 577 palabras base + 829 ampliadas) | 1.406 (1.399 distintas) | `getWords` |
| …con clip | 46 | 27 base + 19 ampliadas |
| …sin clip | **1.354 distintas** | contra `public/audio/tts/index.json` |
| Palabras sueltas del vocabulario sin audio (auditoría F-aud-04) | 169 de 577 | 117 palabras + 52 expresiones; **no se re-midió hoy** |
| Textos modelo de escritura sin audio (F-aud-03) | 28 | no entran al extractor |

**Sobre la cifra del encargo (114).** No pude reproducir «114 palabras sin audio nativo ni clip». Mi medida es **175** para la secuencia semanal completa (212 sin nativo − 37 con clip). Pueden diferir en qué se cuenta (las 27 frases con espacio y los 6 monosílabos están dentro de las 175; sin ellos serían 142). Si el 114 sale de otro recorte, hay que reconciliarlo antes de generar.

## Piper: ¿está disponible?
- **En el Mac de la persona, sí, probablemente:** existe `/opt/anaconda3/bin/piper` (comprobado con `which`) y el modelo `/Users/administrador/Downloads/it_IT-serena-high.onnx` (comprobado con `find`). **No ejecuté Piper** ni generé ningún clip; son datos de existencia, no de funcionamiento.
- **En una sesión en la nube, no se puede contar con él:** el `.onnx` lo bajó la persona y no está en el repositorio (`docs/v2/decision-voz.md`), y esta sesión no llega a Hugging Face. Los PR de audio son del tipo «lo corre la persona en su Mac» (`npm run tts:extraer` y `npm run tts:generar -- --modelo <onnx>`, `CLAUDE.md`); un PR de plan o de código puede preparar el extractor y los tests, pero **los mp3 los genera ella**.
- Licencia: voz `it_IT-serena-high`, CC BY 4.0, atribución en `public/audio/ATTRIBUZIONI.md` (ya existe).

## Cómo se arma
**Código (PR 7a, S).** `scripts/tts/extraer.mjs` suma fuentes (hoy: dictados, diálogos, lecturas, sin pista, pruebas, ejemplos de lección y las 55 `AUDIO_PENDING`):
1. `pron-sequence`: todas las palabras de `PRON_STEP_IDS` sin nativo (hoy el extractor solo lee `AUDIO_PENDING` de `units.json`).
2. `vocab-ejemplo`: el `ex` de cada palabra de `getWords(unit)` (`say()` ya prefiere el clip exacto de la frase, `speech.ts:clipFile`).
3. `escritura-modelo`: `getWriting(unit).model` (28; y los modelos nuevos de `01`/`02`).
4. (Opcional, de `audio.md` F-aud-06) frases de los ejercicios `fill` para las tarjetas `cloze` (≈ 440).
Además: que las pantallas de G6 y G3 usen `say()`/`clipFile()` (F-aud-02 se arregló en #61 para las pendientes; verificar que `WordButton` y `PronCompareScreen` consultan el clip también para la secuencia semanal, y que la lista de vocabulario pasa `ex` por `say()`).

**Generación (PR 7b…, los hace la persona).** Por lotes **por fase**, no todo junto: `audio-index.json` lleva `unit` por entrada y el gestor de descarga baja primero las unidades iniciales. Orden: F1 (u25–u04) → F2 → resto. Después de cada lote: `npm run tts:extraer`, `npm run tts:generar -- --modelo …`, commit de los mp3 y del índice.

**Tamaño en la caché (estimado; sin medir en el iPhone).** Hoy: 24,4 MB vigentes (10,3 nativos + 14,1 clips). Clips de Serena medidos hoy: palabra suelta ≈ 3,2 KB, frase ≈ 14,4 KB (8,7 palabras de media ≈ 1,7 KB/palabra). Las frases de G3 miden 4,5 palabras de media. Estimación de lo nuevo: 1.354 ejemplos ≈ 10 MB + 175 palabras ≈ 0,7 MB + 28 modelos de escritura ≈ 1,3 MB + 35 monólogos (`02`) ≈ 4 MB → **≈ 16 MB**, total ≈ **40 MB**. La auditoría deja sin comprobar si la cuota de caché de iOS aguanta ~26 MB (`offline-pwa.md`); 40 MB lo agrava. Mitigaciones previas a generar: (a) PR de F-pwa-02 (limpiar `audio-v1` de lo obsoleto), (b) bajar el bitrate de las frases cortas, (c) descargar por fase y permitir «bajar solo las unidades que estoy estudiando» (ya existe `offlineUnits.ts`). **Decisión D5**: si la prueba en iPhone con ~26 MB ya falla, no se agrega audio de G3.

## Cómo se verifica el italiano
- Regla vigente (`auditoria/_verificacion.md` §5.3 y `decision-voz.md`): **solo se sintetiza lo que está en V2 o V3 y no figura en `docs/dudas-italiano.md`**. Antes de generar, el PR lista el nivel de evidencia de cada fuente nueva. No pude confirmar hoy en qué nivel están las 1.399 frases de G3 (en `revision-fuentes.md` no encontré una sección de G3); si solo son V1, esos clips esperan la pasada G-R.
- Las 27 frases/preguntas de pronunciación (*Vieni?*, *Dove vai?*) dependen de la prosodia: un TTS de una palabra o una pregunta corta puede sonar mal. **Solo se comprueba de oído**; la persona anota lo que suene mal en `docs/dudas-italiano.md` («Clips que suenan mal»).
- Palabras de 1–2 letras (*ce, o, a, ai, lo, la*): no generar clip suelto; se oyen dentro de las frases. Se agregan a `exclusiones.json` con la razón.
- Ya excluidas (no tocar): *fato* y *dammelo* (u16, u21) y las frases sin confirmar.

## Tests nuevos
1. `tts.coverage.test.ts`: para cada paso de `COURSE`, cada palabra de su pronunciación tiene nativo **o** clip **o** está en `exclusiones.json` con razón (hoy ese test fallaría con 175 pendientes: se introduce con la lista actual como baseline y baja con cada lote).
2. Igual para `ex` de G3 por unidad con un baseline decreciente.
3. Los existentes (coherencia de los tres índices, ningún archivo huérfano, `postbuild` precache < 2 MB sin mp3).
4. Que `extraer.mjs` no incluya textos de `exclusiones.json`.

## Tamaño y orden
- 7a `feat` extractor + usos en pantallas (S–M).
- 7b `audio` F1 (u25–u04: ≈ 150 ejemplos + pronunciación de 7 semanas) → 7c F2 → 7d resto: un PR por lote, cada uno **del tipo «solo mp3 + índices»**.
- Antes: PR de limpieza de `audio-v1` (F-pwa-02).

## Dependencias
7a no depende. 7b… depende de 7a, de que la persona corra Piper y, por la cuota, del resultado de la prueba en iPhone. Los clips de `01`/`02` esperan a que existan los textos.

## Qué no se puede medir
Cómo suenan los clips (nadie los oyó, ni los 997 actuales), el tamaño final en la caché de iOS y si el límite de cuota se alcanza. Las KB por clip son medidas; los totales son estimaciones.
