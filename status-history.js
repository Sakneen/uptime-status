(function () {
  "use strict";

  var summaryUrl = "https://raw.githubusercontent.com/Sakneen/uptime-status/master/history/summary.json";
  var serviceCards;
  var liveStatus;
  var tooltip;
  var summariesBySlug = {};
  var historyDays = 90;

  function safeDate(value) {
    var date = new Date(value);
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }

  function makeHistory(summary) {
    var count = historyDays;
    var last = Date.now();
    var downtime = summary && summary.dailyMinutesDown || {};
    return Array.from({ length: count }, function (_, index) {
      var timestamp = new Date(last - (count - 1 - index) * 86400000);
      var isoDate = timestamp.toISOString().slice(0, 10);
      var minutesDown = Number(downtime[isoDate] || 0);
      var status = minutesDown >= 1440 ? "down" : minutesDown > 0 ? "degraded" : "up";
      if (index === count - 1 && summary && summary.status === "down") status = "down";
      return {
        status: status,
        timestamp: timestamp.toISOString()
      };
    });
  }

  function makeChart(history, detailsUrl) {
    var width = 860;
    var height = 58;
    var padding = 2;
    var gap = 5;
    var barWidth = Math.max(3, (width - padding * 2 - gap * (history.length - 1)) / history.length);
    var uptime = history.filter(function (item) { return item.status === "up"; }).length / history.length * 100;
    var bars = history.map(function (item, index) {
      var date = safeDate(item.timestamp);
      return '<rect class="status-history-bar ' + item.status + '" x="' + (padding + index * (barWidth + gap)) +
        '" y="3" width="' + barWidth + '" height="42" data-status="' + item.status + '" data-date="' + date.toISOString() +
        '" data-details-url="' + detailsUrl + '" tabindex="0" role="link" aria-label="Open details for ' +
        date.toLocaleDateString() + '"><title>' + item.status.toUpperCase() + " · " + date.toLocaleDateString() + "</title></rect>";
    }).join("");
    return '<svg viewBox="0 0 ' + width + " " + height + '" preserveAspectRatio="none" role="img" aria-label="Uptime history">' +
      bars + '</svg><div class="status-history-scale"><span>90 days ago</span><span class="rule"></span><strong>' +
      uptime.toFixed(1) + ' % uptime</strong><span class="rule"></span><span>Today</span></div>';
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
    tooltip.innerHTML = "<strong>" + date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
      "</strong>" + (status === "up" ? "No downtime recorded on this day." : status === "degraded" ? "Degraded service recorded on this day." : "Downtime recorded on this day.");
    tooltip.style.display = "block";
    tooltip.style.left = ((event.clientX || 0) + 12) + "px";
    tooltip.style.top = ((event.clientY || 0) - 80) + "px";
  }

  function renderCard(card) {
    var link = card.querySelector('a[href*="/history/"]');
    if (!link) return;
    var slug = link.getAttribute("href").split("/history/")[1];
    var summary = summariesBySlug[slug] || {};
    var history = makeHistory(summary);
    var name = link.textContent.trim();
    card.classList.add("status-history-card");
    card.classList.toggle("status-history-down", summary.status === "down" || card.classList.contains("down"));
    card.style.removeProperty("--background");
    card.innerHTML = '<h4 class="status-history-title"><a href="' + link.href + '">' + name + '</a></h4>' +
      '<span class="status-history-operational">' + (summary.status === "down" ? "Down" : "Operational") + "</span>" +
      '<div class="status-history-chart">' + makeChart(history, link.href) + "</div>";
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
  }

  function init() {
    liveStatus = document.querySelector(".live-status");
    if (!liveStatus) return;
    serviceCards = Array.from(liveStatus.querySelectorAll("article")).filter(function (card) {
      return card.querySelector('a[href*="/history/"]');
    });
    if (!serviceCards.length) return;
    tooltip = document.createElement("div");
    tooltip.className = "status-history-tooltip";
    document.body.appendChild(tooltip);
    fetch(summaryUrl, { cache: "no-store" })
      .then(function (response) { return response.ok ? response.json() : []; })
      .then(function (summaries) {
        summaries.forEach(function (summary) { summariesBySlug[summary.slug] = summary; });
        renderCards();
      })
      .catch(renderCards);
  }

  var attempts = 0;
  var timer = setInterval(function () {
    init();
    attempts += 1;
    if (serviceCards && serviceCards.length || attempts > 30) clearInterval(timer);
  }, 500);
})();
