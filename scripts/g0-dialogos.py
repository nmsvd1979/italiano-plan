#!/usr/bin/env python3
"""G0 — alarga los diálogos de u01–u15 a 60–120 palabras (H-all-05) insertando líneas en un punto concreto del diálogo
(después de la línea n, contando desde 0) para que la conversación siga siendo coherente. Idempotente. Uso: python3 scripts/g0-dialogos.py"""
import re, os, json
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, "src/content/dialogues.ts")
q = lambda s: json.dumps(s, ensure_ascii=False)
# unidad: [(después_de_la_línea, [(quien, it, es), …]), …]
X = {
"u01": [(3, [("A","Di dov'è, signora?","¿De dónde es, señora?"),("B","Sono di Santiago, in Cile.","Soy de Santiago, en Chile."),("A","Ah, il Cile! Lei parla bene italiano!","¡Ah, Chile! ¡Usted habla bien italiano!"),("B","Grazie, ma studio ancora.","Gracias, pero todavía estoy estudiando.")])],
"u02": [(3, [("A","Hai anche un balcone?","¿Tienes también un balcón?"),("B","Sì, c'è un balcone piccolo con due sedie.","Sí, hay un balcón pequeño con dos sillas."),("A","Ci sono molti studenti nel palazzo?","¿Hay muchos estudiantes en el edificio?"),("B","Sì, ci sono tre studenti e un signore simpatico.","Sí, hay tres estudiantes y un señor simpático.")])],
"u03": [(3, [("A","Scusi, a che ora arriva a Firenze?","Disculpe, ¿a qué hora llega a Florencia?"),("B","Arriva alle venti e dieci.","Llega a las 20:10."),("A","Perfetto. Da quale binario parte?","Perfecto. ¿De qué andén sale?"),("B","Dal binario sette. Ha ancora venti minuti.","Del andén siete. Todavía tiene veinte minutos.")])],
"u04": [(4, [("B","Il cornetto è molto buono, e il cappuccino è perfetto!","¡El cornetto está muy rico, y el capuchino está perfecto!"),("A","Grazie! Vuole un altro caffè?","¡Gracias! ¿Quiere otro café?"),("B","No, grazie. Devo lavorare tra dieci minuti.","No, gracias. Tengo que trabajar en diez minutos."),("A","Va bene, allora buon lavoro!","Está bien, ¡entonces buen trabajo!")])],
"u05": [(3, [("A","Devo attraversare la piazza?","¿Tengo que cruzar la plaza?"),("B","Sì, attraversi la piazza e poi vada dritto.","Sí, cruce la plaza y luego siga derecho.")]),
        (4, [("B","Ha già il biglietto per Firenze?","¿Ya tiene el boleto / pasaje a Florencia?"),("A","No, devo comprarlo in stazione. Costa molto?","No, tengo que comprarlo en la estación. ¿Cuesta mucho?"),("B","Circa dieci euro. La biglietteria è vicino all'ingresso.","Unos diez euros. La boletería está cerca de la entrada."),("A","Perfetto, grazie mille!","Perfecto, ¡muchas gracias!")])],
"u06": [(4, [("B","Questa giacca verde è troppo grande, ma il colore è bello.","Esta chaqueta verde me queda muy grande, pero el color es bonito."),("A","Ecco una taglia più piccola, in verde.","Aquí tiene una talla más pequeña, en verde."),("B","Questa è perfetta! Ha anche una camicia bianca?","¡Esta es perfecta! ¿Tiene también una camisa blanca?"),("A","Sì, ecco. Costa venti euro.","Sí, aquí tiene. Cuesta veinte euros.")])],
"u07": [(1, [("A","Che cosa stai preparando?","¿Qué estás preparando?"),("B","Faccio la pasta. Poi mi lavo e mi riposo un po'.","Hago pasta. Luego me lavo y descanso un poco."),("A","Beata te! Io ho ancora molto da fare.","¡Qué suerte tienes! Yo todavía tengo mucho que hacer."),("B","Che cosa fai?","¿Qué haces?")])],
"u09": [(3, [("A","Dove avete mangiato?","¿Dónde comieron?"),("B","In un ristorante vicino alla piazza. Abbiamo pagato poco.","En un restaurante cerca de la plaza. Pagamos poco."),("A","Avete bevuto anche il vino?","¿Tomaron también vino?"),("B","Sì, ho bevuto un bicchiere di vino rosso.","Sí, tomé una copa de vino tinto.")])],
"u10": [(5, [("A","Che cosa avete visitato?","¿Qué visitaron?"),("B","Un museo e due chiese. Abbiamo mangiato benissimo.","Un museo y dos iglesias. Comimos muy bien."),("A","Hai comprato qualcosa?","¿Compraste algo?"),("B","Sì, ho comprato un regalo per mia madre.","Sí, compré un regalo para mi madre.")])],
"u11": [(5, [("A","E d'estate andavate al mare?","¿Y en verano iban a la playa?"),("B","Sì, andavamo al mare con i nonni. Faceva sempre caldo e c'era molta gente sulla spiaggia.","Sí, íbamos a la playa con los abuelos. Siempre hacía calor y había mucha gente en la playa.")])],
"u12": [(7, [("A","Sì, anche delle arance. Sono più dolci delle mele?","Sí, también unas naranjas. ¿Son más dulces que las manzanas?"),("B","Sì, e costano meno: due euro al chilo.","Sí, y cuestan menos: dos euros el kilo."),("A","Allora due chili di arance, per favore.","Entonces dos kilos de naranjas, por favor."),("B","Ecco. Altro?","Aquí tiene. ¿Algo más?")])],
"u13": [(3, [("A","Posso vedere anche quella blu, per favore?","¿Puedo ver también esa azul, por favor?"),("B","Certo, ecco. Ma questa nera è più elegante.","Claro, aquí tiene. Pero esta negra es más elegante.")]),
        (6, [("B","Allora paga solo la differenza: dieci euro.","Entonces paga solo la diferencia: diez euros."),("A","Va bene. Ecco i soldi, grazie!","Está bien. Aquí tiene el dinero, ¡gracias!"),("B","Grazie a Lei, arrivederci!","Gracias a usted, ¡hasta luego!")])],
"u14": [(5, [("A","C'è un autobus?","¿Hay un autobús?"),("B","Sì, l'autobus numero cinque. Ci vogliono tre minuti, ma a piedi è più bello.","Sí, el autobús número cinco. Se demora tres minutos, pero a pie es más bonito."),("A","Quanto costa il biglietto?","¿Cuánto cuesta el boleto?"),("B","Costa un euro e cinquanta.","Cuesta un euro con cincuenta.")])],
"u15": [(1, [("A","Quanto tempo resterai?","¿Cuánto tiempo te quedarás?"),("B","Resterò sei mesi. Prima farò un corso, poi cercherò un lavoro.","Me quedaré seis meses. Primero haré un curso, luego buscaré un trabajo.")]),
        (5, [("A","Quando partirai?","¿Cuándo partirás?"),("B","Partirò a marzo. Sarò molto contenta!","Partiré en marzo. ¡Estaré muy contenta!")])],
"u18": [(3, [("A","Vuole una camera singola o doppia?","¿Quiere una habitación individual o doble?"),("B","Doppia, per favore. C'è la colazione?","Doble, por favor. ¿Incluye el desayuno?")])],
"u22": [(3, [("A","Penso che il treno sia più comodo della macchina.","Pienso que el tren es más cómodo que el auto."),("B","Credo che tu abbia ragione.","Creo que tienes razón.")])],
"u23": [(5, [("A","Se avessi più soldi, comprerei una casa al mare.","Si tuviera más dinero, compraría una casa en la playa."),("B","Anch'io! Se fossi ricca, vivrei in Sicilia.","¡Yo también! Si fuera rica, viviría en Sicilia.")])],
}
s = open(P, encoding="utf8").read()
# u08: se parte la línea 4 para poder agregar lo del trabajo
O4 = 'l("A", "Ho ventotto anni. Perché studi italiano?"'
if O4 in s:
    m = re.search(r'l\("A", "Ho ventotto anni\. Perché studi italiano\?", "([^"]*)"\)', s)
    s = s.replace(m.group(0), 'l("A", "Ho ventotto anni.", "Tengo 28 años."),\n      l("B", "Che lavoro fai?", "¿En qué trabajas?"),\n      l("A", "Sono maestra. Lavoro con i bambini ogni giorno.", "Soy maestra. Trabajo con niños todos los días."),\n      l("B", "Ti piace il tuo lavoro?", "¿Te gusta tu trabajo?"),\n      l("A", "Sì, molto, ma non ho mai tempo libero. Perché studi italiano?", "Sí, mucho, pero nunca tengo tiempo libre. ¿Por qué estudias italiano?")')
for u, ins in X.items():
    m = re.search(r"\n  %s: \{\n(.*?)\n    \],\n  \}," % u, s, re.S)
    blk = m.group(1)
    if ins[0][1][0][1] in blk: continue
    head, _, body = blk.partition("lines: [")
    rows = re.findall(r"\n      l\(.*?\),(?=\n      l\(|\Z)", body + "\n", re.S) or []
    rows = [r for r in re.split(r"(?<=\),)\n", body.strip("\n")) if r.strip()]
    rows = [r if r.startswith("      ") else "      " + r.strip() for r in rows]
    for after, lines in sorted(ins, key=lambda t: -t[0]):
        new = ["      l(%s, %s, %s)," % (q(w), q(a), q(b)) for w, a, b in lines]
        rows[after + 1:after + 1] = new
    s = s[:m.start(1)] + head + "lines: [\n" + "\n".join(rows) + s[m.end(1):]
open(P, "w", encoding="utf8").write(s)
print("ok")
