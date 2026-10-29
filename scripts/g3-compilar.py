#!/usr/bin/env python3
"""G3: compila data/g3/unidades-*.txt -> src/content/vocab-g3.json y valida (V1 automática).
Formato por unidad:  ## u01
  =it|ex|exEs           ejemplo para una palabra que ya existe en la unidad (it exacto)
  +tag|it|es|ex|exEs    palabra nueva (tag: unidad | frecuente)
Segunda parte: data/g3/frecuentes-*.txt  (pos|it|es|ex|exEs) -> src/content/base-frecuente.json (mazo general).
Uso: python3 scripts/g3-compilar.py [--fix]
  --fix  pasa a «unidad» las palabras marcadas «frecuente» que no lo son.
Necesita las listas de frecuencia (no se guardan en el repo); G3_FREQ apunta a la carpeta que las tiene:
  curl -O https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/it/it_50k.txt
  curl -O https://raw.githubusercontent.com/napolux/paroleitaliane/master/paroleitaliane/1000_parole_italiane_comuni.txt
  (renombrar la segunda a paroleitaliane.txt)
Si cambia el vocabulario base: npx tsx scripts/g3-volcar-base.ts data/g3/_base-vocab.json
"""
import json, re, sys, glob, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FREQ = os.environ.get("G3_FREQ", "/tmp/g3-freq")

def load_freq():
    rank = {}
    for i, l in enumerate(open(f"{FREQ}/it_50k.txt", encoding="utf-8")):
        w = l.split()[0].lower()
        rank.setdefault(w, i + 1)
    nap = {l.strip().lower() for l in open(f"{FREQ}/paroleitaliane.txt", encoding="utf-8") if l.strip()}
    return rank, nap

# Una palabra cuenta como «frecuente» si su forma más frecuente está entre las 4000 primeras de FrequencyWords (subtítulos),
# que equivale aproximadamente a los 2000 lemas más frecuentes, o si está en la lista de 1000 palabras comunes (napolux).
LIM = 4000
ART = re.compile(r"^(?:(?:il|lo|la|i|gli|le|un|uno|una)\s+|l'|un')", re.I)
def bare(s): return ART.sub("", s.strip().lower())
TOK = re.compile(r"[a-zàáèéìíòóùú]+", re.I)
ELIS = {"l", "un", "dov", "c", "all", "dell", "nell", "sull", "quest", "quell", "d", "po", "com", "cos", "anch", "nient", "senz", "tutt", "bell", "buon", "sant", "mezz", "dall", "nessun", "v", "s", "m", "t", "n"}
def tokens(s):
    out = []
    for w in s.replace("’", "'").split():
        parts = [p for p in TOK.findall(w)]
        if "'" in w and len(parts) >= 2:
            out += [parts[-1].lower()] + [p.lower() for p in parts[:-1] if p.lower() not in ELIS]
        else:
            out += [p.lower() for p in parts]
    return out

def existing_vocab():
    return json.load(open(f"{ROOT}/data/g3/_base-vocab.json", encoding="utf-8"))

def best_rank(b, rank):
    """Rango más bajo (más frecuente) de la palabra, de sus formas verbales o de las palabras de una expresión."""
    b = re.sub(r"^non\.\.\. ?", "", b).replace("...", "")
    if " " in b:
        rs = [best_rank(t, rank) for t in b.split() if t not in ("di", "a", "da", "per", "con", "in")]
        rs = [x for x in rs if x]
        return max(rs) if rs else None
    base = (b[:-2] + "e") if b.endswith("rsi") else b
    m = re.match(r"^(.*)(are|ere|ire)$", base)
    if not m: return rank.get(b)
    st, t = m.group(1), m.group(2)
    forms = [st + x for x in ("o", "a", "e", "i", "iamo", "ato", "uto", "ito", "ava", "isce", "isco", "ono", "ano", "endo", "ando")]
    rs = [rank[f] for f in forms if f in rank]
    if b.endswith("rsi"): rs += [rank[x + st + y] for x in ("mi ",) for y in ("",) if False]
    if b in rank: rs.append(rank[b])
    return min(rs) if rs else None

