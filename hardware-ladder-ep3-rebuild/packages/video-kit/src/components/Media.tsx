import React from 'react';
import {Img, OffthreadVideo, staticFile} from 'remotion';
import {FPS} from '../design';
import {lin} from '../motion';

/**
 * A supplied photo or video that fills its box, with an optional slow push (Ken Burns).
 * Videos are muted: the narration owns the audio. Frame 1 is already the full image.
 */
export const MediaShot: React.FC<{
  src: string;
  f: number;
  dur: number;
  kind?: 'image' | 'video';
  push?: [number, number];
  pan?: [number, number];
  focus?: string;
  trimBefore?: number;
  style?: React.CSSProperties;
}> = ({src, f, dur, kind, push = [1.04, 1.12], pan = [0, 0], focus = '50% 50%', trimBefore = 0, style}) => {
  const isVideo = kind ? kind === 'video' : /\.(mp4|mov|webm|m4v)$/i.test(src);
  const scale = lin(f, 0, dur, push[0], push[1]);
  const x = lin(f, 0, dur, pan[0], pan[1]);
  const media: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: focus,
    transform: `translateX(${x}px) scale(${scale})`,
    transformOrigin: focus,
  };
  return (
    <div style={{position: 'absolute', overflow: 'hidden', inset: 0, ...style}}>
      {isVideo ? (
        <OffthreadVideo src={staticFile(src)} muted trimBefore={Math.round(trimBefore * FPS)} style={media} />
      ) : (
        <Img src={staticFile(src)} style={media} />
      )}
    </div>
  );
};
