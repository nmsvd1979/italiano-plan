import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/theme/tokens.css", "utf8");
const parse = (block: string) => Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]));
const light = parse(css.split("@media")[0]);
const dark = { ...light, ...parse(css.match(/@media \(prefers-color-scheme: dark\)\s*\{\s*:root:not\(\[data-theme="light"\]\)\s*\{([\s\S]*?)\n  \}/)![1]) };

function lum(hex: string): number {
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const [r, g, b] = [1, 3, 5].map((i) => f(parseInt(hex.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const ratio = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// Texto pequeño: WCAG AA exige 4,5:1.
const PAIRS: [string, string][] = [
  ["text", "bg"], ["text", "surface"], ["text-dim", "bg"], ["text-dim", "surface"], ["text-dim", "surface-2"],
  ["text-faint", "bg"], ["text-faint", "surface"], ["text-faint", "surface-2"],
  ["on-accent", "accent"], ["accent-ink", "accent-soft"], ["accent", "surface"],
  ["saffron-ink", "saffron-soft"], ["warn", "warn-soft"], ["good", "good-soft"], ["bad", "bad-soft"],
];

describe("contraste de colores (WCAG AA)", () => {
  for (const [name, theme] of [["claro", light], ["oscuro", dark]] as const) {
    it(`tema ${name}`, () => {
      const low = PAIRS.filter(([a, b]) => ratio(theme[a], theme[b]) < 4.5).map(([a, b]) => `${a} sobre ${b}: ${ratio(theme[a], theme[b]).toFixed(1)}`);
      expect(low).toEqual([]);
    });
  }
});
