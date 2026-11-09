import test from 'node:test';
import assert from 'node:assert/strict';
import {
  rel,
  B,
  F,
  scl,
  computeXS,
  lookupXsc,
  smoothstep,
  getInterpolatedYear
} from './geometry.ts';

test('rel maps into [-18, 18)', () => {
  assert.equal(rel(17, 17), 0);
  assert.equal(rel(18, 17), 1);
  assert.equal(rel(16, 17), -1);
  assert.equal(rel(35, 0), -1);
  assert.equal(rel(0, 35), 1);
  assert.equal(rel(0, 18), -18);
  assert.equal(rel(18, 0), -18);
  assert.ok(rel(10, 25) >= -18 && rel(10, 25) < 18);
});

test('B(r) matches continuous bump function', () => {
  assert.equal(B(0), 0);
  assert.ok(Math.abs(B(1) - 0.5) < 1e-6);
  assert.ok(Math.abs(B(-1) - (-0.5)) < 1e-6);
  assert.equal(B(2), 0.5);
  assert.equal(B(-2), -0.5);
});

test('F(r) smooth spacing expansion at center', () => {
  const ws = 50;
  const d = 150;
  const gap = 10;
  assert.equal(F(0, ws, d, gap), 0);
  const f1 = F(1, ws, d, gap);
  const fMinus1 = F(-1, ws, d, gap);
  assert.ok(Math.abs(f1 + fMinus1) < 1e-6); // symmetric
  assert.ok(f1 > ws + gap); // pushed out by open cover
});

test('scl and XS precomputation', () => {
  const U = 300;
  assert.equal(scl(0, U), 1);
  assert.ok(scl(U, U) === 0.5);
  assert.ok(scl(2 * U, U) < 0.5);

  const XS = computeXS(U);
  assert.ok(XS.length > 0);
  assert.equal(lookupXsc(0, XS), 0);
  assert.ok(lookupXsc(100, XS) > 0);
  assert.ok(lookupXsc(-100, XS) < 0);
  assert.ok(Math.abs(lookupXsc(100, XS) + lookupXsc(-100, XS)) < 1e-6);
});

test('smoothstep behavior', () => {
  assert.equal(smoothstep(0), 0);
  assert.equal(smoothstep(1), 1);
  assert.equal(smoothstep(0.5), 0.5);
  assert.equal(smoothstep(-1), 0);
  assert.equal(smoothstep(2), 1);
});

test('getInterpolatedYear handles films and wrap-around', () => {
  const films = [
    { year: 1958 },
    { year: 1962 },
    { year: 1971 },
    { year: 1989 }
  ];
  assert.equal(getInterpolatedYear(0, films), 1958);
  assert.equal(getInterpolatedYear(1, films), 1962);
  assert.equal(getInterpolatedYear(0.5, films), 1960);
  // Wrap between index 3 (1989) and index 0 (1958)
  assert.equal(getInterpolatedYear(3.2, films), 1989);
  assert.equal(getInterpolatedYear(3.8, films), 1958);
});
