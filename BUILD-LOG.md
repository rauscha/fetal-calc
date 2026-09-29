# fetal-calc — build log

> **Tracked build complete: 2026-09-29, 14:04:46 CDT (turn 7).** Andrew ended the turn-by-turn record
> here. Later work (Friday's dedication-line rehearsal, the report to the slide deck) is not logged.

| | |
|---|---|
| **Turns** | 7 |
| **Claude working time** | **≈ 38 min** (transcript: 35 m 36 s over turns 1–6, plus about 3 min in turn 7). By `date` in each turn: 39 m 38 s. See "Time check" below. |
| **Andrew's answering time inside turns** | 9 m 01 s (the five question blocks in turn 2, plus one choice in turn 6) |
| **Wall-clock since turn 1** | 15 h 19 m (2026-09-28 22:45:36 → 2026-09-29 14:04:46 CDT; he slept overnight and worked in between) |
| **Live URL** | **https://fetal-calc.netlify.app**: Fetal %ile 1.0.0, live since 2026-09-29 13:51 CDT |

**Where things stand**
1. **The app is live** (v1.0.0), installable and offline. Every validation check passes, including a blind perinatology.com check (6/6).
2. A push to `main` publishes the site automatically, in about 5 seconds. The repo is public, which Netlify's free plan requires for that.
3. The Netlify badge is off; the footer's verify line is clear.
4. Next, not logged: rehearse Friday's dedication line, and send highlights from this log to the deck session.

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

---

## Turn 3 — 2026-09-29, 07:39:49 → 07:52:59 CDT (13 m 10 s)

**Asked:** Go ahead and start building; he'll do the Netlify–GitHub link later today. Keep working
until I can't, and he'll correct things when I'm done. He approved the new icon.

**Did:** Opened the three papers for the first time. Read Hadlock's equation and Table 1 off the page
images (the PDF is a scan) and Acharya's S/D formula and Table IV (signs confirmed on the image),
plus ACOG's 280-day rule. Wrote the math as one small file (`site/calc.js`) and a validator that runs
that same file against every published value and writes `VALIDATION.md`.

The check found **two mismatches, and the work stopped at both, as Andrew's rules require**:
- **Hadlock:** the median matches Table 1 exactly at all 31 weeks, but the paper states the spread
  three ways (12.7%, 13%, and 0.12 on the log scale). None of them reproduces Table 1, which is
  exactly ±17%/±25% of the median. Depending on the choice, a baby at the table's own 10th percentile
  reads as the 10th, 9th or 6th. Also found a misprint: the 30-week 97th is printed 1,649 g (should
  be about 1,949 g).
- **Acharya:** 189 of 207 table cells match the formula to within 0.01; weeks 19 and 21 are
  0.6–0.8% off while their neighbours match.

Kept building everything that doesn't depend on those answers: the calculator screen, the About
screen, the colorblind-safe result display (number, ▼/▲ words, hatched position bar), the
extrapolation flag, the EDD date math, and 8 automated tests. Both percentiles are gated to show
"on hold" until he signs off. Moved the work to a branch + draft PR so nothing clinical can reach
the public site by accident once Netlify auto-deploys `main`. Wrote `SIGN-OFF.md` with options and
recommendations, and made a preview image with the gates switched on in a scratch copy only.

Along the way I also:
- replaced two blocks of math constants I'd typed from memory (normal-distribution helpers) with
  methods that need none, and checked them against Python's to 1e-14;
- fixed a CSS edit that wiped two color variables;
- caught a display edge case where "3.000th" could sit beside "Below the 3rd".

**Changed:** branch `calculator`: `site/calc.js`, `site/app.js`, `site/app.css`, `site/index.html`
(calculator + About), `site/sw.js` (v0.1.0), `validation/` (transcribed tables + validator),
`VALIDATION.md`, `SIGN-OFF.md`, `tests/calc.test.mjs`, `package.json`, `PLAN.md` (approved),
`CLAUDE.md`, `README.md`, this log. Draft PR opened. Production unchanged (placeholder v0.0.2).

**Tip:** Decide *before* building what happens if the check fails ("stop and show me"). When a
mismatch turned up, there was no temptation to paper over it; the rule was already written.

**Tip:** Make the app's own code the thing that gets checked. The validator imports the same file
the phone runs, so a passing report means the app is right, not a copy of it.

**Tip:** Read numbers off the page image, not the PDF's text layer. The text layer here had dropped
every minus sign from the formulas.

**Tip:** Keep unapproved work off the branch that auto-publishes. A branch + PR gives you a
preview link without risking the live site.

---

## Turn 4 — 2026-09-29, 13:34:01 → 13:35:13 CDT (1 m 12 s)

**Asked:** Sign-off answers. (1) Hadlock `table`, but confirm on perinatology.com, so tell him what to
enter. (2) Use the Acharya formula. (3) Agreed all six details; "this looks great", and color on
top is my design call; ACOG CO 700 is the newest. (4) Give him the Netlify steps and the
perinatology.com numbers to run, and he'll report back.

**Did:** Set both gates in `site/calc.js` with the decision recorded beside each, updated the
validator so the Acharya weeks 19/21 rows stay on record as an accepted table discrepancy (still
shown in bold, not hidden), and re-ran it: every check passes. Tests updated (9 pass). Picked six
perinatology.com inputs spread across the weeks, sent **without the expected answers** so his
check is blind. Kept the PR as a draft until his numbers come back. Left color off: the results
already read fully in grayscale, and a tint on a clinical readout adds noise without information.

**Changed:** `site/calc.js` (gates set), `validation/validate.mjs`, `VALIDATION.md` (all pass),
`tests/calc.test.mjs`, `SIGN-OFF.md` (answers), `README.md`, `CLAUDE.md`, this log. Branch
`calculator` pushed; production unchanged.

**Tip:** When you ask someone to double-check a number, give them the inputs but not the answer
you expect. Their check is then independent, not an echo.

---

## Turn 5 — 2026-09-29, 13:42:41 → 13:44:17 CDT (1 m 36 s)

**Asked:** perinatology.com results for the six blind inputs (10.0, 3.0, 10.0, 50.0, 4.9, 11.6%,
from its Fetal Biometry 5.0 page with EFW entered directly, screenshot attached). The Netlify page
didn't have the options I described; help him find where to go.

**Did:** All six matched the app's chosen Hadlock method (`table`) to the site's one decimal; recorded
them in the validator, which now carries a sixth summary check (PASS). Caught and fixed two wrong
sentences in my own write-up by testing them against the numbers ("none of the other methods match":
false at the 50th row; "5 of 6": `log012` actually misses all 6). Looked up Netlify's current docs:
the repository link moved to **Project configuration → Developer settings → Continuous deployment
→ Repository → Link repository**. His Netlify screenshot didn't come through, so I gave the steps
from the docs. Marked PR #1 ready for review.

**Changed:** `validation/validate.mjs`, `VALIDATION.md` (6/6 checks pass), `SIGN-OFF.md`, this log.
PR #1 marked ready. Production unchanged.

**Tip:** When a tool's menus don't match the instructions, have Claude check the vendor's current
docs instead of guessing. Menus get renamed, and the docs say where things moved.

**Tip:** Ask Claude to check its own summary sentences against the data. Two small overstatements
were caught this way before they reached the record.

---

## Turn 6 — 2026-09-29, 13:46:59 → 13:52:37 CDT (5 m 38 s)

**Asked:** He's done the Netlify steps; merge it now.

**Did:** Confirmed the link before touching anything: Netlify had built production from `main` by
itself (commit 837cc84, not a manual deploy), still the placeholder. Labelled this first real release
1.0.0 (footer and service worker, so installed phones refresh), corrected the stale Netlify steps
in `MORNING.md`, re-ran the tests (9 pass) and the validator (all pass), and went to merge.

The merge was refused while a check ran, and the check was Netlify's new deploy preview: **failed,
"Build blocked: Unrecognized Git contributor. This plan allows only verified account members to push
to private repos."** Netlify's free plan only builds private repos for verified contributors, and his
Netlify login has no GitHub account connected. Scanned the whole history before going public (no
PDFs, no credentials, no addresses; his email is on the commits; the two tables are transcribed as
numbers). He chose to make the repo public now (his Q17 plan, and the math is validated), which also
keeps Friday's commit from the phone's cloud session from being blocked. Made it public, then pushed
this log update to re-run the preview.
The preview then built. Checked that it served 1.0.0 with both signed-off settings and kept the docs
private, then merged PR #1 (merge commit 4c00a5d). **Live at 13:51:** the page reports 1.0.0; the
code downloaded from the live site gives 10.0 and 4.9 for two of his perinatology cases, and 95.0 at
Table IV's own 95th; `/PLAN.md` still returns 404. A screenshot of the live page showed a "Powered by
Netlify" badge injected over the footer's verify line. Netlify's docs say the free plan can switch it
off (Project configuration → General), with no redeploy; left that to him. Updated README,
`CLAUDE.md` (public repo required; badge), the index line and the talk note.

**Changed:** `site/index.html`, `site/sw.js` (v1.0.0), `MORNING.md`, `README.md`, `CLAUDE.md`, this
log; repo made **public**; PR #1 merged to `main` and live. Outside the repo: `~/repos/INDEX.md` line
and the talk note's `## Links` line updated to say the app is live.

**Tip:** Watch the first automatic deploy instead of assuming it works. This one was blocked by a
plan rule nobody had mentioned, and it surfaced on a preview, not on the live site.

**Tip:** Before you say "it's deployed", check what the live URL actually serves. A green merge only
means the code moved; fetching the page proves the right version is live.

---

## Turn 7 — 2026-09-29, 14:03:19 → 14:04:46 CDT (1 m 27 s)

**Asked:** He turned the Netlify badge off. Send a screenshot of the live app, and that concludes the
tracked portion: stop the timer and the turn-by-turn record. Separately, afterwards: the dedication
line change and a report of what we did for Friday's slide deck.

**Did:** Confirmed the badge script is gone from the live page. Took two screenshots of the **live**
site with values typed into it: 30w 0d / 1,200 g / S/D 4.3 (4th, "▼ Below the 10th"; 97th, "▲ Above
the 95th") in light mode, and 34w 2d / 2,150 g / S/D 2.6 (19th; 56th) in dark mode. Drove the
installed headless browser directly over its debugging protocol, so the images show the live code,
not a local copy. Sent both to his phone. Checked the time totals against this session's transcript
(below) and closed the log.

**Changed:** this log. (No app change.)

**Tip:** Close a build with a picture of the real thing, taken from the live address. It's the
simplest proof that what was approved is what people will get.

## Time check: `date` vs the session transcript

At the kickoff's request, each turn's `date` stamps were compared with the transcript's own
timestamps (from Andrew's prompt to Claude's last message in that turn). Answering time is the
time Andrew spent on Claude's multiple-choice questions inside a turn.

| Turn | Transcript span | of which Andrew answering | Claude working (transcript) | Claude working (`date`) |
|---|---|---|---|---|
| 1 | 4 m 55 s | 0 | 4 m 55 s | 4 m 22 s |
| 2 | 12 m 53 s | 8 m 52 s | 4 m 01 s | 12 m 13 s (included his answering) |
| 3 | 14 m 03 s | 0 | 14 m 03 s | 13 m 10 s |
| 4 | 1 m 43 s | 0 | 1 m 43 s | 1 m 12 s |
| 5 | 1 m 53 s | 0 | 1 m 53 s | 1 m 36 s |
| 6 | 8 m 02 s | 0 m 09 s | 7 m 53 s | 5 m 38 s |
| 7 | about 3 min | 0 | about 3 min | 1 m 27 s |
| **Total** | **≈ 47 min** | **9 m 01 s** | **≈ 38 min** | 39 m 38 s |

- The two agree to within seconds on most turns. The transcript runs a little longer because `date`
  was run a few seconds after each prompt and before the final reply and commit. In turn 6 the
  deploy checks came after the end stamp, hence the 2½-minute gap.
- The real correction is turn 2: two-thirds of it was Andrew answering questions. Claude's own
  working time for the whole build is about **38 minutes**. Andrew spent about 9 minutes answering
  questions in-session, plus his own offline steps (reading, the Netlify link, perinatology.com).
- Wall-clock from the first prompt to the live app: 15 h 05 m (22:45 to 13:51 the next day),
  almost all of it overnight or between sessions.
