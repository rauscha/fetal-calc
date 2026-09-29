// Checks the app's own math (site/calc.js) against each paper's published values and writes
// VALIDATION.md. Run: node validation/validate.mjs   (exit code 1 if any check fails)
//
// Published values were transcribed from the PDFs into validation/*.csv:
//   hadlock_table1.csv   - Hadlock 1991, Table 1 (read off the page image at 300 dpi; the PDF is
//                          an OCR'd scan)
//   acharya_table4_sd.csv - Acharya 2005, Table IV (from the PDF's text layer)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as C from '../site/calc.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const csv = f => {
  const [head, ...lines] = fs.readFileSync(path.join(here, f), 'utf8').trim().split('\n');
  const keys = head.split(',');
  return lines.map(l => Object.fromEntries(l.split(',').map((v, i) => [keys[i], Number(v)])));
};
const f1 = x => x.toFixed(1), f2 = x => x.toFixed(2);
const sign = x => (x >= 0 ? '+' : '') + x;
const out = [];
const p = s => out.push(s);
let allPass = true;
const results = {};

// ------------------------------------------------------------------------------------------ Hadlock
const had = csv('hadlock_table1.csv');
const MISPRINT = { week: 30, col: 'p97' }; // printed 1,649 g: below that row's own 90th (1,824 g)
const cols = [['p3', 3], ['p10', 10], ['p90', 90], ['p97', 97]];

const medianRows = had.map(r => ({ week: r.week, eq: C.hadlockMedian(r.week), tab: r.p50 }));
const medianFails = medianRows.filter(r => Math.round(r.eq) !== r.tab);
results.hadlockMedian = medianFails.length === 0;

const tolG = (tab) => Math.max(2, 0.005 * tab); // table is rounded to 1 g; allow 2 g or 0.5%
const methodRows = Object.entries(C.HADLOCK.spreads).map(([key, s]) => {
  let fails = 0, worst = { rel: 0 };
  for (const r of had) for (const [col, pc] of cols) {
    if (r.week === MISPRINT.week && col === MISPRINT.col) continue;
    const w = C.hadlockWeightAt(pc, r.week, key), tab = r[col];
    if (Math.abs(w - tab) > tolG(tab)) fails++;
    const rel = (w - tab) / tab * 100;
    if (Math.abs(rel) > Math.abs(worst.rel)) worst = { rel, week: r.week, col, w, tab };
  }
  const at = wk => {
    const r = had.find(x => x.week === wk);
    return { p10: C.hadlockPercentile(r.p10, wk, key), p3: C.hadlockPercentile(r.p3, wk, key) };
  };
  return { key, label: s.label, fails, worst, a20: at(20), a30: at(30), a40: at(40) };
});
results.hadlockSpread = methodRows.find(m => m.key === C.HADLOCK_METHOD)?.fails === 0;

// ------------------------------------------------------------------------------------------ Acharya
const ach = csv('acharya_table4_sd.csv');
const pcts = [2.5, 5, 10, 25, 50, 75, 90, 95, 97.5];
const achCells = [];
for (const r of ach) for (const pc of pcts) {
  const v = C.acharyaSdValueAt(pc, r.week), tab = r['p' + pc];
  achCells.push({ week: r.week, pc, v, tab, diff: v - tab, ok: Math.abs(v - tab) <= 0.0105 });
}
const achFails = achCells.filter(c => !c.ok);
// Weeks 19 and 21: printed rows sit 0.6-0.8% below the formula. Andrew chose the formula on
// 2026-09-29 (SIGN-OFF.md), so these are accepted as a known table discrepancy, still shown in bold.
const ACCEPTED_WEEKS = C.ACHARYA_SIGNED_OFF ? [19, 21] : [];
const achUnaccepted = achFails.filter(c => !ACCEPTED_WEEKS.includes(c.week));
results.acharya = achUnaccepted.length === 0;

