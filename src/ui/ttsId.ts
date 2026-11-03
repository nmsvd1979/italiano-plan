// Id del clip de voz sintética de una frase (public/audio/tts/<id>.mp3). Debe dar lo mismo que scripts/tts/comun.mjs
// (lo comprueba src/ui/tts.test.ts). Es síncrono a propósito: say() tiene que arrancar el audio dentro del gesto del usuario
// (iOS), y crypto.subtle.digest es asíncrono.

/** Texto tal como se busca: sin asteriscos de énfasis, espacios y saltos de línea colapsados, sin espacios en los bordes. */
export const normalizeText = (text: string): string => text.replace(/\*/g, "").replace(/\s+/g, " ").trim();

/** SHA-1 (hex) de un texto en UTF-8. */
export function sha1Hex(text: string): string {
  const bytes = new TextEncoder().encode(text);
  const words = new Uint32Array((((bytes.length + 8) >> 6) + 1) << 4);
  for (let i = 0; i < bytes.length; i++) words[i >> 2] |= bytes[i] << (24 - (i % 4) * 8);
  words[bytes.length >> 2] |= 0x80 << (24 - (bytes.length % 4) * 8);
  words[words.length - 1] = (bytes.length * 8) >>> 0;
  words[words.length - 2] = Math.floor((bytes.length * 8) / 2 ** 32);

  let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476, h4 = 0xc3d2e1f0;
  const w = new Uint32Array(80);
  const rotl = (x: number, n: number) => (x << n) | (x >>> (32 - n));
  for (let off = 0; off < words.length; off += 16) {
    for (let t = 0; t < 16; t++) w[t] = words[off + t];
    for (let t = 16; t < 80; t++) w[t] = rotl(w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16], 1);
    let a = h0, b = h1, c = h2, d = h3, e = h4;
    for (let t = 0; t < 80; t++) {
      const [f, k] =
        t < 20 ? [(b & c) | (~b & d), 0x5a827999]
          : t < 40 ? [b ^ c ^ d, 0x6ed9eba1]
            : t < 60 ? [(b & c) | (b & d) | (c & d), 0x8f1bbcdc]
              : [b ^ c ^ d, 0xca62c1d6];
      const tmp = (rotl(a, 5) + f + e + k + w[t]) >>> 0;
      e = d; d = c; c = rotl(b, 30) >>> 0; b = a; a = tmp;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0; h4 = (h4 + e) >>> 0;
  }
  return [h0, h1, h2, h3, h4].map((x) => x.toString(16).padStart(8, "0")).join("");
}

/** Primeros 12 caracteres hex del sha1 del texto normalizado. */
export const ttsId = (text: string): string => sha1Hex(normalizeText(text)).slice(0, 12);
