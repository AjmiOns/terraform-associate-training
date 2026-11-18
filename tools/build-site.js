#!/usr/bin/env node
/* Assembles the publishable site in _site/ : everything in website/ plus the PDFs that live
   in course/, cheatsheets/ and the repo root. Also used for local preview:
     node tools/build-site.js && npx serve _site     (or: python3 -m http.server -d _site) */
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const out = path.join(root, "_site");
fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(path.join(root, "website"), out, { recursive: true });
for (const dir of ["course", "cheatsheets"]) {
  const src = path.join(root, dir);
  if (fs.existsSync(src)) fs.cpSync(src, path.join(out, dir), { recursive: true, filter: (f) => !fs.statSync(f).isFile() || f.endsWith(".pdf") });
}
for (const f of fs.readdirSync(root)) if (f.endsWith(".pdf")) fs.copyFileSync(path.join(root, f), path.join(out, f));
console.log("Built _site/ with", fs.readdirSync(out).length, "top-level entries");
