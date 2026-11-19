/* Theme: mode (auto/light/dark) + accent hue. Sets data-bs-theme for Bootstrap. Load in <head> so there is no flash. */
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
    var mode = pref.mode === "dark" || (pref.mode === "auto" && mq.matches) ? "dark" : "light";
    root.dataset.mode = mode;
    root.setAttribute("data-bs-theme", mode); /* Bootstrap's own color-mode switch */
    root.style.setProperty("--h", pref.hue);
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(pref)); } catch (e) {} }
  apply();
  mq.addEventListener("change", apply);

  /* Appearance menu built on Bootstrap's dropdown (data-bs-toggle="dropdown"), so it opens, closes and handles Esc/outside clicks itself. */
  function mount(host) {
    host.innerHTML =
      '<div class="dropdown">' +
      '<button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">Appearance</button>' +
      '<div class="dropdown-menu dropdown-menu-end p-3 appearance-menu">' +
      '<div class="small text-body-secondary mb-1">Mode</div>' +
      '<div class="btn-group w-100 mb-3" role="group" aria-label="Color mode">' +
      MODES.map(function (m) { return '<button type="button" class="btn btn-sm btn-outline-secondary" data-mode="' + m[0] + '">' + m[1] + "</button>"; }).join("") +
      '</div><div class="small text-body-secondary mb-2">Accent color</div><div class="d-flex flex-wrap gap-2">' +
      HUES.map(function (h) { return '<button type="button" class="sw" style="--sw:' + h[1] + '" data-hue="' + h[1] + '" aria-label="' + h[0] + '" title="' + h[0] + '"></button>'; }).join("") +
      "</div></div></div>";
    var d = host.firstChild;
    function sync() {
      d.querySelectorAll("[data-mode]").forEach(function (b) { var on = b.dataset.mode === pref.mode; b.classList.toggle("active", on); b.setAttribute("aria-pressed", on); });
      d.querySelectorAll("[data-hue]").forEach(function (b) { b.setAttribute("aria-pressed", Number(b.dataset.hue) === pref.hue); });
    }
    d.addEventListener("click", function (e) {
      var b = e.target.closest("[data-mode],[data-hue]"); if (!b) return;
      if (b.dataset.mode) pref.mode = b.dataset.mode;
      if (b.dataset.hue) pref.hue = Number(b.dataset.hue);
      apply(); save(); sync();
    });
    sync();
  }
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-theme-controls]").forEach(mount);
  });
})();
