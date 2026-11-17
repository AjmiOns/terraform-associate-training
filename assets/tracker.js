const DEFAULT_TARGET = 120;
const PHASES = [["Theory", 35], ["Hands-on", 60], ["Exam questions", 25]];
const KEY = "tf004-tracker-v1";

function defaults() { return { done: {}, elapsed: {}, target: {}, running: null, checks: [], mocks: [] }; }
const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
function sanitize(raw) {
  const d = defaults();
  if (!isObj(raw)) return d;
  for (const k of ["done", "elapsed", "target"]) if (isObj(raw[k])) d[k] = raw[k];
  if (Array.isArray(raw.checks)) d.checks = raw.checks.map(Boolean);
  if (Array.isArray(raw.mocks)) d.mocks = raw.mocks.filter((m) => m && Number.isFinite(m.score)).map((m) => ({ score: Math.min(100, Math.max(0, m.score)), date: String(m.date || "") }));
  if (isObj(raw.running) && Number.isFinite(raw.running.day) && Number.isFinite(raw.running.start)) d.running = raw.running;
  return d;
}
function load() {
  try { const r = localStorage.getItem(KEY); if (r) return sanitize(JSON.parse(r)); } catch (e) {}
  return defaults();
}
const QKEY = "tf004-quiz-results";
function quizResults() { try { const r = JSON.parse(localStorage.getItem(QKEY) || "{}"); return isObj(r) ? r : {}; } catch (e) { return {}; } }
let state = load();
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

const $ = (id) => document.getElementById(id);
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const rich = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");
const targetMin = (d) => state.target[d] || DEFAULT_TARGET;
function elapsedMs(d) {
  const base = state.elapsed[d] || 0;
  return state.running && state.running.day === d ? base + (Date.now() - state.running.start) : base;
}
function fmt(ms) {
  const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  const p = (n) => String(n).padStart(2, "0");
  return p(h) + ":" + p(m) + ":" + p(x);
}
function fmtMin(m) { return m >= 60 ? Math.floor(m / 60) + "h" + (m % 60 ? " " + (m % 60) + "m" : "") : m + " min"; }

function phaseFill(d) {
  const frac = elapsedMs(d) / (targetMin(d) * 60000);
  let start = 0;
  return PHASES.map(([, min]) => {
    const len = min / 120;
    const f = Math.max(0, Math.min(1, (frac - start) / len));
    start += len;
    return f;
  });
}
function currentPhase(d) {
  const frac = elapsedMs(d) / (targetMin(d) * 60000);
  if (frac >= 1) return "Time is up";
  let start = 0;
  for (const [name, min] of PHASES) { start += min / 120; if (frac < start) return name; }
  return "Time is up";
}

function cardHTML(s) {
  const w = WEEKS[s.week - 1], d = s.day;
  const running = state.running && state.running.day === d;
  const done = !!state.done[d];
  const ms = elapsedMs(d), tmin = targetMin(d);
  const over = ms >= tmin * 60000;
  const fills = phaseFill(d);
  const seg = PHASES.map(([, min], i) => `<div style="width:${(min / 120) * 100}%"><i style="width:${fills[i] * 100}%"></i></div>`).join("");
  const lbl = PHASES.map(([n, min]) => `<span style="width:${(min / 120) * 100}%">${n} ${Math.round(min * tmin / 120)}m</span>`).join("");
  return `<article class="card ${w.cls}${done ? " is-done" : ""}${running ? " is-running" : ""}" id="card-${d}">
    <div class="day"><small>Day</small><b>${d}</b></div>
    <div class="body">
      <p class="topics">${rich(s.topics)}</p>
      <p class="exercise"><b>Exercise:</b> ${rich(s.exercise)}</p>
    </div>
    <div class="timer">
      <div class="timer-row">
        <span class="clock${over ? " over" : ""}" id="clock-${d}">${fmt(ms)}</span>
        <span class="of">of ${fmtMin(tmin)}</span>
        <span class="phase${running ? " on" : ""}" id="phase-${d}">${running || ms > 0 ? currentPhase(d) : "Not started"}</span>
        <span class="spacer"></span>
        <button class="btn primary" type="button" data-act="${running ? "pause" : "start"}" data-day="${d}">${running ? "Pause" : ms > 0 ? "Resume" : "Start"}</button>
        <button class="btn" type="button" data-act="reset" data-day="${d}" ${ms === 0 ? "disabled" : ""}>Reset</button>
      </div>
      <div>
        <div class="seg" id="seg-${d}" aria-hidden="true">${seg}</div>
        <div class="seg-labels" aria-hidden="true">${lbl}</div>
      </div>
      <div class="timer-row">
        <span class="target">Session length
          <button class="btn small" type="button" data-act="less" data-day="${d}" aria-label="Shorten session by 15 minutes">-15</button>
          <output>${fmtMin(tmin)}</output>
          <button class="btn small" type="button" data-act="more" data-day="${d}" aria-label="Lengthen session by 15 minutes">+15</button>
        </span>
        <span class="spacer"></span>
        <label class="donecheck"><input type="checkbox" data-act="done" data-day="${d}" ${done ? "checked" : ""}> Done</label>
      </div>
    </div>
  </article>`;
}

