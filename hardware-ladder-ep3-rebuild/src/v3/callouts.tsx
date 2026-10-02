import React from 'react';
import {P} from '@video/kit';
import {GRAPHITE, GREEN} from './xray';

/*
 * Apple spec-page type for look v3: hairline leader lines from a point on the product to a small, precise label.
 * No pills, no slammed type. Everything is drawn in frame px over the 3D canvas.
 */

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * A callout: dot at the anchor (x, y), a hairline that runs diagonally by (dx, dy) and then horizontally by `run`,
 * and a label block at its end. `k` 0..1 draws it on (line first, then text).
 */
export const Callout: React.FC<{
  x: number;
  y: number;
  dx: number;
  dy: number;
  run?: number;
  label: string;
  value?: string;
  note?: string;
  k: number;
  accent?: string;
  valueSize?: number;
  /** white plate behind the text, for labels that sit over dark objects */
  plate?: boolean;
  /** vertical leader (dx ignored, no run) with the label centred above its end (or below, when dy > 0) */
  center?: boolean;
  /** the note line's own reveal 0..1 (a note can appear later than the callout) */
  noteK?: number;
}> = ({x, y, dx: dxIn, dy, run: runIn = 60, label, value, note, k, accent, valueSize = 40, plate, center, noteK = 1}) => {
  if (k <= 0.001) return null;
  const dx = center ? 0 : dxIn;
  const run = center ? 0 : runIn;
  const right = dx >= 0;
  const ex = x + dx;
  const ey = y + dy;
  const tx = ex + (right ? run : -run);
  const len = Math.hypot(dx, dy) + run;
  const drawn = clamp01(k * 1.6) * len;
  const text = clamp01((k - 0.35) / 0.65);
  const col = accent ?? GRAPHITE;
  const pos: React.CSSProperties = center
    ? {left: ex, top: ey + (dy > 0 ? 10 : -10), transform: `translate(-50%, ${dy > 0 ? '0%' : '-100%'}) translateY(${(1 - text) * 8}px)`, textAlign: 'center'}
    : {
        left: right ? tx + 12 : undefined,
        right: right ? undefined : 1080 - tx + 12,
        top: ey,
        transform: `translateY(-50%) translateX(${(1 - text) * (right ? -8 : 8)}px)`,
        textAlign: right ? 'left' : 'right',
      };
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, pointerEvents: 'none', zIndex: 8}}>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <circle cx={x} cy={y} r={5.5} fill="#fff" stroke={col} strokeWidth={2} opacity={clamp01(k * 3)} />
        <circle cx={x} cy={y} r={2} fill={col} opacity={clamp01(k * 3)} />
        <path d={`M ${x} ${y} L ${ex} ${ey} L ${tx} ${ey}`} fill="none" stroke={col} strokeWidth={1.6} strokeDasharray={`${drawn} ${len}`} strokeLinecap="round" />
      </svg>
      <div
        style={{
          position: 'absolute',
          ...pos,
          opacity: text,
          whiteSpace: 'nowrap',
          fontFamily: P.text,
          color: GRAPHITE,
          ...(plate ? {background: 'rgba(255,255,255,.9)', padding: '10px 16px', borderRadius: 12, boxShadow: '0 10px 30px -12px rgba(20,24,32,.35)'} : {}),
        }}
      >
        <div style={{fontSize: 21, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'rgba(35,39,46,.55)'}}>{label}</div>
        {value && <div style={{marginTop: 2, fontFamily: P.display, fontSize: valueSize, fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.08, color: accent ?? GRAPHITE}}>{value}</div>}
        {note && noteK > 0.001 && (
          <div style={{marginTop: 4, fontSize: 22, fontWeight: 500, color: 'rgba(35,39,46,.6)', opacity: clamp01(noteK), transform: `translateY(${(1 - clamp01(noteK)) * 6}px)`}}>
            {note}
          </div>
        )}
      </div>
    </div>
  );
};

/** Corner level counter: "LEVEL 2 / 5" over the memory size; `lock` shows the last level as locked. */
export const LevelCounter: React.FC<{level: number; mem: string; k?: number}> = ({level, mem, k = 1}) => (
  <div style={{position: 'absolute', left: 80, top: 250, opacity: k, fontFamily: P.text, color: GRAPHITE, zIndex: 9}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 20, fontWeight: 600, letterSpacing: '0.12em', color: 'rgba(35,39,46,.55)'}}>
      <span>LEVEL</span>
      <span style={{color: GRAPHITE}}>{level}</span>
      <span>/ 5</span>
    </div>
    <div style={{display: 'flex', gap: 5, marginTop: 8}}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{width: 26, height: 3, borderRadius: 2, background: i <= level ? GREEN : 'rgba(35,39,46,.15)'}} />
      ))}
    </div>
    <div style={{marginTop: 8, fontFamily: P.display, fontSize: 34, fontWeight: 600, letterSpacing: '-0.02em'}}>{mem}</div>
  </div>
);

