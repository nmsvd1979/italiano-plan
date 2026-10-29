#!/usr/bin/env python3
"""G4 — compila y valida los textos graduados.

Entrada : data/g4/textos-*.txt
Salida  : src/content/lectura.json  { "<stepId>": {tipo, titulo, it:[párrafos], es:[párrafos], claves:[{it,es}], preguntas:[...]} }

Formato de cada texto:
  ## u02#A                  (id del paso del curso)
  tipo: ...
  titulo: ...
  testo:   (líneas en italiano; línea en blanco = párrafo nuevo)
  es:      (traducción, mismos párrafos)
  claves: it=es; it=es; ...
  p1..p3: pregunta | opción a | opción b | opción c | letra correcta | por qué
  p4:     pregunta | respuesta1 / respuesta2 | por qué     (respuesta breve)

Uso: python3 scripts/g4-compilar.py [--check]
"""
import re, sys, json, glob, os, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src/content/lectura.json")
REGIONAL = re.compile(r"\b(cachái|po\b|weón|fome|bacán|pololo|polola|cabro|guagua|al tiro|altiro|harto)\b", re.I)
VOSEO = re.compile(r"\b(vos|tenés|querés|sos|podés|decís|sabés|hablás|mirá|escuchá|fijate)\b", re.I)
WORD = re.compile(r"[A-Za-zÀ-ÿ']+")

def minimo(uid):
    """Mínimo de palabras según la fase (el A0 inicial no alcanza 100 sin usar léxico no visto)."""
    m = re.match(r"u(\d+)", uid)
    n = int(m.group(1)) if m else 0
    if n in (25, 26, 27, 28): n = {25: 1, 26: 6, 27: 8, 28: 12}[n]
    if n <= 4: return 55
    if n <= 8: return 80
    if n <= 16: return 100
    return 120
MAXIMO = 250

def parse(path):
    texts = collections.OrderedDict()
    cur = None; mode = None
    for raw in open(path, encoding="utf8").read().split("\n"):
        if raw.startswith("## "):
            cur = {"id": raw[3:].strip(), "it": [], "es": [], "pre": []}
            texts[cur["id"]] = cur; mode = None; continue
        if cur is None: continue
        m = re.match(r"(tipo|titulo|claves):\s*(.*)$", raw)
        if m: cur[m.group(1)] = m.group(2).strip(); mode = None; continue
        if raw.strip() == "testo:": mode = "it"; cur["it"].append([]); continue
        if raw.strip() == "es:": mode = "es"; cur["es"].append([]); continue
        m = re.match(r"p([1-4]):\s*(.*)$", raw)
        if m: cur["pre"].append((int(m.group(1)), m.group(2))); mode = None; continue
        if mode in ("it", "es"):
            if raw.strip() == "": cur[mode].append([])
            else: cur[mode][-1].append(raw.strip())
    return texts

def build(t, errs):
    uid = t["id"]
    def e(msg): errs.append(f"{uid}: {msg}")
    for k in ("tipo", "titulo", "claves"):
        if not t.get(k): e(f"falta {k}")
    it = ["\n".join(p) for p in t["it"] if p]
    es = ["\n".join(p) for p in t["es"] if p]
    if len(it) != len(es): e(f"párrafos it={len(it)} es={len(es)}")
    words = len(WORD.findall(" ".join(it)))
    lo = minimo(uid)
    if not (lo <= words <= MAXIMO): e(f"{words} palabras (rango {lo}–{MAXIMO})")
    claves = []
    for pair in (t.get("claves") or "").split(";"):
        if "=" not in pair: continue
        a, b = [x.strip() for x in pair.split("=", 1)]
        claves.append({"it": a, "es": b})
        base = re.sub(r"^(il|lo|la|l'|i|gli|le|un|una)\s*", "", a.lower())
        stem = base[:4]
        if stem not in " ".join(it).lower(): e(f"clave «{a}» no aparece en el texto")
    if not 4 <= len(claves) <= 8: e(f"{len(claves)} claves (4–8)")
    pre = []
    nums = [n for n, _ in t["pre"]]
    if nums != [1, 2, 3, 4]: e(f"preguntas {nums}, se esperaba p1..p4")
    for n, body in t["pre"]:
        f = [x.strip() for x in body.split("|")]
        if n <= 3:
            if len(f) != 6: e(f"p{n}: se esperaban 6 campos, hay {len(f)}"); continue
            q, a, b, c, L, why = f
            if L not in "abc" or len(L) != 1: e(f"p{n}: letra «{L}»"); continue
            ops = [a, b, c]
            if len(set(ops)) != 3: e(f"p{n}: opciones repetidas")
            pre.append({"kind": "mc", "q": q, "options": ops, "answer": "abc".index(L), "why": why})
        else:
            if len(f) != 3: e(f"p4: se esperaban 3 campos, hay {len(f)}"); continue
            q, acc, why = f
            accepted = [x.strip() for x in acc.split("/") if x.strip()]
            if not accepted: e("p4: sin respuestas aceptadas")
            pre.append({"kind": "short", "q": q, "accepted": accepted, "why": why})
    alltxt = " ".join(es + [p.get("q", "") + " " + p.get("why", "") for p in pre])
    for rx, nm in ((REGIONAL, "chilenismo"), (VOSEO, "voseo")):
        mm = rx.search(alltxt)
        if mm: e(f"{nm}: «{mm.group(0)}»")
    for s in it:
        last = s.split("\n")[-1]
        if not re.search(r"[.!?»:),€\d]$", last) and not last.isupper() and len(last.split()) > 3:
            e(f"párrafo sin cierre: «{last[:40]}»")
    return {"id": uid, "tipo": t.get("tipo"), "titulo": t.get("titulo"), "it": it, "es": es,
            "claves": claves, "preguntas": pre, "palabras": words}

def main():
    errs = []; out = collections.OrderedDict()
    for p in sorted(glob.glob(os.path.join(ROOT, "data/g4/textos-*.txt"))):
        for uid, t in parse(p).items():
            if uid in out: errs.append(f"{uid}: duplicado")
            b = build(t, errs); b.pop("id"); out[uid] = b
    letras = collections.Counter("abc"[p["answer"]] for t in out.values() for p in t["preguntas"] if p["kind"] == "mc")
    print(f"{len(out)} textos; respuestas correctas por letra: {dict(letras)}")
    if letras and max(letras.values()) > 0.5 * sum(letras.values()) + 1:
        errs.append(f"respuestas desbalanceadas: {dict(letras)}")
    for e_ in errs: print("ERROR", e_)
    if errs: sys.exit(1)
    if "--check" not in sys.argv:
        json.dump(out, open(OUT, "w", encoding="utf8"), ensure_ascii=False, indent=1)
        print("escrito", os.path.relpath(OUT, ROOT))

main()
