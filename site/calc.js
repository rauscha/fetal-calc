// Fetal %ile — the clinical math. Pure functions, no DOM; the app and the tests both import this.
//
// Every coefficient here was read from the source paper's PDF (never from memory) and is checked
// against that paper's own published table by `npm test` / `node validation/validate.mjs`, which
// writes VALIDATION.md. Do not change a number without re-running that check.

// ---------------------------------------------------------------------------------------------
// Normal distribution helpers
// ---------------------------------------------------------------------------------------------

// Standard normal CDF, computed from first principles so no approximation constants are needed:
// the Maclaurin series of erf for |x| <= 3, and the classic continued fraction for erfc beyond.
// Checked against Python's statistics.NormalDist by tests/calc.test.mjs (|error| < 1e-12).
export function normCdf(z) {
  const x = Math.abs(z) / Math.SQRT2;
  const upperTail = x <= 3 ? 0.5 * (1 - erfSeries(x)) : 0.5 * erfcContinuedFraction(x);
  return z >= 0 ? 1 - upperTail : upperTail;
}

function erfSeries(x) {
  // erf(x) = 2/sqrt(pi) * sum_n (-1)^n x^(2n+1) / (n! (2n+1))
  let term = x, sum = x;
  for (let n = 1; n < 200; n++) {
    term *= -x * x / n;
    const add = term / (2 * n + 1);
    sum += add;
    if (Math.abs(add) < 1e-17 * Math.abs(sum)) break;
  }
  return 2 / Math.sqrt(Math.PI) * sum;
}

function erfcContinuedFraction(x) {
  // erfc(x) = exp(-x^2)/sqrt(pi) * 1/(x + (1/2)/(x + 1/(x + (3/2)/(x + 2/(x + ...)))))
  // evaluated bottom-up with enough terms for x > 3.
  let f = x;
  for (let k = 120; k >= 1; k--) f = x + (k / 2) / f;
  return Math.exp(-x * x) / Math.sqrt(Math.PI) / f;
}

// Inverse standard normal CDF by bisection on normCdf (no approximation constants).
export function normInv(p) {
  if (!(p > 0 && p < 1)) throw new RangeError('p must be in (0, 1)');
  let lo = -40, hi = 40;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (normCdf(mid) < p) lo = mid; else hi = mid;
    if (hi - lo < 1e-13) break;
  }
  return (lo + hi) / 2;
}

// ---------------------------------------------------------------------------------------------
// Hadlock FP, Harrist RB, Martinez-Poyer J. In utero analysis of fetal growth: a sonographic
// weight standard. Radiology 1991;181:129-133.
//
// p. 131, Results: "Log n weight (g) = 0.578 + 0.332 MA - 0.00354 MA^2, where MA is menstrual
// age (standard deviation = 0.12, R^2 = 99.1%)." MA in weeks.
// p. 129-130: model used for predicted values "between 10 and 41 weeks"; Table 1 lists 10-40.
//
// The paper gives three statements of spread, and they do not agree with each other or all
// reproduce Table 1 (see VALIDATION.md). Which one the app uses is Andrew's decision:
//   pct127 - normal, SD = 12.7% of the predicted weight (Abstract; Results; Fig 2 legend)
//   log012 - log-normal, SD = 0.12 in natural-log units (Results, regression SD)
//   pct13  - normal, SD = 13% (Discussion, p. 132: "uniform at 13% throughout pregnancy")
//   table  - normal, SD implied by Table 1 and p. 133 ("±17%" at the 10th and 90th):
//            0.17 / z(0.90) = 0.13265. Reproduces every column of Table 1.
// ---------------------------------------------------------------------------------------------

