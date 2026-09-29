# fetal-calc

**Fetal %ile**: a small, offline, installable phone app (PWA) giving the estimated fetal weight
(EFW) percentile (Hadlock 1991) and the umbilical artery S/D percentile (Acharya 2005, free loop),
with gestational age from weeks + days or an EDD (ACOG CO 700). **In development: the live site
is a placeholder; the calculator is on branch `calculator` pending sign-off (`SIGN-OFF.md`).**

- Live: https://fetal-calc.netlify.app
- The app is `site/` (plain HTML/CSS/JS, no build step). Netlify publishes `site/` only, so the
  project docs in the repo root are never served.
- Run locally: `npm run serve`, then open http://localhost:8000.
- Test: `npm test`; release gate against the papers: `npm run validate` (writes `VALIDATION.md`).

Project docs: `QUESTIONS.md` (answered), `PLAN.md` (approved), `SIGN-OFF.md` (decisions pending),
`VALIDATION.md` (math vs the papers),
`BUILD-LOG.md` (turn-by-turn log of the build), `MORNING.md` (overnight report).
