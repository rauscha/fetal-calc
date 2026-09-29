// Fetal %ile — screen logic. All clinical math lives in calc.js; this file only reads inputs,
// calls it, and draws results. Nothing is stored: no localStorage, cookies or network calls.
import * as C from './calc.js';

const $ = id => document.getElementById(id);
const SVGNS = 'http://www.w3.org/2000/svg';

// Hard sanity limits on input (not reference ranges): outside these nothing is computed.
const GA_MIN_DAYS = 8 * 7, GA_MAX_DAYS = 44 * 7 + 6;
const EFW_MAX = 7000, SD_MAX = 50, AC_MIN = 50, AC_MAX = 450;

// ------------------------------------------------------------------ screens
function show() {
  const id = (location.hash || '#calc').slice(1);
  let found = false;
  document.querySelectorAll('[data-screen]').forEach(s => {
    const on = s.id === id; s.hidden = !on; if (on) found = true;
  });
  if (!found) $('calc').hidden = false;
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', show);

// ------------------------------------------------------------------ helpers
function todayIso() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function prettyDate(iso) {
  const day = C.isoToDay(iso);
  return new Date(day * 86400000).toLocaleDateString('en-US',
    { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' });
}
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}
const gaWords = days => {
  const { weeks, days: d } = C.splitDays(days);
  return `${weeks} week${weeks === 1 ? '' : 's'} ${d} day${d === 1 ? '' : 's'}`;
};
const gaShort = days => { const { weeks, days: d } = C.splitDays(days); return `${weeks}w ${d}d`; };

// ------------------------------------------------------------------ gestational age
function mode() { return document.querySelector('input[name="gamode"]:checked').value; }

function applyMode() {
  const m = mode();
  document.querySelectorAll('[data-mode]').forEach(e => {
    e.hidden = !e.dataset.mode.split(' ').includes(m);
  });
  if (m === 'eddscan' && !$('scan').value) $('scan').value = todayIso();
}

// Returns { days } or { error } or {} when not yet entered. Also writes the read-back line.
function readGa() {
  const rb = $('ga-readback');
  rb.replaceChildren();
  const m = mode();
  let days = null, from = '';
  if (m === 'wd') {
    const w = $('ga-w').value.trim(), d = $('ga-d').value.trim();
    if (w === '') return {};
    if (!/^\d+$/.test(w) || (d !== '' && !/^\d+$/.test(d))) return fail('Weeks and days must be whole numbers.');
    const dn = d === '' ? 0 : +d;
    if (dn > 6) return fail('Days must be 0 to 6.');
    days = +w * 7 + dn;
  } else {
    const edd = $('edd').value;
    if (!edd) return {};
    const on = m === 'edd' ? todayIso() : $('scan').value;
    if (!on) return fail('Enter the scan date.');
    days = C.gaDaysFromEdd(edd, on);
    if (days === null) return fail('Check the dates.');
    from = ` from EDD ${prettyDate(edd)}, ${m === 'edd' ? 'as of today' : 'on the scan date'} (${prettyDate(on)})`;
  }
  if (days < GA_MIN_DAYS || days > GA_MAX_DAYS) {
    return fail(`That gives ${days < 0 ? 'a negative GA' : gaWords(days)}. This app accepts 8 to 44 weeks; check the entry.`);
  }
  rb.append('GA used: ', el('b', '', gaWords(days)), from);
  return { days };

  function fail(text) { rb.append(el('p', 'msg', text)); return { error: true }; }
}

// ------------------------------------------------------------------ position bar
// Horizontal scale in z-score (probit) units from the 0.5th to the 99.5th percentile, so the 3rd
// and 10th are spread apart. Beyond each cutoff the track is hatched (texture, not color); beyond
// the 3rd it is cross-hatched. The marker is a solid triangle with a vertical line.
function bar({ pct, ticks, lower = [], upper = [] }) {
  const W = 320, H = 54, L = 12, R = W - 12, trackY = 17, trackH = 13;
  const zMin = C.normInv(0.005), zMax = C.normInv(0.995);
  const x = p => {
    const z = C.normInv(Math.min(Math.max(p, 0.005), 99.995) / 100);
    const t = (Math.min(Math.max(z, zMin), zMax) - zMin) / (zMax - zMin);
    return L + t * (R - L);
  };
  const s = document.createElementNS(SVGNS, 'svg');
  s.setAttribute('viewBox', `0 0 ${W} ${H}`);
  s.setAttribute('class', 'bar');
  s.setAttribute('role', 'img');
  const uid = Math.random().toString(36).slice(2, 8);
  s.innerHTML = `
    <defs>
      <pattern id="h1${uid}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" stroke-width="1.6"/></pattern>
      <pattern id="h2${uid}" width="6" height="6" patternUnits="userSpaceOnUse">
        <path d="M0 0 L6 6 M6 0 L0 6" stroke="currentColor" stroke-width="1.3"/></pattern>
    </defs>`;
  const add = (tag, attrs) => {
    const n = document.createElementNS(SVGNS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    s.append(n); return n;
  };
  // hatched regions beyond cutoffs
  const lows = [...lower].sort((a, b) => b - a); // e.g. [10, 3]
  lows.forEach((c, i) => add('rect', { x: L, y: trackY, width: x(c) - L, height: trackH,
    fill: `url(#${i === 0 ? 'h1' : 'h2'}${uid})` }));
  upper.forEach(c => add('rect', { x: x(c), y: trackY, width: R - x(c), height: trackH, fill: `url(#h1${uid})` }));
  add('rect', { x: L, y: trackY, width: R - L, height: trackH, fill: 'none', stroke: 'currentColor',
    'stroke-width': 1.5, rx: 2 });
  // ticks
  for (const t of ticks) {
    add('line', { x1: x(t), x2: x(t), y1: trackY - 2, y2: trackY + trackH + 4, stroke: 'currentColor', 'stroke-width': 1.5 });
    const lab = add('text', { x: x(t), y: trackY + trackH + 20, 'text-anchor': 'middle',
      'font-size': 14, 'font-weight': 700, fill: 'currentColor' });
    lab.textContent = String(t);
  }
  // marker
  const mx = x(pct);
  add('line', { x1: mx, x2: mx, y1: 12, y2: trackY + trackH + 2, stroke: 'currentColor', 'stroke-width': 3 });
  add('path', { d: `M${mx - 8} 2 L${mx + 8} 2 L${mx} 13 Z`, fill: 'currentColor' });
  return s;
}

// ------------------------------------------------------------------ results
function render(target, { label, pct, lower = [], upper = [], ticks, words, range, gaDays }) {
  target.replaceChildren();
  const gaWeeks = gaDays / 7;
  if (!C.inRange(gaWeeks, range)) {
    target.append(el('p', 'extrap',
      `⚠︎ Extrapolated: ${gaShort(gaDays)} is outside this source's range (${range[0]} to ${range[1]} weeks).`));
  }
  const text = C.formatPercentile(pct, { lower, upper });
  const big = el('p', 'big', text);
  big.append(el('small', '', 'percentile'));
  target.append(big);
  if (words) target.append(el('p', 'cut', words));
  const b = bar({ pct, ticks, lower, upper });
  b.setAttribute('aria-label', `${label}: ${text} percentile${words ? ', ' + words.replace(/^[^A-Za-z]+/, '') : ''}`);
  target.append(b);
}

function update() {
  const ga = readGa();
  const efwOut = $('efw-result'), acOut = $('ac-result'), sdOut = $('sd-result');

  // EFW
  const efwRaw = $('efw').value.trim();
  efwOut.replaceChildren();
  if (C.HADLOCK_METHOD === null) {
    efwOut.append(el('p', 'hold', 'EFW percentile is on hold while the calculation method is signed off.'));
  } else if (efwRaw === '' || !ga.days) {
    efwOut.append(el('p', 'empty', ga.error ? '' : 'Enter the gestational age and EFW.'));
  } else if (!/^\d+$/.test(efwRaw) || +efwRaw < 1 || +efwRaw > EFW_MAX) {
    efwOut.append(el('p', 'msg', `EFW must be a whole number of grams, 1 to ${EFW_MAX}.`));
  } else {
    const pct = C.hadlockPercentile(+efwRaw, ga.days / 7);
    const words = pct < 3 ? '▼▼ Below the 3rd percentile' : pct < 10 ? '▼ Below the 10th percentile' : '';
    render(efwOut, { label: 'EFW', pct, lower: [3, 10], ticks: [3, 10, 50], words,
      range: C.HADLOCK.range, gaDays: ga.days });
  }

  // AC
  const acRaw = $('ac').value.trim();
  acOut.replaceChildren();
  if (C.AC_SOURCE === null) {
    acOut.append(el('p', 'hold', 'AC percentile is on hold until its Hadlock source is checked.'));
  } else if (acRaw === '' || !ga.days) {
    acOut.append(el('p', 'empty', ga.error ? '' : 'Enter the gestational age and AC.'));
  } else if (!/^\d+$/.test(acRaw) || +acRaw < AC_MIN || +acRaw > AC_MAX) {
    acOut.append(el('p', 'msg', `AC must be a whole number of millimetres, ${AC_MIN} to ${AC_MAX}.`));
  } else {
    const pct = C.acPercentile(+acRaw, ga.days / 7);
    const words = pct < 3 ? '\u25BC\u25BC Below the 3rd percentile' : pct < 10 ? '\u25BC Below the 10th percentile' : '';
    render(acOut, { label: 'AC', pct, lower: [3, 10], ticks: [3, 10, 50], words,
      range: C.HADLOCK_AC.range, gaDays: ga.days });
  }

  // S/D
  const sdRaw = $('sd').value.trim().replace(',', '.');
  sdOut.replaceChildren();
  if (!C.ACHARYA_SIGNED_OFF) {
    sdOut.append(el('p', 'hold', 'S/D percentile is on hold while the source check is signed off.'));
  } else if (sdRaw === '' || !ga.days) {
    sdOut.append(el('p', 'empty', ga.error ? '' : 'Enter the gestational age and S/D.'));
  } else if (!/^\d*\.?\d+$/.test(sdRaw) || +sdRaw <= 1 || +sdRaw > SD_MAX) {
    sdOut.append(el('p', 'msg', 'S/D must be a number greater than 1.'));
  } else {
    const pct = C.acharyaSdPercentile(+sdRaw, ga.days / 7);
    const words = pct > 95 ? '▲ Above the 95th percentile' : '';
    render(sdOut, { label: 'S/D', pct, upper: [95], ticks: [50, 95], words,
      range: C.ACHARYA_SD.range, gaDays: ga.days });
  }
}

// ------------------------------------------------------------------ wiring
document.querySelectorAll('input[name="gamode"]').forEach(r => r.addEventListener('change', () => { applyMode(); update(); }));
['ga-w', 'ga-d', 'edd', 'scan', 'efw', 'ac', 'sd'].forEach(id => $(id).addEventListener('input', update));
$('clear').addEventListener('click', () => {
  ['ga-w', 'ga-d', 'edd', 'efw', 'ac', 'sd'].forEach(id => { $(id).value = ''; });
  $('scan').value = todayIso();
  update();
  $(mode() === 'wd' ? 'ga-w' : 'edd').focus();
});

const methodNote = $('about-hadlock-method');
methodNote.textContent = C.HADLOCK_METHOD
  ? `Spread: ${C.HADLOCK.spreads[C.HADLOCK_METHOD].label}.`
  : 'Spread: method awaiting sign-off.';

// Install reminder: hidden when already running from the home screen (iOS reports this through
// navigator.standalone). Where the browser offers its own install prompt (Chrome on Android),
// show a one-tap button for it.
if (window.navigator.standalone) $('install').hidden = true;
let installPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  installPrompt = e;
  $('install-btn').hidden = false;
});
$('install-btn').addEventListener('click', async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  $('install-btn').hidden = true;
});
window.addEventListener('appinstalled', () => { $('install').hidden = true; });

applyMode();
show();
update();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
