# Dudas sobre el italiano

Aquí van las frases de `src/content` cuya corrección no es evidente y que **no se tocaron**: archivo, frase, duda y propuesta.
Se resuelven en el chat (Claude.ai) o con una persona nativa, no "a ojo" en Code.

## Dudas abiertas

Ninguna por ahora: la revisión ortográfica (oct. 2026) no encontró frases dudosas.

## Revisión ortográfica de oct. 2026 (tarea 3)

**Resultado: 0 correcciones y 0 dudas.** No hubo cambios en `src/content`.

### Qué se revisó
- Las 10.077 cadenas de los 37 archivos `.ts` y `.json` de `src/content` (sin tests). Salieron 3.795 palabras distintas.
- Cada palabra se pasó por el corrector de macOS (`NSSpellChecker`) en italiano, español e inglés.
  No se usó hunspell `it_IT` ni LanguageTool: no estaban instalados y no quise descargar uno.
- Como las cadenas mezclan italiano y explicaciones en español, cada cadena se clasificó como italiana o española según qué palabras existen solo en un idioma (2.059 cadenas italianas). Se revisó lo que el corrector italiano rechaza dentro de ellas.
- Pasada adicional con patrones típicos del italiano: `perchè`/`finchè`, `qual'è`, `pò`, `nè`/`sè`, `un'` + palabra masculina, `un` + palabra femenina con vocal, `e'`, falta de tilde en `città`/`più`/`già`/`così`/`lunedì`/`sarà`…, y apóstrofos tipográficos mezclados.

### Qué salió marcado y por qué no es error
- **Distractores incorrectos a propósito** en ejercicios de opción múltiple: `Due gonni rosa`, `È importante che tu studii`, `ventiuno`, `Damilo!`/`Dalomi!`, `i gioci`/`i gioche`, `Vorrei prendere un'appuntamento`. Cada uno tiene su `why` que explica la forma correcta.
- **Errores citados como ejemplo** en las notas de pronunciación y gramática: `kando`, `kindi`, `estudente`, `España`, `anderò` (frente a `andrò`).
- **Terminaciones o raíces** escritas sueltas en las tablas de conjugación: `parl-`, `prend-`, `dorm-`, `-ono`, `-ete`, `sar-ò`, `avr-à`, `masc.`, `fem.`…
- **Nombres propios y de lugar** que el corrector no reconoce (Firenze, Colosseo, Torino, Laura, Matteo, Perù…).
- **Texto en español o inglés** dentro de cadenas mayormente italianas, nombres de archivo de audio (`citta--langpao.mp3`, etc.) e IDs de video.
- Un falso positivo de mi extractor: `ngentile` sale de un salto de línea (`\nGentile`) en `writing.ts`.

### Qué NO cubre esta revisión
- **Concordancia y gramática.** El corrector mira palabras sueltas: no detecta `la libro`, un tiempo verbal mal elegido ni un artículo equivocado.
- **Acentos en palabras válidas sin tilde** (`e` por `è`, `da` por `dà`, `si` por `sì`).
- **Palabras bien escritas pero equivocadas** (una palabra válida en lugar de otra).
- Frases italianas dentro de cadenas que mi clasificación contó como españolas.
- La corrección del contenido por una persona nativa: sigue siendo necesaria (ver `docs/revision-italiano.md`).