// ------------------------------------------------------------------------------------------ ACOG
// Expected values worked out by hand (calendar arithmetic), independent of the code.
const acogCases = [
  { edd: '2026-12-31', on: '2026-12-31', want: [40, 0], why: 'on the EDD itself' },
  { edd: '2026-12-31', on: '2026-12-24', want: [39, 0], why: '7 days before' },
  { edd: '2026-12-31', on: '2026-10-01', want: [27, 0], why: '91 days before (30 left in Oct + 30 Nov + 31 Dec)' },
  { edd: '2027-01-05', on: '2026-12-29', want: [39, 0], why: 'across New Year' },
  { edd: '2026-11-08', on: '2026-10-25', want: [38, 0], why: 'across the US daylight-saving change (Nov 1)' },
  { edd: '2028-03-01', on: '2028-02-28', want: [39, 5], why: 'leap year: Feb 29 2028 lies between' },
  { edd: '2027-03-01', on: '2027-02-28', want: [39, 6], why: 'no leap day in 2027' },
  { edd: '2027-01-10', on: '2027-01-17', want: [41, 0], why: '7 days past the EDD' },
  { edd: '2027-06-30', on: '2026-09-29', want: [0, 6], why: '274 days before: 6 days of GA (LMP 2026-09-23)' },
];
const acogRows = acogCases.map(c => {
  const days = C.gaDaysFromEdd(c.edd, c.on), g = C.splitDays(days);
  return { ...c, got: [g.weeks, g.days], ok: g.weeks === c.want[0] && g.days === c.want[1] };
});
results.acog = acogRows.every(r => r.ok);

// ------------------------------------------------------------------------------------------ Display rule
const fmtCases = [
  [9.6, { lower: [3, 10] }, '9.6th'], [9.96, { lower: [3, 10] }, '9.96th'], [10.4, { lower: [3, 10] }, '10th'],
  [2.97, { lower: [3, 10] }, '2.97th'], [7.3, { lower: [3, 10] }, '7th'], [21.2, {}, '21st'], [52.4, {}, '52nd'],
  [12.2, {}, '12th'], [95.3, { upper: [95] }, '95.3th'], [94.7, { upper: [95] }, '95th'], [0.42, {}, '0.4th'],
  [99.64, {}, '99.6th'], [0.001, {}, '<0.1th'],
];
const fmtRows = fmtCases.map(([v, o, want]) => ({ v, o, want, got: C.formatPercentile(v, o) }));
results.format = fmtRows.every(r => r.got === r.want);

// ------------------------------------------------------------------------------------------ Write report
const tick = ok => ok ? 'PASS' : '**FAIL**';
const today = new Date().toISOString().slice(0, 10);
p('# Validation');
p('');
p(`Generated by \`node validation/validate.mjs\` on ${today}. It runs the app's own code (\`site/calc.js\`)`);
p('against each paper\'s published values. Do not edit by hand; re-run after any change to the math.');
p('');
p('## Summary');
p('');
p('| Check | Result |');
p('|---|---|');
p(`| Hadlock 1991: equation median vs Table 1 50th, weeks 10-40 (31 weeks) | ${tick(results.hadlockMedian)} |`);
p(`| Hadlock 1991: spread vs Table 1 3rd/10th/90th/97th, active method = \`${C.HADLOCK_METHOD ?? 'none (not chosen)'}\` | ${C.HADLOCK_METHOD ? tick(results.hadlockSpread) : '**ON HOLD: Andrew to choose (below)**'} |`);
p(`| Acharya 2005: formula vs Table IV, 23 weeks x 9 percentiles (207 cells), tolerance ±0.01 | ${tick(results.acharya)}${achFails.length ? ` (${achCells.length - achFails.length}/${achCells.length} within tolerance; the ${achFails.length} cells at weeks ${[...new Set(achFails.map(c => c.week))].join(' and ')} are a known table discrepancy, formula used per Andrew 2026-09-29)` : ''} |`);
p(`| ACOG CO 700: GA from EDD, ${acogRows.length} hand-worked dates | ${tick(results.acog)} |`);
p(`| Percentile display rule (never shows a number on the wrong side of a cutoff) | ${tick(results.format)} |`);
p('');

