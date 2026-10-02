import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {CLAMP, P, SPLIT} from './design';
import {EASE_IN_OUT} from './motion';
import type {SceneFor} from './scenes';
import {CUTS, Cut, DURATION, EMPHASIS_FRAMES, Exit, hookVariant, seamAt, seamOf} from './timeline';
import {AvatarTrack} from './components/Avatar';
import {Captions} from './components/Captions';
import {ContextCards} from './components/ContextCards';
import {ProgressRail, PunchIn, SafeGuides, SplitDivider} from './components/Chrome';
import {SoundTrack} from './components/SoundTrack';

/**
 * The outgoing scene stays on top and plays its exit over the incoming one, so no frame is ever blank.
 * Frames of overlap per exit style:
 */
const OVERLAP: Record<Exit, number> = {dissolve: 5, cut: 0, wipe: 9, whip: 7, zoom: 8, 'slide-up': 8};

const exitStyle = (cut: Cut, f: number): React.CSSProperties => {
  const exit = cut.exit ?? 'dissolve';
  const n = OVERLAP[exit];
  if (!n) return {};
  const t = interpolate(f, [cut.durationInFrames, cut.durationInFrames + n], [0, 1], {...CLAMP, easing: EASE_IN_OUT});
  if (t <= 0) return {};
  const {x, y} = cut.exitAt ?? {x: 540, y: 820};
  switch (exit) {
    case 'wipe': {
      const r = t * 2300;
      const mask = `radial-gradient(circle at ${x}px ${y}px, transparent ${r}px, black ${r + 2}px)`;
      return {WebkitMaskImage: mask, maskImage: mask};
    }
    case 'whip':
      return {transform: `translateX(${-t * 1180}px)`, filter: `blur(${Math.sin(t * Math.PI) * 14}px)`};
    case 'zoom':
      return {transform: `scale(${1 + t * t * 3.5})`, transformOrigin: `${x}px ${y}px`, opacity: 1 - t};
    case 'slide-up':
      return {transform: `translateY(${-t * 1920}px)`};
    default:
      return {opacity: 1 - t};
  }
};

const SceneFrame: React.FC<{cut: Cut; variant: string; last: boolean; sceneFor: SceneFor}> = ({cut, variant, last, sceneFor}) => {
  const f = useCurrentFrame();
  const Scene = sceneFor(cut.id, variant);
  const clip = cut.treat === 'SPLIT' ? {clipPath: `inset(0 0 ${1920 - seamOf(cut)}px 0)`} : undefined;
  return (
    <AbsoluteFill style={{...clip, ...(last ? {} : exitStyle(cut, f))}}>
      <Scene f={Math.min(f, cut.durationInFrames - 1)} dur={cut.durationInFrames} scene={cut} />
    </AbsoluteFill>
  );
};

const SplitTrack: React.FC = () => (
  <>
    {CUTS.filter((c) => c.treat === 'SPLIT').map((c) => (
      <Sequence key={c.id} from={c.from} durationInFrames={c.durationInFrames} layout="none">
        <SplitSeam from={c.from} />
      </Sequence>
    ))}
  </>
);

/** The divider follows the seam as it morphs between SPLIT cuts (seamAt takes the global frame). */
const SplitSeam: React.FC<{from: number}> = ({from}) => {
  const f = useCurrentFrame();
  return <SplitDivider f={f} seam={seamAt(from + f)} />;
};

/** The whole edit: scenes (from the project's `sceneFor` registry), avatar, cards, captions, chrome and sound. */
export const Video: React.FC<{sceneFor: SceneFor}> = ({sceneFor}) => {
  const variant = hookVariant();
  return (
    <AbsoluteFill style={{background: P.bg, color: P.ink, fontFamily: P.text}}>
      <PunchIn frames={EMPHASIS_FRAMES}>
        {CUTS.map((cut, i) => {
          const last = i === CUTS.length - 1;
          return (
            <Sequence
              key={cut.id}
              from={cut.from}
              durationInFrames={cut.durationInFrames + (last ? 0 : OVERLAP[cut.exit ?? 'dissolve'])}
              layout="none"
            >
              <div style={{position: 'absolute', inset: 0, zIndex: CUTS.length - i}}>
                <SceneFrame cut={cut} variant={variant} last={last} sceneFor={sceneFor} />
              </div>
            </Sequence>
          );
        })}
      </PunchIn>
      <SplitTrack />
      <AvatarTrack />
      <ContextCards />
      <Captions />
      <ProgressRail duration={DURATION} />
      <SoundTrack />
      <SafeGuides />
    </AbsoluteFill>
  );
};
