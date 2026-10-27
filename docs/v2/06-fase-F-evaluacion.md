# Fase F — Evaluación y medición

Hoy solo se mide gramática y sonidos. Se mide lectura, escucha, gramática, vocabulario y producción.

## F1. Registro de actividad
Clave `italianPlan.log.v1` (en `localStorage`, entra en el respaldo): arreglo de `{date, unit, activity, minutes, correct?, total?, selfRating?}`; máximo 2000 entradas, se recorta lo más antiguo. Alimenta el panel (F5). El tiempo se mide con el bloque abierto y visible (`document.visibilityState`), con tope de 30 min por bloque.

## F2. Mini-prueba de unidad (día 7)
20 ítems: lectura 4, escucha 4, gramática 6, vocabulario 4, producción autoevaluada 2.
- Ítems distintos a los de práctica: reserva de contenido de prueba (ver `07`: `tests/`), mínimo 12 ítems de prueba por unidad para poder sacar variantes.
- Vocabulario: tarjetas de la unidad con menor estabilidad en el SRS; no se escriben ítems nuevos.
- Resultado ≥ 75 % para avanzar. Si no, repaso dirigido de 2 días y versión alterna.
- Guardar resultado por área en el registro.

## F3. Prueba de fase (cada 4 unidades)
Las cinco áreas con ítems de las 4 unidades. Menos de 70 % en un área ⇒ la fase siguiente agrega bloques de esa área. Ampliar `domain/phaseTest.ts` (hoy solo gramática y sonidos).

## F4. Prueba de nivel inicial y prueba final
Misma estructura, ítems distintos, 25–30 min, comparables. La inicial puede proponer la unidad de partida sin tocar el progreso existente. Umbrales provisionales (75, 70, 80 %): criterio propio, se ajustan con datos reales tras las primeras 4 unidades.

## F5. Panel de progreso
Tasa real de recuerdo del SRS (últimos 30 días), aciertos por habilidad en las últimas pruebas, minutos por hebra en la semana (lengua / input / output / fluidez / medición), días estudiados, y «palabras activas» (tarjetas con estabilidad ≥ 21 días). Gráficos sencillos en SVG propio, sin librerías pesadas.

## F6. Lo que no se puede medir
Pronunciación y escritura reales sin un corrector humano o un modelo. Se aproximan con autoevaluación con rúbrica y la corrección opcional con Claude (E4). El panel lo dice.

## Pruebas
Puntuación por área; reglas de avance; recorte del registro; resumen del respaldo incluye el registro.

## Criterios de aceptación
Mini-prueba y prueba de fase funcionan sin conexión, guardan por área y el panel muestra datos reales.
