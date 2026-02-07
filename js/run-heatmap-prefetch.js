(function () {
  var manifestUrl =
    "https://cdn.jsdelivr.net/gh/mrle0429/running_page@master/assets/github_manifest.json";

  function getBase(url) {
    return url.replace(/\/[^/]*$/, "");
  }

  function prefetchUrl(url) {
    // Hint for browser scheduler
    var link = document.createElement("link");
    link.rel = "prefetch";
    link.href = url;
    document.head.appendChild(link);

    // Warm real cache for later page switch
    fetch(url, { cache: "force-cache" }).catch(function () {});
  }

  function run() {
    fetch(manifestUrl, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("manifest load failed");
        return res.json();
      })
      .then(function (manifest) {
        var files = manifest.files || {};
        var defaultYear = String(manifest.default_year || "Total");
        var years = Array.isArray(manifest.years) ? manifest.years : Object.keys(files);
        var year = files[defaultYear] ? defaultYear : String(years[0] || "Total");
        var file = files[year];
        if (!file) return;

        var version = manifest.version ? "?v=" + encodeURIComponent(manifest.version) : "";
        var base = getBase(manifestUrl);
        prefetchUrl(base + "/" + file + version);
      })
      .catch(function () {});
  }

  if ("requestIdleCallback" in window) {
    requestIdleCallback(run, { timeout: 1500 });
  } else {
    setTimeout(run, 600);
  }
})();
