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

## Suficiencia del vocabulario (condición de la persona, D8)
La persona pidió que haya **palabras suficientes para entender, seguir una conversación, trabajar**. Lo que se pudo medir hoy (`vocab-g3.json` y `base-frecuente.json`, campo `n` = puesto en la lista de frecuencia `it_50k` de `auditoria/_verificacion.md`):

| Conjunto | Palabras | Con puesto `n` | `n` ≤ 1.000 | `n` ≤ 2.000 | `n` ≤ 5.000 |
|---|---|---|---|---|---|
| Ampliadas de unidad (G3 `extra`) | 829 | 821 | 313 | 444 | 611 |
| Mazo general (`base-frecuente.json`) | 574 | 574 | 163 | 321 | 488 |
| Unión de ambos (sin repetidas) | 1.403 | — | 476 | 765 | — |
| Las 577 de unidad (V1 de `_verificacion.md`, 488 medidas) | 577 | 488 | 225 | 324 | 412 |

Con las tres fuentes la persona tendría ≈ **1.980 palabras con frase** (577 + 1.403). Qué **no** se puede decir con el código: qué porcentaje de un texto real de trabajo o de una conversación cubre eso. Falta una lista de frecuencia con licencia clara dentro del repo y un corpus de textos por ámbito (no se copiaron las listas, `07` G4); tampoco abrí el *Vocabolario di base* que el CILS B1 menciona (≥ 95 % del texto del vocabulario de base más hasta 5 % de léxico común, `_fuentes.md` §3).

Por eso D8 incluye dos condiciones, ambas **antes** de dar por buena la ampliación:
1. **Mazo general dentro del SRS:** las 574 de `base-frecuente.json` entran al repaso (hoy no se usan en ninguna pantalla), después de las ampliadas de la unidad que ya vio, con el mismo tope de 5 nuevas/día del mazo extra. Es el PR 8d (M), tras 8a.
2. **Revisión por ámbitos, sin inventar:** un script (`scripts/cobertura-lexico.ts`, S) cuenta las palabras de la app por ámbito (trabajo y oficina, estudios, transporte, vivienda, salud, trámites, compras, ocio, medios y tecnología) y lista los ámbitos con menos de un mínimo que ella fije. Para etiquetar cada palabra con un ámbito hace falta una pasada de contenido (≈ 1.980 etiquetas, en `vocab-g3.json` campo `domain`); mientras no exista, el recuento por ámbito **no es medible** y el plan no afirma cobertura. Si el recuento muestra un hueco (por ejemplo, trabajo), se escribe un lote de palabras con frase (≈ 60–100 por ámbito), con el protocolo V1–V3 del plan y a `docs/dudas-italiano.md` lo dudoso.

**Medición de cobertura real (E6, `11` §3).** Con la lista `it_50k` (no se guarda en el repo) se midió que todo el italiano que la app muestra cubre el 73,9 % de las palabras de esa lista, y las 577 + 829 + 574 palabras de tarjetas, 65,4 %. El script `scripts/cobertura-lexico.ts` repite la medición en cada PR de vocabulario; no fija meta numérica inventada.

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

**Decidido (9-nov): sesión de 30 tarjetas** (`LIMITS.session`, antes 20), por tu criterio de palabras suficientes para entender y trabajar. Nominal: ≈ 6,5–8 min de repaso por sesión en vez de 4,6; según la simulación, ≈ 719 palabras introducidas al fin del curso a 30 min/día (antes 507) y el curso se alarga ≈ 28 días. Si en el uso real pesa demasiado, se vuelve a 20 cambiando esa constante.

## Hecho (10-nov): script de cobertura del léxico
`scripts/cobertura-lexico.ts` (`npx vite-node scripts/cobertura-lexico.ts <it_50k.txt> [--mazo] [--faltan N]`) mide qué parte de la lista de frecuencia `it_50k` aparece en lo que la app muestra. **No mide ámbitos** (trabajo, salud…): eso exige etiquetar cada palabra y sigue sin existir; el plan no afirma cobertura por ámbito. Medición del 10-nov (subtítulos de cine y TV, por formas exactas, así que subestima): el léxico de la app cubre el **72,3 %** de las apariciones, y con el mazo de frecuencia (`--mazo`) el **76,0 %**; entre las 1.000 formas más frecuentes, 90,4 % de las apariciones (93,2 % con el mazo). Para el 95 % de las apariciones hacen falta ≈ 12.900 formas. Entre las más frecuentes que faltan hay muchas variantes sin tilde del subtítulo (*perche, piu, cosi, gia*), interjecciones y formas verbales nuevas (*pensavo, dovrei, avrebbe*).
