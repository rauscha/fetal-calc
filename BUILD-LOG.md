# fetal-calc — build log

| | |
|---|---|
| **Turns** | 2 |
| **Claude working time** | 0 h 16 m 35 s, by `date` (turn 1: 4 m 22 s; turn 2: 12 m 13 s, which includes the time Andrew spent answering 5 question blocks) |
| **Wall-clock since turn 1** | 8 h 51 m (2026-09-28 22:45:45 → 2026-09-29 07:37 CDT; he slept in between) |
| **Live URL** | https://fetal-calc.netlify.app (placeholder, no clinical content) |

**Where things stand**
1. All 19 questions answered (`QUESTIONS.md`); one conflict (Q9 vs Q10) caught and clarified.
2. `PLAN.md` revised from the answers: **waiting for Andrew's go-ahead** before any clinical code.
3. App renamed **Fetal %ile**; new icon (bigger curves on a faint chart grid) is live.
4. GitHub → Netlify auto-deploy still needs Andrew's browser step (`MORNING.md`); deploys go through the connector until then.
5. perinatology.com blocks headless browsers; the second check will be inputs for Andrew to try.

## Questions

`QUESTIONS.md`: 19 questions, answered 2026-09-29 (turn 2), with each answer inline.

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

---

## Turn 2 — 2026-09-29, 07:24:38 → 07:36:51 CDT (12 m 13 s, including Andrew's answering time)

**Asked:** Make the icon's growth curves fill more of the square so they read at small sizes, and
add a very faint graph background so they read as growth curves on a chart. Then go through the
questions in blocks of four: show the options with a short explanation, and he picks.

**Did:** Redrew the icon (curves fill the square, a faint grid and axes behind them, curves spread
so they don't touch) and checked it at 256/96/48/32 px and in grayscale. Went through all 19
questions in 5 multiple-choice blocks and recorded each answer in `QUESTIONS.md`. Spotted a
conflict between two answers (cutoff callouts vs "number only") and asked about it in the next
block rather than guessing. Rewrote `PLAN.md` from the answers, renamed the app **Fetal %ile**,
and redeployed.

**Answers in brief:** users are MFM and the community affiliate's OB/GYNs (their radiology reads
list no percentiles); bedside and counselling; clinical aid with a verify line; GA as weeks + days,
EDD as of today, or EDD + scan date; EFW in grams only; UA S/D only; singleton note in About only;
exact percentile + cutoff words (EFW < 10th, < 3rd; S/D > 95th), no interpretation; extrapolate
outside a paper's range, clearly flagged; Hadlock from the model, checked against its table;
sources confirmed (Hadlock 1991, Acharya 2005, ACOG CO 700); plain look; keep
fetal-calc.netlify.app; public before Friday; store nothing; dedication line as the finale change.

**Changed:** `site/icons/*` (new icon), `site/index.html`, `site/manifest.webmanifest`, `site/sw.js`
(name, v0.0.2), `QUESTIONS.md` (answers), `PLAN.md` (revised, awaiting approval), this log.
Netlify deploy `6abbb0d8` (via the connector) is live.

**Tip:** Ask for multiple-choice questions with a one-line explanation per option. You answer
by tapping, and the options show you decisions you might not have known you had to make.

**Tip:** Read the answers back as a set. Two answers can each make sense and still contradict
each other; catching that before code is cheap, and after code it's a bug.

**Tip:** Check an icon at the size it'll really appear (32–48 px) and in grayscale, not just full size.
