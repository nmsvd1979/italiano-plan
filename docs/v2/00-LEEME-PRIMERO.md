# Plan v2 de la app — léelo completo antes de tocar código

Este directorio es la especificación para reconstruir la app como el mejor material posible para aprender italiano A0→A2 (con puente a B1 solo de reconocimiento). La base pedagógica y las fuentes están en el documento «Arquitectura pedagógica de la app de italiano» (Claude Docs: https://claude.ai/artifact/SRFK6vAwTiXuaWNeJK3pZj). Aquí está la parte técnica y de contenido, con criterios de aceptación.

## Archivos
- `00-LEEME-PRIMERO.md` — reglas, decisiones del usuario, orden de pull requests, límites de la plataforma.
- `01-fase-A-offline.md` — la app no cargaba sin conexión en el iPhone. Es lo primero.
- `02-fase-B-srs.md` — repaso espaciado propio (reemplaza a Quizlet en el plan diario).
- `03-fase-C-audio.md` — audio de frases, diálogos y textos.
- `04-fase-D-ciclo-7-dias.md` — nuevo plan diario, modo corto, «hacer más hoy», reclasificación de u20–u23.
- `05-fase-E-produccion.md` — grabar y comparar, dictado, escritura, diálogo.
- `06-fase-F-evaluacion.md` — mini-pruebas, prueba de fase, prueba de nivel, panel.
- `07-fase-G-contenido.md` — esquemas de datos, cuotas por unidad, proceso de redacción y control de calidad.
- `08-auditoria-unidades.md` — resumen de la auditoría de las 24 unidades (el detalle está en `auditoria/`).
- `13-arquitectura-final.md` — **el temario y el orden vigentes**: semanas, unidades nuevas, partes A/B, puente a B1, cómo se enseña cada cosa.
- `14-continuidad-progreso.md` — cómo la app usa lo que ya estudiaste para no repetirte nada (diagnóstico, siembra del repaso, puesta al día).
- `09-limitaciones-y-riesgos.md` — qué no se puede verificar desde la nube y cómo se mitiga.
- `10-prompts-para-code.md` — un prompt por fase para pegar en Claude Code.
- `11-plan-maestro-vivo.md` — **orden vigente de construcción**, carriles y dependencias, revisiones con datos, reglas de propagación y registro de cambios. Si hay conflicto con otro archivo, manda este (y `13` para el temario).
- `12-protocolo-auditoria.md` — qué se audita, criterios, procedimiento y formato de hallazgos.
- `auditoria/` — métricas automáticas por unidad (`npm run audit`), `_veredictos.md` (juicio de las 24 unidades), `_temario.md` (macro), `_backlog.md`.

## Reglas que no cambian (CLAUDE.md manda)
1. Nunca push a `main`. Una rama y un pull request por tema. Antes de abrir el PR: `npm test` y `npm run build` en verde.
2. Sin backend, sin cuentas, sin rastreo, sin servicios de pago.
3. No borrar progreso ni cambiar claves `italianPlan.*` sin migración con prueba. El respaldo (`src/domain/backup.ts`) copia todas las claves `italianPlan.*` de `localStorage`: todo dato nuevo que deba viajar en la copia se guarda en `localStorage` (con prefijo), no en IndexedDB. Lo que va a IndexedDB (grabaciones) queda fuera de la copia y se avisa en Ajustes.
4. Español neutro con tuteo, sin voseo (`lang.test.ts`).
5. Contenido en italiano: no inventar. Dudas a `docs/dudas-italiano.md`.
6. No marcar como verificado lo que no se probó en un iPhone real (ver `09`).

## Decisiones del usuario (27-oct-2026)
- Sin conexión: el síntoma real fue «simplemente no cargaba la app». Se trata como fallo de instalación del service worker (hipótesis principal en `01`).
- Auditoría total: todas las unidades de 1 a 24 se revisan con el mismo rigor (`08`). Nada se da por bueno por estar ya escrito.
- Audio: sirve voz neuronal generada de antemano (marcada como sintética) y también la voz del iPhone si funciona mejor. Se decide con una prueba A/B de oído (`03`).
- Escritura: la corrección con modelo es manual (copiar a Claude y pegar la versión corregida).
- Ritmo: lo que sea mejor, siempre con la opción de hacer más en un día (`04`).
- Quizlet: se saca del plan diario solo cuando el repaso propio esté funcionando y sea mejor; mientras tanto se mantiene. El mazo de 1400 términos se puede importar como mazo extra.
- **Avance real:** unidad 1, sesiones 1 a 5 hechas (17 de 22 actividades); sin copia de seguridad previa y no es posible hacerla (`14`, §1).
- **D-01** aceptada. **D-02** (32 semanas) y **D-03** (diagnóstico): mantenidas tras revisarlas con evidencia (`13`, «Calendario y evidencia»; `14`, §1). **D-04** (revisión nativa): no es posible; se reemplaza por verificación con fuentes comprobables (`auditoria/_verificacion.md`).
- Para el usuario, lo pendiente es mínimo: probar el offline cuando le sirva (no es urgente porque suele tener internet), y escuchar solo dos videos si se pide. Todo lo demás lo revisa Claude con fuentes.

## Orden de pull requests (resumen; el orden vigente y las dependencias están en `11-plan-maestro-vivo.md`, §3. No hay piloto: se construye todo y la app se puede usar en cada fusión)
1. A — offline (PR propio; el usuario prueba en iPhone antes de seguir).
2. B — SRS.
3. C — audio (primero la prueba A/B, luego la generación en lote).
4. D — ciclo de 7 días (depende de H1, B y de la partición A/B de G2; usa el contenido existente como base mientras G escribe lo nuevo).
5. E — producción.
6. F — evaluación.
7. G — contenido: corre en paralelo desde el principio, en carriles G0–G7 (`11`, §2). H1 (curso y datos) y H2 (continuidad con tu progreso) son fases nuevas.

## Estado actual del código (para no re-descubrirlo)
- `vite.config.ts`: precache de `**/*.{js,css,html,woff2,png,mp3}` → 605 archivos, ~10,5 MB, 588 mp3, todo en la instalación del service worker.
- `src/content/curriculum.ts` `sessionsOf()`: 6 sesiones por unidad (~235 min).
- `src/domain/review.ts`: Leitner solo para ejercicios fallados.
- Vocabulario: `src/content/vocab.json`, 488 palabras (`{it, es}` por unidad), sin frase, sin audio propio por palabra salvo Lingua Libre.
- `src/app/offline.ts` ya detecta si el service worker controla la página (reutilizar).
