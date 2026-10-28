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

## G1 · u27 Tiempo libre, gustos y clima (rama `feat/unidad-u27`)
Contenido en `src/content/nuevas/u27.ts`; se conecta sola a los registros porque está en `NUEVAS`. Sigue `ready:false`. Todas las palabras pasan V1 (lista de palabras o corpus de frecuencia; *nuvoloso, camminare, ballare, nuotare, correre, suonare* comunes).

| Contenido | Evidencia | Fuente |
|---|---|---|
| *Che cosa ti piace fare nel tempo libero?* · *Nel mio tempo libero, mi piace guardare film italiani* · *Mi piace molto giocare a calcio* · *fare escursioni / giardinaggio / dolci* · *suonare uno strumento* | **V2** | [ThinkInItalian, hobbies](https://www.thinkinitalian.com/talk-about-hobbies-and-interests-in-italian) |
| *Nel tempo libero leggo molto* | **V2** | [FastItalian](https://fastitalianlearning.com/phrases/talking-about-hobbies/nel-tempo-libero-leggo) |
| *Suono la chitarra* (como patrón de *suonare* + instrumento) | **V2 parcial** | Título de [FastItalian](https://fastitalianlearning.com/phrases/introducing-yourself/nel-tempo-libero-suono-la-chitarra); no se leyó el cuerpo de la página |
| *Sapere* (+ *che / se / dove* / infinitivo) y *conoscere* (+ persona o lugar); *Scusi, sa dov'è la stazione?* · *So cucinare* · *Conosci già i miei fratelli?* · *Conosco bene Milano* · *Non lo so* | **V2** | [Italiano Bello, sapere vs conoscere](https://italiano-bello.com/en/italian-grammar/difference-between-sapere-and-conoscere/) |
| Conjugación de *sapere* (so, sai, sa, sappiamo, sapete, sanno) y *conoscere* | **V1 / conocimiento general** | La fuente no escribe las formas; coinciden con la conjugación estándar. Segunda pasada pendiente (G-R) |
| *Che tempo fa?* · *Fa caldo / freddo* · *Piove* · *Nevica* · *C'è il sole* · *È nuvoloso* · *C'è nebbia* · *Tira vento* | **V2** | [Middlebury, il tempo](https://cr.middlebury.edu/italian%20resources/progetto/lexis/tempo.htm) |
| *Fa fresco / bello / brutto*; estaciones *la primavera, l'estate, l'autunno, l'inverno*; *C'è il sole, ma fa fresco* · *C'è un vento fortissimo* | **V2** | [Kaiwa, clima y estaciones](https://trykaiwa.com/blog/italian-weather-seasons-vocabulary), [FastItalian, tiempo](https://fastitalianlearning.com/phrases/talking-about-weather) |
| *Ogni* (invariable, singular) · *qualche* (singular) · *alcuni/alcune* (plural) · *tutti i giorni* · *tutte le ragazze* · *altro/a/i/e* | **V2** | [FastItalian, indefinite adjectives](https://fastitalianlearning.com/learn/a2/indefinite-adjectives), [Middlebury, aggettivi indefiniti](https://cr.middlebury.edu/Italian%20Resources/progetto/grammar/topics/aggettivi_indefiniti.htm) (*altro* y *ogni* sin ejemplos propios; los ejemplos de la lección son construcciones directas) |
| *s* sola entre vocales suele ser sonora; *ss* siempre sorda; pares *casa/cassa*, *rosa/rossa*; *mese/messe* | **V2 / V1** | [FastItalian, rossa](https://fastitalianlearning.com/tongue-twisters/double-consonants/rossa-ossa-fossa), [Libretexts, la pronuncia](https://human.libretexts.org/Bookshelves/Languages/Italian/SPUNTI%3A_Italiano_Elementare_1/01%3A_Unita_1/1.02%3A_La_pronuncia); *messe* solo V1 |
| *Ho caldo* (tengo calor) frente a *Fa caldo* | **V1 / gramática** | *Avere* + sensación ya enseñado en el curso (*Ho fame*); sin fuente propia |
| *Allora restiamo a casa*, *Un altro caffè?*, *Sai suonare?*, *No, ma so cantare un po'*, *Qualche volta* | **V1** | Construcciones directas con palabras frecuentes; segunda pasada pendiente |

**Evitado a propósito (sin fuente):** *in estate / d'estate / in inverno* (no aparecen en las fuentes consultadas), *Com'è il tempo?* como respuesta enseñada, y la variación regional de la *s* más allá de «suele ser sonora» (la fuente dice «often voiced»).
**Sin audio todavía:** *autunno, messe, primavera, rossa* se registran en `AUDIO_PENDING`.

## G1 · u28 Comer fuera (rama `feat/unidad-u28`)
Contenido en `src/content/nuevas/u28.ts`; se conecta sola a los registros porque está en `NUEVAS`. Sigue `ready:false`. Todas las palabras pasan V1 salvo las indicadas.

| Contenido | Evidencia | Fuente |
|---|---|---|
| Partes del menú *antipasto, primo, secondo, contorno, dolce* y su significado (primo = pasta, risotto o sopa; secondo = carne, aves o pescado; contorno = guarnición pedida aparte) | **V2, dos fuentes** | [italki, artículo 756](https://www.italki.com/en/article/756), [Migaku, restaurant phrases](https://migaku.com/blog/language-fun/italian-restaurant-phrases-order-food) |
| *Il coperto* como cargo adicional en la cuenta · *Il coperto è di due euro* | **V2** | [italki](https://www.italki.com/en/article/756), [FastItalian, restaurant vocabulary](https://fastitalianlearning.com/blog/italian-restaurant-vocabulary) |
| *Avete un tavolo per due?* · *Siamo in quattro — avete posto?* · *Volete sedervi vicino alla finestra?* | **V2** | [FastItalian, un tavolo per due](https://fastitalianlearning.com/phrases/at-the-restaurant/un-tavolo-per-due) |
| *Ho prenotato per due persone* · *Posso vedere il menù?* · *Vorrei ordinare* · *Cosa consiglia?* · *Qual è il piatto del giorno?* · *È incluso nel prezzo?* · *Il servizio è incluso?* | **V2** | [FastItalian, restaurant vocabulary](https://fastitalianlearning.com/blog/italian-restaurant-vocabulary) |
| *Vorrei ordinare una pizza margherita e un'acqua naturale* · *Posso avere il menu, per favore?* · *Che cosa consiglia come piatto principale?* · *C'è un dolce tipico della casa?* · *Posso avere il conto, per favore?* | **V2** | [Colanguage A1.39](https://italian.colanguage.com/syllabus/a1/39) |
| *Il conto, per favore* · *Possiamo avere il conto?* · *Paghiamo separatamente* · *Posso pagare con carta?*; el conto llega solo si lo pides | **V2** | [FastItalian](https://fastitalianlearning.com/blog/italian-restaurant-vocabulary), [Migaku](https://migaku.com/blog/language-fun/italian-restaurant-phrases-order-food) |
| *Sono vegetariano. Avete piatti senza carne?* · *Sono allergico alle noci* · *Ho un'allergia alle uova* · *Sono intollerante al lattosio* · *Non mangio carne di maiale* · *Senza glutine, per favore* · *Avete la pizza senza glutine?* | **V2** | [FastItalian, dietary restrictions](https://fastitalianlearning.com/phrases/dietary-restrictions), [FastItalian, restaurant vocabulary](https://fastitalianlearning.com/blog/italian-restaurant-vocabulary) |
| Pares *nono/nonno*, *pane/panna*, *sete/sette* y la regla de que las dobles cambian la palabra | **V2 (nono/nonno), V1 (el resto)** | [FastItalian, nonna ninna nanna](https://fastitalianlearning.com/tongue-twisters/double-consonants/nonna-ninna-nanna) (*nono* ≠ *nonno*); las otras cuatro son palabras reales de la lista y el corpus |
| *Le consiglio il risotto: è senza noci*, *Molto bene. Altro?*, *Subito!*, *Dopo, il conto…* | **V1** | Construcciones con palabras frecuentes; *Cosa consiglia?* ya es V2. Segunda pasada pendiente (G-R) |
| *Il menù* frente a *la carta* (tarjeta): contraste de uso | **V1 / V2 parcial** | *Posso pagare con carta?* es V2; el contraste *carta* de menú no aparece en las fuentes (el menú se dice *menù*) |

**Evitado a propósito (sin fuente):** *Cosa prende?* y *Cosa desidera?* (siguen en `dudas-italiano.md`; la fuente de Colanguage tampoco los trae), *Un tavolo per due, per favore* como frase única (se usa *Avete un tavolo per due?*), cifras de propina o de coperto por persona (la fuente dice 1–3 euros por persona, pero varía), y femeninos de profesiones.
**Sin audio todavía:** ninguna palabra nueva de pronunciación necesita entrar en `AUDIO_PENDING`, salvo *nona*, que ya estaba. *Cameriere, dolce, conto, pasta, carne, pesce, nonna, nono, pane, panna, sete, sette* ya tienen audio.
