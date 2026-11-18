#!/usr/bin/env node
/* Checks every quiz for data mistakes. Run: node tools/validate-quizzes.js */
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..", "website");
const MIN_QUESTIONS = 20;
const errors = [];
const fail = (m) => errors.push(m);

function load(file, expr) {
  const ctx = { window: {}, console };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(file, "utf8") + (expr ? "\n;this.__out = " + expr + ";" : ""), ctx, { filename: file });
  return expr ? ctx.__out : ctx.window.QUIZ;
}

const registry = load(path.join(root, "assets/js/quizzes.js"), "QUIZZES");
for (const entry of registry) {
  const dataFile = path.join(root, "data/quizzes", entry.id + ".js");
  const pageFile = path.join(root, entry.href);
  if (!fs.existsSync(dataFile)) { fail(`${entry.id}: missing ${path.relative(root, dataFile)}`); continue; }
  if (!fs.existsSync(pageFile)) fail(`${entry.id}: missing page ${entry.href}`);
  const quiz = load(dataFile);
  if (!quiz || quiz.id !== entry.id) { fail(`${entry.id}: data file id does not match registry`); continue; }
  const qs = quiz.questions || [];
  if (qs.length < MIN_QUESTIONS) fail(`${entry.id}: ${qs.length} questions, need at least ${MIN_QUESTIONS}`);
  const seen = new Set();
  qs.forEach((q, i) => {
    const at = `${entry.id} #${i + 1}`;
    if (!q.q || typeof q.q !== "string") fail(`${at}: missing question text`);
    if (seen.has(q.q)) fail(`${at}: duplicate question`); seen.add(q.q);
    if (!Array.isArray(q.options) || q.options.length < 2) return fail(`${at}: needs at least 2 options`);
    if (new Set(q.options).size !== q.options.length) fail(`${at}: duplicate options`);
    const ans = [].concat(q.answer);
    if (!ans.length || ans.some((a) => !Number.isInteger(a) || a < 0 || a >= q.options.length)) fail(`${at}: answer index out of range`);
    if (new Set(ans).size !== ans.length) fail(`${at}: repeated answer index`);
    if (ans.length >= q.options.length) fail(`${at}: every option is correct`);
    if (!q.explain || q.explain.length < 20) fail(`${at}: add an explanation (it is shown after each answer)`);
  });
  console.log(`${entry.id}: ${qs.length} questions`);
}
if (errors.length) { console.error("\n" + errors.map((e) => "  - " + e).join("\n")); process.exit(1); }
console.log("All quizzes valid.");
