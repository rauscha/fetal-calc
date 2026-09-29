# Plan: screens and flow

> **DRAFT: waiting for Andrew's approval.** Written 2026-09-28 before his answers to
> `QUESTIONS.md`. Every bracketed item depends on an answer. No clinical code is written until he
> says go.

## Shape

One installable web app (a PWA): a single page that works offline once opened, and can be added
to the phone's home screen. No accounts, no server, nothing stored. Hosted on Netlify; every push
to `main` publishes it.

## Screens

1. **Home**: app name, two large buttons: **Fetal weight percentile** and **Umbilical artery
   Doppler percentile**, plus a small **About & references** link and the disclaimer. [Or a single
   combined screen, if both are usually done together: see question 2.]

2. **Fetal weight percentile**
   - Gestational age: [weeks + days | EDD (+ scan date) | LMP], per question 4. When an EDD is
     used, the GA it works out to is shown back in words ("EDD 1 Jan 2027 → 26 weeks 3 days on
     the scan date"), so a wrong date is caught.
   - EFW in grams [or lb/oz; or biometry], per question 5.
   - Result: the percentile [exact / band / z-score], per question 8, as a large number **with its
     meaning in words** ("below the 10th percentile"), plus a **position marker on a horizontal
     bar** marked at the cutoffs Andrew names. Color never carries the result: the words, a symbol
     (▼ below / ▲ above / ● within), and the marker's position each say it on their own.
   - Out-of-range GA handled per question 11.

3. **Umbilical artery Doppler percentile**: same GA entry (carried over if already entered),
   [S/D | PI | RI] entry, [AEDF / REDF option], and the same result layout.

4. **About & references**: full citation of each source, what range of weeks each covers, the
   method used, a link to `VALIDATION.md`, and the version/date of the build.

## Flow

Open → pick a tool → enter GA → enter the measurement → the result updates as you type (no
submit button) → change any input and the result follows. A **Clear** button resets. Nothing is
saved between visits.

## Accessibility

- Every result state reads through words, a symbol and position; tested in grayscale.
- Large tap targets, numeric keypad for number fields, readable at arm's length.
- Light and dark themes by the phone's setting.

## Checking the math (after approval)

Coefficients come from the PDFs only. `VALIDATION.md` compares the app's output with each paper's
own published values at several gestational ages across its range; any mismatch stops the work.
Second check: perinatology.com's Hadlock calculator (headless browser, or a list of inputs for
Andrew to try by hand if it blocks bots).
