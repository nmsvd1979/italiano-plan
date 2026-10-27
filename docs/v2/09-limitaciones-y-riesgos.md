# Limitaciones y riesgos (qué no se puede verificar desde la nube y cómo se mitiga)

| Tema | Limitación | Mitigación |
|---|---|---|
| Offline en iPhone | No se reprodujo el fallo; las causas son hipótesis (`01`) | Separar app y audio, gestor de descarga, diagnóstico copiable, prueba guiada en el iPhone |
| Cuota y desalojo en iOS | El tamaño máximo y la política de desalojo de una PWA instalada no están verificados | Pedir `persist()`, mostrar el estado, medir `storage.estimate()`, presupuesto de tamaño, probar a los 7 días |
| Audio con peticiones Range | No verificado en Safari con respuestas del service worker | `rangeRequests: true` y prueba 206 en Chromium; prueba real en iPhone |
| Voz del sistema | Depende de las voces instaladas en el iPhone; no se escucha desde la nube | Prueba A/B, selector de voz, audio nativo o sintético como principal |
| Licencia de voces y listas | No se verificó ninguna voz neuronal ni lista de frecuencia | Comprobar ficha de licencia antes de usar; no usar lo dudoso |
| Micrófono en PWA | Permisos y formatos de `MediaRecorder` no verificados en el iPhone del usuario | Modo sin grabación, selección de `mimeType`, prueba real |
| Corrección del italiano | No hay hablante nativo ni será posible conseguirlo; el contenido lo redacta un modelo | Verificación con fuentes comprobables (V1 automático, V2 fuente, V3 segunda pasada; `auditoria/_verificacion.md`), dudas documentadas, audio solo de lo confirmado. **Riesgo residual:** naturalidad y registro que ninguna fuente escrita confirma |
| Nivel MCER por contenido | Una sola fuente verificada (USC, programa B1) y no es el MCER oficial | Decisión del usuario sobre u20–u23, segunda fuente cuando sea accesible |
| Eficacia pedagógica | La evidencia de producción y pronunciación es débil (`Principios`); los umbrales 75/70/80 % son criterio propio | Medir con datos reales y ajustar tras cuatro unidades |
| Carga del plan | 7 días × 30 min es una estimación, no una medición | Registro de minutos (fase F) y modo corto |
| Silencio de iOS | Si el interruptor de silencio apaga el audio de la app no está verificado | Anotarlo en la prueba del iPhone y avisar en Ajustes si se detecta |
| Sin backend | No hay recordatorios push ni sincronización entre dispositivos | Archivo `.ics` con evento diario; respaldo manual (ya existe) |
| Respaldo | Las grabaciones (IndexedDB) no entran en la copia | Aviso en Ajustes; solo se guardan las últimas |
| Quizlet | El plan depende de que el repaso propio sea mejor para sacarlo | Criterio de salida de tres condiciones (`02`) |

## Orden de riesgo
1. Que el offline siga fallando (bloquea todo el uso).
2. Que el contenido nuevo tenga errores de italiano (se fijan en audio).
3. Que el peso total supere lo que iOS permite guardar.
4. Que el ciclo de 7 días sea demasiado largo en la práctica (se detecta con el registro).
