# Prompts para pegar en Claude Code (uno por fase, en orden)

Antes de cada uno: `git checkout main && git pull`. Cada prompt termina en un PR propio; el usuario lo prueba y lo fusiona él mismo. El orden y las dependencias están en `docs/v2/11-plan-maestro-vivo.md` §3 (no hay piloto: los PR sin dependencia común, como los de contenido, pueden ir en paralelo con los de código). Lee siempre `docs/v2/13-arquitectura-final.md`: manda sobre el temario y el orden del curso.

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
Lee docs/v2/04-fase-D-ciclo-7-dias.md, docs/v2/13-arquitectura-final.md y docs/v2/14-continuidad-progreso.md. Requiere que H1 (course.ts) y B (SRS) estén fusionados. Implementa daysOf(step) sobre CourseStep, el modo corto, «Hacer más hoy» y las reglas de avance. No elimines sessionsOf() hasta que la migración tenga las pruebas de 14 §8. La reclasificación de u20–u23 (D5) usa los datos de 13 y va en un PR aparte. Rama feat/ciclo-7-dias.
```

## Prompt E — producción
```
Lee docs/v2/05-fase-E-produccion.md. Implementa en este orden, un PR por punto: E3 dictado por niveles con diff por palabra, E4 escritura con las tres capas, E1/E2 grabar y comparar (con modo sin micrófono), E5 shadowing propio. Para el micrófono usa pruebas con un doble de MediaRecorder y deja la prueba real en iPhone para el usuario.
```

## Prompt F — evaluación
```
Lee docs/v2/06-fase-F-evaluacion.md. Implementa el registro de actividad, la mini-prueba de unidad, la prueba de fase ampliada, la prueba de nivel y el panel. Los ítems de prueba salen de la reserva de contenido de la fase G; si aún no existe para una unidad, esa unidad usa solo gramática y avisa. Rama feat/evaluacion.
```

## Prompt H1 — curso y datos
```
Lee CLAUDE.md, docs/v2/13-arquitectura-final.md (§1, §2 y §4) y docs/v2/14-continuidad-progreso.md (§7). Implementa en la rama feat/curso-datos: src/content/course.ts con COURSE (orden, partes A/B, fases F1–F6, kind core|bridge), la marca parts en UnitMeta, las claves italianPlan.v2.* y BACKUP_VERSION 2 con importación de copias de versión 1. No cambies ningún id de unidad ni ninguna clave existente. Las unidades u25–u28 entran con ready:false. Pruebas: el orden de COURSE cubre las 28 unidades una vez (partes incluidas); una copia v1 se importa sin pérdida; exportar → importar es idempotente. Muéstrame en el PR la tabla de claves nuevas. npm test y npm run build en verde.
```

## Prompt H2 — continuidad con el progreso (después de B y D)
```
Lee docs/v2/14-continuidad-progreso.md completo. Implementa en la rama feat/continuidad: el cálculo del estado de cada unidad desde las marcas (§3), la pantalla «Tu punto de partida», el diagnóstico (§4) con ítems sin pista sacados del banco de la unidad, la siembra del SRS con los topes de §6, la puesta al día de capas nuevas y los «huecos por cerrar» (§5), y el botón «Volver al plan anterior». Las claves antiguas son de solo lectura. Escribe las pruebas de §8 con los tres respaldos sintéticos (hasta u04; u08 parcial con review lleno; hasta u16 con textos). No subas ningún respaldo real al repositorio. Verifica en el PR que ninguna clave italianPlan.* antigua cambió de valor.
```

## Prompt G0 — correcciones de la auditoría (3 PR de 8 unidades)
```
Lee docs/v2/auditoria/_veredictos.md y docs/v2/auditoria/_backlog.md. Aplica solo los hallazgos H-uXX de severidad A y M de las unidades u01–u08 (después u09–u16, después u17–u24) que sean ajustes en el lugar: etiquetas de tablas, redacción confusa, palabras no enseñadas, ejemplos argentinos → chilenos, ejercicios incoherentes. No reubiques ni partas unidades (eso es G2). Cualquier duda de italiano va a docs/dudas-italiano.md, no la «arregles a ojo». Ramas feat/auditoria-u01-u08, etc. Cierra los ids en _backlog.md. npm test y npm run audit.
```

## Prompt G1 — unidades nuevas (un PR por unidad: u25, u26, u27, u28)
```
Lee docs/v2/07-fase-G-contenido.md y docs/v2/13-arquitectura-final.md (la fila de la unidad en §2). Escribe la unidad completa siguiendo el esquema y las cuotas de 07 y los tests de CLAUDE.md: lección con tres preguntas «Primero fíjate», regla <120 palabras con tabla y nota «Ojo, en español…», ≥ 6 ejemplos, ejercicios con y sin pista, ~50 palabras con frase y etiqueta, diálogo de 60–120 palabras con roles, 10 dictados, escritura con modelo, pronunciación con el contraste de 13, texto graduado con preguntas. Solo vocabulario y estructuras ya enseñadas antes en el orden de COURSE, salvo lo nuevo de la unidad. No generes audio. Ready:true solo cuando pasen todos los tests. Dudas de italiano → docs/dudas-italiano.md.
```

## Prompt G2 — partición A/B de siete unidades
```
Lee docs/v2/13-arquitectura-final.md §2 y §4. Para u02, u03, u05, u06, u07, u14 y u15 asigna a cada parte (A/B) los ítems de lección, ejemplos, preguntas, ejercicios, vocabulario y dictado según la columna «Contenido» de 13. Lo que no se pueda asignar va a ambas como repaso. Sin cambiar texto en italiano. Pruebas: cada ítem aparece en al menos una parte; ninguna parte supera 60 minutos de práctica estimada.
```

## Prompt G3–G7 — vocabulario, textos, práctica, pronunciación, puente
```
Lee docs/v2/07-fase-G-contenido.md y docs/v2/13-arquitectura-final.md. Carril G3: migra vocab.json al esquema nuevo sin perder palabras y lleva cada unidad a ~50 con frase, artículo, sílaba tónica y etiqueta (heurística automática solo como pista; confirma a mano), en lotes de 4 unidades. Carril G4: un texto graduado por semana con preguntas, del tipo de texto indicado en 13 §2. Carril G5: 15–20 ejercicios nuevos por semana sin pista (ordenar, corregir un error, traducir con varias respuestas, completar un diálogo, transformar) y u11 con ≥ 40 ítems. Carril G6: la secuencia de pronunciación de 13 con pares mínimos reales y glosados (AUDIO_PENDING donde falte audio). Carril G7: u20 recortada, Puente a B1 (u21–u23 con reconocimiento y fórmulas) y u24 como proyecto final y prueba A2. Un PR por lote, con informe de léxico acumulado y sin audio.
```

## Prompt G-revisión (se pega en una sesión nueva, sin contexto del borrador)
```
Revisa el contenido de italiano de los archivos cambiados en la rama indicada solo con la lista de comprobación de docs/v2/07-fase-G-contenido.md, sección G5, paso 2. No reescribas por estilo. Por cada hallazgo, corrige o anótalo en docs/dudas-italiano.md con la frase, el problema y tu confianza (alta/media/baja).
```
