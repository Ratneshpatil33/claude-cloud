import {Easing, interpolate, spring} from 'remotion';
import {CLAMP, FPS} from './design';

/** Decelerate: fast out of the gate, long settle. The default for every entrance. */
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

/** Local frame -> 0..1 entry ramp. */
export const ramp = (f: number, at = 0, dur = 10) =>
  interpolate(f, [at, at + dur], [0, 1], {...CLAMP, easing: EASE_OUT});

/** Small overshoot for objects that "land" (chips, words, icons). */
export const pop = (f: number, at = 0, durationInFrames = 18) =>
  spring({frame: f - at, fps: FPS, config: {damping: 16, stiffness: 150, mass: 0.9}, durationInFrames});

/** No-bounce settle for large parent visuals. */
export const settle = (f: number, at = 0, durationInFrames = 26) =>
  spring({frame: f - at, fps: FPS, config: {damping: 24, stiffness: 95, mass: 1}, durationInFrames});

/** Snappy, clamped — punch-ins and UI snaps. */
export const snap = (f: number, at = 0, durationInFrames = 10) =>
  spring({
    frame: f - at,
    fps: FPS,
    config: {damping: 30, stiffness: 320, mass: 0.7, overshootClamping: true},
    durationInFrames,
  });

export const move = (f: number, a: number, b: number, from: number, to: number) =>
  interpolate(f, [a, b], [from, to], {...CLAMP, easing: EASE_OUT});

/** Unshaped clamped interpolation — counters and sweeps. */
export const lin = (f: number, a: number, b: number, from: number, to: number) =>
  interpolate(f, [a, b], [from, to], CLAMP);

/** Fade in then out inside a scene of length `dur`. */
export const inOut = (f: number, dur: number, inDur = 8, outDur = 7) =>
  Math.min(ramp(f, 0, inDur), interpolate(f, [dur - outDur, dur], [1, 0], CLAMP));

/** Slow continuous drift for cameras and backgrounds. */
export const drift = (f: number, period: number, amp: number, phase = 0) =>
  Math.sin((f / period) * Math.PI * 2 + phase) * amp;

/** Deterministic pseudo-random in [0,1). Never use Math.random() in a render. */
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
