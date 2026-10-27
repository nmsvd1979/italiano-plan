# Plan maestro vivo

El plan es una hipótesis que se corrige con lo que se descubre. Cada paso produce hallazgos; cada hallazgo puede cambiar los pasos siguientes. Este documento define el orden, los puntos de control, las reglas de propagación y el registro de cambios. Los archivos 01–07 son la especificación de cada fase **tal como está hoy**; si esta auditoría cambia algo, se actualiza la fase correspondiente y se anota aquí.

## 1. Orden revisado (la auditoría pasa primero)

```
Fase 0  Auditoría (0a automática ✔ · 0b juicio por unidad · 0c temario y vocabulario · 0d síntesis)
Fase A  Offline en iPhone  ← corre en paralelo con la fase 0 (no depende de ella; es el único fallo hallado)
   │
   ▼
[Punto de control 1: revisión de plan con los resultados de 0]
   │
   ├─► Fase B  Repaso espaciado (SRS)            ← independiente del contenido; puede ir en paralelo con G
   └─► Fase G1 Contenido u01–u04 (reescrito según 0)
            │
            ▼
        Fase D piloto: el usuario estudia u01–u04 en el formato nuevo (con B y G1)
            │
            ▼
[Punto de control 2: revisión de plan con datos reales de uso y aprendizaje]
   │
   ├─► Fase C  Audio (solo del contenido ya revisado, por fases)
   ├─► Fase E  Producción (grabar, dictado, escritura)
   ├─► Fase F  Evaluación
   └─► Fase G2…G6  Contenido u05–u24, de 4 en 4, con punto de control al final de cada bloque
```

Por qué este orden:
- **0 antes de G, C y D:** reescribir contenido o generar audio sobre un temario sin auditar fija errores (el audio y el SRS los repiten cientos de veces).
- **A en paralelo:** el offline es independiente del contenido y es lo único que hoy impide estudiar con normalidad.
- **B en paralelo con G1:** el repaso espaciado no depende de qué se enseñe, y se necesita para el piloto.
- **Piloto antes de escalar:** el diseño del ciclo de 7 días es lo menos probado del plan. Se usa de verdad con 4 unidades antes de escribir las otras 20.

## 2. Fase 0 en detalle
| Subfase | Qué | Quién | Salida |
|---|---|---|---|
| 0a | Métricas automáticas de las 24 unidades (`npm run audit`) | script | `docs/v2/auditoria/_resumen.md` y `uXX.md` (hecho; se regenera tras cada cambio) |
| 0b | Juicio por unidad, en 6 bloques de 4, con pasada B independiente (ver `12`, §6) | Claude (sesiones separadas) | 24 fichas con veredictos y hallazgos |
| 0c | Auditoría del temario, del orden y del vocabulario (`12`, §4) | Claude + fuentes abiertas | `_temario.md` |
| 0d | Síntesis: backlog priorizado, decisiones para el usuario, plan actualizado | Claude | este documento actualizado + lista de decisiones |

## 3. Puntos de control (nadie avanza sin pasarlos)
**Control 1 — fin de la fase 0:**
- 24 fichas completas, `_temario.md` hecho, cero bloqueantes abiertos.
- Se aplican las reglas de propagación (§4) y se actualizan las fases 01–07.
- El usuario decide lo que cambia el alcance (formato de `12`, §8).

**Control 2 — fin del piloto (u01–u04 en el formato nuevo, ~4 semanas de uso real):**
Se miden y se leen estos datos del registro y del SRS:
| Medida | Umbral provisional (criterio propio) | Si no se cumple |
|---|---|---|
| Minutos reales por día en modo normal | 25–35 | recortar bloques no `core` o alargar el ciclo |
| Días completados / días posibles | ≥ 70 % | bajar carga o pasar a modo corto por defecto |
| Recuerdo real del SRS (tarjetas con ≥ 2 repasos) | ≥ 80 % | bajar el tope de palabras nuevas por día |
| Mini-prueba de unidad | ≥ 75 % a la primera en ≥ 3 de 4 unidades | revisar explicación y práctica de las unidades fallidas |
| Valoración del usuario por actividad (1–3: me sirve / regular / no me sirve) | ninguna actividad con mayoría «no me sirve» | rediseñar o eliminar esa actividad |
Con estos datos se confirma o cambia el diseño antes de escribir las unidades 5–24.

**Control por bloque (G2–G6):** repetir las mediciones del piloto, regenerar las métricas automáticas y comprobar que las banderas no empeoraron.

