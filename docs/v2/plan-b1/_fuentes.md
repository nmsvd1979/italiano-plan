# Plan B1 · Fuentes y comparación con A2 y B1 (4-nov-2026)

Qué se abrió de verdad, qué no, y qué dicen. Regla de `auditoria/_temario.md`: si una fuente no lista algo, se dice «no figura en esa lista», no «no es de ese nivel». Ninguna fuente de aquí es «revisión de un nativo» (`auditoria/_verificacion.md`).

## 1. Fuentes abiertas
| Fuente | Cómo se obtuvo | Qué aporta |
|---|---|---|
| **CILS A2** (Centro CILS, Università per Stranieri di Siena, *Linee guida* §2.1.2, pp. 26–28) · <https://iicbuenosaires.esteri.it/wp-content/uploads/2025/05/Contenuti-Livello-A2.pdf> | Descargado y leído en la auditoría (`auditoria/capacidad.md` §d) | Perfil, sillabo morfosintáctico, extensión de las pruebas A2 |
| **CILS B1** (mismo documento, §2.2 «Il livello CILS UNO-B1», pp. 29–31) · <https://iicbuenosaires.esteri.it/wp-content/uploads/2025/05/Contenuti-Livello-B1.pdf> | Descargado hoy (3 páginas, texto extraído con PyMuPDF) | Perfil B1, sillabo morfosintáctico B1, número y extensión de las pruebas |
| Página del nivel B1 del CILS · <https://cils.unistrasi.it/1/79/73/Livello_CILS_UNO-B1.htm> | Abierta hoy (HTTP 200) | Solo confirma el perfil («apprendente autonomo»); no trae sillabo ni pruebas |
| Ca' Foscari, B1 · <https://www.unive.it/data/insegnamento/618467/programma> y programa B1 de la USC | Leídos el 27-oct (`_temario.md`); **no se reabrieron hoy** | Lista de lo que *empieza* en B1 en un curso universitario |

## 2. Fuentes que NO se pudieron abrir
- **CELI 1 (A2) y CELI 2 (B1)** de la Università per Stranieri di Perugia (`unistrapg.it/.../celi-i-a2-descrizione-esame.pdf` y `.../celi-2-b1-descrizione-esame.pdf`): error de certificado TLS en las dos. No se probaron otros anfitriones.
- *Profilo della lingua italiana* (Council of Europe / Accademia della Crusca): no se abrió.
- Páginas del CILS con el detalle de las pruebas y la valoración (`cils.unistrasi.it/.../Le_prove.htm`, `.../La_valutazione.htm`, `.../Esempi_prove_di_esami.htm`): existen, **no se abrieron**. Por eso **no hay umbral de aprobación del CILS B1** en este plan: no se copia uno de memoria. El único umbral que usa la app (0,8) es propio y provisional (ver `10-listo-para-b1.md`).

## 3. Qué dice el CILS B1 (literal de la fuente, resumido)
- **Perfil.** Competencia del «apprendente autonomo»: comunicarse en situaciones cotidianas por escrito y oralmente, entender los puntos esenciales de un discurso claro en lengua estándar, leer los textos más frecuentes. «La produzione orale e scritta è comunicativamente efficace, anche se contiene errori.»
- **Estructuras «oltre a quelle dei livelli precedenti»:** artículos; posición del adjetivo; comparativo y superlativo; pronombres personales tónicos y átonos, reflexivos; **pronombres relativos**; posesivos, demostrativos, interrogativos; indefinidos *ogni, ciascuno, nessuno, qualche*; preposiciones articuladas; verbos regulares, modales y *dare, fare, stare, andare, potere, sapere, bere, dire, venire* en **presente, passato prossimo, imperfetto, infinito, imperativo, condizionale presente**; adverbios frecuentes; frase simple (declarativas, interrogativas, **exclamativas**, volitivas con imperativo y condizionale); frase compleja: coordinadas **copulativas, adversativas, declarativas**; subordinadas **objetivas implícitas, temporales, causales, declarativas, relativas explícitas**.
- **No figuran en esa lista:** congiuntivo, pronombres combinados, periodo ipotetico, futuro simple, trapassato, passivo, passato remoto. (No figurar no prueba que no se evalúen; solo que esta lista oficial no los nombra.)
- **Pruebas B1 (todas de la misma fuente):**

