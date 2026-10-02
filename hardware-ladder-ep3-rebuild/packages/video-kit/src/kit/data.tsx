import React from 'react';
import {interpolate} from 'remotion';
import {CLAMP, P, SHADOW} from '../design';
import {EASE_IN_OUT, EASE_OUT, pop, ramp} from '../motion';

/**
 * Odometer: each digit column rolls to its target. `value` animates from `from` over [at, at+dur].
 * Digits roll continuously (like a real counter), formatted with thousands separators.
 */
export const Odometer: React.FC<{f: number; value: number; from?: number; at?: number; dur?: number; size?: number; prefix?: string; suffix?: string; style?: React.CSSProperties}> = ({
  f,
  value,
  from = 0,
  at = 0,
  dur = 30,
  size = 140,
  prefix = '',
  suffix = '',
  style,
}) => {
  const v = interpolate(f, [at, at + dur], [from, value], {...CLAMP, easing: EASE_OUT});
  const digits = Math.max(1, String(Math.round(Math.max(Math.abs(value), Math.abs(from)))).length);
  const cols: React.ReactNode[] = [];
  for (let d = digits - 1; d >= 0; d--) {
    const place = 10 ** d;
    // Higher columns only turn while the column below rolls from 9 to 0, like a real counter.
    const base = Math.floor(v / place) % 10;
    const frac = d === 0 ? v - Math.floor(v) : Math.max(0, Math.min(1, (v % place) - (place - 1)));
    const pos = base + frac;
    // Leading zeros keep their slot (no sideways jump) but stay invisible until the count reaches them.
    const never = d > 0 && Math.floor(Math.max(value, from) / place) === 0;
    const lead = d > 0 && v < place;
    cols.push(
      <span key={`d${d}`} style={{display: 'inline-block', height: size, overflow: 'hidden', opacity: lead ? 0 : 1, width: never ? 0 : '0.62em'}}>
        <span style={{display: 'block', transform: `translateY(${-pos * size}px)`}}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n, i) => (
            <span key={i} style={{display: 'block', height: size, lineHeight: `${size}px`, textAlign: 'center'}}>
              {n}
            </span>
          ))}
        </span>
      </span>,
    );
    if (d > 0 && d % 3 === 0 && !never) cols.push(<span key={`s${d}`} style={{opacity: lead ? 0 : 1, display: 'inline-block'}}>,</span>);
  }
  return (
    <div style={{display: 'flex', alignItems: 'flex-start', fontFamily: P.display, fontWeight: P.displayWeight, fontSize: size, lineHeight: `${size}px`, color: P.ink, fontVariantNumeric: 'tabular-nums', ...style}}>
      {prefix}
      {cols}
      {suffix}
    </div>
  );
};