## 4. Reglas de propagación (si se encuentra X, cambia Y)
| Hallazgo | Consecuencia automática en el plan |
|---|---|
| Más de un tercio de las lecciones se marcan «reescribir» | G pasa de «ampliar» a «reescribir»; se retrasa C (audio) y se agrega una fase de reescritura antes de D |
| Errores de italiano (bloqueantes) | se corrigen antes de cualquier audio; si la tasa de error en la muestra supera 5 %, se repite la pasada B de ese bloque completo |
| Hueco en el temario (falta contenido A2 necesario) | se agrega una unidad o se amplía una existente; se actualizan `curriculum.ts`, fases, «Puedo…», pruebas de fase y la migración del progreso |
| Contenido B1 dentro de A2 (u20–u23 y lo que aparezca) | pasa a reconocimiento más fórmulas fijas (`04`, D5); el tiempo liberado va a consolidación A1–A2 |
| Orden de unidades subóptimo | se reordena con migración del progreso (nunca se pierde avance) y se registra |
| Vocabulario poco frecuente o poco útil | se rehace la selección con la lista de frecuencia (G4) antes de escribir frases y audio |
| Ejercicios sin variedad o con pista que regala la respuesta | se escriben ejercicios sin pista (G1) antes de escalar; el SRS usa tarjetas `cloze` en vez de repetir ejercicios |
| Diálogos más cortos que la meta (60–120 palabras) | se amplían o se reemplazan; D1 usa el diálogo como entrada del día 1, así que es previo al piloto |
| Una actividad recibe «no me sirve» en el piloto | se rediseña o se elimina; se actualiza el ciclo de 7 días |
| El SRS se acumula (cola > 60 repasos diarios sostenida) | bajar tope de nuevas; si persiste, revisar el algoritmo (retención objetivo 0,85) |
| Tamaño del audio > presupuesto de iOS | descargar por fases, bajar el bitrate, o usar voz del sistema para frases menos importantes |
| La prueba A/B prefiere la voz del sistema | se omite la generación en lote (C3) y se invierte en el selector de voz (C5) |
| Offline sigue fallando tras la fase A | bloquea todo lo demás; se diagnostica con el reporte copiable antes de seguir |
| Una fuente nueva contradice un supuesto de `Principios` | se actualiza la tabla de principios y las fases afectadas se marcan «por revisar» |

## 5. Backlog (se llena durante la fase 0)
Tabla viva; cada fila sigue el formato de `12`, §7. Se mantiene en `docs/v2/auditoria/_backlog.md` (se crea al terminar la primera pasada).
Hallazgos ya conocidos antes de la pasada de juicio (de la auditoría automática y de la lectura de u21–u23):
| id | Hallazgo | Evidencia | Propuesta | Fase afectada | Sev. |
|---|---|---|---|---|---|
| H-all-01 | Vocabulario corto y sin frase | 24 de 24 unidades con 20–23 palabras | ~50 por unidad con frase, etiqueta y sílaba tónica | G, B | Alta |
| H-all-02 | Dictado de 6 frases | 24 de 24 | 10, con niveles | E, G | Media |
| H-all-03 | «Completar» con pista entre paréntesis domina | 22 de 24 unidades con ≥ 70 % de los «completar» con pista | ejercicios sin pista e intercalados | G | Alta |
| H-all-04 | Reciclaje bajo | 22 de 24 unidades con palabras de vocabulario que no reaparecen | textos y frases que reciclen cada palabra ≥ 3 veces | G | Alta |
| H-all-05 | Diálogos cortos | 15 de 24 fuera de 60–120 palabras | ampliar o rehacer | G, D | Media |
| H-all-06 | Reglas largas | 14 de 24 con más de ~150 palabras | observar + regla corta + «más detalle» | G | Media |
| H-all-07 | Pares mínimos sin audio nativo | 5 de 24 unidades | completar audio nativo o marcar `AUDIO_PENDING` | C | Media |
| H-u20-01 | Solo 10 ejercicios | u20 | subir a ≥ 18 | G | Alta |
| H-u21-01 | Ejercicio incoherente (*piacere* con *prestare*) | u21 | «Ti serve la mia giacca? Te la presto domani.» | G | Media |
| H-u23-01 | Pista que regala la respuesta («restare, condizionale») | u23 | quitar la pista de tiempo | G | Baja |
| H-u20-23-01 | Contenido B1 dentro de un curso A2 | una fuente (USC); no es el MCER | reconocimiento + fórmulas fijas (`04`, D5); decide el usuario | D, G | Alta |
Nota: la bandera «completar con pista» solo cuenta paréntesis; no distingue una pista útil (infinitivo) de una que revela la respuesta. Por eso el juicio de 0b la revisa a mano.

## 6. Qué decide quién
- **El usuario:** lo que cambia alcance (temario, orden, quitar funciones), tiempo diario, voz y licencias, pérdida de contenido ya escrito, y cualquier cosa que solo se puede probar en el iPhone.
- **Claude:** correcciones, formato de ejercicios, métricas, orden interno de una fase, y los hallazgos de severidad baja o media que no cambian el alcance. Todo se registra en el §7.

## 7. Registro de cambios del plan (se agrega una fila por cambio)
| Fecha | Cambio | Motivo / hallazgo | Fases afectadas | Decidió |
|---|---|---|---|---|
| 2026-10-27 | La auditoría (fase 0) pasa antes de G, C y D; offline (A) corre en paralelo; se agrega piloto con u01–u04 y dos puntos de control | El usuario pidió que la auditoría sea lo central y que el plan se ajuste con lo que se encuentre | todas | Usuario (pedido) + Claude |
| 2026-10-27 | Se agrega la auditoría automática (`npm run audit`) | Auditoría repetible tras cada cambio | 0 | Claude |

## 8. Esfuerzo relativo (sin fechas inventadas)
S = una sesión corta · M = una sesión larga · L = varias sesiones y un PR grande.
- 0b: L (6 bloques de M). 0c: M. 0d: S por punto de control.
- A: M. B: M. C: L (por la generación y la revisión). D: L. E: L (cuatro PR). F: M. G: L (seis bloques de L).
El calendario real depende de cuántas horas por semana pueda dedicar el usuario a probar en el iPhone; eso no está definido y no se estima aquí.
