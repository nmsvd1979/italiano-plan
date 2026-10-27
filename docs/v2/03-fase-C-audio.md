# Fase C — Audio de frases, diálogos y textos

## Situación
- Hay 588 grabaciones nativas de palabras sueltas (Lingua Libre, CC BY-SA 4.0) en `public/audio`.
- Las frases, el dictado y los diálogos usan hoy `speak()` con la voz del sistema `it-IT`: la calidad depende de la voz instalada en cada iPhone y no se puede comprobar desde la nube.
- El plan v2 necesita audio de ~1200 frases, 24 diálogos y 24 textos graduados.

## Decisión del usuario
Vale una voz neuronal generada de antemano (marcada como sintética) o la voz del iPhone, la que funcione mejor. Se decide por oído, no por teoría.

## C1. Prueba A/B (antes de generar nada en lote)
1. Script `scripts/tts/compare.sh` genera 10 frases de `src/content/dictation.ts` / `dialogues.ts` con cada candidato de voz neuronal para italiano (ver C2) y las deja en `tmp/tts-compare/` con nombres `01-A.mp3`, `01-B.mp3`…
2. El usuario las escucha en el iPhone junto con la voz del sistema (la app tiene un botón «Probar voz del sistema» en Ajustes que lee las mismas 10 frases) y responde cuál prefiere, en ciego.
3. Resultado registrado en `docs/v2/decision-voz.md`. Si gana la voz del sistema, se salta C3 y se mantiene `speak()` con el selector de voz de C5.

## C2. Candidato neuronal (no verificado: Code debe comprobarlo)
- Motor sugerido: Piper (síntesis neuronal local, código abierto). Voces italianas disponibles en el repositorio de voces de Piper en Hugging Face (`rhasspy/piper-voices`, carpeta `it/it_IT`).
- Antes de usar cualquier voz, Code debe: abrir la ficha (`MODEL_CARD`) de esa voz, anotar la licencia del conjunto de datos y del modelo, y confirmar que permite uso y redistribución del audio generado. Si la licencia no está clara, esa voz no se usa.
- Se genera en el Mac del usuario (Claude Code tiene red allí); en la nube de Claude este acceso suele estar bloqueado.

## C3. Generación en lote
- Entrada: cada frase tiene un `id` estable (ver `07`: `s-u04-012`) y su texto italiano. Salida: `public/audio/tts/<id>.mp3`.
- Conversión: wav → mp3 mono 24 kHz ~40 kbps con ffmpeg. Tamaño estimado: ~15–20 KB por clip; 1200 clips ≈ 20–25 MB.
- No regenerar un clip si su texto no cambió: guardar en `public/audio/tts/index.json` `{id, text, sha1(text), voice, license}` y generar solo lo que cambió.
- Todo clip sintético queda listado en `public/audio/ATTRIBUZIONI.md` como «sintético» con la voz y la licencia.
- La velocidad lenta del dictado se logra con `audio.playbackRate = 0.75` (con `preservesPitch`, que es el valor por defecto); no se generan archivos lentos.
- El script `build-audio-index.mjs` (fase A) incluye estos archivos en `audio-index.json`; el gestor de descarga los baja con el resto.

## C4. Reproducción
`src/ui/speech.ts`: `say(itemOrText)` busca en este orden (1) clip de la frase, (2) grabación nativa de la palabra, (3) voz del sistema. Un solo reproductor `<audio>` reutilizado, una pista a la vez, `play()` solo desde un gesto del usuario (restricción de iOS). Cuando suena la voz del sistema, mostrar «voz del sistema» discreto.

## C5. Selector de voz del sistema (respaldo)
En Ajustes: listar `speechSynthesis.getVoices()` con `lang` que empiece por `it`, permitir elegir y probar. Guardar la elección en `italianPlan.voice`. Mostrar un aviso con cómo mejorar la voz en iOS: Ajustes → Accesibilidad → Contenido hablado → Voces → Italiano, y descargar una versión «mejorada» (el nombre exacto del menú puede variar con la versión de iOS: no verificado).

## Limitaciones
- Una voz sintética puede pronunciar mal algunas palabras (geminadas, acento). Por eso el audio nativo de Lingua Libre se mantiene para palabras sueltas y los clips sintéticos se revisan por muestreo (el usuario escucha 5 clips por unidad al probar la unidad; anota los malos en `docs/dudas-italiano.md` con su `id`).
- Los clips sintéticos no sirven como modelo de pronunciación para los pares mínimos: ahí solo se usa audio nativo.

## Criterios de aceptación
- Decisión de voz registrada con la prueba A/B del usuario.
- Cada frase con `id` tiene audio (clip o respaldo) y el reproductor sigue el orden de C4.
- `ATTRIBUZIONI.md` lista el origen y la licencia de cada clip sintético.
- Peso total del audio medido y dentro del presupuesto de la fase A.