export const HADLOCK = {
  a: 0.578, b: 0.332, c: -0.00354,
  range: [10, 41],
  spreads: {
    pct127: { kind: 'linear', sd: 0.127, label: 'SD 12.7% of the predicted weight' },
    log012: { kind: 'log', sd: 0.12, label: 'SD 0.12 on the natural-log scale' },
    pct13: { kind: 'linear', sd: 0.13, label: 'SD 13% of the predicted weight' },
    table: { kind: 'linear', sd: 0.17 / 1.2815515655446004, label: 'SD from Table 1 (±17% at the 10th and 90th)' },
  },
};

// The method the app uses. Chosen by Andrew 2026-09-29 (SIGN-OFF.md): 'table', the spread that
// reproduces Table 1. (null would put the EFW percentile "on hold" and compute nothing.)
export let HADLOCK_METHOD = 'table';
export function setHadlockMethod(m) {
  if (m !== null && !(m in HADLOCK.spreads)) throw new Error('unknown Hadlock method ' + m);
  HADLOCK_METHOD = m;
}

export function hadlockMedian(gaWeeks) {
  const { a, b, c } = HADLOCK;
  return Math.exp(a + b * gaWeeks + c * gaWeeks * gaWeeks);
}

export function hadlockZ(efwGrams, gaWeeks, method = HADLOCK_METHOD) {
  const s = HADLOCK.spreads[method];
  if (!s) return null;
  const ratio = efwGrams / hadlockMedian(gaWeeks);
  return s.kind === 'log' ? Math.log(ratio) / s.sd : (ratio - 1) / s.sd;
}

// Weight (g) at percentile p (0-100) for a GA, under a given spread method.
export function hadlockWeightAt(p, gaWeeks, method = HADLOCK_METHOD) {
  const s = HADLOCK.spreads[method];
  const z = normInv(p / 100), m = hadlockMedian(gaWeeks);
  return s.kind === 'log' ? m * Math.exp(z * s.sd) : m * (1 + z * s.sd);
}

export function hadlockPercentile(efwGrams, gaWeeks, method = HADLOCK_METHOD) {
  const z = hadlockZ(efwGrams, gaWeeks, method);
  return z === null ? null : 100 * normCdf(z);
}

// ---------------------------------------------------------------------------------------------
// Acharya G, Wilsgaard T, Berntsen GK, Maltau JM, Kiserud T. Reference ranges for serial
// measurements of umbilical artery Doppler indices in the second half of pregnancy.
// Am J Obstet Gynecol 2005;192:937-44. Free-loop umbilical artery, 19-42 weeks.
//
// Appendix, p. 944, "Systolic:Diastolic Ratio (SDR)": SDR is log transformed (Z = ln[SDR]).
//   mean     = 4.16676 - 0.9188 ln(T)
//   variance = 0.4851 - 0.2678 ln(T) + 0.04115 ln(T)^2          (T = gestational age, weeks)
// Table IV lists the resulting percentiles for weeks 19-41.
// ---------------------------------------------------------------------------------------------

// Signed off by Andrew 2026-09-29 (SIGN-OFF.md): use the formula at every week, including 19 and
// 21 where the printed Table IV rows sit 0.6-0.8% below it. (false would put S/D "on hold".)
export let ACHARYA_SIGNED_OFF = true;

export const ACHARYA_SD = { m0: 4.16676, m1: -0.9188, v0: 0.4851, v1: -0.2678, v2: 0.04115, range: [19, 42] };

export function acharyaSdMeanLog(gaWeeks) {
  return ACHARYA_SD.m0 + ACHARYA_SD.m1 * Math.log(gaWeeks);
}
export function acharyaSdSdLog(gaWeeks) {
  const L = Math.log(gaWeeks), k = ACHARYA_SD;
  return Math.sqrt(k.v0 + k.v1 * L + k.v2 * L * L);
}
export function acharyaSdValueAt(p, gaWeeks) {
  return Math.exp(acharyaSdMeanLog(gaWeeks) + normInv(p / 100) * acharyaSdSdLog(gaWeeks));
}
export function acharyaSdPercentile(sd, gaWeeks) {
  return 100 * normCdf((Math.log(sd) - acharyaSdMeanLog(gaWeeks)) / acharyaSdSdLog(gaWeeks));
}

