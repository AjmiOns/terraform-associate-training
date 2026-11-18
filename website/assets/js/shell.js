/* Shared top bar + sidebar. Pages set <body data-root="../" data-page="dashboard|quizzes|quiz" data-quiz="<id>"> */
(function () {
  const b = document.body, root = b.dataset.root || "", page = b.dataset.page || "", cur = b.dataset.quiz || "";
  const dash = page === "dashboard", here = page === "quiz" ? "quiz:" + cur : page;
  const link = (href, key, label, o) => {
    o = o || {};
    return `<a href="${href}" ${key === here ? 'aria-current="page"' : ""} ${o.attrs || ""}>${o.num ? `<span class="n">${o.num}</span>` : ""}<span class="t">${label}</span>${o.after || ""}</a>`;
  };
  const spy = (id, label) => link((dash ? "" : root + "index.html") + "#" + id, "", label, { attrs: `data-spy="${id}"` });

  function sidebar() {
    let st = {}; try { st = JSON.parse(localStorage.getItem("tf004-tracker-v1") || "{}") || {}; } catch (e) {}
    const total = 21, done = Object.values(st.done || {}).filter(Boolean).length, res = quizResultsAll();
    const quizzes = QUIZZES.map((q) => {
      const r = res[q.id];
      return link(root + q.href, "quiz:" + q.id, quizEsc(q.title), { num: quizEsc(q.chapter), attrs: `title="${quizEsc(q.title)}"`, after: r ? `<span class="pill ${r.best >= 85 ? "pass" : "low"}">${r.best}%</span>` : "" });
    }).join("");
    document.getElementById("sidebar").innerHTML =
      `<nav class="nav" aria-label="Study"><div class="nav-title">Study</div>
         ${link(root + "index.html", "dashboard", "Dashboard", { attrs: "data-home" })}${spy("plan", "Study plan")}${spy("readiness-sec", "Exam readiness")}${spy("mock-sec", "Mock exams")}</nav>
       <nav class="nav" aria-label="Quizzes"><div class="nav-title">Quizzes</div>${link(root + "quiz/index.html", "quizzes", "All quizzes")}${quizzes}</nav>
       <div class="side-prog"><span><b>${done}</b> of ${total} sessions done</span><div class="bar"><i style="width:${(done / total) * 100}%"></i></div></div>`;
  }
  window.refreshShell = sidebar;

  document.getElementById("topbar").innerHTML =
    `<button class="btn menu-btn" id="menuBtn" type="button" aria-label="Open navigation" aria-controls="sidebar" aria-expanded="false"><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
     <a class="brand" href="${root}index.html"><span class="logo" aria-hidden="true">&gt;_</span><span>Terraform <span class="bl">Associate </span>004</span></a><span class="spacer"></span><div data-theme-controls></div>`;
  sidebar();

  const btn = document.getElementById("menuBtn");
  const set = (open) => { b.classList.toggle("nav-open", open); btn.setAttribute("aria-expanded", open); };
  btn.addEventListener("click", () => set(!b.classList.contains("nav-open")));
  document.getElementById("scrim").addEventListener("click", () => set(false));
  document.getElementById("sidebar").addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });

  if (dash) {
    let tick = false;
    const update = () => {
      tick = false; let c = "";
      document.querySelectorAll("[data-spy]").forEach((a) => { const el = document.getElementById(a.dataset.spy); if (el && el.getBoundingClientRect().top < 140) c = a.dataset.spy; });
      document.querySelectorAll("[data-spy]").forEach((a) => (a.dataset.spy === c ? a.setAttribute("aria-current", "location") : a.removeAttribute("aria-current")));
      const home = document.querySelector("[data-home]");
      if (home) c ? home.removeAttribute("aria-current") : home.setAttribute("aria-current", "page");
    };
    addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener("load", update);
    const orig = window.refreshShell; window.refreshShell = () => { orig(); update(); };
  }
})();
