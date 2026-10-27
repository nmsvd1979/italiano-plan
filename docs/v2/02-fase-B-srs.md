# Fase B — Repaso espaciado propio (reemplaza a Quizlet en el plan diario)

## Por qué
Hoy el repaso de vocabulario depende de Quizlet (externo, de pago en sus funciones útiles, sin conexión limitada) y la app solo repasa ejercicios fallados con Leitner. Un repaso con recuperación activa y espaciado es la pieza mejor respaldada del plan (ver «Principios» en el documento de arquitectura). Se construye dentro de la app, gratis y sin conexión.

## Criterio para sacar Quizlet del plan diario
Se saca solo cuando se cumplan las tres condiciones: (1) el repaso propio está en Hoy y funciona sin conexión, (2) tiene tarjetas de producción y de escucha (Quizlet gratuito no hace dictado), (3) el usuario completó una semana con él. Antes, Quizlet se mantiene. El archivo `data/quizlet-1400.json` se ofrece como «Mazo extra» importable (ver B6).

## B1. Algoritmo
- Paquete `ts-fsrs` (licencia MIT verificada en npm: versión 5.4.2). Versión fijada en `package.json`.
- Parámetros: `request_retention: 0.9`, `maximum_interval: 180`, `enable_fuzz: true`.
- API: `const f = fsrs(generatorParameters({...}))`; `f.next(card, now, Rating.Good)` devuelve `{card, log}`. Las fechas se guardan como ISO 8601.
- Si por algún motivo no se puede usar el paquete: Leitner ampliado con intervalos 1, 2, 4, 8, 16, 32, 64 días (y sin parámetros inventados de FSRS).

## B2. Modelo de datos
Clave nueva `italianPlan.srs.v1` en `localStorage` (para que el respaldo la incluya). Tamaño estimado para 1200 tarjetas: < 400 KB.
```ts
type CardKind = "recog" | "prod" | "cloze" | "listen";
interface SrsCard {
  id: string;            // `${kind}:${itemId}`
  kind: CardKind;
  itemId: string;        // id de palabra o de frase (ver 07)
  unit: string;          // "u04"
  fsrs: { due: string; stability: number; difficulty: number; elapsed_days: number;
          scheduled_days: number; reps: number; lapses: number; state: number; last_review?: string };
  createdAt: string;
}
interface SrsLogEntry { cardId: string; at: string; rating: 1|2|3|4; ms: number; }
interface SrsState { version: 1; cards: Record<string, SrsCard>; log: SrsLogEntry[]; /* máx. 3000, se recorta */ }
```
Migración: crear la clave vacía si no existe; no tocar `review.ts` ni sus claves. Actualizar `backup.ts` si hace falta contar las tarjetas en el resumen (sin cambiar `BACKUP_VERSION` de forma incompatible: la copia antigua debe seguir importándose).

## B3. Tipos de tarjeta
1. **recog** (reconocer): suena la palabra y su frase; se elige el significado entre 3–4 opciones (distractores de la misma unidad). Es la primera tarjeta de cada palabra.
2. **prod** (producir): se ve el significado en español (y la etiqueta de género/categoría) y se escribe la palabra con artículo y tildes. Se desbloquea cuando la tarjeta `recog` de esa palabra llega a `stability >= 4` días.
3. **cloze** (completar): una frase de la unidad con la palabra o forma gramatical meta en blanco (`___`), con el significado de la frase en español.
4. **listen** (escuchar): suena una frase y se escribe; solo para frases con audio.

## B4. Calificación
- Opción múltiple: correcta = Good; correcta pero tras pedir pista = Hard; incorrecta = Again.
- Escritura: exacta = Good; solo falta tilde o apóstrofo = Hard (se muestra la forma correcta); cualquier otra = Again.
- Botón «Me equivoqué al escribir» (cambia Again → Hard) y «Fácil» (Good → Easy) disponibles tras responder.
- Siempre se muestra la respuesta correcta y la frase completa con audio antes de pasar a la siguiente.

## B5. Cola diaria
- Orden: vencidas primero (más atrasadas antes), luego nuevas.
- Máximo 8 palabras nuevas por día; si la cola de vencidas supera 40, no se introducen nuevas; tras 3 días sin abrir la app, las vencidas visibles se limitan a +30 % de lo habitual y el resto se pospone (se anuncia en pantalla).
- Sesión objetivo: 5 minutos ≈ 20 tarjetas; botón «Seguir repasando» para hacer más, con aviso al llegar a 60.
- Las tarjetas nuevas solo salen de palabras ya mostradas en el bloque «Palabras nuevas» del plan (ver `04`).
- Lo que falle en ejercicios de práctica o dictado entra como tarjeta `cloze` o `listen` (reemplaza el Leitner actual; `review.ts` se conserva hasta migrar y luego se retira con una prueba que garantice que no se pierde nada).

## B6. Mazo extra de Quizlet
Importar `data/quizlet-1400.json` como mazo opcional («Mazo extra»), solo tarjetas `recog`, con tope de 5 nuevas al día, desactivado por defecto. No se mezcla con el mazo de la unidad hasta que el usuario lo active. Registrar el origen (`deck: "quizlet"`).

## B7. Pantalla
`src/features/srs/ReviewScreen.tsx`: una tarjeta por pantalla, botón de audio grande, indicador «12 de 20», salir en cualquier momento sin perder lo respondido (se guarda tarjeta a tarjeta). Accesible: tamaños táctiles ≥ 44 px.

## Pruebas
- Calificación y normalización de tildes/apóstrofos (`é`/`e`, `l'ho`/`lho`).
- Cola: tope de nuevas, bloqueo con cola > 40, tope tras 3 días ausente.
- Serialización: guardar y cargar, y que el respaldo exportado e importado conserve las tarjetas.
- Simulación (patrón de `simulation.test.ts`): 60 días con 8 nuevas diarias y 90 % de aciertos no supera, en promedio, 60 repasos por día después del día 30. Si lo supera, bajar el tope de nuevas.

## Criterios de aceptación
Repaso diario de 5 minutos funcionando sin conexión; datos incluidos en el respaldo; los cuatro tipos de tarjeta; simulación en verde.
