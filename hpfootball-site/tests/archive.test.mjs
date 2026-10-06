import test from 'node:test';
import assert from 'node:assert/strict';
import { groupByYearMonth, monthName, readingMinutes, adjacentItems } from '../src/lib/archive.mjs';

const items = [
  { id: 'a', date: new Date('2026-10-04') },
  { id: 'b', date: new Date('2025-03-01') },
  { id: 'c', date: new Date('2026-09-20') },
  { id: 'd', date: new Date('2026-10-01') },
];

test('groups newest-first by year then month', () => {
  const years = groupByYearMonth(items);
  assert.deepEqual(years.map((y) => [y.year, y.count]), [[2026, 3], [2025, 1]]);
  assert.deepEqual(years[0].months.map((m) => [m.month, m.items.map((i) => i.id)]), [[10, ['a', 'd']], [9, ['c']]]);
});

test('month names are Turkish and timezone-stable', () => {
  assert.equal(monthName(10), 'Ekim');
  assert.equal(monthName(1), 'Ocak');
});

test('reading time never reports zero minutes', () => {
  assert.equal(readingMinutes(''), 1);
  assert.equal(readingMinutes('kelime '.repeat(1000)), 5);
});

test('adjacent items follow archive order', () => {
  assert.deepEqual(adjacentItems(items, 'd'), { newer: items[0], older: items[2] });
  assert.deepEqual(adjacentItems(items, 'a').newer, null);
  assert.deepEqual(adjacentItems(items, 'missing'), { newer: null, older: null });
});
