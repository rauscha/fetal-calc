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
- `AC_SOURCE` (null = AC percentile on hold): set 2026-09-29 to `'equation'` (Hadlock 1984 Table III
  footnote), chosen because it matches Andrew's hospital system 5/5 and perinatology.com.
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

## The Friday finale (2026-10-02): one command, nothing else

Andrew asks by voice from the Claude app on his phone, live at the end of his department talk, for a
dedication line under the title. Speed is the whole point: the room is waiting.

**Run exactly this, and nothing else** (no reading files first, no planning, no hand edits, no PR):

    node scripts/finale.mjs "<the line Andrew said>"

It adds or replaces `<p class="dedication">` under the calculator's header, bumps the version in
`site/sw.js` and both `<span class="ver">` tags, runs the tests, commits, pushes to `main` (the
whole deploy), then waits until the live site shows the line. Reply with its last line only, e.g.
`LIVE at 14.2 s: ... Press Reload.` To take the line out: `node scripts/finale.mjs --remove`.
`--dry-run` shows what would change and touches nothing. The script never touches `site/calc.js`.
Don't add a BUILD-LOG.md entry for it.

If the session started on a `claude/...` branch, that's fine: the script pushes `HEAD:main`.