/** Horizontal bars that grow and re-rank as values move from `from` to `to`. Values may be absent in `from`. */
export const BarRace: React.FC<{
  f: number;
  from: Record<string, number>;
  to: Record<string, number>;
  at?: number;
  dur?: number;
  width?: number;
  rowH?: number;
  highlight?: string;
  format?: (v: number) => string;
  style?: React.CSSProperties;
}> = ({f, from, to, at = 0, dur = 40, width = 820, rowH = 96, highlight, format = (v) => Math.round(v).toLocaleString(), style}) => {
  const t = interpolate(f, [at, at + dur], [0, 1], {...CLAMP, easing: EASE_IN_OUT});
  const keys = [...new Set([...Object.keys(from), ...Object.keys(to)])];
  const vals = keys.map((k) => ({k, v: (from[k] ?? 0) + ((to[k] ?? 0) - (from[k] ?? 0)) * t}));
  const max = Math.max(...vals.map((x) => x.v), 1);
  const rank = [...vals].sort((a, b) => b.v - a.v).map((x) => x.k);
  return (
    <div style={{position: 'absolute', width, height: keys.length * rowH, ...style}}>
      {vals.map(({k, v}) => {
        const r = rank.indexOf(k);
        const grow = ramp(f, at - 6, 12);
        const hot = k === highlight;
        return (
          <div key={k} style={{position: 'absolute', left: 0, top: r * rowH, width, height: rowH - 18, display: 'flex', alignItems: 'center'}}>
            <div
              style={{
                height: '100%',
                width: `${(v / max) * 72 * grow}%`,
                minWidth: 8,
                borderRadius: Math.min(P.radius, 14),
                background: hot ? P.gradient : P.dark ? 'rgba(255,255,255,.22)' : 'rgba(0,0,0,.12)',
                boxShadow: hot ? SHADOW.soft : undefined,
              }}
            />
            <div style={{marginLeft: 18, fontFamily: P.text, color: P.ink, lineHeight: 1.05}}>
              <div style={{fontSize: 30, fontWeight: 700}}>{k}</div>
              <div style={{fontSize: 26, color: P.ink2, fontVariantNumeric: 'tabular-nums'}}>{format(v)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export type Pt = {x: number; y: number; label?: string};

/** A route drawing itself through points (box-local px), with a travelling dot and pins that pop as it arrives. */
export const RouteMap: React.FC<{f: number; points: Pt[]; at?: number; dur?: number; width?: number; height?: number; curve?: number; style?: React.CSSProperties}> = ({
  f,
  points,
  at = 0,
  dur = 45,
  width = 900,
  height = 900,
  curve = 0.25,
  style,
}) => {
  const segs = points.slice(1).map((b, i) => {
    const a = points[i];
    const mx = (a.x + b.x) / 2 - (b.y - a.y) * curve;
    const my = (a.y + b.y) / 2 + (b.x - a.x) * curve;
    const len = Math.hypot(mx - a.x, my - a.y) + Math.hypot(b.x - mx, b.y - my);
    return {a, b, mx, my, len};
  });
  const total = segs.reduce((s, x) => s + x.len, 0) || 1;
  const drawn = interpolate(f, [at, at + dur], [0, total], {...CLAMP, easing: EASE_IN_OUT});
  let acc = 0;
  let dot = points[0];
  const arrivals: number[] = [0];
  const paths = segs.map((s, i) => {
    const local = Math.max(0, Math.min(s.len, drawn - acc));
    const u = local / s.len;
    if (local > 0) {
      const q = (1 - u) ** 2;
      dot = {x: q * s.a.x + 2 * (1 - u) * u * s.mx + u * u * s.b.x, y: q * s.a.y + 2 * (1 - u) * u * s.my + u * u * s.b.y};
    }
    acc += s.len;
    arrivals.push(acc);
    return (
      <path
        key={i}
        d={`M${s.a.x},${s.a.y} Q${s.mx},${s.my} ${s.b.x},${s.b.y}`}
        fill="none"
        stroke={P.accent}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={s.len}
        strokeDashoffset={s.len - local}
      />
    );
  });
  const arriveFrame = (d: number) => {
    for (let fr = at; fr <= at + dur; fr++) {
      if (interpolate(fr, [at, at + dur], [0, total], {...CLAMP, easing: EASE_IN_OUT}) >= d - 0.5) return fr;
    }
    return at + dur;
  };
  return (
    <div style={{position: 'absolute', width, height, ...style}}>
      <svg width={width} height={height} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {paths}
        <circle cx={dot.x} cy={dot.y} r={16} fill={P.accent} stroke="#fff" strokeWidth={5} />
      </svg>
      {points.map((p, i) => {
        const s = pop(f, arriveFrame(arrivals[i]), 14);
        return (
          <div key={i} style={{position: 'absolute', left: p.x, top: p.y, transform: `translate(-50%, -100%) scale(${s})`, transformOrigin: '50% 100%', textAlign: 'center'}}>
            {p.label ? (
              <div style={{padding: '8px 16px', borderRadius: 14, background: P.dark ? '#2a2a30' : '#fff', boxShadow: SHADOW.soft, fontFamily: P.text, fontSize: 26, fontWeight: 700, color: P.ink, marginBottom: 8, whiteSpace: 'nowrap'}}>
                {p.label}
              </div>
            ) : null}
            <div style={{width: 22, height: 22, margin: '0 auto', borderRadius: '50%', background: P.ink, border: '4px solid #fff'}} />
          </div>
        );
      })}
    </div>
  );
};

export type FlowNode = {id: string; x: number; y: number; label: string; at: number};
export type FlowEdge = {from: string; to: string; at: number};

/** Nodes pop in and light up at their frame; edges draw between them; a pulse travels each edge once drawn. */
export const FlowDiagram: React.FC<{f: number; nodes: FlowNode[]; edges: FlowEdge[]; width?: number; height?: number; nodeW?: number; style?: React.CSSProperties}> = ({
  f,
  nodes,
  edges,
  width = 900,
  height = 1000,
  nodeW = 260,
  style,
}) => {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  return (
    <div style={{position: 'absolute', width, height, ...style}}>
      <svg width={width} height={height} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {edges.map((e) => {
          const a = byId[e.from];
          const b = byId[e.to];
          const len = Math.hypot(b.x - a.x, b.y - a.y);
          const d = ramp(f, e.at, 12);
          const pulse = ((f - e.at - 12) % 30) / 30;
          return (
            <g key={`${e.from}-${e.to}`}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={P.dark ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.22)'} strokeWidth={5} strokeDasharray={len} strokeDashoffset={len * (1 - d)} />
              {d >= 1 ? <circle cx={a.x + (b.x - a.x) * pulse} cy={a.y + (b.y - a.y) * pulse} r={9} fill={P.accent} /> : null}
            </g>
          );
        })}
      </svg>
      {nodes.map((n) => {
        const p = pop(f, n.at, 16);
        const lit = ramp(f, n.at + 4, 8);
        return (
          <div
            key={n.id}
            style={{
              position: 'absolute',
              left: n.x - nodeW / 2,
              top: n.y - 50,
              width: nodeW,
              height: 100,
              borderRadius: Math.min(P.radius, 24),
              display: 'grid',
              placeItems: 'center',
              fontFamily: P.text,
              fontSize: 32,
              fontWeight: 700,
              color: lit > 0.5 ? '#fff' : P.ink,
              background: lit > 0.5 ? P.accent : P.dark ? '#2a2a30' : '#fff',
              boxShadow: SHADOW.card,
              opacity: p,
              transform: `scale(${0.8 + 0.2 * p})`,
            }}
          >
            {n.label}
          </div>
        );
      })}
    </div>
  );
};