/** A small padlock (px), graphite hairline. */
const Lock: React.FC<{s?: number; color?: string}> = ({s = 18, color = GRAPHITE}) => (
  <svg width={s} height={s} viewBox="0 0 18 18" style={{display: 'block'}}>
    <rect x={3} y={8} width={12} height={9} rx={2} fill="none" stroke={color} strokeWidth={1.6} />
    <path d="M 5.8 8 V 5.6 a 3.2 3.2 0 0 1 6.4 0 V 8" fill="none" stroke={color} strokeWidth={1.6} />
  </svg>
);

/**
 * Episode 1's ladder tag: a hairline from the device (x, y) to its label at (tx, ty) in frame px. `state`: 'open'
 * (this video's level, green ring), 'done' (green tick), 'locked' (padlock, dimmed: a later video), 'plain'.
 * `lock` 0..1 fades the padlock and the dimming in (the tags appear plain, then lock on "per video").
 */
export const LevelTag: React.FC<{
  x: number;
  y: number;
  tx: number;
  ty: number;
  level: number;
  name: string;
  mem: string;
  note?: string;
  state: 'open' | 'done' | 'locked' | 'plain';
  lock?: number;
  k: number;
  big?: boolean;
}> = ({x, y, tx, ty, level, name, mem, note, state, lock = 1, k, big}) => {
  if (k <= 0.001) return null;
  const right = tx >= x;
  const len = Math.hypot(tx - x, ty - y);
  const drawn = clamp01(k * 1.6) * len;
  const text = clamp01((k - 0.35) / 0.65);
  const locked = state === 'locked' ? clamp01(lock) : 0;
  const green = state === 'open' || state === 'done';
  const col = green ? GREEN : GRAPHITE;
  const B = big ? 52 : 40;
  const badge = (
    <div
      style={{
        width: B,
        height: B,
        borderRadius: B,
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: state === 'done' ? GREEN : '#fff',
        border: `2px solid ${green ? GREEN : 'rgba(35,39,46,.35)'}`,
        boxShadow: '0 8px 22px -12px rgba(20,24,32,.45)',
        fontFamily: P.display,
        fontWeight: 700,
        fontSize: B * 0.5,
        color: green ? GREEN : GRAPHITE,
        position: 'relative',
      }}
    >
      {state === 'done' ? (
        <svg width={B * 0.5} height={B * 0.5} viewBox="0 0 20 20">
          <path d="M 4 10.5 L 8.2 14.5 L 16 5.8" fill="none" stroke="#fff" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : locked > 0.5 ? (
        <Lock s={B * 0.46} />
      ) : (
        level
      )}
    </div>
  );
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, pointerEvents: 'none', zIndex: 8}}>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <circle cx={x} cy={y} r={5.5} fill="#fff" stroke={col} strokeWidth={2} opacity={clamp01(k * 3) * (1 - 0.45 * locked)} />
        <circle cx={x} cy={y} r={2} fill={col} opacity={clamp01(k * 3)} />
        <path d={`M ${x} ${y} L ${tx} ${ty}`} fill="none" stroke={col} strokeWidth={1.6} strokeDasharray={`${drawn} ${len}`} strokeLinecap="round" opacity={1 - 0.45 * locked} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: right ? tx + 10 : undefined,
          right: right ? undefined : 1080 - tx + 10,
          top: ty,
          transform: `translateY(-50%) translateX(${(1 - text) * (right ? -8 : 8)}px)`,
          opacity: text * (1 - 0.4 * locked),
          display: 'flex',
          flexDirection: right ? 'row' : 'row-reverse',
          alignItems: 'center',
          gap: 12,
          whiteSpace: 'nowrap',
          fontFamily: P.text,
          color: GRAPHITE,
          textAlign: right ? 'left' : 'right',
          background: 'rgba(255,255,255,.82)',
          padding: '8px 14px 8px 8px',
          borderRadius: 40,
        }}
      >
        {badge}
        <div>
          <div style={{fontSize: big ? 22 : 17, fontWeight: 600, letterSpacing: '0.1em', color: green ? GREEN : 'rgba(35,39,46,.55)'}}>LEVEL {level}</div>
          <div style={{fontFamily: P.display, fontSize: big ? 38 : 27, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1}}>{name}</div>
          <div style={{fontSize: big ? 24 : 19, fontWeight: 600, color: green ? GREEN : 'rgba(35,39,46,.5)'}}>
            {mem}
            {note && <span style={{color: 'rgba(35,39,46,.45)', fontWeight: 500}}> · {note}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
