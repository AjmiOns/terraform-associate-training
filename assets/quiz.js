/* Quiz engine. Each quiz page defines window.QUIZ (see quiz/data/*.js) and loads this file. */
(function () {
  const Q = window.QUIZ, KEY = "tf004-quiz-results", TARGET = 85;
  const root = document.getElementById("quiz");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const rich = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const answers = (q) => [].concat(q.answer);
  const results = () => { try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; } };
  function saveResult(pct) {
    const r = results(), prev = r[Q.id];
    r[Q.id] = { best: Math.max(pct, prev ? prev.best : 0), last: pct, date: new Date().toISOString().slice(0, 10) };
    try { localStorage.setItem(KEY, JSON.stringify(r)); } catch (e) {}
  }
  function validate() {
    const bad = (Q.questions || []).findIndex((q) => !q.q || !Array.isArray(q.options) || q.options.length < 2 || answers(q).some((i) => !(i >= 0 && i < q.options.length)));
    if (!Q || !Q.id || !Q.questions || !Q.questions.length || bad >= 0) { root.innerHTML = `<div class="banner">This quiz file has a data error${bad >= 0 ? " in question " + (bad + 1) : ""}. Check <code>quiz/data/${esc(Q && Q.id || "")}.js</code>.</div>`; return false; }
    return true;
  }
  const prep = (q) => ({ q: q.q, explain: q.explain || "", multi: answers(q).length > 1, opts: shuffleOpts(q) });
  let shuffleOn = true;
  function shuffleOpts(q) { const o = q.options.map((t, i) => ({ t, ok: answers(q).includes(i) })); return shuffleOn && !q.fixed ? shuffle(o) : o; }

  let S = null; // session state
  function begin(list, mode) {
    S = { mode, items: (shuffleOn ? shuffle(list) : list).map(prep), i: 0, sel: new Set(), checked: false, log: [], shown: false };
    render();
  }

  function head(extra) {
    return `<div class="quiz-head"><p class="crumb">${esc(Q.chapter)}</p><h1>${esc(Q.title)}</h1>${extra || ""}</div>`;
  }
  function renderStart() {
    const best = results()[Q.id];
    root.innerHTML = head(`<p class="sub">${Q.questions.length} questions. Some have more than one correct answer and say so.</p>`) +
      `<div class="qcard"><div class="start-grid"><button class="btn primary" data-a="start">Start quiz</button><button class="btn" data-a="cards">Study as flashcards</button></div>
      <label class="toggle"><input type="checkbox" id="shuf" ${shuffleOn ? "checked" : ""}> Shuffle questions and answers</label>
      ${best ? `<p class="sub">Best score ${best.best}%. Last attempt ${best.last}% on ${esc(best.date)}.</p>` : ""}</div>`;
  }
  function bar() {
    const n = S.items.length;
    return `<div class="qbar" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${S.i + (S.checked ? 1 : 0)}"><i style="width:${((S.i + (S.checked ? 1 : 0)) / n) * 100}%"></i></div><div class="qmeta"><span>Question ${S.i + 1} of ${n}</span><span>${S.log.filter((x) => x.ok).length} correct</span></div>`;
  }
  function renderQuestion() {
    const it = S.items[S.i], letters = "ABCDEFGH";
    const opts = it.opts.map((o, k) => {
      let cls = "opt";
      if (S.checked) cls += o.ok ? (S.sel.has(k) ? " ok" : " missed") : S.sel.has(k) ? " bad" : "";
      return `<li><button type="button" class="${cls}" data-k="${k}" aria-pressed="${S.sel.has(k)}" ${S.checked ? "disabled" : ""}><span class="key">${letters[k]}</span><span>${rich(o.t)}</span></button></li>`;
    }).join("");
    let fb = "";
    if (S.checked) {
      const last = S.log[S.log.length - 1];
      fb = `<div class="verdict ${last.ok ? "ok" : "bad"}" role="status"><strong>${last.ok ? "Correct." : "Not quite."}</strong>${it.explain ? `<p>${rich(it.explain)}</p>` : ""}</div>`;
    }
    const lastQ = S.i === S.items.length - 1;
    root.innerHTML = head(bar()) + `<div class="qcard"><h2 class="qtext">${rich(it.q)}</h2>${it.multi ? `<p class="qhint">Select all that apply.</p>` : `<p class="qhint">Select one answer. Keys 1-${it.opts.length} choose, Enter confirms.</p>`}<ul class="opts">${opts}</ul>${fb}
      <div class="qactions"><a class="btn" href="" data-a="quit">Quit</a><span class="spacer"></span>${S.checked ? `<button class="btn primary" data-a="next" id="main-act">${lastQ ? "See results" : "Next question"}</button>` : `<button class="btn primary" data-a="check" id="main-act" ${S.sel.size ? "" : "disabled"}>Check answer</button>`}</div></div>`;
  }
  function renderCard() {
    const it = S.items[S.i], n = S.items.length;
    const ans = it.opts.filter((o) => o.ok).map((o) => `<li>${rich(o.t)}</li>`).join("");
    root.innerHTML = head(`<div class="qbar"><i style="width:${((S.i + 1) / n) * 100}%"></i></div><div class="qmeta"><span>Card ${S.i + 1} of ${n}</span></div>`) +
      `<div class="qcard flip"><h2 class="qtext">${rich(it.q)}</h2>${S.shown ? `<ul class="review" style="margin:0"><li><strong>${it.multi ? "Answers" : "Answer"}</strong><ul>${ans}</ul>${it.explain ? `<p class="why">${rich(it.explain)}</p>` : ""}</li></ul>` : ""}
      <div class="qactions"><a class="btn" href="" data-a="quit">Back</a><span class="spacer"></span><button class="btn" data-a="prev" ${S.i ? "" : "disabled"}>Previous</button>${S.shown ? `<button class="btn primary" data-a="cnext" id="main-act">${S.i === n - 1 ? "Finish" : "Next card"}</button>` : `<button class="btn primary" data-a="reveal" id="main-act">Show answer</button>`}</div></div>`;
  }
  function renderResults() {
    const n = S.items.length, ok = S.log.filter((x) => x.ok).length, pct = Math.round((ok / n) * 100);
    if (S.mode === "quiz") saveResult(pct);
    const missed = S.log.filter((x) => !x.ok);
    const review = missed.map((m) => `<li>${rich(m.item.q)}<p class="ans">${m.item.opts.filter((o) => o.ok).map((o) => rich(o.t)).join("; ")}</p>${m.item.explain ? `<p class="why">${rich(m.item.explain)}</p>` : ""}</li>`).join("");
    root.innerHTML = head() + `<div class="qcard"><div class="score">${pct}%</div><p class="sub">${ok} of ${n} correct. ${pct >= TARGET ? "That meets your 85% target." : "Your target is 85%. Review the misses below and retry."}</p>
      ${missed.length ? `<h2 style="font-size:18px;margin-top:20px">Review ${missed.length} missed</h2><ul class="review">${review}</ul>` : ""}
      <div class="qactions"><a class="btn" href="../index.html#quizzes">Back to tracker</a><span class="spacer"></span>${missed.length ? `<button class="btn" data-a="retry">Retry missed</button>` : ""}<button class="btn primary" data-a="restart" id="main-act">Restart quiz</button></div></div>`;
  }
  function render(top = true) {
    if (!S) renderStart(); else if (S.mode === "cards") renderCard(); else if (S.done) renderResults(); else renderQuestion();
    const m = document.getElementById("main-act"); if (m && S) m.focus({ preventScroll: true });
    if (top) window.scrollTo({ top: 0 });
  }
  function check() {
    const it = S.items[S.i];
    const ok = it.opts.every((o, k) => o.ok === S.sel.has(k));
    S.log.push({ item: it, ok }); S.checked = true; render(false);
  }
  function act(a) {
    if (a === "start") begin(Q.questions, "quiz");
    else if (a === "cards") begin(Q.questions, "cards");
    else if (a === "check" && S.sel.size) check();
    else if (a === "next") { if (S.i === S.items.length - 1) S.done = true; else { S.i++; S.sel = new Set(); S.checked = false; } render(); }
    else if (a === "reveal") { S.shown = true; render(); }
    else if (a === "cnext") { if (S.i === S.items.length - 1) { S = null; } else { S.i++; S.shown = false; } render(); }
    else if (a === "prev") { S.i--; S.shown = false; render(); }
    else if (a === "retry") { const keep = S.log.filter((x) => !x.ok).map((x) => x.item); const qs = keep.map((it) => ({ q: it.q, explain: it.explain, options: it.opts.map((o) => o.t), answer: it.opts.map((o, k) => (o.ok ? k : -1)).filter((k) => k >= 0), fixed: false })); begin(qs, "quiz"); }
    else if (a === "restart") begin(Q.questions, "quiz");
    else if (a === "quit") { S = null; render(); }
  }
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-a],[data-k]"); if (!b) return;
    if (b.dataset.a) { e.preventDefault(); act(b.dataset.a); return; }
    const k = +b.dataset.k, it = S.items[S.i];
    if (S.checked) return;
    if (it.multi) { S.sel.has(k) ? S.sel.delete(k) : S.sel.add(k); } else S.sel = new Set([k]);
    render(false); const nb = root.querySelector(`[data-k="${k}"]`); if (nb) nb.focus({ preventScroll: true });
  });
  root.addEventListener("change", (e) => { if (e.target.id === "shuf") shuffleOn = e.target.checked; });
  document.addEventListener("keydown", (e) => {
    if (!S || S.mode !== "quiz" || S.done || e.ctrlKey || e.metaKey || e.altKey) return;
    const n = S.items[S.i].opts.length;
    if (!S.checked && /^[1-9]$/.test(e.key) && +e.key <= n) { e.preventDefault(); root.querySelector(`[data-k="${+e.key - 1}"]`).click(); }
    else if (e.key === "Enter" && (e.target.closest("[data-k]") || (e.target.tagName !== "BUTTON" && e.target.tagName !== "A"))) { e.preventDefault(); act(S.checked ? "next" : "check"); }
  });
  if (validate()) render();
})();
