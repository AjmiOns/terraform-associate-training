# Study site: how it works

Plain HTML, CSS and JavaScript. No build step and no dependencies. Everything the browser needs lives in `website/`.

```
website/
  index.html                 Tracker: plan readout, study plan (weeks expand on click), readiness, mock scores
  quiz/index.html            Quiz library
  quiz/<id>.html             One page per quiz
  data/quizzes/<id>.js       Questions for one quiz
  assets/css/base.css        Design tokens, light/dark themes, shell, shared components
  assets/css/tracker.css     Tracker page
  assets/css/quiz.css        Quiz library and quiz engine
  assets/js/theme.js         Mode and accent color
  assets/js/shell.js         Top bar and sidebar shared by every page
  assets/js/quizzes.js       Quiz registry (titles, descriptions)
  assets/js/quiz.js          Quiz and flashcard engine
  assets/js/tracker*.js      Tracker data and logic
tools/validate-quizzes.js    Data checks, run by GitHub Actions
.github/workflows/           validate.yml (checks) and pages.yml (deploys website/)
```

## Publish

Settings > Pages > Build and deployment > Source: **GitHub Actions**. Every push to `main` then validates the quizzes and deploys `website/`.

## Add a quiz

1. Copy `website/quiz/workflow.html` to `website/quiz/<id>.html` and change the title, `data-quiz` and the data script path.
2. Create `website/data/quizzes/<id>.js` with `window.QUIZ = { id, chapter, title, questions }`.
3. Add an entry to `website/assets/js/quizzes.js`.
4. Run `node tools/validate-quizzes.js`.

Each question: `{ q, options, answer, explain }`. `answer` is an index, or an array of indexes when several are correct (the quiz tells the learner how many to choose). Add `fixed: true` to keep option order, for True/False. Do not declare top-level `const` names in data files: the library page loads them all into one page.

## Change colors

Use the Appearance menu on any page. To change the default accent, edit `--h` (a hue from 0 to 360) in `website/assets/css/base.css`.

## Data and privacy

Progress lives in your browser's localStorage. Use Export backup on the tracker to save it as a file.