// ---------------------------------------------------------------------------------------------
// Abdominal circumference (AC) percentile. Hadlock FP, Deter RL, Harrist RB, Park SK. Estimating
// fetal age: computer-assisted analysis of multiple fetal growth parameters. Radiology
// 1984;152:497-501. 361 fetuses, 14-42 menstrual weeks. (The reference perinatology.com lists.)
//
// p. 500, Table III ("Predicted Fetal Measurements at Specific Menstrual Age") gives the mean AC in
// cm every half week from 12.0 to 40.0; its footnote reads:
//   "AC = -13.3 + 1.61 (MA) - 0.00998 MA^2; r^2 = 97.2%; 1 SD = 1.34 cm."
// The printed equation does NOT reproduce the printed table (it runs up to 0.17 cm low by 40 wk; its
// coefficients were evidently rounded). Three candidate methods, all with SD = 1.34 cm; which one the
// app uses is Andrew's decision (VALIDATION.md):
//   table3   - Table III means, linear interpolation between half-week rows (linear extrapolation
//              from the two end rows outside 12-40 wk). Every number printed in the paper.
//   equation - the footnote's printed quadratic. Matches perinatology.com.
//   refit    - a quadratic DERIVED here by least squares from Table III (not printed in the paper);
//              reproduces the table to rounding. Recomputed and checked by validation/validate.mjs.
// ---------------------------------------------------------------------------------------------

// Chosen by Andrew: one of 'table3' | 'equation' | 'refit'. null = AC percentile "on hold".
export let AC_SOURCE = null;

export const HADLOCK_AC = {
  sd: 1.34, // cm, Table III footnote
  // Table III, p. 500: [menstrual age (wk), mean AC (cm)], as printed.
  table3: [
    [12.0, 4.6], [12.5, 5.3], [13.0, 6.0], [13.5, 6.7], [14.0, 7.3], [14.5, 8.0], [15.0, 8.6], [15.5, 9.3],
    [16.0, 9.9], [16.5, 10.6], [17.0, 11.2], [17.5, 11.9], [18.0, 12.5], [18.5, 13.1], [19.0, 13.7], [19.5, 14.4],
    [20.0, 15.0], [20.5, 15.6], [21.0, 16.2], [21.5, 16.8], [22.0, 17.4], [22.5, 17.9], [23.0, 18.5], [23.5, 19.1],
    [24.0, 19.7], [24.5, 20.2], [25.0, 20.8], [25.5, 21.3], [26.0, 21.9], [26.5, 22.4], [27.0, 23.0], [27.5, 23.5],
    [28.0, 24.0], [28.5, 24.6], [29.0, 25.1], [29.5, 25.6], [30.0, 26.1], [30.5, 26.6], [31.0, 27.1], [31.5, 27.6],
    [32.0, 28.1], [32.5, 28.6], [33.0, 29.1], [33.5, 29.5], [34.0, 30.0], [34.5, 30.5], [35.0, 30.9], [35.5, 31.4],
    [36.0, 31.8], [36.5, 32.3], [37.0, 32.7], [37.5, 33.2], [38.0, 33.6], [38.5, 34.0], [39.0, 34.4], [39.5, 34.8],
    [40.0, 35.3],
  ],
  equation: { a: -13.3, b: 1.61, c: -0.00998 }, // Table III footnote, as printed
  // DERIVED by least squares from the 57 Table III rows (not printed in the paper).
  refit: { a: -13.315778647511399, b: 1.6140951177156535, c: -0.009997631025654034 },
  methods: {
    table3: { label: 'Table III means, interpolated', range: [12, 40] },
    equation: { label: 'printed equation (Table III footnote)', range: [14, 42] },
    refit: { label: 'quadratic refitted to Table III', range: [12, 40] },
  },
};

