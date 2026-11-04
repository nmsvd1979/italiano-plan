# Frente 8 · El repaso espaciado usa solo 577 palabras y va por detrás del curso

## Qué es
El repaso espaciado (FSRS vía `ts-fsrs`) crea tarjetas solo de las **577 palabras de unidad** (`getVocab`). Las **829 palabras ampliadas** (G3, `vocab-g3.json` → `extra`) ya se *muestran* en los bloques de palabras de los días 3–5 (PR #64, `vocabBlocks.ts`) pero **nunca llegan al SRS**; las 574 de `base-frecuente.json` no se usan en ninguna pantalla. Además, el ritmo de introducción no alcanza al curso.

## Evidencia
- `srsDeck.ts`: `wordsOfUnit(unit)` recorre `getVocab(unit)`; `srsQueue.ts` introduce candidatos solo de ahí (más el mazo `quizlet` si se activa en Ajustes, +5/día, 1.231 palabras sin cruce con las unidades: 165 de 445 del vocabulario aparecen en ese set, `docs/quizlet-cruce.md`).
- `LIMITS` (`srsQueue.ts`): 8 nuevas por día, bloqueo de nuevas con > 40 vencidas, sesión de 20 tarjetas.
- Simulación de la auditoría (`flujo.md` F-flujo-05, `medicion/sim2.ts`, supuestos: una sesión de 20 al día, 90 % «Bien»): al terminar el curso se habían introducido **314 / 377 / 418 de las 577** palabras con 15 / 30 / 60 min diarios (54–72 %). Sin tope de sesiones (`post.ts`) se introducen las 577 en ≈ 90 días.
- Duplicados: 54 de las 577 tarjetas de reconocimiento (9,4 %) son la misma palabra en otra unidad (*perché*, *dire*, *famiglia*…): `wordItemId` incluye la unidad (F-cont-05).
- El conjunto total que valdría la pena memorizar con lo ya escrito: 577 + 829 = **1.406** palabras con frase (+ 574 del mazo general); 1.406 × 2 direcciones (reconocer y escribir, `unlockProdCards`) = 2.812 tarjetas.

## Cómo se arma
**Código (2 PR).**
- **PR 8a (M): las palabras ampliadas entran al SRS, a medida que se ven.** `wordsOfUnit(unit, { extra: true })` incluye `getWords(unit)` (con `extra`). En `srsQueue.eligibleUnits` se pasa a un nivel más fino: una palabra *ampliada* es candidata solo si se hizo **el bloque de palabras que la contiene** (`words3`, `words4` o `words5`; el reparto en tres lotes ya lo calcula `vocabForBlock`). Las palabras base siguen entrando con `words`/`words2…` como hoy (`wordsSeen`). Los ids de las tarjetas existentes **no cambian** (las ampliadas tienen ids nuevos `wordItemId(unit, it)`); no hace falta migración. Las tarjetas de reconocimiento y de escribir, el `unlockProdCards` y `resolve`/`distractors` de `srsDeck.ts` deben conocer la lista ampliada (hoy `wordsOfUnit(card.unit).find(...)` no las encontraría y devolvería `null`: ese es el test central).
- **PR 8b (M): ritmo.** Separar «nuevas» de «vencidas» para que una cola larga de vencidas no deje a las nuevas fuera de la sesión: p. ej. la sesión de 20 reserva 6 lugares para nuevas mientras `dueTotal ≤ blockNewAbove × 2`. **Es una propuesta; los valores (6, 80) hay que fijarlos con la simulación**, no a ojo. `srsMinutes` ya acota el bloque a 1–10 min.
- **PR 8c (S): duplicados.** Mapa `LEMMA_HOME` (palabra → unidad principal) calculado por script a partir de `getWords`; la cola no crea tarjeta nueva de una palabra cuya unidad no sea la principal. Las tarjetas ya creadas siguen resolviéndose (no se quita la palabra de `wordsOfUnit`; se filtra solo en la lista de candidatas nuevas).
- **Opcional, no ahora:** conectar `base-frecuente.json` (574, `loadGeneralDeck`) como mazo alternativo al de Quizlet en Ajustes. Razón: son frases propias de G3 con `n` de frecuencia; el set de Quizlet es de terceros y **no encontré su licencia ni su origen documentados** en los archivos que leí (`docs/quizlet-cruce.md` no la menciona). Decisión de la persona (D8).

**Contenido.** Ninguno nuevo para 8a–8c. (Reutiliza las 829 frases de G3; su audio es el frente 7.)

## Cómo se verifica el italiano
No hay italiano nuevo. Las tarjetas muestran `it`/`es` de `vocab-g3.json`, cuya revisión está en G3/G-R (ver `07`: en `revision-fuentes.md` no encontré una sección específica; confirmar el nivel de evidencia antes de que las tarjetas lleguen a la persona, porque el SRS **repite** cada palabra decenas de veces y fija los errores).

## Cómo se mide que funcionó (con el código existente, sin inventar)
Se vuelve a correr `docs/v2/auditoria/medicion/sim2.ts` y `post.ts` con la lista ampliada (el script usa `wordsOfUnit`) y se compara:
| Medida | Hoy (auditoría) | Meta propuesta (criterio propio) |
|---|---|---|
| Palabras de unidad introducidas al terminar el curso, 30 min/día | 377 de 577 (65 %) | ≥ 95 % de las **elegibles** (las 577 y las ampliadas cuyo bloque se hizo) |
| Minutos de SRS por día | 5 (tope por sesión) | ≤ 10 de media (`SRS_MAX_MINUTES`); ninguna sesión > 40 tarjetas |
| Cola de vencidas | — | ≤ 60 sostenida (umbral de `11` §4) |
La meta del 95 % y los 10 min son **provisionales**, no medidos con uso real. Falta: datos de uso (`timing`, `activityLog`) para saber si 8 nuevas/día se sostienen.

## Tests nuevos
1. `srsDeck.test.ts`: `resolve` de una tarjeta de palabra ampliada devuelve `it`/`es` correctos; `distractors` de una ampliada no incluye la respuesta.
2. `srsQueue.test.ts`: una ampliada no es candidata antes de su bloque, sí después; las ids de tarjetas existentes no cambian; las duplicadas no crean tarjeta nueva en la unidad secundaria pero siguen resolviéndose.
3. `simulation.test.ts` (existe): extender la simulación de 60 días con las ampliadas y exigir cola ≤ 60 y palabras introducidas ≥ meta.
4. `storageShape.test.ts`: un SRS con tarjetas de ids antiguos y nuevos carga sin error.

## Tamaño y orden
8a (M) → 8c (S) → 8b (M, después de medir con la simulación). Los tres son `feat`/`fix` de código, separados.

## Dependencias
8a ← #64 (hecho). 8b/8c ← 8a. El audio de las frases (`07`) no bloquea el SRS: las tarjetas de palabras usan `say()` (grabación nativa o voz del sistema).

## Qué no se puede medir
Retención real (la simulación supone 90 % «Bien»), carga que la persona aguanta y si 2.812 tarjetas son demasiadas para ella. Con uso real: tarjetas con ≥ 2 repasos acertados ≥ 80 % (`11` §4).
