"""Sintetiza varios textos con Piper cargando el modelo una sola vez (scripts/tts/generar.mjs lo llama).

Uso: python3 piper_lote.py <modelo.onnx> <trabajos.json>
`trabajos.json`: [{"texto": "...", "wav": "/ruta/salida.wav"}, ...]
"""
import json
import sys
import wave

from piper import PiperVoice

modelo, trabajos_json = sys.argv[1], sys.argv[2]
with open(trabajos_json, encoding="utf-8") as f:
    trabajos = json.load(f)

voz = PiperVoice.load(modelo)
for i, t in enumerate(trabajos, 1):
    with wave.open(t["wav"], "wb") as w:
        voz.synthesize_wav(t["texto"], w)
    if i % 50 == 0 or i == len(trabajos):
        print(f"  piper {i}/{len(trabajos)}", flush=True)
