# Dudas sobre el italiano

Aquí van las frases de `src/content` cuya corrección no es evidente y que **no se tocaron**: archivo, frase, duda y propuesta.
Se resuelven en el chat (Claude.ai) o con una persona nativa, no "a ojo" en Code.

## Dudas abiertas

Ninguna por ahora: la revisión ortográfica (oct. 2026) no encontró frases dudosas.

## Plan B1 · frases de ejemplo de la fase 1 (8-nov-2026)
Segunda pasada independiente (de memoria, sin fuentes) sobre las 241 frases de ejemplo del vocabulario de u25, u01, u02, u03 y u04 y 29 palabras de pronunciación: **0 errores de italiano**, pero 7 frases dudosas o poco naturales. **No se sintetizan** (`scripts/tts/exclusiones.json`); siguen en pantalla con la voz del sistema hasta resolverlas. Para resolverlas: consultar Treccani o la Accademia della Crusca y, si se confirman, cambiar la frase en `vocab-g3.json` (y volver a correr `npm run tts:extraer`).

| Frase | Duda | Propuesta del revisor (confianza) |
|---|---|---|
| *Abito al terzo piano: tre scale.* | «tre scale» suena a calco | *…: faccio tre rampe di scale.* (media) |
| *Il prezzo è molto buono.* | calco de «el precio es muy bueno» | *Il prezzo è ottimo.* / *…molto conveniente.* (media) |
| *In casa c'è un balcone.* | el balcón no está «en» la casa | *La casa ha un balcone.* (media) |
| *Un uomo è alla porta.* | lo natural sería *C'è un uomo alla porta.* | (media) |
| *Il mio luogo di nascita è Santiago.* | correcta pero de formulario | *Sono nato a Santiago.* (media-baja) |
| *Ecco il mio nome.* | sin contexto suena vacía | (baja) |
| *Dieci minuti, per favore.* | ambigua sin contexto | (baja) |

Observaciones de solo estilo (sin cambio todavía): *Anche io* → *Anch'io*; *Il cognome ha un trattino* → *Il mio cognome…*; *L'indirizzo ha la chiocciola* → *…indirizzo email…*; un libro de 90 euros y un tren a 80 km/h poco realistas; *di acqua* → *d'acqua*; *Voglio un panino* brusco (mejor *Vorrei*); *Alla nostra!* es un brindis coloquial elíptico.
**Para oír en el iPhone:** *Nicolás* (u25/u01) lleva tilde española; el clip de Serena podría acentuarlo mal. Si suena mal, anotarlo en «Clips que suenan mal».

## Clips de voz sintética que suenan mal (revisión en el iPhone)
Anota aquí el `id` del clip (nombre del mp3 en `public/audio/tts/`, y su texto en `public/audio/tts/index.json`), qué suena mal (palabra mal pronunciada, geminada, acento) y la frase. Aún no se ha escuchado ninguno en el iPhone.

_Sin anotaciones._

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

## Verificación con fuentes (actualizado el 2-nov-2026, detalle en `docs/v2/auditoria/_verificacion.md` §3)
Frases que **no se pudieron confirmar** en las fuentes abiertas consultadas (no significa que estén mal; significa que **no reciben audio** hasta que la segunda pasada G-R las revise o se reemplacen):
- `Vuole altro?` (u04; sí figura *Vuole qualcos'altro?*, que es la que usa la app, y *Desidera altro?*) · `Credo di no` (u22) · `Siete state lì una settimana?` (u10) · `Gliene parlo io` (u21) · `Potresti consigliarmi un ristorante?` (u24).
- Confirmada el 3-nov-2026: `Credo di sì` (u22), [Gymglish](https://www.gymglish.com/en/saga-baldoria/italian-vocabulary/ci-sarai-domani-credo-di-si): «– Ci sarai domani? – Credo di sì!». Evidencia parcial (no cubre la frase entera, por eso siguen sin audio): `Gliene parlo io` (*Gliene ho parlato* = «le/lo he hablado de eso», [Wiktionary](https://en.wiktionary.com/wiki/gliene)); `Potresti consigliarmi un ristorante?` (la forma de cortesía *Potrebbe consigliarmi un ristorante?* figura en [FastItalian](https://fastitalianlearning.com/phrases/concierge-requests/potrebbe-consigliarmi-un-ristorante)); `Credo di no` (existe *non credo*, pero no se halló la frase). Sin evidencia: `Siete state lì una settimana?`.
- Confirmadas el 2-nov-2026: `Cosa prende?` (u04), `Ecco il resto` (u03, como *Ed ecco il resto*), `Ecco a Lei` (u16), `Ci sentiamo dopo` (u07), `Ci sto!` (u15), `mi alleno` (u08), `la Sua` en mayúscula (convención opcional, u18). Parcial: `Le sta bene` (u13).
- Corregida: `più cinquanta di spese` (u17) → *più cinquanta euro di spese*.

## Segunda pasada G-R (rama `fix/gr-revision`, 2-nov-2026)
Formas que se revisaron y **no se cambiaron sin fuente**, o que se cambiaron con fuente parcial. Confianza = qué tan seguro estoy de que hay un problema (o de que la corrección es correcta).

| Archivo | Frase / punto | Problema | Confianza |
|---|---|---|---|
| `data/g6/pron-secuencia.txt` (u21) → `pron-sequence.json` | *dam-ME-lo* → corregido a *DAM-me-lo* | El acento de *dammelo* cae en la primera sílaba (igual que *DAM-mi* en u14B). Corregido por coherencia interna y regla general del imperativo con pronombres; **no** se pudo abrir una fuente de *dammelo* (el sitio de Wiktionary no estaba disponible). Pendiente de contraste | alta |
| `data/g6/pron-secuencia.txt` (u22) | *abbia*, *siate*, *siamo*: «i breve pegada a la vocal siguiente» | De *sia* sí se confirmó (dos sílabas, `/ˈsi.a/`, ver `_verificacion.md`). Las otras tres formas no se consultaron | alta |
| `data/g6/pron-secuencia.txt` (u27) | *s* sonora entre vocales (*cosa, paese, esame, museo*) | La pronunciación sorda / sonora de la *s* entre vocales varía por región; el texto dice «suele». No se cambió | media |
| `data/g6/pron-secuencia.txt` (u06B) | *lena = energía* (par *legna-lena*) | Palabra poco frecuente y de registro literario; el par es válido pero no es útil para A1–A2 | media |
| `src/content/dictation.ts` (u08) | *Che cosa fai di bello?* = «¿Qué haces de bueno?» | La traducción es literal; la equivalente natural es «¿Qué cuentas de bueno?» / «¿Qué tal?». No se cambió sin fuente | media |

Corregido en esta pasada y que **no** requiere fuente: concordancias en español, errores de traducción, un diálogo con precios incoherentes, una respuesta incorrecta en práctica sin pista y una en u27 (ver el PR).

Resueltas el 2-nov-2026 tras la revisión: *Pioveva e sono rimasto a casa* (u11, ya no usa *quindi*, que se enseña en u20) y *Vorrei dell'acqua* (u12) queda como está: *vorrei* se enseña en u04 y el partitivo *dell'* en la propia u12.