def main():
    rank, nap = load_freq()
    base = existing_vocab()
    out, problems, stats = {}, [], {"new": 0, "freq": 0, "ex": 0}
    seen_new = {}
    unknown = {}
    retag = {}
    for path in sorted(glob.glob(f"{ROOT}/data/g3/unidades-*.txt")):
        unit = None
        for ln, line in enumerate(open(path, encoding="utf-8"), 1):
            line = line.rstrip("\n")
            if not line.strip() or line.startswith("#") and not line.startswith("## "): continue
            if line.startswith("## "):
                unit = line[3:].strip().split()[0]; out.setdefault(unit, {"enrich": {}, "extra": []}); continue
            where = f"{os.path.basename(path)}:{ln}"
            if line.startswith("="):
                p = [x.strip() for x in line[1:].split("|")]
                if len(p) != 3: problems.append(f"{where} campos"); continue
                it, ex, exEs = p
                if it not in [w["it"] for w in base.get(unit, [])]: problems.append(f"{where} {unit}: '{it}' no existe en la unidad")
                rr = best_rank(bare(it), rank)
                out[unit]["enrich"][it] = {"ex": ex, "exEs": exEs, "tag": "frecuente" if ((rr is not None and rr <= LIM) or bare(it) in nap) else "unidad"}
                chk = (ex, f"{where} {it}")
                stats["ex"] += 1
            elif line.startswith("+"):
                p = [x.strip() for x in line[1:].split("|")]
                if len(p) != 5: problems.append(f"{where} campos ({len(p)})"); continue
                tag, it, es, ex, exEs = p
                if tag not in ("unidad", "frecuente"): problems.append(f"{where} tag {tag}")
                b = bare(it)
                r = best_rank(b, rank)
                isfreq = (r is not None and r <= LIM) or b in nap
                if tag == "frecuente" and not isfreq:
                    if "--fix" in sys.argv: retag.setdefault(path, set()).add(ln)
                    else: problems.append(f"{where} '{it}' marcada frecuente pero rank={r}")
                if b in seen_new: problems.append(f"{where} '{it}' repetida (ya en {seen_new[b]})")
                seen_new[b] = unit
                if any(bare(w["it"]) == b for w in base.get(unit, [])): problems.append(f"{where} '{it}' ya está en la unidad")
                out[unit]["extra"].append({"it": it, "es": es, "ex": ex, "exEs": exEs, "tag": tag, "n": r})
                stats["new"] += 1; stats["freq"] += (tag == "frecuente"); stats["ex"] += 1
                chk = (ex, f"{where} {it}")
            else:
                problems.append(f"{where} línea desconocida"); continue
            if not re.search(r"[.!?]$", chk[0]): problems.append(f"{chk[1]} frase sin puntuación final")
            for t in tokens(chk[0]):
                if t not in rank and t not in nap:
                    unknown.setdefault(t, []).append(chk[1])
            if ex.count("|") or "  " in ex: problems.append(f"{chk[1]} formato")
    for path, lns in retag.items():
        L = open(path, encoding="utf-8").read().split("\n")
        for n in lns: L[n - 1] = L[n - 1].replace("+frecuente|", "+unidad|", 1)
        open(path, "w", encoding="utf-8").write("\n".join(L))
    if retag: print("retag a «unidad»:", sum(len(v) for v in retag.values()), "(vuelve a ejecutar)")
    # cobertura de enrich por unidad
    for u, d in out.items():
        miss = [w["it"] for w in base.get(u, []) if w["it"] not in d["enrich"]]
        if miss: problems.append(f"{u}: faltan ejemplos para {miss}")
        n = len(d["extra"]); f = sum(1 for e in d["extra"] if e["tag"] == "frecuente")
        stats.setdefault("units", {})[u] = (len(base.get(u, [])) + n, n, f)
    split = json.load(open(f"{ROOT}/data/g3/_partidas.json", encoding="utf-8")) if os.path.exists(f"{ROOT}/data/g3/_partidas.json") else []
    for u, d in out.items():
        if u in split:
            for i, e in enumerate(d["extra"]): e["part"] = "A" if i % 2 == 0 else "B"
    json.dump(out, open(f"{ROOT}/src/content/vocab-g3.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print("stats:", {k: v for k, v in stats.items() if k != "units"})
    print("por unidad (total, nuevas, frecuentes):", stats.get("units"))
    if unknown: print("palabras fuera de las listas (revisar a mano):", {k: v[:2] for k, v in sorted(unknown.items())})
    print("PROBLEMAS:" if problems else "sin problemas"); [print(" -", p) for p in problems[:80]]
    return problems

def mazo():
    rank, nap = load_freq()
    base = existing_vocab()
    g = json.load(open(f"{ROOT}/src/content/vocab-g3.json", encoding="utf-8"))
    taken = {}
    for u, ws in base.items():
        for w in ws: taken[bare(w["it"])] = u
    for u, d in g.items():
        for w in d["extra"]: taken[bare(w["it"])] = u
    out, problems, unknown, rare, seen = [], [], {}, [], {}
    for path in sorted(glob.glob(f"{ROOT}/data/g3/frecuentes-*.txt")):
        for ln, line in enumerate(open(path, encoding="utf-8"), 1):
            line = line.rstrip("\n")
            if not line.strip() or line.startswith("#"): continue
            where = f"{os.path.basename(path)}:{ln}"
            p = [x.strip() for x in line.split("|")]
            if len(p) != 5: problems.append(f"{where} campos ({len(p)})"); continue
            pos, it, es, ex, exEs = p
            b = bare(it)
            if b in taken: problems.append(f"{where} '{it}' ya está en {taken[b]}")
            if b in seen: problems.append(f"{where} '{it}' repetida en el mazo")
            seen[b] = 1
            r = best_rank(b, rank)
            if r is None and b not in nap: rare.append(it)
            elif r is not None and r > 12000 and b not in nap: rare.append(f"{it}({r})")
            if not re.search(r"[.!?]$", ex): problems.append(f"{where} frase sin puntuación")
            for t in tokens(ex):
                if t not in rank and t not in nap: unknown.setdefault(t, []).append(f"{where} {it}")
            out.append({"it": it, "es": es, "ex": ex, "exEs": exEs, "pos": pos, "n": r})
    out.sort(key=lambda e: (e["n"] is None, e["n"] or 0))
    json.dump(out, open(f"{ROOT}/src/content/base-frecuente.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print("mazo general:", len(out), "entradas")
    if rare: print("poco frecuentes (revisar):", rare)
    if unknown: print("fuera de las listas:", {k: v[:1] for k, v in sorted(unknown.items())})
    print("PROBLEMAS mazo:" if problems else "mazo sin problemas"); [print(" -", x) for x in problems[:60]]
    return problems

if __name__ == "__main__":
    a = main()
    b = mazo()
    sys.exit(1 if (a or b) else 0)
