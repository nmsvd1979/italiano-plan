#!/usr/bin/env python3
"""G8 — compila y valida la reserva de ítems de prueba (distintos a los de práctica).

Entrada : data/g8/pruebas-*.txt
Salida  : src/content/pruebas.json  { "<unidad>": { lectura[3], escucha[3], gramatica[4] } }
Unidad partida (u02, u03, u05, u06, u07, u14, u15): cada tipo lleva «@A» o «@B» y se piden 3/3/4 por parte.

Una línea por ítem, campos separados por «|». En L, E y C la PRIMERA opción es la correcta; el compilador reparte las
posiciones de forma pareja.
  L|texto breve en italiano|pregunta en español|correcta;mala;mala|por qué            lectura
  E|frase en italiano (se oye)|pregunta en español (o vacío)|correcta;mala;mala|por qué   escucha
  C|enunciado|correcta;mala;mala|por qué                                              gramática, elección
  F|frase con un solo ___ (y pista entre paréntesis)|respuesta (/ otras)|por qué       gramática, completar
Uso: python3 scripts/g8-compilar.py [--check] [--freq ruta/it_50k.txt]
"""
import re, sys, json, glob, os, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src/content/pruebas.json")
SPLIT = ["u02", "u03", "u05", "u06", "u07", "u14", "u15"]
QUOTA = {"L": 3, "E": 3, "G": 4}
REGIONAL = re.compile(r"\b(polera|remera|campera|pibe|choclo|cachái|fome|bacán|pololo|weón|arriendo|amoblad\w*|echo de menos)\b", re.I)
VOSEO = re.compile(r"\b(vos|tenés|querés|sos|podés|decís|sabés|hablás|mirá|escuchá|fijate)\b", re.I)
END = re.compile(r"[.!?»)]$")
NAMES = set("marta rossi lucía paolo napoli santiago roma giulia sara luca anna carlo bologna marco chiara valentina elena giorgio ferri costa bianchi neri firenze milano venezia torino italia cile".split())

def freq_set():
    path = None
    if "--freq" in sys.argv: path = sys.argv[sys.argv.index("--freq") + 1]
    if not path or not os.path.exists(path): return None
    return {l.split()[0] for l in open(path, encoding="utf8") if l.strip()}

def toks(s):
    s = s.lower().replace("’", "'")
    return [t.rstrip("'") for t in re.findall(r"[a-zà-ÿ]+'?", re.sub(r"(\w)'(\w)", r"\1' \2", s))]

