# Registro de verificación con fuentes por PR de contenido

Cada PR de contenido anota aquí qué italiano nuevo o cambiado entró, con su nivel de evidencia (`auditoria/_verificacion.md` §1): **V1** automático, **V2** fuente abierta (URL), **V3** segunda pasada. «Sin confirmar» va a `docs/dudas-italiano.md` y no recibe audio.

## G0-1 · u01–u08 (rama `feat/auditoria-u01-u08`)
| Cambio | Unidad | Evidencia | Nota |
|---|---|---|---|
| *argentino/a* → *cileno/a / cilena / cileni*, *Córdoba/Mendoza/Buenos Aires* → *Santiago/Valparaíso* | u01 | V1 (*cileno, cilena, cileni* están en la lista de palabras) | cierra la parte de u01 de `H-all-09` |
| *Lucía* → *Lucia* (grafía italiana del nombre) | u01 | V1 (nombre propio en la lista) | |
| *Vuole altro?* → *Vuole qualcos'altro?* (diálogo y ejercicio) y *qualcos'altro* («algo más») al vocabulario | u04 | V2: aparece en el diálogo de [Kaiwa, pedir café](https://trykaiwa.com/blog/italian-cafe-ordering-realistic) | el vocabulario pasa de 20 a 21 |
| Regla de negación reescrita: «con *mai, niente, nessuno, più, ancora* después del verbo también va *non* (*Non vedo nessuno*, como en español)» | u08 | Regla estándar; ejemplo ya presente en la unidad | solo redacción; no cambia el contenido |
| *Mi alleno due volte alla settimana* → *Esco due volte alla settimana* (ejercicio) | u08 | V1; *uscire* se enseña en u05 | evita una palabra no enseñada (la forma *mi alleno* sí está confirmada en [Lingua-Italiana.it](https://www.lingua-italiana.it/en/verbi-italiani-en/allenarsi.html)) |

**Sin cambiar (sin fuente que confirme una alternativa):** *Cosa prende?* (u04), *Ecco il resto* (u03). Siguen en `docs/dudas-italiano.md`.

## G0-2 · u09–u16 (rama `feat/auditoria-u09-u16`)
| Cambio | Unidad | Evidencia | Nota |
|---|---|---|---|
| *Sono nato a Buenos Aires* → *Sono nato a Santiago* | u10 | V1 (sin palabras nuevas) | completa `H-all-09` |
| Etiquetas de la tabla de pronombres: *él / lo*, *ella / la*, *ellos / los*… → *a él, a ella, a ellos…* y encabezado «a quién» | u13 | Solo español; los pronombres italianos no cambian | corrige la mezcla de clíticos del español con sujetos |

**Fuera de G0 (es contenido nuevo, necesita fuente y va a G):** *mi è piaciuto* (u10), *c'era / c'erano* y más ejercicios (u11), pronombres tónicos (u12), *ci vuole* (u14), dividir la regla de u16 con «más detalle», reemplazar *Ecco a Lei* (u16). Las partes de u14/u15 son G2.

## G1 · u25 Alfabeto, deletreo, acento y supervivencia (rama `feat/unidad-u25`)
Contenido en `src/content/nuevas/u25.ts` (aún sin conectar a los registros; se conecta cuando el PR de curso y datos, H1, esté fusionado). Todas las palabras nuevas pasan V1 (lista de palabras o corpus de frecuencia).

| Contenido | Evidencia | Fuente |
|---|---|---|
| 21 letras; nombres *a, bi, ci, di, e, effe, gi, acca, i, elle, emme, enne, o, pi, cu, erre, esse, ti, u, vi / vu, zeta*; letras extranjeras *i lunga, kappa, doppia vu, ics, i greca* | **V2, dos o más fuentes** | [Brooklyn College, alfabeto](https://academic.brooklyn.cuny.edu/modlang/carasi/courses/ITALIAN.COMMON.FILES/DISPENSE/dispensa.ALFABETO.htm), [Lingoda](https://www.lingoda.com/blog/it/alfabeto-italiano/), [Think in Italian](https://www.thinkinitalian.com/italian-alphabet/) (Lingoda escribe «qu» para la Q; las otras dos, «cu», que es lo que se enseña) |
| *Non ho capito* · *Può ripetere, per favore?* / *Puoi ripetere* (formal / informal) · *Più piano, per favore* · *Come si dice…?* · *Che cosa significa…?* · *Come si scrive…?* | **V2, dos fuentes** | [Haverford OER, Cotto e mangiato](https://oer.haverford.edu/cottoemangiato1/chapter/unita-1-prima-di-cominciare/) y [LibreTexts, Voci](https://human.libretexts.org/Bookshelves/Languages/Italian/Voci%3A_Corso_elementare_di_lingua_e_culture_italiane_I_(Bozzato_Benetollo_and_Mugnai)/01%3A_Unita_1/1.01%3A_Unita_1_-_Prima_di_cominciare) (esta segunda no trae *puoi*) |
| *Come ti chiami?* · *Mi chiamo…* · *Di dove sei?* · *Sono di…* | **V2, una fuente** | [Italiano Bello, introduce yourself](https://italiano-bello.com/en/italian-course/a1-course/introduce-yourself/) |
| Acento: *caffè*, *tè* (grave) y *perché* (agudo); *è / e*, *sì / si*, *là / la*; sílaba fuerte penúltima en las palabras llanas | **V2, una a dos fuentes** | [Libreriamo](https://libreriamo.it/lingua-italiana/corretto-uso-accento-lingua-italiana/), [Sapere.it](https://sapere.virgilio.it/rubriche/perche-in-italiano-usiamo-due-accenti-diversi-6013). **No confirmado:** *dà / da* (no se usa en la unidad) |
| Pares *sono/sano, tutto/tetto, cena/cina, vino/vano* | **V1** | corpus de frecuencia; son palabras comunes que solo se distinguen por la vocal |
| *Piacere!*, *Perfetto!*, *Certo!*, *Scusa*, *Ah*, *a presto*, *in Cile*, deletreo en voz alta («Esse, a, enne…») | **V1** | Palabras comunes ya usadas en otras unidades; el deletreo usa los nombres de letras confirmados arriba |

**Evitado a propósito (sin fuente):** *Come si chiama?* (formal) y *Di dov'è?* (siguen en u01 como estaban), *doppia enne* para deletrear dobles, ciudades para deletrear (solo se confirmó que se usan, no la lista completa), y *città / papà* como ejemplos de tilde (no los traía ninguna fuente abierta).
**Sin audio todavía:** las palabras de pronunciación de u25 (*sono, sano, tutto, tetto, cena, cina, vino, vano, amico, casa, caffè, perché, tè, sì, là, otto*) se registran en `AUDIO_PENDING` al conectar la unidad, salvo las que ya tengan grabación nativa en el manifest.
