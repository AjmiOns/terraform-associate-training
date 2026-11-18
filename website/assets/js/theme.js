/* Theme: mode (auto/light/dark) + accent hue. Load in <head> so there is no flash. */
(function () {
  var KEY = "tf004-theme", root = document.documentElement;
  var HUES = [["Violet", 295], ["Blue", 250], ["Teal", 195], ["Green", 150], ["Amber", 70], ["Rose", 10]];
  var MODES = [["auto", "Auto"], ["light", "Light"], ["dark", "Dark"]];
  var pref = { mode: "auto", hue: 295 };
  try { Object.assign(pref, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) {}
  if (!MODES.some(function (m) { return m[0] === pref.mode; })) pref.mode = "auto";
  pref.hue = Number(pref.hue); if (!(pref.hue >= 0 && pref.hue <= 360)) pref.hue = 295;
  var mq = matchMedia("(prefers-color-scheme: dark)");

  function apply() {
    root.dataset.mode = pref.mode === "dark" || (pref.mode === "auto" && mq.matches) ? "dark" : "light";
    root.style.setProperty("--h", pref.hue);
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(pref)); } catch (e) {} }
  apply();
  mq.addEventListener("change", apply);

  function mount(host) {
    host.innerHTML =
      '<details class="appearance"><summary class="btn" aria-label="Appearance settings">Appearance</summary>' +
      '<div class="pop"><div class="pop-row"><span>Mode</span><div class="segctl">' +
      MODES.map(function (m) { return '<button type="button" data-mode="' + m[0] + '">' + m[1] + "</button>"; }).join("") +
      '</div></div><div class="pop-row"><span>Accent color</span><div class="swatches">' +
      HUES.map(function (h) { return '<button type="button" class="sw" style="--sw:' + h[1] + '" data-hue="' + h[1] + '" aria-label="' + h[0] + '"></button>'; }).join("") +
      "</div></div></div></details>";
    var d = host.firstChild;
    function sync() {
      d.querySelectorAll("[data-mode]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.mode === pref.mode); });
      d.querySelectorAll("[data-hue]").forEach(function (b) { b.setAttribute("aria-pressed", Number(b.dataset.hue) === pref.hue); });
    }
    d.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.dataset.mode) pref.mode = b.dataset.mode;
      if (b.dataset.hue) pref.hue = Number(b.dataset.hue);
      apply(); save(); sync();
    });
    document.addEventListener("click", function (e) { if (!d.contains(e.target)) d.open = false; });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && d.open) { d.open = false; d.querySelector("summary").focus(); } });
    sync();
  }
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-theme-controls]").forEach(mount);
  });
})();
