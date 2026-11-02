#!/usr/bin/env python3
"""G0 — inserciones pendientes del backlog (docs/v2/auditoria/_backlog.md): agrega un párrafo de regla, ejemplos y ejercicios
al final de las listas de una lección. Idempotente (revisa una marca en el texto). Uso: python3 scripts/g0-insertar.py <clave>"""
import re, os, sys, json
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
q = lambda s: json.dumps(s, ensure_ascii=False)

def insert(unit, marker, rule_p, examples, exercises):
    path = os.path.join(ROOT, f"src/content/grammar/unidad{unit[1:]}.ts")
    s = open(path, encoding="utf8").read()
    if marker in s: print(unit, "ya insertado"); return
    # párrafo al final de la regla
    i = s.index("\n  ],\n  transfer")
    s = s[:i] + "\n    {\n      kind: \"p\",\n      text: " + q(rule_p) + ",\n    }," + s[i:]
    # ejemplos
    i = s.index("  examples: [")
    j = s.index("\n  ],", i)
    s = s[:j] + "".join("\n    { it: %s, es: %s }," % (q(a), q(b)) for a, b in examples) + s[j:]
    # ejercicios
    i = s.index("  exercises: [")
    j = s.rindex("\n  ],")
    lines = []
    for e in exercises:
        if e[0] == "f": lines.append("\n    {type: \"fill\", prompt: %s, answers: %s, why: %s}," % (q(e[1]), json.dumps(e[2], ensure_ascii=False), q(e[3])))
        else: lines.append("\n    {type: \"choice\", prompt: %s, options: %s, answer: %d, why: %s}," % (q(e[1]), json.dumps(e[2], ensure_ascii=False), e[3], q(e[4])))
    s = s[:j] + "".join(lines) + s[j:]
    open(path, "w", encoding="utf8").write(s)
    print(unit, "ok:", len(examples), "ejemplos,", len(exercises), "ejercicios")

