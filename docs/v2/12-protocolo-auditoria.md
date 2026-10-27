# Protocolo de auditoría (qué se revisa, cómo, con qué criterio y qué pasa con los hallazgos)

**Estado (27-oct-2026): la primera auditoría completa está hecha.** Las 24 unidades se leyeron enteras en una sola pasada (`auditoria/_veredictos.md`), el temario se auditó contra tres programas (`auditoria/_temario.md`) y el backlog está en `auditoria/_backlog.md`. Lo que sigue pendiente de este protocolo: la **pasada B independiente** sobre lo que se reescriba, y la **muestra nativa**. Desde ahora, este procedimiento se aplica **en cada PR de contenido** (§6), no por bloques de unidades que se estudian primero.

Esta auditoría es la clave del proyecto: la app tiene que ser el mejor material posible para aprender italiano, no solo material que ya está escrito. Todo se audita, de la unidad 1 a la 24 y de lo macro a lo micro. Nada se da por bueno por existir, por haberse pagado o por estar revisado en otra ronda.

## 1. Qué se audita (cinco niveles)
| Nivel | Objeto | Pregunta central |
|---|---|---|
| 1. Macro | objetivo, temario de 24 unidades, orden, ritmo diario, fases | ¿Este recorrido lleva a A2 por el mejor camino para un hispanohablante? |
| 2. Unidad | tema y función, lección, ejemplos, ejercicios, vocabulario, diálogo, dictado, escritura, pronunciación, shadowing | ¿Cada pieza es la mejor forma de enseñar ese contenido? |
| 3. Transversal | vocabulario completo, pronunciación, audio, evaluación, reciclaje entre unidades | ¿Funciona como sistema y no solo por unidad? |
| 4. Técnico | offline, datos, respaldo, rendimiento, accesibilidad en móvil | ¿Se puede estudiar siempre, sin conexión y sin perder progreso? |
| 5. Plan | el propio plan de construcción | ¿El orden y el alcance siguen siendo los correctos con lo que se descubrió? |

## 2. Qué hace el código y qué hace el juicio
**Automático** (`npm run audit`, script `scripts/audit-unidades.ts`; genera `docs/v2/auditoria/uXX.md` y `_resumen.md`):
- conteo y mezcla de ejercicios, porcentaje de «completar» con pista, pistas que contienen la respuesta, consignas y respuestas repetidas, opción correcta siempre la más larga;
- largo de la regla, vocabulario por unidad, reciclaje (palabras de vocabulario que no reaparecen), cobertura de léxico acumulado en diálogo y dictado (qué palabras no se habían visto), transparentes probables por parecido con el español (heurística);
- largo de diálogo y dictado, audio nativo de los pares mínimos, shadowing, minutos del plan actual.
Limitación: miden forma, no calidad. Una unidad sin banderas puede seguir siendo mala. La bandera «diálogo: solo N % de palabras vistas» en u01 y u02 es en parte un efecto del inicio (todavía no hay corpus acumulado) y se interpreta con eso en mente.
El script se vuelve a correr después de cada cambio de contenido y se compara con la corrida anterior.

**Juicio** (revisión por unidad, ficha `uXX.md`, tabla «Lista de juicio»): tema, observar, regla, transferencia al español, ejemplos, ejercicios, vocabulario, diálogo, dictado, escritura, pronunciación, shadowing, italiano, qué falta, impacto en el plan. Veredictos C / A / R / E (conservar, ajustar, reescribir, eliminar), cada uno con razón de una línea.

**Humano** (no automatizable): prueba en el iPhone y, solo si hace falta, la escucha de dos videos (u14 y u17 principales). La corrección del italiano **no** pasa por un nativo (no es posible): se verifica con fuentes comprobables (`auditoria/_verificacion.md`).

## 3. Criterios de juicio (los mismos para todas las piezas)
1. **Objetivo:** ¿está alineado con el «Puedo…» de la unidad y con una tarea real?
2. **Respaldo:** ¿hay evidencia o un criterio explícito? Se anota cuál, y si es solo criterio propio se dice.
3. **Carga:** ¿cabe en el tiempo del bloque y en la memoria de trabajo (no mezcla reglas nuevas con vocabulario nuevo sin necesidad)?
4. **Retroalimentación:** ¿el aprendiz sabe por qué falló y qué hacer?
5. **Transferencia ES→IT:** ¿usa lo que ya sabe y avisa de las trampas reales (no de las genéricas)?
6. **Reciclaje:** ¿lo nuevo vuelve a aparecer en esta unidad y en las siguientes?
7. **Naturalidad y corrección:** ¿suena a italiano real y es correcto?
8. **Uso real:** ¿funciona en el iPhone, sin conexión, en 30 o 15 minutos?
Una pieza solo es «conservar» si pasa los ocho. «Ajustar» = cambio menor sin tocar la estructura. «Reescribir» = misma función, otro diseño o contenido. «Eliminar» = no sirve al objetivo.

