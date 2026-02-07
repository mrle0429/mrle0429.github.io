(function () {
  function getBase(url) {
    return url.replace(/\/[^/]*$/, "");
  }

  async function initOne(el) {
    var manifestUrl = el.dataset.manifestUrl;
    if (!manifestUrl) return;

    var title = el.dataset.title || "运动热力图";
    el.innerHTML =
      '<div class="run-heatmap-title"></div>' +
      '<div class="run-heatmap-years"></div>' +
      '<div class="run-heatmap-content">加载中...</div>' +
      '<div class="run-heatmap-tip"></div>';
    el.querySelector(".run-heatmap-title").textContent = title;

    var yearsEl = el.querySelector(".run-heatmap-years");
    var contentEl = el.querySelector(".run-heatmap-content");
    var tipEl = el.querySelector(".run-heatmap-tip");

    var manifest;
    try {
      var manifestRes = await fetch(manifestUrl, { cache: "no-store" });
      if (!manifestRes.ok) throw new Error("manifest load failed");
      manifest = await manifestRes.json();
    } catch (err) {
      contentEl.textContent = "运动数据加载失败";
      return;
    }

    var files = manifest.files || {};
    var years = Array.isArray(manifest.years) ? manifest.years.slice() : [];
    if (!years.length) years = Object.keys(files);

    var defaultYear = String(manifest.default_year || "Total");
    var currentYear = files[defaultYear] ? defaultYear : String(years[0] || "Total");
    var base = getBase(manifestUrl);
    var version = manifest.version ? "?v=" + encodeURIComponent(manifest.version) : "";

    if (manifest.updated_at) {
      tipEl.textContent = "更新于 " + manifest.updated_at;
    } else {
      tipEl.textContent = "";
    }

    function setActive() {
      var buttons = yearsEl.querySelectorAll("button[data-year]");
      Array.prototype.forEach.call(buttons, function (btn) {
        btn.classList.toggle("is-active", btn.dataset.year === currentYear);
      });
    }

    async function loadYear(year) {
      currentYear = String(year);
      setActive();

      var file = files[currentYear];
      if (!file) {
        contentEl.textContent = currentYear + " 暂无数据";
        return;
      }

      var url = base + "/" + file + version;
      contentEl.textContent = "加载中...";

      try {
        var svgRes = await fetch(url);
        if (!svgRes.ok) throw new Error("svg load failed");
        contentEl.innerHTML = await svgRes.text();
      } catch (err) {
        contentEl.innerHTML = "";
        var img = document.createElement("img");
        img.src = url;
        img.alt = currentYear + " heatmap";
        contentEl.appendChild(img);
      }
    }

    yearsEl.innerHTML = years
      .map(function (y) {
        var label = String(y);
        return '<button class="run-heatmap-btn" data-year="' + label + '">' + label + "</button>";
      })
      .join("");

    yearsEl.addEventListener("click", function (event) {
      var btn = event.target.closest("button[data-year]");
      if (!btn) return;
      loadYear(btn.dataset.year);
    });

    loadYear(currentYear);
  }

  function initAll() {
    var nodes = document.querySelectorAll(".run-heatmap");
    Array.prototype.forEach.call(nodes, initOne);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();