| Habilidad | Tareas | Extensión / duración | Detalle relevante |
|---|---|---|---|
| Escucha | 3 | 600–800 palabras en total · ~30 min | Diálogos cara a cara, **llamadas**, instrucciones, audioguías, **radio**; **dos hablantes nativos**; velocidad media; se oye **dos veces** |
| Lectura | 3 | 800–1.000 palabras en total · 50 min | Cartas, narrativa, artículos divulgativos, instrucciones, **reglamentos**; elección múltiple, búsqueda de información, **reconstrucción de un texto** |
| Análisis de estructuras | 4 | 1 h | Elección múltiple, cloze, completar |
| Escritura | 2 | **tarea 1: 100–120 palabras; tarea 2: 50–80** · 1 h 10 | Describir personas o lugares, contar una historia con personajes dados, **diario de una salida o episodio**, carta informal (agradecer, pedir información, contar experiencias) |
| Habla | 2 | ~10 min | **Diálogo con el examinador (2–3 min) y monólogo (~2 min)**: describir, narrar, dar motivos y opiniones, comparar, proponer |
| Léxico | — | — | Vocabulario de base más hasta un 5 % de léxico común |

## 4. Comparación de extensión: la app frente a A2 y B1
Cifras de la app: `auditoria/capacidad.md` §a y mediciones de hoy (`npx vite-node`, sobre `main` en `de16d6b`).

| Medida | App hoy | CILS A2 (capacidad §d) | CILS B1 (hoy) |
|---|---|---|---|
| Escritura: palabras pedidas | 8–20 (mediana 13); u24 = 20; el puente u21–u23 = 15–18 | tarea 1: 30–50 / 40–60; tarea 2: 25–50 | 100–120 y 50–80 |
| Escritura: consignas | 28 (7 repetidas en la semana B) | — | 2 tareas de tipos distintos |
| Habla: monólogo | **ninguno** (1 diálogo de rol por unidad) | monólogo ~2 min | monólogo ~2 min + diálogo 2–3 min |
| Lectura: texto más largo | 163 palabras (u24); media 104 | — | 3 textos, 800–1.000 palabras en total (~300 cada uno) |
| Escucha: más largo | diálogo de 89 palabras (u24); media 68 | — | 3 textos, 600–800 palabras en total (~220 cada uno), 2 hablantes |
| Voces | **una sola** (Serena, sintética) + 588 grabaciones sueltas | diálogos, llamadas, avisos, radio | dos hablantes nativos, radio, llamadas |
| Relativas | 1 lección (u17) | «centradas en el sujeto» | «relative esplicite» |
| Exclamativas | 1 unidad (u20) | listadas | listadas |
| *Non solo… ma anche* | **0 apariciones** en `src/content` | listada | coordinadas copulativas |
| *Infatti* | 6 apariciones, todas en vocabulario/ejemplo/pronunciación; **0 en ejercicios** | listada | — |
| Congiuntivo, combinados, ipotetico | puente (u21–u23) | no figuran | no figuran en el sillabo CILS B1; **sí** los pone en B1 el programa de Ca' Foscari y el de la USC |

**Lectura honesta del último renglón.** El CILS B1 es un *examen*; Ca' Foscari y la USC son *progresiones de curso*. No se contradicen del todo, pero un estudiante que quiere «entrar a B1» en un curso universitario sí necesita el congiuntivo y los combinados; uno que quiere aprobar el CILS B1 necesita antes **más extensión, más tipos de texto y la producción oral y escrita larga**. El puente actual cubre lo primero y casi nada de lo segundo (ver `09-puente-b1.md`).

## 5. Lo que no se puede medir con el código
- Si el italiano que escribe o dice la persona es correcto (no hay reconocimiento de voz ni corrector; la corrección automática solo mira número de palabras, léxico conocido, tildes y formas meta).
- Cuánto tarda de verdad cada bloque (los minutos son nominales; la app guarda `timing`, pero aún no hay uso).
- Si 8 palabras nuevas al día o 30 min diarios son sostenibles para ella.
- Cómo suenan los clips de Serena y la voz del sistema en el iPhone.
