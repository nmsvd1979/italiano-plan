# Fase D — Nuevo plan diario (ciclo de 7 días por unidad)

Base pedagógica: sección «Arquitectura macro» y «Diseño micro» del documento de arquitectura. Aquí van las reglas de implementación.

## D1. Estructura
Cada unidad tiene 7 días. Cada día es una lista de bloques; cada bloque tiene `core: boolean`, minutos estimados y una actividad. Se sustituye `sessionsOf()` por `daysOf(unit)`.

| Día | Nombre | Bloques (minutos) — `core` marcado con * |
|---|---|---|
| 1 | Entrar | SRS 5*, diálogo de entrada: leer y escuchar → solo escuchar + 3 preguntas 10*, palabras nuevas con frase 6, percepción de sonido 4, repetir líneas del diálogo 5 |
| 2 | Regla | SRS 5*, volver a oír con la regla 6, lección 10*, práctica guiada 4, dos frases propias 5 |
| 3 | Practicar | SRS 5*, práctica variada 7*, palabras nuevas 6, dictado con audio propio 6, texto corto nuevo 6 |
| 4 | Hablar | SRS 5*, diálogo con rol: decir, grabar, comparar 11*, repetir/comparar pronunciación 4, palabras nuevas 6, números y frases a velocidad 4 |
| 5 | Leer y escuchar | SRS 5*, texto graduado 9*, preguntas 4, palabras nuevas 6, shadowing propio 6 |
| 6 | Producir | SRS 5*, escritura con corrección 14*, volver a contar sin mirar 6, «Puedo…» 5 |
| 7 | Consolidar | repaso mixto acumulativo 10*, mini-prueba de unidad 8*, input libre con transcripción 12 |

Todo lo anterior funciona sin conexión (la sesión de input libre usa los textos de la app; YouTube y podcasts son extras con la etiqueta «Necesita internet»).

## D2. Modo corto y «hacer más hoy»
- Un día se completa al terminar sus bloques `core` (~15 min). Modo normal muestra todos los bloques (~30 min) y recomienda los no `core`; modo corto solo muestra los `core`.
- Interruptor «Hoy tengo poco tiempo» en Hoy; se recuerda hasta que se cambie. Si se usa el modo corto 3 días seguidos, se sugiere (sin imponer) volver al normal el fin de semana.
- Botón «Hacer más hoy» tras terminar el día: ofrece los bloques del día siguiente. Completarlos marca ese día como hecho. No hay tope diario: el único límite es el de palabras nuevas por día (8) y la cola SRS.
- El plan avanza por progreso, no por calendario (igual que hoy). No se castigan días sin estudiar.

## D3. Reglas de avance
- Para pasar de unidad: mini-prueba de unidad ≥ 75 %. Si no, 2 días de repaso dirigido (los ítems fallados + SRS) y una versión distinta de la prueba.
- Palabras nuevas: máximo 8 por día; ninguna si la cola SRS supera 40 (regla de `02`).

## D4. Migración del progreso
Leer `src/domain/progress.ts` y `storage.ts` para conocer las claves reales. Regla: unidades con las 6 sesiones antiguas completas → v2 «hecha»; unidades en curso → empiezan en el día 1 de v2 (se pierde el avance parcial, se avisa antes). No borrar las claves antiguas; la clave nueva es `italianPlan.v2.progress`. Prueba de migración con un respaldo real (`copia-*.json` del usuario si lo comparte; si no, un respaldo sintético).

## D5. Reclasificación de las unidades 20–23 (resultado de la auditoría: ver `08`)
Evidencia: el programa B1 de una universidad (USC, verificado) lista el congiuntivo presente y passato, el periodo ipotetico de los tipos 1 y 3 y el discorso indiretto como contenido B1; el congiuntivo imperfetto en la hipótesis de tipo 2 no figura allí. Es una sola fuente; no es el MCER oficial. La meta declarada de la app es A2.

Decisión (recomendada, el usuario revisa):
- **u20 Discurso indirecto y conectores:** conectores = producción (A2). Discurso indirecto = reconocimiento.
- **u21 Pronombres combinados:** reconocimiento, más producción solo de fórmulas fijas: *dammelo, dimmelo, te lo dico, glielo dico, me lo dai?*, *ce l'ho*.
- **u22 Congiuntivo presente:** reconocimiento, más producción de fórmulas fijas: *penso che sia, credo che sia, spero che tu stia bene, non so se…*.
- **u23 Hipótesis:** producción de *se* + presente (tipo 1) y de *se fossi in te…* (consejo); el congiuntivo imperfetto y el tipo 3 solo se reconocen.
- Fase 6 pasa a llamarse «Puente a B1 (reconocimiento)».
- Qué cambia en el ciclo para estas unidades: se eliminan los ejercicios de conjugación completa de paradigmas, se mantienen las preguntas de reconocimiento y los dictados, y los días liberados (D3 y D6 reducidos) se llenan con repaso acumulativo A1–A2 y lectura.
- No se borra contenido: las tablas de la regla quedan como referencia.

## Pruebas
- `daysOf()` devuelve 7 días y todo bloque tiene `minutes > 0`; suma de bloques `core` por día entre 12 y 18 min, suma total entre 25 y 35.
- Un bloque nunca depende de red salvo los marcados «Necesita internet».
- Migración: ningún progreso antiguo se pierde (se conserva la clave original).

## Criterios de aceptación
El usuario puede hacer una unidad completa en modo corto y en modo normal, hacer más en un día, y sin conexión.