def main():
    freq = freq_set(); errs = []; warn = []; out = collections.OrderedDict(); counter = 0
    for p in sorted(glob.glob(os.path.join(ROOT, "data/g8/pruebas-*.txt"))):
        cur = None
        for n, raw in enumerate(open(p, encoding="utf8").read().split("\n"), 1):
            if raw.startswith("## "):
                cur = raw[3:].strip()
                if cur in out: errs.append(f"{cur}: duplicado")
                out[cur] = {"lectura": [], "escucha": [], "gramatica": []}; continue
            if not raw.strip() or cur is None: continue
            where = f"{os.path.basename(p)}:{n} ({cur})"
            f = [x.strip() for x in raw.split("|")]
            m = re.match(r"([LECF])(?:@([AB]))?$", f[0])
            if not m: errs.append(f"{where}: tipo «{f[0]}»"); continue
            t, part = m.group(1), m.group(2)
            if (part is not None) != (cur in SPLIT): errs.append(f"{where}: " + ("falta @A/@B" if cur in SPLIT else "@A/@B en unidad no partida")); continue
            if t in "LE" and len(f) == 7: f = f[:3] + [";".join(f[3:6]), f[6]]
            if t == "C" and len(f) == 6: f = f[:2] + [";".join(f[2:5]), f[5]]
            need = {"L": 5, "E": 5, "C": 4, "F": 4}[t]
            if len(f) != need: errs.append(f"{where}: {len(f)} campos, se esperaban {need}"); continue
            why = f[-1]
            if not 10 <= len(why) <= 150: errs.append(f"{where}: explicación de {len(why)} caracteres")
            it_text = ""
            if t in "LE":
                opts = [o.strip() for o in f[3].split(";") if o.strip()]
                if len(opts) != 3 or len(set(opts)) != 3: errs.append(f"{where}: se necesitan 3 opciones distintas"); continue
                pos = counter % 3; counter += 1
                sh = opts[1:]; sh.insert(pos, opts[0])
                item = {"q": f[2] or "¿Qué dijo?", "options": sh, "answer": pos, "why": why}
                if t == "L":
                    if not 12 <= len(f[1].split()) <= 60: errs.append(f"{where}: texto de {len(f[1].split())} palabras")
                    item = {"text": f[1], **item}; it_text = f[1]
                    out[cur]["lectura"].append({**item, **({"part": part} if part else {})})
                else:
                    if not END.search(f[1]): errs.append(f"{where}: frase sin signo final")
                    if not f[2]: item.pop("q"); item = {k: v for k, v in item.items()}
                    item = {"it": f[1], **item}; it_text = f[1]
                    out[cur]["escucha"].append({**item, **({"part": part} if part else {})})
            elif t == "C":
                opts = [o.strip() for o in f[2].split(";") if o.strip()]
                if len(opts) != 3 or len(set(opts)) != 3: errs.append(f"{where}: se necesitan 3 opciones distintas"); continue
                pos = counter % 3; counter += 1
                sh = opts[1:]; sh.insert(pos, opts[0]); it_text = " ".join(opts)
                out[cur]["gramatica"].append({"type": "choice", "prompt": f[1], "options": sh, "answer": pos, "why": why, **({"part": part} if part else {})})
            else:
                if f[1].count("___") != 1: errs.append(f"{where}: debe haber un solo ___"); continue
                ans = [a.strip() for a in f[2].split(" / ") if a.strip()]
                if not ans: errs.append(f"{where}: sin respuestas")
                it_text = f[1].replace("___", " ")
                out[cur]["gramatica"].append({"type": "fill", "prompt": f[1], "answers": ans, "why": why, **({"part": part} if part else {})})
            sp = " ".join([why, f[1] if t != "E" else "", f[2] if t in "LE" else ""])
            for rx, nm in ((REGIONAL, "regionalismo"), (VOSEO, "voseo")):
                mm = rx.search(sp)
                if mm: errs.append(f"{where}: {nm} «{mm.group(0)}»")
            if freq is not None and t in "LE" or (freq is not None and t == "C"):
                unk = sorted({w for w in toks(f[1] if t != "C" else it_text) if w not in freq and w not in NAMES and len(w) > 1})
                if unk: warn.append(f"{where}: fuera de la lista de frecuencia {unk}")
    for uid, u in out.items():
        sets = [(None, u)] if uid not in SPLIT else [(pt, {k: [x for x in v if x.get("part") == pt] for k, v in u.items()}) for pt in "AB"]
        for pt, s in sets:
            got = {"L": len(s["lectura"]), "E": len(s["escucha"]), "G": len(s["gramatica"])}
            if got != QUOTA: errs.append(f"{uid}{('#'+pt) if pt else ''}: mezcla {got}, se esperaba {QUOTA}")
        keys = [x.get("text") or x.get("it") or x["prompt"] for k in u.values() for x in k]
        if len(set(keys)) != len(keys): errs.append(f"{uid}: ítems repetidos")
    pos = collections.Counter(x["answer"] for u in out.values() for k in u.values() for x in k if "answer" in x)
    print(f"{len(out)} unidades, {sum(len(k) for u in out.values() for k in u.values())} ítems; posiciones {dict(pos)}")
    for w in warn: print("AVISO", w)
    for e in errs: print("ERROR", e)
    if errs: sys.exit(1)
    if "--check" not in sys.argv:
        json.dump(out, open(OUT, "w", encoding="utf8"), ensure_ascii=False, indent=1); print("escrito", os.path.relpath(OUT, ROOT))
main()
