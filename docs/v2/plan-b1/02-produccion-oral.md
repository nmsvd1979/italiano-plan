# Frente 2 · Producción oral: monólogo guiado

## Qué es
La app entrena el habla con un solo diálogo de rol por unidad (28 en total, 302 líneas), repetición de líneas y shadowing. **No hay monólogo ni descripción de una imagen o situación.** Las dos fuentes que se leyeron piden monólogo: CILS A2 (~2 min, capacidad §d) y CILS B1 (~2 min, más un diálogo de 2–3 min; `_fuentes.md` §3). Además, hoy el bloque de la semana que debería ocuparse de esto («Volver a contar sin mirar», día 6) está «en preparación».

## Evidencia
- `RolePlayScreen.tsx` es el único flujo de habla producida; `SelfEval.tsx` tiene tres preguntas fijas (¿terminé las frases?, ¿se entiende?, ¿ritmo natural?), pensadas para repetir líneas ajenas.
- `cycle.ts`: `soon("retell", "Volver a contar sin mirar", 6, false, "chat")` en el día 6 «Producir».
- El grabador existe y está probado: `useRecorder` (`Take` = `{url, mime, saved}`, **sin duración**), `RecordTake`, `CompareRow` (modelo → tú), guardado en IndexedDB con tope de 20 por actividad (`recStore.ts`).
- Retroalimentación automática de lo hablado: **no existe y este plan no la propone** (haría falta reconocimiento de voz; en iOS depende de servicios externos, y `CLAUDE.md` prohíbe cuentas, servicios de pago y rastreo). Lo que sí se puede medir con el código: la duración de la toma.

## Cómo se arma
**Idea.** Convertir el bloque `retell` del día 6 en «Hablar sin mirar»: un monólogo guiado por semana. Sustituye al `soon("retell")` (mismos 6 min, no *core*, así que no cambia los 188 min por semana ni el modo corto).

