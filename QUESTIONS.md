# Questions before building — answered 2026-09-29

Written 2026-09-28, 22:5x CDT, before any clinical code. Answer inline (a word or two is
fine). Nothing clinical gets built until these are answered, and I have not guessed any of them.

Papers already in `~/references/fetal-calc/` (listed by filename only; not opened):
`Hadlock-1991-Radiology-in-utero-weight-standard.pdf`, `Acharya-2005-AJOG-UA-Doppler-indices.pdf`,
`ACOG-CO-700-2017-estimating-due-date.pdf`. The talk brief (`mfm-media/.decks/ai-building-talk/brief.md`)
also records rulings you made earlier today; I've pointed to them where they apply, but the
answer here is yours.

## A. Who uses it, and when

1. **Who is the user?** MFM attendings and fellows, residents, sonographers, L&D nurses, or all of
   them? This sets how much explanation sits on screen.
   > **Answer (2026-09-29):** MFM attendings/fellows, **and OB/GYNs at our community affiliate hospital, where the radiology ultrasound reads don't list percentiles.**
2. **Where and when is it used?** In the ultrasound reading room while signing a report, at the
   bedside on L&D, in clinic counselling, or for teaching?
   > **Answer (2026-09-29):** Bedside / L&D, and clinic counselling.
3. **Clinical tool or reference/teaching aid?** What should the disclaimer say (for example, "For
   use by clinicians; verify against your ultrasound report")?
   > **Answer (2026-09-29):** Clinical aid, with a verify note (short footer: "Clinical decision support. Verify against your ultrasound report and clinical judgment.").

## B. What goes in

4. **Gestational age entry.** Which of these should it accept: GA typed as weeks + days, an EDD,
   an LMP, or several? If an EDD, is GA figured as of **today** or as of a **scan date** I should
   also ask for? (Brief: ACOG CO 700 for GA from an EDD. Confirm?)
   > **Answer (2026-09-29):** Weeks + days; EDD as of today; EDD + scan date. (Not LMP.)
5. **Fetal weight entry.** Does the user type the **EFW in grams** from the ultrasound report, or
   the biometry (BPD, HC, AC, FL) for the app to compute EFW? (Brief: the Hadlock 1991 **growth
   curve**, not the Hadlock biometry formulas. Confirm?) Grams only, or pounds/ounces too?
   > **Answer (2026-09-29):** EFW in grams only (typed from the report).
6. **Doppler entry.** Umbilical artery **S/D** only, or also **PI** and **RI**? Measured at the
   free loop? (Brief: S/D, free loop, Acharya AJOG 2005. Confirm?) Should the user be able to mark
   **absent or reversed end-diastolic flow**, where S/D has no finite value?
   > **Answer (2026-09-29):** S/D only. (No PI, RI, or AEDF/REDF switch.)
7. **Twins or other groups** — singleton only, or should it say so on screen?
   > **Answer (2026-09-29):** Mention singleton-only in the About screen only, not on the calculator.

## C. What comes out

8. **How should results read?** An exact percentile (e.g. "7th percentile"), a band ("between the
   3rd and 10th"), a z-score, or a combination?
   > **Answer (2026-09-29):** Exact percentile (e.g. "7th percentile"), with meaning in words and a position marker.
9. **Which cutoffs get called out?** For example EFW below the 10th / below the 3rd / above the
   90th, and UA S/D above the 95th. Name the cutoffs you want and I'll use only those.
    > **Answer (2026-09-29):** EFW < 10th, EFW < 3rd, UA S/D > 95th. (Not EFW > 90th.)
10. **Interpretive wording.** Numbers only, or also a line of interpretation? If interpretation,
    tell me the guideline and wording to follow; I won't pick one.
    > **Answer (2026-09-29):** Number only: no interpretation. **Clarified:** number + cutoff words ("▼ Below the 10th percentile") and a marker at the Q9 cutoffs; "number only" means no diagnosis or management text.
11. **Outside a paper's range** (each paper covers a set span of weeks): refuse with a message,
    or show the value flagged as extrapolated?
    > **Answer (2026-09-29):** Show the value, flagged as extrapolated beyond the source's range.
12. **Hadlock percentile method.** Compute a continuous percentile from the paper's model and
    its SD, or interpolate between the percentile columns of its published table? (These can
    differ slightly; the one you pick is what `VALIDATION.md` tests.)
    > **Answer (2026-09-29):** Compute from the model; check it against the published table, and stop and show Andrew if they disagree at any week beyond a set tolerance.

## D. References

13. **Confirm the three sources** (or name others): EFW percentile standard, UA Doppler
    reference ranges, and the GA-from-EDD method. If you want a source not in the folder, tell me
    and I'll say exactly which PDF I need.
    > **Answer (2026-09-29):** Confirmed all three: Hadlock 1991 Radiology (growth curve), Acharya 2005 AJOG (free-loop UA S/D), ACOG CO 700 (GA from EDD).

## E. Look, name, and sharing

14. **Name on the home screen** and the phone icon label (short: about 12 characters shows
    under an icon).
    > **Answer (2026-09-29):** "Fetal %ile".
15. **Look:** plain and neutral, or UChicago Medicine branding? (The `uchicago-medicine-design`
    skill exists. If you want the logo on a public site, confirm that's allowed.)
    > **Answer (2026-09-29):** Plain, neutral. No institutional branding.
16. **Web address.** I'm reserving **`fetal-calc.netlify.app`** tonight so the QR code can be
    made. Keep it, or pick another `*.netlify.app` name, or a custom domain (e.g.
    `fetal.andrewrausch.com`) later?
    > **Answer (2026-09-29):** Keep **fetal-calc.netlify.app**.
17. **Repo visibility.** Private tonight, as you asked. Public before Friday, or stay private?
    > **Answer (2026-09-29):** Public before Friday (once the math is validated).
18. **Remembering inputs.** I plan to store nothing: no patient data saved, no analytics, no
    cookies. OK?
    > **Answer (2026-09-29):** Store nothing.
19. **The Friday live change.** Is the default still one line on the home screen such as "Made
    for UChicago OB/GYN, October 2", or something else?
    > **Answer (2026-09-29):** Dedication line on the home screen, e.g. "Made for UChicago OB/GYN, October 2".