function renderWeeks() {
  $("weeks").innerHTML = WEEKS.map((w) => {
    const list = SESSIONS.filter((s) => s.week === w.n);
    const dn = list.filter((s) => state.done[s.day]).length;
    return `<section class="week ${w.cls}" aria-label="${esc(w.title)}">
      <div class="week-head"><h2>${esc(w.title)}</h2><span class="goal">Target: ${esc(w.target)}</span><span class="count">${dn}/${list.length} done</span></div>
      <div class="sessions">${list.map(cardHTML).join("")}</div></section>`;
  }).join("");
}

function renderSummary() {
  const done = SESSIONS.filter((s) => state.done[s.day]).length;
  const logged = SESSIONS.reduce((a, s) => a + elapsedMs(s.day), 0) / 3600000;
  const planned = SESSIONS.reduce((a, s) => a + targetMin(s.day), 0) / 60;
  const cks = CHECKS.filter((_, i) => state.checks[i]).length;
  $("summary").innerHTML = `
    <div class="stat"><div class="lbl">Sessions done</div><div class="val">${done}<small> / ${SESSIONS.length}</small></div><div class="bar"><i style="width:${(done / SESSIONS.length) * 100}%"></i></div></div>
    <div class="stat"><div class="lbl">Hours logged</div><div class="val" id="hoursVal">${logged.toFixed(1)}<small> / ${planned.toFixed(0)} h</small></div><div class="bar"><i id="hoursBar" style="width:${Math.min(100, (logged / planned) * 100)}%"></i></div></div>
    <div class="stat"><div class="lbl">Readiness</div><div class="val">${cks}<small> / ${CHECKS.length}</small></div><div class="bar"><i style="width:${(cks / CHECKS.length) * 100}%"></i></div></div>`;
}

function renderChecks() {
  $("checks").innerHTML = CHECKS.map((t, i) => `<li><label class="check${state.checks[i] ? " on" : ""}"><input type="checkbox" data-check="${i}" ${state.checks[i] ? "checked" : ""}><span>${esc(t)}</span></label></li>`).join("");
  const n = CHECKS.filter((_, i) => state.checks[i]).length;
  const b = $("banner");
  const ready = n === CHECKS.length;
  b.className = "banner" + (ready ? " ready" : "");
  b.textContent = ready ? "All items ticked. You are ready to book the exam." : `${n} of ${CHECKS.length} ticked. ${CHECKS.length - n} to go before you book.`;
}

function renderMocks() {
  const list = state.mocks;
  $("mocks").innerHTML = list.map((m, i) => `<li class="mock"><span class="score">${m.score}%</span><span class="pill ${m.score >= 85 ? "pass" : "low"}">${m.score >= 85 ? "On target" : "Below 85%"}</span><span class="when">${esc(m.date)}</span><button class="btn small" type="button" data-mock-del="${i}" aria-label="Remove score ${m.score}%">Remove</button></li>`).join("");
  const s = $("mockSummary");
  if (!list.length) { s.textContent = "No mock exams logged yet."; return; }
  const last2 = list.slice(-2);
  const ok = last2.length === 2 && last2.every((m) => m.score >= 85);
  const best = Math.max(...list.map((m) => m.score));
  s.textContent = `Best ${best}%. ` + (ok ? "Your last two mocks are both at 85% or higher." : last2.length < 2 ? "Log at least two mocks to check consistency." : "Aim for two mocks in a row at 85% or higher.");
}

function renderNext() {
  const n = SESSIONS.find((x) => !state.done[x.day]);
  const el = $("next");
  if (!n) { el.innerHTML = `<div><h2>All ${SESSIONS.length} sessions done</h2><p class="sub">Finish the readiness checklist, then book the exam.</p></div><a class="btn primary" href="#ready-h">Go to checklist</a>`; return; }
  const running = state.running && state.running.day === n.day;
  el.innerHTML = `<div><p class="sub">Next up</p><h2>Day ${n.day}</h2><p class="topics">${rich(n.topics)}</p></div><a class="btn primary" href="#card-${n.day}">${running ? "Open running timer" : "Go to session"}</a>`;
}
function renderQuizzes() {
  const res = quizResults();
  $("quizList").innerHTML = QUIZZES.map((q) => {
    const r = res[q.id];
    const badge = r ? `<span class="pill ${r.best >= 85 ? "pass" : "low"}">Best ${r.best}%</span>` : `<span class="pill">Not taken</span>`;
    return `<li><a class="qlink" href="${esc(q.href)}"><span class="qnum">${esc(q.chapter)}</span><span class="qtitle">${esc(q.title)}</span>${badge}</a></li>`;
  }).join("");
}
function renderAll() {
  renderSummary(); renderNext(); renderWeeks(); renderChecks(); renderMocks(); renderQuizzes();
  if (!state.running) document.title = "Terraform 004 Study Tracker";
}

