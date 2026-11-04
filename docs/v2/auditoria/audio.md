# Auditoría final · 5. Audio: de dónde sale cada sonido (4-nov-2026, `main` en f3d1fc6)

Mismo formato que `_backlog.md`. **Método:** `medicion/aud.ts` enumera cada texto que una pantalla hace sonar, tal como lo pasa al reproductor, y lo resuelve con las mismas funciones de la app (`sourceOf` de `src/ui/speech.ts`: clip de la frase → grabación nativa de la palabra suelta → voz del sistema). Las pantallas que **no** pasan por `say()` se cuentan aparte, porque no consultan los clips. Es lo que *debería* sonar según el código; **no se oyó nada** (eso solo se comprueba en el iPhone).

## Mapa por pantalla
| Pantalla / botón | Cómo suena | Textos | Clip (Serena) | Nativa (Lingua Libre) | **Voz del sistema** |
|---|---|---|---|---|---|
| Lección · ejemplos (`AudioButton`) | `say()` | 207 | 207 | 0 | 0 |
| Escritura · texto modelo (`AudioButton`) | `say()` | 28 | 0 | 0 | **28** |
| Palabras de la unidad · lista (`say(v.it)`) | `say()` | 577 | 2 | 406 | **169** |
| Diálogo · cada línea | `say()` / `sayThrough` | 302 | 300 | 0 | **2** |
| Dictado | `say()` | 280 | 279 | 0 | **1** |
| Práctica sin pista · «escucha» | `say()` | 28 | 28 | 0 | 0 |
| Mini-prueba · «escucha» | `say()` | 105 | 104 | 0 | **1** |
| Lectura · párrafo (botón «Escuchar») | `say()` | 146 | 146 | 0 | 0 |
| Repaso espaciado · tarjetas `cloze` (frase completa) | `say()` | 445 | 5 | 0 | **440** |
| Repaso espaciado · reconocer/escribir (palabra) | `say()` | 577 + 1.231 del mazo extra | = fila «Palabras» | = fila «Palabras» | = fila «Palabras» (mazo extra: sin medir) |
| **Diálogo con rol** (día 4, *core*) | `playModel` (**no usa `say`**) | 302 | 0 (300 tendrían clip) | 0 | **302** |
| **Shadowing propio** (día 5) | `playModel` | 725 líneas posibles | 0 (370 tendrían clip) | 0 | **725** |
| **Repetir y comparar** (pronunciación) | `playModel(texto, archivo)` | 242 palabras | 0 (53 tendrían clip) | 187 | **55** |
| Pronunciación · botón de cada palabra (`WordButton`) | archivo nativo o `speak()` | 242 | 0 (53 tendrían clip) | 187 | **55** |
| Percepción de sonido (pares mínimos) | archivo nativo (`SoundTrials`) | 76 pares | 0 | solo los pares con archivo | 0 (un par sin archivo no se ofrece) |

