// Vuelca el vocabulario actual (sin G3) a un JSON para el compilador de G3.
import { writeFileSync } from "node:fs";
import { UNITS } from "../src/content/curriculum";
import vocabJson from "../src/content/vocab.json";
import { NUEVAS } from "../src/content/nuevas";
const out: Record<string, { it: string; es: string }[]> = { ...(vocabJson as any) };
for (const n of NUEVAS) out[n.id] = n.vocab;
void UNITS;
writeFileSync(process.argv[2], JSON.stringify(out));
