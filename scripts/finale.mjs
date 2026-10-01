#!/usr/bin/env node
// The talk's live finale (2026-10-02), as one command, so the phone session thinks for seconds,
// not minutes. Puts a dedication line under the title, bumps the version, runs the tests, pushes to
// main (which is the whole deploy), then watches the live site until the line is really there.
//
//   node scripts/finale.mjs "Made for UChicago OB/GYN, October 2"
//   node scripts/finale.mjs --remove          take the line out again (same steps)
//   node scripts/finale.mjs --dry-run "..."   show what would change; touch nothing
//
// Never touches the math (site/calc.js). No dependencies.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const remove = args.includes('--remove');
const text = args.filter((a) => !a.startsWith('--')).join(' ').trim();
if (!remove && !text) { console.error('usage: node scripts/finale.mjs "dedication text" | --remove [--dry-run]'); process.exit(2); }
const t0 = Date.now();
const secs = () => ((Date.now() - t0) / 1000).toFixed(1) + ' s';
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8' }).trim();
const fail = (m) => { console.error('STOPPED: ' + m); process.exit(1); };

// 1. The line: replace an existing one, or add it right after the calculator's header.
const indexPath = join(root, 'site/index.html');
let html = readFileSync(indexPath, 'utf8');
const lineRe = /\n[ \t]*<p class="dedication">[^<]*<\/p>/;
if (remove) {
  if (!lineRe.test(html)) fail('there is no dedication line to remove');
  html = html.replace(lineRe, '');
} else if (lineRe.test(html)) {
  html = html.replace(lineRe, `\n    <p class="dedication">${esc(text)}</p>`);
} else {
  const calc = html.indexOf('<section id="calc"');
  const head = html.indexOf('</header>', calc);
  if (calc < 0 || head < 0) fail('could not find the calculator header in site/index.html');
  const at = head + '</header>'.length;
  html = html.slice(0, at) + `\n    <p class="dedication">${esc(text)}</p>` + html.slice(at);
}

// 2. Version: bump the patch number in sw.js and in both <span class="ver"> tags.
const swPath = join(root, 'site/sw.js');
let sw = readFileSync(swPath, 'utf8');
const m = sw.match(/const VERSION = 'fetal-calc-v(\d+)\.(\d+)\.(\d+)';/);
if (!m) fail('could not read VERSION in site/sw.js');
const from = `${m[1]}.${m[2]}.${m[3]}`, to = `${m[1]}.${m[2]}.${+m[3] + 1}`;
sw = sw.replace(m[0], `const VERSION = 'fetal-calc-v${to}';`);
const spans = html.split(`<span class="ver">${from}</span>`).length - 1;
if (spans !== 2) fail(`expected 2 version tags reading ${from} in index.html, found ${spans}`);
html = html.split(`<span class="ver">${from}</span>`).join(`<span class="ver">${to}</span>`);

if (dry) {
  console.log(`DRY RUN: would set ${remove ? 'no dedication line' : `"${text}"`}, version ${from} -> ${to}. Nothing written.`);
  process.exit(0);
}
writeFileSync(indexPath, html);
writeFileSync(swPath, sw);

// 3. Tests (about a quarter of a second). The math is untouched, but this proves the page still loads.
const tests = readdirSync(join(root, 'tests')).filter((f) => f.endsWith('.test.mjs')).map((f) => join(root, 'tests', f));
const r = spawnSync(process.execPath, ['--test', ...tests], { cwd: root, encoding: 'utf8' });
if (r.status !== 0) { git('checkout', '--', 'site/index.html', 'site/sw.js'); fail('tests failed; nothing pushed\n' + r.stdout.slice(-800)); }

// 4. Commit and push to main. That push is the deploy.
git('add', 'site/index.html', 'site/sw.js');
git('commit', '-q', '-m', remove ? `Finale: remove the dedication line, ${to}` : `Finale: "${text}", ${to}`);
try {
  git('push', '-q', 'origin', 'HEAD:main');
} catch {
  git('pull', '-q', '--rebase', 'origin', 'main');
  git('push', '-q', 'origin', 'HEAD:main');
}
console.log(`Pushed to main at ${secs()} (version ${to}). Waiting for Netlify...`);

// 5. Watch the live site until it really shows the change, so "LIVE" means Reload will show it.
const want = (body) => (remove ? !body.includes('class="dedication"') : body.includes(`<p class="dedication">${esc(text)}</p>`))
  && body.includes(`<span class="ver">${to}</span>`);
for (let i = 0; i < 45; i++) {
  try {
    const res = await fetch(`https://fetal-calc.netlify.app/?r=${Date.now()}`, { cache: 'no-store' });
    if (want(await res.text())) { console.log(`LIVE at ${secs()}: ${remove ? 'dedication removed' : text} (version ${to}). Press Reload.`); process.exit(0); }
  } catch { /* the network check is a convenience; the push already happened */ }
  await new Promise((ok) => setTimeout(ok, 2000));
}
console.log(`Pushed, but the live site didn't show it within 90 s. Press Reload anyway.`);
