# Fase E — Producción: grabar y comparar, dictado, escritura, diálogo

Hoy producción ≈ 8 % del tiempo y casi sin retroalimentación. Esta fase la sube a ~14 % y le da retroalimentación en cada caso.

## E1. Grabar y comparar (pronunciación y diálogo con rol)
- Grabación: `MediaRecorder` con `mimeType` elegido por `MediaRecorder.isTypeSupported` en este orden: `audio/mp4`, `audio/webm;codecs=opus`, `audio/webm`. (iOS Safari usa mp4; no verificado en la versión del usuario.)
- `getUserMedia({audio:true})` solo desde un toque del usuario. Si se niega el permiso: modo sin grabación (escucha el modelo, dice la línea en voz alta y se califica sin grabar).
- Almacenamiento: IndexedDB (`italianPlan-rec`), máximo 20 grabaciones recientes por actividad, se borran las más antiguas. No viajan en el respaldo; Ajustes lo dice.
- Reproducción de la grabación con `URL.createObjectURL`, y comparación alternada «Modelo → Tú» línea por línea.
- Autoevaluación con 3 preguntas de 1 a 3 (¿terminé las frases?, ¿se entiende?, ¿ritmo natural?). Se guarda en el registro de actividad (fase F).
- Sin reconocimiento de voz automático (no verificado en PWA instalada y no es fiable para italiano de principiante).
- Diálogo con rol: pasos (1) oír el diálogo, (2) ver tu papel con pistas en español, (3) decir cada línea, (4) grabar la escena completa, (5) comparar, (6) autoevaluar. Variación semanal: cambiar un dato (precio, hora) o el papel. Reemplaza a `DialogueScreen` actual manteniendo `dialogues.ts`.

## E2. Pronunciación
- Día 1: 8–10 intentos de percepción del contraste de la unidad con ≥ 3 voces distintas (nativas de Lingua Libre; en los pares mínimos no usar audio sintético). Si falla un contraste, el siguiente intento vuelve sobre él. Retroalimentación: se oyen las dos palabras seguidas.
- Día 4: oír, grabar, comparar, autoevaluar (E1).
- Contrastes prioritarios para hispanohablantes (criterio general, no fuente verificada): consonantes dobles, acento de palabra, *sc / gn / gl*, *z*, *b / v*. Prioridad baja: *e / o* abiertas y cerradas.
- Mantener `pronunciation/units.json` y sus pruebas (audio o `AUDIO_PENDING`).

## E3. Dictado
- Niveles: con huecos (u01–u08), parcial (u09–u16), completo (u17 en adelante). Hoy hay 6 frases por unidad; subir a 10 en la fase G.
- Velocidad: normal y lenta (`playbackRate = 0.75`); contar las repeticiones.
- Calificación: comparación palabra por palabra (LCS sobre palabras normalizadas en minúsculas). Mostrar la frase correcta resaltando faltantes (rojo), sobrantes (gris) y errores solo de tilde/apóstrofo (ámbar, cuentan como casi correcto). Resultado por frase: correcta / casi / mal (ya existe).
- Las frases malas entran al SRS como tarjeta `listen` (fase B).
- Unidades 1–3: dictado de números a velocidad (ejemplo de fluidez en Nation).

## E4. Escritura con retroalimentación
Escalera:
- u01–u06: reconstruir un texto breve a partir de palabras clave (versión ligera de dictogloss): se oye o lee el modelo dos veces, se oculta, y se reescribe con las palabras clave dadas.
- u07–u14: escribir con marcos de frase («Ayer yo ___ y después ___»).
- u15 en adelante: consigna libre con restricciones (incluir 3 formas meta).

Tres capas:
1. **Automática**: comprueba que aparezcan las formas meta (`mustInclude: string[][]`, cada elemento con alternativas aceptadas), tildes/apóstrofos y número mínimo de palabras (no de caracteres; reemplaza `minChars`). Avisa sin bloquear de las palabras que no están en el léxico de la app («no la conozco, ¿está bien escrita?»).
2. **Comparación con el modelo**, resaltando las estructuras meta.
3. **Manual con Claude**: botón «Copiar para Claude» que arma este mensaje (en español) y lo copia al portapapeles: unidad, objetivo gramatical, el texto del usuario, e instrucciones: «Corrígelo, explica cada error en una línea en español neutro, dame la versión corregida y dos preguntas para practicar». Luego un campo «Pegar versión corregida»; la app guarda original y corregida y la propone otra vez a los 3 días como tarea de reescritura desde el español (no mirar el texto corregido).
- Esta capa es opcional: la actividad se completa con las capas 1 y 2.
- Evitar el truco actual de «llegar a minChars»: no se marca completa con texto sin sentido (comprobar proporción de palabras reconocidas ≥ 50 %).

## E5. Shadowing propio (sin conexión)
Con los diálogos y textos de la app: oír la línea → leerla mientras suena → repetirla a 0,75 → repetirla a velocidad normal. YouTube queda como extra del día 7 («Necesita internet»).

## Pruebas
- Diff de dictado: casos con falta, sobra, cambio, solo tilde, apóstrofo.
- `mustInclude` con alternativas; ratio de palabras reconocidas.
- Mensaje «Copiar para Claude»: contiene unidad, objetivo y texto; no contiene datos personales.
- Grabación: la lógica de selección de `mimeType` con un doble de `MediaRecorder`; el almacenamiento respeta el máximo.

## Criterios de aceptación
Cada actividad de producción da retroalimentación concreta; sin permiso de micrófono sigue siendo utilizable; probado en el iPhone (micrófono, grabar, reproducir, volver a abrir la app).
