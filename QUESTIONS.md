# Questions before building — waiting for Andrew

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
2. **Where and when is it used?** In the ultrasound reading room while signing a report, at the
   bedside on L&D, in clinic counselling, or for teaching?
3. **Clinical tool or reference/teaching aid?** What should the disclaimer say (for example, "For
   use by clinicians; verify against your ultrasound report")?

## B. What goes in

4. **Gestational age entry.** Which of these should it accept: GA typed as weeks + days, an EDD,
   an LMP, or several? If an EDD, is GA figured as of **today** or as of a **scan date** I should
   also ask for? (Brief: ACOG CO 700 for GA from an EDD. Confirm?)
5. **Fetal weight entry.** Does the user type the **EFW in grams** from the ultrasound report, or
   the biometry (BPD, HC, AC, FL) for the app to compute EFW? (Brief: the Hadlock 1991 **growth
   curve**, not the Hadlock biometry formulas. Confirm?) Grams only, or pounds/ounces too?
6. **Doppler entry.** Umbilical artery **S/D** only, or also **PI** and **RI**? Measured at the
   free loop? (Brief: S/D, free loop, Acharya AJOG 2005. Confirm?) Should the user be able to mark
   **absent or reversed end-diastolic flow**, where S/D has no finite value?
7. **Twins or other groups** — singleton only, or should it say so on screen?

## C. What comes out

8. **How should results read?** An exact percentile (e.g. "7th percentile"), a band ("between the
   3rd and 10th"), a z-score, or a combination?
9. **Which cutoffs get called out?** For example EFW below the 10th / below the 3rd / above the
   90th, and UA S/D above the 95th. Name the cutoffs you want and I'll use only those.
10. **Interpretive wording.** Numbers only, or also a line of interpretation? If interpretation,
    tell me the guideline and wording to follow; I won't pick one.
11. **Outside a paper's range** (each paper covers a set span of weeks): refuse with a message,
    or show the value flagged as extrapolated?
12. **Hadlock percentile method.** Compute a continuous percentile from the paper's model and
    its SD, or interpolate between the percentile columns of its published table? (These can
    differ slightly; the one you pick is what `VALIDATION.md` tests.)

## D. References

13. **Confirm the three sources** (or name others): EFW percentile standard, UA Doppler
    reference ranges, and the GA-from-EDD method. If you want a source not in the folder, tell me
    and I'll say exactly which PDF I need.

## E. Look, name, and sharing

14. **Name on the home screen** and the phone icon label (short: about 12 characters shows
    under an icon).
15. **Look:** plain and neutral, or UChicago Medicine branding? (The `uchicago-medicine-design`
    skill exists. If you want the logo on a public site, confirm that's allowed.)
16. **Web address.** I'm reserving **`fetal-calc.netlify.app`** tonight so the QR code can be
    made. Keep it, or pick another `*.netlify.app` name, or a custom domain (e.g.
    `fetal.andrewrausch.com`) later?
17. **Repo visibility.** Private tonight, as you asked. Public before Friday, or stay private?
18. **Remembering inputs.** I plan to store nothing: no patient data saved, no analytics, no
    cookies. OK?
19. **The Friday live change.** Is the default still one line on the home screen such as "Made
    for UChicago OB/GYN, October 2", or something else?
