# Auditoría de eficacia: criterio para decidir qué construir

Objetivo de la app: que Nicolás aprenda italiano (A0→A2) lo más rápido y mejor posible, en ~30 min al día, **sin pagos**. Esta auditoría se aplica a toda función nueva **antes** de desarrollarla.

## Las 5 preguntas obligatorias
1. **Evidencia:** ¿qué dice la investigación sobre esta técnica? (fuente, o marcarla «criterio propio / sin verificar»).
2. **Límites:** ¿qué impide hacerla bien en una PWA instalada en iPhone, sin servidor?
3. **Alternativa:** si hay límite, ¿qué opción lo corrige, idealmente gratis y de código abierto?
4. **Costo:** esfuerzo de desarrollo, mantenimiento, dinero y datos del usuario.
5. **Medida:** ¿cómo sabremos que ayuda? (aciertos, retención a 7 días, constancia, autoevaluación).

Regla: lo que no se pudo verificar se escribe como no verificado; no se presenta como hecho.

## Límites reales de la plataforma (PWA en iPhone, sin servidor)
| Límite | Qué se sabe | Cómo se mitiga |
|---|---|---|
| Almacenamiento | WebKit: el almacenamiento puede borrarse por presión de disco o falta de uso; se puede pedir modo persistente con `navigator.storage.persist()`, y WebKit lo aprueba con más facilidad si la app está en la pantalla de inicio (webkit.org, «Updates to Storage Policy»). Un blog sobre PWA en iOS afirma además un borrado a los 7 días sin abrir y un tope de 50 MB; **la fuente oficial no confirma ninguna de las dos cifras: tratarlas como riesgo, no como hecho.** | Pedir `persist()`, abrir la app a menudo, **copia de seguridad exportable** (tarea 6) y recordatorio de copia. |
| Notificaciones | Web push en iOS exige iOS 16.4+ y app instalada; además necesita un servidor que envíe el push. Sin servidor no hay notificaciones fiables. No hay sincronización en segundo plano. | Insignia/aviso «repasos de hoy» dentro de la app; archivo `.ics` con evento diario recurrente para el calendario del iPhone (gratis, sin servidor). |
| Reconocimiento de voz | `SpeechRecognition` en PWA instalada: **no verificado**, no depender de él. | Grabar con `MediaRecorder` y autoevaluarse comparando con el audio nativo. Probar en el iPhone real. |
| Audio | Safari exige gesto del usuario para reproducir. | Reproducir siempre desde un toque. |
| Voz italiana del sistema | Depende de que el iPhone tenga instalada una voz it-IT. | Indicar en Ajustes cómo instalarla; mantener audio nativo como primera opción. |

## Función por función
| Función | Evidencia | Límite o riesgo | Mejor opción (gratis) | Estado |
|---|---|---|---|---|
| **Repaso de vocabulario** | Recuperar de memoria rinde más que releer (Roediger y Karpicke, 2006) y espaciar supera a amontonar (Cepeda et al., 2006, 317 experimentos), según un resumen de Migaku (fuente comercial). FSRS pide 20–30 % menos repasos que SM-2 a igual retención (misma fuente; no verificado en la fuente original). | El repaso actual (`review.ts`, cajas de Leitner) solo cubre ejercicios errados, no vocabulario. | **FSRS dentro de la app** (`ts-fsrs`, algoritmo abierto; **confirmar licencia** en npm antes de instalar). Una tarjeta por palabra con frase y audio; italiano→español y español→italiano escribiendo; máx. 8 palabras nuevas/día al inicio. Parámetros por defecto hasta tener cientos de repasos. | Por construir |
| **Quizlet** | Su modo Aprender repite dentro de la sesión; su agenda entre sesiones no es pública (blog Notelyn). | Set de 1400 términos temáticos, muchos de nivel avanzado (ver `docs/quizlet-cruce.md`). | Opcional. La app ya exporta cada unidad en formato de importación (`toQuizletText`). | Complemento |
| **Vocabulario por frecuencia** | Las palabras más frecuentes dan más cobertura de lo que se lee y oye (criterio general; fuente específica por añadir). | Falta cubrir ~750 palabras para llegar a ~1200 activas. | Lista de frecuencia abierta, licencia a confirmar; reparto por unidad por tema. | Por construir |
| **Shadowing** | Más repeticiones mejoran comprensión auditiva y memoria de expresiones; mejora de velocidad de repetición y procesamiento de abajo hacia arriba sin importar las repeticiones (estudio cuasi-experimental, 30 estudiantes, sin grupo control; JALT). | Evidencia limitada. Videos sin revisar a mano; subtítulos automáticos. | Transcribir con Whisper y medir ritmo real (tarea 5); escuchar solo los dudosos. | En curso |
| **Dictado** | Entrena procesamiento de abajo hacia arriba (mismo estudio, prueba dictation-cloze). | Dictado con voz sintética no entrena el oído nativo. | Usar audio nativo donde exista. | Revisar |
| **Pronunciación** | Contraste de pares mínimos es práctica estándar; no hay verificación automática. | Faltan audios de 35 palabras; pares b/v incompletos. | Tarea 4 (pares) + grabación y autoevaluación. | En curso |
| **Gramática** | Criterio propio: ejemplos primero, luego regla, luego ejercicio. | Sin cloze espaciado. | Tarjetas cloze con FSRS para estructuras clave. | Por evaluar |
| **Escritura / diálogos** | Producción activa: criterio propio, sin fuente verificada. | Sin corrección por nativo. | Modelo de comparación y revisión humana puntual. | Mantener |
| **Plan, ritmo y motivación** | Criterio propio. | Recordatorios limitados en iPhone. | `.ics` diario, insignia en la app. | Por mejorar |
| **Copia de seguridad** | Prerrequisito: protege el estado del repaso. | Compartir archivos y `persist()` en la PWA del iPhone: **no verificado** (ver PR de la tarea 6). | Exportar/importar JSON en Ajustes, aviso a los 14 días, `persist()` al abrir. | Hecho; falta probar en iPhone |

## Orden de construcción recomendado
1. Tareas 4, 5 y 6 (pares b/v, transcripciones de videos, copia de seguridad).
2. Repaso de vocabulario con FSRS dentro de la app.
3. Lista de frecuencia y ampliación a ~1200 palabras activas.
4. Grabación de voz con autoevaluación, recordatorio `.ics`, test de nivel.

## Pendiente de verificar (no dar por cierto)
- Licencia de `ts-fsrs`.
- Persistencia real del almacenamiento en el iPhone de Nicolás.
- `MediaRecorder` y voz italiana del sistema en su iPhone.
- Cifras de FSRS frente a SM-2.
