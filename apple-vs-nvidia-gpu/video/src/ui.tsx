import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, CLAMP, FPS, H, W, ramp, rampIO} from './lib';
import {MONO, SANS} from './fonts';
import {WORDS, fr} from './timing';
import {interpolate} from 'remotion';

/** Off-white field with a soft white centre and a breath of animated grain. */
export const Background: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 55% at 50% 42%, #FFFFFF 0%, rgba(255,255,255,0) 70%)'}} />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: 0.05, mixBlendMode: 'multiply'}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={Math.floor(f / 2) % 50} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W} height={H} filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

const digitCol = (value: number, p: number) => {
  const unit = 10 ** p;
  const q = Math.floor(value / unit);
  const rem = value - q * unit;
  const carry = p === 0 ? rem - Math.floor(rem) : Math.max(0, rem - (unit - 1));
  return (q % 10) + carry;
};

/** Odometer: every digit column rolls like a real counter; leading columns appear as the value reaches them. */
export const Odometer: React.FC<{
  value: number;
  digits: number;
  size: number;
  color?: string;
  weight?: number;
  suffix?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({value, digits, size, color = C.ink, weight = 700, suffix, style}) => {
  const lh = size * 1.0;
  const cols: React.ReactNode[] = [];
  for (let p = digits - 1; p >= 0; p--) {
    const vis = p === 0 ? 1 : interpolate(value, [10 ** p * 0.92, 10 ** p], [0, 1], CLAMP);
    const pos = digitCol(value, p);
    const width = vis * size * 0.62;
    cols.push(
      <div key={`d${p}`} style={{width, height: lh, overflow: 'hidden', opacity: vis, position: 'relative'}}>
        <div style={{transform: `translateY(${-pos * lh}px)`}}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, i) => (
            <div key={i} style={{height: lh, lineHeight: `${lh}px`, textAlign: 'center'}}>
              {d}
            </div>
          ))}
        </div>
      </div>,
    );
    if (p > 0 && p % 3 === 0) {
      const cv = interpolate(value, [10 ** p * 0.92, 10 ** p], [0, 1], CLAMP);
      cols.push(
        <div key={`c${p}`} style={{width: cv * size * 0.28, height: lh, lineHeight: `${lh}px`, opacity: cv, textAlign: 'center'}}>
          ,
        </div>,
      );
    }
  }
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        fontFamily: SANS,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: '-0.03em',
        color,
        fontVariantNumeric: 'tabular-nums',
        ...style,
      }}
    >
      {cols}
      {suffix}
    </div>
  );
};

/**
 * Apple spec-page callout: a dot on the subject, a hairline that runs diagonally by (dx, dy) then horizontally by
 * `run`, and a small precise label at its end. `k` 0..1 draws it on (line first, then text).
 */
export const Callout: React.FC<{
  x: number;
  y: number;
  dx: number;
  dy: number;
  run: number;
  label: string;
  sub?: string;
  k: number;
  color?: string;
  dark?: boolean;
}> = ({x, y, dx, dy, run, label, sub, k, color, dark = false}) => {
  if (k <= 0.001) return null;
  const ink = dark ? '#F5F5F7' : C.ink;
  const ink2 = dark ? 'rgba(245,245,247,.6)' : C.ink2;
  const len = Math.hypot(dx, dy) + Math.abs(run);
  const lineK = interpolate(k, [0, 0.7], [0, 1], CLAMP);
  const textK = interpolate(k, [0.55, 1], [0, 1], CLAMP);
  const ex = x + dx + run;
  const ey = y + dy;
  const right = run >= 0;
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <circle cx={x} cy={y} r={12 * Math.min(1, k * 3)} fill={color ?? ink} opacity={0.16} />
        <circle cx={x} cy={y} r={5.5 * Math.min(1, k * 3)} fill={color ?? ink} />
        <path
          d={`M ${x} ${y} L ${x + dx} ${y + dy} L ${ex} ${ey}`}
          fill="none"
          stroke={ink}
          strokeOpacity={0.55}
          strokeWidth={2}
          strokeDasharray={len}
          strokeDashoffset={len * (1 - lineK)}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: ey - 26,
          left: right ? ex + 16 : undefined,
          right: right ? undefined : W - ex + 16,
          textAlign: right ? 'left' : 'right',
          opacity: textK,
          transform: `translateY(${(1 - textK) * 10}px)`,
          fontFamily: SANS,
        }}
      >
        <div style={{fontSize: 40, fontWeight: 600, letterSpacing: '-0.02em', color: ink, whiteSpace: 'nowrap'}}>{label}</div>
        {sub ? <div style={{fontFamily: MONO, fontSize: 24, color: ink2, marginTop: 4, whiteSpace: 'nowrap'}}>{sub}</div> : null}
      </div>
    </div>
  );
};

/** Semicircular gauge; `value` 0..1 fills the arc. Children sit in the bowl. */
export const Gauge: React.FC<{value: number; r?: number; color: string; children?: React.ReactNode; style?: React.CSSProperties}> = ({
  value,
  r = 230,
  color,
  children,
  style,
}) => {
  const len = Math.PI * r;
  const sw = 22;
  const w = r * 2 + sw;
  const h = r + sw;
  const a = Math.PI * (1 - value);
  return (
    <div style={{position: 'relative', width: w, height: h + 10, ...style}}>
      <svg width={w} height={h + 10} style={{overflow: 'visible'}}>
        <path d={`M ${sw / 2} ${h} A ${r} ${r} 0 0 1 ${w - sw / 2} ${h}`} fill="none" stroke="#E3E3E8" strokeWidth={sw} strokeLinecap="round" />
        <path
          d={`M ${sw / 2} ${h} A ${r} ${r} 0 0 1 ${w - sw / 2} ${h}`}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={len * (1 - value)}
        />
        <line
          x1={w / 2}
          y1={h}
          x2={w / 2 + Math.cos(a) * (r - 46)}
          y2={h - Math.sin(a) * (r - 46)}
          stroke={C.ink}
          strokeWidth={6}
          strokeLinecap="round"
        />
        <circle cx={w / 2} cy={h} r={14} fill={C.ink} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: h * 0.3, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>{children}</div>
    </div>
  );
};

