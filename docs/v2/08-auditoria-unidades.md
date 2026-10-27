# Auditoría unidad por unidad (u01–u24)

Alcance: **automática** sobre las 24 unidades (conteos reales del código, generados con un script de prueba temporal) y **lectura completa** de las lecciones u21, u22 y u23. La revisión lingüística de las otras 21 lecciones no se rehízo aquí: ya pasó por las revisiones de `docs/revision-italiano-fase*.md` y por los tests de contenido, pero el plan v2 exige repetirla con el protocolo de `07` (segunda pasada independiente) antes de generar audio, porque el audio fija los errores.

## Conteos

| Unidad | Ejemplos | Notice | Ejercicios | Fill | % fill | Regla (palabras aprox.) | Vocab | Dictado | Diálogo (líneas) | Marcas |
|---|---|---|---|---|---|---|---|---|---|---|
| u01 | 6 | 4 | 20 | 13 | 65 % | 126 | 20 | 6 | 8 | vocab corto |
| u02 | 6 | 3 | 26 | 20 | 77 % | 248 | 20 | 6 | 6 | casi todo fill, regla larga, vocab corto |
| u03 | 8 | 3 | 23 | 18 | 78 % | 253 | 20 | 6 | 8 | casi todo fill, regla larga, vocab corto |
| u04 | 6 | 3 | 20 | 16 | 80 % | 67 | 20 | 6 | 8 | casi todo fill, vocab corto |
| u05 | 6 | 4 | 27 | 21 | 78 % | 190 | 20 | 6 | 6 | casi todo fill, regla larga, vocab corto |
| u06 | 8 | 3 | 24 | 20 | 83 % | 210 | 20 | 6 | 8 | casi todo fill, regla larga, vocab corto |
| u07 | 6 | 3 | 27 | 22 | 81 % | 126 | 20 | 6 | 7 | casi todo fill, vocab corto |
| u08 | 8 | 3 | 20 | 16 | 80 % | 153 | 20 | 6 | 7 | casi todo fill, regla larga, vocab corto |
| u09 | 6 | 3 | 24 | 20 | 83 % | 91 | 20 | 6 | 7 | casi todo fill, vocab corto |
| u10 | 6 | 3 | 24 | 18 | 75 % | 158 | 20 | 6 | 8 | casi todo fill, regla larga, vocab corto |
| u11 | 6 | 3 | 20 | 15 | 75 % | 69 | 20 | 6 | 8 | casi todo fill, vocab corto |
| u12 | 9 | 3 | 20 | 16 | 80 % | 143 | 20 | 6 | 9 | casi todo fill, vocab corto |
| u13 | 6 | 3 | 22 | 17 | 77 % | 178 | 20 | 6 | 7 | casi todo fill, regla larga, vocab corto |
| u14 | 6 | 3 | 20 | 15 | 75 % | 98 | 20 | 6 | 8 | casi todo fill, vocab corto |
| u15 | 6 | 3 | 26 | 19 | 73 % | 207 | 20 | 6 | 8 | regla larga, vocab corto |
| u16 | 7 | 3 | 20 | 14 | 70 % | 260 | 23 | 6 | 10 | regla larga, vocab corto |
| u17 | 6 | 3 | 20 | 16 | 80 % | 230 | 23 | 6 | 11 | casi todo fill, regla larga, vocab corto |
| u18 | 6 | 3 | 19 | 14 | 74 % | 106 | 22 | 6 | 10 | vocab corto |
| u19 | 6 | 3 | 18 | 13 | 72 % | 186 | 20 | 6 | 9 | regla larga, vocab corto |
| u20 | 6 | 3 | 10 | 5 | 50 % | 155 | 20 | 6 | 8 | pocos ejercicios, regla larga, vocab corto |
| u21 | 6 | 3 | 16 | 8 | 50 % | 155 | 20 | 6 | 8 | regla larga, vocab corto |
| u22 | 6 | 3 | 18 | 13 | 72 % | 184 | 20 | 6 | 8 | regla larga, vocab corto |
| u23 | 6 | 3 | 16 | 11 | 69 % | 114 | 20 | 6 | 8 | vocab corto |
| u24 | 6 | 3 | 21 | 16 | 76 % | 147 | 20 | 6 | 10 | casi todo fill, vocab corto |