p('## 1. Hadlock 1991 (EFW percentile)');
p('');
p('Source: Hadlock FP, Harrist RB, Martinez-Poyer J. *Radiology* 1991;181:129-133. Model (p. 131):');
p('ln(weight g) = 0.578 + 0.332 MA - 0.00354 MA², MA = menstrual age in weeks. Read from the page image.');
p('');
p('### 1a. Median: equation vs Table 1 50th percentile');
p('');
p(`Rounded to whole grams, the equation equals the printed 50th percentile at **${medianRows.length - medianFails.length} of ${medianRows.length}** weeks.`);
p('');
p('| Week | Equation (g) | Table 1 50th (g) | Week | Equation (g) | Table 1 50th (g) |');
p('|---|---|---|---|---|---|');
const half = Math.ceil(medianRows.length / 2);
for (let i = 0; i < half; i++) {
  const a = medianRows[i], b = medianRows[i + half];
  p(`| ${a.week} | ${f1(a.eq)} | ${a.tab} | ${b ? b.week : ''} | ${b ? f1(b.eq) : ''} | ${b ? b.tab : ''} |`);
}
p('');
p('### 1b. Spread: the paper states it three ways, and they disagree');
p('');
p('Table 1\'s other columns are, to within 1-2 g of rounding, exactly 50th x 0.75, x 0.83, x 1.17 and x 1.25');
p('(3rd, 10th, 90th, 97th) at every week. That is a normal spread with SD = 13.27% of the median, which');
p('matches the Discussion\'s "±17%" at the 10th/90th (p. 133) but none of the SDs stated as numbers.');
p('');
p(`Tolerance: model weight within 2 g or 0.5% of the table (whichever is larger), all weeks x 4 columns (123 cells; the misprint below excluded).`);
p('');
p('| Method | Source in the paper | Cells outside tolerance | Its 10th / 3rd at 40 wk (Table 1: 3,004 / 2,714 g) | Percentile given to a baby at exactly Table 1\'s 10th / 3rd weight (20, 30, 40 wk) |');
p('|---|---|---|---|---|');
const src = { pct127: 'Abstract, Results, Fig 2: "±12.7% (1 SD)"', log012: 'Results: regression "standard deviation = 0.12"', pct13: 'Discussion p. 132: "uniform at 13%"', table: 'Table 1 itself; p. 133 "±17%"' };
for (const m of methodRows) {
  const g10 = Math.round(C.hadlockWeightAt(10, 40, m.key)), g3 = Math.round(C.hadlockWeightAt(3, 40, m.key));
  p(`| \`${m.key}\`: ${m.label} | ${src[m.key]} | ${m.fails} / 123 | ${g10.toLocaleString('en-US')} / ${g3.toLocaleString('en-US')} g | ${f1(m.a20.p10)} / ${f2(m.a20.p3)}; ${f1(m.a30.p10)} / ${f2(m.a30.p3)}; ${f1(m.a40.p10)} / ${f2(m.a40.p3)} |`);
}
p('');
p('Reading the last column: under `log012`, a fetus weighing exactly what Table 1 calls the 10th percentile');
p('is reported as the 6th, and one at the table\'s 3rd as below the 1st. Under `pct127` they read as the 9th');
p('and 2.5th. Only `table` reports them as the 10th and 3rd.');
p('');
p('**Misprint in Table 1:** at 30 weeks the 97th percentile is printed as **1,649 g**, below that row\'s own');
p('90th (1,824 g). From the equation, 1,559 x 1.25 = 1,949 g, so it is almost certainly a typesetting error');
p('(1,649 for 1,949). It is excluded from the checks above; the app never uses the table, only the equation.');
p('');
if (C.HADLOCK_METHOD) {
  p(`**Status: ${results.hadlockSpread ? 'PASS' : '**FAIL**'}.** Andrew's rule (QUESTIONS.md, Q12) was to compute from the model and stop if model and`);
  p('table disagreed. The stated SDs did, so the work stopped; on 2026-09-29 he chose `' + C.HADLOCK_METHOD + '`, which reproduces');
  p('all 123 cells of Table 1 within tolerance. Pending: a hand check on perinatology.com (section 5).');
} else {
  p('**Status: ON HOLD.** Andrew set the rule (QUESTIONS.md, Q12): compute from the model and, if model and');
  p('table disagree beyond a set tolerance, stop and show him. They do, so the app computes no EFW percentile');
  p('until he picks a method.');
}
p('');

p('## 2. Acharya 2005 (umbilical artery S/D percentile)');
p('');
p('Source: Acharya G, et al. *Am J Obstet Gynecol* 2005;192:937-44, Appendix (p. 944), free-loop S/D:');
p('ln(S/D) has mean 4.16676 - 0.9188 ln(GA) and variance 0.4851 - 0.2678 ln(GA) + 0.04115 ln(GA)².');
p('Signs confirmed on the page image (the text layer drops minus signs).');
p('');
p(`Tolerance: ±0.01 (one unit in the table's last printed place). **${achCells.length - achFails.length} of ${achCells.length}** cells pass.`);
p('');
p('| Week | 2.5th | 5th | 10th | 25th | 50th | 75th | 90th | 95th | 97.5th |');
p('|---|---|---|---|---|---|---|---|---|---|');
for (const r of ach) {
  const cells = pcts.map(pc => {
    const c = achCells.find(x => x.week === r.week && x.pc === pc);
    const s = `${f2(c.v)} / ${f2(c.tab)}`;
    return c.ok ? s : `**${s}**`;
  });
  p(`| ${r.week} | ${cells.join(' | ')} |`);
}
p('');
p('Each cell: app formula / Table IV. **Bold** = outside tolerance.');
p('');
const pc95 = wk => { const r = ach.find(x => x.week === wk); return C.acharyaSdPercentile(r.p95, wk); };
p('Everywhere except weeks 19 and 21, the formula matches the table to within rounding. At 19 and 21 weeks');
p('every percentile in the printed row sits 0.6-0.8% below the formula, while the neighbouring weeks match; the');
p('formula is a smooth curve, so the two printed rows look like the odd ones out. Effect on a reading: the');
p(`printed 95th at 19 weeks (${ach.find(x => x.week === 19).p95}) scores as the ${f1(pc95(19))}th by the formula, and at 21 weeks (${ach.find(x => x.week === 21).p95}) as the`);
p(`${f1(pc95(21))}th, against ${f1(pc95(30))}th at 30 weeks. So an S/D between the printed 95th and about 1% above it, at those two`);
p('weeks only, would be flagged "above the 95th" by the table but not by the formula.');
p('');
p(results.acharya
  ? '**Status: PASS.** Andrew decided on 2026-09-29 to use the formula at every week; the two printed rows at 19 and 21 weeks are recorded here as a known discrepancy in the table.'
  : '**Status: MISMATCH at weeks 19 and 21: needs Andrew\'s decision before release.**');
