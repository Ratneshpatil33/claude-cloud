import React from 'react';
import {getInputProps, useCurrentFrame} from 'remotion';
import {H, P, SAFE, SPLIT, W} from '../design';
import {drift, ramp, snap} from '../motion';

const TEXTURE: Record<string, (f: number) => React.CSSProperties> = {
  dots: (f) => ({
    backgroundImage: `radial-gradient(circle, ${P.dark ? '#7f86a0' : '#98a0b4'} 1.2px, transparent 1.2px)`,
    backgroundSize: '30px 30px',
    opacity: P.dark ? 0.1 : 0.16,
    maskImage: 'radial-gradient(ellipse 78% 62% at 50% 40%, black 18%, transparent 86%)',
    WebkitMaskImage: 'radial-gradient(ellipse 78% 62% at 50% 40%, black 18%, transparent 86%)',
    transform: `translateY(${drift(f, 220, 8)}px)`,
  }),
  grid: () => ({
    backgroundImage: `linear-gradient(${P.ink}14 1px, transparent 1px), linear-gradient(90deg, ${P.ink}14 1px, transparent 1px)`,
    backgroundSize: '90px 90px',
    opacity: 0.8,
  }),
  paper: (f) => ({
    backgroundImage:
      'repeating-radial-gradient(circle at 17% 32%, rgba(0,0,0,.035) 0 1px, transparent 1px 3px), repeating-radial-gradient(circle at 83% 71%, rgba(0,0,0,.03) 0 1px, transparent 1px 4px)',
    opacity: 0.45,
    transform: `translate(${(f % 3) * 0.5}px, 0)`,
  }),
  grain: (f) => ({
    backgroundImage:
      'repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,.05) 0 1px, transparent 1px 2px)',
    backgroundPosition: `${(f * 37) % 11}px ${(f * 53) % 13}px`,
    opacity: 0.9,
    mixBlendMode: 'overlay',
  }),
};

/**
 * Preset background: gradient base + texture. `height` 960 for the top half of a SPLIT.
 * Every scene sits on a Stage so frame 1 of every cut is already a composed image.
 */
export const Stage: React.FC<{f: number; height?: number; children?: React.ReactNode}> = ({f, height = H, children}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: W, height, overflow: 'hidden', background: P.bg}}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse 95% 62% at 50% 34%, ${P.dark ? P.bg2 : '#ffffff'} 0%, ${P.bg} 55%, ${P.bg2} 100%)`,
      }}
    />
    <div style={{position: 'absolute', inset: 0, ...TEXTURE[P.texture](f)}} />
    {children}
  </div>
);

export const SplitDivider: React.FC<{f: number; seam?: number}> = ({f, seam = SPLIT.seam}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: seam,
      width: W,
      height: SPLIT.divider,
      background: P.gradient,
      opacity: ramp(f, 0, 6),
      zIndex: 7,
    }}
  />
);

/** Thin progress rail across the whole film: continuity thread and retention cue. */
export const ProgressRail: React.FC<{duration: number}> = ({duration}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: 5, zIndex: 30}}>
      <div style={{height: 5, width: `${(f / duration) * 100}%`, background: P.gradient, opacity: 0.9}} />
    </div>
  );
};

/** Scale bump on emphasis moments (global frames). Wraps the scene stack. */
export const PunchIn: React.FC<{frames: number[]; amount?: number; children: React.ReactNode}> = ({
  frames,
  amount = 0.06,
  children,
}) => {
  const f = useCurrentFrame();
  let s = 1;
  for (const at of frames) {
    if (f < at || f > at + 30) continue;
    s = Math.max(s, 1 + amount * snap(f, at, 6) * (1 - ramp(f, at + 12, 18)));
  }
  return (
    <div style={{position: 'absolute', inset: 0, transform: `scale(${s})`, transformOrigin: '50% 42%'}}>{children}</div>
  );
};

/** Review-only safe-box overlay: --props='{"guides":true}'. Never on in a final. */
export const SafeGuides: React.FC = () => {
  const {guides} = getInputProps() as {guides?: boolean};
  if (!guides) return null;
  const band = 'rgba(255,45,85,.18)';
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 99, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: SAFE.top, background: band}} />
      <div style={{position: 'absolute', left: 0, bottom: 0, width: W, height: SAFE.bottom, background: band}} />
      <div style={{position: 'absolute', right: 0, top: SAFE.top, width: SAFE.right, height: SAFE.height, background: band}} />
      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: SAFE.top,
          width: SAFE.width,
          height: SAFE.height,
          outline: '3px dashed rgba(255,45,85,.9)',
        }}
      />
    </div>
  );
};
