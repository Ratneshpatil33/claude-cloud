import React from 'react';
import {interpolate} from 'remotion';
import {CLAMP, P, SHADOW} from '../design';
import {EASE_IN_OUT, pop, ramp, snap} from '../motion';

export type CursorKey = {f: number; x: number; y: number; click?: boolean};

/** Pointer that glides between keyframes (scene frames) and ripples on clicks. Draw it last so it sits on top. */
export const Cursor: React.FC<{f: number; keys: CursorKey[]; size?: number}> = ({f, keys, size = 44}) => {
  if (!keys.length) return null;
  const i = Math.max(0, keys.findIndex((k, j) => f < (keys[j + 1]?.f ?? Infinity)));
  const a = keys[i];
  const b = keys[i + 1] ?? a;
  const t = b === a ? 1 : interpolate(f, [a.f, b.f], [0, 1], {...CLAMP, easing: EASE_IN_OUT});
  const x = a.x + (b.x - a.x) * t;
  const y = a.y + (b.y - a.y) * t;
  const clicks = keys.filter((k) => k.click && f >= k.f && f < k.f + 14);
  const press = keys.some((k) => k.click && f >= k.f && f < k.f + 4);
  return (
    <>
      {clicks.map((k) => {
        const p = ramp(f, k.f, 14);
        return (
          <div
            key={k.f}
            style={{
              position: 'absolute',
              left: k.x - 50,
              top: k.y - 50,
              width: 100,
              height: 100,
              borderRadius: '50%',
              border: `4px solid ${P.accent}`,
              opacity: 1 - p,
              transform: `scale(${0.3 + p})`,
              zIndex: 40,
            }}
          />
        );
      })}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        style={{position: 'absolute', left: x, top: y, zIndex: 41, transform: `scale(${press ? 0.86 : 1})`, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,.35))'}}
      >
        <path d="M3 2l7.5 19 2.6-7.9L21 10.5z" fill="#111" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </>
  );
};

/** Search / prompt bar that types `text` at `cps` chars per second, with a blinking caret and optional suggestions. */
export const TypeBar: React.FC<{
  f: number;
  text: string;
  at?: number;
  cps?: number;
  placeholder?: string;
  suggestions?: string[];
  width?: number;
  style?: React.CSSProperties;
}> = ({f, text, at = 0, cps = 16, placeholder = 'Search', suggestions = [], width = 820, style}) => {
  const n = Math.max(0, Math.min(text.length, Math.floor(((f - at) / 25) * cps)));
  const done = n >= text.length;
  const doneAt = at + Math.ceil((text.length / cps) * 25);
  return (
    <div style={{position: 'absolute', width, ...style}}>
      <div
        style={{
          height: 104,
          borderRadius: Math.min(P.radius, 52),
          background: P.dark ? 'rgba(255,255,255,.08)' : '#fff',
          border: `2px solid ${P.dark ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,.08)'}`,
          boxShadow: SHADOW.card,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          padding: '0 34px',
          fontFamily: P.text,
          fontSize: 40,
          fontWeight: 500,
          color: n ? P.ink : P.ink2,
        }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={P.ink2} strokeWidth="2.4">
          <circle cx="11" cy="11" r="7" />
          <path d="M16.5 16.5L21 21" strokeLinecap="round" />
        </svg>
        <span>
          {n ? text.slice(0, n) : placeholder}
          <span style={{color: P.accent, opacity: done && Math.floor(f / 12) % 2 ? 0 : 1}}>|</span>
        </span>
      </div>
      {suggestions.map((s, i) => {
        const p = pop(f, doneAt + 3 + i * 3, 14);
        return (
          <div
            key={s}
            style={{
              marginTop: 14,
              padding: '22px 34px',
              borderRadius: Math.min(P.radius, 24),
              background: P.dark ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.92)',
              boxShadow: SHADOW.soft,
              fontFamily: P.text,
              fontSize: 34,
              color: P.ink,
              opacity: p,
              transform: `translateY(${(1 - p) * 20}px)`,
            }}
          >
            {s}
          </div>
        );
      })}
    </div>
  );
};

export type Note = {at: number; title: string; body?: string; icon?: React.ReactNode};

