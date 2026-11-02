# Prompts finales: segunda pasada (G-R) y reglas largas

Dos prompts listos para pegar. Ninguno necesita contexto de esta conversación.

## 1. G-R — segunda pasada independiente (sesión nueva de Claude, sin contexto)
**Por qué en una sesión nueva:** quien escribió el contenido no puede revisarlo con ojos nuevos. Esta sesión no debe ver el borrador original ni esta conversación.
**Cuándo:** con todos los PR de contenido fusionados (hoy: G1–G9 y G0 están en `main`).

```
Eres revisor independiente del contenido en italiano de una app para aprender italiano (A0→A2) de un hispanohablante chileno. El repositorio es nmsvd1979/italiano-plan (rama main). Trabaja en una rama nueva `fix/gr-revision` y abre UN solo pull request al final; no hagas push a main. Español neutro con tuteo, sin voseo ni regionalismos, en todo lo que escribas.

QUÉ REVISAR (solo italiano y su traducción al español; no reescribas por estilo):
- src/content/grammar/unidad01–24.ts y src/content/nuevas/u25–u28.ts (reglas, ejemplos, ejercicios, explicaciones «why»)
- src/content/dialogues.ts, dictation.ts, writing.ts, vocab.json, vocab-g3.json
- src/content/lectura.json (textos graduados y preguntas), sinpista.json (práctica sin pista), pruebas.json (reserva de ítems de prueba)
- src/content/pronunciation/ (secuencia de pronunciación y pares mínimos)
Los datos de origen están en data/g3 … data/g8 (no los edites; corrige el archivo en src/content o, si lo genera un script, el archivo de data y vuelve a compilar con el script de scripts/gN-compilar.py).

LISTA DE COMPROBACIÓN (docs/v2/07-fase-G-contenido.md, G5 paso 2):
concordancia de género y número; artículos (il/lo/l', un/uno/una/un'); preposiciones articuladas; consonantes dobles (geminadas); apóstrofos y elisiones; tildes (è, é, à, ò, ù, perché, più, già, sì); participios y concordancia con essere; ausilio correcto (avere/essere); falsos amigos mal etiquetados; calcos del español; formas de cortesía (Lei/tu) coherentes dentro de una misma frase o diálogo; respuestas de ejercicios que no acepten una forma incorrecta ni rechacen una correcta; opciones «distractoras» que en realidad sean correctas.
También: que ninguna unidad use gramática o vocabulario que aún no se enseñó (revisa el orden en src/content/course.ts: u25, u01, u02A/B, u03A/B, u04, u05A/B, u06A/B, u26, u07A/B, u08, u27, u09, u10, u11, u12, u28, u13, u14A/B, u15A/B, u16, u17, u18, u19, u20, u24, y el Puente a B1 u21–u23).

CÓMO TRABAJAR:
1. Lee docs/dudas-italiano.md y docs/v2/auditoria/_verificacion.md: ahí están las frases ya confirmadas con fuentes y las que siguen sin confirmar.
2. Revisa por bloques (una unidad o un archivo a la vez) y corrige en el mismo lugar. Después de cada bloque: `npx vitest run` debe seguir en verde (el contenido tiene pruebas automáticas) y, al final, `npx tsc -b` y `npm run build`.
3. Si no estás seguro de una frase, NO la cambies a ojo: anótala en docs/dudas-italiano.md con archivo, frase, problema y tu confianza (alta/media/baja). Si una frase italiana es dudosa, no la reemplaces sin fuente; una frase sin confirmar no recibe audio.
4. Contrasta con fuentes abiertas (diccionario Treccani, Accademia della Crusca, Wiktionary, sitios institucionales) solo lo que sea frase hecha o forma dudosa; anota URL y resultado en docs/v2/auditoria/_verificacion.md.
5. Un commit por tipo de cambio (p. ej. «tildes y apóstrofos», «concordancia», «ejercicios con respuesta incorrecta»).
6. Regla de parada: si más del 5 % de las frases revisadas necesita corrección, avísalo arriba del PR para repetir la pasada completa.

NO HAGAS: no cambies el orden del curso, no borres ejercicios (corrígelos), no toques src/ fuera de src/content, no marques como verificado algo que no comprobaste, no incluyas datos personales.

ENTREGABLE: un PR con los cambios y, al inicio de su descripción, una tabla: archivo | hallazgos corregidos | hallazgos en dudas | confianza.
```

## 2. Code — reglas largas con «más detalle» (u16 y u17)
**Para qué:** H-all-06 y H-u16-01 / H-u17-01 del backlog: la regla de u16 (~260 palabras) y la de u17 (~230) son demasiado largas. Se parte en una regla corta visible y un bloque «Más detalle» plegable. Hoy `Lesson.rule` es una lista de bloques (`p` o `table`).

```
Trabaja en la rama `feat/regla-mas-detalle` y abre un PR (no hagas push a main). Un solo tema.

Objetivo: permitir que una lección marque parte de su regla como «Más detalle», plegada por defecto, para acortar las reglas largas de u16 y u17.

1. En src/content/grammar/types.ts, agrega a los bloques de regla un campo opcional `detail?: true`. Los bloques con `detail: true` no se muestran al abrir la lección; aparecen al tocar «Más detalle» (un botón de texto bajo la regla corta que se despliega y se pliega; accesible por teclado y con aria-expanded). Sin ningún bloque con `detail`, la lección se ve exactamente como hoy.
2. En la pantalla de la lección (src/features/grammar/…), muestra primero los bloques sin `detail` y, si existen bloques con `detail`, el botón. Recuerda el estado abierto/cerrado solo en memoria (no en localStorage).
3. Prueba automática: una lección con bloques `detail` los oculta hasta tocar el botón; una sin ellos no muestra el botón; las tablas dentro de «más detalle» se renderizan igual.
4. NO cambies el texto italiano ni los ejemplos. Marca con `detail: true` lo que yo indico en src/content/grammar/unidad16.ts y unidad17.ts: deja visibles el primer párrafo y la primera tabla de cada regla, y pasa el resto a «Más detalle».
5. Antes del PR: `npx tsc -b`, `npx vitest run`, `npm run build` en verde. Restaura tsconfig.tsbuildinfo con git checkout.
6. En la descripción del PR incluye el enlace para probar (https://nmsvd1979.github.io/italiano-plan/#/gramatica/u16 después de fusionar) y los pasos: abrir Hoy → lección de u16 → ver la regla corta → tocar «Más detalle» → ver el resto → tocar de nuevo para plegar.
```
