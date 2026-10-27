# Fase G — Contenido: esquemas, cuotas y control de calidad

## G1. Cuotas por unidad (24 unidades)
| Elemento | Hoy | Meta |
|---|---|---|
| Palabras | 20 | ~50 (total ~1200), cada una con frase, género/artículo, sílaba tónica, etiqueta de transferencia |
| Frases de repaso (SRS `cloze`/`listen`) | 0 | 12–15, con audio |
| Diálogo de entrada | 6–11 líneas | mismo, con traducción por línea y audio |
| Texto graduado | 0 | 1 de 100–250 palabras (crece con las fases) + 4 preguntas (3 opción múltiple, 1 respuesta breve) |
| Dictado | 6 | 10 (niveles: huecos, parcial, completo según unidad) |
| Ejercicios de práctica sin pista | 0 | 12 (tipos: ordenar, traducir con varias respuestas, corregir error, transformar, completar diálogo, escuchar y elegir) |
| Ítems de prueba (reserva, no se practican) | 0 | 12 (lectura 3, escucha 3, gramática 4, vocabulario se saca del SRS) |
| Tarea de escritura | 1 | 1, con `mustInclude` y escalera (ver `05`) |

Volumen aproximado total: ~700 palabras nuevas, ~700 frases, 24 textos, ~100 preguntas, ~290 ejercicios, ~290 ítems de prueba. Es el trabajo más largo del plan.

## G2. Esquemas (TypeScript, en `src/content/`)
```ts
// vocab.json (nuevo esquema; el actual {it, es} se migra sin perder palabras)
interface Word {
  id: string;            // "w-u04-013"
  it: string;            // "il caffè"
  lemma: string;         // "caffè"
  es: string;
  pos: "n" | "v" | "adj" | "adv" | "prep" | "conj" | "pron" | "expr";
  gender?: "m" | "f";
  stress?: string;       // "caffè" (sílaba tónica marcada con tilde o subrayado, según la palabra)
  tag: "transparente" | "parecida" | "falso-amigo" | "opaca";
  unit: string;          // unidad donde se introduce
  freqRank?: number;     // de la lista de frecuencia elegida (ver G4)
  example: { it: string; es: string; sentenceId: string };
}
// sentences.ts
interface Sentence { id: string; it: string; es: string; unit: string; wordIds: string[]; audio?: string; }
// texts.ts
interface GradedText {
  id: string; unit: string; title: string; level: "A1" | "A2";
  lines: { it: string; es: string; audio?: string }[];
  questions: ({ type: "choice"; prompt: string; options: string[]; answer: number; kind: "general" | "detalle" | "inferencia" }
            | { type: "short"; prompt: string; accept: string[] })[];
}
// tests/<unit>.ts: ítems de prueba con tipo "reading" | "listening" | "grammar".
```
Las pruebas existentes de `CLAUDE.md` se mantienen y se agregan: cada palabra tiene frase y `sentenceId` válido; todo `wordIds` existe; textos con 4 preguntas; todo `answer` en rango; sin voseo (`lang.test.ts`); cada frase que usa palabras fuera del léxico acumulado hasta esa unidad se lista (advertencia, no error) en un informe.

## G3. Reglas de redacción
1. **Léxico acumulado:** un texto de la unidad N usa casi solo palabras y estructuras de las unidades 1..N. Meta: ≥ 95 % de palabras conocidas (cifra tomada de la sección de principios; criterio propio como umbral). Se calcula con un script que lista las palabras desconocidas.
2. **Reciclaje:** cada palabra meta aparece en ≥ 3 textos/diálogos/frases distintos de su unidad y reaparece en las siguientes.
3. **Naturalidad:** frases que un hablante diría. Nada de frases de «ejemplo de gramática» vacías.
4. **Español de las traducciones:** neutro, tuteo, sin regionalismos.
5. **Etiquetas de transferencia:** `transparente` solo si la forma y el significado coinciden casi con el español; `falso-amigo` solo con significado distinto verificado (anotar la fuente en `docs/dudas-italiano.md` si hay duda).
6. **No inventar:** cualquier duda sobre la corrección del italiano va a `docs/dudas-italiano.md` con la frase y la razón de la duda, y esa frase no se genera en audio hasta resolverla.

## G4. Lista de frecuencia
La lista de frecuencia ya se usó para verificar (`it_50k` de FrequencyWords, subtítulos de cine y TV; resultado en `auditoria/_verificacion.md` §2). Para ordenar las ~50 palabras por unidad se usa la misma lista solo como criterio de consulta (no se copia al repositorio; registrar licencia si se llegara a incluir) en `docs/v2/lista-frecuencia.md`. Uso: ordenar las ~50 palabras por unidad con 40 % de alta frecuencia general y 60 % del tema; completar `freqRank`. Si no se encuentra una lista con licencia clara, se omite `freqRank` y se ordena por criterio del tema.

## G5. Protocolo de calidad (obligatorio, porque el audio fija los errores)
1. **Redacción** (Claude Code): una unidad completa en un commit.
2. **Segunda pasada independiente:** otra sesión (sin ver el borrador original en su contexto) revisa solo con la lista de comprobación: concordancia de género/número, artículos (lo/il, un/uno, l'), preposiciones articuladas, geminadas, apóstrofos, tildes (è/é/à/ò/ù), participios y concordancia con *essere*, falsos amigos mal etiquetados, calcos del español. Cada hallazgo corrige o va a `docs/dudas-italiano.md`.
3. **Verificación con fuentes** (reemplaza la muestra nativa, que no es posible): (V1) `scripts/verificar-fuentes.mjs` sobre todo el texto nuevo; (V2) cada frase hecha o dudosa se contrasta con una fuente italiana abierta (diccionario, Crusca, sitio institucional) y se anota URL y resultado en `docs/v2/revision-fuentes.md`; lo que no se confirma va a `docs/dudas-italiano.md` y **no recibe audio**. Si más del 5 % de las frases consultadas no se confirma, se repite la segunda pasada de la fase entera. Detalle y niveles de evidencia en `auditoria/_verificacion.md`.
4. **Recién entonces** se genera audio de esa fase (fase C).

## G6. Orden de redacción (sin piloto)
El contenido se escribe por **carriles temáticos**, no por unidades estudiadas primero: G0 correcciones de la auditoría (8 unidades por PR), G1 unidades nuevas u25–u28, G2 partición A/B, G3 vocabulario, G4 textos graduados, G5 ejercicios sin pista, G6 pronunciación, G7 puente B1 + u20 + u24 (`11`, §2–3). Cada PR trae contenido + tests + informe de léxico; no se mezcla con cambios de código. El inventario de lo que hay que escribir está en `13`, §5, y los hallazgos por id en `auditoria/_backlog.md`.
