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

## Release gates (in `site/calc.js`)
- `HADLOCK_METHOD` (null = EFW percentile on hold) and `ACHARYA_SIGNED_OFF` (false = S/D on hold)
  are set **only** on Andrew's decision (`SIGN-OFF.md`). Set 2026-09-29: `'table'` and `true`.
  `npm run validate` must exit 0 before anything clinical merges to `main`.
- Work that touches the math goes on a branch + PR. `main` deploys to the public site.

## Layout and deploy
- The app is `site/` only. `netlify.toml` publishes `site/`; the repo root holds docs.
- Netlify site `fetal-calc` (id `db2f8710-315d-40cf-baf9-79789854dcab`), URL
  https://fetal-calc.netlify.app. Linked to GitHub 2026-09-29: **a push to `main` deploys**; PRs get
  deploy previews at `deploy-preview-<n>--fetal-calc.netlify.app`.
- **The repo must stay public.** Netlify's free plan blocks builds from private repos by
  "unrecognized Git contributors" (it blocked PR #1's first preview).
- Netlify injects a "Powered by Netlify" badge (bottom-right) unless it is switched off in
  Project configuration → General; it can cover the footer's verify line.
- Bump `VERSION` in `site/sw.js` (and the footer version) on every release so installed phones
  refresh.

## Run / test
- `npm test`: always-true checks on `site/calc.js` (node:test, no dependencies).
- `npm run validate`: the release gate. Runs the app's own math against the papers' tables
  (`validation/*.csv`, transcribed from the PDFs) and rewrites `VALIDATION.md`.
- `npm run serve`, then http://localhost:8000. No build step, no dependencies.