/** Frosted-glass container that fills from the bottom; `over` px of fill spill above the rim (it doesn't fit). */
export const Glass: React.FC<{
  w: number;
  h: number;
  fill?: number;
  fillColor?: string;
  over?: number;
  label?: React.ReactNode;
  tint?: string;
  shake?: number;
  style?: React.CSSProperties;
}> = ({w, h, fill = 0, fillColor = C.model, over = 0, label, tint, shake = 0, style}) => (
  <div style={{position: 'relative', width: w, height: h, transform: `translateX(${shake}px)`, ...style}}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: Math.min(28, h / 2),
        background: tint ?? 'rgba(255,255,255,.62)',
        border: '2px solid rgba(255,255,255,.95)',
        boxShadow: '0 30px 60px -22px rgba(0,0,0,.2), inset 0 0 0 1.5px rgba(0,0,0,.07)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: h * fill,
          background: `linear-gradient(180deg, ${fillColor}, ${fillColor}CC)`,
        }}
      />
    </div>
    {over > 0 ? (
      <div
        style={{
          position: 'absolute',
          left: 10,
          right: 10,
          bottom: h - 6,
          height: over,
          borderRadius: '18px 18px 6px 6px',
          background: `linear-gradient(180deg, ${C.red}, ${C.red}DD)`,
          boxShadow: '0 18px 40px -16px rgba(255,59,48,.6)',
        }}
      />
    ) : null}
    {label ? <div style={{position: 'absolute', top: h + 22, left: -100, right: -100, textAlign: 'center'}}>{label}</div> : null}
  </div>
);

export const Eyebrow: React.FC<{text: string; k: number}> = ({text, k}) => (
  <div
    style={{
      position: 'absolute',
      left: 80,
      top: 292,
      fontFamily: SANS,
      fontWeight: 600,
      fontSize: 28,
      letterSpacing: '0.22em',
      color: C.ink2,
      opacity: k,
      transform: `translateY(${(1 - k) * 8}px)`,
    }}
  >
    {text}
  </div>
);

/** Thin rail across the top: continuity thread and retention cue. */
export const ProgressRail: React.FC<{duration: number}> = ({duration}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 8, background: 'rgba(0,0,0,.06)'}}>
      <div style={{width: `${(100 * f) / (duration - 1)}%`, height: '100%', background: C.ink, opacity: 0.85}} />
    </div>
  );
};

type Page = {words: {word: string; start: number; end: number}[]; start: number; end: number};
const PAGES: Page[] = (() => {
  const pages: Page[] = [];
  let cur: Page['words'] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const next = WORDS[i + 1];
    const punct = /[,.?]$/.test(w.word);
    const gap = next ? next.start - w.end > 0.25 : true;
    const chars = cur.reduce((n, x) => n + x.word.length + 1, 0) + (next ? next.word.length : 0);
    if (cur.length >= 4 || chars > 22 || punct || gap || !next) {
      pages.push({words: cur, start: cur[0].start, end: next ? Math.min(next.start, w.end + 0.6) : w.end + 0.4});
      cur = [];
    }
  });
  return pages;
})();

/** Burned-in captions, 1-4 words a page; the spoken word lights up. Sits in the caption strip above the bottom UI. */
export const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const page = PAGES.find((p) => t >= p.start - 0.05 && t < p.end);
  if (!page) return null;
  const k = ramp(f, fr(page.start - 0.05), 5);
  return (
    <div style={{position: 'absolute', left: 80, right: 180, top: 1330, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          padding: '18px 30px',
          borderRadius: 26,
          background: 'rgba(29,29,31,.86)',
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 54,
          letterSpacing: '-0.02em',
          color: '#F5F5F7',
          display: 'flex',
          gap: 16,
          transform: `scale(${0.94 + 0.06 * k})`,
          opacity: k,
          boxShadow: SHADOW_CAP,
        }}
      >
        {page.words.map((w, i) => {
          const on = t >= w.start - 0.03;
          return (
            <span key={i} style={{color: on ? '#64D2FF' : '#F5F5F7', opacity: on ? 1 : 0.92}}>
              {w.word.replace(/[,.]$/, '')}
            </span>
          );
        })}
      </div>
    </div>
  );
};
const SHADOW_CAP = '0 18px 40px -18px rgba(0,0,0,.45)';

/** Paper plane (Lucide "send" geometry). */
export const PlaneIcon: React.FC<{size: number; color?: string}> = ({size, color = C.ink}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
    <path d="m21.854 2.147-10.94 10.939" />
  </svg>
);

/** Check / cross marks drawn on with `k`. */
export const Mark: React.FC<{kind: 'check' | 'cross'; size: number; k: number; color: string}> = ({kind, size, k, color}) => {
  const d = kind === 'check' ? 'M 14 34 L 28 48 L 54 18' : 'M 18 18 L 50 50 M 50 18 L 18 50';
  const len = kind === 'check' ? 60 : 92;
  return (
    <svg width={size} height={size} viewBox="0 0 68 68">
      <circle cx="34" cy="34" r={32 * Math.min(1, k * 2.5)} fill={color} />
      <path d={d} fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - k)} />
    </svg>
  );
};
