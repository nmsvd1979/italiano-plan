# Fase D — Nuevo plan diario (ciclo de 7 días por unidad)

Base pedagógica: sección «Arquitectura macro» y «Diseño micro» del documento de arquitectura. Aquí van las reglas de implementación.

## D1. Estructura
Cada **semana del curso** (`CourseStep` de `13`: una unidad, o la semana A o B de una unidad partida) tiene 7 días. Cada día es una lista de bloques; cada bloque tiene `core: boolean`, minutos estimados y una actividad. Se sustituye `sessionsOf()` por `daysOf(step)`.

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
La migración completa, el diagnóstico y el sembrado del repaso están en `14-continuidad-progreso.md` (fase H2). Regla de D: el motor nunca borra ni modifica claves antiguas, y cualquier semana cuyo estado sea `dominada` se salta; el avance parcial **no se pierde** (las partes ya hechas cuentan). Antes de retirar `sessionsOf()` debe pasar la prueba de migración con los tres respaldos sintéticos de `14`, §8.

## D5. Reclasificación de las unidades 20–23 (decidida en la auditoría; ver `13` y `auditoria/_temario.md`)
Evidencia: tres programas de curso (IIC Buenos Aires para A2; Ca' Foscari y USC para B1) ubican pronombres combinados, discorso indiretto, congiuntivo presente y passato y periodo ipotetico de tipo 2 y 3 en B1; los conectores y las oraciones con *se* aparecen en A2. No es el MCER oficial.
Decisión (propuesta de Claude, el usuario revisa D-01):
- **u20** queda en el núcleo, recortada a **conectores + opiniones simples + «mi ha detto che…» como fórmula**. Se agregan ejercicios (hoy tiene 10).
- **u21, u22, u23** forman el **Puente a B1** (opcional, después de u24): reconocer, y producir solo fórmulas fijas (*dammelo, te lo dico, penso che sia, credo che abbia ragione, spero che tu stia bene, se fossi in te…*).
- Se eliminan los ejercicios de conjugar paradigmas completos del congiuntivo; se conservan las tablas como referencia.
- La fase 6 se llama «Puente a B1 (reconocimiento)».

## Pruebas
- `daysOf()` devuelve 7 días y todo bloque tiene `minutes > 0`; suma de bloques `core` por día entre 12 y 18 min, suma total entre 25 y 35.
- Un bloque nunca depende de red salvo los marcados «Necesita internet».
- Migración: ningún progreso antiguo se pierde (se conserva la clave original).

## Criterios de aceptación
El usuario puede hacer una unidad completa en modo corto y en modo normal, hacer más en un día, y sin conexión.
