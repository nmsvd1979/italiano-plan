# Italiano — Plan de 12 semanas

App de una sola página (sin backend, sin login) para trackear el plan diario de
italiano de 3 meses. Todo el progreso se guarda en `localStorage` del
navegador, en tu dispositivo.

## Cómo correrla

No hace falta build ni instalar dependencias. Las notificaciones y el
Service Worker (necesario para instalarla como PWA) requieren `http://`,
no funcionan abriendo el archivo directamente con `file://`. Por eso lo más
simple es levantar un servidor estático local:

```bash
cd "Italiano"
python3 -m http.server 8000
```

Y abrir `http://localhost:8000` en el navegador (o `http://localhost:8000`
desde el celular si está en la misma red, reemplazando `localhost` por la IP
de tu compu).

Alternativas equivalentes si tenés Node:

```bash
npx serve .
```

## Instalarla como PWA en el celular

1. Abrí la URL del servidor local en Chrome/Safari del celular (misma red WiFi).
2. Chrome (Android): menú ⋮ → "Instalar app" / "Agregar a pantalla de inicio".
3. Safari (iOS): botón compartir → "Agregar a pantalla de inicio".
4. Se abre como app standalone, sin barra del navegador.

## Primer uso

Al abrir la app por primera vez te pide la **fecha de inicio** del plan.
A partir de ahí calcula sola en qué semana (1-12), fase (1, 2 o 3) y día
del plan estás, y te muestra el checklist de hoy.

## Editar el plan

Todo el contenido del plan (actividades por día, minutos, links a recursos,
fases, checkpoints) vive en [`plan.js`](plan.js), con comentarios explicando
cada sección. No hace falta tocar `app.js` (la lógica) para ajustar el plan.

## Notificaciones — limitación importante

El recordatorio diario usa la `Notification API` del navegador. Esto
**solo funciona mientras la pestaña o la PWA instalada está abierta, o en
segundo plano según lo que permita tu navegador/sistema operativo**. No hay
servidor ni Push API configurado, así que si cerrás la app por completo no
vas a recibir el aviso — es una limitación real de una app sin backend, no
un bug. Se explica también en la propia app (sección Configuración) y en
comentarios dentro de `app.js` y `sw.js`.

## Datos y privacidad

No hay cuentas, ni sincronización entre dispositivos, ni llamadas a
servidores propios. Todo el progreso vive en el `localStorage` de ese
navegador/dispositivo. Borrar datos del sitio o desinstalar la PWA borra
el progreso.

## Estructura de archivos

```
index.html   → esqueleto de la página
style.css    → estilos (mobile-first, soporta modo oscuro)
plan.js      → CONFIGURACIÓN DEL PLAN (editable)
app.js       → lógica de la app (fechas, checklist, streak, heatmap, notif.)
manifest.json→ metadata de la PWA
sw.js        → service worker (cache offline del app shell)
icons/       → íconos para instalación como PWA
```
