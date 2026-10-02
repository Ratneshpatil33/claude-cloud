import type {CSSProperties} from 'react';
import {PRESETS, Preset} from './presets';

export const FPS = 25;
export const W = 1080;
export const H = 1920;

/**
 * Active preset, set by `configure()` from timeline.json `preset` plus the project's `palette` overrides.
 * Mutated in place so every importer sees the configured tokens: read it at render time, not at module load.
 */
export const P: Preset = {...PRESETS['apple-light']};

export const applyPreset = (name: string, overrides: Partial<Preset> = {}) => {
  Object.assign(P, PRESETS[name] ?? PRESETS['apple-light'], overrides);
};

/**
 * Safe box shared by Reels / TikTok / Shorts. Legible type and faces stay inside it:
 * clear of the top bar, the right action rail, and the bottom caption/CTA strip.
 */
export const SAFE = {
  left: 80,
  right: 180,
  top: 240,
  bottom: 440,
  get width() {
    return W - this.left - this.right;
  },
  get height() {
    return H - this.top - this.bottom;
  },
} as const;

export const SPLIT = {seam: 960, divider: 3} as const;

/** Avatar bubble: bottom-left (the right side is covered by platform buttons). */
export const PIP = {size: 300, left: 80, top: 1180} as const;

export const SHADOW = {
  card: '0 24px 60px -18px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.05)',
  soft: '0 14px 34px -12px rgba(0,0,0,.14), 0 1px 4px rgba(0,0,0,.04)',
  lift: '0 40px 90px -24px rgba(0,0,0,.24), 0 4px 14px rgba(0,0,0,.06)',
} as const;

export const CLAMP = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

export const sec = (s: number) => Math.round(s * FPS);

export const displayType = (size: number): CSSProperties => ({
  fontFamily: P.display,
  fontSize: size,
  fontWeight: P.displayWeight,
  letterSpacing: `${P.tracking}em`,
  lineHeight: 1.02,
  color: P.ink,
});
