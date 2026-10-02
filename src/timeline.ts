import {Easing, interpolate} from 'remotion';

export const WIDTH = 1920;
export const HEIGHT = 1080;
export const FPS = 30;
export const DURATION = 360;

// Key moments of the animation, in frames.
export const T = {
  panelOff: 24,
  gpuIn: 50,
  panelOn: 94,
  powerOn: 136,
  pushIn: 172,
  pullBack: 252,
  endCard: 276,
};

// Where the case sits on the 1920x1080 canvas, and its size.
export const CASE = {x: 500, y: 104, w: 920, h: 820};

// Where the GPU sits inside the case once installed (case coordinates).
export const GPU = {x: 125, y: 392, w: 560, h: 210};

const clamp = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

/** Position of the "power on" light sweep, in case x coordinates. */
export const sweepX = (frame: number) =>
  interpolate(frame, [T.powerOn, T.powerOn + 32], [-80, 1000], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

/** 0..1 activation of an RGB element at case x position `x`. */
export const rgbOn = (frame: number, x: number) =>
  Math.min(1, Math.max(0, (sweepX(frame) - x) / 90));

/** Overall power level (used for ambient effects). */
export const power = (frame: number) =>
  interpolate(frame, [T.powerOn, T.powerOn + 30], [0, 1], clamp);

/** Base hue that flows over time, plus a spatial wave across the case. */
export const hueAt = (frame: number, x = 0, y = 0) =>
  200 + frame * 2.6 - x * 0.32 - y * 0.14;

export const hsl = (h: number, s = 100, l = 60, a = 1) =>
  `hsla(${(((h % 360) + 360) % 360).toFixed(1)}, ${s}%, ${l}%, ${a})`;

const SPIN_RAMP = 44;

/** 0..1 fan speed fraction. */
export const fanSpeed = (frame: number) =>
  interpolate(frame, [T.powerOn, T.powerOn + SPIN_RAMP], [0, 1], clamp);

/**
 * Fan rotation in degrees: a linear ramp up to `maxDegPerFrame`, integrated so
 * the motion is continuous and deterministic for any frame.
 */
export const fanAngle = (frame: number, maxDegPerFrame: number) => {
  const t = frame - T.powerOn;
  if (t <= 0) {
    return 0;
  }
  if (t < SPIN_RAMP) {
    return (maxDegPerFrame * t * t) / (2 * SPIN_RAMP);
  }
  return (maxDegPerFrame * SPIN_RAMP) / 2 + maxDegPerFrame * (t - SPIN_RAMP);
};