## Hallazgos que valen para todas las unidades
1. **Vocabulario:** 20 palabras por unidad, sin frase ni etiqueta. Plan: ~50 con frase, género/artículo, sílaba tónica y etiqueta de transferencia (transparente, parecida, falso amigo, opaca). Ver `07`.
2. **Ejercicios:** entre 50 % y 83 % son `fill` con el infinitivo entre paréntesis. Eso entrena conjugar con ayuda, no elegir la forma sin pista. Plan: la mitad de la práctica pasa a tipos sin pista (ordenar, traducir con varias respuestas aceptadas, corregir un error, transformar, completar diálogo) e intercalada con unidades anteriores. Las lecciones se conservan; los ejercicios nuevos van en `practice` de cada unidad.
3. **Reglas largas:** la meta del diseño es <120 palabras en el bloque de regla; varias unidades pasan de 150. No se reescriben todas: se parte la regla en «observa» + «regla corta» + tabla, y lo que sobra pasa a «Más detalle» desplegable.
4. **Dictado:** 6 frases por unidad; sube a 10 con niveles (huecos / parcial / completo).
5. **Diálogos:** de 6 a 11 líneas, sirven como diálogo de entrada del día 1 (requieren audio y traducción por línea).
6. **Ejemplos por lección:** 6–9; correcto para el mínimo, pero el plan suma textos graduados que reciclan la estructura.

## Hallazgos específicos
- **u20:** solo 10 ejercicios (el mínimo del test) y 5 `fill`. Reforzar a ≥ 18 antes de reclasificar. Discurso indirecto = reconocimiento (ver `04`).
- **u21 (leída completa):** contenido correcto en las formas (me lo, te lo, glielo, ce lo, ve lo, ne; posición con infinitivo e imperativo; concordancia del participio). Problemas: (a) el ejercicio «Ti piace la mia giacca? ___ presto domani.» mezcla *piacere* con *prestare* y no es coherente: cambiar a «Ti serve la mia giacca? Te la presto domani.»; (b) solo 8 de 16 son `fill`: bien, pero faltan ejercicios de *reconocimiento al oído* (el objetivo B1 es entender); (c) pasa a reconocimiento + fórmulas fijas.
- **u22 (leída completa):** contenido correcto. La nota de transferencia es acertada (creer que + indicativo en español vs. congiuntivo en italiano). Problemas: 13 de 18 son `fill` de conjugación con infinitivo entre paréntesis; falta contraste «cuándo congiuntivo / cuándo indicativo» en ejercicios (hay una sola nota en la regla); el mismo sujeto (*di* + infinitivo) tiene 2 ejercicios. Pasa a reconocimiento + fórmulas fijas; sumar ejercicios de elegir entre indicativo y congiuntivo.
- **u23 (leída completa):** contenido correcto; los tres tipos están bien descritos; el tipo 3 queda «solo reconocer» como ya dice la lección. Problemas: «Se potessi, ___ qui. (io, restare, condizionale)» revela la respuesta con la pista; dos ejercicios de `choice` repiten el mismo patrón de distractor (condizionale después de *se*). Reducir la producción del congiuntivo imperfetto, conservar la de *se* + presente y *se fossi in te*.
- **Cobertura del nivel (única fuente verificada, no oficial):** el programa B1 de la USC lista congiuntivo presente/passato, periodo ipotetico de tipos 1 y 3, discorso indiretto; no lista futuro ni condizionale (coherente con A2) ni pronombres combinados. Por tanto u20, u22 y u23 son B1 en esa fuente; u21 queda sin respaldo de nivel. Antes de decidir definitivamente, comparar con una segunda fuente (Profilo della lingua italiana, A1–B2) cuando esté accesible.

## Qué no se pudo auditar desde aquí
- La corrección del italiano de las 24 lecciones, 488 palabras, diálogos y dictados por una persona nativa. Se mitiga con el protocolo de `07` y con la revisión humana de una muestra de ~20 frases dudosas (ya pendiente).
- La calidad de los 48 videos de shadowing: siguen pendientes de escucha del usuario los de u08, u10, u13, u14, u17, u19 y u24.
