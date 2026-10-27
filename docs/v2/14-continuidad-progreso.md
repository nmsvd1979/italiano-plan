# Continuidad con lo que ya estudiaste (sin repetir nada)

Regla de esta capa: **lo que ya aprendiste no se vuelve a enseñar**. La app v2 usa tu progreso de hoy, lo contrasta con una prueba corta y solo te entrega lo que es nuevo o lo que se te olvidó. Se construye junto con el resto, no después: es la fase **H** (`11`).

## 1. Qué se sabe y qué no
- **Se sabe:** tu progreso vive en el `localStorage` del iPhone, con claves `italianPlan.*`: `completions` (fecha → actividad → hecha), `review` (cajas de ejercicios que fallaste), `writing` (textos), `phaseTests`, `canDo`, `shadowing`, `skipped`, `startUnit`, `startDate`, `settings` (`src/domain/storage.ts`, `backup.ts`, `progress.ts`).
- **Tu avance real (27-oct, capturas de la app actual):** unidad 1, **sesiones 1 a 5 completas (17 de 22 actividades)**; falta la sesión 6 (repaso Quizlet y shadowing). No había copia de seguridad previa y no es posible hacerla ahora; tampoco hace falta, porque la v2 lee el mismo almacenamiento del navegador (más abajo, §7).
- **Qué implica:** con la regla de §3 u01 queda `parcial` (17/22 = 77 %, bajo el 85 %). **No hay nada «dominado» que proteger** más allá de u01, así que el diagnóstico y el sembrado masivo del repaso no te afectan hoy: la v2 te lleva a u25 (alfabeto, deletreo y supervivencia; semana completa porque estás por debajo de u03), cierra la sesión 6 de u01 y sigue el curso normal. La capa de continuidad se queda construida para el caso general (otro dispositivo, otra persona, reinstalación), pero **no es camino crítico**: va después de D en el orden de PR.
- **Si algún día pierdes el almacenamiento** (borrar datos del sitio, reinstalar la PWA sin copia): se empieza igual desde u25, sin pérdida relevante porque solo hay una unidad hecha. A partir de ahora conviene **una copia al terminar cada fase**.
- **Lo que no se sabe:** si recuerdas lo de u01 sin ayuda. Se comprueba con la mini-prueba de u01 antes de pasar a u02 (más barata que un diagnóstico).
- La app v2 se publica en la **misma dirección** que la actual; el navegador conserva el progreso. No hace falta exportar nada para migrar. La copia de seguridad es el seguro (`Ajustes → copia de seguridad`, ya existe y se hace antes de actualizar).

## 2. Cuatro pasos al abrir la v2 por primera vez
1. **Seguro:** la app comprueba que existe una copia reciente (< 14 días) y, si no, la ofrece antes de tocar nada.
2. **Lectura:** calcula el estado de cada unidad con tus marcas (§3). No cambia ni borra ninguna clave antigua.
3. **Pantalla «Tu punto de partida»:** lista las 28 unidades con su estado y la diferencia entre «marcada» y «dominada». Botones: **Hacer el diagnóstico** (recomendado, ~25 min repartidos en tres veces) o **Empezar donde estoy** (se asume lo que marcaste).
4. **Puesta al día:** con el diagnóstico (o sin él) la app arma tu cola (§5) y siembra el repaso espaciado (§6).

## 3. Estado de cada unidad desde las marcas
Marcar una actividad dice que **la hiciste**, no que **la recuerdas**. Por eso hay dos niveles.

| Estado por marcas | Regla (se calcula sobre las actividades de `sessionsOf(unit)`) |
|---|---|
| `completa` | ≥ 85 % de las actividades hechas, o la prueba de fase de su fase aprobada |
| `parcial` | entre 30 % y 85 % |
| `tocada` | entre 1 % y 30 % |
| `nueva` | 0 % |
| `omitida` | unidades anteriores a `startUnit`, o actividades en `skipped` |
Las marcas con claves desconocidas (de la app anterior) se ignoran para el estado y cuentan minutos con `LEGACY_MINUTES`, como hoy.

## 4. Diagnóstico de continuidad (opcional, recomendado)
- **Qué mide:** si recuerdas lo de cada unidad `completa` o `parcial`, sin ayuda. Se usa el banco de ejercicios de la unidad **sin pista** (los 8 ítems de mayor poder discriminante: dos de reconocimiento, tres de producción, dos de oído, uno de dictado) y no repite ejercicios que ya fallaste y repasaste en `review`.
- **Cómo se pregunta:** en tres sesiones de ≤ 10 minutos por tramo del curso, ordenadas de lo más reciente a lo más antiguo. Se puede pausar y retomar. Nada es obligatorio: «Saltar» deja la unidad en `repasar`.
- **Resultado por unidad:**
  - **dominada:** ≥ 75 %
  - **repasar:** 50–74 %
  - **rehacer:** < 50 %
- **Por qué no basta con las marcas:** si una unidad marcada se te olvidó, ignorar eso es falsa confianza; si se te quedó muy bien, repetirla es tiempo perdido. El diagnóstico reduce los dos errores. Umbral provisional (criterio propio, no medido); se ajusta con los datos de uso (`11`).

## 5. Qué ocurre con cada estado
| Estado | Qué hace la app | Cuánto cuesta |
|---|---|---|
| **dominada** | No se enseña de nuevo. Se siembra el SRS (§6). Se ofrece la **puesta al día de capas nuevas** (abajo) | ≈ 12 min por unidad, en bloques opcionales de ≤ 8 min |
| **repasar** | Se siembra el SRS con estabilidad baja, más **un día de repaso dirigido** con los ítems que fallaste, y la puesta al día | ≈ 20 min por unidad |
| **rehacer** | La semana vuelve a la cola como pendiente, con el curso normal | una semana |
| `parcial` sin diagnóstico | Pendientes las partes no hechas | lo que falte |
| `nueva` | Curso normal | una semana |