## Hallazgos
| id | Hallazgo | Evidencia | Propuesta | Sev. |
|---|---|---|---|---|
| F-aud-01 | **El Diálogo con rol, el Shadowing propio y «Modelo → Tú» suenan siempre con la voz del sistema** aunque exista el clip de Serena. `playModel` (`modelAudio.ts:31`) solo usa un archivo si el llamador se lo pasa, y `RolePlayScreen`, `OwnShadowingScreen` y `CompareRow` (rol) no se lo pasan. Son 302 + 725 reproducciones posibles, de las cuales 300 y 370 tienen clip. En esa parte del ciclo el modelo que se imita es distinto del que se oyó el día 1 en «Diálogo de entrada». | `RolePlayScreen.tsx:54,146`, `OwnShadowingScreen.tsx:69`, `CompareRow.tsx:24`; `medicion/aud.ts` (filas `playModel`). | Que `playModel` pregunte primero por `clipFile()`/`audioFiles()`. Es la corrección de audio de más valor para el ciclo (bloques *core* y shadowing). | A |
| F-aud-02 | **Las pantallas de pronunciación no usan los clips de las palabras pendientes.** El PR #56 generó clips para las `AUDIO_PENDING`, pero `WordButton` hace `speak(palabra, 0.8)` y `PronCompareScreen` pasa solo el archivo nativo: **53 de las 55 palabras sin grabación nativa tienen clip y suenan con la voz del sistema**. La pantalla incluso lo dice («todavía no tiene grabación nativa: el modelo es la voz del sistema»). Las 2 restantes (*fato*, *dammelo*) están excluidas a propósito. | `WordButton.tsx:13`, `PronCompareScreen.tsx:71-87`; `medicion/aud.ts`. | Usar `say()` (o `sourceOf`) en `WordButton` y pasar el clip como `file` en `PronCompareScreen`. | M |
| F-aud-03 | **Los 28 textos modelo de «Escritura» suenan con la voz del sistema.** El extractor de frases (`scripts/tts/extraer.mjs`) no los incluye (fuentes: dictado, diálogo, lectura, sin pista, ejemplos, pruebas, pendientes). | `scripts/tts/extraer.mjs:8-12`. | Añadir `writing.model` al extractor y generar 28 clips (los 997 actuales pesan 14 KB de media; los textos modelo son más largos, calcula ~1 MB en total). | M |
| F-aud-04 | **Palabras sueltas del vocabulario sin audio: 169 de 577.** 117 son una palabra sin grabación nativa (*buongiorno, vicino, vorrei, svegliarsi, lavarsi, molto…*) y 52 son expresiones o frases (*per favore, come sta?, a destra, farsi la doccia, di solito, qualche volta…*), que el extractor excluye a propósito («NO entran palabras sueltas del vocabulario»). 2 tienen clip. | `medicion/aud.ts`. | Ampliar las grabaciones (`npm run audio` con los 117) y generar clips de las 52 expresiones. | M |
| F-aud-05 | **Lectura de una entrada con paréntesis**: `l'uovo (pl. le uova)` se pasa tal cual a `say()` y, al no ser una palabra suelta, cae a la voz del sistema, que lee «pl.» y los paréntesis. Es la única entrada de `it` con paréntesis o barra (u12). | `medicion/aud.ts` (lista de vocabulario sin audio). | Que `say()` reciba solo la parte italiana principal (`it` sin lo que va entre paréntesis). | L |
| F-aud-06 | **Repaso espaciado: las tarjetas `cloze` (frase completa) casi nunca tienen clip** (5 de 445). Las tarjetas `cloze` solo nacen de ejercicios fallados, así que lo que suena es la frase de un ejercicio, que el extractor no recoge. | `ReviewScreen.tsx:33,252`; extractor sin la fuente «ejercicio». | Añadir las frases completas de los ejercicios `fill` al extractor (≈ 440 textos) o dejar la tarjeta sin audio. Coste: unos 6 MB de audio. | L |
| F-aud-07 | **5 frases excluidas a propósito** (sin confirmar en fuentes o no italianas): «Siete state lì una settimana?» (u10), «Domani andrò a Venezia in treno. Potresti consigliarmi un ristorante?» (u24), «Che cosa fai di bello?» (u08, también en dictado y mini-prueba), *dammelo* (u21), *fato* (u16). Por eso son los 2 + 1 + 1 de «diálogo/dictado/mini-prueba» con voz del sistema. | `scripts/tts/frases.json` (`excluidas`), `docs/dudas-italiano.md`. | Mantener hasta confirmarlas; ya figuran. | L |
| F-aud-08 | **Aviso «voz del sistema»**: `SystemVoiceHint` se enciende cuando suena la voz del sistema por `speakWithEnd`; `playModel` no pasa por `noteSystemVoice`, así que en rol y shadowing propio **no** avisa aunque sea la voz del sistema. | `speech.ts:162-170` frente a `modelAudio.ts`. | Se resuelve con F-aud-01. | L |

## Qué solo se puede comprobar en el iPhone
Que los clips suenen (formato, `Range`, volumen), que el audio no se corte al cambiar de pantalla, que la voz del sistema italiana esté instalada, y cómo se oyen los 53 clips de palabras sueltas generados con Serena (una palabra sola puede sonar distinta de una frase). Nadie ha oído los 997 clips en esta auditoría.
