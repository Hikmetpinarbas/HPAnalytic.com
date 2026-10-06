import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const registry = JSON.parse(await readFile(new URL('../docs/research/HPANALYTIC_DONOR_REGISTRY.json', import.meta.url), 'utf8'));
const DECISIONS = new Set(registry.policy.decisions);
const RESTRICTED = new Set(['COPYLEFT', 'PROPRIETARY_REFERENCE_ONLY', 'UNKNOWN', 'NO_LICENSE']);

test('every donor is pinned and licence-classified', () => {
  const ids = new Set();
  for (const donor of registry.donors) {
    assert.ok(!ids.has(donor.id), `duplicate id ${donor.id}`);
    ids.add(donor.id);
    assert.ok(donor.commit || donor.version, `${donor.id} has no commit/version pin`);
    assert.ok(donor.license && donor.license_class, `${donor.id} has no licence`);
    assert.ok(donor.examined?.length > 0, `${donor.id} lists no examined component`);
  }
});

test('every examined component has a decision from the fixed vocabulary', () => {
  for (const donor of registry.donors) {
    for (const item of donor.examined) {
      assert.ok(DECISIONS.has(item.decision), `${donor.id} ${item.file}: ${item.decision}`);
    }
  }
});

test('restricted licences never yield code reuse (policy §7)', () => {
  for (const donor of registry.donors) {
    if (!RESTRICTED.has(donor.license_class)) continue;
    for (const item of donor.examined) {
      assert.ok(['PATTERN_ONLY', 'HOLD', 'REJECT'].includes(item.decision), `${donor.id} ${item.file} -> ${item.decision}`);
    }
  }
});

test('REJECT and HOLD decisions carry a reason', () => {
  for (const donor of registry.donors) {
    for (const item of donor.examined) {
      if (item.decision === 'REJECT' || item.decision === 'HOLD') {
        assert.ok(item.reason || item.status, `${donor.id} ${item.file} has no reason`);
      }
    }
  }
});
