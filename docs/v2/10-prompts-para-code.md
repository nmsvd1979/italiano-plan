# Prompts para pegar en Claude Code (uno por fase, en orden)

Antes de cada uno: `git checkout main && git pull`. Cada fase termina en un PR propio; el usuario lo prueba y lo fusiona él mismo. No empieces la siguiente fase sin su visto bueno.

## Prompt A — offline
```
Lee CLAUDE.md, docs/v2/00-LEEME-PRIMERO.md y docs/v2/01-fase-A-offline.md. Implementa la fase A completa en la rama fix/offline-instalacion: separar el precache de la app del audio, gestor de descarga con progreso y reanudación, diagnóstico copiable, pantalla de rescate y etiquetas «Necesita internet». Escribe las pruebas pedidas (incluida la de Playwright con petición Range y modo offline). Antes de abrir el PR corre npm test y npm run build, y confirma que el precache pesa menos de 2 MB y no incluye mp3. No marques nada como verificado en iPhone: eso lo prueba el usuario con la lista del documento. Abre el PR contra main (nunca push a main) y en la descripción lista qué probó y qué falta que pruebe el usuario.
```

## Prompt B — repaso espaciado
```
Lee CLAUDE.md, docs/v2/00-LEEME-PRIMERO.md y docs/v2/02-fase-B-srs.md. Antes de escribir código, verifica en npm la licencia y versión de ts-fsrs y avísame si no es MIT. Implementa la fase B en la rama feat/srs: modelo de datos en localStorage (italianPlan.srs.v1), los cuatro tipos de tarjeta, calificación, cola diaria con sus topes, pantalla de repaso, importación opcional del mazo extra de Quizlet y simulación de 60 días. No cambies claves existentes ni borres review.ts todavía. Verifica que el respaldo exporta e importa las tarjetas. npm test y npm run build en verde; PR contra main.
```

## Prompt C1 — prueba de voz
```
Lee docs/v2/03-fase-C-audio.md (secciones C1 y C2). Solo la prueba A/B: busca en el repositorio de voces de Piper (rhasspy/piper-voices, it_IT) las voces italianas disponibles, lee la ficha y la licencia de cada una, descarta las que no permitan redistribuir el audio generado y genera las 10 frases de comparación (scripts/tts/compare.sh). Añade en Ajustes el botón «Probar voz del sistema» con las mismas 10 frases. No generes audio en lote. Resume en el PR las licencias que encontraste. Rama feat/prueba-voz.
```

## Prompt C2 — audio en lote (solo después de que el usuario elija voz y de la revisión de contenido de G)
```
Lee docs/v2/03-fase-C-audio.md y docs/v2/decision-voz.md. Implementa C3, C4 y C5: generación incremental con índice y hash, reproductor con el orden de respaldo, selector de voz del sistema, actualización de ATTRIBUZIONI.md marcando lo sintético, y reconstrucción de audio-index.json. Mide el peso total y avísame si supera el presupuesto de la fase A. Rama feat/audio-frases.
```

## Prompt D — ciclo de 7 días
```
Lee docs/v2/04-fase-D-ciclo-7-dias.md y los documentos 00 y 02. Lee src/domain/progress.ts y storage.ts y propón en el PR la migración del progreso antes de aplicarla. Implementa daysOf(), el modo corto, «Hacer más hoy», las reglas de avance y la migración con pruebas. No elimines sessionsOf() hasta que la migración tenga prueba. La reclasificación de u20–u23 (D5) va en un PR aparte, después de que el usuario confirme. Rama feat/ciclo-7-dias.
```

## Prompt E — producción
```
Lee docs/v2/05-fase-E-produccion.md. Implementa en este orden, un PR por punto: E3 dictado por niveles con diff por palabra, E4 escritura con las tres capas, E1/E2 grabar y comparar (con modo sin micrófono), E5 shadowing propio. Para el micrófono usa pruebas con un doble de MediaRecorder y deja la prueba real en iPhone para el usuario.
```

## Prompt F — evaluación
```
Lee docs/v2/06-fase-F-evaluacion.md. Implementa el registro de actividad, la mini-prueba de unidad, la prueba de fase ampliada, la prueba de nivel y el panel. Los ítems de prueba salen de la reserva de contenido de la fase G; si aún no existe para una unidad, esa unidad usa solo gramática y avisa. Rama feat/evaluacion.
```

## Prompt G — contenido (repetir por fases de 4 unidades)
```
Lee docs/v2/07-fase-G-contenido.md y docs/v2/08-auditoria-unidades.md. Trabaja las unidades u01–u04: migra vocab.json al esquema nuevo sin perder palabras, escribe ~50 palabras por unidad con frase, etiqueta y sílaba tónica, las frases de repaso, el texto graduado con preguntas, los dictados a 10, los ejercicios de práctica sin pista y los ítems de prueba. Corrige los hallazgos específicos de 08 que toquen estas unidades. Cualquier duda de italiano va a docs/dudas-italiano.md, no la «arregles a ojo». Genera el informe de léxico acumulado. Rama feat/contenido-u01-u04. No generes audio: primero va la segunda pasada independiente (G5).
```

## Prompt G-revisión (se pega en una sesión nueva, sin contexto del borrador)
```
Revisa el contenido de italiano de las unidades u01–u04 (rama feat/contenido-u01-u04) solo con la lista de comprobación de docs/v2/07-fase-G-contenido.md, sección G5, paso 2. No reescribas por estilo. Por cada hallazgo, corrige o anótalo en docs/dudas-italiano.md con la frase, el problema y tu confianza (alta/media/baja).
```
