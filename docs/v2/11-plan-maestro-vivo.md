# Plan maestro vivo (versión 2, 27-oct-2026)

**Qué es.** El orden de construcción de todo el plan, las reglas para cambiarlo cuando aparezcan datos nuevos, el backlog y el registro de cambios. Los archivos `01`–`07` son la especificación de cada pieza; `13` es el temario y el orden del curso; `14` es la capa que usa lo que ya estudiaste.

**Qué cambió respecto a la versión anterior.** Ya no hay piloto con u01–u04 ni «puntos de control» que detengan el trabajo. La auditoría de las 24 unidades **está hecha** (`08`, `auditoria/`), el temario está **decidido** (`13`) y la continuidad con tu progreso **está diseñada** (`14`). Se construye todo; los datos de uso sirven para **afinar** (§4), no para autorizar el paso siguiente.

## 1. Principios de construcción
1. **La app es usable en cada fusión.** Lo existente sigue funcionando hasta que su reemplazo esté probado (por ejemplo, `sessionsOf()` se retira solo cuando `daysOf()` y la migración tienen pruebas).
2. **Nada se estudia «para probar».** Ninguna unidad hace de piloto: el contenido nuevo y el motor se prueban con pruebas automáticas y con tu uso real normal.
3. **Un tema por pull request**, siempre sin push a `main`. El usuario prueba en el iPhone lo que solo ahí se puede probar y fusiona él.
4. **El contenido y el código van en carriles separados**: se pueden escribir en paralelo porque se unen por datos (`course.ts`, esquemas de `07`).
5. **Lo que no se puede verificar desde la nube se dice** (`09`) y no se marca como verificado.

## 2. Carriles y dependencias
```
A  Offline ──────────────┐                  (independiente; primero)
                          ▼
H1 Curso y datos (course.ts, partes A/B, progreso v2, copia v2)
   │
   ├─► B  Repaso espaciado (SRS)  ──► H2 Continuidad (diagnóstico, siembra, puesta al día)
   │                                        │
   └─► D  Ciclo de 7 días (daysOf, modo corto, hacer más, avance, migración)
                    │                       │
                    ├─► E  Producción        └─► F  Evaluación (mini-prueba, fase, nivel A2, panel)
                    │
G  Contenido (carriles que no esperan al código):
   G0 correcciones de la auditoría  ► G1 unidades nuevas u25–u28  ► G2 partición A/B
   G3 vocabulario ~50 con frase     ► G4 textos graduados          ► G5 práctica sin pista
   G6 pronunciación (secuencia)     ► G7 puente B1 + u20 + u24
                    │
                    ▼
G-R  Segunda pasada independiente (solo lo reescrito)  ──►  C  Audio (por lotes; solo de lo ya revisado)
```
- **A** no depende de nada y es lo único que hoy impide estudiar con normalidad en el iPhone.
- **H1** define cómo se llama y se ordena todo; **B**, **D** y **H2** lo usan.
- **G** nunca espera al código: escribe datos con el esquema de `07` y los tests de contenido los validan.
- **C** (audio) solo toca contenido que ya pasó **G-R**: el audio fija los errores.
- **E** y **F** necesitan el ciclo (**D**) y los ítems de prueba de **G**.

## 3. Orden de pull requests
Cada fila es un PR (o una tanda de PR del mismo tema). «Lo prueba el usuario» = requiere iPhone real.

