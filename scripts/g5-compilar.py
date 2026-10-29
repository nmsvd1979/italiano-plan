#!/usr/bin/env python3
"""G5 — compila y valida los ejercicios de práctica sin pista.

Entrada : data/g5/ejercicios-*.txt
Salida  : src/content/sinpista.json  { "<unidad>": [ejercicio, …] }

Una línea por ejercicio; campos separados por «|»; respuestas alternativas separadas por « / »; opciones por «;».
Unidad partida (u02, u03, u05, u06, u07, u14, u15): el tipo lleva «@A» o «@B» (o@A|…).
  o|frase en español|oración italiana correcta (/ alternativas)|palabras de sobra (coma, opcional)|por qué     ordenar
  t|frase en español|respuesta (/ otras)|por qué                                                              traducir
  f|frase italiana con un error|corrección (/ otras)|por qué                                                  corregir
  x|instrucción y frase|respuesta (/ otras)|por qué                                                           transformar
  d|línea // línea con ___ // línea|correcta;mala;mala|por qué                                                completar diálogo
  l|frase italiana (se oye)|significado correcto;malo;malo|por qué                                            escuchar y elegir
En d y l la PRIMERA opción es la correcta; el compilador reparte las posiciones de forma pareja.
Cada unidad: 12 ejercicios = o2 t3 f2 x2 d2 l1.
Uso: python3 scripts/g5-compilar.py [--check]
"""
import re, sys, json, glob, os, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src/content/sinpista.json")
SPLIT = ["u02", "u03", "u05", "u06", "u07", "u14", "u15"]
QUOTA = {"o": 2, "t": 3, "f": 2, "x": 2, "d": 2, "l": 1}
REGIONAL = re.compile(r"\b(polera|remera|campera|pibe|choclo|cachái|fome|bacán|pololo|weón|arriendo|amoblad\w*|echo de menos)\b", re.I)
VOSEO = re.compile(r"\b(vos|tenés|querés|sos|podés|decís|sabés|hablás|mirá|escuchá|fijate)\b", re.I)
END = re.compile(r"[.!?»)]$")

def parse(path):
    units = collections.OrderedDict(); cur = None
    for n, raw in enumerate(open(path, encoding="utf8").read().split("\n"), 1):
        if raw.startswith("## "): cur = raw[3:].strip(); units.setdefault(cur, []); continue
        if not raw.strip() or cur is None: continue
        units[cur].append((n, raw))
    return units

def main():
    errs = []; out = collections.OrderedDict(); counter = 0
    for p in sorted(glob.glob(os.path.join(ROOT, "data/g5/ejercicios-*.txt"))):
        for uid, lines in parse(p).items():
            if uid in out: errs.append(f"{uid}: duplicado")
            exs = []
            for n, raw in lines:
                where = f"{os.path.basename(p)}:{n} ({uid})"
                f = [x.strip() for x in raw.split("|")]
                m = re.match(r"([otfxdl])(?:@([AB]))?$", f[0])
                if not m: errs.append(f"{where}: tipo «{f[0]}»"); continue
                t, part = m.group(1), m.group(2)
                if (part is not None) != (uid in SPLIT): errs.append(f"{where}: " + ("falta @A/@B" if uid in SPLIT else "@A/@B en unidad no partida"))
                need = 5 if t == "o" else 4
                if len(f) != need: errs.append(f"{where}: {len(f)} campos, se esperaban {need}"); continue
                ex = {"id": f"{uid}-s{len(exs)+1:02d}", "type": {"o": "order", "t": "translate", "f": "fix", "x": "transform", "d": "dialog", "l": "listen"}[t]}
                if part: ex["part"] = part
                why = f[-1]
                if not 10 <= len(why) <= 150: errs.append(f"{where}: explicación de {len(why)} caracteres")
                ex["why"] = why
                if t == "o":
                    ans = [a.strip() for a in f[2].split(" / ") if a.strip()]
                    toks = ans[0].split()
                    if not 3 <= len(toks) <= 10: errs.append(f"{where}: {len(toks)} palabras para ordenar")
                    if not END.search(ans[0]): errs.append(f"{where}: la oración no termina en signo")
                    ex.update(prompt=f[1], answers=ans, extra=[x.strip() for x in f[3].split(",") if x.strip()])
                elif t in "txf":
                    ans = [a.strip() for a in f[2].split(" / ") if a.strip()]
                    if not ans: errs.append(f"{where}: sin respuestas")
                    if t == "f" and f[1] in ans: errs.append(f"{where}: la frase con error ya es una respuesta")
                    if t == "f" and not END.search(f[1]): errs.append(f"{where}: sin signo final")
                    ex.update(prompt=f[1], answers=ans)
                else:
                    opts = [o.strip() for o in f[2].split(";") if o.strip()]
                    if len(opts) != 3 or len(set(opts)) != 3: errs.append(f"{where}: se necesitan 3 opciones distintas"); continue
                    pos = counter % 3; counter += 1
                    shuffled = opts[1:]; shuffled.insert(pos, opts[0])
                    ex["answer"] = pos; ex["options"] = shuffled
                    if t == "d":
                        lines_ = [x.strip() for x in f[1].split("//")]
                        if sum(l.count("___") for l in lines_) != 1: errs.append(f"{where}: debe haber un solo ___")
                        ex["lines"] = lines_
                    else:
                        if not END.search(f[1]): errs.append(f"{where}: sin signo final")
                        ex["prompt"] = f[1]
                sp = " ".join([why] + ([f[1]] if t in "otx" else []) + (ex["options"] if t == "l" else []))
                for rx, nm in ((REGIONAL, "regionalismo"), (VOSEO, "voseo")):
                    mm = rx.search(sp)
                    if mm: errs.append(f"{where}: {nm} «{mm.group(0)}»")
                exs.append(ex)
            c = collections.Counter(e["type"][0] if e["type"] != "fix" else "f" for e in exs)
            got = {"o": 0, "t": 0, "f": 0, "x": 0, "d": 0, "l": 0}
            for e in exs: got[{"order": "o", "translate": "t", "fix": "f", "transform": "x", "dialog": "d", "listen": "l"}[e["type"]]] += 1
            if got != QUOTA: errs.append(f"{uid}: mezcla {got}, se esperaba {QUOTA}")
            if uid in SPLIT:
                a = sum(1 for e in exs if e.get("part") == "A"); b = sum(1 for e in exs if e.get("part") == "B")
                if a != 6 or b != 6: errs.append(f"{uid}: partes A={a} B={b} (6 y 6)")
            prompts = [e.get("prompt") or " ".join(e["lines"]) for e in exs]
            if len(set(prompts)) != len(prompts): errs.append(f"{uid}: ejercicios repetidos")
            out[uid] = exs
    pos = collections.Counter(e["answer"] for u in out.values() for e in u if "answer" in e)
    print(f"{len(out)} unidades, {sum(len(u) for u in out.values())} ejercicios; posiciones correctas {dict(pos)}")
    for e_ in errs: print("ERROR", e_)
    if errs: sys.exit(1)
    if "--check" not in sys.argv:
        json.dump(out, open(OUT, "w", encoding="utf8"), ensure_ascii=False, indent=1)
        print("escrito", os.path.relpath(OUT, ROOT))

main()