export function acMeanCm(gaWeeks, method = AC_SOURCE) {
  if (method === 'equation' || method === 'refit') {
    const { a, b, c } = HADLOCK_AC[method];
    return a + b * gaWeeks + c * gaWeeks * gaWeeks;
  }
  if (method !== 'table3') return null;
  const t = HADLOCK_AC.table3, n = t.length;
  let i = 0;
  if (gaWeeks <= t[0][0]) i = 0;
  else if (gaWeeks >= t[n - 1][0]) i = n - 2;
  else while (!(gaWeeks >= t[i][0] && gaWeeks <= t[i + 1][0])) i++;
  const [x0, y0] = t[i], [x1, y1] = t[i + 1];
  return y0 + (gaWeeks - x0) * (y1 - y0) / (x1 - x0);
}

export function acPercentile(acMm, gaWeeks, method = AC_SOURCE) {
  if (!method || !(method in HADLOCK_AC.methods)) return null;
  return 100 * normCdf((acMm / 10 - acMeanCm(gaWeeks, method)) / HADLOCK_AC.sd);
}

// ---------------------------------------------------------------------------------------------
// ACOG Committee Opinion No. 700: Methods for Estimating the Due Date. Obstet Gynecol
// 2017;129:e150-4. p. e150: "By convention, the EDD is 280 days after the first day of the LMP."
// So on any date, GA (days) = 280 - (EDD - date).
// ---------------------------------------------------------------------------------------------

// ISO 'YYYY-MM-DD' -> whole days since epoch, in UTC so daylight-saving shifts can't move a day.
export function isoToDay(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  if (!m) return null;
  const t = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  const d = new Date(t);
  if (d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) return null;
  return Math.round(t / 86400000);
}

export function gaDaysFromEdd(eddIso, onIso) {
  const e = isoToDay(eddIso), o = isoToDay(onIso);
  if (e === null || o === null) return null;
  return 280 - (e - o);
}

// ---------------------------------------------------------------------------------------------
// Presentation helpers (no clinical constants)
// ---------------------------------------------------------------------------------------------

export function splitDays(totalDays) {
  return { weeks: Math.floor(totalDays / 7), days: ((totalDays % 7) + 7) % 7 };
}

export function inRange(gaWeeks, range) {
  return gaWeeks >= range[0] && gaWeeks <= range[1];
}

function ordinalSuffix(text) {
  if (text.includes('.')) return 'th';
  const n = parseInt(text, 10) % 100;
  if (n >= 11 && n <= 13) return 'th';
  return { 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th';
}

// Percentile text. Whole numbers from 1 to 99; one decimal below 1 or above 99. Near a cutoff,
// adds decimals until the shown number sits on the same side of every cutoff as the true value,
// so the screen can never say "10th" beside "Below the 10th percentile".
//   lower: cutoffs flagged when p < c; upper: cutoffs flagged when p > c.
export function formatPercentile(p, { lower = [], upper = [] } = {}) {
  const agrees = shown => lower.every(c => (p < c) === (shown < c)) && upper.every(c => (p > c) === (shown > c));
  let dp = (p < 1 || p > 99) ? 1 : 0;
  let text = p.toFixed(dp);
  while (!agrees(parseFloat(text)) && dp < 3) text = p.toFixed(++dp);
  if (!agrees(parseFloat(text))) {
    // Still on a cutoff at 3 decimals (e.g. 2.9999...): round toward the side the value is on.
    const below = lower.some(c => p < c && parseFloat(text) >= c);
    text = (below ? Math.floor(p * 1000) / 1000 : Math.ceil(p * 1000) / 1000).toFixed(3);
  }
  if (parseFloat(text) <= 0) text = '<0.1';
  else if (parseFloat(text) >= 100) text = '>99.9';
  const suffix = text.startsWith('<') || text.startsWith('>') ? 'th' : ordinalSuffix(text);
  return text + suffix;
}
