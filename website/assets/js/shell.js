/* Shared top bar + sidebar, built with Bootstrap (navbar, offcanvas, nav-pills, progress, badge).
   Pages set <body data-root="../" data-page="dashboard|courses|cheatsheets|quizzes|quiz" data-quiz="<id>"> */
(function () {
  const b = document.body, root = b.dataset.root || "", page = b.dataset.page || "", cur = b.dataset.quiz || "";
  const dash = page === "dashboard", here = page === "quiz" ? "quiz:" + cur : page;
  const link = (href, key, label, o) => {
    o = o || {};
    const on = key === here;
    return `<a class="nav-link${on ? " active" : ""}" href="${href}" ${on ? 'aria-current="page"' : ""} ${o.attrs || ""}>${o.num ? `<span class="n">${o.num}</span>` : ""}<span class="t">${label}</span>${o.after || ""}</a>`;
  };
  const spy = (id, label) => link((dash ? "" : root + "index.html") + "#" + id, "", label, { attrs: `data-spy="${id}"` });
  const group = (title, inner) => `<nav aria-label="${title}"><div class="side-title">${title}</div><div class="nav nav-pills flex-column side-nav">${inner}</div></nav>`;

  function sidebar() {
    let st = {}; try { st = JSON.parse(localStorage.getItem("tf004-tracker-v1") || "{}") || {}; } catch (e) {}
    const total = 21, done = Object.values(st.done || {}).filter(Boolean).length, res = quizResultsAll();
    const quizzes = QUIZZES.map((q) => {
      const r = res[q.id];
      return link(root + q.href, "quiz:" + q.id, quizEsc(q.title), { num: quizEsc(q.chapter), attrs: `title="${quizEsc(q.title)}"`, after: r ? `<span class="badge ${r.best >= 85 ? "pass" : "low"}">${r.best}%</span>` : "" });
    }).join("");
    document.getElementById("sideBody").innerHTML = `<div class="side-inner">
      ${group("Study", link(root + "index.html", "dashboard", "Dashboard", { attrs: "data-home" }) + spy("plan", "Study plan") + spy("readiness-sec", "Exam readiness") + spy("mock-sec", "Mock exams"))}
      ${group("Library", link(root + "courses.html", "courses", "Course notes") + link(root + "cheatsheets.html", "cheatsheets", "Cheatsheets"))}
      ${group("Quizzes", link(root + "quiz/index.html", "quizzes", "All quizzes") + quizzes)}
      <div class="side-prog"><span><b>${done}</b> of ${total} sessions done</span><div class="progress" role="progressbar" aria-label="Sessions done" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="${total}"><div class="progress-bar" style="width:${(done / total) * 100}%"></div></div></div></div>`;
  }
  window.refreshShell = sidebar;

  document.getElementById("topbar").innerHTML =
    `<nav class="navbar px-3 px-lg-4" aria-label="Top bar">
       <button class="btn btn-outline-secondary d-lg-none me-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#sideCanvas" aria-controls="sideCanvas" aria-label="Open navigation"><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
       <a class="navbar-brand brand" href="${root}index.html"><span class="logo" aria-hidden="true">&gt;_</span><span>Terraform <span class="bl">Associate </span>004</span></a>
       <div class="ms-auto" data-theme-controls></div>
     </nav>`;
  const side = document.getElementById("sidebar");
  side.innerHTML = `<div class="offcanvas-lg offcanvas-start" tabindex="-1" id="sideCanvas" aria-labelledby="sideTitle">
      <div class="offcanvas-header border-bottom"><span class="offcanvas-title brand" id="sideTitle"><span class="logo" aria-hidden="true">&gt;_</span>Terraform 004</span><button type="button" class="btn-close" data-bs-dismiss="offcanvas" data-bs-target="#sideCanvas" aria-label="Close"></button></div>
      <div class="offcanvas-body" id="sideBody"></div></div>`;
  sidebar();
  side.addEventListener("click", (e) => {
    const c = document.getElementById("sideCanvas");
    if (e.target.closest("a") && c.classList.contains("show") && window.bootstrap) bootstrap.Offcanvas.getOrCreateInstance(c).hide();
  });

  if (dash) {
    let tick = false;
    const update = () => {
      tick = false; let c = "";
      document.querySelectorAll("[data-spy]").forEach((a) => { const el = document.getElementById(a.dataset.spy); if (el && el.getBoundingClientRect().top < 140) c = a.dataset.spy; });
      document.querySelectorAll("[data-spy]").forEach((a) => { const on = a.dataset.spy === c; a.classList.toggle("active", on); on ? a.setAttribute("aria-current", "location") : a.removeAttribute("aria-current"); });
      const home = document.querySelector("[data-home]");
      if (home) { home.classList.toggle("active", !c); c ? home.removeAttribute("aria-current") : home.setAttribute("aria-current", "page"); }
    };
    addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener("load", update);
    const orig = window.refreshShell; window.refreshShell = () => { orig(); update(); };
  }
})();
