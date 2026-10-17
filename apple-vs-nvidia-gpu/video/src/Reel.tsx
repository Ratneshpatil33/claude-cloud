import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {CLAMP} from './lib';
import {DURATION, fr, ts} from './timing';
import sfxPeaks from './data/sfx.json';
import {Background, Captions, Eyebrow, ProgressRail} from './ui';
import * as S from './shots';

type Cut = {id: string; at: number; C: React.FC<S.ShotProps>};

/** Cuts land two frames before the word they belong to, so the picture leads the voice. */
const cut = (scene: number, k: number) => fr(ts(scene, k)) - 2;

const CUTS: Cut[] = [
  {id: '1.1', at: 0, C: S.S11},
  {id: '1.2', at: cut(1, 4), C: S.S12},
  {id: '1.3', at: cut(1, 10), C: S.S13},
  {id: '1.4', at: cut(1, 14), C: S.S14},
  {id: '1.5', at: cut(1, 22), C: S.S15},
  {id: '2.1', at: cut(2, 0), C: S.S21},
  {id: '2.2', at: cut(2, 8), C: S.S22},
  {id: '2.3', at: cut(2, 17), C: S.S23},
  {id: '2.4', at: cut(2, 25), C: S.S24},
  {id: '3.1', at: cut(3, 0), C: S.S31},
  {id: '3.2', at: cut(3, 7), C: S.S32},
  {id: '4.1', at: cut(4, 0), C: S.S41},
  {id: '4.2', at: cut(4, 5), C: S.S42},
  {id: '4.3', at: cut(4, 12), C: S.S43},
  {id: '4.4', at: cut(4, 16), C: S.S44},
  {id: '5.1', at: cut(5, 0), C: S.S51},
  {id: '5.2', at: cut(5, 6), C: S.S52},
  {id: '5.3', at: cut(5, 13), C: S.S53},
  {id: '6.1', at: cut(6, 0), C: S.S61},
  {id: '6.2', at: cut(6, 9), C: S.S62},
  {id: '7.1', at: cut(7, 0), C: S.S71},
  {id: '7.2', at: cut(7, 4), C: S.S72},
  {id: '7.3', at: cut(7, 10), C: S.S73},
];

type Sfx = keyof typeof sfxPeaks;
type Cue = {at: number; sound: Sfx; gainDb?: number};

/** Sound design, anchored to words. `at` is the frame where the sound's loudest point lands. */
const w = (scene: number, k: number, df = 0) => fr(ts(scene, k)) + df;
const CUES: Cue[] = [
  {at: 0, sound: 'signature', gainDb: -4},
  {at: w(1, 4, -2), sound: 'whoosh', gainDb: -8},
  {at: w(1, 11, 14), sound: 'pop'},
  {at: w(1, 14, -2), sound: 'whoosh'},
  {at: w(1, 21, 4), sound: 'pop'},
  {at: w(1, 26), sound: 'riser', gainDb: -3},
  {at: w(1, 26, 2), sound: 'thump', gainDb: -6},
  {at: w(2, 0, 2), sound: 'whoosh'},
  ...[4, 7, 10, 13, 16, 19].map((d) => ({at: w(2, 8, d - 2), sound: 'tick' as Sfx, gainDb: -14})),
  {at: w(2, 14, 2), sound: 'pop'},
  ...[0, 4, 8, 12, 16, 20].map((d) => ({at: w(2, 20, d), sound: 'tick' as Sfx, gainDb: -14})),
  {at: w(2, 24), sound: 'pop', gainDb: -3},
  {at: w(2, 25, 2), sound: 'whoosh', gainDb: -8},
  {at: w(2, 30, 6), sound: 'thump', gainDb: -8},
  {at: w(3, 0, 8), sound: 'pop', gainDb: -6},
  {at: w(3, 7, 4), sound: 'whoosh', gainDb: -10},
  {at: w(3, 11), sound: 'pop'},
  {at: w(4, 4), sound: 'riser', gainDb: -3},
  {at: w(4, 5, 8), sound: 'whoosh', gainDb: -10},
  {at: w(4, 11), sound: 'pop'},
  ...[0, 6, 12, 18].map((d) => ({at: w(4, 16, d + 4), sound: 'pop' as Sfx, gainDb: -10})),
  {at: w(5, 5), sound: 'signature', gainDb: -4},
  {at: w(5, 5), sound: 'thump', gainDb: -6},
  {at: w(5, 11), sound: 'pop'},
  {at: w(5, 17, -2), sound: 'whoosh', gainDb: -10},
  {at: w(5, 23, 2), sound: 'riser', gainDb: -3},
  {at: w(6, 3), sound: 'whoosh', gainDb: -8},
  {at: w(6, 8), sound: 'error', gainDb: -4},
  {at: w(6, 8), sound: 'thump', gainDb: -8},
  {at: w(6, 12), sound: 'pop'},
  {at: w(7, 0, 4), sound: 'whoosh', gainDb: 0},
  {at: w(7, 3, 8), sound: 'whoosh', gainDb: -10},
  {at: w(7, 4), sound: 'whoosh', gainDb: -8},
  {at: w(7, 8, 6), sound: 'pop', gainDb: -6},
  {at: w(7, 10, 2), sound: 'whoosh', gainDb: -6},
  {at: w(7, 10, 46), sound: 'pop', gainDb: -4},
];

