# Sign-off — decided 2026-09-29 (turn 4)

> **Andrew's answers, 2026-09-29 13:34 CDT:** (1) **`table`**, pending a hand check on perinatology.com;
> (2) **use the formula**; (3) all six details agreed ("this looks great"; color on top left to my
> design judgment; CO 700 "is the newest"); (4) he'll link Netlify and run the perinatology.com
> inputs, with steps and numbers given in the session. Both gates are now set in `site/calc.js`, and
> `npm run validate` passes.

Written 2026-09-29, turn 3. The app is built on branch `calculator` (draft PR), but **no clinical
math is live**: production still shows the placeholder, and in the real build both percentiles
show "on hold" until you decide items 1 and 2. Each decision is a one-line change, then
`npm run validate` must pass before it can merge. Evidence for both is in `VALIDATION.md`.

## 1. Hadlock: which spread? (stopped under your Q12 rule)

The median is exact: the equation matches Table 1's 50th at all 31 weeks. But the paper describes
the spread three ways that don't agree, and only one reproduces its own table:

| Option | What it is | A baby at exactly Table 1's 10th / 3rd weight reads as | 10th / 3rd at 40 wk (Table 1: 3,004 / 2,714 g) |
|---|---|---|---|
| **`table`** | SD implied by Table 1 (13.27%), which is also the "±17% at the 10th/90th" on p. 133 | **10th / 3rd** | 3,004 / 2,716 g |
| `pct127` | "±12.7% (1 SD)", from the abstract and results | 9th / 2.4th | 3,030 / 2,755 g |
| `pct13` | "uniform at 13%", from the discussion | 9.6th / 2.7th | 3,016 / 2,734 g |
| `log012` | regression SD 0.12 on the log scale | 6th / 0.8th | 3,103 / 2,888 g |

**My recommendation: `table`.** It is the only option under which the app agrees with the
published percentile table, and so with anyone reading Table 1 or a chart printed from it. The
"below the 10th" callout then flips at exactly the paper's 10th-percentile weight. The perinatology.com check (VALIDATION.md
section 5) will also show which one that site uses.

**Reply with:** `table`, `pct127`, `pct13` or `log012`.

## 2. Acharya: weeks 19 and 21 of Table IV don't match the formula

At the other 21 weeks the appendix formula matches Table IV to within 0.01. At 19 and 21 weeks
every printed value sits 0.6–0.8% below it, while 20 and 22 match; the formula is a smooth curve,
so those two printed rows look like the odd ones out. The effect is limited to an S/D just above
the printed 95th at those two weeks (for example 5.67 to about 5.71 at 21 weeks), which the table
would flag and the formula would not. That band is far smaller than the measurement's own 13%
intraobserver variation.

- **A. Use the formula everywhere (my recommendation).** It is the paper's own model and is smooth
  across all weeks. VALIDATION.md keeps the two rows on record as a known discrepancy.
- B. Use the formula, but stop computing between 19w0d and 21w6d.
- C. Something else you prefer.

**Reply with:** A, B, or your choice.

## 3. Details I chose for you to confirm

You said go on the plan. These are the smaller calls I made while building; say if any should change.

1. **Source ranges for the "Extrapolated" flag:** Hadlock **10–41 weeks** (the paper says its model
   covers 10 to 41; the table stops at 40); Acharya **19–42 weeks** (its study span; the table
   stops at 41). The stricter option would be the tabulated spans, 10–40 and 19–41.
2. **Hard input limits** (the app computes nothing outside them and says to check the entry):
   GA 8w0d to 44w6d; EFW 1 to 7,000 g; S/D greater than 1.
3. **Percentile text:** whole numbers from 1 to 99, one decimal outside that. Near a cutoff it adds
   decimals so the number can't contradict the words (9.6th, never "10th" beside "Below the 10th").
4. **Position bar:** percentile scale drawn in z-score units (so the 3rd and 10th don't crowd
   together), ticks at your cutoffs plus the 50th, hatched beyond the 10th, cross-hatched beyond the
   3rd, hatched beyond the 95th, with a solid triangle marker.
5. **Each card shows its source** ("Hadlock 1991", "Acharya 2005, free loop") in small text under
   the title. That's a label, not interpretation.
6. **ACOG CO 700 is from 2017.** Your copy has no reaffirmation line, and acog.org refused the fetch, so
   whether it has been reaffirmed or replaced is unverified.

## 4. Things only you can do

- **Link Netlify to GitHub** (steps in `MORNING.md`). Once it's linked, this PR gets a deploy-preview
  link you can open on your phone, and merging the PR publishes the app.
- **perinatology.com**: try the six inputs in VALIDATION.md section 5 and note what it says.
