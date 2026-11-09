// Genera los clips de voz sintética de scripts/tts/frases.json (docs/v2/03, C3): public/audio/tts/<id>.mp3 + index.json.
// Piper (wav) → ffmpeg → mp3 mono 24 kHz ~40 kbps. Idempotente: un clip se regenera solo si su texto o su voz cambiaron
// o si falta el archivo; los clips huérfanos (sin frase en el manifiesto) se borran.
//
// Uso: node scripts/tts/generar.mjs --modelo <it_IT-serena-high.onnx>   (o PIPER_MODEL=…; el .onnx.json va al lado)
// Requiere `pip install piper-tts` (python3) y ffmpeg (en el PATH o en la variable FFMPEG) o, si no hay ffmpeg, lame.
// Si el peso total pasa de 35 MB termina con error y no sigue: hay que decidirlo antes.

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LICENCIA, VOZ, idDe, sha1 } from "./comun.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = path.join(ROOT, "public", "audio", "tts");
const INDEX = path.join(OUT, "index.json");
const IDS = path.join(ROOT, "src", "content", "ttsClips.json");
const MAX_BYTES = 35e6;

/** wav → mp3 mono 24 kHz ~40 kbps: con ffmpeg y, si no está instalado, con lame (mismas características). */
function aMp3(wav, mp3) {
  const ffmpeg = process.env.FFMPEG ?? "ffmpeg";
  const r = spawnSync(ffmpeg, ["-y", "-loglevel", "error", "-i", wav, "-ac", "1", "-ar", "24000", "-b:a", "40k", mp3], { stdio: "inherit" });
  if (!r.error && r.status === 0) return;
  if (!r.error) throw new Error(`ffmpeg falló con el código ${r.status}`);
  execFileSync("lame", ["--quiet", "-m", "m", "--resample", "24", "-b", "40", wav, mp3]);
}

const arg = (n) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : undefined; };
const modelo = arg("--modelo") ?? process.env.PIPER_MODEL;

const { frases } = JSON.parse(readFileSync(path.join(ROOT, "scripts/tts/frases.json"), "utf8"));
const previo = existsSync(INDEX) ? new Map(JSON.parse(readFileSync(INDEX, "utf8")).map((e) => [e.id, e])) : new Map();
mkdirSync(OUT, { recursive: true });

const entradas = frases.map((f) => ({ id: idDe(f.texto), text: f.texto, sha1: sha1(f.texto), voice: VOZ, license: LICENCIA }));
const ids = new Set(entradas.map((e) => e.id));
if (ids.size !== entradas.length) throw new Error("Dos frases distintas dan el mismo id de 12 caracteres");

const pendientes = entradas.filter((e) => {
  const p = previo.get(e.id);
  return !p || p.sha1 !== e.sha1 || p.voice !== e.voice || !existsSync(path.join(OUT, `${e.id}.mp3`));
});

if (pendientes.length > 0) {
  if (!modelo || !existsSync(modelo)) throw new Error("Faltan clips por generar: indica el modelo con --modelo <it_IT-serena-high.onnx> (o PIPER_MODEL)");
  const tmp = mkdtempSync(path.join(tmpdir(), "tts-"));
  try {
    const trabajos = pendientes.map((e) => ({ texto: e.text, wav: path.join(tmp, `${e.id}.wav`) }));
    const lista = path.join(tmp, "trabajos.json");
    writeFileSync(lista, JSON.stringify(trabajos));
    console.log(`Generando ${pendientes.length} de ${entradas.length} clips con ${VOZ}…`);
    execFileSync("python3", [path.join(ROOT, "scripts/tts/piper_lote.py"), modelo, lista], { stdio: "inherit" });
    for (const t of trabajos) {
      const mp3 = path.join(OUT, path.basename(t.wav, ".wav") + ".mp3");
      aMp3(t.wav, mp3);
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

let huerfanos = 0;
for (const f of readdirSync(OUT)) {
  if (f.endsWith(".mp3") && !ids.has(f.slice(0, -4))) { unlinkSync(path.join(OUT, f)); huerfanos++; }
}

entradas.sort((a, b) => a.id.localeCompare(b.id));
writeFileSync(INDEX, JSON.stringify(entradas, null, 1) + "\n");
// Lista corta de ids para el navegador (src/ui/speech.ts decide con ella, sin esperar a ningún fetch).
writeFileSync(IDS, JSON.stringify(entradas.map((e) => e.id)) + "\n");

const bytes = entradas.reduce((s, e) => s + statSync(path.join(OUT, `${e.id}.mp3`)).size, 0);
console.log(`${entradas.length} clips (${pendientes.length} nuevos, ${huerfanos} huérfanos borrados), ${(bytes / 1e6).toFixed(2)} MB`);
if (bytes > MAX_BYTES) {
  console.error(`El peso total (${(bytes / 1e6).toFixed(1)} MB) supera 35 MB: se detiene aquí para decidirlo antes de seguir.`);
  process.exit(2);
}
