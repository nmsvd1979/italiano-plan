# Auditoría final de italiano-plan (4-nov-2026, `main` en f3d1fc6 · tras el PR #57)

Solo informe: no se cambió ningún archivo de `src/`, `public/`, `scripts/`, `data/` ni de las auditorías anteriores. Se agregaron los siete informes de esta carpeta y los scripts de medición de [`medicion/`](medicion/) (no forman parte del build: `tsconfig.json` solo incluye `src`).

| Área | Informe | A | M | L |
|---|---|---|---|---|
| 1. Código | [codigo.md](codigo.md) | 3 | 2 | 5 |
| 2. Offline y PWA | [offline-pwa.md](offline-pwa.md) | 0 | 1 | 5 |
| 3. Contenido y coherencia | [contenido.md](contenido.md) | 2 | 3 | 4 |
| 4. Flujo de estudio | [flujo.md](flujo.md) | 3 | 4 | 0 |
| 5. Audio | [audio.md](audio.md) | 1 | 3 | 4 |
| 6. Documentación | [documentacion.md](documentacion.md) | 1 | 4 | 3 |
| 7. Capacidad y suficiencia | [capacidad.md](capacidad.md) | 2 | 4 | 2 |

Ninguno bloquea el uso por completo (**0 B**). 12 de severidad alta (A) y 21 media (M); 4 de los A aparecen en dos áreas (F-cod-01 = F-flujo-02, F-cod-10 = F-aud-01, F-cont-02 = F-cap-01, F-flujo-03 = F-cap-03), así que son **8 problemas altos distintos**.

## Lo más importante (A), en el orden en que yo lo corregiría
1. **El repaso mixto del día 7 no ve nada de lo estudiado con el ciclo nuevo** (F-cod-01). `learnedUnits` sigue leyendo la clave heredada `uXX.s2.lesson`; confirmado en el navegador: con marcas `uXX.d2.lesson` dice «Todavía no hay nada para repasar», y con la clave heredada ofrece 10 ejercicios. Además esa pantalla vacía no marca el bloque (que es *core*), de modo que la semana solo cierra marcándolo a mano. Afecta también al repaso dirigido.
2. **Rol, shadowing propio y «Modelo → Tú» siempre suenan con la voz del sistema** aunque existan los clips (F-aud-01/F-cod-10; 300 de 302 líneas de rol y 370 de 725 del shadowing tendrían clip), y las pantallas de pronunciación no usan los 53 clips de las palabras pendientes (F-aud-02).
3. **El modo corto deja el repaso espaciado sin tarjetas para siempre** (F-flujo-01): el bloque de palabras no es *core*, no se muestra, y la cola solo introduce palabras de unidades cuyo bloque de palabras ya se vio.
4. **Contenido escrito, probado y fusionado que la app no muestra** (F-cap-01/F-cont-02): 829 palabras con frase (G3) + 574 del mazo general + la secuencia de 35 contrastes de pronunciación (G6). El plan y el backlog los dan por entregados (F-doc-03).
5. **La semana B de las 7 unidades partidas repite la escritura, la pronunciación y el diálogo de entrada** (F-cont-01).
6. **Con u01–u24 marcadas el contenido nuevo dura 6–26 días** y después solo queda el repaso espaciado (F-flujo-03/F-cap-03). A ritmo alto sin eso: 53 días a 120 min/día, 108 a 60, 222 a 30.
7. **Datos guardados válidos pero de tipo equivocado dejan la pantalla en blanco** (F-cod-02; 34 de 684 combinaciones probadas). Baja probabilidad, impacto total.

