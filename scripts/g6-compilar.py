#!/usr/bin/env python3
"""G6 — compila y valida la secuencia de pronunciación (un contraste nuevo por semana del curso).

Entrada : data/g6/pron-secuencia.txt
Salida  : src/content/pronunciation/pron-sequence.json
  { "steps": { "<paso>": {title, tip, pairs:[[a,b]], words:[…]} }, "gloss": {palabra: significado}, "audioPending": [palabras sin audio nativo] }

Formato por paso (el id de las semanas partidas se escribe u02A y se guarda como u02#A):
  ## u25
  titulo: …                 tip: …  (con *cursivas* para el italiano)
  pares: a-b; c-d            (pares mínimos o contrastes; vacío si no hay)
  palabras: p1, p2, …        (6 a 10, para escuchar y repetir)
  glosas: palabra=significado; …   (solo las que no están ya en pronunciation/units.json)
Uso: python3 scripts/g6-compilar.py [--check]
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "data/g6/pron-secuencia.txt")
OUT = os.path.join(ROOT, "src/content/pronunciation/pron-sequence.json")
VOSEO = re.compile(r"\b(vos|tenés|querés|sos|podés|decís|sabés|hablás|mirá|escuchá|fijate)\b", re.I)
REGIONAL = re.compile(r"\b(polera|remera|campera|pibe|choclo|cachái|fome|bacán|pololo|weón|arriendo|amoblad\w*)\b", re.I)

course = list(json.load(open(os.path.join(ROOT, "src/content/lectura.json"), encoding="utf8")).keys())  # los 35 pasos
base = json.load(open(os.path.join(ROOT, "src/content/pronunciation/units.json"), encoding="utf8"))["gloss"]
manifest = json.load(open(os.path.join(ROOT, "src/content/pronunciation/manifest.json"), encoding="utf8"))
nuevas = ""
for u in ("u25", "u26", "u27", "u28"):
    nuevas += open(os.path.join(ROOT, f"src/content/nuevas/{u}.ts"), encoding="utf8").read()
for m in re.finditer(r'"?([\wàèéìòùÀ-ÿ\' ]+)"?\s*:\s*"([^"]+)"', nuevas):
    base.setdefault(m.group(1).lower(), m.group(2))

# Glosa de respaldo: el significado de la misma palabra en los vocabularios del curso (sin artículo).
def _strip(it):
    return re.sub(r"^(il|lo|la|l'|i|gli|le|un|una|uno)\s*", "", it.lower().strip())
fallback = {}
def _add(it, es):
    fallback.setdefault(_strip(it), es); fallback.setdefault(it.lower().strip(), es)
for lst in json.load(open(os.path.join(ROOT, "src/content/vocab.json"), encoding="utf8")).values():
    for w in lst: _add(w["it"], w["es"])
for e in json.load(open(os.path.join(ROOT, "src/content/base-frecuente.json"), encoding="utf8")): _add(e["it"], e["es"])
errs, steps, gloss = [], {}, {}
cur = None
for n, raw in enumerate(open(SRC, encoding="utf8").read().split("\n"), 1):
    if raw.startswith("## "):
        sid = re.sub(r"^(u\d\d)([AB])$", r"\1#\2", raw[3:].strip())
        if sid in steps: errs.append(f"{sid}: duplicado")
        if sid == "_glosas": cur = {"_id": sid, "title": "", "tip": "", "pairs": [], "words": []}; continue
        cur = steps.setdefault(sid, {"title": "", "tip": "", "pairs": [], "words": []}); cur["_id"] = sid; continue
    if cur is None or not raw.strip(): continue
    k, _, v = raw.partition(":"); v = v.strip(); sid = cur["_id"]
    if k == "titulo": cur["title"] = v
    elif k == "tip": cur["tip"] = v
    elif k == "pares":
        for p in [x.strip() for x in v.split(";") if x.strip()]:
            m = re.match(r"^(.+?)-(.+)$", p)
            if not m: errs.append(f"{sid}: par «{p}»"); continue
            cur["pairs"].append([m.group(1).strip(), m.group(2).strip()])
    elif k == "palabras": cur["words"] = [x.strip() for x in v.split(",") if x.strip()]
    elif k == "glosas":
        for g in [x.strip() for x in v.split(";") if x.strip()]:
            a, _, b = g.partition("=")
            if not b: errs.append(f"{sid}: glosa «{g}»"); continue
            gloss[a.strip().lower()] = b.strip()
    else: errs.append(f"línea {n}: campo «{k}»")

if list(steps.keys()) != course:
    missing = [c for c in course if c not in steps]; extra = [s for s in steps if s not in course]
    errs.append(f"pasos distintos del curso: faltan {missing} sobran {extra}")

allgloss = {**fallback, **base, **gloss}
words_used = set()
for sid, s in steps.items():
    s.pop("_id", None)
    wc = len(s["tip"].split())
    if not 25 <= wc <= 90: errs.append(f"{sid}: tip de {wc} palabras")
    if s["tip"].count("*") % 2: errs.append(f"{sid}: asteriscos sin cerrar")
    if not s["title"]: errs.append(f"{sid}: sin título")
    if not 6 <= len(s["words"]) <= 10: errs.append(f"{sid}: {len(s['words'])} palabras (6–10)")
    if len(s["pairs"]) > (8 if sid == "u24" else 5): errs.append(f"{sid}: {len(s['pairs'])} pares (máx. 5)")
    if len(set(w.lower() for w in s["words"])) != len(s["words"]): errs.append(f"{sid}: palabras repetidas")
    for rx, nm in ((VOSEO, "voseo"), (REGIONAL, "regionalismo")):
        mm = rx.search(s["tip"] + " " + s["title"])
        if mm: errs.append(f"{sid}: {nm} «{mm.group(0)}»")
    for w in [x for p in s["pairs"] for x in p] + s["words"]:
        words_used.add(w)
        if w.lower() not in allgloss: errs.append(f"{sid}: falta glosa de «{w}»")

used_gloss = {w.lower(): allgloss[w.lower()] for w in words_used if w.lower() in allgloss}
pending = sorted({w for w in words_used if w.lower() not in manifest})
out = {"steps": steps, "gloss": used_gloss, "audioPending": pending}
print(f"{len(steps)} pasos; {len(words_used)} palabras/frases; sin audio nativo: {len(pending)}")
for e in errs: print("ERROR", e)
if errs: sys.exit(1)
if "--check" not in sys.argv:
    json.dump(out, open(OUT, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    print("escrito", os.path.relpath(OUT, ROOT))
