# Frente 5 · Qué le toca a quien llega con u01–u24 marcadas (o termina el curso)

## Qué es
Quien marca u01–u24 —con «Empezar donde estoy», por el diagnóstico o porque estudió con la versión anterior— solo tiene contenido nuevo de u25–u28 (comprimidas a 3–4 días) y después únicamente repaso espaciado. La misma pregunta aparece, más tarde, para quien termina las 35 semanas: Hoy dice «Terminaste lo disponible» y ofrece un botón.

**Contexto real de la persona.** Hoy no ha terminado u01 (`avance-inicial.ts`: u01 con 17 de 22 actividades de la app anterior) y piensa estudiar unos dos meses con lo que hay. A 30 min/día eso son ≈ 9 semanas (hasta u05B); a 60 min, ≈ 19 (hasta u11). **Este frente no es urgente para ella**; el curso le alcanza. Se planifica ahora porque el cierre sin ruta es el hueco que más pesa cuando llegue (≈ 7 meses a 30 min/día) y porque la persona piensa agregar contenido después de esos dos meses.

## Evidencia
- Simulación (`auditoria/flujo.md`, `medicion/sim2.ts`): con u01–u24 marcadas, el contenido nuevo se acaba en **26 / 13 / 6 días** a 15 / 30 / 60 min/día. Las semanas u25 → u26 → u27 → u28 se cierran en 4, 11, 18 y 25 días a 15 min/día.
- Las unidades del puente (u21–u23) cuentan como hechas por cobertura heredada ≥ 85 % (`LEGACY_COMPLETE` en `cycle.ts`). Es correcto si de verdad las estudió, pero significa que **el puente no le llega a quien llega marcado**.
- `Today.tsx` (líneas 92–101) cuando `finished`: el texto dice «Las demás figuran como "pronto" en el Plan: cuando se agreguen, aparecen aquí», **pero el plan ya no tiene semanas «pronto»** (28 unidades activas desde PR #57). Frase obsoleta.
- La prueba de nivel A2 existe (`LevelTestScreen.tsx`, ruta `#/prueba-nivel`, 30 ítems, umbral `PASS_LEVEL` = 0,8, área floja < 0,7). No se enlaza al terminar.
- **Hallazgo nuevo (leído en el código, no probado en pantalla):** `LevelTestScreen` arma la batería con `READY_UNITS.filter(u => u.n <= 24)`. Eso **incluye u21–u23** (puente, opcional) y **excluye u25–u28** (núcleo A2 obligatorio). Una persona que nunca hizo el puente se evalúa con tres unidades que no estudió y no se evalúa con cuatro que sí. Corregir: filtrar por `COURSE` (`kind === "core"`). Es código pequeño y de este frente.

## Qué hay que decidir (opciones y recomendación)
Para quien se queda sin contenido nuevo:

| Opción | Qué es | Contenido nuevo | Cuesta |
|---|---|---|---|
| A. Repasar por habilidades | «Practicar más» (`06`) con un filtro por habilidad: lectura, escucha, escritura, habla | 0 | código ya previsto en `06` |
| B. Empezar el puente | u21–u23 como están, con su `extend`, `monólogo` y pruebas | los de `01`/`02`/`09` | ver `09` |
| C. Puerta con la prueba de nivel A2 | Al terminar el núcleo: hacer `#/prueba-nivel`; ≥ 80 % → puente y preparación B1; < 80 % → repaso dirigido por las áreas flojas | 0 (reusa lo existente) | ≈ 150 líneas de código |

**Recomendación: C y, según el resultado, A o B.** La prueba ya existe y sus áreas coinciden con las de `capacidad.md` §c; se usa como puerta en vez de un diagnóstico nuevo. A llena el tiempo sin esperar contenido; B es lo que realmente acerca a B1 (`09`).

## Cómo se arma
**Código (1 PR, M).**
1. `Today.tsx`, rama `finished`: sustituir el texto obsoleto por una tarjeta «Ruta» con tres botones: *Prueba de nivel A2* (`#/prueba-nivel`), *Practicar más* (`06`) y, si hay resultado guardado, *Empezar el puente a B1* / *Repasar lo flojo*. Lee `getLevelTests()` (ya existe en `storage.ts`).
2. `LevelTestScreen`: la lista de unidades sale de `COURSE.filter(s => s.kind === "core")` en vez de `n <= 24` (hallazgo de arriba).
3. Cuando solo quedan semanas del puente (`readySteps` sin `core` pendientes), Hoy muestra una línea «Terminaste el núcleo A2. El puente a B1 es opcional» con enlace a `09`.
4. Reutiliza: `getLevelTests`, `weakAreas`, `AREA_NAME`, `todaySlots` (`finished`), `courseWithContinuity`.

**Contenido.** Ninguno propio. Las rutas A y B usan el contenido de `01`, `02`, `04`, `06`, `09`.

## Cómo se verifica el italiano
No hay italiano nuevo en este frente. Los textos nuevos son de interfaz: español neutro con tuteo (`lang.test.ts`).

## Tests nuevos
1. `levelUnits.test.ts`: `levelBattery` solo recibe pasos `core`; incluye u25–u28 y excluye u21–u23.
2. Un test de `Today`/`todaySlots` con `u01–u24` marcadas: `finished` se alcanza tras u25–u28 y el texto ya no menciona «pronto».
3. Si el resultado guardado es ≥ 0,8, la tarjeta ofrece el puente (prueba pura sobre una función `routeAfterCore(levelTests, coreDone)`).

## Tamaño y orden
Un PR `feat` M. Va **después** de «Practicar más» (`06`) porque lo enlaza. La corrección de unidades del nivel (punto 2) puede ir como PR `fix` S aparte para no esperar.

## Dependencias
`06` (Practicar más) · `09` (puente) · `10` (umbrales). No bloquea nada anterior.

## Qué no se puede medir
Cuánto tiempo real de contenido nuevo tiene una persona concreta (depende de sus minutos reales). Los 26 / 13 / 6 días son simulación con supuestos de `flujo.md` (85 % de aprobar la mini-prueba).

## Hecho (10-nov): tarjeta «Ruta»
Al terminar todas las semanas, Hoy muestra «Terminaste el curso» con la ruta según el último intento de la prueba de nivel A2 (`domain/ruta.ts`, `routeAfterCore`): sin prueba → la prueba; ≥ 80 % sin áreas flojas → «Práctica B1» y «¿Listo para B1?»; si no → «Practicar más» y qué áreas reforzar. Si el núcleo está terminado pero quedan semanas del puente, una nota arriba dice que son opcionales. Cambios respecto a lo propuesto: el texto obsoleto («pronto») ya no existe; el filtro por habilidad de «Practicar más» (`?area=`) no está, así que la tarjeta solo nombra las áreas; la corrección de `levelUnits` ya estaba hecha (PR 10a).