| # | Carril | Contenido | Depende de | Lo prueba el usuario |
|---|---|---|---|---|
| 1 | A | Offline: precache pequeño, descarga de audio con progreso, diagnóstico, rescate | — | Sí (lista de `01`) |
| 2 | H1 | `course.ts`, partes A/B, claves v2, `BACKUP_VERSION 2` con migración de copias | 1 | No |
| 3 | G0 | Correcciones de la auditoría (8 unidades por PR × 3) | — | No |
| 4 | B | SRS con `ts-fsrs`, cuatro tipos de tarjeta, cola, simulación de 60 días | 2 | Sí (uso) |
| 5 | G1 | u25, u26, u27, u28 completas (una por PR) | — | No |
| 6 | G2 | Partición A/B de las siete unidades (datos) | 2 | No |
| 7 | D | `daysOf()`, modo corto, «Hacer más hoy», reglas de avance, migración de progreso | 2, 4, 6 | Sí |
| 8 | H2 | Continuidad: «Tu punto de partida», diagnóstico, siembra del SRS, puesta al día | 4, 7 | Sí |
| 9 | G3 | Vocabulario ~50 con frase en 7 lotes | 3 | No |
| 10 | G4 | Textos graduados con preguntas (1 por semana) | 3, 5 | No |
| 11 | G5, G6 | Práctica sin pista y secuencia de pronunciación | 3 | No |
| 12 | G7 | u20 recortada, Puente a B1, u24 como proyecto final y prueba A2 | 5 | No |
| 13 | E | Dictado por niveles, escritura con tres capas, grabar y comparar, shadowing propio | 7 | Sí (micrófono) |
| 14 | F | Mini-prueba, prueba de fase, prueba de nivel, panel | 7, 12 | Sí |
| 15 | G-R | Segunda pasada independiente de lo reescrito | 9–12 | No |
| 16 | C1 | Prueba A/B de voz | — | **Sí (oído)** |
| 17 | C2 | Audio en lote, reproductor, selector de voz | 15, 16 | Sí |

Los PR sin dependencia común (G0, G1, C1) pueden ir en paralelo con los de código. La app **ya funciona completa** después del PR 8 (con el contenido existente más lo nuevo que ya esté fusionado); los PR siguientes la mejoran sin dejarla a medias.

## 4. Revisiones con datos de uso (sustituyen a los antiguos puntos de control)
No bloquean. Se leen a las 2 semanas de uso de la v2 y al terminar cada fase. Sirven para ajustar parámetros y decidir si algo se rediseña. Los umbrales son **provisionales (criterio propio, no medidos)**.

| Medida | Umbral provisional | Qué se ajusta si no se cumple |
|---|---|---|
| Minutos reales por día (modo normal) | 25–35 | recortar bloques no `core` o alargar el ciclo |
| Días completados / días posibles | ≥ 70 % | bajar carga o modo corto por defecto |
| Recuerdo real del SRS (tarjetas con ≥ 2 repasos) | ≥ 80 % | bajar el tope de palabras nuevas por día |
| Mini-prueba de unidad | ≥ 75 % a la primera en ≥ 3 de 4 semanas | revisar explicación y práctica de las semanas fallidas |
| Valoración por actividad (1–3: me sirve / regular / no me sirve) | ninguna con mayoría «no me sirve» | rediseñar o eliminar esa actividad |
| Cola SRS | ≤ 60 sostenida | bajar nuevas; si persiste, subir retención objetivo |
| Diagnóstico de continuidad vs. mini-pruebas posteriores | coherentes | recalibrar umbrales del diagnóstico (`14`) |
Las métricas automáticas de la auditoría (`npm run audit`) se regeneran en cada PR de contenido y no pueden empeorar.