D = {
"cera": ("u11", "C'era / c'erano", "**C'era / c'erano** (había). Es el imperfetto de *c'è / ci sono* y sirve para describir cómo era un lugar en el pasado: *C'era un parco vicino a casa mia.* (Había un parque cerca de mi casa.) *C'erano molti alberi.* (Había muchos árboles.) Va en singular con una cosa (*c'era*) y en plural con varias (*c'erano*). *Non c'era nessuno.* = No había nadie.",
  [("C'era un parco vicino a casa mia.", "Había un parque cerca de mi casa."), ("C'erano molti alberi e pochi negozi.", "Había muchos árboles y pocas tiendas."), ("Non c'era nessuno in strada.", "No había nadie en la calle.")],
  [("f", "Nella mia città ___ un cinema vicino alla piazza. (había)", ["c'era"], "*C'era* + singular: había."),
   ("f", "Nel giardino ___ molti fiori. (habían)", ["c'erano"], "*C'erano* + plural: había muchos."),
   ("f", "Quando sono arrivato, in piazza ___ molte persone. (había)", ["c'erano"], "Plural (*molte persone*): *c'erano*."),
   ("f", "Ieri a casa non ___ nessuno. (había)", ["c'era"], "*Non c'era nessuno* = no había nadie."),
   ("c", "«Había un parque cerca de mi casa.»", ["C'era un parco vicino a casa mia.", "C'è un parco vicino a casa mia.", "Ci era un parco vicino a casa mia."], 0, "Descripción del pasado: *c'era*."),
   ("c", "«Había dos bares en la plaza.»", ["C'erano due bar in piazza.", "C'era due bar in piazza.", "Ci sono due bar in piazza."], 0, "Plural en el pasado: *c'erano*."),
   ("c", "«De niño, en mi barrio había muchos niños.»", ["Da bambino, nel mio quartiere c'erano molti bambini.", "Da bambino, nel mio quartiere c'era molti bambini.", "Da bambino, nel mio quartiere ci sono molti bambini."], 0, "Plural (*molti bambini*) en el pasado: *c'erano*."),
   ("c", "¿Cuál de estas frases habla del pasado?", ["C'erano molte macchine.", "Ci sono molte macchine.", "C'è una macchina."], 0, "*C'erano* es imperfetto: describe el pasado.")]),
"piaciuto": ("u10", "Mi è piaciuto", "**Piacere en el pasado.** *Piacere* usa *essere* y concuerda con lo que gusta: *Mi è piaciuto il film.* (Me gustó la película.) *Mi è piaciuta la città.* *Mi sono piaciuti i musei.* *Mi sono piaciute le strade.* Para preguntar: *Ti è piaciuto il viaggio?*",
  [("Mi è piaciuto il film.", "Me gustó la película."), ("Mi sono piaciuti i musei.", "Me gustaron los museos."), ("Ti è piaciuta la città?", "¿Te gustó la ciudad?")],
  [("f", "Il film? Mi ___ piaciuto molto. (gustó)", ["è"], "*Piacere* en passato usa *essere*: *mi è piaciuto*."),
   ("f", "La città mi è ___ molto. (gustó, participio femenino)", ["piaciuta"], "La ciudad es femenino: *piaciuta*."),
   ("f", "I musei mi sono ___. (gustaron, participio)", ["piaciuti"], "Masculino plural: *piaciuti*."),
   ("c", "«Me gustó el viaje.»", ["Mi è piaciuto il viaggio.", "Mi ha piaciuto il viaggio.", "Mi è piaciuta il viaggio."], 0, "*Piacere* + *essere*; *viaggio* es masculino."),
   ("c", "«Me gustaron las calles.»", ["Mi sono piaciute le strade.", "Mi sono piaciuti le strade.", "Mi è piaciuta le strade."], 0, "*Strade* es femenino plural: *piaciute*."),
   ("c", "«¿Te gustó la pizza?»", ["Ti è piaciuta la pizza?", "Ti è piaciuto la pizza?", "Hai piaciuto la pizza?"], 0, "*Pizza* es femenino: *piaciuta*.")]),
"civuole": ("u14", "Ci vuole", "**Ci vuole / ci vogliono** = hace falta, se necesita (tiempo o cosas). *Ci vuole un'ora.* (Hace falta una hora.) *Ci vogliono due ore.* (Hacen falta dos horas.) *Quanto tempo ci vuole?* (¿Cuánto tiempo hace falta?) Va en singular con una cosa y en plural con varias.",
  [("Ci vuole un'ora per arrivare.", "Hace falta una hora para llegar."), ("Ci vogliono due documenti.", "Hacen falta dos documentos.")],
  [("f", "Per arrivare ___ un'ora. (hace falta, singular)", ["ci vuole"], "Singular: *ci vuole*."),
   ("f", "Per la torta ___ tre uova. (hacen falta)", ["ci vogliono"], "Plural: *ci vogliono*."),
   ("f", "Quanto tempo ___? (hace falta)", ["ci vuole"], "*Quanto tempo ci vuole?*"),
   ("c", "«Hacen falta dos horas.»", ["Ci vogliono due ore.", "Ci vuole due ore.", "Ci vuoi due ore."], 0, "Plural: *ci vogliono*."),
   ("c", "«Hace falta un documento.»", ["Ci vuole un documento.", "Ci vogliono un documento.", "Ci voglio un documento."], 0, "Singular: *ci vuole*.")]),
"tonici": ("u12", "Pronombres tónicos", "**Pronombres tónicos.** Después de una preposición (*con, per, di, da, a*) no se usan *mi, ti*, sino *me, te, lui, lei, noi, voi, loro*: *Vieni con me?* (¿Vienes conmigo?) *Questo regalo è per te.* *Esco con lui.* *Penso a voi.* Atención: *con me* y *con te* equivalen a «conmigo» y «contigo».",
  [("Vieni con me?", "¿Vienes conmigo?"), ("Questo regalo è per te.", "Este regalo es para ti."), ("Esco con lui e con lei.", "Salgo con él y con ella.")],
  [("f", "Questo regalo è per ___. (ti)", ["te"], "Después de *per*: *te*."),
   ("f", "Vieni con ___ al cinema? (mí)", ["me"], "*Con me* = conmigo."),
   ("f", "Esco con ___ domani. (ellos)", ["loro"], "*Con loro* = con ellos."),
   ("c", "«Es para nosotros.»", ["È per noi.", "È per ci.", "È per nostri."], 0, "Tras preposición: *noi*."),
   ("c", "«Voy con ella.»", ["Vado con lei.", "Vado con la.", "Vado con le."], 0, "Tónico: *lei*.")]),
"conect": ("u09", "prima, poi, dopo", "**Contar en orden.** Para ordenar lo que hiciste usa *prima* (primero), *poi* (luego), *dopo* (después) y *alla fine* (al final): *Prima ho mangiato, poi ho studiato.* *Dopo cena ho guardato un film.*",
  [("Prima ho mangiato, poi ho studiato.", "Primero comí, luego estudié."), ("Alla fine ho dormito.", "Al final dormí.")],
  [("f", "Prima ho mangiato, ___ ho studiato. (luego)", ["poi"], "*Poi* = luego."),
   ("f", "___ ho lavorato, poi ho mangiato. (primero)", ["Prima", "prima"], "*Prima* = primero."),
   ("c", "«Después de la cena vi una película.»", ["Dopo cena ho guardato un film.", "Dopo cena guardato ho un film.", "Dopo cena sono guardato un film."], 0, "*Dopo* + passato prossimo con *avere*.")]),
"ci_vediamo": ("u07", "Fórmulas con ci", "**Fórmulas con ci (nos).** Para despedirte o quedar con alguien: *Ci vediamo domani!* (¡Nos vemos mañana!) *Ci sentiamo stasera.* (Hablamos esta noche.) *Ci vediamo alle otto.* Por ahora apréndelas como frases hechas.",
  [("Ci vediamo domani!", "¡Nos vemos mañana!"), ("Ci sentiamo stasera.", "Hablamos esta noche.")],
  [("c", "Te despides de un amigo hasta mañana.", ["Ci vediamo domani!", "Mi vedo domani!", "Vedi domani!"], 0, "*Ci vediamo* = nos vemos."),
   ("c", "«Hablamos esta noche.»", ["Ci sentiamo stasera.", "Mi sento stasera.", "Sentiamo stasera."], 0, "*Ci sentiamo* = nos hablamos."),
   ("f", "___ vediamo alle otto! (nos)", ["Ci", "ci"], "*Ci vediamo* = nos vemos.")]),
"luogo": ("u02", "sopra, sotto", "**Dónde está algo.** *Sopra* (arriba / sobre), *sotto* (abajo / bajo), *davanti a* (delante de), *dietro* (detrás), *vicino a* (cerca de), *accanto a* (al lado de), *dentro* (dentro), *fuori* (fuera): *Il libro è sul tavolo.* *Il gatto è sotto la sedia.* *La banca è vicino alla piazza.*",
  [("Il gatto è sotto la sedia.", "El gato está bajo la silla."), ("La banca è vicino alla piazza.", "El banco está cerca de la plaza.")],
  [("f", "Il libro è ___ il tavolo. (sobre)", ["sopra"], "*Sopra* = sobre."),
   ("f", "Il gatto è ___ la sedia. (bajo)", ["sotto"], "*Sotto* = bajo."),
   ("c", "«El bar está al lado del banco.»", ["Il bar è accanto alla banca.", "Il bar è dentro alla banca.", "Il bar è sotto alla banca."], 0, "*Accanto a* = al lado de."),
   ("c", "«Estoy fuera de casa.»", ["Sono fuori casa.", "Sono dentro casa.", "Sono sopra casa."], 0, "*Fuori* = fuera.")]),
}
if __name__ == "__main__":
    for k in sys.argv[1:]:
        u, marker, p, ex, exs = D[k]; insert(u, marker, p, ex, exs)
