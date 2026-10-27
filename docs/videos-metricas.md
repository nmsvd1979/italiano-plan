# Métricas de los videos de shadowing

Transcripción automática de los 48 videos de `src/content/shadowing.ts` (principal y alterno de u01–u24) con faster-whisper `small` (int8, CPU, idioma forzado `it`, VAD activado). Transcripciones con tiempos en `docs/transcripciones/uXX-principal.md` y `uXX-alterno.md`. No se guardó ningún audio en el repo.

## Cómo se calcula cada columna

- **Min:** duración del audio.
- **Palabras:** palabras transcritas, limitando a 3 las rachas de la misma palabra repetida (posibles alucinaciones o coros reales). **Recortadas** = cuántas se quitaron.
- **Pal/min habla:** palabras ÷ minutos de habla real = (tiempo entre la primera y la última palabra) − (suma de las pausas largas). Una pausa larga es un silencio entre dos palabras consecutivas de más de 1.5 s. **Pal/min bruto** no descuenta pausas.
- **Pausas > 1.5 s:** cuántas hay, y entre paréntesis la suma de segundos y la más larga.
- **Idioma:** detección de Whisper sobre los primeros 30 s (probabilidad entre paréntesis). La transcripción se forzó a italiano de todos modos.
- **Inglés ≈:** porcentaje aproximado de palabras que son palabras funcionales inglesas muy comunes (the, and, you, have, to…). Es solo un indicador de que el video mezcla inglés; no mide el idioma real.
- **Unidad:** cuántas palabras del vocabulario de la unidad (`vocab.json`, sin artículos ni palabras de menos de 3 letras) aparecen, sobre el total de esa unidad.
- **Conf.:** probabilidad media que Whisper asigna a sus palabras (0–1); baja = transcripción poco fiable (música, ruido, voces superpuestas).

## Resumen

