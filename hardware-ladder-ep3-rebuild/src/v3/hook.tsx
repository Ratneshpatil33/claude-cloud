import React from 'react';
import {P} from '@video/kit';
import {RED} from './parts';
import {GRAPHITE, GREEN} from './xray';

/*
 * Episode 2's own hook (v3, 2026-10-01: "No Wi-Fi. No cloud. Can this tiny computer and this phone still run AI?
 * Yes. Except for one thing."): hairline glyphs drawn in frame px over the 3D studio, at projected anchors.
 */

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const layer: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, pointerEvents: 'none', zIndex: 8};

/**
 * A connection glyph (the Wi-Fi fan or a cloud) on a white plate, centred at (x, y). `cut` 0..1 draws a red strike
 * through it and turns it red; `k` 0..1 is presence (it scales in and drops away).
 */
export const Glyph: React.FC<{x: number; y: number; kind: 'wifi' | 'cloud'; label: string; k: number; cut: number; s?: number}> = ({x, y, kind, label, k, cut, s = 150}) => {
  if (k <= 0.001) return null;
  const col = cut > 0.5 ? RED : GREEN;
  const c = clamp01(cut);
  return (
    <div style={layer}>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          transform: `translate(-50%, -50%) scale(${0.85 + 0.15 * k}) translateY(${(1 - k) * 30}px)`,
          opacity: k,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: s,
            height: s,
            borderRadius: s * 0.28,
            background: 'rgba(255,255,255,.92)',
            boxShadow: `0 18px 40px -18px rgba(20,24,32,.45), 0 0 0 ${2 + 3 * c}px ${c > 0.05 ? 'rgba(255,59,48,.55)' : 'rgba(0,200,83,.35)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width={s * 0.66} height={s * 0.66} viewBox="0 0 100 100">
            {kind === 'wifi' ? (
              <g fill="none" stroke={col} strokeWidth={8} strokeLinecap="round">
                <path d="M 10 42 A 56 56 0 0 1 90 42" />
                <path d="M 24 57 A 37 37 0 0 1 76 57" />
                <path d="M 38 72 A 17 17 0 0 1 62 72" />
                <circle cx={50} cy={84} r={4} fill={col} stroke="none" />
              </g>
            ) : (
              <path
                d="M 28 76 H 74 A 17 17 0 0 0 72 42 A 24 24 0 0 0 26 46 A 15 15 0 0 0 28 76 Z"
                fill="none"
                stroke={col}
                strokeWidth={8}
                strokeLinejoin="round"
              />
            )}
            {/* the strike, drawn on */}
            <line x1={14} y1={14} x2={14 + 72 * c} y2={14 + 72 * c} stroke={RED} strokeWidth={10} strokeLinecap="round" opacity={c > 0.001 ? 1 : 0} />
          </svg>
        </div>
        <div style={{fontFamily: P.text, fontSize: 22, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: c > 0.5 ? RED : 'rgba(35,39,46,.6)'}}>
          {label}
        </div>
      </div>
    </div>
  );
};

/** A round badge over a device: a green tick (`kind` 'yes') or a red question mark ('no'), popping in with k. */
export const Badge: React.FC<{x: number; y: number; kind: 'yes' | 'no'; k: number; s?: number}> = ({x, y, kind, k, s = 96}) => {
  if (k <= 0.001) return null;
  const pop = k < 1 ? 1 + 0.18 * Math.sin(Math.PI * k) : 1;
  const col = kind === 'yes' ? GREEN : RED;
  return (
    <div style={layer}>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: s,
          height: s,
          borderRadius: '50%',
          background: col,
          transform: `translate(-50%, -50%) scale(${clamp01(k * 1.4) * pop})`,
          boxShadow: `0 14px 34px -12px ${kind === 'yes' ? 'rgba(0,200,83,.7)' : 'rgba(255,59,48,.7)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width={s * 0.56} height={s * 0.56} viewBox="0 0 100 100">
          {kind === 'yes' ? (
            <path d="M 18 54 L 40 75 L 82 28" fill="none" stroke="#fff" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <g fill="none" stroke="#fff" strokeWidth={13} strokeLinecap="round">
              <path d="M 32 34 A 18 18 0 1 1 56 52 Q 50 56 50 64" />
              <circle cx={50} cy={86} r={3} fill="#fff" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

/** The hook's one-line question card, centred near the top (in the empty studio above the devices). */
export const Headline: React.FC<{text: string; k: number; color?: string; y?: number}> = ({text, k, color = GRAPHITE, y = 520}) => {
  if (k <= 0.001) return null;
  return (
    <div style={layer}>
      <div
        style={{
          position: 'absolute',
          left: 540,
          top: y,
          transform: `translate(-50%, -50%) translateY(${(1 - k) * 14}px)`,
          opacity: k,
          fontFamily: P.display,
          fontSize: 76,
          fontWeight: 700,
          letterSpacing: '-0.035em',
          whiteSpace: 'nowrap',
          color,
        }}
      >
        {text}
      </div>
    </div>
  );
};
