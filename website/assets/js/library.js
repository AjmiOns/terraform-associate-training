/* Library registry: one entry per chapter. Files live in the repo's course/ and cheatsheets/ folders
   and are copied next to the site by tools/build-site.js, so paths below are relative to the site root.
   To add a chapter: drop the PDFs in course/ and cheatsheets/, then add one entry here. */
const CHAPTERS = [
  { n: "01", title: "Introduction to IaC and first deployment", quiz: "introduction", lab: "labs/01-first-deployment",
    desc: "IaC principles, how Terraform works, and preparing the environment for a first AWS deployment.",
    notes: { file: "course/01-introduction-iac-terraform.pdf", pages: 12 },
    answers: { file: "course/chapter01-answers.pdf", pages: 3 },
    sheet: { file: "cheatsheets/chapter01-cheatsheet.pdf", pages: 3 } },
  { n: "02", title: "Terraform workflow and resource management", quiz: "workflow",
    desc: "The write, plan, apply workflow, core CLI commands, reading a plan, resource vs data, and dependencies.",
    notes: { file: "course/02-workflow-terraform.pdf", pages: 9 },
    sheet: { file: "cheatsheets/chapter02-cheatsheet.pdf", pages: 3 } },
  { n: "03", title: "Variables, outputs and modules", 
    desc: "Inputs, outputs, complex types, where values come from, and organizing code into root and child modules.",
    notes: { file: "course/03-variables-outputs-modules.pdf", pages: 8 },
    sheet: { file: "cheatsheets/chapter03-cheatsheet.pdf", pages: 3 } }
];
const EXTRAS = [
  { title: "40-hour study roadmap", desc: "The three-week plan this tracker is built on: 20 study sessions and one flex day.", file: "Terraform_Associate_004_Study_Roadmap.pdf", pages: 7 }
];
const LIB = {
  esc: (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])),
  /* every file the reader may open, with its section for breadcrumbs and prev/next */
  files() {
    const out = [];
    CHAPTERS.forEach((c) => {
      if (c.notes) out.push({ kind: "courses", title: `Chapter ${c.n}: ${c.title}`, ...c.notes });
      if (c.answers) out.push({ kind: "courses", title: `Chapter ${c.n}: corrected answers`, ...c.answers });
    });
    EXTRAS.forEach((e) => out.push({ kind: "courses", title: e.title, file: e.file, pages: e.pages }));
    CHAPTERS.forEach((c) => { if (c.sheet) out.push({ kind: "cheatsheets", title: `Chapter ${c.n}: ${c.title}`, ...c.sheet }); });
    return out;
  },
  readUrl: (file) => "read.html?f=" + encodeURIComponent(file),
  pill: (p) => `<span class="meta">PDF, ${p} page${p === 1 ? "" : "s"}</span>`,
  row(n, title, desc, main, links) {
    const e = LIB.esc;
    return `<li class="list-group-item qrow lrow"><span class="qno">${e(n)}</span>
      <div class="qinfo"><h2>${e(title)}</h2><p>${e(desc)}</p></div>
      <div class="qstat">${LIB.pill(main.pages)}</div>
      <div class="qgo"><a class="btn btn-primary" href="${LIB.readUrl(main.file)}">Read</a><a class="btn btn-outline-secondary" href="${e(main.file)}" download>Download</a></div>
      ${links ? `<p class="related">${links}</p>` : ""}</li>`;
  },
  coursesHTML() {
    const rows = CHAPTERS.filter((c) => c.notes).map((c) => {
      const rel = [];
      if (c.answers) rel.push(`<a href="${LIB.readUrl(c.answers.file)}">Corrected answers</a>`);
      if (c.sheet) rel.push(`<a href="${LIB.readUrl(c.sheet.file)}">Cheatsheet</a>`);
      if (c.quiz) rel.push(`<a href="quiz/${c.quiz}.html">Quiz</a>`);
      if (c.lab) rel.push(`<a href="https://github.com/AjmiOns/terraform-associate-training/tree/main/${c.lab}" rel="noopener">Lab</a>`);
      return LIB.row(c.n, c.title, c.desc, c.notes, rel.length ? "Also: " + rel.join(", ") : "");
    });
    EXTRAS.forEach((x) => rows.push(LIB.row("PDF", x.title, x.desc, x, "")));
    return rows.join("");
  },
  sheetsHTML() {
    return CHAPTERS.filter((c) => c.sheet).map((c) => {
      const rel = [];
      if (c.notes) rel.push(`<a href="${LIB.readUrl(c.notes.file)}">Course notes</a>`);
      if (c.quiz) rel.push(`<a href="quiz/${c.quiz}.html">Quiz</a>`);
      return LIB.row(c.n, c.title, c.desc, c.sheet, rel.length ? "Also: " + rel.join(", ") : "");
    }).join("");
  }
};
