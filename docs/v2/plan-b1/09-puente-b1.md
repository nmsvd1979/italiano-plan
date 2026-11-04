# Frente 9 · El puente a B1 (u21–u23): ¿alcanza para entrar a B1?

## Respuesta corta
**Alcanza para entrar a un curso B1 con apoyo; no alcanza para rendir un examen B1.** Cubre bien las *estructuras* que los programas de curso ponen como entrada a B1 (pronombres combinados, congiuntivo presente, periodo ipotetico) pero solo a nivel de reconocimiento y fórmulas, en 3 semanas, y le faltan la **extensión**, la **variedad de textos** y la **producción larga** que piden las pruebas del CILS B1 (`_fuentes.md` §3–4). Además hoy **no hay forma de comprobar** si lo logró (frente 10).

## Evidencia
| Qué | La app | Fuente B1 |
|---|---|---|
| Estructuras | u21 pronombres combinados (16 ejercicios, 8 `fill`), u22 congiuntivo presente (18; 6 `fill`), u23 periodo ipotetico (16; 11 `fill`). Una lectura (125–149 palabras), una consigna de escritura (mín. 15–18 palabras), un diálogo (60–73 palabras) cada una (`capacidad.md` §a) | Ca' Foscari y USC: entran a B1 *trapassato prossimo*, combinados, discorso indiretto, congiuntivo presente y passato, congiuntivo imperfetto, condizionale passato, periodo ipotetico (`_temario.md`). **CILS B1** (hoy): no nombra ninguno de ellos (`_fuentes.md` §3) |
| Apariciones medidas hoy en `src/content` (gramática, diálogos, lecturas, sin pista) | congiuntivo imperfetto (*fossi, avessi…*) 70 · *sia/abbia/vada/stia* 81 · *trapassato prossimo* 3 · *condizionale passato* 1 · *congiuntivo passato* 5 | — |
| Escritura | mín. 15–18 palabras; ninguna consigna ≥ 40 | tareas de 100–120 y 50–80 palabras |
| Habla | solo el diálogo de rol | monólogo ~2 min + diálogo 2–3 min |
| Lectura | texto más largo 163 palabras (u24); 125–149 en el puente | 3 textos, 800–1.000 palabras en total |
| Escucha | diálogo más largo 89 palabras (u24); una sola voz | 3 textos, 600–800 palabras, dos hablantes nativos, llamadas y radio |
| Producción de estructuras | reconocer y fórmulas (`13` §2) | — |

## Qué le falta (con tamaño)
**A. Extensión y producción (lo que más pesa; frentes 1 y 2 ya lo incluyen para u21–u23).**
- `extend` de escritura de 80–100 palabras en u21, u22 y u23 (rango B1 del CILS) → ver `01`.
- Monólogo de ~120 s en las tres → ver `02`.

**B. Textos largos (este frente).**
- **3 lecturas largas de 250–300 palabras** con 4 preguntas (3 de opción múltiple y 1 breve, mismo esquema que `Lectura`): carta o mail informal, artículo divulgativo corto, texto de instrucciones/reglamento. Total ≈ 800 palabras, que es el orden de magnitud del CILS (800–1.000 en tres textos). Archivo nuevo `src/content/lecturas-b1.json` (esquema `Lectura`, clave `b1-1`…`b1-3`) y ruta `#/lectura-b1/:n` que reutiliza `LecturaScreen` pasándole los datos. **12 preguntas.**
- **3 audios largos de 150–220 palabras** con 4 preguntas: una llamada telefónica, un aviso/boletín tipo radio y un diálogo cotidiano de dos personas. Archivo `src/content/escucha-b1.json`: `{ lines: {who, it, es}[], preguntas }`; reproducción por línea con `say()` (clips). Total ≈ 600 palabras (CILS: 600–800). **12 preguntas.** **Límite explícito:** solo hay una voz con licencia aprobada (Serena, `decision-voz.md`; la otra candidata quedó descartada). «Dos hablantes nativos», ruido de fondo y radio real **no se pueden cubrir** sin otro recurso; se compensa con el input libre (podcasts de `plan.ts`, ya en el día 7) y se dice en la pantalla.
- Los 6 textos se escriben **solo con el léxico y las estructuras vistas hasta u23** (≥ 95 % de palabras conocidas) y se les calcula el informe de léxico acumulado.

