// Release regression is restricted to version-controlled tests.
// Untracked candidate tests are reported separately, never silently discarded.
import { execFileSync, spawnSync } from 'node:child_process';
const tracked = execFileSync('git', ['ls-files', '--', 'tests/*.test.mjs'], {encoding:'utf8'}).trim().split('\n').filter(Boolean);
const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard', '--', 'tests/*.test.mjs'], {encoding:'utf8'}).trim().split('\n').filter(Boolean);
console.log(`RELEASE REGRESSION: ${tracked.length} tracked test files`);
if (untracked.length) console.log(`CANDIDATE TESTS (not admitted): ${untracked.join(', ')}`);
if (!tracked.length) { console.error('No tracked tests found; release blocked.'); process.exit(2); }
const run = spawnSync(process.execPath, ['--test', ...tracked], {stdio:'inherit'});
process.exit(run.status ?? 2);
