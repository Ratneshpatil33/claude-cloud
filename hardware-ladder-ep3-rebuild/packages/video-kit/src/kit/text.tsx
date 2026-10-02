import React from 'react';
import {interpolate} from 'remotion';
import {CLAMP, FPS, P} from '../design';
import {EASE_OUT, pop, ramp, rnd} from '../motion';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+=<>/';

/** Letters cycle through random glyphs, then lock left→right. For AI / data / crypto lines. */
export const ScrambleText: React.FC<{text: string; f: number; at?: number; dur?: number; seed?: number; style?: React.CSSProperties}> = ({
  text,
  f,
  at = 0,
  dur = 18,
  seed = 1,
  style,
}) => {
  const t = f - at;
  return (
    <span style={{fontVariantNumeric: 'tabular-nums', whiteSpace: 'pre', ...style}}>
      {[...text].map((ch, i) => {
        const lockAt = (i / Math.max(1, text.length - 1)) * dur;
        if (ch === ' ' || t >= lockAt) return <span key={i}>{t < 0 && ch !== ' ' ? '' : ch}</span>;
        if (t < 0) return <span key={i} style={{opacity: 0}}>{ch}</span>;
        const g = GLYPHS[Math.floor(rnd(seed * 97 + i * 13 + Math.floor(t / 2)) * GLYPHS.length)];
        return (
          <span key={i} style={{color: P.accent}}>
            {g}
          </span>
        );
      })}
    </span>
  );
};

/** Content slides up from behind an invisible baseline (or in from a side). Frame 0 shows the mask edge, not a blank. */
export const MaskReveal: React.FC<{
  f: number;
  at?: number;
  dur?: number;
  dir?: 'up' | 'down' | 'left' | 'right';
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({f, at = 0, dur = 12, dir = 'up', children, style}) => {
  const p = ramp(f, at, dur);
  const off = (1 - p) * 110;
  const tr = {up: `translateY(${off}%)`, down: `translateY(${-off}%)`, left: `translateX(${off}%)`, right: `translateX(${-off}%)`}[dir];
  return (
    <span style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', ...style}}>
      <span style={{display: 'inline-block', transform: tr}}>{children}</span>
    </span>
  );
};

/** A word whose weight (and optional tracking) swells as it is spoken. Needs a variable system font (SF, Avenir Next). */
export const WeightWord: React.FC<{text: string; f: number; at?: number; dur?: number; from?: number; to?: number; style?: React.CSSProperties}> = ({
  text,
  f,
  at = 0,
  dur = 10,
  from = 300,
  to = 900,
  style,
}) => {
  const w = interpolate(f, [at, at + dur], [from, to], {...CLAMP, easing: EASE_OUT});
  return <span style={{fontWeight: Math.round(w), fontVariationSettings: `'wght' ${Math.round(w)}`, ...style}}>{text}</span>;
};

/** Letters drop in with a bounce, staggered. `scatter` > 0 flies them in from seeded offsets instead. */
export const LetterDrop: React.FC<{text: string; f: number; at?: number; stagger?: number; scatter?: number; seed?: number; style?: React.CSSProperties}> = ({
  text,
  f,
  at = 0,
  stagger = 1.5,
  scatter = 0,
  seed = 3,
  style,
}) => (
  <span style={{whiteSpace: 'pre', ...style}}>
    {[...text].map((ch, i) => {
      const p = pop(f, at + i * stagger, 18);
      const dx = scatter ? (rnd(seed + i) - 0.5) * scatter : 0;
      const dy = scatter ? (rnd(seed * 7 + i) - 0.5) * scatter : -80;
      const rot = scatter ? (rnd(seed * 3 + i) - 0.5) * 60 : 0;
      return (
        <span
          key={i}
          style={{
            display: 'inline-block',
            opacity: Math.min(1, p * 1.4),
            transform: `translate(${dx * (1 - p)}px, ${dy * (1 - p)}px) rotate(${rot * (1 - p)}deg)`,
          }}
        >
          {ch}
        </span>
      );
    })}
  </span>
);

/** Frame for a spoken word inside the current scene: sceneFrameOf(word.start, scene.start). */
export const sceneFrameOf = (wordStart: number, sceneStart: number) => Math.round((wordStart - sceneStart) * FPS);
