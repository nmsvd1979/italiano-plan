# Traspaso a Claude Code

Quién hace qué y cuándo volver a Claude.ai (el chat). Orden recomendado.

## Dónde se trabaja cada cosa
| Tarea | Dónde | Por qué |
|---|---|---|
| Descargar audios, verificar videos, correr scripts, instalar herramientas | **Claude Code** (en el Mac, carpeta del repo) | Tiene internet completo; el chat tiene lista de dominios bloqueada |
| Corregir bugs, tests, build, nuevas funciones de la app | **Claude Code** | Edita, prueba y hace commit en el mismo lugar |
| Escribir o revisar contenido en italiano, decidir diseño pedagógico, planes y documentos | **Claude.ai (chat)** | Es trabajo de criterio y redacción, no necesita red |
| Probar en iPhone | **Nicolás** | Solo él puede |

## Cuándo volver al chat
1. Cuando Code deje `docs/dudas-italiano.md` y `docs/videos-candidatos.md` (para revisar criterio).
2. Después de probar en el iPhone (para priorizar lo que falle).
3. Antes de empezar contenido nuevo (unidades 25+, vocabulario Quizlet) o de decidir una función grande.

## Antes de empezar
1. Fusionar el PR #1 (contenido u1–u24) en GitHub, o trabajar sobre su rama.
2. En el Mac: `cd ~/Desktop/Claude/Italiano && git checkout main && git pull`.
3. Abrir Claude Code en esa carpeta (`claude`). Leerá `CLAUDE.md`.

## Prompt para pegar en Claude Code
```
Lee CLAUDE.md y docs/traspaso-code.md. Trabaja en ramas separadas y un pull request por tarea; no hagas push a main. Haz las tareas en este orden y detente al terminar cada una para que revise el PR.

TAREA 1 — Audios nativos
- Corre npm ci, npm test y npm run build para confirmar el punto de partida.
- Corre npm run audio (Lingua Libre; es idempotente y tarda unos minutos).
- Con ffprobe revisa cada archivo nuevo: duración entre 0,3 y 4 s, no silencioso, formato reproducible en iPhone (mp3/ogg/m4a; convierte a mp3 o m4a si hace falta).
- Actualiza AUDIO_PENDING en src/content/pronunciation/index.ts dejando solo las palabras que siguen sin grabación, y verifica public/audio/ATTRIBUZIONI.md.
- Pares b/v (bene/vene, bacca/vacca, bere/vere…): confirma que ambos lados tengan audio; si no, déjalos en AUDIO_PENDING y anótalo.
- Rama feat/audios. Reporta cuántas palabras tienen audio nativo y cuáles quedaron pendientes.

TAREA 2 — Videos de shadowing
- Para cada unidad u1–u24 busca candidatos (usa SHADOWING_SEARCH en src/content/shadowing.ts como punto de partida). Instala yt-dlp si falta.
- Criterios: 2 a 10 min, italiano claro y lento, subtítulos en italiano, que se pueda incrustar (oEmbed responde 200), tema acorde a la unidad (vocabulario y gramática de esa unidad).
- Mide con los subtítulos: palabras por minuto y cuántas palabras de la unidad aparecen. Genera docs/videos-candidatos.md con 3 candidatos por unidad y la métrica de cada uno.
- Elige un video principal y uno alternativo por unidad, actualiza src/content/shadowing.ts y agrega o ajusta tests si corresponde. No inventes IDs: cada ID debe haberse verificado.
- Rama feat/videos-shadowing.

TAREA 3 — Revisión ortográfica del italiano
- Revisa todas las cadenas en italiano de src/content (hunspell it_IT o LanguageTool local). 
- Corrige solo errores evidentes (tildes, apóstrofos, concordancia obvia). Todo lo dudoso va a docs/dudas-italiano.md con: archivo, frase, duda y propuesta. No lo cambies.
- Rama fix/italiano-ortografia.

Al terminar cada tarea resume en 5 líneas: qué hiciste, qué probaste de verdad y qué NO pudiste verificar.
```

## Después (se decide en el chat)
- Copia de seguridad del progreso (exportar/importar).
- Grabar la propia voz y autoevaluarse (MediaRecorder; el reconocimiento de voz no funciona en la PWA instalada del iPhone).
- Vocabulario Quizlet: ver `docs/quizlet-cruce.md` y `data/quizlet-1400.json`.
- Test de nivel inicial.
