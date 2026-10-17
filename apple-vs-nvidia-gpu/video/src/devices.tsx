import React from 'react';
import {C} from './lib';
import {MONO, SANS} from './fonts';

/*
 * Code-drawn stand-ins for the two products and their silicon. They are sized by width and keep the real
 * proportions (Mac Studio 197 x 95 mm front; RTX 50 Founders Edition 304 x 137 mm). Swap them for the official
 * cut-outs (assets A1/A2, N1-N3 in shot-map.md) by replacing these components with <Img>.
 */

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Mac Studio, front elevation from slightly above. `xray` frosts the shell; `sweep` runs a light band across. */
export const MacStudio: React.FC<{w: number; uid: string; xray?: number; sweep?: number; led?: number; style?: React.CSSProperties}> = ({
  w,
  uid,
  xray = 0,
  sweep = -1,
  led = 1,
  style,
}) => {
  const solid = 1 - 0.88 * clamp01(xray);
  const sx = -160 + 720 * sweep;
  return (
    <svg width={w} height={(w * 250) / 400} viewBox="0 0 400 250" style={{overflow: 'visible', ...style}}>
      <defs>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7F8F9" />
          <stop offset="0.15" stopColor="#ECEDEF" />
          <stop offset="0.165" stopColor="#FFFFFF" />
          <stop offset="0.18" stopColor="#DADCE0" />
          <stop offset="0.6" stopColor="#CDD0D4" />
          <stop offset="1" stopColor="#B4B7BC" />
        </linearGradient>
        <linearGradient id={`${uid}-edge`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.16" />
          <stop offset="0.08" stopColor="#000" stopOpacity="0" />
          <stop offset="0.92" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id={`${uid}-sweep`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <rect x="0" y="40" width="400" height="176" rx="30" />
        </clipPath>
        <filter id={`${uid}-blur`} x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      <ellipse cx="200" cy="236" rx="176" ry="9" fill="#000" opacity={0.24 * solid + 0.04} filter={`url(#${uid}-blur)`} />
      <rect x="34" y="206" width="332" height="22" rx="11" fill="#8C8F95" opacity={solid} />
      <g opacity={solid}>
        <rect x="0" y="40" width="400" height="176" rx="30" fill={`url(#${uid}-body)`} />
        <rect x="0" y="40" width="400" height="176" rx="30" fill={`url(#${uid}-edge)`} />
        <rect x="286" y="148" width="15" height="7" rx="3.5" fill="#35373B" />
        <rect x="309" y="148" width="15" height="7" rx="3.5" fill="#35373B" />
        <rect x="334" y="150.5" width="40" height="3.2" rx="1.6" fill="#45474C" />
        <circle cx="36" cy="194" r="2.6" fill="#fff" opacity={0.95 * led} />
        <circle cx="36" cy="194" r="7" fill="#fff" opacity={0.25 * led} filter={`url(#${uid}-blur)`} />
      </g>
      {sweep >= 0 && sweep <= 1 ? (
        <g clipPath={`url(#${uid}-clip)`}>
          <rect x={sx} y="20" width="140" height="230" fill={`url(#${uid}-sweep)`} transform={`skewX(-18)`} />
        </g>
      ) : null}
      {xray > 0 ? (
        <rect x="0.75" y="40.75" width="398.5" height="174.5" rx="29.5" fill="rgba(255,255,255,.35)" stroke={C.ink} strokeOpacity={0.35 * xray} strokeWidth="1.5" />
      ) : null}
    </svg>
  );
};

/** One fan: nine swept blades; `blur` 0..1 cross-fades the blades into a spinning disc at speed. */
const Fan: React.FC<{cx: number; cy: number; r: number; angle: number; blur: number; uid: string}> = ({cx, cy, r, angle, blur, uid}) => {
  const blade = `M 0 ${-r * 0.24} C ${r * 0.34} ${-r * 0.36} ${r * 0.66} ${-r * 0.62} ${r * 0.62} ${-r * 0.93} C ${r * 0.38} ${-r * 0.86} ${r * 0.12} ${-r * 0.62} ${-r * 0.1} ${-r * 0.25} Z`;
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={r * 1.04} fill="#0B0C0E" />
      <g transform={`rotate(${angle})`} opacity={1 - 0.75 * blur}>
        {Array.from({length: 9}, (_, i) => (
          <path key={i} d={blade} fill={`url(#${uid}-blade)`} transform={`rotate(${i * 40})`} />
        ))}
      </g>
      <circle r={r * 0.95} fill={`url(#${uid}-disc)`} opacity={blur * 0.9} />
      <circle r={r * 0.26} fill="#1A1B1E" stroke="#44474D" strokeWidth="2" />
      <circle r={r * 1.0} fill="none" stroke="#50545B" strokeWidth="2.5" />
    </g>
  );
};

/** RTX 50 Founders Edition, fan side. `xray` ghosts the shroud to show the die and its memory packages. */
export const GpuCard: React.FC<{
  w: number;
  uid: string;
  angle?: number;
  blur?: number;
  label?: string;
  xray?: number;
  mem?: number;
  memGlow?: number;
  dieGlow?: number;
  sweep?: number;
  style?: React.CSSProperties;
}> = ({w, uid, angle = 0, blur = 0, label = 'GEFORCE RTX 5080', xray = 0, mem = 8, memGlow = 0, dieGlow = 0, sweep = -1, style}) => {
  const solid = 1 - 0.9 * clamp01(xray);
  // Memory packages ring the die: half above, half below (the 5090's 16 also wrap the sides).
  const pk: {x: number; y: number}[] = [];
  const perRow = Math.min(mem / 2, 6);
  for (let i = 0; i < perRow; i++) {
    const x = 304 - ((perRow - 1) * 30) / 2 + i * 30;
    pk.push({x, y: 62}, {x, y: 212});
  }
  for (let i = 0; i < (mem - perRow * 2) / 2; i++) pk.push({x: 214, y: 112 + i * 50}, {x: 394, y: 112 + i * 50});
  const sx = -200 + 1000 * sweep;
  return (
    <svg width={w} height={(w * 300) / 608} viewBox="0 0 608 300" style={{overflow: 'visible', ...style}}>
      <defs>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3C3F45" />
          <stop offset="0.5" stopColor="#26282D" />
          <stop offset="1" stopColor="#15161A" />
        </linearGradient>
        <linearGradient id={`${uid}-rim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E3E6EA" />
          <stop offset="0.5" stopColor="#A7ACB4" />
          <stop offset="1" stopColor="#D2D5DA" />
        </linearGradient>
        <linearGradient id={`${uid}-blade`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#474B52" />
          <stop offset="1" stopColor="#202226" />
        </linearGradient>
        <radialGradient id={`${uid}-disc`}>
          <stop offset="0.25" stopColor="#2A2C31" stopOpacity="0.2" />
          <stop offset="0.7" stopColor="#3A3D43" stopOpacity="0.9" />
          <stop offset="1" stopColor="#2A2C31" stopOpacity="0.6" />
        </radialGradient>
        <linearGradient id={`${uid}-sweep`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <rect x="0" y="0" width="608" height="274" rx="26" />
        </clipPath>
        <filter id={`${uid}-blur`} x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <ellipse cx="304" cy="290" rx="270" ry="10" fill="#000" opacity={0.26 * solid + 0.05} filter={`url(#${uid}-blur)`} />
      <g opacity={solid}>
        <rect x="0" y="0" width="608" height="274" rx="26" fill={`url(#${uid}-rim)`} />
        <rect x="5" y="5" width="598" height="264" rx="22" fill={`url(#${uid}-body)`} />
        {Array.from({length: 9}, (_, i) => (
          <rect key={i} x={268 + i * 9} y="44" width="3" height="186" rx="1.5" fill="#3B3E44" />
        ))}
        <Fan cx={150} cy={137} r={100} angle={angle} blur={blur} uid={uid} />
        <Fan cx={458} cy={137} r={100} angle={-angle * 1.04} blur={blur} uid={uid} />
        <text x="304" y="258" textAnchor="middle" fontFamily={MONO} fontSize="11" letterSpacing="3" fill="#9AA0A8">
          {label}
        </text>
      </g>
      {sweep >= 0 && sweep <= 1 ? (
        <g clipPath={`url(#${uid}-clip)`}>
          <rect x={sx} y="-20" width="160" height="320" fill={`url(#${uid}-sweep)`} transform="skewX(-18)" />
        </g>
      ) : null}
      {xray > 0 ? (
        <g opacity={clamp01(xray)}>
          <rect x="1" y="1" width="606" height="272" rx="25" fill="rgba(255,255,255,.4)" stroke={C.ink} strokeOpacity="0.35" strokeWidth="1.5" />
          <rect x="244" y="94" width="120" height="86" rx="8" fill="#1B1D21" />
          <rect x="244" y="94" width="120" height="86" rx="8" fill={C.nvidia} opacity={dieGlow} />
          {pk.map((p, i) => (
            <g key={i}>
              <rect x={p.x - 11} y={p.y - 11} width="22" height="22" rx="3" fill="#2A2D33" />
              <rect x={p.x - 11} y={p.y - 11} width="22" height="22" rx="3" fill={C.nvidia} opacity={memGlow} />
              <rect x={p.x - 14} y={p.y - 14} width="28" height="28" rx="5" fill={C.nvidia} opacity={memGlow * 0.5} filter={`url(#${uid}-glow)`} />
            </g>
          ))}
        </g>
      ) : null}
    </svg>
  );
};

/** M5 Ultra package. `tiles` lights the 80-core GPU grid (illustrative); `plan` draws the floor-plan regions. */
export const AppleChip: React.FC<{
  w: number;
  uid: string;
  tiles?: number;
  pick?: number;
  plan?: number;
  label?: number;
  sweep?: number;
  style?: React.CSSProperties;
}> = ({w, uid, tiles = 0, pick = 0, plan = 0, label = 1, sweep = -1, style}) => {
  const cols = 10;
  const rows = 8;
  const sx = -200 + 1000 * sweep;
  return (
    <svg width={w} height={w} viewBox="0 0 600 600" style={{overflow: 'visible', ...style}}>
      <defs>
        <linearGradient id={`${uid}-pkg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#34353A" />
          <stop offset="1" stopColor="#0E0F11" />
        </linearGradient>
        <linearGradient id={`${uid}-lid`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2B2C31" />
          <stop offset="0.55" stopColor="#151619" />
          <stop offset="1" stopColor="#0B0C0D" />
        </linearGradient>
        <linearGradient id={`${uid}-sweep`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <rect x="0" y="0" width="600" height="600" rx="44" />
        </clipPath>
        <filter id={`${uid}-blur`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="22" />
        </filter>
      </defs>
      <rect x="30" y="60" width="540" height="560" rx="44" fill="#000" opacity="0.22" filter={`url(#${uid}-blur)`} />
      <rect x="0" y="0" width="600" height="600" rx="44" fill={`url(#${uid}-pkg)`} />
      <rect x="1" y="1" width="598" height="598" rx="43" fill="none" stroke="#fff" strokeOpacity="0.12" strokeWidth="2" />
      <rect x="40" y="40" width="520" height="520" rx="26" fill={`url(#${uid}-lid)`} />
      <text x="300" y="322" textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize="62" letterSpacing="-1" fill="#F5F5F7" opacity={0.9 * label}>
        M5 Ultra
      </text>
      {tiles > 0
        ? Array.from({length: cols * rows}, (_, i) => {
            const c = i % cols;
            const r = Math.floor(i / cols);
            const d = Math.hypot(c - (cols - 1) / 2, r - (rows - 1) / 2) / 6.4;
            const k = clamp01((tiles - d * 0.55) / 0.45);
            const picked = i === 34 ? pick : 0;
            return (
              <rect
                key={i}
                x={80 + c * 44}
                y={124 + r * 44}
                width="40"
                height="40"
                rx="7"
                fill={picked > 0 ? '#FFFFFF' : C.apple}
                opacity={0.12 + 0.78 * k * (1 - 0.6 * pick) + picked * 0.9}
              />
            );
          })
        : null}
      {plan > 0 ? (
        <g opacity={plan}>
          <rect x="72" y="72" width="456" height="92" rx="12" fill="#fff" fillOpacity="0.07" stroke="#fff" strokeOpacity="0.3" strokeWidth="1.5" />
          {Array.from({length: 12}, (_, i) => (
            <rect key={i} x={86 + i * 36.5} y="88" width="28" height="60" rx="5" fill="#fff" opacity="0.16" />
          ))}
          <rect x="72" y="180" width="320" height="348" rx="12" fill={C.apple} fillOpacity="0.62" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.5" />
          {Array.from({length: 40}, (_, i) => (
            <rect key={i} x={88 + (i % 8) * 37} y={196 + Math.floor(i / 8) * 64} width="29" height="52" rx="5" fill="#fff" opacity="0.2" />
          ))}
          <rect x="408" y="180" width="120" height="166" rx="12" fill="#fff" fillOpacity="0.07" stroke="#fff" strokeOpacity="0.3" strokeWidth="1.5" />
          <rect x="408" y="362" width="120" height="166" rx="12" fill="#fff" fillOpacity="0.07" stroke="#fff" strokeOpacity="0.3" strokeWidth="1.5" />
        </g>
      ) : null}
      {sweep >= 0 && sweep <= 1 ? (
        <g clipPath={`url(#${uid}-clip)`}>
          <rect x={sx} y="-50" width="180" height="700" fill={`url(#${uid}-sweep)`} transform="skewX(-18)" />
        </g>
      ) : null}
    </svg>
  );
};

/** GB203-style die: 84 SM tiles in 7 GPC columns (illustrative), flooding NVIDIA green from the centre on `flood`. */
export const NvidiaDie: React.FC<{w: number; uid: string; flood?: number; style?: React.CSSProperties}> = ({w, uid, flood = 0, style}) => {
  const tiles: React.ReactNode[] = [];
  let n = 0;
  for (let g = 0; g < 7; g++) {
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 2; c++) {
        const x = 40 + g * 92 + c * 40;
        const y = 54 + r * 40;
        const d = Math.hypot((x + 17 - 350) / 330, (y + 17 - 174) / 140) / 1.3;
        const k = clamp01((flood - d * 0.6) / 0.4);
        tiles.push(<rect key={n++} x={x} y={y} width="34" height="34" rx="5" fill={k > 0 ? C.nvidia : '#2B2F36'} opacity={k > 0 ? 0.25 + 0.75 * k : 1} />);
      }
    }
  }
  return (
    <svg width={w} height={(w * 520) / 700} viewBox="0 0 700 520" style={{overflow: 'visible', ...style}}>
      <defs>
        <filter id={`${uid}-blur`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="20" />
        </filter>
      </defs>
      <rect x="30" y="50" width="640" height="490" rx="22" fill="#000" opacity="0.22" filter={`url(#${uid}-blur)`} />
      <rect x="0" y="0" width="700" height="520" rx="22" fill="#141619" />
      <rect x="1" y="1" width="698" height="518" rx="21" fill="none" stroke="#fff" strokeOpacity="0.1" strokeWidth="2" />
      {Array.from({length: 7}, (_, g) => (
        <rect key={g} x={32 + g * 92} y="46" width="90" height="256" rx="10" fill="none" stroke="#fff" strokeOpacity="0.12" strokeWidth="1.5" />
      ))}
      {tiles}
      <rect x="32" y="322" width="636" height="64" rx="10" fill={flood > 0.9 ? C.nvidia : '#23262C'} opacity={flood > 0.9 ? 0.55 : 1} />
      <text x="350" y="362" textAnchor="middle" fontFamily={MONO} fontSize="20" letterSpacing="4" fill="#fff" opacity="0.55">
        L2 CACHE
      </text>
      {Array.from({length: 8}, (_, i) => (
        <rect key={i} x={32 + i * 80} y="406" width="72" height="80" rx="8" fill="#23262C" />
      ))}
    </svg>
  );
};

/** A single memory package, drawn: dark mould, laser-etched marking, soft specular band. */
export const MemoryChip: React.FC<{w: number; uid: string; sweep?: number; style?: React.CSSProperties}> = ({w, uid, sweep = -1, style}) => {
  const sx = -200 + 900 * sweep;
  return (
    <svg width={w} height={(w * 300) / 420} viewBox="0 0 420 300" style={{overflow: 'visible', ...style}}>
      <defs>
        <linearGradient id={`${uid}-mould`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3A3B40" />
          <stop offset="1" stopColor="#101113" />
        </linearGradient>
        <linearGradient id={`${uid}-sweep`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <rect x="0" y="0" width="420" height="270" rx="22" />
        </clipPath>
        <filter id={`${uid}-blur`} x="-30%" y="-30%" width="160%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <ellipse cx="210" cy="286" rx="190" ry="12" fill="#000" opacity="0.22" filter={`url(#${uid}-blur)`} />
      <rect x="0" y="0" width="420" height="270" rx="22" fill={`url(#${uid}-mould)`} />
      <rect x="1" y="1" width="418" height="268" rx="21" fill="none" stroke="#fff" strokeOpacity="0.14" strokeWidth="2" />
      <circle cx="34" cy="34" r="8" fill="#fff" opacity="0.12" />
      <text x="210" y="128" textAnchor="middle" fontFamily={MONO} fontSize="30" letterSpacing="6" fill="#fff" opacity="0.62">
        LPDDR5X
      </text>
      <text x="210" y="172" textAnchor="middle" fontFamily={MONO} fontSize="18" letterSpacing="4" fill="#fff" opacity="0.32">
        UNIFIED · 1.2 TB/s
      </text>
      {sweep >= 0 && sweep <= 1 ? (
        <g clipPath={`url(#${uid}-clip)`}>
          <rect x={sx} y="-40" width="160" height="360" fill={`url(#${uid}-sweep)`} transform="skewX(-18)" />
        </g>
      ) : null}
    </svg>
  );
};

/** Red supercar, side profile. */
export const SuperCar: React.FC<{w: number; uid: string; wheel?: number; style?: React.CSSProperties}> = ({w, uid, wheel = 0, style}) => (
  <svg width={w} height={(w * 210) / 600} viewBox="0 0 600 210" style={{overflow: 'visible', ...style}}>
    <defs>
      <linearGradient id={`${uid}-paint`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FF4D3D" />
        <stop offset="0.55" stopColor="#D7140A" />
        <stop offset="1" stopColor="#8E0B05" />
      </linearGradient>
      <filter id={`${uid}-blur`} x="-20%" y="-200%" width="140%" height="500%">
        <feGaussianBlur stdDeviation="6" />
      </filter>
    </defs>
    <ellipse cx="300" cy="200" rx="270" ry="8" fill="#000" opacity="0.3" filter={`url(#${uid}-blur)`} />
    <path
      d="M 22 150 C 30 124 82 114 140 108 C 192 72 262 54 330 58 C 392 62 432 88 472 102 C 532 106 574 120 584 142 L 584 156 C 584 162 579 166 571 166 L 502 166 A 46 46 0 0 0 414 166 L 196 166 A 46 46 0 0 0 108 166 L 32 166 C 22 166 18 159 22 150 Z"
      fill={`url(#${uid}-paint)`}
    />
    <path d="M 204 104 C 244 76 292 66 336 68 C 372 70 400 86 420 102 Z" fill="#1A1C20" />
    <path d="M 90 128 C 220 116 400 114 560 128" stroke="#fff" strokeOpacity="0.35" strokeWidth="3" fill="none" />
    {[152, 458].map((cx) => (
      <g key={cx} transform={`translate(${cx} 166)`}>
        <circle r="40" fill="#111214" />
        <circle r="26" fill="#9CA1A8" />
        <g transform={`rotate(${wheel})`}>
          {Array.from({length: 5}, (_, i) => (
            <rect key={i} x="-3" y="-25" width="6" height="22" rx="3" fill="#4A4D52" transform={`rotate(${i * 72})`} />
          ))}
        </g>
        <circle r="7" fill="#2A2C30" />
      </g>
    ))}
  </svg>
);

/** Box truck, side profile. `open` makes the box panel translucent to show the load inside. */
export const BoxTruck: React.FC<{w: number; uid: string; open?: number; style?: React.CSSProperties}> = ({w, uid, open = 0, style}) => (
  <svg width={w} height={(w * 300) / 620} viewBox="0 0 620 300" style={{overflow: 'visible', ...style}}>
    <defs>
      <linearGradient id={`${uid}-box`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#DADCE0" />
      </linearGradient>
      <filter id={`${uid}-blur`} x="-20%" y="-200%" width="140%" height="500%">
        <feGaussianBlur stdDeviation="6" />
      </filter>
    </defs>
    <ellipse cx="310" cy="290" rx="290" ry="8" fill="#000" opacity="0.25" filter={`url(#${uid}-blur)`} />
    <rect x="20" y="20" width="420" height="214" rx="14" fill={`url(#${uid}-box)`} stroke="#C7CAD0" strokeWidth="2" />
    {Array.from({length: 24}, (_, i) => {
      const c = i % 6;
      const r = Math.floor(i / 6);
      return <rect key={i} x={36 + c * 66} y={170 - r * 46} width="60" height="40" rx="4" fill="#C9A26B" stroke="#A8854F" strokeWidth="2" opacity={open} />;
    })}
    <rect x="20" y="20" width="420" height="214" rx="14" fill={`url(#${uid}-box)`} opacity={1 - 0.88 * open} />
    <path d="M 450 92 L 540 92 C 566 92 580 112 590 140 L 600 176 L 600 234 L 450 234 Z" fill="#F2F3F5" stroke="#C7CAD0" strokeWidth="2" />
    <path d="M 468 106 L 536 106 C 552 106 562 120 568 142 L 572 156 L 468 156 Z" fill="#1E2024" opacity="0.85" />
    <rect x="12" y="232" width="596" height="14" rx="7" fill="#3A3C40" />
    {[110, 330, 528].map((cx) => (
      <g key={cx} transform={`translate(${cx} 250)`}>
        <circle r="34" fill="#141517" />
        <circle r="17" fill="#A3A7AD" />
        <circle r="6" fill="#2A2C30" />
      </g>
    ))}
  </svg>
);
