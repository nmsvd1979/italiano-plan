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

  function el(html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

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
      '<div class="flag" style="width:44px;height:30px;margin:0 auto 14px;">' +
      '<span class="g"></span><span class="w"></span><span class="r"></span></div>' +
      "<h1>Plan de italiano — 12 semanas</h1>" +
      "<p>Configurá tu fecha de inicio una sola vez. A partir de ahí la app " +
      "calcula automáticamente en qué semana y fase estás cada día.</p>" +
      '<div class="card">' +
      '<div class="field">' +
      '<label for="start-date-input">Fecha de inicio</label>' +
      '<input type="date" id="start-date-input" value="' +
      todayISO +
      '" />' +
      "</div>" +
      '<button class="btn primary block" id="start-btn">Empezar</button>' +
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
          (r.highlight ? "🚀 " : "🔗 ") +
          escapeHTML(r.name) +
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
      '<span class="activity-icon" aria-hidden="true">' +
      (activity.icon || "•") +
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

  function renderHeatmap(completions, today) {
    var days = 90;
    var start = addDays(today, -(days - 1));
    // align start to a Sunday so columns are clean weeks
    var startWeekday = start.getDay();
    start = addDays(start, -startWeekday);
    var totalCells = Math.ceil((diffInDays(today, start) + 1) / 7) * 7;

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
      '<div class="heatmap-wrap"><div class="heatmap">' +
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
    html +=
      '<header class="top">' +
      '<h1><span class="flag"><span class="g"></span><span class="w"></span><span class="r"></span></span>Italiano</h1>' +
      '<button class="icon-btn" id="settings-toggle-btn" aria-label="Configuración">⚙️</button>' +
      "</header>";

    if (state.notStarted) {
      html +=
        '<div class="card"><h2>Todavía no empezó</h2><p class="phase-focus">Tu plan arranca el ' +
        formatDateHuman(startDate) +
        ". Volvé ese día para ver tu primer checklist.</p></div>";
    } else {
      var streak = computeStreak(completions, today);
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
        '<span class="badge streak">🔥 ' +
        streak +
        (streak === 1 ? " día" : " días") +
        "</span>" +
        "</div>" +
        '<p class="phase-focus">' +
        escapeHTML(state.phase.focus) +
        "</p>";

      html += '<div class="card">' + badgeHTML + "</div>";

      // ---- Checkpoint banner ----
      var checkpoint = CONFIG.checkpointWeeks[state.weekNumber];
      if (checkpoint) {
        html +=
          '<div class="checkpoint-banner"><div class="title">📍 Semana de checkpoint — nivel ' +
          escapeHTML(checkpoint.level) +
          "</div><p>" +
          escapeHTML(checkpoint.note) +
          " Esta semana también podés usarla como repaso puro si venís atrasada/o, sin sumar contenido nuevo.</p>" +
          '<a class="resource-link" target="_blank" rel="noopener noreferrer" href="' +
          CONFIG.resources.leveltest.url +
          '">🔗 Hacer test de nivel online</a>' +
          "</div>";
      }

      if (state.finished) {
        html +=
          '<div class="card"><h2>🎉 Plan completado</h2><p class="phase-focus">Llegaste al final de las 12 semanas. Revisá tu heatmap y, si querés, ' +
          "reiniciá el plan desde Configuración para repasar de nuevo.</p></div>";
      } else {
        // ---- Today's checklist ----
        var tpl = templateForDate(today);
        var todayISO = toISODate(today);
        var dayCompletions = completions[todayISO] || {};
        var doneCount = tpl.activities.filter(function (a) {
          return dayCompletions[a.id];
        }).length;

        html +=
          '<div class="card">' +
          '<p class="day-title">' +
          escapeHTML(tpl.label) +
          "</p>" +
          '<p class="day-sub">' +
          formatDateHuman(today) +
          " · día " +
          state.dayNumber +
          " del plan</p>" +
          '<div id="activity-list">' +
          tpl.activities
            .map(function (a) {
              var resolved = withFirstOccurrenceOverride(a, startDate, state.dayNumber);
              return activityRow(resolved, todayISO, state.phase.id, !!dayCompletions[a.id]);
            })
            .join("") +
          "</div>" +
          '<div class="day-progress-bar">' +
          progressBlock("Hoy", doneCount, tpl.activities.length) +
          "</div>" +
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
        "<summary>📊 Progreso</summary>" +
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
        "<h2>Últimos 90 días</h2>" +
        renderHeatmap(completions, today) +
        "</div>" +
        "</details>";
    }

    // ---- Settings section (collapsed by default) ----
    html +=
      '<details class="section" id="settings-section">' +
      "<summary>⚙️ Configuración</summary>" +
      '<div class="section-body">' +
      '<div class="field"><label for="start-date-edit">Fecha de inicio del plan</label>' +
      '<input type="date" id="start-date-edit" value="' +
      toISODate(startDate) +
      '" /></div>' +
      '<div class="field"><label for="reminder-time">Recordatorio diario (hora)</label>' +
      '<input type="time" id="reminder-time" value="' +
      settings.reminderTime +
      '" /></div>' +
      '<div class="btn-row">' +
      '<button class="btn primary" id="enable-notif-btn">Activar recordatorio</button>' +
      '<button class="btn secondary" id="disable-notif-btn">Desactivar</button>' +
      "</div>" +
      '<p class="notif-status" id="notif-status"></p>' +
      '<p class="small-note">⚠️ Las notificaciones del navegador (Notification API) solo funcionan mientras esta pestaña o PWA está abierta, o en segundo plano según lo que permita tu navegador/SO — no hay backend ni push real, así que si cerrás la app del todo no vas a recibir el aviso. Es un recordatorio "mientras la tengas abierta", no una notificación garantizada como las de apps nativas.</p>' +
      '<h2 style="margin-top:18px;">Recursos</h2>' +
      renderResourceDirectory() +
      '<h2 style="margin-top:18px;">Datos</h2>' +
      '<div class="btn-row">' +
      '<button class="btn danger" id="reset-progress-btn">Borrar progreso</button>' +
      '<button class="btn secondary" id="reset-all-btn">Reiniciar plan completo</button>' +
      "</div>" +
      '<p class="small-note">Todo se guarda localmente en este navegador (localStorage). Para ajustar las actividades, minutos o recursos del plan, editá el archivo <code>plan.js</code> — no hace falta tocar el resto del código.</p>' +
      "</div>" +
      "</details>";

    root.innerHTML = html;
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
        body: "Un ratito de Quizlet o input y seguís la racha 🔥",
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
