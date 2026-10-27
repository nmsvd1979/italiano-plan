# Verificación del italiano con fuentes comprobables (reemplaza la revisión nativa, D-04)

Fecha: 27-oct-2026. Motivo: no hay hablante nativo disponible (decisión del usuario: «D4 no es posible»). Regla nueva: **nada se da por correcto por «sonar bien»**; se confirma contra una fuente que cualquiera puede abrir, o queda marcado como «sin confirmar» y no se usa para audio ni se presenta como verificado.

## 1. Niveles de evidencia (se usan en todo el plan)
| Nivel | Qué significa | Cómo se obtiene |
|---|---|---|
| **V1 automático** | La palabra existe en una lista de palabras italianas y/o es frecuente en un corpus real | `scripts/verificar-fuentes.mjs` (reproducible) |
| **V2 fuente** | La forma o la frase aparece en una fuente italiana abierta (diccionario, academia, sitio de enseñanza de una institución) | consulta puntual, se anota la URL aquí |
| **V3 segunda pasada** | Otra sesión revisa con lista de comprobación gramatical (`07`, G5) | proceso |
| **Sin confirmar** | No se encontró fuente | se anota en `docs/dudas-italiano.md`; no se genera audio; se prefiere una alternativa que sí tenga V2 |

Ninguno de estos niveles equivale a «revisado por un nativo»; ese límite se mantiene escrito.

