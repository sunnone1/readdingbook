/**
 * Pure arc geometry and interpolation math for the curved VHS archive.
 */

export function rel(v: number, s: number): number {
  let diff = (v - s) % 36;
  if (diff < -18) diff += 36;
  if (diff >= 18) diff -= 36;
  return diff;
}

export function B(r: number): number {
  if (Math.abs(r) < 1) {
    return (r + Math.sin(Math.PI * r) / Math.PI) / 2;
  }
  return r >= 0 ? 0.5 : -0.5;
}

export function F(r: number, ws: number, d: number, gap: number): number {
  return r * (ws + gap) + (d - ws + 1.4 * gap) * B(r);
}

export function scl(u: number, U: number): number {
  if (U <= 0) return 1;
  return 1 / (1 + Math.pow(Math.abs(u) / U, 1.6));
}

export function computeXS(U: number): Float64Array {
  const maxU = 3 * Math.max(1, U);
  const steps = Math.ceil(maxU / 2) + 1;
  const XS = new Float64Array(steps);
  let acc = 0;
  for (let i = 0; i < steps; i++) {
    const u = i * 2;
    acc += 2 / (1 + Math.pow(u / U, 1.6));
    XS[i] = acc;
  }
  return XS;
}

export function lookupXsc(u: number, XS: Float64Array): number {
  if (u === 0 || XS.length === 0) return 0;
  const stepIndex = Math.min(XS.length - 1, Math.max(0, Math.floor(Math.abs(u) / 2)));
  return Math.sign(u) * XS[stepIndex];
}

export function smoothstep(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped * clamped * (3 - 2 * clamped);
}

export interface FilmYear {
  year: number;
}

export function getInterpolatedYear(s: number, films: { year: number }[]): number {
  const n = films.length;
  if (n === 0) return 1955;
  const baseS = ((s % n) + n) % n;
  const i0 = Math.floor(baseS);
  const i1 = (i0 + 1) % n;
  const frac = baseS - i0;

  const y0 = films[i0].year;
  const y1 = films[i1].year;

  // On 1989 -> 1958 wrap, jump at the halfway point (frac >= 0.5)
  if (i0 === n - 1 && i1 === 0) {
    return frac >= 0.5 ? y1 : y0;
  }
  return y0 + (y1 - y0) * frac;
}
