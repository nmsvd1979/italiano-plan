#!/usr/bin/env python3
"""G9 — agrega las frases extra de dictado (data/g9/dictado-extra.txt) a src/content/dictation.ts y reparte las nuevas
entre las semanas A/B en src/content/partes.ts. Es idempotente: no repite frases que ya están. Uso: python3 scripts/g9-aplicar.py"""
import re, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIC = os.path.join(ROOT, "src/content/dictation.ts"); PAR = os.path.join(ROOT, "src/content/partes.ts")
SPLIT_NEW = {"u02": ("6,8", "7,9"), "u03": ("6,9", "7,8"), "u05": ("6,7", "8,9"), "u06": ("6", "7,8,9"),
             "u07": ("6,8", "7,9"), "u14": ("6,7", "8,9"), "u15": ("6,7", "8,9")}
extra, cur = {}, None
for raw in open(os.path.join(ROOT, "data/g9/dictado-extra.txt"), encoding="utf8").read().split("\n"):
    if raw.startswith("## "): cur = raw[3:].strip(); extra[cur] = []
    elif raw.strip(): it, es = raw.split("|"); extra[cur].append((it.strip(), es.strip()))
src = open(DIC, encoding="utf8").read()
existing = set(re.findall(r'it: "([^"]*)"', src))
for uid, items in extra.items():
    m = re.search(r"\n  %s: \[\n(.*?)\n  \],\n" % uid, src, re.S)
    assert m, uid
    have = re.findall(r'it: "([^"]*)"', m.group(1))
    add = [(i, e) for i, e in items if i not in existing]
    if not add: continue
    assert len(have) == 6, f"{uid}: ya tiene {len(have)}"
    block = m.group(1) + "".join('\n    { it: "%s", es: "%s" },' % (i.replace('"', '\\"'), e.replace('"', '\\"')) for i, e in add)
    src = src[:m.start(1)] + block + src[m.end(1):]
    existing |= {i for i, _ in add}
open(DIC, "w", encoding="utf8").write(src)
par = open(PAR, encoding="utf8").read()
for uid, (a, b) in SPLIT_NEW.items():
    m = re.search(r"\n  %s: \{\n(.*?)\n  \},\n" % uid, par, re.S)
    blk = m.group(1)
    if "dictation: [" in blk and re.search(r"dictation: \[[^\]]*\b9\b", blk): continue
    lines = blk.split("\n")
    for k, add in (("A", a), ("B", b)):
        for n, l in enumerate(lines):
            if l.strip().startswith(k + ":"):
                lines[n] = re.sub(r"dictation: \[([^\]]*)\]", lambda mm: "dictation: [%s, %s]" % (mm.group(1), add.replace(",", ", ")), l)
    par = par[:m.start(1)] + "\n".join(lines) + par[m.end(1):]
open(PAR, "w", encoding="utf8").write(par)
print("ok")
