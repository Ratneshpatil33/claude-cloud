import {Easing, interpolate, spring} from 'remotion';

export const FPS = 30;
export const W = 1080;
export const H = 1920;

/** Instagram-safe box: hero type and key visuals stay inside it (Meta's Reels guide and the kit's SAFE combined). */
export const SAFE = {left: 80, right: 900, top: 270, bottom: 1250} as const;

export const C = {
  bg: '#F5F5F7',
  ink: '#1D1D1F',
  ink2: '#6E6E73',
  ink3: '#AEAEB2',
  hair: 'rgba(0,0,0,.12)',
  apple: '#0A84FF',
  nvidia: '#76B900',
  model: '#AF52DE',
  red: '#FF3B30',
  green: '#34C759',
} as const;

export const SHADOW = {
  soft: '0 14px 34px -12px rgba(0,0,0,.14), 0 1px 4px rgba(0,0,0,.04)',
  card: '0 24px 60px -18px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.05)',
  lift: '0 40px 90px -24px rgba(0,0,0,.26), 0 4px 14px rgba(0,0,0,.06)',
} as const;

export const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
/** Apple-style decelerate: fast out of the gate, long settle. */
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);

export const ramp = (f: number, at = 0, dur = 12) => interpolate(f, [at, at + dur], [0, 1], {...CLAMP, easing: EASE_OUT});
export const rampIO = (f: number, at = 0, dur = 12) => interpolate(f, [at, at + dur], [0, 1], {...CLAMP, easing: EASE_IN_OUT});
export const rampIn = (f: number, at = 0, dur = 12) => interpolate(f, [at, at + dur], [0, 1], {...CLAMP, easing: EASE_IN});
export const lin = (f: number, a: number, b: number, from = 0, to = 1) => interpolate(f, [a, b], [from, to], CLAMP);
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/** Small overshoot for things that land (numbers, icons, pins). */
export const pop = (f: number, at = 0) => spring({frame: f - at, fps: FPS, config: {damping: 15, stiffness: 160, mass: 0.85}});
/** No-bounce settle for large objects. */
export const settle = (f: number, at = 0) => spring({frame: f - at, fps: FPS, config: {damping: 26, stiffness: 90, mass: 1}});
/** Snappy, clamped: punch-ins and UI snaps. */
export const snap = (f: number, at = 0) =>
  spring({frame: f - at, fps: FPS, config: {damping: 30, stiffness: 320, mass: 0.7, overshootClamping: true}});

/** Deterministic pseudo-random in [0, 1). */
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