**Código (PR de unos 300 líneas, M).**
- Ruta nueva `#/monologo/:unit?part=&k=` y `blockRoute.ts` (caso `kind: "monologue"`), pantalla `src/features/speaking/MonologueScreen.tsx`.
- Reutiliza: `useRecorder`/`RecordTake` (grabar), `CompareRow` (oír el modelo y la propia toma), `playModel` (clip → nativa → voz del sistema, ya corregido en PR #61), `writingLevel(unit)` de `src/domain/writingCheck.ts` para la escalera (reconstruir / marcos / libre), `useTimer`-style: la pantalla mide segundos entre `start` y `stop` (porque `Take` no trae duración) y los compara con el rango del paso.
- `SelfEval` se parametriza (`questions` como prop, por defecto las tres actuales): para el monólogo, «¿Cubrí los puntos?», «¿Llegué al tiempo?», «¿Se entiende?»; los puntos se tachan uno por uno (casillas), lo que da una medida objetiva (n de puntos cubiertos) además de la autoevaluación.
- `UnitMeta.has` gana la clave `monologue`; `isSoon` ya trata un `needs` ausente como «en preparación», así que las semanas sin monólogo siguen igual.
- Guardado: `activity` = `${stepId}:mono` en `recStore`; resultado en el registro de actividad con `appendLog` (igual que `nivel:*`).

**Contenido.** Archivo nuevo `src/content/monologos.ts` (o `.json`), clave = id del paso (35 entradas: 28 + 7 B):
```ts
interface Monologue {
  prompt: string;       // consigna en español: «Preséntate y cuenta tu rutina»
  points: string[];     // 3–5 puntos que cubrir, en español
  frames?: string[];    // marcos en italiano (niveles «reconstruir» y «marcos»)
  model: string;        // texto modelo en italiano, 40–110 palabras
  seconds: [number, number]; // rango objetivo de duración
}
```
- Escalera: pasos hasta u06 → 30–45 s con marcos (el modelo se repite y se cambia un dato); hasta u14 → 45–75 s con puntos y marcos; desde u15 → 75–120 s solo con puntos; puente → 120 s (equivale al «monólogo ~2 min» del CILS A2 y B1).
- Tipos de consigna (de las pruebas orales A2/B1): presentarse, describir a una persona, describir un lugar o una imagen (se guarda la «imagen» como una descripción escrita de 3 líneas, **sin fotos nuevas**: no hay derechos de imagen que resolver), contar el día, contar un fin de semana pasado, dar una opinión con motivos, proponer un plan, comparar dos cosas.
- Total: **35 monólogos** (28 + 7 B), cada uno con ~4 puntos y un modelo → ≈ 3.000 palabras de italiano nuevo.
- **Audio del modelo**: `scripts/tts/extraer.mjs` suma la fuente `monólogo` (hoy no incluye `writing.model` ni nada de esto; ver `07-audio-pronunciacion-y-ejemplos.md`). 35 clips de ≈ 0,5 MB cada uno (estimado a partir de 14 KB de media por clip de frase: los modelos son más largos, **no medido**), así que ≈ 5–15 MB más para la caché `audio-v1`; el límite de iOS (~26 MB hoy) se revisa en el PR de audio.

## Cómo se verifica el italiano
Igual que `01-escritura.md`: léxico acumulado ≥ 95 %, V1 `verificar-fuentes.mjs`, V2 para toda construcción nueva, V3 segunda pasada, dudas a `docs/dudas-italiano.md` sin audio. Los modelos usan solo estructuras ya enseñadas en esa semana; si una necesita algo que aún no se enseñó, se cambia la consigna, no se inventa el italiano.

## Tests nuevos
`src/content/monologos.test.ts`: (1) un monólogo por paso de `COURSE`; (2) 3–5 puntos; (3) modelo dentro del rango de palabras de su escalón; (4) `seconds[0] < seconds[1]` y crece con la fase; (5) todo `frames` aparece (o se compone) en el modelo; (6) cada paso con monólogo tiene `has.monologue`; (7) no hay `___` ni asteriscos sueltos. `src/domain/monologue.test.ts`: la medida de duración y los puntos cubiertos. Cuando se generen los clips, un test de que cada modelo tiene clip (como el de coherencia de audio existente).

## Tamaño y orden
- PR A `feat` pantalla + ruta + `has.monologue` + 2 monólogos de ejemplo para probar (M).
- PR B `contenido` monólogos F1–F2 (u25–u27, 16 semanas: 16 entradas) (M); PR C F3–F4; PR D F5–F6 + puente.
- PR E `feat(audio)` clips de los modelos (depende de Piper, `07`).

## Dependencias
Depende de nada en código (PR A). Comparte escalera con `01`. Si se decide no construir «Hablar sin mirar» (decisión D4 en `_plan.md`), el bloque `retell` se quita del ciclo.

## Qué no se puede medir
Si lo dicho es correcto o inteligible. Solo se mide cuánto habló (segundos), cuántos puntos marcó cubiertos y su autoevaluación. Los umbrales de segundos son **propios**, calibrados con el rango de 2 min del CILS, no medidos con uso real.

## Ajuste por la evidencia (`11`, E1)
Cada monólogo se hace **en tres vueltas** con la misma consigna y tiempo decreciente (`seconds` pasa a un trío, p. ej. 90 / 70 / 55 s en el escalón alto; los valores son una propuesta, no medidos). Después de la primera vuelta la pantalla muestra la lista de formas meta y los puntos como **retroalimentación diferida** y recién entonces se hacen las vueltas 2 y 3. Respaldo: repetir la misma tarea oral mejora la fluidez, no la precisión; la precisión mejoró cuando se añadió retroalimentación diferida (Tran & Saito 2021; Lambert et al. 2017). Los tres intentos se guardan en `recStore` como `${stepId}:mono:1..3`. Prioridad: **antes** que el `extend` de escritura (D2).
