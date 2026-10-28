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

## G1 · u26 Personas y familia (rama `feat/unidad-u26`)
Contenido en `src/content/nuevas/u26.ts`; se conecta sola a los registros porque está en `NUEVAS`. La unidad sigue `ready:false` hasta decidir la activación del flujo diario (`u25`–`u28`). Todas las palabras pasan V1: están en la lista napolux o en el corpus de frecuencia (*figlio, marito, mamma, medico, lavoro* en las 1.000 primeras; *insegnante, cugino, filo* en las 3.000; *architetto, molle, paglia, pala, castani* son raras pero existen).

| Contenido | Evidencia | Fuente |
|---|---|---|
| Léxico de familia: *padre, papà, madre, mamma, genitori, fratello, sorella, figlio/a, nonno/a, zio/a, cugino/a, nipote, marito, moglie*; plurales *i fratelli, i figli, gli zii, i nonni, i cugini*; *nipote* = sobrino/a o nieto/a; *ragazzo/a* | **V2, dos fuentes** | [Haverford OER, Unità 5](https://oer.haverford.edu/cottoemangiato1/chapter/unita-5-vocabolario/), [Italiano Bello, Famiglia](https://italiano-bello.com/en/vocabulary/famiglia-family/) |
| *Ho una sorella maggiore e un fratello minore* · *Ha fratelli o sorelle?* (formal) | **V2, una fuente** | [FastItalian, domande sulla famiglia](https://fastitalianlearning.com/phrases/meeting-the-family/domande-sulla-famiglia) («No — ho una sorella maggiore e un fratello minore», «Ha fratelli o sorelle?», «Quindi è figlio unico?») |
| *Hai fratelli o sorelle?* · *Ho due fratelli* · *Sono figlio / figlia unico/a* | **V2 parcial** | Construcciones con *avere* y *essere* ya enseñadas; la fuente trae *Hai fratelli?* (sublearn) y *è figlio unico* en tercera persona. Queda anotado como parcial |
| *Che lavoro fai?* · *Sono un insegnante* · *Sono uno studente* | **V2** | [Colanguage A1.7](https://italian.colanguage.com/syllabus/a1/7), [Sublearn](https://sublearn.com/fr/learn/it/phrases/che-lavoro-fai) |
| *Faccio l'architetto* · *fare* + artículo para la profesión · *Mia madre fa l'insegnante* | **V2** (primera y patrón de tercera persona) | [Sublearn](https://sublearn.com/fr/learn/it/phrases/che-lavoro-fai) («Faccio l'architetto»), [Gymglish](https://gymglish.com/en/saga-baldoria/italian-vocabulary/faccio-il-medico) («Faccio il musicista», «Faccio il camionista»). *Mia madre fa…* aplica la conjugación de *fare* ya enseñada |
| Adjetivos físicos y de carácter (*alto, basso, simpatico, gentile, intelligente*); *Lui è molto alto*, *Lei è piuttosto bassa*, *Ha i capelli biondi e lunghi*, *Ha gli occhi marroni*; colores de pelo y ojos | **V2** | [ThinkInItalian](https://www.thinkinitalian.com/italian-adjectives-describe-a-person/) |
| Nacionalidades *cileno/a, argentino/a, peruviano/a, messicano/a, spagnolo/a, colombiano/a, brasiliano/a, francese, tedesco/a, italiano/a* y regla *-o/-a*, *-e* | **V2** | [Lingoda, paesi e nazionalità](https://www.lingoda.com/blog/it/paesi-nazionalita-italiano/) |
| Sonido *gli*; pares *figlio/filo*, *moglie/molle*, *paglia/pala* | **V1** | Corpus de frecuencia (las seis son palabras reales); descripción del sonido en [Cursa, GLI and GN](https://cursa.app/en/page/gli-and-gn-two-signature-italian-sounds) |
| *Che bello!*, *Allora ci vediamo domani, ciao!*, *ancora* | **V1** | Palabras comunes; *Che bel…!* ya está en u06 |

**Evitado a propósito (sin fuente):** femeninos de profesiones (*la medica, la architetta*), *ingegnere / avvocato / cameriere* como parte de la lección, y *Com'è…?* como pregunta de descripción.
**Sin audio todavía:** *cugino, figlia, figli, filo, fratello, moglie, molle, paglia, sorella* se registran en `AUDIO_PENDING`.
**Dudas:** *Sono figlio unico* y *Hai fratelli o sorelle?* están construidas por gramática a partir de fuentes parciales (arriba). No se generará audio hasta que pasen una segunda pasada (G-R).