**C. Estructuras que aún no existen en la app (decisión D7).**
- *Trapassato prossimo*, *condizionale passato*, *congiuntivo passato* y el *passivo* (0 apariciones) solo importan si la persona va a un **curso universitario B1** (Ca' Foscari/USC). Opciones: (1) **no agregarlas** y dejarlas como «lo que verás en B1» (recomendado: el CILS B1 no las nombra, y una unidad nueva completa cuesta del orden de cien ítems, ver abajo); (2) agregar **una unidad de puente nueva** `u29` («Contar lo anterior»: *trapassato*, *condizionale passato* y *congiuntivo passato* a nivel de reconocer y fórmulas), con todas las cuotas de `CLAUDE.md` (lección con ≥ 5 ejemplos, ≥ 3 `notice`, ≥ 10 ejercicios; vocabulario 18–24; dictado 10; diálogo ≥ 6 líneas; escritura; pronunciación; lectura de 4 preguntas; 12 sin pista; 10 ítems de prueba; 2 videos de shadowing). Ese costo es del orden de **100–140 ítems** de contenido nuevo (suma de las cuotas anteriores: ≈ 6 ejemplos, 3 `notice`, 16 ejercicios, 20 palabras + ≈ 30 ampliadas con frase, 10 dictados, ≈ 10 líneas de diálogo, 1 escritura, 1 lectura con 4 preguntas, 12 sin pista, 10 de prueba, ≈ 12 de pronunciación; es una suma de las cuotas, no una medida de una unidad real) y exige añadir `u29` a `UNITS`, `COURSE`, `partes.ts` si se parte, `pron-sequence.json` y `has`. No se hace sin la decisión.
- *Relativas* (`04`) y *causales* (*poiché, siccome*), *ciascuno*: reconocimiento, 4–8 ejercicios en u22/u23 (`04`).

## Cómo se arma (opción recomendada, sin u29)
**Código (PR 9a, M).** Dos rutas y pantallas pequeñas que reutilizan `LecturaScreen`/`TestRunner`; botones desde la unidad u23 y desde la tarjeta «Ruta» de `05`. No se agregan al ciclo de 7 días (no cambian los minutos): son un **módulo opcional «Práctica B1»** de 3 lecturas + 3 audios que se hace después de u23. Resultado guardado con `appendLog` (`b1:lectura`, `b1:escucha`) para el frente 10.
**Contenido (PR 9b lecturas, 9c audios).** 6 textos + 24 preguntas ≈ 1.600 palabras de italiano nuevo.
**Audio (PR 9d, lo corre la persona).** 3 audios × 4–6 líneas de Serena + las lecturas (6 párrafos cada una) ≈ 40–60 clips, ≈ 0,6 MB (estimado).

## Cómo se verifica el italiano
Léxico acumulado + V1 (`verificar-fuentes.mjs`) + V2 con fuente abierta para toda construcción del puente (congiuntivo, combinados, ipotetico) + V3 segunda pasada. Los tipos de texto (carta, artículo, reglamento, llamada, aviso) se toman de la lista de géneros del CILS B1 (`_fuentes.md` §3); la fuente describe géneros, no frases concretas, así que **cada frase** necesita su propia verificación. Dudoso → `docs/dudas-italiano.md` y sin audio.

## Tests nuevos
1. `lecturas-b1.test.ts`: 3 textos de 250–300 palabras, 4 preguntas cada uno (3 `mc` + 1 `short`), `answer` en rango, respuestas breves aceptadas; léxico acumulado ≥ 95 % con las unidades hasta u23 (usa `appLexicon`).
2. `escucha-b1.test.ts`: 150–220 palabras, 4 preguntas, cada línea tiene clip (cuando existan) o está en la lista de pendientes.
3. Los existentes de contenido siguen vigilando u21–u23 (ejemplos, `notice`, ejercicios).

## Tamaño y orden
PR 9a (M) → 9b (M) → 9c (M) → 9d (audio, persona). Un tema por PR. La opción 2 (u29) sería un frente propio de ≥ 4 PR (lección y ejercicios, vocabulario y dictado, lectura y pruebas, audio y shadowing).

## Dependencias
`01` y `02` para el `extend` y el monólogo del puente · `05` (tarjeta Ruta) · `07` (clips) · `10` (el módulo alimenta la medida de preparación).

## Qué no se puede medir
Si la persona *entiende* los textos B1 de verdad: las preguntas de opción múltiple miden comprensión, no producción. No hay un banco B1 oficial abierto que pueda copiarse (los ejemplos del CILS, `Esempi_prove_di_esami.htm`, no se abrieron y no se reproducen). El umbral de aprobación del CILS B1 no se pudo abrir.
