import test from 'node:test';
import assert from 'node:assert/strict';
import { IFAB_PITCH, pitchGeometry } from '../src/lib/pitch-geometry.mjs';

const close = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);

test('pitch keeps the IFAB 105 × 68 aspect ratio', () => {
  const g = pitchGeometry({ width: 900, padding: 40 });
  close(g.outline.width / g.outline.height, 105 / 68);
});

test('penalty and goal areas are to scale and centred', () => {
  const g = pitchGeometry();
  const [left, right] = g.penaltyAreas;
  close(left.width / g.scale, IFAB_PITCH.penaltyAreaLength);
  close(left.height / g.scale, IFAB_PITCH.penaltyAreaWidth);
  close(left.y + left.height / 2, g.centre.cy);
  close(right.x + right.width, g.outline.x + g.outline.width);
  close(g.goalAreas[0].width / g.scale, IFAB_PITCH.goalAreaLength);
});

test('centre circle and penalty spots use the 9.15 m / 11 m marks', () => {
  const g = pitchGeometry();
  close(g.centre.r / g.scale, 9.15);
  close((g.penaltySpots[0].cx - g.outline.x) / g.scale, 11);
});

test('penalty arc starts on the penalty-area edge', () => {
  const g = pitchGeometry();
  const startX = Number(g.penaltyArcs[0].match(/^M([\d.]+)/)[1]);
  close(startX, g.penaltyAreas[0].x + g.penaltyAreas[0].width);
});