/** iOS-style notifications sliding in from the top; newest on top, older ones pushed down. */
export const NotificationStack: React.FC<{f: number; items: Note[]; width?: number; style?: React.CSSProperties}> = ({f, items, width = 860, style}) => {
  const live = items.filter((n) => f >= n.at);
  return (
    <div style={{position: 'absolute', width, ...style}}>
      {live
        .slice()
        .reverse()
        .map((n, i) => {
          const p = snap(f, n.at, 10);
          const below = live.length - 1 - i;
          const y = live.slice(live.length - i).reduce((acc, m) => acc + 150 * snap(f, m.at, 10), 0);
          return (
            <div
              key={`${n.at}-${n.title}`}
              style={{
                position: 'absolute',
                left: 0,
                width,
                top: y,
                display: 'flex',
                gap: 22,
                alignItems: 'center',
                padding: '24px 28px',
                borderRadius: Math.min(P.radius, 30),
                background: P.dark ? 'rgba(40,40,46,.92)' : 'rgba(255,255,255,.95)',
                boxShadow: SHADOW.card,
                opacity: p * (below > 3 ? 0 : 1),
                transform: `translateY(${(1 - p) * -60}px) scale(${1 - Math.min(below, 3) * 0.02})`,
                fontFamily: P.text,
              }}
            >
              <div style={{width: 68, height: 68, borderRadius: 16, background: P.gradient, display: 'grid', placeItems: 'center', color: '#fff', fontSize: 34}}>
                {n.icon}
              </div>
              <div>
                <div style={{fontSize: 32, fontWeight: 700, color: P.ink}}>{n.title}</div>
                {n.body ? <div style={{fontSize: 28, color: P.ink2, marginTop: 4}}>{n.body}</div> : null}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export type Msg = {at: number; from: 'me' | 'them'; text: string};

/** Chat thread: bubbles pop in at their frame, a typing indicator shows before each `them` message. */
export const ChatThread: React.FC<{f: number; messages: Msg[]; width?: number; typingLead?: number; style?: React.CSSProperties}> = ({
  f,
  messages,
  width = 860,
  typingLead = 14,
  style,
}) => {
  const shown = messages.filter((m) => f >= m.at);
  const next = messages.find((m) => f < m.at);
  const typing = next && next.from === 'them' && f >= next.at - typingLead;
  const bubble = (me: boolean): React.CSSProperties => ({
    alignSelf: me ? 'flex-end' : 'flex-start',
    maxWidth: width * 0.78,
    padding: '20px 28px',
    borderRadius: 34,
    background: me ? P.accent : P.dark ? 'rgba(255,255,255,.1)' : '#E9E9EB',
    color: me ? '#fff' : P.ink,
    fontFamily: P.text,
    fontSize: 36,
    lineHeight: 1.25,
  });
  return (
    <div style={{position: 'absolute', width, display: 'flex', flexDirection: 'column', gap: 14, ...style}}>
      {shown.map((m) => {
        const p = pop(f, m.at, 14);
        return (
          <div key={`${m.at}-${m.text}`} style={{...bubble(m.from === 'me'), opacity: p, transform: `scale(${0.85 + p * 0.15})`, transformOrigin: m.from === 'me' ? 'right bottom' : 'left bottom'}}>
            {m.text}
          </div>
        );
      })}
      {typing ? (
        <div style={{...bubble(false), display: 'flex', gap: 10}}>
          {[0, 1, 2].map((d) => (
            <span key={d} style={{width: 14, height: 14, borderRadius: 7, background: P.ink2, opacity: 0.4 + 0.6 * ((Math.floor(f / 5) + d) % 3 === 0 ? 1 : 0)}} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

/** iOS-style switch that flips on at frame `at`. */
export const Toggle: React.FC<{f: number; at: number; scale?: number; style?: React.CSSProperties}> = ({f, at, scale = 2, style}) => {
  const p = snap(f, at, 8);
  return (
    <div
      style={{
        position: 'absolute',
        width: 51 * scale,
        height: 31 * scale,
        borderRadius: 16 * scale,
        background: p > 0.5 ? P.accent : P.dark ? 'rgba(255,255,255,.2)' : '#E9E9EB',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 2 * scale,
          left: (2 + p * 20) * scale,
          width: 27 * scale,
          height: 27 * scale,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 3px 8px rgba(0,0,0,.2)',
        }}
      />
    </div>
  );
};