| Unidad | Rol | Video | Min | Palabras (recortadas) | Pal/min habla | Pal/min bruto | Pausas > 1,5 s | Idioma | Inglés ≈ | Unidad | Conf. |
|---|---|---|---|---|---|---|---|---|---|---|---|
| u01 | principal | [12 Italian Greetings](https://www.youtube.com/watch?v=zPTJsQT103M) | 5.9 | 372 (17) | 100 | 68 | 21 (108 s, máx. 14.5 s) | it (95%) | 0 % | 9/21 | 0.89 |
| u01 | alterno | [Introduce Yourself in Italian](https://www.youtube.com/watch?v=ieyLUxtwch4) | 6.6 | 530 (0) | 101 | 85 | 7 (58 s, máx. 25.4 s) | it (98%) | 0 % | 6/21 | 0.92 |
| u02 | principal | [C'è e Ci sono](https://www.youtube.com/watch?v=UX8g7HONFn4) | 6.5 | 362 (0) | 100 | 59 | 19 (148 s, máx. 65.5 s) | it (99%) | 0 % | 3/20 | 0.93 |
| u02 | alterno | [Piacere: How to Say I Like](https://www.youtube.com/watch?v=LD4UoO1wyoM) | 9.1 | 738 (0) | 99 | 84 | 22 (80 s, máx. 12.7 s) | it (99%) | 0 % | 2/20 | 0.9 |
| u03 | principal | [How to Count to 100 in Italian](https://www.youtube.com/watch?v=6lwJWFddzKA) | 7.0 | 352 (2) | 99 | 54 | 19 (180 s, máx. 20.6 s) | it (100%) | 0 % | 0/20 | 0.89 |
| u03 | alterno | [Che ore sono? Leggere l'orologio](https://www.youtube.com/watch?v=rtfAWBKzTtM) | 8.9 | 1091 (0) | 125 | 125 | 0 (0 s, máx. 0 s) | it (100%) | 0 % | 11/20 | 0.94 |
| u04 | principal | [Having Breakfast in Slow Italian](https://www.youtube.com/watch?v=xvvHMwfLSzo) | 9.6 | 561 (0) | 79 | 61 | 19 (124 s, máx. 21.6 s) | it (100%) | 0 % | 6/20 | 0.9 |
| u04 | alterno | [How to Order a Coffee in Italy](https://www.youtube.com/watch?v=FTC4fRWez_w) | 5.0 | 388 (0) | 128 | 92 | 5 (70 s, máx. 38.4 s) | it (98%) | 0 % | 4/20 | 0.91 |
| u05 | principal | [How to Commute in Milan](https://www.youtube.com/watch?v=XC_FusOaYco) | 7.8 | 717 (0) | 115 | 95 | 14 (81 s, máx. 17.0 s) | it (97%) | 0 % | 10/20 | 0.9 |
| u05 | alterno | [Scusi, sa dov'è…? Indicazioni stradali](https://www.youtube.com/watch?v=sHd_fOl8VRE) | 4.2 | 139 (0) | 119 | 60 | 10 (70 s, máx. 17.1 s) | it (96%) | 0 % | 6/20 | 0.88 |
| u06 | principal | [Italians' Favourite Colour](https://www.youtube.com/watch?v=D6VWpIQ4wXY) | 7.1 | 639 (0) | 113 | 96 | 13 (57 s, máx. 13.8 s) | it (98%) | 0 % | 11/20 | 0.9 |
| u06 | alterno | [Questo, Quello: This and That](https://www.youtube.com/watch?v=eZ_r24D5Bik) | 5.6 | 280 (0) | 72 | 52 | 19 (87 s, máx. 15.1 s) | it (97%) | 0 % | 0/20 | 0.93 |
| u07 | principal | [How to Talk About Daily Routine](https://www.youtube.com/watch?v=F4XWtchHCx8) | 8.4 | 774 (0) | 113 | 99 | 8 (57 s, máx. 28.3 s) | it (99%) | 0 % | 7/21 | 0.9 |
| u07 | alterno | [Daily Routine: Reflexive Verbs](https://www.youtube.com/watch?v=TMI25KZL-ZQ) | 3.3 | 292 (0) | 111 | 96 | 9 (25 s, máx. 3.6 s) | it (99%) | 0 % | 11/21 | 0.92 |
| u08 | principal | [How Much Do They Earn in Milan?](https://www.youtube.com/watch?v=eG2-WMF0MfU) | 9.7 | 1139 (0) | 137 | 122 | 14 (62 s, máx. 25.7 s) | it (97%) | 0 % | 18/23 | 0.88 |
| u08 | alterno | [Slow Italian: Morning Routine](https://www.youtube.com/watch?v=40ao6UQlx1o) | 8.4 | 615 (0) | 79 | 73 | 8 (35 s, máx. 9.5 s) | it (99%) | 0 % | 12/23 | 0.93 |
| u09 | principal | [Che cosa hai fatto ieri?](https://www.youtube.com/watch?v=KBFpaheWwR8) | 3.5 | 308 (0) | 87 | 87 | 0 (0 s, máx. 0 s) | it (100%) | 0 % | 4/19 | 0.91 |
| u09 | alterno | [Passato prossimo (ItalianoVero)](https://www.youtube.com/watch?v=9A5gTgcgQ-I) | 2.0 | 214 (0) | 131 | 114 | 5 (15 s, máx. 5.2 s) | it (99%) | 0 % | 1/19 | 0.88 |
| u10 | principal | [HO vs SONO nel passato prossimo](https://www.youtube.com/watch?v=cHy4TgFo7L0) | 8.6 | 995 (0) | 120 | 119 | 2 (4 s, máx. 2.4 s) | it (100%) | 0 % | 5/20 | 0.94 |
| u10 | alterno | [Essere o Avere (Passato Prossimo)](https://www.youtube.com/watch?v=iHJpHgl9KLc) | 3.5 | 420 (0) | 122 | 122 | 0 (0 s, máx. 0 s) | it (98%) | 0 % | 2/20 | 0.77 |
| u11 | principal | [Passato Prossimo o Imperfetto?](https://www.youtube.com/watch?v=y5Js_0-qqcQ) | 6.2 | 624 (0) | 123 | 104 | 13 (56 s, máx. 7.0 s) | it (99%) | 0 % | 6/20 | 0.91 |
| u11 | alterno | [L'imperfetto (ItalianoVero)](https://www.youtube.com/watch?v=8qw264NgUI0) | 4.0 | 481 (0) | 139 | 121 | 8 (30 s, máx. 8.6 s) | it (99%) | 0 % | 7/20 | 0.91 |
| u12 | principal | [More and Less: Comparing Things](https://www.youtube.com/watch?v=pMuI9y2eAiw) | 6.7 | 460 (0) | 93 | 72 | 17 (89 s, máx. 24.8 s) | it (100%) | 0 % | 0/21 | 0.89 |
| u12 | alterno | [More or Less? Comparisons in Italian](https://www.youtube.com/watch?v=czxSZUuqZt8) | 7.7 | 654 (0) | 90 | 89 | 3 (5 s, máx. 1.9 s) | it (99%) | 0 % | 0/21 | 0.92 |
| u13 | principal | [Pronomi diretti + passato prossimo](https://www.youtube.com/watch?v=WZKbIksQnOU) | 8.0 | 807 (0) | 111 | 103 | 11 (32 s, máx. 5.9 s) | it (100%) | 0 % | 2/20 | 0.93 |
| u13 | alterno | [Al mercato!](https://www.youtube.com/watch?v=W9ecfj5N0Vo) | 9.0 | 873 (0) | 107 | 100 | 10 (35 s, máx. 5.2 s) | it (96%) | 0 % | 2/20 | 0.91 |
| u14 | principal | [La particella CI](https://www.youtube.com/watch?v=NQzaJDidH4Y) | 5.1 | 314 (0) | 89 | 64 | 19 (84 s, máx. 7.0 s) | it (100%) | 0 % | 0/20 | 0.9 |
| u14 | alterno | [Come e quando usare NE](https://www.youtube.com/watch?v=njo-GXoBx2U) | 9.3 | 943 (0) | 119 | 105 | 21 (64 s, máx. 8.2 s) | it (100%) | 0 % | 2/20 | 0.93 |
| u15 | principal | [Il futuro semplice](https://www.youtube.com/watch?v=_XysazYZdDk) | 7.1 | 597 (0) | 90 | 87 | 7 (14 s, máx. 2.5 s) | it (100%) | 0 % | 8/21 | 0.91 |
| u15 | alterno | [Il condizionale in italiano](https://www.youtube.com/watch?v=U33uGhs2llA) | 9.0 | 1018 (0) | 134 | 116 | 25 (72 s, máx. 5.9 s) | it (100%) | 3 % | 5/21 | 0.92 |
| u16 | principal | [Pharmacy and Doctor Visits](https://www.youtube.com/watch?v=7nA0VIsTbQI) | 4.7 | 350 (0) | 111 | 76 | 27 (86 s, máx. 8.0 s) | en (84%) | 12 % | 8/25 | 0.87 |
| u16 | alterno | [Doctor and Patient Dialogue](https://www.youtube.com/watch?v=ReQZ-yHoccQ) | 3.2 | 343 (0) | 133 | 116 | 4 (22 s, máx. 9.8 s) | it (100%) | 0 % | 8/25 | 0.95 |
| u17 | principal | [How to Rent an Apartment in Italy](https://www.youtube.com/watch?v=hjeGhJtvoOw) | 7.0 | 492 (0) | 118 | 71 | 76 (164 s, máx. 3.7 s) | it (100%) | 0 % | 11/25 | 0.91 |
| u17 | alterno | [Renting a House in Italian](https://www.youtube.com/watch?v=OkDyPPoqxSM) | 4.8 | 361 (0) | 109 | 76 | 21 (88 s, máx. 7.4 s) | it (99%) | 0 % | 7/25 | 0.94 |
| u18 | principal | [Telefonare in Italia](https://www.youtube.com/watch?v=laLjbGQouig) | 3.6 | 355 (0) | 126 | 105 | 9 (33 s, máx. 8.1 s) | it (100%) | 0 % | 4/22 | 0.92 |
| u18 | alterno | [Speak Italian on the Phone](https://www.youtube.com/watch?v=Kt_4ryHKPqE) | 8.4 | 886 (0) | 109 | 106 | 2 (15 s, máx. 10.4 s) | it (100%) | 0 % | 10/22 | 0.93 |
| u19 | principal | [Il si impersonale](https://www.youtube.com/watch?v=1R4R8J71OWU) | 3.7 | 448 (0) | 127 | 122 | 3 (8 s, máx. 4.2 s) | it (98%) | 0 % | 5/18 | 0.92 |
| u19 | alterno | [Quiz: si impersonale](https://www.youtube.com/watch?v=2xiqfLKL4Gw) | 10.0 | 956 (0) | 100 | 96 | 1 (23 s, máx. 23.2 s) | it (100%) | 0 % | 5/18 | 0.92 |
| u20 | principal | [Il discorso indiretto](https://www.youtube.com/watch?v=XzaIcWBNiQQ) | 4.0 | 451 (0) | 140 | 123 | 1 (27 s, máx. 27.0 s) | it (100%) | 0 % | 6/20 | 0.95 |
| u20 | alterno | [A causa di, per colpa di, grazie a](https://www.youtube.com/watch?v=Fa2OFE0l1So) | 5.5 | 560 (0) | 103 | 103 | 0 (0 s, máx. 0 s) | it (100%) | 0 % | 5/20 | 0.93 |
| u21 | principal | [Come usare glielo, gliela…](https://www.youtube.com/watch?v=---YbOG3n0E) | 6.9 | 660 (0) | 110 | 100 | 11 (38 s, máx. 9.3 s) | it (100%) | 0 % | 3/21 | 0.86 |
| u21 | alterno | [Pronomi combinati](https://www.youtube.com/watch?v=TvlqchFsgug) | 7.0 | 709 (0) | 106 | 102 | 6 (14 s, máx. 3.3 s) | it (100%) | 0 % | 3/21 | 0.93 |
| u22 | principal | [Penso che… (congiuntivo)](https://www.youtube.com/watch?v=Zn31M2EMGbU) | 8.2 | 799 (0) | 101 | 99 | 2 (10 s, máx. 8.6 s) | it (99%) | 0 % | 6/21 | 0.9 |
| u22 | alterno | [Quando usare il congiuntivo presente](https://www.youtube.com/watch?v=dpfYvT2qf3c) | 8.8 | 800 (0) | 96 | 91 | 12 (27 s, máx. 4.2 s) | it (100%) | 0 % | 5/21 | 0.91 |
| u23 | principal | [Use the Italian 'Se'](https://www.youtube.com/watch?v=5LA0NEMt6OM) | 6.6 | 568 (0) | 121 | 88 | 17 (105 s, máx. 26.2 s) | it (97%) | 0 % | 4/20 | 0.88 |
| u23 | alterno | [Il periodo ipotetico](https://www.youtube.com/watch?v=WGK1O7611e4) | 7.2 | 942 (0) | 135 | 132 | 5 (10 s, máx. 2.7 s) | it (100%) | 0 % | 6/20 | 0.87 |
| u24 | principal | [A Trip to Lake Como (short story)](https://www.youtube.com/watch?v=joM3YcvIVGA) | 7.0 | 716 (0) | 103 | 102 | 4 (6 s, máx. 1.7 s) | it (100%) | 0 % | 5/21 | 0.95 |
| u24 | alterno | [Short Stories: Travel & Directions](https://www.youtube.com/watch?v=DGebFoumhAI) | 9.2 | 1285 (0) | 151 | 142 | 9 (31 s, máx. 4.0 s) | it (99%) | 0 % | 13/21 | 0.95 |

## Lo que destaca

- **Idioma no italiano o dudoso (< 80 %):** u16 principal (en 84%)
- **Mezcla notable de inglés (≥ 5 % de palabras inglesas comunes):** u16 principal (12 %). En estos, las palabras/min y el vocabulario cuentan también el inglés.
- **Habla rápida (> 130 pal/min de habla):** u08 principal (137), u09 alterno (131), u11 alterno (139), u15 alterno (134), u16 alterno (133), u20 principal (140), u23 alterno (135), u24 alterno (151)
- **Habla muy lenta (< 70 pal/min de habla):** ninguno.
- **Transcripción poco fiable (confianza media < 0,75):** ninguno.
- **Muchas repeticiones recortadas (≥ 10):** u01 principal (17)
- **Casi sin vocabulario de la unidad (< 10 %):** u03 principal (0/20), u06 alterno (0/20), u09 alterno (1/19), u12 principal (0/21), u12 alterno (0/21), u14 principal (0/20)
- **Muchas pausas largas (≥ 15):** u01 principal (21), u02 principal (19), u02 alterno (22), u03 principal (19), u04 principal (19), u06 alterno (19), u12 principal (17), u14 principal (19), u14 alterno (21), u15 alterno (25), u16 principal (27), u17 principal (76), u17 alterno (21), u23 principal (17)

Mediana de palabras/min de habla: 111 (mín. 72, máx. 151). Videos medidos: 48 de 48.

## Qué no está verificado

- La transcripción es automática y **no se revisó a mano**; un `small` puede errar palabras, sobre todo con música, ruido, voces que se pisan o nombres propios. Las métricas son de estimación, no de precisión.
- Las rachas repetidas ("ciao, ciao, ciao…") pueden ser un montaje real o una alucinación de Whisper; no se comprobó escuchando. Por eso se limitaron a 3.
- Las pausas se miden con los tiempos de palabra de Whisper, que pueden desplazarse décimas de segundo; el VAD también puede recortar silencios. Úsalas como orden de magnitud.
- Los videos con subtítulos o texto incrustado en imagen no se evalúan aquí: solo se analizó el audio.
- No se escuchó ningún video completo ni se comprobó la claridad del habla a oído.
