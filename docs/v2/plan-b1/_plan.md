# Plan para dejar la app lista para empezar B1 (4-nov-2026)

**Esto es un plan, no se ejecutó nada.** No se tocó `src/`, `public/`, `scripts/` ni `data/`. Todo lo medido sale de `main` en `de16d6b` (tras los PR #59–#65) con `npx vite-node` sobre los módulos reales; lo que no se pudo medir se dice. Entrada: `docs/v2/auditoria/_final.md`, `capacidad.md`, `flujo.md`, `contenido.md`, `docs/v2/11`, `12`, `13`, `07` y `CLAUDE.md`.

## Un frente por archivo
| # | Frente | Archivo | Tipo | Italiano nuevo |
|---|---|---|---|---|
| 1 | Escritura: semana B y extensión | [01-escritura.md](01-escritura.md) | código + contenido | sí |
| 2 | Producción oral: monólogo | [02-produccion-oral.md](02-produccion-oral.md) | código + contenido | sí |
| 3 | Ejercicios en las unidades flojas | [03-ejercicios-unidades-flojas.md](03-ejercicios-unidades-flojas.md) | contenido | sí |
| 4 | Conectores y estructuras | [04-conectores-y-estructuras.md](04-conectores-y-estructuras.md) | contenido | sí |
| 5 | Ruta tras el núcleo (u01–u24 marcadas) | [05-ruta-tras-el-nucleo.md](05-ruta-tras-el-nucleo.md) | código | no |
| 6 | «Practicar más» y los 4 bloques en preparación | [06-practicar-mas-y-bloques-en-preparacion.md](06-practicar-mas-y-bloques-en-preparacion.md) | código (+ contenido en 6b) | parcial |
| 7 | Audio: pronunciación semanal y ejemplos | [07-audio-pronunciacion-y-ejemplos.md](07-audio-pronunciacion-y-ejemplos.md) | código + mp3 (los genera la persona) | no |
| 8 | Repaso espaciado | [08-repaso-espaciado.md](08-repaso-espaciado.md) | código | no |
| 9 | Puente a B1 | [09-puente-b1.md](09-puente-b1.md) | código + contenido | sí |
| 10 | Medir «listo para B1» | [10-listo-para-b1.md](10-listo-para-b1.md) | código | no |
| — | Fuentes y comparación A2/B1 | [_fuentes.md](_fuentes.md) | — | — |

## Lo que cambia respecto al encargo (leer primero)
1. **Los 117 ejercicios no están todos en las 8 unidades flojas:** 85 en las 8 y 32 en otras 11 (`03`). El mínimo defendible son los 85.
2. **El hallazgo de «114 palabras de pronunciación sin audio» no se reproduce:** midiendo la secuencia semanal completa salen **175** sin nativo ni clip (212 sin nativo − 37 con clip; 27 son frases y 6 son palabras de 1–2 letras) (`07`). Hay que reconciliar la cifra antes de generar clips.
3. **El CILS B1 sí se pudo leer** (3 páginas del documento del IIC de Buenos Aires). Resultado importante: **no nombra congiuntivo, pronombres combinados ni periodo ipotetico**; sí pide relativas, exclamativas, causales/temporales, y pruebas **mucho más largas** (escritura 100–120 y 50–80 palabras, monólogo de 2 min, lectura 800–1.000 palabras, escucha 600–800 con dos hablantes). Los programas de curso (Ca' Foscari, USC) sí ponen esas estructuras en B1. Conclusión del puente en `09`: sirve para entrar a un curso B1, **no** para rendir un examen B1.
4. **Hallazgos nuevos del código:** (a) A y B de una unidad partida compartirían el texto guardado si solo cambia la consigna (se guarda por unidad: `01`); (b) la prueba de nivel A2 evalúa con u21–u23 (puente) y deja fuera u25–u28 (`05`); (c) el texto de «Terminaste lo disponible» menciona semanas «pronto» que ya no existen; (d) 0 de 28 consignas de escritura traen `mustInclude`; (e) los 4 bloques «en preparación» inflan la semana: 167 min reales frente a 188 nominales.
5. **No pude abrir:** CELI 1/2 de Perugia (error de certificado), *Profilo della lingua italiana*, las páginas de detalle y valoración del CILS. Por eso **no hay umbral de aprobación del CILS B1** en el plan; los umbrales de `10` son propios.
6. **Piper:** existe en el Mac de la persona (`/opt/anaconda3/bin/piper` y `it_IT-serena-high.onnx` en Descargas, comprobado por existencia, no ejecutado). **En la nube no se puede contar con él**: los mp3 los genera ella (`07`).

## Cuándo necesita cada cosa (a su ritmo)
La simulación de la auditoría dice: a 30 min/día el curso dura 222 días, ≈ **6,3 días por semana del curso** (es una simulación con supuestos, no un dato de uso). Con dos meses de estudio (≈ 60 días) llega a la **semana 9** (u25, u01, u02A/B, u03A/B, u04, u05A/B); a 60 min/día, a la semana 19 (hasta u11). Por eso el orden prioriza lo que ella tocará pronto:
- **Semanas 1–9:** u25, u01, u03, u04 (43 ejercicios flojos), semanas B de u02, u03, u05 (consigna repetida), bloques «en preparación» (los ve cada día), «Practicar más» (si le sobra tiempo), audio de F1 y SRS.
- **Semanas 10–19:** u05–u06, u08, escritura `extend`, monólogos, audio F2.
- **Semana 28 en adelante:** conectores (u20 es la semana 31), relativas (u17), puente, prueba de nivel.

## Orden propuesto de PR (un tema por PR; ramas `feat/…` o `fix/…`; nunca push a `main`)
Cada PR corre `npm test` y `npm run build` y trae los tests de su frente. «Lo prueba ella» = iPhone, oído o micrófono (no se marca como verificado sin eso).

| Ola | # | PR | Frente | Tipo | Tamaño | Depende de | Ella prueba |
|---|---|---|---|---|---|---|---|
| **0 · antes de que estudie** (código chico, sin italiano) | 1 | Ocultar los bloques «en preparación» y no contarlos en minutos | 6b-0 | fix | S | — | No |
| | 2 | `Practicar más` (`#/practicar`) | 6a | feat | M | — | Sí (uso) |
| | 3 | Prueba de nivel: solo pasos `core` y sin producción en la nota | 5, 10a | fix | S | — | No |
| | 4 | Escritura por parte (A/B) y campo `extend` | 1 | feat | S–M | — | No |
| **1 · semanas 1–9** | 5 | Ejercicios u25, u01, u03, u04 (43) + test de ids append-only | 3 | contenido | M | — | No |
| | 6 | 7 consignas de la semana B | 1 | contenido | S | 4 | No |
| | 7 | Palabras ampliadas al repaso espaciado | 8a | feat | M | — | Sí (uso) |
| | 8 | Pantalla de monólogo + 2 de ejemplo | 2 | feat | M | — | **Sí (micrófono)** |
| | 9 | `mustInclude` y `extend` de F1 | 1 | contenido | M | 4 | No |
| | 10 | Monólogos F1 | 2 | contenido | M | 8 | No |
| | 11 | Extractor de audio ampliado | 7a | feat | S–M | — | No |
| | 12 | Audio F1 (mp3 + índices) | 7b | audio | M | 11 (ella corre Piper) | **Sí (oído)** |
| | 13 | Frases propias | 6b-1 | feat + contenido | M | 4 | Sí |
| **2 · semanas 10–19** | 14 | Duplicados del SRS (8c) y luego ritmo (8b) tras simulación | 8 | feat | S + M | 7 | No |
| | 15 | Ejercicios u05, u06, u08 (19) | 3 | contenido | M | — | No |
| | 16 | `mustInclude` + `extend` + monólogos F2–F3 | 1, 2 | contenido | M × 2 | 9, 10 | No |
| | 17 | Audio F2 | 7c | audio | M | 12 | Sí (oído) |
| | 18 | «Releer un texto anterior» y «Números y frases a velocidad» | 6b-2/3 | feat + contenido | S + M | 1 | Sí |
| **3 · semanas 20–35** | 19 | Ejercicios u12, u15, u16, u17 (29) | 3 | contenido | M | — | No |
| | 20 | Conectores, relativas y exclamativas (u20, u17) | 4 | contenido | S–M | 5 | No |
| | 21 | `mustInclude` + `extend` + monólogos F4–F6 | 1, 2 | contenido | M × 2 | 16 | No |
| | 22 | Ejercicios restantes (u18, u19, u21–u23, u26–u28: 26) | 3 | contenido | M | — | No |
| | 23 | Audio resto | 7d | audio | M | 17, cuota iOS | Sí |
| **4 · puente y medida** | 24 | Tarjeta «Ruta» al terminar el núcleo | 5 | feat | M | 2 | Sí |
| | 25 | Módulo «Práctica B1» (pantallas) | 9a | feat | M | 24 | No |
| | 26 | 3 lecturas largas | 9b | contenido | M | 25 | No |
| | 27 | 3 audios largos y sus 24 preguntas | 9c | contenido | M | 25 | No |
| | 28 | Audio del módulo B1 | 9d | audio | S | 27 | Sí (oído) |
| | 29 | Panel «Listo para B1» | 10b | feat | M | 25, 21 | Sí |
| | — | (opcional, solo con D7) unidad nueva `u29` | 9 | contenido | L (≥ 4 PR) | decisión | — |

**Quién hace qué.** Los PR de código y contenido los puede hacer Claude Code; la segunda pasada (V3) debe hacerla **otra sesión sin ver el borrador** (`07` G5 / `12`). Los mp3 los genera la persona en su Mac. Todo lo marcado «Sí» necesita su iPhone u oído.

## Cuánto contenido nuevo (en ítems)
| Frente | Mínimo viable | Completo | Notas |
|---|---|---|---|
| 3 · ejercicios | 85 | **117** | en `src/content/grammar/uNN.ts`, solo al final |
| 1 · escritura | 7 consignas B | 7 + 35 `extend` + 35 `mustInclude` = **77** | ≈ 42 modelos nuevos en italiano |
| 2 · monólogos | 16 (semanas 1–16) | **35** (≈ 3.000 palabras) | + 35 clips |
| 4 · estructuras | 16 | **≈ 40** ejercicios + 3 ejemplos + 2 `notice` + ~4 sin pista/dictado | + párrafos de lección en u20 |
| 6b · bloques | 0 (solo ocultarlos) | 35 consignas «frases propias» (70 frases modelo) + ≈ 60 ítems de velocidad | «texto corto nuevo»: 0 si se acepta releer |
| 9 · puente | 0 | 3 lecturas + 3 audios + 24 preguntas (≈ 1.600 palabras) | `u29` completa: 100–140 ítems más |
| 7, 8, 10 | 0 | 0 | ≈ 1.550 clips (`07`: ≈ 16 MB estimados) |
| **Total** | **≈ 125** (85 + 7 + 16 + 16) | **≈ 395** ítems de contenido (suma de las filas anteriores sin `u29`: 117 + 77 + 35 + 40 + 95 + 30) | cifra aproximada; los clips no cuentan como contenido |

El contenido escrito a la medida que ya cumple las cuotas de `CLAUDE.md` (≥ 5 ejemplos, ≥ 3 `notice`, ≥ 10 ejercicios por lección, etc.) lo vigilan los tests actuales; cada frente agrega los suyos (sección «Tests nuevos» de cada archivo).

## Cómo se verifica el italiano (resumen común)
Protocolo de `12` §6 y `auditoria/_verificacion.md`: (V1) `scripts/verificar-fuentes.mjs` sobre todo el texto nuevo; (V2) fuente abierta citada con URL en `docs/v2/revision-fuentes.md` para toda forma que no esté ya enseñada; (V3) segunda pasada independiente. Léxico acumulado ≥ 95 % (`scripts/lexico-acumulado.ts`). **Lo dudoso va a `docs/dudas-italiano.md`, no se usa de modelo y no recibe audio.** Ninguno de estos niveles equivale a revisión nativa y no se presenta como tal.

## Decisiones que le tocan a la persona (con recomendación)
**Estado (7-nov):** D1 meta = comunicarse y seguir aprendiendo, no rendir un examen (los umbrales y tareas se orientan a hablar y escribir; lo específico del CILS baja de prioridad). D2 ◐ = escritura ampliada y monólogo se mantienen como opcionales mientras aporten; queda pendiente un análisis con fuentes abiertas de qué prácticas aportan más para comunicarse. D3, D4, D5, D6, D7, D8 decididas. Pendientes: D9, D10.

| # | Decisión | Opciones | Recomendación |
|---|---|---|---|
| D1 ✅ | ¿Qué significa «listo para B1»? | (a) entrar a un curso B1; (b) rendir un examen como el CILS B1 | **(a) con producción larga de (b)**: es lo que `09` y `10` ya proponen. Si es (b) estricto, hay que abrir las páginas del CILS que faltan |
| D2 ◐ | Escritura `extend` y monólogo: ¿obligatorios? | obligatorios en el ciclo / opcionales | **Opcionales** (`extend` por botón; el monólogo sustituye a un bloque no *core*): no sube los minutos |
| D3 ✅ | Ocultar ya los bloques «en preparación» | sí / no | **Sí** (PR 1): quita ruido y baja la semana a 167 min reales |
| D4 ✅ | «Volver a contar sin mirar» | convertirlo en monólogo / quitarlo del ciclo | **Convertirlo** (`02`) |
| D5 ✅ | Audio nuevo y cuota de iOS (≈ 40 MB en total) | generar todo / por fase tras probar | **Decidido (7-nov): por fase.** Generar F1, probar en el iPhone con ~26 MB; no generar F2 hasta resolver |
| D6 ✅ | *Poiché, siccome, ciascuno* | producir / solo reconocer | **Decidido: solo reconocer** (`04`) |
| D7 ✅ | Unidad nueva `u29` (*trapassato*, *condizionale passato*, *congiuntivo passato*) | hacerla / no | **Decidido: no por ahora**; se reconsidera al llegar al puente |
| D8 ✅ | Mazo extra del repaso | seguir con el set de Quizlet / usar `base-frecuente.json` | **Decidido: `base-frecuente.json`**, con la condición de que el vocabulario alcance para entender, seguir una conversación y trabajar: PR 8d y script de cobertura por ámbitos (`08`, sección «Suficiencia del vocabulario») |
| D9 | Ítems largos en la prueba de nivel A2 | agregarlos / dejarlo | **Dejarlo**; el módulo «Práctica B1» ya los cubre |
| D10 | «Texto corto nuevo» | 35 textos nuevos / releer uno anterior | **Releer** (0 contenido) |

## Qué no se puede medir (y qué haría falta)
- Corrección de lo escrito y de lo hablado: falta reconocimiento de voz o un corrector; con la restricción de «sin cuentas ni servicios de pago» se queda en autoevaluación, puntos tachados y duración.
- Minutos reales por bloque, carga que ella aguanta y retención del SRS: faltan datos de uso (`timing`, `activityLog`).
- Si el audio suena bien (997 clips actuales + los nuevos) y si la PWA aguanta la caché en iOS: solo el iPhone.
- Un umbral externo de B1: falta abrir la valoración del CILS B1 o un simulacro oficial.

## Cómo usar este plan
Cada archivo se lee solo: empieza con «Qué es», «Evidencia», «Cómo se arma», «Cómo se verifica el italiano», «Tests nuevos», «Tamaño y orden», «Dependencias» y «Qué no se puede medir». Al aprobarse un PR, se anota en `docs/v2/11` §8 (registro) y se tacha aquí.
