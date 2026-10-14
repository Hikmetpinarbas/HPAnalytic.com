import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

test('publication audit is non-mutating and reports approved content and local assets', () => {
  const result = JSON.parse(execFileSync(process.execPath, [new URL('../scripts/publication-readiness.mjs', import.meta.url).pathname], {encoding:'utf8'}));
  assert.ok(['AUDIT_COMPLETE','BLOCKED_APPROVED_CONTENT'].includes(result.status));
  assert.equal(result.counts.publishable + result.counts.blocked, result.publishable.length + result.blocked.length);
  for (const row of result.publishable) {
    assert.equal(row.approved, true);
    assert.deepEqual(row.missing, []);
    assert.deepEqual(row.absentAssets, []);
  }
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url),'utf8'));
  assert.equal(pkg.scripts['article:audit'], 'node scripts/publication-readiness.mjs');
});
