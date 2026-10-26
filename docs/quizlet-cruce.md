# Cruce Quizlet ↔ vocabulario de la app

Fuente: set «Vocabulario español-italiano – 5000 palabras más usadas» (Quizlet). El PDF exportado trae **1400 términos** (el set completo es más grande; falta exportar el resto). Datos en `data/quizlet-1400.json` (`it`, `es`, `n` = posición en el set, `enApp` = unidad de la app donde ya aparece, o null).

## Hallazgos
- De 445 palabras distintas del vocabulario de la app (u1–u24), **165 aparecen en el set**. De los 1400 términos del set, **169 ya están en la app**.
- El set es **temático** (saludos, pronombres, colores, medidas, ropa, bebidas, familia, salud…), no una lista de frecuencia pura, y **no sigue el orden de las unidades**. Los bloques de 200 términos cubren 35, 48, 35, 15, 11, 19 y 6 palabras de la app.
- Conclusión: Quizlet sirve como **refuerzo de vocabulario temático**, no como motor de las sesiones. Mantenerlo como enlace externo, como hoy, es razonable.

## Qué sigue (se decide en el chat, no en Code)
1. Exportar el resto del set (hasta 5000) para tener la lista completa.
2. Decidir si algunos bloques temáticos se vinculan a unidades concretas (por ejemplo, ropa y colores con la unidad de compras).
3. Definir si se importan al repaso espaciado propio solo los términos que ya aparecen en las unidades.