p('');

p('## 3. ACOG CO 700 (gestational age from an EDD)');
p('');
p('Rule (p. e150): "By convention, the EDD is 280 days after the first day of the LMP." So on any date,');
p('GA in days = 280 - (EDD - date). Dates are counted in UTC whole days so daylight saving cannot shift them.');
p('');
p('| EDD | On date | Expected (worked by hand) | App | Case | Result |');
p('|---|---|---|---|---|---|');
for (const r of acogRows) p(`| ${r.edd} | ${r.on} | ${r.want[0]}w ${r.want[1]}d | ${r.got[0]}w ${r.got[1]}d | ${r.why} | ${tick(r.ok)} |`);
p('');

p('## 4. Percentile display rule');
p('');
p('Whole numbers from 1 to 99, one decimal outside that. Near a cutoff the app adds decimals until the shown');
p('number is on the same side of the cutoff as the true value, so "10th" never appears beside "Below the 10th".');
p('');
p('| True value | Cutoffs | Expected | App | Result |');
p('|---|---|---|---|---|');
for (const r of fmtRows) p(`| ${r.v} | ${JSON.stringify(r.o)} | ${r.want} | ${r.got} | ${tick(r.got === r.want)} |`);
p('');
p('## 5. Second check: perinatology.com');
p('');
p('perinatology.com refuses headless browsers (Incapsula "Request unsuccessful", 2026-09-28), so these are');
p('for Andrew to type into its Hadlock fetal weight percentile calculator by hand. The answer also shows which');
p('spread that site uses: at each exact Table 1 cutoff weight, `table` gives the 10th/3rd, `pct127` about the');
p('9th/2.5th, and `log012` about the 6th/0.8th.');
p('');
p('| GA | EFW (g) | Table 1 says | App `table` | App `pct127` | App `log012` | App `pct13` | perinatology.com |');
p('|---|---|---|---|---|---|---|---|');
// Inputs sent to Andrew 2026-09-29 without the expected answers (a blind check).
const peri = [[30, 0, 1294, '10th'], [30, 0, 1169, '3rd'], [40, 0, 3004, '10th'], [36, 0, 2813, '50th'],
  [28, 3, 1000, '-'], [34, 0, 2000, '-']];
const periSite = {}; // filled in from Andrew's report: key 'wk-d-g' -> text shown by perinatology.com
for (const [wk, d, g, says] of peri) {
  const v = k => f1(C.hadlockPercentile(g, wk + d / 7, k));
  p(`| ${wk}w ${d}d | ${g} | ${says} | ${v('table')} | ${v('pct127')} | ${v('log012')} | ${v('pct13')} | ${periSite[`${wk}-${d}-${g}`] ?? '_to fill in_'} |`);
}
p('');

fs.writeFileSync(path.join(root, 'VALIDATION.md'), out.join('\n') + '\n');
allPass = results.hadlockMedian && results.acog && results.format && results.acharya &&
  (C.HADLOCK_METHOD ? results.hadlockSpread : true);
console.log(JSON.stringify(results));
console.log(allPass && C.HADLOCK_METHOD && C.ACHARYA_SIGNED_OFF ? 'ALL PASS' : 'NOT READY TO RELEASE (see VALIDATION.md)');
process.exit(allPass && C.HADLOCK_METHOD && C.ACHARYA_SIGNED_OFF ? 0 : 1);
