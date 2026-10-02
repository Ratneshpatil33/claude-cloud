import React from 'react';
import {Img, interpolate, staticFile} from 'remotion';
import {CLAMP, H, P, W} from '../design';
import {EASE_IN_OUT, drift, ramp, rnd} from '../motion';

type LayerFile = {file: string; width: number; height: number};
export type Plate = {key: 'green' | 'magenta'; layers: {bg?: LayerFile; mid?: LayerFile; fg?: LayerFile}};

/** Where a keyed layer sits, in frame px at frame 0: centre x/y and width (height follows the image). */
export type Place = {x: number; y: number; w: number};

/** The project's src/data/parallax.json, set by configure(). */
let PLATES: Record<string, Plate> = {};
export const loadPlates = (plates: Record<string, Plate>) => {
  PLATES = plates;
};

/** Camera state: pan in px (as seen on the nearest layer) and extra zoom of the nearest layer (0.15 = +15%). */
export type Camera = {x?: number; y?: number; zoom?: number};

/** How far each layer moves relative to the camera. The background barely moves; the subject moves most. */
const DEPTH = {bg: 0.22, mid: 0.55, fg: 1} as const;

/**
 * Chroma key done in the browser (deterministic, no pre-processing). With d = key channel − mean of the others:
 * opaque below d = 0.15, gone above 0.15 + 1/k, linear between. Scaled by source alpha, so the filter's padding
 * (transparent black) stays transparent instead of turning into a black frame. Spill is suppressed on the kept pixels.
 */
const KeyFilter: React.FC<{id: string; color: 'green' | 'magenta'; k?: number}> = ({id, color, k = 5}) => {
  const h = k / 2;
  const a = 1 + 0.15 * k;
  const s = 0.6; // spill suppression: pull the key channel toward the mean of the other two (kills green rims)
  const rows =
    color === 'green'
      ? `1 0 0 0 0  ${s / 2} ${1 - s} ${s / 2} 0 0  0 0 1 0 0  ${h} ${-k} ${h} ${a} 0`
      : `${1 - s / 2} ${s} ${-s / 2} 0 0  0 1 0 0 0  ${-s / 2} ${s} ${1 - s / 2} 0 0  ${-h} ${k} ${-h} ${a} 0`;
  return (
    <svg width={0} height={0} style={{position: 'absolute'}}>
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values={rows} />
      </filter>
    </svg>
  );
};

/**
 * A 2.5D shot from a generated plate (scripts/gen-parallax.mjs): a cover-fit background plus keyed mid and
 * foreground layers that you place (`fg`/`mid`), each moving at its own depth as the camera goes `from` → `to`.
 * Frame 0 is the full composed picture. Children render on top in screen space (labels, callouts, kit pieces).
 *
 *  fg/mid — placement of the keyed layers; look at the layers and the bg, then seat the subject where the
 *           background leaves room (on a surface, in the light). `shadow` grounds it.
 *  focus  — rack focus: background (and mid, half) blur in on a spoken word
 *  sweep  — a light band slides across the subject only
 *  fly    — fly-through exit: the subject rushes past the lens; pair with the scene's `exit: "zoom"` or "dissolve"
 *  dust   — drifting particles between mid and foreground, which sells the depth
 *  attached — overlays that ride on the subject (glow, pulse, pin), positioned in frame px as seen at frame 0
 */