## 5. Reglas de propagación (si se encuentra X, cambia Y)
| Hallazgo | Consecuencia |
|---|---|
| Errores de italiano (bloqueantes) | se corrigen antes de cualquier audio; si la tasa en la muestra supera 5 %, se repite la pasada independiente del lote |
| Hueco de temario nuevo | se agrega una unidad o bloque; se actualizan `13`, `course.ts`, pruebas y la capa de continuidad |
| Contenido B1 dentro del núcleo A2 | pasa al Puente (`13`) |
| Orden subóptimo | se reordena `COURSE` (los ids no cambian, no se pierde progreso) y se registra aquí |
| Una actividad recibe «no me sirve» | se rediseña o elimina; se actualiza el ciclo |
| Cola SRS acumulada | bajar nuevas; revisar retención |
| Audio sobre el presupuesto de iOS | descargar por fases, bajar bitrate o usar voz del sistema en frases menos importantes |
| La prueba A/B prefiere la voz del sistema | se omite la generación en lote (C2) y se invierte en el selector (C5) |
| Offline sigue fallando tras A | bloquea todo lo que dependa de audio descargado; se diagnostica con el reporte copiable |
| Una fuente nueva contradice un supuesto | se actualiza el documento afectado y se marca «por revisar» |
| El diagnóstico de continuidad no concuerda con los datos de uso | se ajustan umbrales y se vuelve a ofrecer el diagnóstico |
| El usuario cambia de ritmo o de meta | `13` y el calendario estimado se recalculan; nada se pierde |

## 6. Backlog
Vive en `auditoria/_backlog.md` (ids `H-…`). Cada PR de contenido cierra los ids que resuelve y lo anota ahí.

## 7. Qué decide quién
- **Usuario:** alcance (temario, orden, qué se quita), tiempo diario, voz y licencias y lo que solo se prueba en el iPhone. Sin decisiones abiertas hoy (D-01 a D-04 resueltas en el backlog).
- **Claude:** correcciones, formato de ejercicios, métricas, orden interno de un carril, hallazgos de severidad baja o media que no cambian el alcance. Todo se registra en §8.

## 8. Registro de cambios del plan
| Fecha | Cambio | Motivo / hallazgo | Documentos afectados | Decidió |
|---|---|---|---|---|
| 2026-10-27 (mañana) | La auditoría pasa antes de G, C y D; offline en paralelo; se agrega la auditoría automática | El usuario pidió que la auditoría sea lo central | todos | Usuario + Claude |
| 2026-10-27 (tarde) | **Se elimina el piloto y los puntos de control bloqueantes**; el plan queda completo y se construye todo; se agregan `13` (arquitectura final) y `14` (continuidad con el progreso) | El usuario pidió «nada de ir por unidades», plan completo y no redundante con lo ya estudiado | 00, 04, 07, 10, 11 | Usuario (pedido) |
| 2026-10-27 (tarde) | Auditoría de las 24 unidades completada por lectura; 144 celdas valoradas | Pedido de auditar todo con rigor | 08, `auditoria/` | Claude |
| 2026-10-27 (tarde, 3.ª) | Reparto de tareas: Code = código e interfaz; Chat = contenido, verificación, especificación y revisión cruzada (`15`) | El usuario pidió definir qué hace cada uno | 15, 11 | Usuario (pedido) + Claude |
| 2026-10-27 (tarde, 2.ª) | D-01 aceptada; D-02 y D-03 mantenidas con evidencia; **D-04 cerrada como no posible** y reemplazada por verificación con fuentes (V1→V3); avance real registrado (u01, 17/22); la continuidad pasa a no ser camino crítico | Respuesta del usuario | 00, 07, 08, 09, 12, 13, 14, `auditoria/_backlog.md`, `_verificacion.md` | Usuario |
| 2026-10-27 (tarde) | 7 unidades se parten A/B; 4 unidades nuevas (u25–u28); u20 al núcleo recortada; u21–u23 = Puente a B1; u24 = cierre del núcleo | Sobrecarga, huecos de temario y evidencia de nivel (`_temario.md`) | 04, 07, 13 | Claude (propuesta; usuario revisa D-01, D-02) |

## 9. Esfuerzo relativo (sin fechas inventadas)
S = una sesión corta · M = una sesión larga · L = varias sesiones.
A: M · H1: M · B: M · D: L · H2: L · E: L (cuatro PR) · F: M · C: L · G0: L (3 PR) · G1: L (4 PR) · G2: M · G3: L (7 PR) · G4: L · G5–G7: L · G-R: M.
El calendario real depende de cuántas horas por semana puedas dedicar a probar en el iPhone; no se estima aquí.
