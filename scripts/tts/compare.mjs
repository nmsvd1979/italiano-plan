// Prueba A/B de voz (docs/v2/03 C1). Genera cada frase de scripts/tts/frases-prueba.json con dos voces Piper
// y deja mp3 con nombres neutros en public/audio-prueba/: pNN-x.mp3 (candidato 1) y pNN-y.mp3 (candidato 2).
//
// Uso: node scripts/tts/compare.mjs <modelo-candidato-1.onnx> <modelo-candidato-2.onnx>
// Requiere `piper` (pip install piper-tts) y `ffmpeg` en el PATH (o su ruta en la variable FFMPEG). Cada .onnx debe tener su .onnx.json al lado.
// No imprime ni guarda qué voz es cuál en los nombres de archivo: eso queda en docs/v2/decision-voz.md.

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = path.join(ROOT, "public", "audio-prueba");
const [m1, m2] = process.argv.slice(2);
if (!m1 || !m2) {
  console.error("Uso: node scripts/tts/compare.mjs <candidato-1.onnx> <candidato-2.onnx>");
  process.exit(1);
}

const frases = JSON.parse(readFileSync(path.join(ROOT, "scripts/tts/frases-prueba.json"), "utf8"));
mkdirSync(OUT, { recursive: true });
const tmp = path.join(tmpdir(), `tts-compare-${process.pid}`);
mkdirSync(tmp, { recursive: true });

for (const [modelo, sufijo] of [[m1, "x"], [m2, "y"]]) {
  for (const f of frases) {
    const wav = path.join(tmp, `${f.id}-${sufijo}.wav`);
    execFileSync("piper", ["--model", modelo, "--output_file", wav], { input: f.it });
    // mono, 24 kHz, ~40 kbps
    execFileSync(process.env.FFMPEG ?? "ffmpeg", ["-y", "-loglevel", "error", "-i", wav, "-ac", "1", "-ar", "24000", "-b:a", "40k", path.join(OUT, `${f.id}-${sufijo}.mp3`)]);
  }
}
rmSync(tmp, { recursive: true, force: true });
console.log(`${frases.length * 2} archivos en ${path.relative(ROOT, OUT)}`);
