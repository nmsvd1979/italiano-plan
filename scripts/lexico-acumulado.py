#!/usr/bin/env python3
"""Informe de léxico acumulado (docs/v2/07): % de palabras de cada texto graduado que ya se enseñó hasta esa semana.

Se compara por lema (simplemma, offline): `pip install simplemma`.
Uso:
  npx vite-node scripts/lexico-acumulado.ts /tmp/lexico.json
  python3 scripts/lexico-acumulado.py /tmp/lexico.json [--detalle] [--min 90]
Cuenta como conocida una palabra si: su lema aparece en lo enseñado hasta la unidad, es de la lista básica (artículos,
preposiciones, números 1–10…), es un nombre propio o está entre las «palabras clave» glosadas del propio texto.
Es una advertencia, no un error: sale con código 1 solo si algún texto queda bajo --min (por defecto 85).
"""
import json, re, sys
import simplemma

args = sys.argv[1:]
data = json.load(open(args[0], encoding="utf8"))
detail = "--detalle" in args
MIN = int(args[args.index("--min") + 1]) if "--min" in args else 85

def toks(s):
    s = s.lower().replace("’", "'").replace("*", "")
    s = re.sub(r"(\w)'(\w)", r"\1' \2", s)
    return [t.rstrip("'") for t in re.findall(r"[a-zà-ÿ]+'?", s)]

lem = lambda w: simplemma.lemmatize(w, lang="it")

BASIC = set("""il lo la i gli le un uno una di a da in con su per tra fra e ma o che non si mi ti ci vi essere avere
io tu lui lei noi voi loro me te ne mio tuo suo nostro questo quello sì no anche molto poco più meno già ancora sempre
mai oggi domani ieri ora adesso poi dopo prima qui là lì dove come quando perché cosa chi quanto quale due tre quattro
cinque sei sette otto nove dieci ad ed all dell nell dall sull al del dal nel sul alla della dalla nella sulla ai dei dai
nei sui alle delle dalle nelle sulle agli degli dagli negli sugli allo dello dallo nello sullo c l d""".split())
NAMES = set("""marta rossi lucía paolo napoli santiago roma giulia sara luca anna carlo bologna marco chiara valentina elena
conti ferri costa bianchi neri fede giorgia davide sofia pepe rosa gino tachiflu firenze milano venezia torino navigli
toscana garibaldi dante duomo campo fiori san italia cile cilena europa lucia canal grande tiramisù""".split())

order = data["unitOrder"]
acc, known = set(lem(w) for w in BASIC) | BASIC, {}
for u in order:
    acc |= {lem(t) for t in data["units"][u]} | set(data["units"][u])
    known[u] = set(acc)

worst, low, rows = 100, 0, []
for sid, t in data["texts"].items():
    kn = known[data["steps"][sid]]
    claves = {lem(w) for c in t["claves"] for w in toks(c)} | {w for c in t["claves"] for w in toks(c)}
    ws = [w for w in toks(t["it"]) if w not in NAMES]
    unk = sorted({w for w in ws if lem(w) not in kn and w not in kn and lem(w) not in claves and w not in claves})
    n_unk = sum(1 for w in ws if w in unk)
    ratio = round(100 * (len(ws) - n_unk) / len(ws))
    worst = min(worst, ratio); low += ratio < MIN
    rows.append(f"{sid:8} {ratio:3d} %  ({len(unk)} formas nuevas){' ' + ', '.join(unk) if detail else ''}")
print("\n".join(rows))
print(f"\nPeor texto: {worst} % · bajo {MIN} %: {low} de {len(rows)}")
sys.exit(1 if low else 0)