## 4. Auditoría macro (temario, orden, vocabulario)
Método: comparar el temario actual con cuatro referencias y registrar una matriz tema × referencia.
1. Descriptores de nivel A1–A2 (MCER y, si es accesible, el Profilo della lingua italiana). Hoy solo hay una fuente verificada para el nivel de estructuras (programa B1 de la USC) y no es el MCER; se busca al menos una más.
2. Programas de universidades para hispanohablantes (por ejemplo las guías docentes de italiano de la UGR y los programas de la USC que aparecieron en la búsqueda; hay que abrirlas y leerlas, no se leyeron).
3. Frecuencia de uso: una lista de frecuencia con licencia abierta (a elegir y verificar; ver `07`).
4. Errores típicos de un hispanohablante (criterio general; se marca como no verificado si no hay fuente).
Preguntas: ¿falta algo que un A2 necesita (por ejemplo preposiciones articuladas, números grandes, verbos modales en pasado, expresiones de tiempo, hablar por teléfono, comparar, pedir indicaciones)? ¿sobra algo que es B1? ¿el orden respeta dependencias (artículos antes de partitivo, essere/avere antes de passato prossimo, imperfetto después del passato prossimo)? ¿el ritmo (24 unidades en ~6 meses) es realista? ¿el vocabulario de cada unidad es el más útil del tema?
Entregable: `docs/v2/auditoria/_temario.md` con la matriz, lo que falta, lo que sobra, el orden propuesto y el impacto.

## 5. Qué entra al plan y qué no («¿meter esto?»)
Todo candidato (contenido, función o actividad nueva) pasa por cinco preguntas; si falla alguna, va al «estacionamiento» y no al plan:
1. ¿Sirve al objetivo A2 del usuario (y a una tarea real: viajar, vivir, trámites, conversar)?
2. ¿Es de alta frecuencia o utilidad? (dato, no impresión)
3. ¿Hay respaldo o un criterio explícito?
4. ¿Cuánto cuesta (minutos por unidad) y qué se saca a cambio? El tiempo es fijo: 30 min diarios, con modo de 15.
5. ¿Cómo se mide que funcionó?

## 6. Procedimiento por PR de contenido (se aplica a cada lote, no depende de estudiar nada antes)
1. Regenerar las métricas automáticas (`npm run audit`) y los conteos de veredictos (`node scripts/check-veredictos.mjs`).
2. **Pasada de juicio A:** lectura de lo que cambia con la ficha. Salida: veredictos y hallazgos (la lectura completa inicial ya existe).
3. **Pasada B independiente:** otra sesión, sin ver la A, solo sobre italiano (corrección y naturalidad) y trampas del español. Salida: lista de dudas con confianza alta/media/baja.
4. **Conciliación:** donde A y B difieren, se razona y se anota quién tiene razón; lo dudoso va a `docs/dudas-italiano.md`.
5. **Síntesis:** los hallazgos entran al backlog (`auditoria/_backlog.md`) con severidad, esfuerzo y fase afectada.
6. **Revisión de plan:** se aplican las reglas de propagación de `11` y se registra qué cambió.

## 7. Formato del hallazgo
`id` (H-u05-03) · unidad · pieza · severidad · evidencia (cita corta o métrica) · propuesta · esfuerzo S/M/L · fase afectada · estado (abierto / aceptado / hecho / descartado) · decisión de quién (Claude / usuario).
Severidad: **Bloqueante** (error de italiano, información falsa o algo que impide estudiar), **Alta** (enseña mal o desaprovecha mucho tiempo), **Media** (mejora clara), **Baja** (pulido).

## 8. Cómo se le pregunta al usuario
Solo decide el usuario lo que cambia el alcance: orden o contenido del temario, quitar una función, tiempo diario, licencias y voces, cualquier pérdida de contenido ya escrito. Lo demás lo decide Claude y lo registra (correcciones, formato de ejercicios, métricas).
Formato de cada decisión: contexto en una línea · 2 o 3 opciones con su consecuencia · recomendación · qué pasa en el plan según cada respuesta · qué se hará por defecto si no responde. Las decisiones se agrupan por bloque, no una por una.

## 9. Criterio de cierre de la auditoría
- ✔ Las 24 unidades con veredicto en las seis columnas de la matriz (144 celdas).
- ✔ `_temario.md` terminado.
- ✔ Backlog priorizado y plan maestro actualizado (`11`, `13`, `14`).
- ✔ Cero hallazgos bloqueantes de **forma** (errores de italiano) detectados en la lectura; esto no equivale a «revisado por un nativo».
- ✘ Pendiente humano: muestra nativa (~20 frases), videos marcados, pruebas en el iPhone, pasada B independiente de lo reescrito.