const SFX_BASE = 0.55;

const SoundTrack: React.FC = () => (
  <>
    <Audio src={staticFile('voice/voiceover.wav')} />
    {CUES.map((c, i) => {
      const from = c.at - fr(sfxPeaks[c.sound]);
      return (
        <Sequence key={i} from={Math.max(0, from)} layout="none">
          <Audio src={staticFile(`sfx/${c.sound}.wav`)} volume={SFX_BASE * 10 ** ((c.gainDb ?? 0) / 20)} trimBefore={from < 0 ? -from : undefined} />
        </Sequence>
      );
    })}
  </>
);

const CHAPTERS: {from: number; text: string}[] = [
  {from: fr(ts(2, 0)), text: 'CORES'},
  {from: fr(ts(3, 0)), text: 'DESIGN'},
  {from: fr(ts(5, 0)), text: 'MEMORY'},
  {from: fr(ts(7, 4)), text: 'VERDICT'},
];

const Chapter: React.FC = () => {
  const f = useCurrentFrame();
  const i = CHAPTERS.findLastIndex((c) => f >= c.from);
  if (i < 0) return null;
  const c = CHAPTERS[i];
  const next = CHAPTERS[i + 1]?.from ?? Infinity;
  // The last chapter fades before the end so the final frame matches frame 0 (no eyebrow) and the loop is seamless.
  const fadeOut = interpolate(f, Number.isFinite(next) ? [next - 6, next] : [DURATION - 14, DURATION - 4], [1, 0], CLAMP);
  const k = Math.min(interpolate(f, [c.from, c.from + 10], [0, 1], CLAMP), fadeOut);
  return <Eyebrow text={c.text} k={k} />;
};

export const Reel: React.FC = () => (
  <AbsoluteFill>
    <Background />
    {CUTS.map((c, i) => {
      const end = CUTS[i + 1]?.at ?? DURATION;
      const Shot = c.C;
      return (
        <Sequence key={c.id} from={c.at} durationInFrames={end - c.at} name={`Shot ${c.id}`}>
          <ShotFrame Shot={Shot} start={c.at} dur={end - c.at} />
        </Sequence>
      );
    })}
    <Chapter />
    <Captions />
    <ProgressRail duration={DURATION} />
    <SoundTrack />
  </AbsoluteFill>
);

const ShotFrame: React.FC<{Shot: React.FC<S.ShotProps>; start: number; dur: number}> = ({Shot, start, dur}) => {
  const f = useCurrentFrame();
  return <Shot f={f} dur={dur} at={(scene, k) => fr(ts(scene, k)) - start} />;
};