## 2. Resultado V1 sobre el curso actual (24 unidades)
- Fuente de palabras: [napolux/paroleitaliane](https://github.com/napolux/paroleitaliane) (≈280.000 formas + 8.900 nombres propios). Fuente de frecuencia: [hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords), `it_50k` (subtítulos de cine y TV, 2018). Las listas se usan solo para verificar y **no se copian al repositorio**.
- Texto en italiano analizado: **2.770 fragmentos** (vocabulario, dictados, diálogos, ejemplos, cursivas de reglas, respuestas y opciones de ejercicios).
- **Ortografía:** 194 formas distintas no reconocidas. Revisadas una por una: **ninguna es un error de ortografía del curso**. Son (a) texto en español dentro de respuestas y explicaciones, (b) morfemas escritos solos en las tablas de reglas (*-isc-, -endo, -evamo…*), (c) palabras largas legítimas fuera de la lista (*centocinquanta, quarantaquattro, restituirla, consigliarmi, compreremmo, Colosseo*), (d) nombres propios, y (e) **distractores deliberadamente incorrectos** de ejercicios (*gonni, studii, anderò, gioci*), que son correctos como distractor.
- **Frecuencia del vocabulario** (488 palabras): 225 (46 %) están entre las 1.000 más frecuentes del corpus; 324 (66 %) entre las 2.000; 412 (84 %) entre las 5.000. Las 76 restantes son casi todas vocabulario de situación (*la caparra, il binario, il rubinetto, la ricetta, il cornetto*): necesarias para vivir en Italia aunque raras en subtítulos de cine. Lista en el script (`rare.txt`). Se corrige la meta de G3: **el 60 % del vocabulario nuevo sale de las 2.000 más frecuentes y el resto es de situación etiquetado como tal**.
- **Duplicados** entre unidades: *restituire, scontrino, ricetta* (ya registrado en `H-all-04`).
- **Qué NO detecta este análisis:** concordancia (*la problema*), palabras reales usadas en el lugar equivocado (*ho / o*), calcos del español con palabras que sí existen, naturalidad. Eso queda en V2 y V3.

## 3. Frases dudosas: qué se pudo confirmar (V2) y qué no
| Frase (unidad) | Resultado | Fuente / acción |
|---|---|---|
| *Ci sto!* (u15) | **Confirmada** como «acepto, me sumo» | [Learnamo, «Stare»](https://learnamo.com/?p=5520): «Andiamo in pizzeria dopo? – Sì, ci sto!» |
| *Mi alleno* (u08) | **Confirmada** (verbo reflexivo: *io mi alleno, tu ti alleni…*). El problema es otro: no está enseñada en la unidad | [Lingua-Italiana.it](https://www.lingua-italiana.it/en/verbi-italiani-en/allenarsi.html). Acción: enseñar la palabra en u08 (`H-u08`). |
| *Le sta bene* (u13) | **Parcial.** «Sta bene» en el sentido de «va bene» es válido y algo más formal; «sta bene» para armonía / ajuste también. La fuente no trata la forma *Le* | [Libreriamo](https://libreriamo.it/lingua-italiana/lingua-italiana-puo-usare-sta-bene/). Acción: en ropa se usa *Le sta bene* (ajuste); se evita *Le va bene* con ese sentido hasta confirmarlo. |
| *Aspetto la Sua chiamata* (u18) | **Confirmada como convención:** la mayúscula de cortesía es opcional; en escritura formal se recomienda | [Libreriamo](https://libreriamo.it/lingua-italiana/lingua-italiana-i-pronomi-maiuscolo/). Acción: la lección dice «convención, opcional». |
| *Vuole altro?* (u04) | **Sin confirmar.** Sí aparece *Vuole qualcos'altro?* en una fuente | [Kaiwa, pedir café](https://trykaiwa.com/blog/italian-cafe-ordering-realistic). Acción (G0): cambiar a *Vuole qualcos'altro?*. |
| *Cosa prende?* (u04) | **Sin confirmar** en la fuente consultada | `dudas-italiano.md`. Acción: usar *Che cosa desidera?* solo si se confirma; si no, *Dica pure* / *Mi dica* con fuente. |
| *Ecco il resto* (u03) | **Sin confirmar** en la fuente consultada (sí aparece *Resto a posto*) | `dudas-italiano.md` |
| *Ecco a Lei* (u16) | **Sin confirmar** | `dudas-italiano.md`. Alternativa conservadora: *Ecco qui*. |
| *più cinquanta di spese* (u17) | **Sin confirmar** la elipsis de *euro* | Acción (G0): escribir *più cinquanta euro di spese*. |
| *Credo di sì / di no* (u22) | **Sin confirmar** (las fuentes halladas no tratan esa construcción) | `dudas-italiano.md` |
| *Ci sentiamo dopo cena?* (u07), *Siete state lì una settimana?* (u10), *Gliene parlo io* (u21), *Potresti consigliarmi un ristorante?* (u24) | **Sin consultar** en esta pasada | siguen en `dudas-italiano.md` |

Conclusión: de 14 frases de la tabla, **3 confirmadas, 1 parcial, 6 sin confirmar y 4 sin consultar**. «Sin confirmar» significa que la fuente que abrí no la contiene; no prueba que esté mal. Ninguna se cambió de forma automática; los cambios van en G0 con su fuente, y no se genera audio de ninguna «sin confirmar».

## 4. Videos de shadowing (u08, u10, u13, u14, u17, u19, u24): lo que se comprobó sin escuchar
Se leyeron el inicio de las transcripciones automáticas (`docs/transcripciones/`) y las métricas (`docs/videos-metricas.md`).
- **Comprobado:** los siete videos principales están en italiano (detección 97–100 %), son habla real de profesores o entrevistas, y tratan el tema de la unidad (excepto u17, ver abajo). Velocidad: u08 137 palabras/min (rápido para A2), u14 89 (lento, con muchas pausas), u19 127, u13 111, u10 120, u24 103, u17 118.
- **Observaciones:** u08 principal es un video de entrevistas callejeras (habla espontánea y rápida; difícil como primer shadowing; se mantiene el alterno como opción por defecto). u14 principal casi no usa el vocabulario de la unidad (0/20) y tiene 19 pausas largas (diapositivas con voz). u17 principal empieza con preguntas y respuestas de presentación personal («Come ti chiami? Mi chiamo Marco») antes del tema de la vivienda: 76 pausas largas; sirve para el input pero no es un buen modelo de shadowing continuo.
- **No comprobado (requiere oído):** claridad del audio, ruido, música de fondo, si el hablante es entendible para un A2. Eso solo lo puede decidir una persona escuchando. Queda como tarea **opcional** del usuario y **solo** para u17 y u14 principal; para el resto las métricas son suficientes y el shadowing sigue con el video alterno si el principal resulta difícil.

## 5. Qué cambia en el plan
1. D-04 («revisión nativa») **se cierra como no posible** y se reemplaza por este protocolo (V1 → V2 → V3) en `07` (G5), `09`, `12` y `_backlog.md`.
2. Los niveles de evidencia se anotan en cada PR de contenido: lista de frases nuevas con su nivel (V1/V2/V3) en `docs/v2/revision-fuentes.md`.
3. Regla para el audio (fase C): **solo se sintetiza lo que está en V2 o V3 y no figura en `dudas-italiano.md`.**
4. G0 se amplía con las tres correcciones de §3 (*Vuole qualcos'altro?*, *cinquanta euro*, *Le sta bene*) y con la enseñanza de *mi alleno*.
5. El script `scripts/verificar-fuentes.mjs` se ejecuta en cada PR de contenido; las formas nuevas no reconocidas deben justificarse en el PR.
