# Decisión de voz (docs/v2/03, C1/C2)

**Estado: decidida.** Voz elegida: `it_IT-serena-high` (Piper), con atribución CC BY 4.0. La voz `paola` queda descartada de forma definitiva.

## Candidatos Piper (rhasspy/piper-voices, `it/it_IT`)

| Voz | Calidad | Licencia (conjunto de datos / modelo) | Fuente / URL | ¿Se usa? |
|---|---|---|---|---|
| `it_IT-serena-high` (candidato 1, archivos `-x`) | high (22,05 kHz) | Conjunto de datos: **CC-BY-4.0** (committa/serena-synthetic-it-27h). Modelo: entrenado desde cero; la ficha no declara una licencia propia | https://huggingface.co/rhasspy/piper-voices/blob/main/it/it_IT/serena/high/MODEL_CARD · dataset https://huggingface.co/datasets/committa/serena-synthetic-it-27h | **Sí** (con atribución CC BY 4.0) |
| `it_IT-paola-medium` (candidato 2, archivos `-y`) | medium (22,05 kHz) | Conjunto de datos: **CC0-1.0** (paolapersico1/Voice-Dataset-Italian). Modelo: ajustado desde la voz inglesa lessac (medium), **cuyo conjunto de datos (Blizzard 2013 / Lessac Technologies) se licencia solo «para fines de investigación»: excluye uso comercial, no es transferible y no permite que terceros usen el material** (https://www.cstr.ed.ac.uk/projects/blizzard/2013/lessac_blizzard2013/license.html) | https://huggingface.co/rhasspy/piper-voices/blob/main/it/it_IT/paola/medium/MODEL_CARD | **No. Descartada definitivamente** (licencia de la voz base solo para investigación). Sus mp3 y sus entradas en `ATTRIBUZIONI.md` se borraron |

Las licencias salen de los MODEL_CARD, copiados por el usuario (esta sesión no llega a Hugging Face). Los `.onnx` los bajó el usuario a su Mac.

## Prueba A/B

- Se hizo a ciegas el 3-nov-2026 con 10 frases de `dictation.ts` / `dialogues.ts` y tres opciones: candidato 1 (Serena, `-x`), candidato 2 (paola, `-y`) y la voz del sistema del iPhone.
- La pantalla `#/prueba-voz`, sus pruebas, los mp3 de prueba (`public/audio-prueba/`) y `scripts/tts/compare.mjs` ya cumplieron su propósito y se quitaron del repositorio (siguen en el historial de git).

## Resultado de la prueba

**Fecha: 3-nov-2026. Ganadora: `it_IT-serena-high`.**

| Opción | Votos (de 10 frases) |
|---|---|
| Serena (`it_IT-serena-high`) | **9** |
| La otra voz candidata (paola) | 1 |
| Voz del sistema | 0 |

Consecuencia: el audio de frases se genera en lote con Serena (C3, `scripts/tts/`) y se reproduce con el orden clip → grabación nativa → voz del sistema (C4). Exige atribución CC BY 4.0 en `public/audio/ATTRIBUZIONI.md`.
