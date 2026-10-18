import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const workflow = readFileSync(fileURLToPath(new URL('../../.github/workflows/hpanalytic-production-deploy.yml', import.meta.url)), 'utf8');
test('production deployment is manual and explicitly confirmed', () => {
  assert.match(workflow, /workflow_dispatch:/);
  assert.doesNotMatch(workflow, /^\s{2}push:/m);
  assert.match(workflow, /confirm_production_deploy:/);
  assert.match(workflow, /inputs\.confirm_production_deploy == true/);
  assert.match(workflow, /environment: production/);
});
test('browser QA and evidence gate precede Cloudflare deploy', () => {
  const qa = workflow.indexOf('node scripts/release-browser-qa.mjs');
  const deploy = workflow.indexOf('Deploy accepted HPAnalytic to existing Worker');
  assert.ok(qa > 0 && deploy > qa);
  assert.match(workflow, /if-no-files-found: error/);
  assert.match(workflow, /wrangler@4\.146\.0 deploy --dry-run/);
});
