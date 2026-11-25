// HP-MISTRAL-WAVE1-SITE-01 — live-marquee fail-closed unit testleri.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPool, isFresh, verifiedMatchLabels } from '../src/js/live-marquee.js';

const NOW = Date.parse('2026-11-25T12:00:00Z');

test('unavailable seed renders no scores', () => {
  const seed = { schema: 'hpa.live_ticker.v1', available: false, fetched_at: null, items: [] };
  const labels = verifiedMatchLabels(seed, NOW);
  assert.equal(labels.length, 0);
  const pool = buildPool(seed, NOW);
  assert.ok(pool.some(t => t.includes('uydurulmaz')), 'no-data note must appear');
  assert.ok(!/\d+\s*-\s*\d+\s*\(/.test(pool.join(' ')), 'no score label allowed');
});

test('stale fetched_at never revives old scores', () => {
  const stale = {
    schema: 'hpa.live_ticker.v1', available: true,
    fetched_at: '2026-11-01T00:00:00Z',
    items: [{ home: 'Lille', away: 'Galatasaray', status: 'final', score: '2-4', date: '2026-10-21' }],
  };
  assert.equal(verifiedMatchLabels(stale, NOW).length, 0);
  assert.ok(!buildPool(stale, NOW).join(' ').includes('Lille 2-4'));
});

test('broken fetched_at fails closed', () => {
  assert.equal(isFresh(null, NOW), false);
  assert.equal(isFresh('not-a-date', NOW), false);
  assert.equal(isFresh('2026-11-30T00:00:00Z', NOW), false);
});

test('fresh verified final and live scores render, scheduled shows no score', () => {
  const data = {
    schema: 'hpa.live_ticker.v1', available: true, fetched_at: '2026-11-25T11:00:00Z',
    items: [
      { home: 'Lille', away: 'Galatasaray', status: 'final', score: '2-4', date: '2026-11-24' },
      { home: 'A', away: 'B', status: 'live', score: '1-0', date: '2026-11-25' },
      { home: 'Shakhtar Donetsk', away: 'Fenerbah\u00e7e', status: 'scheduled', date: '2026-12-10' },
      { home: 'C', away: 'D', status: 'final', score: 'olmayan', date: '2026-11-24' },
    ],
  };
  const labels = verifiedMatchLabels(data, NOW);
  assert.ok(labels.includes('Lille 2-4 Galatasaray (MS)'));
  assert.ok(labels.includes('A 1-0 B (L\u0130VE)'));
  assert.ok(labels.some(l => l.startsWith('Shakhtar Donetsk — Fenerbah\u00e7e')));
  assert.ok(!labels.some(l => l.startsWith('C ')));
});

test('facts pool always present as editorial fallback', () => {
  const pool = buildPool(null, NOW);
  assert.ok(pool.length >= 7);
  assert.ok(pool.some(t => t.includes('Leicester City')));
});
