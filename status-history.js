(function () {
  "use strict";

  var summaryUrl = "https://raw.githubusercontent.com/Sakneen/uptime-status/master/history/summary.json";
  var eventsUrl = "https://status.sakneen.com/historical-events.json?v=history-bars-90d-v6";
  var serviceCards;
  var liveStatus;
  var tooltip;
  var summariesBySlug = {};
  var eventsBySlug = {};
  var allEvents = [];
  var historyDays = 90;
  var initTimer;

  function safeDate(value) {
    var date = new Date(value);
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }

  function eventMinutes(event) {
    var startedAt = safeDate(event.startedAt);
    var resolvedAt = safeDate(event.resolvedAt || event.observedUntil || event.startedAt);
    return Math.max(1, Math.ceil((resolvedAt.getTime() - startedAt.getTime()) / 60000));
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }

  function serviceName(slug) {
    var summary = summariesBySlug[slug];
    return summary && summary.name ? summary.name : String(slug || "").replace(/-/g, " ");
  }

  function formatDate(value) {
    return safeDate(value).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
  }

  function indexEvents(events) {
    allEvents = events.slice().sort(function (left, right) {
      return safeDate(right.startedAt).getTime() - safeDate(left.startedAt).getTime();
    });
    eventsBySlug = {};
    allEvents.forEach(function (event) {
      if (!event.service || !event.startedAt) return;
      var dateKey = safeDate(event.startedAt).toISOString().slice(0, 10);
      if (!eventsBySlug[event.service]) eventsBySlug[event.service] = {};
      if (!eventsBySlug[event.service][dateKey]) eventsBySlug[event.service][dateKey] = [];
      eventsBySlug[event.service][dateKey].push(event);
    });
  }

  function eventSummary(event) {
    if (event.type === "maintenance") return "Completed";
    var minutes = eventMinutes(event);
    return "Duration: " + minutes + " min · 1 update";
  }

  function eventCard(event, detailSlug) {
    var href = detailSlug ? "#event-" + event.number : "/history/" + encodeURIComponent(event.service) + "#event-" + event.number;
    return '<article id="event-' + escapeHtml(event.number) + '" class="status-history-event-card ' + escapeHtml(event.type) +
      '" data-href="' + escapeHtml(href) + '" tabindex="0" role="link">' +
      '<div><h3>' + escapeHtml(event.title) + '</h3><p>' + escapeHtml(eventSummary(event)) + '</p></div>' +
      '<a href="' + href + '">' + (event.type === "maintenance" ? "Maintenance" : "Incident") + " #" + escapeHtml(event.number) + " report -></a></article>";
  }

  function navigateToHref(href) {
    if (!href) return;
    window.location.href = href;
  }

  function openContainerLink(event) {
    var target = event.target;
    if (target && target.closest && target.closest("a")) return;
    if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    navigateToHref(event.currentTarget.getAttribute("data-href"));
  }

  function eventsByDateHtml(events, detailSlug) {
    var grouped = {};
    events.forEach(function (event) {
      var dateKey = formatDate(event.startedAt);
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(event);
    });
    return Object.keys(grouped).map(function (dateKey) {
      return '<div class="status-history-event-date">' + escapeHtml(dateKey) + '</div>' +
        grouped[dateKey].map(function (event) { return eventCard(event, detailSlug); }).join("");
    }).join("");
  }

  function renderEventSections() {
    var main = document.querySelector("main.container");
    if (!main || !allEvents.length) return;
    var existing = main.querySelector(".status-history-events");
    if (existing) existing.remove();

    var detailMatch = window.location.pathname.match(/^\/history\/([^/]+)/);
    var detailSlug = detailMatch ? decodeURIComponent(detailMatch[1]) : "";
    var events = detailSlug ? allEvents.filter(function (event) { return event.service === detailSlug; }) : allEvents;
    if (!events.length) return;

    var maintenance = events.filter(function (event) { return event.type === "maintenance"; });
    var incidents = events.filter(function (event) { return event.type !== "maintenance"; });
    var container = document.createElement("section");
    container.className = "status-history-events";
    container.innerHTML =
      (maintenance.length ? '<h2>Past Scheduled Maintenance</h2>' + eventsByDateHtml(maintenance, detailSlug) : "") +
      (incidents.length ? '<h2>Past Incidents</h2>' + eventsByDateHtml(incidents, detailSlug) : "");

    var liveStatus = main.querySelector(".live-status");
    if (liveStatus && liveStatus.parentNode) {
      liveStatus.parentNode.insertBefore(container, liveStatus.nextSibling);
    } else {
      main.appendChild(container);
    }
    container.querySelectorAll(".status-history-event-card").forEach(function (card) {
      card.addEventListener("click", openContainerLink);
      card.addEventListener("keydown", openContainerLink);
    });
  }

  function makeHistory(summary, slug) {
    var count = historyDays;
    var last = Date.now();
    var downtime = summary && summary.dailyMinutesDown || {};
    var maintenance = summary && summary.dailyMaintenance || {};
    var serviceEvents = eventsBySlug[slug] || {};
    return Array.from({ length: count }, function (_, index) {
      var timestamp = new Date(last - (count - 1 - index) * 86400000);
      var isoDate = timestamp.toISOString().slice(0, 10);
      var dayEvents = serviceEvents[isoDate] || [];
      var hasMaintenance = maintenance[isoDate] || dayEvents.some(function (event) { return event.type === "maintenance"; });
      var eventDowntime = dayEvents.reduce(function (total, event) {
        return event.type === "maintenance" ? total : total + eventMinutes(event);
      }, 0);
      var minutesDown = Number(downtime[isoDate] || 0) || eventDowntime;
      var status = hasMaintenance ? "maintenance" : minutesDown >= 1440 ? "down" : minutesDown > 0 ? "degraded" : "up";
      if (index === count - 1 && summary && summary.status === "down") status = "down";
      return {
        status: status,
        timestamp: timestamp.toISOString(),
        minutesDown: minutesDown,
        events: dayEvents
      };
    });
  }

  function makeChart(history, detailsUrl) {
    var width = 860;
    var height = 58;
    var padding = 2;
    var gap = 5;
    var barWidth = Math.max(3, (width - padding * 2 - gap * (history.length - 1)) / history.length);
    var totalMinutes = history.length * 1440;
    var downtimeMinutes = history.reduce(function (total, item) {
      return total + (item.status === "down" && !item.minutesDown ? 1440 : item.minutesDown || 0);
    }, 0);
    var uptime = Math.max(0, (totalMinutes - downtimeMinutes) / totalMinutes * 100);
    var uptimeLabel = uptime < 100 && uptime >= 99.9 ? uptime.toFixed(3) : uptime.toFixed(1);
    var bars = history.map(function (item, index) {
      var date = safeDate(item.timestamp);
      return '<rect class="status-history-bar ' + item.status + '" x="' + (padding + index * (barWidth + gap)) +
        '" y="3" width="' + barWidth + '" height="42" data-status="' + item.status + '" data-date="' + date.toISOString() +
        '" data-minutes-down="' + (item.minutesDown || 0) +
        '" data-events="' + encodeURIComponent(JSON.stringify(item.events || [])) +
        '" data-details-url="' + detailsUrl + '" tabindex="0" role="link" aria-label="Open details for ' +
        date.toLocaleDateString() + '"><title>' + item.status.toUpperCase() + " · " + date.toLocaleDateString() + "</title></rect>";
    }).join("");
    return '<svg viewBox="0 0 ' + width + " " + height + '" preserveAspectRatio="none" role="img" aria-label="Uptime history">' +
      bars + '</svg><div class="status-history-scale"><span>90 days ago</span><span class="rule"></span><strong>' +
      uptimeLabel + ' % uptime</strong><span class="rule"></span><span>Today</span></div>';
  }

  function openDetails(event) {
    var bar = event.currentTarget;
    if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    window.location.href = bar.getAttribute("data-details-url");
  }

  function showTooltip(event) {
    var bar = event.currentTarget;
    var date = safeDate(bar.getAttribute("data-date"));
    var status = bar.getAttribute("data-status");
    var minutesDown = Number(bar.getAttribute("data-minutes-down") || 0);
    var events = [];
    try {
      events = JSON.parse(decodeURIComponent(bar.getAttribute("data-events") || "%5B%5D"));
    } catch (error) {
      events = [];
    }
    var eventTitle = events.length ? "<br>" + events.map(function (event) { return event.title; }).join("<br>") : "";
    tooltip.innerHTML = "<strong>" + date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
      "</strong>" + (status === "up" ? "No downtime recorded on this day." : status === "maintenance" ? "Scheduled maintenance recorded on this day." : status === "degraded" ? minutesDown.toFixed(1) + " minutes of degraded availability recorded." : "Downtime recorded on this day.") + eventTitle;
    tooltip.style.display = "block";
    tooltip.style.left = ((event.clientX || 0) + 12) + "px";
    tooltip.style.top = ((event.clientY || 0) - 80) + "px";
  }

  function renderCard(card) {
    var link = card.querySelector('a[href*="/history/"]');
    if (!link) return;
    var slug = link.getAttribute("href").split("/history/")[1];
    var summary = summariesBySlug[slug] || {};
    var history = makeHistory(summary, slug);
    var name = link.textContent.trim();
    card.classList.add("status-history-card");
    card.classList.toggle("status-history-down", summary.status === "down" || card.classList.contains("down"));
    card.style.removeProperty("--background");
    card.setAttribute("data-href", link.href);
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "link");
    card.innerHTML = '<h4 class="status-history-title"><a href="' + link.href + '">' + name + '</a></h4>' +
      '<span class="status-history-operational">' + (summary.status === "down" ? "Down" : "Operational") + "</span>" +
      '<div class="status-history-chart">' + makeChart(history, link.href) + "</div>";
    card.addEventListener("click", openContainerLink);
    card.addEventListener("keydown", openContainerLink);
    card.querySelectorAll(".status-history-bar").forEach(function (bar) {
      bar.addEventListener("mouseenter", showTooltip);
      bar.addEventListener("focus", showTooltip);
      bar.addEventListener("click", openDetails);
      bar.addEventListener("keydown", openDetails);
      bar.addEventListener("mouseleave", function () { tooltip.style.display = "none"; });
      bar.addEventListener("blur", function () { tooltip.style.display = "none"; });
    });
  }

  function renderCards() {
    serviceCards.forEach(function (card) { renderCard(card); });
    liveStatus.classList.add("status-history-ready");
    renderEventSections();
  }

  function loadData() {
    return Promise.all([
      fetch(summaryUrl, { cache: "no-store" }).then(function (response) { return response.ok ? response.json() : []; }),
      fetch(eventsUrl, { cache: "no-store" }).then(function (response) { return response.ok ? response.json() : []; }).catch(function () { return []; })
    ])
      .then(function (results) {
        var summaries = results[0];
        var events = results[1];
        summaries.forEach(function (summary) { summariesBySlug[summary.slug] = summary; });
        indexEvents(events);
        return results;
      });
  }

  function initStatusPage() {
    var nextLiveStatus = document.querySelector(".live-status");
    if (!nextLiveStatus) return;
    var nextServiceCards = Array.from(nextLiveStatus.querySelectorAll("article")).filter(function (card) {
      return card.querySelector('a[href*="/history/"]');
    });
    if (nextLiveStatus === liveStatus && nextServiceCards.length && nextServiceCards.every(function (card) {
      return card.classList.contains("status-history-card");
    })) {
      renderEventSections();
      return;
    }
    liveStatus = nextLiveStatus;
    serviceCards = nextServiceCards;
    if (!serviceCards.length) return;
    tooltip = document.querySelector(".status-history-tooltip");
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.className = "status-history-tooltip";
      document.body.appendChild(tooltip);
    }
    loadData().then(renderCards)
      .catch(renderCards);
  }

  function initDetailPage() {
    if (!window.location.pathname.match(/^\/history\/([^/]+)/)) return;
    loadData().then(renderEventSections).catch(function () {});
  }

  function init() {
    initStatusPage();
    initDetailPage();
  }

  function scheduleInit() {
    clearTimeout(initTimer);
    initTimer = setTimeout(init, 50);
  }

  var attempts = 0;
  var timer = setInterval(function () {
    init();
    attempts += 1;
    if (serviceCards && serviceCards.length || attempts > 30) clearInterval(timer);
  }, 500);
  new MutationObserver(scheduleInit).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("popstate", scheduleInit);
  window.addEventListener("pageshow", scheduleInit);
})();
