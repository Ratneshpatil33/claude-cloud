import React from 'react';
import {Audio, Sequence, getInputProps, getRemotionEnvironment, interpolate, staticFile} from 'remotion';
import {FPS} from '../design';
import {ResolvedSfxCue, SFX, SFX_RESOLVED, VOICE_FILE, sfxHash} from '../timeline';

/** Frames of fade-out before a cue's `until`, so trimmed sounds never click off. */
const FADE = 4;

/**
 * The cues to play: the resolved list from `render.mjs check` when it matches the timeline, otherwise the
 * timeline's legacy file cues as-is. Named cues (`sound`) only exist in resolved form, so a stale or missing
 * resolution fails a render loudly instead of silently dropping them.
 */
const cues = (): ResolvedSfxCue[] => {
  const named = SFX.some((c) => c.sound);
  const fresh = SFX_RESOLVED && SFX_RESOLVED.hash === sfxHash(SFX);
  if (fresh) return SFX_RESOLVED!.cues;
  if (named || SFX_RESOLVED) {
    const msg = `SFX cues changed since the last check: run \`node <skill>/scripts/render.mjs <project> check\` to re-resolve src/data/sfx.resolved.json.`;
    if (getRemotionEnvironment().isRendering) throw new Error(msg);
    console.warn(msg);
  }
  return SFX.filter((c) => c.file).map((c) => ({start: c.at, file: c.file!, volume: c.volume ?? 0.3, until: c.until}));
};

/**
 * Narration + SFX. No music bed.
 * QA stems: --props='{"sfxOnly":true}' mutes the narration, --props='{"voiceOnly":true}' mutes the SFX.
 */
export const SoundTrack: React.FC = () => {
  const {sfxOnly, voiceOnly} = getInputProps() as {sfxOnly?: boolean; voiceOnly?: boolean};
  return (
    <>
      {sfxOnly ? null : <Audio src={staticFile(VOICE_FILE)} />}
      {voiceOnly
        ? null
        : cues().map((cue, i) => {
            const from = Math.max(0, Math.round(cue.start * FPS));
            const len = cue.until ? Math.max(FADE + 1, Math.round(cue.until * FPS) - from) : undefined;
            const v = cue.volume;
            return (
              <Sequence key={`${cue.file}-${cue.start}-${i}`} from={from} durationInFrames={len} layout="none">
                <Audio
                  src={staticFile(cue.file)}
                  volume={len ? (f) => v * interpolate(f, [len - FADE, len], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : v}
                />
              </Sequence>
            );
          })}
    </>
  );
};
