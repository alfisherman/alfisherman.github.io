import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const [base, head] = process.argv.slice(2);
const fail = (message) => {
  console.error(`Release guard: ${message}`);
  process.exit(1);
};
if (!/^[0-9a-f]{40}$/.test(base ?? '') || !head) fail('need base SHA and proposed head ref');

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const gitBytes = (...args) => execFileSync('git', args);
const intentPath = '.github/release-intent.json';
let intent;
try {
  intent = JSON.parse(git('show', `${head}:${intentPath}`));
} catch {
  fail(`add ${intentPath} to the proposed release`);
}

const files = gitBytes('diff', '--name-only', '-z', base, head)
  .toString('utf8').split('\0').filter(Boolean);
if (!files.includes(intentPath)) fail(`${intentPath} must be updated in this PR`);
if (intent.base !== base) fail(`intent.base must equal production base ${base}`);
if (typeof intent.reason !== 'string' || intent.reason.trim().length < 12) {
  fail('intent.reason must explain the release');
}
if (!['partners', 'site', 'infra'].includes(intent.scope)) fail('scope must be partners, site, or infra');
if (files.length < 2) fail('release must change files besides its intent');

const protectedFiles = new Set(['CNAME', '.nojekyll', '.github/workflows/release-guard.yml', '.github/scripts/check-release.mjs']);
if (intent.scope === 'partners') {
  const outOfScope = files.filter((file) => file !== intentPath && !file.startsWith('p/'));
  if (outOfScope.length) fail(`partners release cannot change: ${outOfScope.join(', ')}`);
} else if (intent.scope === 'infra') {
  const outOfScope = files.filter((file) => file !== intentPath && !file.startsWith('.github/'));
  if (outOfScope.length) fail(`infra release cannot change: ${outOfScope.join(', ')}`);
} else {
  const blocked = files.filter((file) => protectedFiles.has(file));
  if (blocked.length) fail(`site release cannot change protected configuration: ${blocked.join(', ')}`);
  if (!/^[0-9a-f]{64}$/.test(intent.homepageSha256 ?? '')) fail('site release needs homepageSha256');
  let homepage;
  try { homepage = gitBytes('show', `${head}:index.html`); }
  catch { fail('site release must contain index.html'); }
  const actual = createHash('sha256').update(homepage).digest('hex');
  if (actual !== intent.homepageSha256) fail(`homepageSha256 mismatch: ${actual}`);
}

for (const file of ['CNAME', '.nojekyll']) {
  try { gitBytes('show', `${head}:${file}`); }
  catch { fail(`proposed release removes ${file}`); }
}
if (git('show', `${head}:CNAME`) !== 'oblachko.team') fail('CNAME must remain oblachko.team');
console.log(`Release guard: ${intent.scope}; base ${base}; ${files.length - 1} content file(s)`);
console.log(files.join('\n'));