function pauseRunning() {
  if (state.running) {
    const d = state.running.day;
    state.elapsed[d] = (state.elapsed[d] || 0) + (Date.now() - state.running.start);
    state.running = null;
  }
}

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-act]");
  if (b && b.tagName === "BUTTON") {
    const d = +b.dataset.day, a = b.dataset.act;
    if (a === "start") { pauseRunning(); state.running = { day: d, start: Date.now() }; }
    else if (a === "pause") pauseRunning();
    else if (a === "reset") { if (state.running && state.running.day === d) state.running = null; state.elapsed[d] = 0; }
    else if (a === "less") state.target[d] = Math.max(15, targetMin(d) - 15);
    else if (a === "more") state.target[d] = Math.min(300, targetMin(d) + 15);
    save(); renderAll();
    return;
  }
  const del = e.target.closest("[data-mock-del]");
  if (del) { state.mocks.splice(+del.dataset.mockDel, 1); save(); renderMocks(); }
});
document.addEventListener("change", (e) => {
  const t = e.target;
  if (t.dataset.act === "done") {
    const d = +t.dataset.day;
    state.done[d] = t.checked;
    if (t.checked && state.running && state.running.day === d) pauseRunning();
    save(); renderAll();
  } else if (t.dataset.check !== undefined) {
    state.checks[+t.dataset.check] = t.checked;
    save(); renderSummary(); renderChecks();
  }
});
$("mockForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const v = Math.round(Number($("mockScore").value));
  if (!(v >= 0 && v <= 100)) return;
  state.mocks.push({ score: v, date: new Date().toLocaleDateString(undefined, { day: "numeric", month: "short" }) });
  $("mockScore").value = "";
  save(); renderMocks();
});
let resetArmed = false, resetTimer = null;
$("resetAll").addEventListener("click", (e) => {
  if (!resetArmed) {
    resetArmed = true; e.target.textContent = "Click again to erase everything";
    resetTimer = setTimeout(() => { resetArmed = false; e.target.textContent = "Reset all progress"; }, 4000);
  } else {
    clearTimeout(resetTimer); resetArmed = false; e.target.textContent = "Reset all progress";
    state = defaults(); save(); renderAll();
  }
});

setInterval(() => {
  if (!state.running) return;
  const d = state.running.day, ms = elapsedMs(d), tmin = targetMin(d);
  const c = $("clock-" + d);
  if (c) {
    c.textContent = fmt(ms);
    c.classList.toggle("over", ms >= tmin * 60000);
    $("phase-" + d).textContent = currentPhase(d);
    const fills = phaseFill(d);
    $("seg-" + d).querySelectorAll("i").forEach((el, i) => { el.style.width = fills[i] * 100 + "%"; });
  }
  const logged = SESSIONS.reduce((a, s) => a + elapsedMs(s.day), 0) / 3600000;
  const planned = SESSIONS.reduce((a, s) => a + targetMin(s.day), 0) / 60;
  $("hoursVal").innerHTML = `${logged.toFixed(1)}<small> / ${planned.toFixed(0)} h</small>`;
  $("hoursBar").style.width = Math.min(100, (logged / planned) * 100) + "%";
  document.title = (ms >= tmin * 60000 ? "Time is up" : fmt(ms)) + " - Day " + d;
}, 1000);
$("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify({ v: 1, tracker: state, quizzes: quizResults() }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "terraform-tracker-backup.json"; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});
$("importFile").addEventListener("change", async (e) => {
  const f = e.target.files[0]; e.target.value = "";
  if (!f) return;
  const msg = $("backupMsg");
  try {
    const data = JSON.parse(await f.text());
    if (!isObj(data) || !isObj(data.tracker)) throw new Error("bad shape");
    state = sanitize(data.tracker); save();
    if (isObj(data.quizzes)) try { localStorage.setItem(QKEY, JSON.stringify(data.quizzes)); } catch (x) {}
    renderAll(); msg.textContent = "Backup restored.";
  } catch (err) { msg.textContent = "That file is not a valid backup. Nothing was changed."; }
});
window.addEventListener("storage", (e) => { if (e.key === KEY || e.key === QKEY) { state = load(); renderAll(); } });
document.addEventListener("visibilitychange", () => { if (!document.hidden) renderAll(); });

renderAll();
