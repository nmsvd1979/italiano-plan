/**
 * app.js — Lógica de la app (no hace falta tocar esto para editar el plan,
 * ver plan.js para eso).
 */
(function () {
  "use strict";

  var CONFIG = window.PLAN_CONFIG;
  var LS_START_DATE = "italianPlan.startDate";
  var LS_COMPLETIONS = "italianPlan.completions";
  var LS_SETTINGS = "italianPlan.settings";
  var LS_LAST_NOTIFIED = "italianPlan.lastNotifiedDate";

  var root = document.getElementById("app-root");
  var isFirstRender = true;

  // ---------------- Icons ----------------
  // Set de íconos de línea (estilo Phosphor, viewBox 256x256, fill sólido)
  // portado del canvas de diseño. Cada valor es el "d" de un <path>, salvo
  // los que tienen "html" (ícono armado con más de una forma).
  var ICONS = {
    drop: "M176.69,48.72a225,225,0,0,0-42.52-35,12,12,0,0,0-12.34,0,225,225,0,0,0-42.52,35C51,78.47,36,111.42,36,144a92,92,0,0,0,184,0C220,111.42,205,78.47,176.69,48.72ZM100,184c0-13.33,5.53-26.26,16.45-38.45A93,93,0,0,1,128,134.72a93,93,0,0,1,11.55,10.83C150.47,157.74,156,170.67,156,184a28,28,0,0,1-56,0Zm79.84,3.94c.09-1.3.16-2.61.16-3.94,0-46.26-44-73.17-45.83-74.29a12,12,0,0,0-12.34,0C120,110.83,76,137.74,76,184c0,1.33.07,2.64.16,3.94A67.68,67.68,0,0,1,60,144c0-26.52,12.21-52.86,36.28-78.3A213.07,213.07,0,0,1,128,38.39C145.82,50.86,196,90.71,196,144A67.68,67.68,0,0,1,179.84,187.94Z",
    gear: "M128,76a52,52,0,1,0,52,52A52.06,52.06,0,0,0,128,76Zm0,80a28,28,0,1,1,28-28A28,28,0,0,1,128,156Zm113.86-49.57A12,12,0,0,0,236,98.34L208.21,82.49l-.11-31.31a12,12,0,0,0-4.25-9.12,116,116,0,0,0-38-21.41,12,12,0,0,0-9.68.89L128,37.27,99.83,21.53a12,12,0,0,0-9.7-.9,116.06,116.06,0,0,0-38,21.47,12,12,0,0,0-4.24,9.1l-.14,31.34L20,98.35a12,12,0,0,0-5.85,8.11,110.7,110.7,0,0,0,0,43.11A12,12,0,0,0,20,157.66l27.82,15.85.11,31.31a12,12,0,0,0,4.25,9.12,116,116,0,0,0,38,21.41,12,12,0,0,0,9.68-.89L128,218.73l28.14,15.74a12,12,0,0,0,9.7.9,116.06,116.06,0,0,0,38-21.47,12,12,0,0,0,4.24-9.1l.14-31.34,27.81-15.81a12,12,0,0,0,5.85-8.11A110.7,110.7,0,0,0,241.86,106.43Zm-22.63,33.18-26.88,15.28a11.94,11.94,0,0,0-4.55,4.59c-.54,1-1.11,1.93-1.7,2.88a12,12,0,0,0-1.83,6.31L184.13,199a91.83,91.83,0,0,1-21.07,11.87l-27.15-15.19a12,12,0,0,0-5.86-1.53h-.29c-1.14,0-2.3,0-3.44,0a12.08,12.08,0,0,0-6.14,1.51L93,210.82A92.27,92.27,0,0,1,71.88,199l-.11-30.24a12,12,0,0,0-1.83-6.32c-.58-.94-1.16-1.91-1.7-2.88A11.92,11.92,0,0,0,63.7,155L36.8,139.63a86.53,86.53,0,0,1,0-23.24l26.88-15.28a12,12,0,0,0,4.55-4.58c.54-1,1.11-1.94,1.7-2.89a12,12,0,0,0,1.83-6.31L71.87,57A91.83,91.83,0,0,1,92.94,45.17l27.15,15.19a11.92,11.92,0,0,0,6.15,1.52c1.14,0,2.3,0,3.44,0a12.08,12.08,0,0,0,6.14-1.51L163,45.18A92.27,92.27,0,0,1,184.12,57l.11,30.24a12,12,0,0,0,1.83,6.32c.58.94,1.16,1.91,1.7,2.88A11.92,11.92,0,0,0,192.3,101l26.9,15.33A86.53,86.53,0,0,1,219.23,139.61Z",
    copy: "M180,72H36A20,20,0,0,0,16,92V204a20,20,0,0,0,20,20H180a20,20,0,0,0,20-20V92A20,20,0,0,0,180,72Zm-4,128H40V96H176ZM240,52V176a12,12,0,0,1-24,0V56H64a12,12,0,0,1,0-24H220A20,20,0,0,1,240,52Z",
    headphones: "M204.73,51.85A108.07,108.07,0,0,0,20,128v56a28,28,0,0,0,28,28H64a28,28,0,0,0,28-28V144a28,28,0,0,0-28-28H44.84A84.05,84.05,0,0,1,128,44h.64a83.7,83.7,0,0,1,82.52,72H192a28,28,0,0,0-28,28v40a28,28,0,0,0,28,28h16a28,28,0,0,0,28-28V128A107.34,107.34,0,0,0,204.73,51.85ZM64,140a4,4,0,0,1,4,4v40a4,4,0,0,1-4,4H48a4,4,0,0,1-4-4V140Zm148,44a4,4,0,0,1-4,4H192a4,4,0,0,1-4-4V144a4,4,0,0,1,4-4h20Z",
    magnifier: "M168,12A75.9,75.9,0,0,0,92.49,96.33L23.91,189.85a19.89,19.89,0,0,0,2,26l14.29,14.29a19.89,19.89,0,0,0,26,2l93.52-68.58A76,76,0,1,0,168,12Zm52,76a51.66,51.66,0,0,1-7.75,27.27L140.74,43.75A52,52,0,0,1,220,88ZM54.72,210.71l-9.43-9.43,56.19-76.63a76.46,76.46,0,0,0,29.87,29.87ZM116,88a51.63,51.63,0,0,1,7.75-27.27l71.51,71.51A52,52,0,0,1,116,88Z",
    bookOpen: "M232,44H160a43.86,43.86,0,0,0-32,13.85A43.86,43.86,0,0,0,96,44H24A12,12,0,0,0,12,56V200a12,12,0,0,0,12,12H96a20,20,0,0,1,20,20,12,12,0,0,0,24,0,20,20,0,0,1,20-20h72a12,12,0,0,0,12-12V56A12,12,0,0,0,232,44ZM96,188H36V68H96a20,20,0,0,1,20,20V192.81A43.79,43.79,0,0,0,96,188Zm124,0H160a43.71,43.71,0,0,0-20,4.83V88a20,20,0,0,1,20-20h60ZM164,96h32a12,12,0,0,1,0,24H164a12,12,0,0,1,0-24Zm44,52a12,12,0,0,1-12,12H164a12,12,0,0,1,0-24h32A12,12,0,0,1,208,148Z",
    sparkle: "M197.58,129.06,146,110l-19-51.62a15.92,15.92,0,0,0-29.88,0L78,110l-51.62,19a15.92,15.92,0,0,0,0,29.88L78,178l19,51.62a15.92,15.92,0,0,0,29.88,0L146,178l51.62-19a15.92,15.92,0,0,0,0-29.88Z",
    target: "M229.26,90.4a108,108,0,0,1-177.63,114A108,108,0,0,1,195.41,43.63l20.1-20.11a12,12,0,0,1,17,17l-96,96a12,12,0,1,1-17-17l24-24a36,36,0,1,0,19.76,39.65,12,12,0,0,1,23.53,4.74,60,60,0,1,1-25.73-62L178.3,60.74a84,84,0,1,0,28.46,38,12,12,0,1,1,22.5-8.35Z",
    hourglass: "M204,75.64V40a20,20,0,0,0-20-20H72A20,20,0,0,0,52,40V76a20.1,20.1,0,0,0,8,16l48,36L60,164a20.1,20.1,0,0,0-8,16v36a20,20,0,0,0,20,20H184a20,20,0,0,0,20-20V180.36a20.13,20.13,0,0,0-7.94-16L147.9,128l48.16-36.4A20.13,20.13,0,0,0,204,75.64ZM180,44V72H76V44Zm-52,69L105.33,96h45.1Zm52,99H76V182l40-30v16a12,12,0,0,0,24,0V152.11l40,30.24Z",
    trophy: "M232,60H212V48a12,12,0,0,0-12-12H56A12,12,0,0,0,44,48V60H24A20,20,0,0,0,4,80V96a44.05,44.05,0,0,0,44,44h.77A84.18,84.18,0,0,0,116,195.15V212H96a12,12,0,0,0,0,24h64a12,12,0,0,0,0-24H140V195.11c30.94-4.51,56.53-26.2,67-55.11h1a44.05,44.05,0,0,0,44-44V80A20,20,0,0,0,232,60ZM28,96V84H44v28c0,1.21,0,2.41.09,3.61A20,20,0,0,1,28,96Zm160,15.1c0,33.33-26.71,60.65-59.54,60.9A60,60,0,0,1,68,112V60H188ZM228,96a20,20,0,0,1-16.12,19.62c.08-1.5.12-3,.12-4.52V84h16Z",
    flag: "M243.94,92.67l-184-64A12,12,0,0,0,44,40V216a12,12,0,0,0,24,0V176.53l175.94-61.2a12,12,0,0,0,0-22.66ZM68,151.12V56.88L203.47,104Z",
    trendUp: "M236,208a12,12,0,0,1-12,12H32a12,12,0,0,1-12-12V48a12,12,0,0,1,24,0v99l43.51-43.52a12,12,0,0,1,17,0L128,127l43-43H160a12,12,0,0,1,0-24h40a12,12,0,0,1,12,12v40a12,12,0,0,1-24,0V101l-51.51,51.52a12,12,0,0,1-17,0L96,129,44,181v15H224A12,12,0,0,1,236,208Z",
    sliders: "M40,92H70.06a36,36,0,0,0,67.88,0H216a12,12,0,0,0,0-24H137.94a36,36,0,0,0-67.88,0H40a12,12,0,0,0,0,24Zm64-24A12,12,0,1,1,92,80,12,12,0,0,1,104,68Zm112,96H201.94a36,36,0,0,0-67.88,0H40a12,12,0,0,0,0,24h94.06a36,36,0,0,0,67.88,0H216a12,12,0,0,0,0-24Zm-48,24a12,12,0,1,1,12-12A12,12,0,0,1,168,188Z",
    chevronDown: "M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z",
    check: "M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z",
    arrowUpRight: "M204,64V168a12,12,0,0,1-24,0V93L72.49,200.49a12,12,0,0,1-17-17L163,76H88a12,12,0,0,1,0-24H192A12,12,0,0,1,204,64Z",
    info: "M128,24a104,104,0,1,0,104,104A104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80a12,12,0,0,1,12-12,12,12,0,0,1,12,12v40a12,12,0,0,1-24,0Zm28-52a16,16,0,1,1-16-16A16,16,0,0,1,148,84Z",
    chat: { html: '<rect x="24" y="48" width="208" height="128" rx="24"/><path d="M64 176 L64 220 L108 176 Z"/>' },
  };

  function renderIcon(key, size, extraClass) {
    var icon = ICONS[key];
    if (!icon) return "";
    size = size || 16;
    var inner = typeof icon === "string" ? '<path d="' + icon + '"/>' : icon.html;
    return (
      '<svg class="icon' + (extraClass ? " " + extraClass : "") + '" width="' + size + '" height="' + size +
      '" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">' + inner + "</svg>"
    );
  }

  // ---------------- Storage helpers ----------------

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("No se pudo guardar en localStorage", e);
    }
  }

  function getSettings() {
    return Object.assign(
      { reminderTime: "20:00", reminderEnabled: false },
      readJSON(LS_SETTINGS, {})
    );
  }

  function saveSettings(patch) {
    var current = getSettings();
    writeJSON(LS_SETTINGS, Object.assign(current, patch));
  }

  function getCompletions() {
    return readJSON(LS_COMPLETIONS, {});
  }

  function setCompletion(dateISO, activityId, done) {
    var all = getCompletions();
    if (!all[dateISO]) all[dateISO] = {};
    if (done) {
      all[dateISO][activityId] = true;
    } else {
      delete all[dateISO][activityId];
      if (Object.keys(all[dateISO]).length === 0) delete all[dateISO];
    }
    writeJSON(LS_COMPLETIONS, all);
  }

  // ---------------- Date helpers ----------------

  function toISODate(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function parseISODate(iso) {
    var parts = iso.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function startOfDay(d) {
    var r = new Date(d);
    r.setHours(0, 0, 0, 0);
    return r;
  }

  function addDays(d, n) {
    var r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
  }

  function diffInDays(a, b) {
    var MS = 24 * 60 * 60 * 1000;
    return Math.round((startOfDay(a) - startOfDay(b)) / MS);
  }

  var WEEKDAY_LABELS = [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
  ];
  var MONTH_LABELS = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  function formatDateHuman(d) {
    return (
      WEEKDAY_LABELS[d.getDay()] +
      " " +
      d.getDate() +
      " de " +
      MONTH_LABELS[d.getMonth()]
    );
  }

  // ---------------- Plan helpers ----------------

  function getStartDate() {
    var iso = localStorage.getItem(LS_START_DATE);
    return iso ? parseISODate(iso) : null;
  }

  function templateForDate(d) {
    return CONFIG.dayTemplates[d.getDay()];
  }

  function phaseForWeek(weekNumber) {
    for (var i = 0; i < CONFIG.phases.length; i++) {
      if (CONFIG.phases[i].weeks.indexOf(weekNumber) !== -1) {
        return CONFIG.phases[i];
      }
    }
    return CONFIG.phases[CONFIG.phases.length - 1];
  }

  function resolveResourceKeys(activity, phaseId) {
    var keys = [];
    var placeholderMap = CONFIG.phaseResources[phaseId] || {};
    (activity.resources || []).forEach(function (key) {
      if (placeholderMap[key]) {
        keys = keys.concat(placeholderMap[key]);
      } else if (CONFIG.resources[key]) {
        keys.push(key);
      }
    });
    return keys;
  }

  // Día (1-indexado, dentro de la primera semana) en el que aparece por
  // primera vez una actividad con este id, según la fecha de inicio.
  function firstOccurrenceDayNumber(startDate, activityId) {
    for (var d = 1; d <= 7; d++) {
      var tpl = templateForDate(addDays(startDate, d - 1));
      if (tpl && tpl.activities.some(function (a) { return a.id === activityId; })) {
        return d;
      }
    }
    return null;
  }

  // Si la actividad tiene un override para "primera vez" (plan.js:
  // firstOccurrenceOverrides) y hoy es justo esa primera ocurrencia,
  // devuelve una copia de la actividad con los recursos reemplazados.
  function withFirstOccurrenceOverride(activity, startDate, dayNumber) {
    var override = CONFIG.firstOccurrenceOverrides && CONFIG.firstOccurrenceOverrides[activity.id];
    if (!override) return activity;
    if (firstOccurrenceDayNumber(startDate, activity.id) !== dayNumber) return activity;
    return Object.assign({}, activity, override);
  }

  function planStateForDate(startDate, date) {
    var dayNumber = diffInDays(date, startDate) + 1; // 1-indexed
    var totalDays = CONFIG.totalWeeks * 7;
    var notStarted = dayNumber < 1;
    var finished = dayNumber > totalDays;
    var weekNumber = Math.min(
      CONFIG.totalWeeks,
      Math.max(1, Math.ceil(dayNumber / 7))
    );
    var phase = phaseForWeek(weekNumber);
    return {
      dayNumber: dayNumber,
      weekNumber: weekNumber,
      phase: phase,
      notStarted: notStarted,
      finished: finished,
    };
  }

  function weekDateRange(startDate, weekNumber) {
    var weekStart = addDays(startDate, (weekNumber - 1) * 7);
    var dates = [];
    for (var i = 0; i < 7; i++) dates.push(addDays(weekStart, i));
    return dates;
  }

  function countForDate(completions, date, total) {
    var iso = toISODate(date);
    var rec = completions[iso] || {};
    var done = Object.keys(rec).filter(function (k) {
      return rec[k];
    }).length;
    if (typeof total === "number") return Math.min(done, total);
    return done;
  }

  function plannedCountForDate(date) {
    var tpl = templateForDate(date);
    return tpl ? tpl.activities.length : 0;
  }

  function aggregateProgress(completions, dates) {
    var planned = 0;
    var done = 0;
    dates.forEach(function (d) {
      var p = plannedCountForDate(d);
      planned += p;
      done += countForDate(completions, d, p);
    });
    return { planned: planned, done: done };
  }

  function hasAnyCompletion(completions, date) {
    var iso = toISODate(date);
    var rec = completions[iso];
    if (!rec) return false;
    return Object.keys(rec).some(function (k) {
      return rec[k];
    });
  }

  function computeStreak(completions, today) {
    var streak = 0;
    var cursor = new Date(today);
    if (!hasAnyCompletion(completions, cursor)) {
      cursor = addDays(cursor, -1);
    }
    while (hasAnyCompletion(completions, cursor)) {
      streak++;
      cursor = addDays(cursor, -1);
    }
    return streak;
  }

  // ---------------- Rendering ----------------

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return (
        { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
      );
    });
  }

  function renderSetupScreen() {
    var todayISO = toISODate(new Date());
    root.innerHTML =
      '<div class="setup-screen">' +
      '<div class="hero-card">' +
      '<div class="hero-icon">' + renderIcon("flag", 30) + "</div>" +
      "<h1>Empecemos.</h1>" +
      "<p>Elegí la fecha en la que arranca tu plan de doce semanas. Desde ahí " +
      "la app calcula sola en qué semana y fase estás, cada día.</p>" +
      '<div class="field" style="margin-top:20px;">' +
      '<label for="start-date-input">Fecha de inicio</label>' +
      '<input type="date" id="start-date-input" value="' +
      todayISO +
      '" />' +
      "</div>" +
      '<button class="btn primary block" id="start-btn">Empezar el plan</button>' +
      "</div>" +
      "</div>";

    document.getElementById("start-btn").addEventListener("click", function () {
      var val = document.getElementById("start-date-input").value;
      if (!val) return;
      localStorage.setItem(LS_START_DATE, val);
      renderApp();
    });
  }

  function resourceLinksHTML(keys, extraClass) {
    return keys
      .map(function (key) {
        var r = CONFIG.resources[key];
        if (!r) return "";
        var cls = "resource-link" + (extraClass ? " " + extraClass : "") + (r.highlight ? " highlight" : "");
        return (
          '<a class="' +
          cls +
          '" target="_blank" rel="noopener noreferrer" href="' +
          r.url +
          '">' +
          (r.highlight ? renderIcon("sparkle", 11) : "") +
          escapeHTML(r.name) +
          renderIcon("arrowUpRight", 10) +
          "</a>"
        );
      })
      .join("");
  }

  function activityRow(activity, dateISO, phaseId, isDone) {
    var resKeys = resolveResourceKeys(activity, phaseId);
    var secKeys = resolveResourceKeys(
      { resources: activity.secondaryResources || [] },
      phaseId
    );
    var links = resourceLinksHTML(resKeys) + resourceLinksHTML(secKeys, "secondary");

    return (
      '<label class="activity' +
      (isDone ? " done" : "") +
      '">' +
      '<span class="activity-icon">' +
      renderIcon(activity.icon || "copy", 16) +
      "</span>" +
      '<input type="checkbox" data-date="' +
      dateISO +
      '" data-activity="' +
      activity.id +
      '" ' +
      (isDone ? "checked" : "") +
      " />" +
      '<span class="activity-body">' +
      '<span class="activity-name">' +
      escapeHTML(activity.name) +
      "</span>" +
      '<span class="activity-minutes">· ' +
      activity.minutes +
      " min</span>" +
      (links ? '<div class="resource-links">' + links + "</div>" : "") +
      "</span>" +
      "</label>"
    );
  }

  function progressRingSVG(done, planned, size) {
    size = size || 54;
    var stroke = 5;
    var r = (size - stroke) / 2;
    var c = 2 * Math.PI * r;
    var pct = planned > 0 ? Math.min(1, done / planned) : 0;
    var offset = c * (1 - pct);
    var center = size / 2;
    var complete = planned > 0 && done >= planned;
    var iconSize = size * 0.32;
    var iconOffset = center - iconSize / 2;
    var centerContent = complete
      ? '<svg x="' + iconOffset + '" y="' + iconOffset + '" width="' + iconSize + '" height="' + iconSize +
        '" viewBox="0 0 256 256" fill="currentColor" class="icon-check"><path d="' + ICONS.check + '"/></svg>'
      : '<text x="' + center + '" y="' + center + '" class="ring-text" text-anchor="middle" dominant-baseline="central">' +
        done + "/" + planned + "</text>";
    return (
      '<svg class="progress-ring' + (complete ? " complete" : "") + '" width="' + size + '" height="' + size +
      '" viewBox="0 0 ' + size + " " + size + '">' +
      '<circle class="ring-track" cx="' + center + '" cy="' + center + '" r="' + r + '" stroke-width="' + stroke + '" fill="none"/>' +
      '<circle class="ring-fill" cx="' + center + '" cy="' + center + '" r="' + r + '" stroke-width="' + stroke +
      '" fill="none" stroke-dasharray="' + c + '" stroke-dashoffset="' + offset + '" transform="rotate(-90 ' + center + " " + center + ')"/>' +
      centerContent +
      "</svg>"
    );
  }

  function renderWeekTracker(startDate, completions, currentWeek) {
    var items = "";
    for (var w = 1; w <= CONFIG.totalWeeks; w++) {
      var isCheckpoint = !!CONFIG.checkpointWeeks[w];
      var cls = "week-dot";
      var pct = 0;
      if (w < currentWeek) {
        var prog = aggregateProgress(completions, weekDateRange(startDate, w));
        pct = prog.planned > 0 ? prog.done / prog.planned : 0;
        cls += pct >= 1 ? " done" : pct > 0 ? " partial missed" : " missed";
      } else if (w === currentWeek) {
        var progC = aggregateProgress(completions, weekDateRange(startDate, w));
        pct = progC.planned > 0 ? progC.done / progC.planned : 0;
        cls += " current";
      } else {
        cls += " future";
      }
      items +=
        '<div class="' + cls + (isCheckpoint ? " checkpoint" : "") + '" style="--fill:' + Math.round(pct * 100) +
        '%" title="Semana ' + w + (isCheckpoint ? " · checkpoint" : "") + '">' +
        (isCheckpoint ? '<span class="checkpoint-mark">' + renderIcon("sparkle", 9) + "</span>" : "") +
        "</div>";
    }
    return '<div class="week-tracker">' + items + "</div>";
  }

  function progressBlock(title, done, planned) {
    var pct = planned > 0 ? Math.round((done / planned) * 100) : 0;
    return (
      '<div class="progress-block">' +
      '<div class="progress-label"><span>' +
      escapeHTML(title) +
      "</span><span>" +
      done +
      " / " +
      planned +
      "</span></div>" +
      '<div class="progress-track"><div class="progress-fill" style="width:' +
      pct +
      '%"></div></div>' +
      "</div>"
    );
  }

  var MONTH_SHORT = MONTH_LABELS.map(function (m) {
    return m.slice(0, 1).toUpperCase() + m.slice(1, 3);
  });

  function renderHeatmap(completions, today) {
    var days = 90;
    var start = addDays(today, -(days - 1));
    // align start to a Sunday so columns are clean weeks
    var startWeekday = start.getDay();
    start = addDays(start, -startWeekday);
    var totalCells = Math.ceil((diffInDays(today, start) + 1) / 7) * 7;
    var totalCols = totalCells / 7;
    var todayISO = toISODate(today);

    var months = "";
    var lastMonth = -1;
    for (var c = 0; c < totalCols; c++) {
      var colDate = addDays(start, c * 7);
      var m = colDate.getMonth();
      months += "<span>" + (m !== lastMonth ? MONTH_SHORT[m] : "") + "</span>";
      lastMonth = m;
    }

    var cells = "";
    for (var i = 0; i < totalCells; i++) {
      var d = addDays(start, i);
      var future = d > today;
      var planned = plannedCountForDate(d);
      var done = countForDate(completions, d, planned);
      var level = 0;
      if (!future && done > 0) {
        if (planned > 0 && done >= planned) level = 3;
        else if (planned > 0 && done / planned >= 0.5) level = 2;
        else level = 1;
      }
      cells +=
        '<div class="cell' +
        (future ? " future" : "") +
        (toISODate(d) === todayISO ? " today" : "") +
        '" data-level="' +
        level +
        '" title="' +
        toISODate(d) +
        ": " +
        done +
        (planned ? "/" + planned : "") +
        '"></div>';
    }

    return (
      '<div class="heatmap-wrap">' +
      '<div class="heatmap-months">' + months + "</div>" +
      '<div class="heatmap">' +
      cells +
      "</div></div>" +
      '<div class="heatmap-legend"><span>menos</span>' +
      '<div class="cell" data-level="0"></div>' +
      '<div class="cell" data-level="1"></div>' +
      '<div class="cell" data-level="2"></div>' +
      '<div class="cell" data-level="3"></div>' +
      "<span>más</span></div>"
    );
  }

  function renderResourceDirectory() {
    var keys = CONFIG.directoryResources || Object.keys(CONFIG.resources);
    var cards = keys
      .map(function (key) {
        var r = CONFIG.resources[key];
        return (
          '<a class="resource-card" target="_blank" rel="noopener noreferrer" href="' +
          r.url +
          '">' +
          escapeHTML(r.name) +
          "</a>"
        );
      })
      .join("");
    return '<div class="resource-grid">' + cards + "</div>";
  }

  function sectionHeader(iconKey, text) {
    return '<h2>' + renderIcon(iconKey, 14) + "<span>" + text + "</span></h2>";
  }

  function renderApp() {
    var startDate = getStartDate();
    if (!startDate) {
      renderSetupScreen();
      return;
    }

    var today = startOfDay(new Date());
    var completions = getCompletions();
    var state = planStateForDate(startDate, today);
    var settings = getSettings();

    var html = "";

    // ---- Header ----
    var headerStreak = computeStreak(completions, today);
    html +=
      '<header class="top">' +
      '<h1><span class="flag"><span class="g"></span><span class="w"></span><span class="r"></span></span>Italiano</h1>' +
      '<div class="header-right">' +
      '<span class="streak-pill" title="Racha actual">' + renderIcon("drop", 13) + headerStreak + "</span>" +
      '<button class="icon-btn" id="settings-toggle-btn" aria-label="Configuración">' + renderIcon("gear", 17) + "</button>" +
      "</div>" +
      "</header>";

    if (state.notStarted) {
      var daysUntil = diffInDays(startDate, today);
      html +=
        '<div class="hero-card">' +
        '<div class="hero-icon">' + renderIcon("hourglass", 28) + "</div>" +
        '<p class="hero-number">' + daysUntil + "</p>" +
        "<p>días para que arranque tu plan.</p>" +
        '<div class="hero-meta">Empieza el <b>' + formatDateHuman(startDate) +
        "</b>. Volvé ese día — no hay nada más para hacer todavía.</div>" +
        "</div>";
    } else {
      var streak = headerStreak;
      var badgeHTML =
        '<div class="status-row">' +
        '<span class="badge phase">Semana ' +
        state.weekNumber +
        " / " +
        CONFIG.totalWeeks +
        "</span>" +
        '<span class="badge phase">' +
        escapeHTML(state.phase.title) +
        "</span>" +
        "</div>" +
        '<p class="phase-focus">' +
        escapeHTML(state.phase.focus) +
        "</p>" +
        renderWeekTracker(startDate, completions, state.weekNumber);

      html += '<div class="card">' + badgeHTML + "</div>";

      // ---- Checkpoint banner ----
      var checkpoint = CONFIG.checkpointWeeks[state.weekNumber];
      if (checkpoint) {
        html +=
          '<div class="checkpoint-banner">' +
          '<div class="badge-icon">' + renderIcon("target", 20) + "</div>" +
          '<div class="checkpoint-body">' +
          '<div class="title">Checkpoint — nivel ' +
          escapeHTML(checkpoint.level) +
          "</div><p>" +
          escapeHTML(checkpoint.note) +
          " También podés usarla como repaso puro si venís atrasada/o.</p>" +
          resourceLinksHTML(["leveltest"]) +
          "</div>" +
          "</div>";
      }

      if (state.finished) {
        html +=
          '<div class="hero-card">' +
          '<div class="hero-icon">' + renderIcon("trophy", 28) + "</div>" +
          "<h1>Doce semanas cumplidas.</h1>" +
          "<p>Terminaste el plan completo. Revisá tu historial abajo, o reiniciá desde Configuración para repasar de nuevo.</p>" +
          "</div>";
      } else {
        // ---- Today's checklist ----
        var tpl = templateForDate(today);
        var todayISO = toISODate(today);
        var dayCompletions = completions[todayISO] || {};
        var doneCount = tpl.activities.filter(function (a) {
          return dayCompletions[a.id];
        }).length;

        var todayComplete = tpl.activities.length > 0 && doneCount >= tpl.activities.length;
        html +=
          '<div class="card">' +
          '<div class="day-card-head"><div>' +
          '<p class="day-eyebrow">Hoy · día ' + state.dayNumber + "</p>" +
          '<p class="day-title">' +
          escapeHTML(tpl.label) +
          "</p>" +
          '<p class="day-sub">' +
          formatDateHuman(today) +
          "</p>" +
          "</div>" +
          progressRingSVG(doneCount, tpl.activities.length) +
          "</div>" +
          '<div id="activity-list">' +
          tpl.activities
            .map(function (a) {
              var resolved = withFirstOccurrenceOverride(a, startDate, state.dayNumber);
              return activityRow(resolved, todayISO, state.phase.id, !!dayCompletions[a.id]);
            })
            .join("") +
          "</div>" +
          (todayComplete
            ? '<div class="day-complete-banner">' + renderIcon("check", 15) + "¡Completaste el día! Seguí así.</div>"
            : "") +
          "</div>";
      }

      // ---- Progress section ----
      var weekDates = weekDateRange(startDate, state.weekNumber);
      var weekProgress = aggregateProgress(completions, weekDates);

      var phaseWeeksDates = [];
      state.phase.weeks.forEach(function (w) {
        phaseWeeksDates = phaseWeeksDates.concat(weekDateRange(startDate, w));
      });
      var phaseProgress = aggregateProgress(completions, phaseWeeksDates);

      html +=
        '<details class="section" open>' +
        "<summary>" + sectionHeader("trendUp", "Progreso") + renderIcon("chevronDown", 12, "chevron") + "</summary>" +
        '<div class="section-body">' +
        progressBlock(
          "Esta semana (" + state.weekNumber + "/" + CONFIG.totalWeeks + ")",
          weekProgress.done,
          weekProgress.planned
        ) +
        progressBlock(
          escapeHTML(state.phase.title),
          phaseProgress.done,
          phaseProgress.planned
        ) +
        sectionHeader("", "Últimos 90 días").replace('<h2>', '<h2 style="margin-top:22px;">') +
        renderHeatmap(completions, today) +
        "</div>" +
        "</details>";
    }

    // ---- Settings section (collapsed by default) ----
    html +=
      '<details class="section" id="settings-section">' +
      "<summary>" + sectionHeader("sliders", "Configuración") + renderIcon("chevronDown", 12, "chevron") + "</summary>" +
      '<div class="section-body">' +
      '<div class="field"><label for="start-date-edit">Fecha de inicio del plan</label>' +
      '<input type="date" id="start-date-edit" value="' +
      toISODate(startDate) +
      '" /></div>' +
      '<div class="field"><label for="reminder-time">Recordatorio diario</label>' +
      '<input type="time" id="reminder-time" value="' +
      settings.reminderTime +
      '" /></div>' +
      '<div class="btn-row">' +
      '<button class="btn primary" id="enable-notif-btn">Activar recordatorio</button>' +
      '<button class="btn secondary" id="disable-notif-btn">Desactivar</button>' +
      "</div>" +
      '<p class="notif-status" id="notif-status"></p>' +
      '<p class="small-note">' + renderIcon("info", 14) + '<span>Las notificaciones del navegador solo funcionan mientras esta pestaña o PWA está abierta, o en segundo plano según lo que permita tu navegador/SO — no hay servidor empujando notificaciones, así que si cerrás la app del todo no vas a recibir el aviso.</span></p>' +
      sectionHeader("", "Recursos").replace('<h2>', '<h2 style="margin-top:20px;">') +
      renderResourceDirectory() +
      sectionHeader("", "Datos").replace('<h2>', '<h2 style="margin-top:20px;">') +
      '<div class="btn-row">' +
      '<button class="btn danger" id="reset-progress-btn">Borrar progreso</button>' +
      '<button class="btn secondary" id="reset-all-btn">Reiniciar plan</button>' +
      "</div>" +
      '<p class="small-note"><span>Todo se guarda localmente en este navegador (localStorage). Para ajustar las actividades o recursos del plan, editá <code>plan.js</code>.</span></p>' +
      "</div>" +
      "</details>";

    root.innerHTML = html;
    root.classList.toggle("entering", isFirstRender);
    isFirstRender = false;
    wireEvents(state, today);
    updateNotifStatus();
  }

  // ---------------- Events ----------------

  function wireEvents(state, today) {
    var list = document.getElementById("activity-list");
    if (list) {
      list.addEventListener("change", function (e) {
        var cb = e.target;
        if (cb.tagName !== "INPUT" || cb.type !== "checkbox") return;
        setCompletion(cb.dataset.date, cb.dataset.activity, cb.checked);
        renderApp();
      });
    }

    var settingsToggle = document.getElementById("settings-toggle-btn");
    var settingsSection = document.getElementById("settings-section");
    if (settingsToggle && settingsSection) {
      settingsToggle.addEventListener("click", function () {
        settingsSection.open = !settingsSection.open;
        settingsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    var startDateEdit = document.getElementById("start-date-edit");
    if (startDateEdit) {
      startDateEdit.addEventListener("change", function () {
        if (!startDateEdit.value) return;
        localStorage.setItem(LS_START_DATE, startDateEdit.value);
        renderApp();
      });
    }

    var reminderTime = document.getElementById("reminder-time");
    if (reminderTime) {
      reminderTime.addEventListener("change", function () {
        saveSettings({ reminderTime: reminderTime.value });
        updateNotifStatus();
      });
    }

    var enableBtn = document.getElementById("enable-notif-btn");
    if (enableBtn) {
      enableBtn.addEventListener("click", function () {
        if (!("Notification" in window)) {
          alert("Este navegador no soporta notificaciones.");
          return;
        }
        Notification.requestPermission().then(function (perm) {
          saveSettings({ reminderEnabled: perm === "granted" });
          updateNotifStatus();
        });
      });
    }

    var disableBtn = document.getElementById("disable-notif-btn");
    if (disableBtn) {
      disableBtn.addEventListener("click", function () {
        saveSettings({ reminderEnabled: false });
        updateNotifStatus();
      });
    }

    var resetProgressBtn = document.getElementById("reset-progress-btn");
    if (resetProgressBtn) {
      resetProgressBtn.addEventListener("click", function () {
        if (
          confirm(
            "¿Borrar todo el progreso marcado (checklist e historial)? La fecha de inicio se mantiene."
          )
        ) {
          localStorage.removeItem(LS_COMPLETIONS);
          renderApp();
        }
      });
    }

    var resetAllBtn = document.getElementById("reset-all-btn");
    if (resetAllBtn) {
      resetAllBtn.addEventListener("click", function () {
        if (
          confirm(
            "¿Reiniciar el plan completo? Esto borra el progreso y te vuelve a pedir la fecha de inicio."
          )
        ) {
          localStorage.removeItem(LS_COMPLETIONS);
          localStorage.removeItem(LS_START_DATE);
          renderApp();
        }
      });
    }
  }

  function updateNotifStatus() {
    var elStatus = document.getElementById("notif-status");
    if (!elStatus) return;
    var settings = getSettings();
    var perm = "Notification" in window ? Notification.permission : "unsupported";
    var text;
    if (perm === "unsupported") {
      text = "Tu navegador no soporta notificaciones.";
    } else if (perm === "denied") {
      text = "Bloqueadas en el navegador. Habilitalas desde la configuración del sitio.";
    } else if (perm === "granted" && settings.reminderEnabled) {
      text = "Activo — te avisa a las " + settings.reminderTime + " si todavía no marcaste nada hoy.";
    } else {
      text = "Inactivo. Tocá \"Activar recordatorio\" para permitir avisos a las " + settings.reminderTime + ".";
    }
    elStatus.textContent = text;
  }

  // ---------------- Reminder check loop ----------------

  function checkReminder() {
    var settings = getSettings();
    if (!settings.reminderEnabled) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    var startDate = getStartDate();
    if (!startDate) return;

    var now = new Date();
    var today = startOfDay(now);
    var state = planStateForDate(startDate, today);
    if (state.notStarted || state.finished) return;

    var hhmm = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    if (hhmm < settings.reminderTime) return;

    var todayISO = toISODate(today);
    if (localStorage.getItem(LS_LAST_NOTIFIED) === todayISO) return;

    var completions = getCompletions();
    if (hasAnyCompletion(completions, today)) {
      localStorage.setItem(LS_LAST_NOTIFIED, todayISO);
      return;
    }

    try {
      new Notification("Italiano — todavía no marcaste nada hoy", {
        body: "Un ratito de Quizlet o input y seguís la racha.",
        icon: "icons/icon-192.png",
      });
    } catch (e) {
      console.warn("No se pudo mostrar la notificación", e);
    }
    localStorage.setItem(LS_LAST_NOTIFIED, todayISO);
  }

  // ---------------- Init ----------------

  renderApp();
  setInterval(checkReminder, 60 * 1000);
  checkReminder();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function (err) {
        console.warn("No se pudo registrar el service worker", err);
      });
    });
  }
})();
