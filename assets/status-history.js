(function () {
  "use strict";

  var repo = "Sakneen/uptime-status";
  var serviceCards;
  var tooltip;
  var selectedRange = "90d";
  var rangeCounts = { "24h": 24, "7d": 7, "30d": 30, "90d": 90, "1y": 365, all: 90 };

  function parseStatus(message) {
    if (message.indexOf("🟥") !== -1) return "down";
    if (message.indexOf("🟨") !== -1) return "degraded";
    return "up";
  }

  function periodLabel() {
    return selectedRange === "24h" ? "24 hours"
      : selectedRange === "7d" ? "7 days"
      : selectedRange === "30d" ? "30 days"
      : selectedRange === "1y" ? "1 year"
      : selectedRange === "all" ? "all available history"
      : "90 days";
  }

  function safeDate(value) {
    var date = new Date(value);
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }

  function makeHistory(commits) {
    var source = commits.slice(0, 90).map(function (commit) {
      return {
        status: parseStatus(commit.commit && commit.commit.message || ""),
        timestamp: commit.commit && commit.commit.author && commit.commit.author.date
      };
    }).reverse();
    var count = rangeCounts[selectedRange];
    var last = source.length ? safeDate(source[source.length - 1].timestamp).getTime() : Date.now();
    return Array.from({ length: count }, function (_, index) {
      var item = source.length ? source[Math.floor(index * source.length / count)] : { status: "up" };
      return {
        status: item.status || "up",
        timestamp: new Date(last - (count - 1 - index) * 86400000).toISOString()
      };
    });
  }

  function makeChart(history) {
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
        '" tabindex="0"><title>' + item.status.toUpperCase() + " · " + date.toLocaleDateString() + "</title></rect>";
    }).join("");
    return '<svg viewBox="0 0 ' + width + " " + height + '" preserveAspectRatio="none" role="img" aria-label="Uptime history">' +
      bars + '</svg><div class="status-history-scale"><span>' + periodLabel() + ' ago</span><span class="rule"></span><strong>' +
      uptime.toFixed(1) + ' % uptime</strong><span class="rule"></span><span>Today</span></div>';
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

  function renderCard(card, commits) {
    var link = card.querySelector('a[href*="/history/"]');
    if (!link) return;
    var history = makeHistory(commits);
    var name = link.textContent.trim();
    card.classList.add("status-history-card");
    card.classList.toggle("status-history-down", card.classList.contains("down"));
    card.style.removeProperty("--background");
    card.innerHTML = '<h4 class="status-history-title"><a href="' + link.href + '">' + name + '</a></h4>' +
      '<span class="status-history-operational">' + (card.classList.contains("down") ? "Down" : "Operational") + "</span>" +
      '<div class="status-history-chart">' + makeChart(history) + "</div>";
    card.querySelectorAll(".status-history-bar").forEach(function (bar) {
      bar.addEventListener("mouseenter", showTooltip);
      bar.addEventListener("focus", showTooltip);
      bar.addEventListener("mouseleave", function () { tooltip.style.display = "none"; });
      bar.addEventListener("blur", function () { tooltip.style.display = "none"; });
    });
  }

  function fetchHistory(card) {
    var link = card.querySelector('a[href*="/history/"]');
    var slug = link && link.getAttribute("href").split("/history/")[1];
    if (!slug) return Promise.resolve();
    return fetch("https://api.github.com/repos/" + repo + "/commits?path=history/" + encodeURIComponent(slug) + ".yml&per_page=90", {
      headers: { Accept: "application/vnd.github+json" }
    }).then(function (response) { return response.ok ? response.json() : []; })
      .then(function (commits) { renderCard(card, commits); })
      .catch(function () { renderCard(card, []); });
  }

  function init() {
    var liveStatus = document.querySelector(".live-status");
    if (!liveStatus) return;
    serviceCards = Array.from(liveStatus.querySelectorAll("article")).filter(function (card) {
      return card.querySelector('a[href*="/history/"]');
    });
    if (!serviceCards.length) return;
    tooltip = document.createElement("div");
    tooltip.className = "status-history-tooltip";
    document.body.appendChild(tooltip);
    var controls = Array.from(document.querySelectorAll("input[type=radio][name=d]"));
    controls.forEach(function (control) {
      control.addEventListener("change", function () {
        selectedRange = control.value === "day" ? "24h" : control.value === "week" ? "7d" : control.value === "month" ? "30d" : control.value === "year" ? "1y" : "all";
        serviceCards.forEach(function (card) { fetchHistory(card); });
      });
    });
    serviceCards.forEach(function (card) { fetchHistory(card); });
  }

  var attempts = 0;
  var timer = setInterval(function () {
    init();
    attempts += 1;
    if (serviceCards && serviceCards.length || attempts > 30) clearInterval(timer);
  }, 500);
})();
