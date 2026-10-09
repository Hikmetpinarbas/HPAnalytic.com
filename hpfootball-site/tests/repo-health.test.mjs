import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
test('repository governance and structural health gate passes', () => {
  const result = JSON.parse(execFileSync(process.execPath, ['scripts/repo-health.mjs'], { cwd: root, encoding: 'utf8' }));
  assert.equal(result.schema, 'hp-repo-health/v1');
  assert.equal(result.result, 'PASS');
  assert.ok(result.checks.length >= 10);
});
