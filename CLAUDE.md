# CLAUDE.md — fetal-calc

Phone-first PWA: EFW percentile and umbilical artery Doppler percentile. Clinical decision
support, so the rules below are hard.

## Hard rules
- **Every coefficient and reference value comes from the source paper's PDF, never from memory.**
  PDFs live in `~/references/fetal-calc/` and are **never committed** (`*.pdf` is gitignored).
- Any math change must be re-checked against the papers' published values and recorded in
  `VALIDATION.md`. A mismatch stops the work.
- No meaning by hue alone: every result state reads through words, a symbol and position.
- Nothing is stored or sent: no analytics, no cookies, no saved inputs.
- Keep `BUILD-LOG.md` updated every turn and commit it with every push (see its header).

## Layout and deploy
- The app is `site/` only. `netlify.toml` publishes `site/`; the repo root holds docs.
- Netlify site `fetal-calc` (id `db2f8710-315d-40cf-baf9-79789854dcab`), URL
  https://fetal-calc.netlify.app. Once the GitHub link is made, a push to `main` deploys.
- Bump `VERSION` in `site/sw.js` (and the footer version) on every release so installed phones
  refresh.

## Run / test
`python3 -m http.server -d site 8000`. No build step, no dependencies.
