# fetal-calc — build log

| | |
|---|---|
| **Turns** | 1 |
| **Claude working time** | 0 h 04 m 22 s (turn 1: 22:45:45 → 22:50:07 CDT) |
| **Wall-clock since turn 1** | 0 h 04 m 22 s (turn 1 started 2026-09-28 22:45:45 CDT) |
| **Live URL** | https://fetal-calc.netlify.app (placeholder, no clinical content) |

**Where things stand**
1. Waiting on Andrew's answers to `QUESTIONS.md` (below) and his go-ahead on `PLAN.md`.
2. Installable offline shell with placeholder screens is live; no math yet.
3. Repo `rauscha/fetal-calc` is private; GitHub → Netlify auto-deploy needs one browser step (see `MORNING.md`).
4. perinatology.com blocks headless browsers; the second check will be a list of inputs for Andrew to try.

## Open questions (waiting for Andrew)

See `QUESTIONS.md`: 19 questions in five groups (who and when; inputs; outputs; references;
look, name and sharing). Nothing clinical is built until they are answered.

---

## Turn 1 — 2026-09-28, 22:45:45 → 22:50:07 CDT (4 m 22 s)

**Asked:** Build a small offline phone app for EFW and umbilical artery Doppler percentiles for
the department, shown as the example in Friday's talk. Keep this log. Ask the deciding questions
in one batch before building, don't pick a clinical reference, plan the screens and wait for a go.
Coefficients only from the papers, validated in `VALIDATION.md`. Colorblind-safe results. Private
repo `rauscha/fetal-calc`, Netlify auto-deploy from `main`, a short URL fixed early for the QR
code. He's asleep tonight: do only what doesn't need his answers, then write `MORNING.md`.

**Did:** Wrote the question batch and a draft plan, built the installable offline shell with
placeholder screens, created the private repo, created the Netlify site and deployed the
placeholder, and recorded the URL for the deck session.

**Changed:** (commit 7eac9d9, plus this timing fix)
- New repo `rauscha/fetal-calc` (private, `main`): `QUESTIONS.md`, `PLAN.md` (draft, awaiting
  approval), `site/` (index.html, manifest, service worker, icons), `netlify.toml`, `README.md`,
  `CLAUDE.md`, `MORNING.md`, this log.
- Netlify site `fetal-calc` created via the claude.ai connector; placeholder deployed and checked
  live (`/` 200; `/PLAN.md` 404, so docs stay private).
- `~/repos/INDEX.md`: one line added; `~/trust-repos.sh` re-run (fetal-calc newly trusted).
- `~/mindscape/projects/work/AI-building-dept-talk.md` `## Links`: the live URL, for the QR code.
- Probed perinatology.com with headless Chromium: blocked by Incapsula. Stopped there, as asked.

**Tip:** Before any code, have it ask you its questions in one batch and write them to a file.
Your answers become the spec, and you can answer them from your phone.

**Tip:** Get a placeholder live on its final address on day one. The URL (and the QR code built
from it) is then fixed, and every later change just updates what's behind it.

**Tip:** Keep the app in its own folder (`site/`) and publish only that. Planning notes stay in
the repo but never end up on the public web.
