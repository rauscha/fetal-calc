# fetal-calc

A small, offline, installable phone app (PWA) for estimated fetal weight (EFW) percentile and
umbilical artery Doppler percentile. **In development: the live site is a placeholder and
calculates nothing yet.**

- Live: https://fetal-calc.netlify.app
- The app is `site/` (plain HTML/CSS/JS, no build step). Netlify publishes `site/` only, so the
  project docs in the repo root are never served.
- Run locally: `python3 -m http.server -d site 8000`, then open http://localhost:8000.

Project docs: `QUESTIONS.md` (open questions), `PLAN.md` (screens and flow, awaiting approval),
`BUILD-LOG.md` (turn-by-turn log of the build), `MORNING.md` (overnight report).