export const Parallax: React.FC<{
  id: string;
  f: number;
  dur: number;
  fg?: Place;
  mid?: Place;
  shadow?: boolean;
  from?: Camera;
  to?: Camera;
  origin?: {x: number; y: number};
  height?: number;
  focus?: {at: number; dur?: number; amount?: number};
  sweep?: {at: number; dur?: number};
  fly?: {at: number; dur?: number};
  dust?: number;
  keyStrength?: number;
  attached?: React.ReactNode;
  children?: React.ReactNode;
}> = ({id, f, dur, fg: fgAt, mid: midAt, shadow = true, from = {}, to = {zoom: 0.08}, origin, height = H, focus, sweep, fly, dust = 0, keyStrength, attached, children}) => {
  const plate = PLATES[id];
  const o = origin ?? {x: W / 2, y: height * 0.45};

  if (!plate?.layers?.bg || !plate.layers.fg) {
    // Not generated yet: a composed stand-in so the edit still renders end to end.
    return (
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height, overflow: 'hidden', background: `radial-gradient(circle at 50% 45%, ${P.bg2}, ${P.bg})`}}>
        <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: P.mono, fontSize: 28, color: P.ink2}}>
          parallax “{id}” not generated
        </div>
        {children}
      </div>
    );
  }

  const t = interpolate(f, [0, dur], [0, 1], {...CLAMP, easing: EASE_IN_OUT});
  const cam = {
    x: (from.x ?? 0) + ((to.x ?? 0) - (from.x ?? 0)) * t + drift(f, 90, 3),
    y: (from.y ?? 0) + ((to.y ?? 0) - (from.y ?? 0)) * t + drift(f, 120, 2, 1),
    zoom: (from.zoom ?? 0) + ((to.zoom ?? 0) - (from.zoom ?? 0)) * t,
  };
  // Overscan so the background never shows an edge while panning or pulling back.
  const reach = Math.max(Math.abs(from.x ?? 0), Math.abs(to.x ?? 0), Math.abs(from.y ?? 0), Math.abs(to.y ?? 0)) + 6;
  const pullBack = Math.max(0, -(from.zoom ?? 0), -(to.zoom ?? 0));
  const over = 1.02 + (2 * reach * DEPTH.bg) / Math.min(W, height) + pullBack * DEPTH.bg;

  const flyT = fly ? interpolate(f, [fly.at, fly.at + (fly.dur ?? 10)], [0, 1], CLAMP) ** 2 : 0;
  const blur = focus ? ramp(f, focus.at, focus.dur ?? 10) * (focus.amount ?? 8) : 0;

  const layerStyle = (d: number, flyScale: number): React.CSSProperties => ({
    position: 'absolute',
    inset: 0,
    transformOrigin: `${o.x}px ${o.y}px`,
    transform: `translate(${cam.x * d}px, ${cam.y * d}px) scale(${over * (1 + cam.zoom * d) * (1 + flyScale * flyT)})`,
  });
  const fid = (layer: string) => `key-${id}-${layer}`;
  const src = (l: LayerFile) => staticFile(l.file);
  const {bg, mid, fg} = plate.layers;
  const placed = (l: LayerFile, at: Place): React.CSSProperties => {
    const h = (at.w * l.height) / l.width;
    return {position: 'absolute', left: at.x - at.w / 2, top: at.y - h / 2, width: at.w, height: h};
  };
  const fgPlace = fgAt ?? {x: W / 2, y: height * 0.45, w: 640};
  const midPlace = midAt ?? {x: W / 2, y: height * 0.62, w: 900};
  const ground = shadow ? ` drop-shadow(0 ${P.dark ? 26 : 20}px 34px rgba(0,0,0,${P.dark ? 0.55 : 0.28}))` : '';

  const sweepX = sweep ? interpolate(f, [sweep.at, sweep.at + (sweep.dur ?? 16)], [-40, 140], CLAMP) : -100;
  const sweepOn = sweep && f >= sweep.at && f <= sweep.at + (sweep.dur ?? 16);

  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height, overflow: 'hidden', background: P.bg}}>
      <KeyFilter id={fid('fg')} color={plate.key} k={keyStrength} />
      {mid ? <KeyFilter id={fid('mid')} color={plate.key} k={keyStrength} /> : null}

      <div style={layerStyle(DEPTH.bg, 0.35)}>
        <Img src={src(bg)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: blur ? `blur(${blur}px)` : undefined}} />
      </div>
      {mid ? (
        <div style={layerStyle(DEPTH.mid, 1.2)}>
          <Img src={src(mid)} style={{...placed(mid, midPlace), filter: `url(#${fid('mid')})${ground}${blur ? ` blur(${blur / 2}px)` : ''}`}} />
        </div>
      ) : null}

      {Array.from({length: dust}, (_, i) => {
        const d = 0.8;
        const x = rnd(i * 3.1 + 1) * W + cam.x * d + drift(f, 70 + rnd(i) * 60, 14, i);
        const y = ((rnd(i * 7.7 + 2) * height - f * (0.4 + rnd(i * 5.3) * 0.8)) % height + height) % height + cam.y * d;
        const r = 2 + rnd(i * 2.3) * 5;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              background: P.dark ? '#fff' : P.accent,
              opacity: (0.18 + rnd(i * 9.1) * 0.3) * (1 - flyT),
              filter: `blur(${r > 5 ? 2 : 0.5}px)`,
            }}
          />
        );
      })}

      <div style={{...layerStyle(DEPTH.fg, 3.2), opacity: 1 - Math.max(0, flyT - 0.5) * 2}}>
        <Img src={src(fg)} style={{...placed(fg, fgPlace), filter: `url(#${fid('fg')})${ground}${flyT ? ` blur(${flyT * 12}px)` : ''}`}} />
        {sweepOn ? (
          // Same keyed subject, brightened, revealed only inside a moving diagonal band: the glint stays on the subject.
          <Img
            src={src(fg)}
            style={{
              ...placed(fg, fgPlace),
              filter: `url(#${fid('fg')}) brightness(1.9) saturate(0.6)`,
              mixBlendMode: 'screen',
              opacity: 0.55,
              WebkitMaskImage: `linear-gradient(105deg, transparent ${sweepX - 12}%, #000 ${sweepX}%, transparent ${sweepX + 12}%)`,
              maskImage: `linear-gradient(105deg, transparent ${sweepX - 12}%, #000 ${sweepX}%, transparent ${sweepX + 12}%)`,
            }}
          />
        ) : null}
        {attached ? <div style={{position: 'absolute', inset: 0, opacity: 1 - flyT}}>{attached}</div> : null}
      </div>
      {children}
    </div>
  );
};
