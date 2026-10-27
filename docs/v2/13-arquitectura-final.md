# Arquitectura final del curso (resultado de la auditoría)

Este documento es **el temario y el orden vigentes**. Reemplaza lo que `00`, `04` y `07` dicen sobre «24 unidades en el orden actual». Nace de `auditoria/_veredictos.md` y `auditoria/_temario.md`; si esos cambian, este cambia (regla de propagación en `11`).

## 1. Decisiones de estructura (todas derivadas de la auditoría)
1. **Los ids de unidad no cambian** (`u01`…`u24`): el progreso guardado usa esos ids. El **orden** del curso pasa a una lista aparte (`COURSE`), así se puede reordenar sin tocar claves.
2. **Siete unidades se parten en semana A y semana B** (u02, u03, u05, u06, u07, u14, u15), con el mismo id y una marca `part`. Cada semana tiene su ciclo de 7 días y su mini-prueba.
3. **Cuatro unidades nuevas** llenan los huecos graves (ids `u25`–`u28`, ubicadas donde corresponde en el orden).
4. **u20 se recorta a conectores** y queda en el núcleo A2. **u21–u23 forman el «Puente a B1»** (opcional). **u24 es el cierre del núcleo** (proyecto final + prueba de nivel A2).
5. **Dentro de unidades existentes** se insertan seis bloques pequeños (c'era, *mi è piaciuto*, pronombres tónicos, *ci vuole*, irregulares frecuentes, conectores de secuencia).
6. **El contenido ya escrito se conserva**: lecciones, ejemplos, diálogos, dictados y pares mínimos se reubican y se amplían; no se tira nada salvo lo que la auditoría marca como incorrecto o incoherente.

## 2. Orden final (macro)
Fases y puntos de control. Una semana = un ciclo de 7 días (`04`). «Estado»: **existente** (contenido ya escrito, se ajusta), **nueva** (se escribe), **parte** (existente partida).

| # | Fase | Semana | Id | Contenido (qué entra) | Estado | Contraste de pronunciación nuevo | Tipo de texto graduado |
|---|---|---|---|---|---|---|---|
| 1 | F1 Primer contacto | 1 | u25 | Alfabeto y deletreo; *Come ti chiami? / Mi chiamo*; *Di dove sei?*; números 0–10; frases de supervivencia (*Non ho capito, più piano, può ripetere, come si dice…?, cosa significa?*); saludos básicos | nueva | vocales puras + acento de la palabra y tilde | cartel y mensaje corto |
| 2 | | 2 | u01 | *Essere*, *tu / Lei*, saludos, presentarse | existente | c / g suaves y duras | presentación escrita |
| 3 | | 3 | u02A | Artículos, plurales regulares, *avere*, *c'è / ci sono* | parte | consonantes dobles (I) | aviso de alojamiento |
| 4 | | 4 | u02B | *Piacere*, plurales especiales (*-co/-chi*, *uomini*), preposiciones de lugar básicas (*su, sotto, dentro, fuori, davanti, dietro*) | parte + inserción | b / v | descripción de un barrio |
| 5 | | 5 | u03A | Números hasta 100, la hora | parte | tilde final (*tré, perché, caffè, città*) | horario de tren |
| 6 | | 6 | u03B | Fechas, días y meses, precios | parte | *qu* (*quaranta, quindici*) | ticket y menú de precios |
| 7 | | 7 | u04 | Verbos regulares, *volere / potere / dovere*, *vorrei*; *andare* y *fare* como fórmulas; *Il conto, per favore* | existente | r / rr | menú de bar |
| — | **Control F1** | | | prueba de fase | | | |
| 8 | F2 Moverte y describir | 8 | u05A | *a / in / da*, andare–venire–uscire, preposiciones articuladas | parte | *s* + consonante (*studente, Spagna*) | indicaciones escritas |
| 9 | | 9 | u05B | Falsos amigos, direcciones (*a destra, a sinistra, dritto*), carteles (*vietato, uscita*) | parte | *z* (*pizza, grazie*) | señalización y aviso |
| 10 | | 10 | u06A | Posesivos, *questo / quello* | parte | *ch / gh* frente a *ci / gi* | etiqueta de producto |
| 11 | | 11 | u06B | Adjetivos, colores, tallas, comprar ropa (*bello / buono* se reconocen, se producen en u12) | parte | *gn* (*bagno, gnocchi*) | anuncio de tienda |
| 12 | | 12 | u26 | **Personas y familia:** *la famiglia*, descripción física y de carácter, profesiones, nacionalidades, *Che lavoro fai?*, *Ho due fratelli* | nueva | *gli* (*famiglia, figlio*) | descripción de una persona |
| 13 | | 13 | u07A | Reflexivos y la rutina | parte | *sc* (*pesce, sciarpa*) | día de una persona |
| 14 | | 14 | u07B | *Stare* + gerundio, *essere / stare*, irregulares frecuentes (*fare, dire, dare, stare, bere*) | parte | *h* muda (*ho, hai, ha, hanno*) | mensaje «qué estás haciendo» |
| 15 | | 15 | u08 | Preguntas, negación, frecuencia, cantidad | existente | entonación de la pregunta | entrevista corta |
| 16 | | 16 | u27 | **Tiempo libre, gustos y clima:** *sapere* y *conoscere*, *giocare a / fare*, hobbies, *Che tempo fa?*, estaciones, indefinidos (*ogni, qualche, tutti, alcuni, altro*) | nueva | *s* sorda y sonora (*casa, rosa*) | pronóstico del tiempo |
| — | **Control F2** | | | prueba de fase | | | |
| 17 | F3 Contar el pasado | 17 | u09 | *Passato prossimo* con *avere*; conectores de secuencia (*prima, poi, dopo, allora, mentre*) | existente + inserción | dobles en participios (*fatto, detto*) | diario del fin de semana |
| 18 | | 18 | u10 | *Passato prossimo* con *essere*, concordancia, *mi è piaciuto*, *è stato* | existente + inserción | vocal final (*-o / -a / -i / -e*) | relato de viaje |
| 19 | | 19 | u11 | *Imperfetto* y su contraste con el *passato prossimo*; *c'era / c'erano*; **práctica ampliada (≥ 40 ítems)** | existente + inserción | acento en formas verbales (*parlavamo*) | cuento breve |
| 20 | | 20 | u12 | Comparativos, superlativos, partitivo, *bello / buono*; pronombres tónicos (*di me, come te*) | existente + inserción | *-issimo* y acento | folleto de mercado |
| 21 | | 21 | u28 | **Comer fuera:** menú, *antipasto / primo / secondo / contorno / dolce*, pedir y preguntar, *il coperto*, alergias y preferencias, pagar | nueva | *nonna / nona, panna / pane* | menú de restaurante |
| — | **Control F3** | | | prueba de fase | | | |
| 22 | F4 Personas y planes | 22 | u13 | Pronombres directos e indirectos; *mi / ti piace*; *con me, con te, per me*; *glielo* se reconoce | existente + inserción | elisión (*l'ho visto*) | mail de devolución |
| 23 | | 23 | u14A | *Ci* y *ne*; *ci vuole / ci vogliono* | parte + inserción | *ce / ci* frente a *che / chi* | receta |
| 24 | | 24 | u14B | Imperativo *tu / Lei / voi*, afirmativo y negativo, direcciones | parte | *dammi / dimmi* (raddoppiamento) | instrucciones |
| 25 | | 25 | u15A | Futuro simple (planes, suposición) | parte | tilde final del futuro (*parlerò, parlerà*) | agenda y planes |
| 26 | | 26 | u15B | *Condizionale* de cortesía y consejo, *se* + presente, invitar, aceptar, rechazar | parte | *-rei / -rebbe* | invitación |
| 27 | | 27 | u16 | Salud y emergencias | existente | *sch* (*schiena*) | prospecto de un remedio |
| — | **Control F4** | | | prueba de fase | | | |
| 28 | F5 Vivir allá | 28 | u17 | Alquiler, ordinales, relativo *che*, problemas de la casa, trámites | existente | cadenas de consonantes (*quinto, ottavo, settimo*) | anuncio de alquiler |
| 29 | | 29 | u18 | Teléfono, mensajes y mails; *per / tra*; recíproco | existente | palabras *sdrucciole* (*telefono, numero, camera*) | mail formal e informal |
| 30 | | 30 | u19 | *Si* impersonal, *da / per / fa*, *stare per* | existente | ligazón (*da quanto tempo*) | reglas de un lugar |
| 31 | | 31 | u20 | **Conectores** (*perché, ma, però, quindi, allora, invece, infatti, comunque, insomma*), opiniones simples (*secondo me, mi sembra*), *mi ha detto che…* como fórmula | existente recortada | acento final de los conectores | conversación transcrita |
| — | **Control F5** | | | prueba de fase | | | |
| 32 | F6 Cierre A2 | 32 | u24 | Proyecto final (contar una experiencia completa), repaso de los ocho errores típicos, **prueba de nivel A2** | existente rehecha | sin contraste nuevo (repaso por oído en SRS) | relato largo |
| — | **Puente a B1** (opcional, reconocimiento + fórmulas) | | | | | | |
| P1 | | — | u21 | Pronombres combinados: reconocer; producir *dammelo, te lo dico, me lo dai?, glielo dico* | existente reclasificada | *gli* + *lo* (*glielo*) | mensaje |
| P2 | | — | u22 | Congiuntivo presente: reconocer; producir *penso che sia, credo che abbia ragione, spero che tu stia bene, è importante che…* | existente reclasificada | *sia / abbia* (vocales juntas) | columna de opinión corta |
| P3 | | — | u23 | Hipótesis: *se fossi in te…* (consejo), tipo 2 reconocer, tipo 3 solo reconocer | existente reclasificada | *-ssi* (*avessi, fossi*) | carta de consejo |

**Totales.** Núcleo: 32 semanas (32 × 7 = 224 días). Puente: 3 semanas más. Si estudias 30 min al día son ≈112 h en modo normal y ≈56 h en modo corto. Con «Hacer más hoy» (un día extra cuando quieras) se acorta; el calendario real depende de cuánto hagas, y se calcula con tu ritmo real (`06`).
**Unidades distintas:** 28 (24 originales + 4 nuevas) → ≈1.400 palabras con frase, más las fórmulas.

## 3. Cómo se enseña cada cosa (micro)
La mecánica diaria está en `04`; esto es el criterio por habilidad.

| Qué | Cómo se enseña | Medida de éxito |
|---|---|---|
| **Gramática** | Descubrir con 3 preguntas «Primero fíjate» → regla corta (<120 palabras, tabla y la trampa del español) → práctica guiada con pista → práctica variada **sin pista** → dos frases propias → vuelve en SRS | mini-prueba ≥ 75 % a la primera, y acierto SRS ≥ 80 % a 3 semanas |
| **Vocabulario** | 6–8 palabras al día, siempre dentro de una frase, con audio, artículo, sílaba tónica y etiqueta (transparente / parecida / falso amigo / opaca). Tarjetas SRS en dos direcciones (reconocer y producir) y de oído | palabras con ≥ 2 repasos acertados |
| **Escucha** | Día 1: diálogo solo por oído + 3 preguntas, después con texto. Dictado por niveles (huecos → parcial → completo). Texto graduado leído en voz de la app | preguntas de comprensión; dictado con diff por palabra |
| **Lectura** | Texto graduado del día 5, un tipo de texto A2 por unidad (cartel, anuncio, mail, menú, receta…), con preguntas y palabras clave | preguntas ≥ 70 % |
| **Habla** | Repetir líneas del diálogo; decir un diálogo con rol, grabar y comparar con el modelo; shadowing propio. Sin evaluación automática de pronunciación: es comparación de oído | frecuencia de práctica (no hay métrica fiable) |
| **Escritura** | Día 6: consigna con modelo, lista de autocorrección, y corrección manual por Claude (copiar y pegar la versión corregida; se guarda con las dos versiones) | textos entregados y errores recurrentes |
| **Pronunciación** | Un contraste nuevo por semana (tabla del §2), percepción antes que producción, tarjetas de oído en SRS | acierto en tarjetas de oído |
| **Pragmática** | La nota «Ojo, en español…» de cada unidad, tu / Lei, fórmulas de cortesía | revisión en la prueba de fase |
| **Repaso** | SRS diario + acumulativo del día 7 + intercalado | cola SRS estable (≤ 60) |
| **Evaluación** | Mini-prueba por semana (75 %), prueba de fase, prueba de nivel A2 en u24 | `06` |

## 4. Qué cambia en el código (para Code)
- `src/content/course.ts` (nuevo): `COURSE: CourseStep[]` con `{ id, unit, part?: "A"|"B", phase, kind: "core"|"bridge" }`. `UNITS` sigue existiendo; `COURSE` define el orden y las partes.
- `UnitMeta` gana `parts?: { A: …; B: … }` para repartir el contenido de una unidad entre sus dos semanas (qué ítems de lección, ejercicios, vocabulario y dictado van a cada una). Lo que no se asigna a una parte se asigna a ambas como repaso.
- Progreso: la clave de actividad conserva el id de unidad; las partes agregan sufijo (`u02#A`). Una unidad marcada como hecha en el sistema antiguo vale como **A y B hechas** (`14`).
- `daysOf(step)` recibe un `CourseStep`, no un `UnitMeta`.
- `PHASES` y `phaseTest` se reajustan a las fases F1–F6 de este documento.
- Las cuatro unidades nuevas empiezan con `ready: false` y se activan al fusionarse su contenido (G). El curso funciona con las que estén listas; la semana de una unidad no lista se muestra con el contenido existente cuando lo hay, y como «en preparación» cuando no.
- El orden de pronunciación y los pares mínimos nuevos entran como datos (`pron-sequence.json`) con la bandera `AUDIO_PENDING` hasta tener audio nativo.

## 5. Contenido nuevo que hay que escribir (G): inventario
| Pieza | Cantidad |
|---|---|
| Unidades nuevas completas (lección, ejemplos, preguntas, ejercicios, diálogo, dictado, escritura, pronunciación, texto graduado, ítems de prueba) | 4 (u25–u28) |
| Bloques insertados en existentes | 6 (c'era, *mi è piaciuto*, tónicos, *ci vuole*, irregulares frecuentes, conectores de secuencia) |
| Vocabulario con frase y etiquetas | ≈ 50 × 28 unidades |
| Textos graduados con preguntas | 1 por semana ≈ 32 + 3 del puente |
| Ejercicios sin pista y de producción | 15–20 nuevos por semana |
| Práctica reforzada de u11 | ≥ 40 ítems |
| Pares mínimos con audio para las unidades con pares vacíos (u05, u19, u20, u21) | los de la tabla del §2 |
| Partición de lección/ejercicios para las 7 unidades partidas | 7 |
| Ajustes por hallazgo (`auditoria/_backlog.md`) | ver backlog |

## 6. Lo que NO cambia
La app sigue siendo una PWA sin backend, el español neutro con tuteo, las claves `italianPlan.*`, las reglas de git, y la prohibición de marcar como verificado lo que no se probó en el iPhone.
