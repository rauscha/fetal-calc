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

// The method the app uses. null = not yet chosen by Andrew: the app shows the EFW percentile as
// "on hold" and computes nothing. Set to one of the keys of HADLOCK.spreads once he decides.
export let HADLOCK_METHOD = null;
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

// false until Andrew signs off the Table IV mismatch at weeks 19 and 21 (VALIDATION.md, section 2):
// the app then shows the S/D percentile as "on hold" and computes nothing.
export let ACHARYA_SIGNED_OFF = false;

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
