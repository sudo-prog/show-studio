import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clamp,
  smoothstep,
  smootherstep,
  damp,
  shortestAngleDiff,
  getGarmentCardPose,
  getShoeViewKey,
  calculateRackOffsets,
} from './math3d';

test('clamp restricts values to min and max', () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-3, 0, 10), 0);
  assert.equal(clamp(15, 0, 10), 10);
});

test('smoothstep computes correct hermite interpolation', () => {
  assert.equal(smoothstep(0, 10, -5), 0);
  assert.equal(smoothstep(0, 10, 15), 1);
  assert.equal(smoothstep(0, 10, 5), 0.5);
});

test('smootherstep provides smooth acceleration/deceleration', () => {
  assert.equal(smootherstep(0, 1, 0), 0);
  assert.equal(smootherstep(0, 1, 1), 1);
  assert.equal(smootherstep(0, 1, 0.5), 0.5);
});

test('damp smoothly approaches target', () => {
  const next = damp(0, 10, 4, 0.1);
  assert.ok(next > 0 && next < 10);
  const full = damp(0, 10, 100, 1.0);
  assert.ok(Math.abs(full - 10) < 0.0001);
});

test('shortestAngleDiff correctly wraps angle differences', () => {
  const diff1 = shortestAngleDiff(0, Math.PI / 4);
  assert.ok(Math.abs(diff1 - Math.PI / 4) < 1e-6);

  const diffWrap = shortestAngleDiff(0.1, Math.PI * 2 - 0.1);
  assert.ok(diffWrap < 0);
});

test('getGarmentCardPose returns appropriate view and perspective tilt', () => {
  const frontPose = getGarmentCardPose(0);
  assert.equal(frontPose.view, 'front');
  assert.equal(frontPose.mirror, false);

  const sidePose = getGarmentCardPose(Math.PI / 2);
  assert.equal(sidePose.view, 'side');

  const backPose = getGarmentCardPose(Math.PI);
  assert.equal(backPose.view, 'back');

  const mirrorPose = getGarmentCardPose((3 * Math.PI) / 2);
  assert.equal(mirrorPose.view, 'mirroredSide');
  assert.equal(mirrorPose.mirror, true);
});

test('getShoeViewKey returns correct 4-view quadrants', () => {
  assert.equal(getShoeViewKey(0).view, 'outer');
  assert.equal(getShoeViewKey(Math.PI / 2).view, 'toe');
  assert.equal(getShoeViewKey(Math.PI).view, 'inner');
  assert.equal(getShoeViewKey((3 * Math.PI) / 2).view, 'heel');
});

test('calculateRackOffsets pushes neighbours away from hovered garment', () => {
  const total = 5;
  const offsets = calculateRackOffsets(total, 2, 0.6, 0.2);
  assert.equal(offsets[2], 0); // hovered item stays centered
  assert.ok(offsets[1] < 0); // left neighbor slides left
  assert.ok(offsets[3] > 0); // right neighbor slides right
});
