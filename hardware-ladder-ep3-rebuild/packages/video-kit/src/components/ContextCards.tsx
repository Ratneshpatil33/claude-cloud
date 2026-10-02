import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {CLAMP, FPS, P, SAFE, SHADOW} from '../design';
import {pop} from '../motion';
import {CARDS, CUTS, cutIndexAt} from '../timeline';

const TOP = 780;
const STEP = 118;

/**
 * Cards that pop in beside the avatar's head as things are mentioned (full-AVATAR shots only).
 * Left column, shoulder height: clear of the face, the right action rail and the caption zone.
 */
export const ContextCards: React.FC = () => {
  const f = useCurrentFrame();
  if (CUTS[cutIndexAt(f)].treat !== 'AVATAR') return null;
  const live = CARDS.filter((c) => f >= c.at * FPS && f < c.until * FPS + 8);
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 12, pointerEvents: 'none'}}>
      {live.map((c, i) => {
        const at = Math.round(c.at * FPS);
        const p = pop(f, at, 16);
        const out = interpolate(f, [c.until * FPS, c.until * FPS + 8], [1, 0], CLAMP);
        return (
          <div
            key={`${c.label}-${c.at}`}
            style={{
              position: 'absolute',
              left: SAFE.left - 20,
              top: TOP + i * STEP,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 16,
              padding: '18px 26px',
              borderRadius: Math.min(P.radius, 26),
              background: P.dark ? 'rgba(30,24,20,.82)' : 'rgba(255,255,255,.92)',
              border: `1.5px solid ${P.dark ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.95)'}`,
              boxShadow: SHADOW.card,
              fontFamily: P.text,
              fontSize: 36,
              fontWeight: 700,
              color: P.ink,
              opacity: p * out,
              transform: `translateX(${(1 - p) * -60}px) scale(${0.9 + p * 0.1})`,
            }}
          >
            {c.icon ? (
              <span
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  display: 'grid',
                  placeItems: 'center',
                  background: P.gradient,
                  color: '#fff',
                  fontSize: 28,
                }}
              >
                {c.icon}
              </span>
            ) : null}
            {c.label}
          </div>
        );
      })}
    </div>
  );
};
