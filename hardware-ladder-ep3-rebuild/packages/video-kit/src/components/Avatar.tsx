import React from 'react';
import {Freeze, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {FPS, H, P, SPLIT, W} from '../design';
import {EASE_IN_OUT} from '../motion';
import {
  AVATAR_FOCUS,
  AVATAR_PIP,
  AVATAR_PIP_ZOOM,
  AVATAR_READY,
  AVATAR_SPLIT_FOCUS,
  AVATAR_TAKES,
  AvatarTake,
  CUTS,
  MORPH_FRAMES,
  Scene,
  cutIndexAt,
  seamOf,
} from '../timeline';

type Rect = {x: number; y: number; w: number; h: number; r: number; o: number; zoom: number; fx: number; fy: number};

/** '50% 31%' -> [50, 31] */
const parseFocus = (s: string): [number, number] => {
  const [x = 50, y = x] = s.split(/\s+/).map((v) => parseFloat(v));
  return [x, y];
};

/** Per-scene avatar box (treatment + SPLIT seam). A getter because AVATAR_PIP / AVATAR_PIP_ZOOM are set by configure() after this module loads. */
const layoutFor = (scene: Pick<Scene, 'treat' | 'seam'>): Rect => {
  const treat = scene.treat;
  const [fx, fy] = parseFocus(AVATAR_FOCUS);
  const [sfx, sfy] = parseFocus(AVATAR_SPLIT_FOCUS);
  const pip = AVATAR_PIP;
  const bubble = {x: pip.left, y: pip.top, w: pip.size, h: pip.size, r: pip.size / 2, zoom: AVATAR_PIP_ZOOM, fx, fy};
  switch (treat) {
    case 'SPLIT':
      return {x: 0, y: seamOf(scene) + SPLIT.divider, w: W, h: H - seamOf(scene) - SPLIT.divider, r: 0, o: 1, zoom: 1, fx: sfx, fy: sfy};
    case 'AVATAR':
      return {x: 0, y: 0, w: W, h: H, r: 0, o: 1, zoom: 1, fx, fy};
    case 'PIP':
      return {...bubble, o: 1};
    default:
      return {...bubble, o: 0};
  }
};

const MORPH = MORPH_FRAMES;

const mix = (a: Rect, b: Rect, t: number): Rect => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  w: a.w + (b.w - a.w) * t,
  h: a.h + (b.h - a.h) * t,
  r: a.r + (b.r - a.r) * t,
  o: a.o + (b.o - a.o) * t,
  zoom: a.zoom + (b.zoom - a.zoom) * t,
  fx: a.fx + (b.fx - a.fx) * t,
  fy: a.fy + (b.fy - a.fy) * t,
});

/** Layout for a global frame: morphs from the previous cut's layout over the first MORPH frames of a cut. */
const rectAt = (frame: number): Rect => {
  const i = cutIndexAt(frame);
  const cut = CUTS[i];
  const target = layoutFor(cut);
  if (i === 0) return target;
  const prev = layoutFor(CUTS[i - 1]);
  if (prev.o === 0 && target.o === 0) return target;
  // Fading in from hidden: appear in place rather than flying in from the bubble corner.
  const from = prev.o === 0 ? {...target, o: 0} : target.o === 0 ? {...prev, o: 0} : prev;
  const t = interpolate(frame - cut.from, [0, MORPH], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_IN_OUT,
  });
  return target.o === 0 ? mix(prev, from, t) : mix(from, target, t);
};

const Placeholder: React.FC<{take: AvatarTake}> = ({take}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      display: 'grid',
      placeItems: 'center',
      background: 'linear-gradient(152deg,#191A21 0%,#23252F 58%,#15161C 100%)',
    }}
  >
    <div style={{textAlign: 'center', padding: 40}}>
      <div style={{width: 110, height: 110, borderRadius: '50%', margin: '0 auto 24px', background: P.gradient, opacity: 0.35}} />
      <div style={{fontFamily: P.mono, fontSize: 22, fontWeight: 700, letterSpacing: 2.4, color: '#F5F5F7'}}>
        AVATAR PLACEHOLDER
      </div>
      <div style={{marginTop: 12, fontFamily: P.mono, fontSize: 19, color: 'rgba(245,245,247,.55)'}}>
        {take.file} · {take.start.toFixed(2)}–{take.end.toFixed(2)}s
      </div>
    </div>
  </div>
);

const TakeLayer: React.FC<{take: AvatarTake; from: number; freeze?: number}> = ({take, from, freeze}) => {
  const local = useCurrentFrame();
  const rect = rectAt(from + local);
  if (rect.o <= 0.001) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        borderRadius: rect.r,
        overflow: 'hidden',
        opacity: rect.o,
        zIndex: 6,
        boxShadow: rect.r > 0 ? `0 0 0 4px #fff, 0 24px 60px -16px rgba(0,0,0,.45)` : undefined,
        background: '#111',
      }}
    >
      {AVATAR_READY ? (
        <Freeze frame={freeze ?? 0} active={freeze !== undefined}>
          <OffthreadVideo
            src={staticFile(take.file)}
            muted
            trimBefore={Math.round((take.trimBefore ?? 0) * FPS)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: `${rect.fx}% ${rect.fy}%`,
              transform: `scale(${rect.zoom})`,
              transformOrigin: `${rect.fx}% ${rect.fy}%`,
            }}
          />
        </Freeze>
      ) : (
        <Placeholder take={take} />
      )}
    </div>
  );
};

/**
 * Each take is one continuous, lip-synced clip. It keeps playing (hidden) through ANIM cuts,
 * so the mouth never drifts from the narration no matter how the layout changes.
 */
export const AvatarTrack: React.FC = () => (
  <>
    {AVATAR_TAKES.map((take) => {
      const from = Math.round(take.start * FPS);
      const to = Math.round(take.end * FPS);
      const len = Math.max(1, to - from);
      // Slices start/end on words; hold the clip's first/last frame so the avatar box is never empty
      // while its scene is on screen.
      const startCut = CUTS[cutIndexAt(from)];
      const endCut = CUTS[cutIndexAt(Math.max(from, to - 1))];
      const holdFrom = layoutFor(startCut).o > 0 && from - startCut.from <= HOLD ? startCut.from : from;
      const endCutTo = endCut.from + endCut.durationInFrames;
      const holdTo = layoutFor(endCut).o > 0 && endCutTo - to <= HOLD ? endCutTo : to;
      return (
        <React.Fragment key={take.file + take.start}>
          {holdFrom < from ? (
            <Sequence from={holdFrom} durationInFrames={from - holdFrom} layout="none">
              <TakeLayer take={take} from={holdFrom} freeze={0} />
            </Sequence>
          ) : null}
          <Sequence from={from} durationInFrames={len} layout="none">
            <TakeLayer take={take} from={from} />
          </Sequence>
          {holdTo > to ? (
            <Sequence from={to} durationInFrames={holdTo - to} layout="none">
              <TakeLayer take={take} from={to} freeze={len - 1} />
            </Sequence>
          ) : null}
        </React.Fragment>
      );
    })}
  </>
);

/** Max gap (frames) bridged by holding a first/last frame. */
const HOLD = 12;