**Puesta al día de capas nuevas** (lo que la v2 trae y la v1 no tenía; nunca la lección ni los ejercicios que ya hiciste):
1. escuchar y repetir las frases de repaso de la unidad, con audio;
2. el texto graduado de la unidad, con sus preguntas;
3. el dictado ampliado (de 6 a 10 frases);
4. una producción: grabar el diálogo o escribir las dos frases propias;
5. las ~30 palabras nuevas con frase (el vocabulario sube de 20 a ~50).
El bloque diario de puesta al día se agrega **encima** del día normal solo en modo normal, máximo 8 min, y no aparece en modo corto. La lección y los ejercicios antiguos quedan disponibles «a demanda» en la unidad.

**Unidades partidas (A y B):** si una unidad antigua queda dominada, sus dos semanas quedan dominadas. Si queda en `repasar` o `rehacer`, el diagnóstico decide por separado qué mitad (los ítems están etiquetados A o B).

**Unidades nuevas (u25–u28)** y **bloques insertados** (c'era, *mi è piaciuto*, pronombres tónicos, *ci vuole*, irregulares, conectores de secuencia): son nuevos para todos, también para ti.
- Si aún no llegas a su posición: se estudian cuando toquen, en el orden normal.
- Si ya pasaste su posición: se convierten en **huecos por cerrar** y se agregan al comienzo del siguiente tramo, en su orden, en versión comprimida de 4 días (días 1, 2, 3 y 6 más mini-prueba). Se pueden posponer, no saltar sin aviso.
- u25 (alfabeto, deletreo, acento, supervivencia) se ofrece siempre, comprimida en 3 días si estás por encima de u03.

## 6. Repaso espaciado sembrado
Para cada unidad `dominada` o `repasar`:
- **Tarjetas:** las 20 palabras ya vistas (reconocer y producir) y las frases clave (6 ejemplos, 6 dictados y las líneas más importantes del diálogo). Palabras nuevas con frase entran como `nuevas`.
- **Estado inicial** (con `ts-fsrs`): `dominada` = estabilidad 7 días; `repasar` = 2 días; Leitner de `review` → tarjeta con 1 lapso y vencimiento original. Los vencimientos se reparten en 14 días y **nunca más de 25 tarjetas sembradas por día**, para no crear una avalancha el primer día.
- **Quizlet:** la app no puede leer tu avance de Quizlet. Una vez, «clasificación rápida»: deslizas cada palabra de las unidades dominadas (conocida / no) y eso ajusta la estabilidad inicial (conocida 14 días, no conocida → nueva). El mazo de 1.400 términos sigue disponible como mazo extra; el repaso diario pasa a la app solo cuando el SRS propio esté funcionando mejor (decisión anterior, sin cambio).

## 7. Datos y migración
- Clave nueva `italianPlan.v2.progress`: `{ version: 2, migratedAt, units: { u01: { marks: "completa", coverage, diagnostic?: { score, date, state }, parts?: { A, B }, catchup: { done: [...] } } }, pendingGaps: [...] }`.
- Claves antiguas: **intactas y de solo lectura** para la v2 durante 60 días. «Volver al plan anterior» sigue disponible en Ajustes durante ese tiempo.
- Copia de seguridad: `BACKUP_VERSION` sube a 2; la importación acepta la 1 y la migra; la copia nueva incluye las claves v2 (prefijo `italianPlan.`). Las grabaciones (IndexedDB) siguen fuera de la copia y se avisa.
- Calendario: `startDate` y `startUnit` se conservan. La fecha estimada de término se recalcula con los pasos que realmente faltan.
- Idempotencia: abrir dos veces no duplica ni resiembra; el estado se vuelve a calcular solo si cambian las claves antiguas.

## 8. Pruebas (obligatorias, antes de fusionar)
1. **Sin datos:** instalación nueva, no se muestra el diagnóstico, empieza en u25.
2. **Tres respaldos sintéticos:** (a) hasta u04 completo, (b) u08 parcial con `review` lleno y una prueba de fase aprobada, (c) hasta u16 completo con textos de escritura. Cada uno: estado esperado por unidad, cola esperada, sin claves antiguas modificadas.
3. **Propiedades:** ninguna clave `italianPlan.*` antigua cambia de valor; migrar dos veces da lo mismo; el sembrado no supera 25 vencimientos por día; ninguna unidad `dominada` aparece como pendiente; ninguna unidad nueva queda omitida.
4. **Copia de seguridad:** exportar → importar en otro `localStorage` → mismo estado.
5. **Diagnóstico:** puntuación y estado con casos límite (74 %, 75 %, 49 %, 50 %), sin repetir ítems ya fallados y repasados.
6. **Un respaldo real de Nicolás** (si lo comparte; contiene sus textos de escritura y es su decisión) se agrega como prueba solo en su equipo, **no se sube al repositorio**.

## 9. Lo que te toca a ti
1. ~~Antes de que se publique la v2: copia de seguridad.~~ Ya dijiste que no era posible; con solo u01 hecho el riesgo es bajo (§1). Haz una copia cuando termines la primera fase.
2. Abrir la v2 una vez con conexión y revisar «Tu punto de partida» (debería mostrar u01 parcial y todo lo demás nuevo).
3. El diagnóstico queda opcional; no se pide hasta pasar u02.
4. ~~Pasar tu copia~~ No aplica: no hay copia. Las pruebas usan los tres respaldos sintéticos de §8.