## Lo comprobado por tests, código o el navegador de pruebas
| Qué | Cómo | Resultado |
|---|---|---|
| Suite de pruebas | `npm test` ×6 | 1.419 tests, 45 archivos. 3 corridas verdes; **3 fallaron por timeout de un solo test** (`recording.test.ts:149`, pasa aislado en 1,6 s) → F-cod-03. |
| Compilación y tipos | `npm run build` | verde; `tsc --noUnusedLocals --noUnusedParameters` limpio. |
| Precache | `postbuild` / e2e | 23 archivos, 1,44 MB (< 2 MB), sin mp3. |
| Sin conexión, rutas con hash, audio con `Range`, descarga reanudable, pantalla de rescate | `npm run test:e2e` (Chromium) | **4/4 pasan** (esto no es Safari). |
| Coherencia de audio | cruce de archivos | `audio-index.json` (1.585) = 588 nativos + 997 clips = `tts/index.json` = `ttsClips.json`; sin faltantes ni huérfanos. |
| Reglas de contenido de CLAUDE.md en 28 unidades | `medicion/cont.ts` | 0 incumplimientos (ejemplos, *notice*, ejercicios, `___`, pista, respuestas calificables, vocabulario, dictado, escritura, diálogo). |
| Voseo / regionalismos / referencias a unidades | barrido ancho | 0 reales; 1 referencia a un botón inexistente («Guardar copia», F-cont-04). |
| Estado corrupto | Playwright, 684 cargas | JSON roto: 0 fallos; tipo equivocado: 34 fallos (F-cod-02). |
| Ciclo de 7 días con 35 semanas | `medicion/sim.ts`, `sim2.ts` | Cada semana se cierra una vez y en el orden de `COURSE`; sin marcas repetidas. |
| Tiempo y capacidad | motor real | 188 min/semana; 6.580 min (≈ 110 h); 222 días a 30 min; tablas de `capacidad.md`. |
| Origen del sonido por texto | `medicion/aud.ts` | tabla de `audio.md`. |
| Dependencias | `npm audit`, `npm outdated` | 0 vulnerabilidades en producción; 8 en herramientas de build. |

## Lo que solo se puede ver en el iPhone (o con el oído, o con los videos)
No se marcó como verificado nada de esto:
- Que la PWA se instale, arranque sin conexión y se actualice en Safari; el límite de caché de iOS con ~26 MB; `Range` en Safari con los clips; `navigator.storage.persist`.
- Que los 997 clips de Serena y las 588 grabaciones **suenen bien** (nadie los oyó en esta auditoría), incluidos los 53 clips de palabras sueltas.
- Que el autoplay de «escucha» (sin pista y mini-prueba) funcione o falle con elegancia bajo las reglas de iOS (F-cod-04); que haya una voz italiana del sistema instalada.
- Los **videos de shadowing** de las 28 unidades (verificados con `yt-dlp` por su existencia, subtítulos y tamaño; no se vieron ni escucharon: `docs/videos-candidatos.md`).
- Micrófono y grabación (rol, comparar, shadowing); la pantalla en blanco de F-cod-02 en una PWA instalada; la usabilidad real de un día de 30 minutos.
- La **corrección del italiano** (no hay nativo): sigue como en `_verificacion.md` y `dudas-italiano.md`.

## No se hizo
- No se re-corrió `npm run audit` (reescribe los `uXX.md` previos).
- No se abrió la descripción oficial del CELI 1 (A2) de Perugia (error de certificado) ni el *Profilo della lingua italiana*; la cobertura A2 usa el sillabo CILS de Siena, que sí se descargó y leyó (`capacidad.md` §d).
- Los tiempos son nominales; no hay datos de uso real. Los supuestos de la simulación (85 % de aprobar la mini-prueba, 90 % de «Bien» en el repaso espaciado, una sesión de tarjetas al día) están en `flujo.md`.

## Orden sugerido de PR (un tema por PR)
1. `fix`: `learnedUnits` y estado vacío del repaso (F-cod-01) con una prueba del ciclo nuevo.
2. `fix`: `playModel` y pronunciación usan clips (F-aud-01, F-aud-02, F-aud-08).
3. `fix`: modo corto no deja el SRS vacío (F-flujo-01).
4. `feat`: conectar G3 y G6 (F-cap-01, F-cont-01 en pronunciación, F-cont-03, F-cap-08).
5. `fix`: validar forma del estado guardado y `ErrorBoundary` (F-cod-02); timeout del test (F-cod-03).
6. `docs`: plan maestro, `CLAUDE.md`, README y nombre de la app (F-doc-*, F-pwa-01, F-cont-04).
7. `contenido`: ejercicios de las 8 unidades flojas, consignas de escritura/monólogo, conectores (F-cap-05/06, `capacidad.md` §e).
