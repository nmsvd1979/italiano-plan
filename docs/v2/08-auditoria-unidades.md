# Auditoría unidad por unidad (u01–u24): resumen

**Estado (27-oct-2026): auditoría completa.** Las 24 unidades se leyeron enteras (lección, ejemplos, preguntas, ejercicios, vocabulario, diálogo, dictado, escritura, pronunciación) y se valoraron en 6 columnas. El juicio completo está en `auditoria/_veredictos.md`; las métricas automáticas en `auditoria/uXX.md` (`npm run audit`); el temario en `auditoria/_temario.md`; el backlog en `auditoria/_backlog.md`. Este archivo es solo el resumen y el cuadro de conteos.

## Resultado en una página
- **El italiano de la app es sólido en forma.** En la lectura completa no encontré errores de gramática, ortografía ni concordancia que bloqueen el audio. Es una lectura de una sola persona y no hay nativo posible: se complementó con verificación contra fuentes (`auditoria/_verificacion.md`: 2.770 fragmentos sin errores de ortografía; de 14 frases dudosas, 3 confirmadas, 1 parcial, 6 sin confirmar y 4 sin consultar).
- **El problema es de diseño, no de corrección.** 19 de 24 unidades tienen al menos una pieza marcada para reescribir o reubicar, pero casi todas son reubicaciones (orden, partición, ejercicios sin pista, pronunciación), no reescrituras del italiano. Solo 7 de 24 lecciones (29 %) necesitan reescribir la regla.
- **Sobrecarga:** siete unidades enseñan 4–5 temas a la vez → se parten en semana A y B.
- **Huecos de temario graves:** deletreo y supervivencia, familia y profesiones, tiempo libre y *sapere*, restaurante → 4 unidades nuevas (u25–u28) y 6 bloques insertados.
- **Nivel:** u21–u23 y parte de u20 son B1 según tres programas de curso → «Puente a B1» opcional; u20 queda en el núcleo recortada a conectores.
- **La unidad más importante del A2 (u11, imperfetto vs passato prossimo) tiene solo 20 ejercicios.**
- **Pronunciación:** desbalanceada (dobles en 9 unidades, acento recién en u11, cuatro unidades con pares vacíos).
- **Input:** casi no hay lectura ni escucha graduadas; se agrega un texto por semana.
- **Qué no se pudo auditar:** nativez del italiano, calidad de los videos de shadowing (u08, u10, u13, u14, u17, u19, u24 pendientes de tu escucha), frecuencia del vocabulario, eficacia real (la miden los datos de uso).

## Conteos automáticos (de las métricas, para consulta)

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

## Hallazgos por unidad
Están en `auditoria/_veredictos.md` (matriz y notas) y por id en `auditoria/_backlog.md`. Los tres de la primera pasada siguen vigentes: u20 (10 ejercicios), u21 (ejercicio *piacere/prestare* incoherente) y u23 (pista de tiempo). Se suman los hallazgos de las demás unidades.

## Qué se hace con esto
Todo lo anterior está convertido en el temario de `13-arquitectura-final.md` y en los carriles de `11-plan-maestro-vivo.md`. La continuidad con lo que ya estudiaste está en `14-continuidad-progreso.md`.
