/* Quiz registry. To add a quiz: create quiz/<id>-quiz.html + quiz/data/<id>.js, then add one entry here. */
const QUIZZES = [
  { id: "introduction", chapter: "01", title: "Intro to IaC and first deployment", href: "quiz/introduction.html",
    desc: "IaC concepts, declarative vs imperative, providers, state basics and your first init, plan and apply." },
  { id: "workflow", chapter: "02", title: "Terraform workflow and resource management", href: "quiz/workflow.html",
    desc: "The core workflow, fmt and validate, saved plans, dependencies, for_each vs count and lifecycle rules." }
];
const QUIZ_META = {}; // id -> question count, filled by loadQuizMeta
function quizResultsAll() { try { const r = JSON.parse(localStorage.getItem("tf004-quiz-results") || "{}"); return r && typeof r === "object" ? r : {}; } catch (e) { return {}; } }
function quizEsc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function quizRows(root) {
  const res = quizResultsAll();
  return QUIZZES.map((q) => {
    const r = res[q.id], n = QUIZ_META[q.id], url = root + q.href;
    return `<li class="list-group-item qrow"><span class="qno">${quizEsc(q.chapter)}</span>
      <div class="qinfo"><h2>${quizEsc(q.title)}</h2><p>${quizEsc(q.desc)}</p></div>
      <div class="qstat"><span class="qcount">${n ? n + " questions" : ""}</span>
        <span class="qbest ${r ? (r.best >= 85 ? "pass" : "low") : ""}">${r ? "Best " + r.best + "%" : "Not taken"}</span>
        <div class="progress" role="progressbar" aria-label="Best score" aria-valuenow="${r ? r.best : 0}" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar" style="width:${r ? r.best : 0}%"></div></div></div>
      <div class="qgo"><a class="btn btn-primary" href="${url}?mode=quiz">${r ? "Retake" : "Start quiz"}</a><a class="btn btn-outline-secondary" href="${url}?mode=cards">Flashcards</a></div></li>`;
  }).join("");
}
function loadQuizMeta(root, done) {
  const ids = QUIZZES.filter((q) => !(q.id in QUIZ_META)).map((q) => q.id);
  (function next() {
    const id = ids.shift();
    if (!id) { if (done) done(); return; }
    const s = document.createElement("script");
    s.src = root + "data/quizzes/" + id + ".js";
    const fin = () => { s.remove(); next(); };
    s.onload = () => { if (window.QUIZ && window.QUIZ.id === id) QUIZ_META[id] = window.QUIZ.questions.length; fin(); };
    s.onerror = fin;
    document.head.appendChild(s);
  })();
}
