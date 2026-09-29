# Plan: screens and flow

> **REVISED 2026-09-29 from Andrew's answers in `QUESTIONS.md`. Waiting for his go-ahead.**
> No clinical code is written until he approves. Items marked *(proposal)* are my suggestions
> for details the questions didn't cover; approve or change them.

## Who and where

MFM attendings and fellows, and OB/GYNs at the community affiliate whose radiology reads list an
EFW but no percentiles. Used at the bedside / on L&D and in clinic counselling. It's a clinical
aid, with a short verify line in the footer:
"Clinical decision support. Verify against your ultrasound report and clinical judgment."

## Shape

An installable offline web app named **Fetal %ile** at **fetal-calc.netlify.app**. Plain,
neutral look; no institutional branding. Stores nothing: every open starts blank; no analytics,
no cookies.

## Screens

**1. Calculator (the home screen)** *(proposal: one screen, not two, since a growth scan
usually gives both numbers; fewer taps at the bedside)*

- **Gestational age**, with three ways in (a segmented switch):
  - **Weeks + days** (two number fields).
  - **EDD, as of today**: GA = 280 days − (EDD − today), per ACOG CO 700.
  - **EDD + scan date**: the same, counted to the scan date.
  - The GA used is always read back in words, e.g. "GA used: 28 weeks 3 days (from EDD,
    as of 29 Sep 2026)", so a wrong date is caught.
- **EFW (grams)** → **EFW percentile** (Hadlock 1991 growth curve).
- **UA S/D** → **S/D percentile** (Acharya 2005, free loop).
- Each result updates as you type, with no submit button. Either field can be left empty.
- **Clear** button resets everything.
- Footer: the verify line, the dedication line on Friday, the version, and an **About** link.

**2. About**: full citations, the span of weeks each source covers (read from the PDFs), the
method (Hadlock computed from the paper's model, checked against its table), "Reference
populations: singleton pregnancies", and a link to `VALIDATION.md`.

## How a result reads

Every state reads through **words, a symbol and position**, never color:

```
EFW percentile
  7th                        ← exact percentile, large
  ▼ Below the 10th percentile ← cutoff words (only when a cutoff is crossed)
  |--3--10-----------50------------------|   ← bar with labeled ticks at the cutoffs,
       ▲                                        marker at the result's position
```

- Cutoffs (only these): EFW **below the 10th** (▼), EFW **below the 3rd** (▼▼, replaces the
  10th line), UA S/D **above the 95th** (▲).
- No interpretation, diagnosis or management text.
- *(proposal)* When no cutoff is crossed, no cutoff line is shown; the number and marker stand
  alone.
- *(proposal)* Whole-number percentiles from 1st to 99th; below 1 or above 99, one decimal
  (e.g. "0.4th"), so extremes aren't hidden.
- **Outside a source's span of weeks:** the value is still shown, with a label above it:
  "⚠ Extrapolated: GA is outside this source's range (X to Y weeks)."

## Checking the math (after approval)

- Coefficients come from the PDFs only; the PDFs are never committed.
- **Hadlock:** compute from the paper's model and SD; compare with its published percentile table
  at every week; if they disagree anywhere beyond a set tolerance, stop and show Andrew.
- **Acharya:** compare with the paper's published S/D percentiles at several weeks across its
  range.
- **ACOG:** check EDD → GA against worked dates.
- Results go in `VALIDATION.md`. Any mismatch stops the work.
- Second check: a short list of inputs for Andrew to try on perinatology.com in his own browser
  (it blocks headless browsers).

## After validation

Make the repo public (before Friday). Friday's live change: add the dedication line
"Made for UChicago OB/GYN, October 2" to the home screen, spoken from the phone and pushed.
