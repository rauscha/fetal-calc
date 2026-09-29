// Always-true checks on site/calc.js. Run: npm test
// (The release gate against the papers' tables is validation/validate.mjs, which writes VALIDATION.md.)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as C from '../site/calc.js';

// Reference values from Python 3.14 statistics.NormalDist().cdf
const NORM = [[-5, 2.8665157187919455e-07], [-3, 0.0013498980316300957], [-1.8807936081512509, 0.03],
  [-1.2815515655446004, 0.1], [-1, 0.15865525393145707], [0, 0.5], [0.5, 0.6914624612740131],
  [1.6448536269514722, 0.95], [2.5, 0.9937903346742238], [4, 0.9999683287581669]];

test('normal CDF matches Python to 1e-12 (relative)', () => {
  for (const [z, want] of NORM) assert.ok(Math.abs(C.normCdf(z) - want) <= 1e-12 * Math.max(want, 1e-300) + 1e-15, `z=${z}`);
});

test('inverse normal round-trips', () => {
  for (const p of [0.001, 0.03, 0.1, 0.5, 0.9, 0.95, 0.975, 0.999]) assert.ok(Math.abs(C.normCdf(C.normInv(p)) - p) < 1e-12);
});

test('Hadlock median equals Table 1 50th percentile at every week 10-40', () => {
  const rows = fs.readFileSync(new URL('../validation/hadlock_table1.csv', import.meta.url), 'utf8').trim().split('\n').slice(1);
  for (const r of rows) {
    const [week, , , p50] = r.split(',').map(Number);
    assert.equal(Math.round(C.hadlockMedian(week)), p50, `week ${week}`);
  }
});

test('Hadlock "table" method reproduces the 10th and 3rd at 40 weeks', () => {
  assert.ok(Math.abs(C.hadlockWeightAt(10, 40, 'table') - 3004) <= 2);
  assert.ok(Math.abs(C.hadlockWeightAt(3, 40, 'table') - 2714) <= 0.005 * 2714);
});

test('Hadlock method is the signed-off one, and a baby at Table 1\'s 10th reads as the 10th', () => {
  assert.equal(C.HADLOCK_METHOD, 'table');
  assert.equal(C.hadlockPercentile(3004, 40).toFixed(0), '10');
  assert.equal(C.hadlockPercentile(1169, 30).toFixed(0), '3');
});

test('with no method chosen, no EFW percentile is computed', () => {
  assert.equal(C.hadlockPercentile(1200, 30, null), null);
});

test('Acharya S/D formula matches Table IV within 0.01, except the known weeks 19 and 21', () => {
  const rows = fs.readFileSync(new URL('../validation/acharya_table4_sd.csv', import.meta.url), 'utf8').trim().split('\n');
  const pcts = rows[0].split(',').slice(1).map(h => Number(h.slice(1)));
  for (const r of rows.slice(1)) {
    const [week, ...vals] = r.split(',').map(Number);
    if (week === 19 || week === 21) continue;
    vals.forEach((v, i) => assert.ok(Math.abs(C.acharyaSdValueAt(pcts[i], week) - v) <= 0.0105, `wk ${week} p${pcts[i]}`));
  }
});

test('ACOG: GA from EDD', () => {
  const g = (e, o) => { const s = C.splitDays(C.gaDaysFromEdd(e, o)); return `${s.weeks}w${s.days}d`; };
  assert.equal(g('2026-12-31', '2026-12-31'), '40w0d');
  assert.equal(g('2026-12-15', '2026-09-29'), '29w0d');
  assert.equal(g('2028-03-01', '2028-02-28'), '39w5d');
  assert.equal(g('2026-11-08', '2026-10-25'), '38w0d');
  assert.equal(C.gaDaysFromEdd('2026-02-30', '2026-01-01'), null);
});

test('percentile text never lands on the wrong side of a cutoff', () => {
  for (let p = 0.05; p < 99.95; p += 0.01) {
    const shown = parseFloat(C.formatPercentile(p, { lower: [3, 10], upper: [95] }).replace(/[<>]/, ''));
    for (const c of [3, 10]) assert.equal(p < c, shown < c, `p=${p}`);
    assert.equal(p > 95, shown > 95, `p=${p}`);
  }
});

test('with no AC method chosen, no AC percentile is computed', () => {
  assert.equal(C.acPercentile(250, 30, null), null);
});

test('AC table3 method reproduces every Hadlock 1984 Table III value at the printed half-weeks', () => {
  const rows = fs.readFileSync(new URL('../validation/hadlock1984_table3_ac.csv', import.meta.url), 'utf8').trim().split('\n').slice(1);
  assert.equal(rows.length, 57);
  for (const r of rows) {
    const [ma, ac] = r.split(',').map(Number);
    assert.ok(Math.abs(C.acMeanCm(ma, 'table3') - ac) < 1e-9, `MA ${ma}`);
  }
});

test('AC equation method is the printed quadratic', () => {
  assert.ok(Math.abs(C.acMeanCm(30, 'equation') - (-13.3 + 1.61 * 30 - 0.00998 * 900)) < 1e-12);
});

test('AC refit method reproduces every Table III row within 0.051 cm', () => {
  for (const [ma, ac] of C.HADLOCK_AC.table3) assert.ok(Math.abs(C.acMeanCm(ma, 'refit') - ac) <= 0.051, `MA ${ma}`);
});

test('AC percentile with no method is null', () => {
  assert.equal(C.acPercentile(300, 34, null), null);
});

test('AC uses the signed-off printed equation and matches Andrew\'s hospital system', () => {
  assert.equal(C.AC_SOURCE, 'equation');
  for (const [w, d, mm, hosp] of [[36, 5, 325, 54], [36, 2, 319, 48], [36, 2, 322.6, 58], [40, 0, 368, 89], [40, 0, 358.5, 70]]) {
    assert.equal(Math.round(C.acPercentile(mm, w + d / 7)), hosp, `${w}+${d} ${mm} mm`);
  }
});
