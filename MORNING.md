# Morning report — 2026-09-29

## Done overnight
- **Live address fixed: https://fetal-calc.netlify.app**: a placeholder page ("Under
  construction", no clinical content). It installs to the home screen and works offline.
  The URL is in `## Links` of the talk note, so the deck session can build the QR code.
- **Repo `rauscha/fetal-calc`** (private, `main`, SSH remote), pushed. Added to
  `~/repos/INDEX.md`; `~/trust-repos.sh` re-run.
- **`QUESTIONS.md`**: 19 questions, one batch. Nothing guessed. Where your talk brief already
  records a ruling (Hadlock growth curve, ACOG CO 700, Acharya free-loop S/D), the question points
  to it and asks you to confirm.
- **`PLAN.md`**: draft screens and flow, **waiting for your approval**.
- **App shell** in `site/`: home plus three placeholder screens, manifest, service worker, icons.
  Netlify publishes only `site/`, so the planning docs are never on the public web (checked:
  `/PLAN.md` gives 404).
- **No clinical math, coefficients or reference values.** The papers in `~/references/fetal-calc/`
  were not opened; I only listed their filenames.

## Needs you
1. **Answer `QUESTIONS.md`** (inline or by voice). This unblocks everything clinical.
2. **Approve or change `PLAN.md`.**
3. **Link Netlify to GitHub (browser, about 2 minutes).** Until then the site updates only when
   I deploy through the connector, so a push to `main` alone does not deploy yet.
   1. Open https://app.netlify.com/projects/fetal-calc → **Project configuration** →
      **Build & deploy** → **Continuous deployment** → **Link repository**.
   2. Choose **GitHub**, authorize the Netlify app, and give it access to **rauscha/fetal-calc**
      (it's private, so choose "Only select repositories" and add it).
   3. Branch **main**. Leave build command empty and publish directory `site` (`netlify.toml`
      already sets both). Save.
   4. Tell me when it's done and I'll push a test commit and confirm it deploys by itself.
4. **perinatology.com second check:** headless Chromium got Incapsula's "Request unsuccessful"
   page. I stopped there. Once the math exists I'll give you a short list of inputs to try in
   your own browser.

## Blocked / notes
- The Playwright MCP plugin looks for Google Chrome at `/opt/google/chrome/chrome`, which isn't
  installed. The bundled Chromium works from the command line, so this blocked nothing.
- The GitHub MCP plugin failed to connect ("Authorization header is badly formatted"). `gh` works,
  so nothing is blocked.

## Time
- Claude working time: **≈ 5 min** (turn 1, 22:45:45 → about 22:51 CDT).
- Wall-clock since turn 1: the same. It's one turn so far.
