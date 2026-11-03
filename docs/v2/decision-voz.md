# Decisión de voz (docs/v2/03, C1/C2)

**Estado: pendiente.** Candidatos elegidos y audio de prueba generado; falta confirmar las licencias.

## Candidatos Piper (rhasspy/piper-voices, `it/it_IT`)

| Voz | Calidad | Licencia (conjunto de datos / modelo) | Fuente / URL | ¿Se usa? |
|---|---|---|---|---|
| `it_IT-serena-high` (candidato 1, archivos `-x`) | high (22,05 kHz) | **Sin confirmar** (falta leer el MODEL_CARD) | https://huggingface.co/rhasspy/piper-voices/tree/main/it/it_IT/serena/high | pendiente de licencia |
| `it_IT-paola-medium` (candidato 2, archivos `-y`) | medium (22,05 kHz) | **Sin confirmar** (falta leer el MODEL_CARD) | https://huggingface.co/rhasspy/piper-voices/tree/main/it/it_IT/paola/medium | pendiente de licencia |

Las URL siguen la estructura del repositorio y no se abrieron desde esta sesión. Los `.onnx` los bajó el usuario a su Mac; los mp3 de la prueba se generaron con ellos (20 archivos, ~264 KB).

**Por qué falta la licencia:** al preparar la prueba, la sesión de Claude Code no pudo llegar a `huggingface.co` (el DNS no resuelve desde su entorno; `github.com` y `pypi.org` sí responden). Sin acceso no se abrió ningún `MODEL_CARD`, así que no se anota ninguna licencia: no se deduce de memoria. Regla de C2: una voz con licencia sin confirmar queda fuera.

**Para completarla:** abrir el `MODEL_CARD` de las dos voces, anotar licencia del conjunto de datos y del modelo y si permite usar y redistribuir el audio generado; si alguna no permite uso y redistribución del audio, queda fuera y se descartan sus mp3; completar la tabla y `public/audio/ATTRIBUZIONI.md`.

## Prueba A/B

- Pantalla: `#/prueba-voz` (solo por URL; no está en ningún menú). 10 frases de `scripts/tts/frases-prueba.json`, cada una tomada tal cual de `dictation.ts` o `dialogues.ts`.
- Audios: `node scripts/tts/compare.mjs <candidato-1.onnx> <candidato-2.onnx>` → `public/audio-prueba/pNN-x.mp3` (candidato 1) y `pNN-y.mp3` (candidato 2). Fuera del precache del service worker.
- El resultado queda en `localStorage` (`italianPlan.v2.pruebaVoz`) al tocar «Ver resultado».

## Resultado de la prueba

_Sin registrar._ (voz ganadora, recuento y fecha)
