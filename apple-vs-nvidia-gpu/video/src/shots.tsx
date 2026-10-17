import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile} from 'remotion';
import {AppleChip, BoxTruck, GpuCard, MacStudio, MemoryChip, NvidiaDie, SuperCar} from './devices';
import {MONO, SANS} from './fonts';
import {C, CLAMP, EASE_IN, EASE_OUT, H, SHADOW, W, lin, mix, pop, ramp, rampIO, rampIn, rnd, settle, snap} from './lib';
import {Callout, Gauge, Glass, Mark, Odometer, PlaneIcon} from './ui';

/** Local frame, shot length, and `at(scene, k)` = local frame where the k-th word of a scene starts. */
export type ShotProps = {f: number; dur: number; at: (scene: number, k: number) => number};

const Pos: React.FC<{x: number; y: number; s?: number; o?: number; r?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  x,
  y,
  s = 1,
  o = 1,
  r = 0,
  children,
  style,
}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${s}) rotate(${r}deg)`, opacity: o, ...style}}>{children}</div>
);

const Text: React.FC<{size: number; weight?: number; color?: string; mono?: boolean; track?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({
  size,
  weight = 600,
  color = C.ink,
  mono = false,
  track,
  children,
  style,
}) => (
  <div
    style={{
      fontFamily: mono ? MONO : SANS,
      fontSize: size,
      fontWeight: weight,
      color,
      letterSpacing: track ?? (mono ? '0.02em' : size > 80 ? '-0.035em' : '-0.02em'),
      lineHeight: 1.04,
      whiteSpace: 'nowrap',
      fontVariantNumeric: 'tabular-nums',
      ...style,
    }}
  >
    {children}
  </div>
);

/** Horizontal whip blur (SVG filter usable from CSS), strongest at the start of the move. */
const Whip: React.FC<{id: string; amount: number; children: React.ReactNode}> = ({id, amount, children}) => (
  <>
    <svg width="0" height="0" style={{position: 'absolute'}}>
      <filter id={id} x="-50%" y="-10%" width="200%" height="120%">
        <feGaussianBlur stdDeviation={`${Math.max(0, amount)} 0`} />
      </filter>
    </svg>
    <div style={{position: 'absolute', inset: 0, filter: amount > 0.3 ? `url(#${id})` : undefined}}>{children}</div>
  </>
);

// ------------------------------------------------------------------------------------------------ shared layouts

/** The two-up hero (frame 0 and the final frame are identical, so the loop is seamless). */
const TWO_UP = {mac: {x: 300, y: 1000, w: 400}, gpu: {x: 775, y: 1000, w: 430}};

const Headline: React.FC<{k: number}> = ({k}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', justifyContent: 'center', opacity: k, transform: `translateY(${(1 - k) * 18}px)`}}>
    <div style={{display: 'flex', alignItems: 'flex-end', gap: 34}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Text size={124} weight={700} color={C.apple}>
          80
        </Text>
        <Text size={30} weight={500} color={C.ink2} style={{marginTop: 10}}>
          GPU cores
        </Text>
      </div>
      <Text size={56} weight={500} color={C.ink3} style={{marginBottom: 58}}>
        vs
      </Text>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Text size={124} weight={700} color={C.nvidia}>
          10,000+
        </Text>
        <Text size={30} weight={500} color={C.ink2} style={{marginTop: 10}}>
          CUDA cores
        </Text>
      </div>
    </div>
  </div>
);

const TwoUpProducts: React.FC<{f: number; sweep?: number; labels?: number; s?: number}> = ({f, sweep = -1, labels = 1, s = 1}) => (
  <>
    <Pos x={TWO_UP.mac.x} y={TWO_UP.mac.y} s={s}>
      <MacStudio w={TWO_UP.mac.w} uid="tu-mac" sweep={sweep} />
    </Pos>
    <Pos x={TWO_UP.gpu.x} y={TWO_UP.gpu.y} s={s}>
      <GpuCard w={TWO_UP.gpu.w} uid="tu-gpu" angle={f * 6} sweep={sweep} />
    </Pos>
    <div style={{position: 'absolute', left: 539, top: 860, width: 2, height: 300, background: C.hair, opacity: labels}} />
    <Pos x={TWO_UP.mac.x} y={1190} o={labels}>
      <Text size={30} weight={500} color={C.ink2}>
        Mac Studio · M5 Ultra
      </Text>
    </Pos>
    <Pos x={TWO_UP.gpu.x} y={1190} o={labels}>
      <Text size={30} weight={500} color={C.ink2}>
        GeForce RTX 5080
      </Text>
    </Pos>
  </>
);

/** The bars that carry the story from 1.5 to 3.1: one per product, on a shared baseline. */
const BARS = {baseline: 1050, x: [300, 775], w: 132, prodY: 1175};

const Bar: React.FC<{x: number; h: number; color: string; children?: React.ReactNode}> = ({x, h, color, children}) => (
  <>
    <div
      style={{
        position: 'absolute',
        left: x - BARS.w / 2,
        top: BARS.baseline - h,
        width: BARS.w,
        height: h,
        borderRadius: '22px 22px 6px 6px',
        background: `linear-gradient(180deg, ${color}, ${color}D0)`,
        boxShadow: `0 24px 50px -24px ${color}`,
      }}
    />
    {children ? (
      <div style={{position: 'absolute', left: x - 260, width: 520, top: BARS.baseline - h - 18, transform: 'translateY(-100%)', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        {children}
      </div>
    ) : null}
  </>
);

const BarProducts: React.FC<{f: number}> = ({f}) => (
  <>
    <div style={{position: 'absolute', left: 120, right: 140, top: BARS.baseline, height: 2, background: C.hair}} />
    <Pos x={BARS.x[0]} y={BARS.prodY}>
      <MacStudio w={250} uid="bar-mac" />
    </Pos>
    <Pos x={BARS.x[1]} y={BARS.prodY}>
      <GpuCard w={290} uid="bar-gpu" angle={f * 6} />
    </Pos>
  </>
);

// ------------------------------------------------------------------------------------------------ 1 · hook

/** 1.1 "What's the difference between": both products lit at frame 0 under the text hook. */
export const S11: React.FC<ShotProps> = ({f, dur}) => (
  <AbsoluteFill style={{transform: `scale(${lin(f, 0, dur, 1, 1.025)})`}}>
    <Headline k={1} />
    <TwoUpProducts f={f} sweep={lin(f, 4, dur, 0, 1)} />
  </AbsoluteFill>
);

/** 1.2 "Apple's M five Ultra Mac Studio": the Mac alone, punch-in on "Mac". */
export const S12: React.FC<ShotProps> = ({f, dur, at}) => {
  const k = settle(f, 0);
  const punch = 1 + 0.06 * snap(f, at(1, 8));
  return (
    <AbsoluteFill>
      <Pos x={540} y={mix(900, 860, k)} s={mix(0.92, 1, k) * punch}>
        <MacStudio w={760} uid="s12-mac" sweep={lin(f, 2, dur, 0, 1)} />
      </Pos>
      <Callout x={600} y={736} dx={-70} dy={-150} run={-50} label="Mac Studio" sub="M5 Ultra" k={ramp(f, 6, 16)} />
    </AbsoluteFill>
  );
};

/** 1.3 "with eighty GPU cores": the Mac lifts, a blue 80 lands. */
export const S13: React.FC<ShotProps> = ({f, at}) => {
  const k = settle(f, 0);
  const t = at(1, 11);
  const v = interpolate(f, [t, t + 14], [0, 80], {...CLAMP, easing: EASE_OUT});
  const land = pop(f, t + 14);
  return (
    <AbsoluteFill>
      <Pos x={540} y={mix(860, 620, k)} s={mix(1, 0.74, k)}>
        <MacStudio w={760} uid="s13-mac" />
      </Pos>
      <div style={{position: 'absolute', left: 0, right: 0, top: 850, display: 'flex', justifyContent: 'center', transform: `scale(${0.96 + 0.04 * land})`}}>
        <Odometer value={v} digits={2} size={300} color={C.apple} />
      </div>
      <Pos x={540} y={1180} o={ramp(f, t, 10)}>
        <Text size={42} weight={500} color={C.ink2}>
          GPU cores
        </Text>
      </Pos>
      <Pos x={540} y={1232} o={ramp(f, t + 8, 10)}>
        <Text size={24} mono color={C.ink3}>
          80-core GPU configuration
        </Text>
      </Pos>
    </AbsoluteFill>
  );
};

/** 1.4 "and NVIDIA's RTX fifty-eighty, with over ten thousand?": whip-pan to the card, the count rolls past 10,000. */
export const S14: React.FC<ShotProps> = ({f, at}) => {
  const x = interpolate(f, [0, 9], [760, 0], {...CLAMP, easing: EASE_OUT});
  const t = at(1, 19);
  const v = interpolate(f, [t, at(1, 21) + 4], [0, 10000], {...CLAMP, easing: EASE_OUT});
  const plus = pop(f, at(1, 21) + 4);
  return (
    <AbsoluteFill>
      <Whip id="whip14" amount={lin(f, 0, 9, 46, 0)}>
        <div style={{position: 'absolute', inset: 0, transform: `translateX(${x}px)`}}>
          <Pos x={540} y={690}>
            <GpuCard w={780} uid="s14-gpu" angle={f * 9} blur={0.2} />
          </Pos>
        </div>
      </Whip>
      <Callout x={700} y={530} dx={-50} dy={-140} run={-40} label="GeForce RTX 5080" sub="NVIDIA · Blackwell" k={ramp(f, 10, 16)} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 905, display: 'flex', justifyContent: 'center', opacity: ramp(f, t - 2, 6)}}>
        <Odometer
          value={v}
          digits={5}
          size={210}
          color={C.nvidia}
          suffix={<span style={{display: 'inline-block', transform: `scale(${plus})`, opacity: Math.min(1, plus)}}>+</span>}
        />
      </div>
      <Pos x={540} y={1180} o={ramp(f, t, 10)}>
        <Text size={42} weight={500} color={C.ink2}>
          CUDA cores
        </Text>
      </Pos>
    </AbsoluteFill>
  );
};

/** 1.5 "How is Apple even competing?": NVIDIA's bar bursts out of the frame; the camera chases it. */
export const S15: React.FC<ShotProps> = ({f, at}) => {
  const grow = interpolate(f, [2, 20], [0, 2300], {...CLAMP, easing: EASE_OUT});
  const tilt = interpolate(f, [4, 16, 24, 32], [0, 340, 340, 0], {...CLAMP, easing: EASE_OUT});
  const how = pop(f, at(1, 26) - 4);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${tilt}px)`}}>
        <Bar x={BARS.x[0]} h={8} color={C.apple} />
        <Bar x={BARS.x[1]} h={grow} color={C.nvidia} />
        <BarProducts f={f} />
        <Pos x={BARS.x[0]} y={BARS.baseline - 60}>
          <Text size={44} weight={700} color={C.apple}>
            80
          </Text>
        </Pos>
      </div>
      <Pos x={540} y={560} s={0.6 + 0.4 * how} o={Math.min(1, how * 1.4)}>
        <div style={{padding: '18px 50px', borderRadius: 40, background: 'rgba(245,245,247,.88)', backdropFilter: 'blur(12px)'}}>
          <Text size={190} weight={800}>
            How?
          </Text>
        </div>
      </Pos>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ 2 · cores

/** 2.1 "Because Apple's cores are bigger than you think.": zoom through the Mac into the M5 Ultra; 80 tiles light. */
export const S21: React.FC<ShotProps> = ({f, at}) => {
  const zoom = rampIn(f, 0, 10);
  const chipIn = settle(f, 6);
  const tiles = lin(f, 12, 40, 0, 1.6);
  const pick = ramp(f, at(2, 4), 10);
  return (
    <AbsoluteFill>
      <Pos x={540} y={860} s={1 + 5 * zoom} o={1 - zoom}>
        <MacStudio w={760} uid="s21-mac" />
      </Pos>
      <Pos x={540} y={800} s={mix(1.5, 1, chipIn)} o={Math.min(1, chipIn * 1.5)}>
        <AppleChip w={720} uid="s21-chip" tiles={tiles} pick={pick} label={1 - ramp(f, 10, 10)} sweep={lin(f, 8, 50, 0, 1)} />
      </Pos>
      <Callout x={511} y={771} dx={-40} dy={-371} run={-60} label="1 GPU core" k={ramp(f, at(2, 4) + 2, 16)} />
      <Pos x={540} y={1200} o={ramp(f, 20, 12)}>
        <Text size={22} mono color={C.ink3}>
          illustrative layout
        </Text>
      </Pos>
    </AbsoluteFill>
  );
};

const ALU = {cols: 16, rows: 8, s: 38, g: 8};

/** 2.2 "Each one packs a hundred and twenty-eight math units,": one tile bursts into 128 math units. */
export const S22: React.FC<ShotProps> = ({f, at}) => {
  const seed = 1 - ramp(f, 0, 8);
  const t = at(2, 14);
  const v = interpolate(f, [6, t + 2], [0, 128], {...CLAMP, easing: EASE_OUT});
  const gw = ALU.cols * (ALU.s + ALU.g) - ALU.g;
  const gh = ALU.rows * (ALU.s + ALU.g) - ALU.g;
  const x0 = 540 - gw / 2;
  const y0 = 690 - gh / 2;
  return (
    <AbsoluteFill>
      <Pos x={540} y={690} s={1 + 1.5 * (1 - seed)} o={seed}>
        <div style={{width: 96, height: 96, borderRadius: 18, background: C.apple}} />
      </Pos>
      {Array.from({length: ALU.cols * ALU.rows}, (_, i) => {
        const c = i % ALU.cols;
        const r = Math.floor(i / ALU.cols);
        const d = Math.hypot(c - (ALU.cols - 1) / 2, (r - (ALU.rows - 1) / 2) * 1.6);
        const k = pop(f, 4 + d * 0.9);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x0 + c * (ALU.s + ALU.g),
              top: y0 + r * (ALU.s + ALU.g),
              width: ALU.s,
              height: ALU.s,
              borderRadius: 9,
              background: 'linear-gradient(180deg, #4AA3FF, #0A84FF)',
              boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,.45), 0 6px 14px -8px rgba(10,132,255,.8)',
              transform: `scale(${k})`,
              opacity: Math.min(1, k * 1.3),
            }}
          />
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 930, display: 'flex', justifyContent: 'center', transform: `scale(${0.96 + 0.04 * pop(f, t + 2)})`}}>
        <Odometer value={v} digits={3} size={220} color={C.ink} />
      </div>
      <Pos x={540} y={1196} o={ramp(f, t, 12)}>
        <Text size={30} mono color={C.ink2}>
          128 math units = 1 Apple GPU core
        </Text>
      </Pos>
    </AbsoluteFill>
  );
};

const MINI = {cols: 8, rows: 16, s: 22, g: 6};

const MiniGrid: React.FC<{x: number; y: number; color: string; f: number; tagAt?: number}> = ({x, y, color, f, tagAt}) => {
  const gw = MINI.cols * (MINI.s + MINI.g) - MINI.g;
  const gh = MINI.rows * (MINI.s + MINI.g) - MINI.g;
  return (
    <>
      {Array.from({length: MINI.cols * MINI.rows}, (_, i) => {
        const c = i % MINI.cols;
        const r = Math.floor(i / MINI.cols);
        const tag = tagAt === undefined ? 0 : pop(f, tagAt + i * 0.19);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - gw / 2 + c * (MINI.s + MINI.g),
              top: y - gh / 2 + r * (MINI.s + MINI.g),
              width: MINI.s,
              height: MINI.s,
              borderRadius: 5,
              background: color,
              transform: `scale(${1 + 0.18 * tag})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: 7.5,
              color: '#fff',
            }}
          >
            {tag > 0.4 ? 'core' : ''}
          </div>
        );
      })}
    </>
  );
};

/** 2.3 "but NVIDIA counts every unit as a core.": same 128 units, one label vs 128 labels. */
export const S23: React.FC<ShotProps> = ({f, at}) => {
  const tagAt = at(2, 20);
  const right = ramp(f, 0, 12);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 539, top: 470, width: 2, height: 700, background: C.hair}} />
      <Pos x={300} y={470}>
        <Text size={28} weight={600} color={C.ink2} track="0.18em">
          APPLE
        </Text>
      </Pos>
      <Pos x={775} y={470} o={right}>
        <Text size={28} weight={600} color={C.ink2} track="0.18em">
          NVIDIA
        </Text>
      </Pos>
      <MiniGrid x={300} y={760} color={C.apple} f={f} />
      <div style={{position: 'absolute', left: 300 - 125, top: 760 - 237, width: 250, height: 474, borderRadius: 22, border: `3px solid ${C.apple}`, opacity: ramp(f, 4, 10)}} />
      <div style={{opacity: right, transform: `translateX(${(1 - right) * 40}px)`}}>
        <MiniGrid x={775} y={760} color={C.nvidia} f={f} tagAt={tagAt} />
      </div>
      <Pos x={300} y={1070} o={ramp(f, 6, 10)}>
        <Text size={58} weight={700} color={C.apple}>
          = 1 core
        </Text>
      </Pos>
      <Pos x={775} y={1070} o={ramp(f, at(2, 24) - 6, 10)}>
        <Text size={58} weight={700} color={C.nvidia}>
          = 128 cores
        </Text>
      </Pos>
      <Pos x={775} y={1130} o={ramp(f, at(2, 24) - 2, 10)}>
        <Text size={26} mono color={C.ink2}>
          {'"CUDA cores"'}
        </Text>
      </Pos>
    </AbsoluteFill>
  );
};

/** Bar heights: core totals (2.4) and FP32 TFLOPS (3.1), on one scale per chapter. */
const CORE_H = (n: number) => (n / 10752) * 600;
const TF_H = (n: number) => (n / 56) * 600;

/** 2.4 "So the totals are nearly identical.": the hook's bars come back level. */
export const S24: React.FC<ShotProps> = ({f, at}) => {
  const drop = interpolate(f, [0, 16], [2300, CORE_H(10752)], {...CLAMP, easing: EASE_OUT});
  const grow = settle(f, 6);
  const lv = interpolate(f, [6, at(2, 30)], [80, 10240], {...CLAMP, easing: EASE_OUT});
  const rv = interpolate(f, [0, 16], [10752, 10752], CLAMP);
  return (
    <AbsoluteFill>
      <Bar x={BARS.x[0]} h={mix(8, CORE_H(10240), grow)} color={C.apple}>
        <Text size={26} mono color={C.ink2}>
          80 × 128 =
        </Text>
        <Odometer value={lv} digits={5} size={64} color={C.apple} style={{marginTop: 6}} />
      </Bar>
      <Bar x={BARS.x[1]} h={drop} color={C.nvidia}>
        <Text size={26} mono color={C.ink2} style={{opacity: ramp(f, 10, 10)}}>
          84 × 128 =
        </Text>
        <Odometer value={rv} digits={5} size={64} color={C.nvidia} style={{marginTop: 6, opacity: ramp(f, 10, 10)}} />
      </Bar>
      <BarProducts f={f} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ 3 · design

/** 3.1 "So why is NVIDIA still more powerful?": the same bars re-grow as compute. */
export const S31: React.FC<ShotProps> = ({f}) => {
  const k = settle(f, 2);
  return (
    <AbsoluteFill>
      <Bar x={BARS.x[0]} h={mix(CORE_H(10240), TF_H(33), k)} color={C.apple}>
        <Text size={86} weight={700} color={C.apple}>
          {Math.round(mix(0, 33, k))}
        </Text>
        <Text size={26} mono color={C.ink2}>
          TFLOPS
        </Text>
      </Bar>
      <Bar x={BARS.x[1]} h={mix(CORE_H(10752), TF_H(56), k)} color={C.nvidia}>
        <Text size={86} weight={700} color={C.nvidia}>
          {Math.round(mix(0, 56, k))}
        </Text>
        <Text size={26} mono color={C.ink2}>
          TFLOPS
        </Text>
      </Bar>
      <BarProducts f={f} />
      <Pos x={540} y={1278} o={ramp(f, 10, 12)}>
        <Text size={22} mono color={C.ink3}>
          FP32 · M5 Ultra figure is a third-party estimate
        </Text>
      </Pos>
    </AbsoluteFill>
  );
};

/** 3.2 "They are built for opposite goals.": one axis, the two products pinned to opposite ends. */
export const S32: React.FC<ShotProps> = ({f, at}) => {
  const line = rampIO(f, 0, 14);
  const t = at(3, 11);
  const out = interpolate(f, [6, t], [0, 1], {...CLAMP, easing: EASE_OUT});
  const land = pop(f, t);
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <line x1={540 - 420 * line} y1={860} x2={540 + 360 * line} y2={860} stroke={C.ink} strokeOpacity={0.5} strokeWidth={3} strokeLinecap="round" />
        <circle cx={120} cy={860} r={12 * land} fill={C.nvidia} />
        <circle cx={900} cy={860} r={12 * land} fill={C.apple} />
      </svg>
      <Pos x={mix(540, 250, out)} y={720} s={0.9 + 0.1 * land}>
        <GpuCard w={300} uid="s32-gpu" angle={f * 14} blur={0.4} />
      </Pos>
      <Pos x={mix(540, 790, out)} y={720} s={0.9 + 0.1 * land}>
        <MacStudio w={250} uid="s32-mac" />
      </Pos>
      <div style={{position: 'absolute', left: 110, top: 900, opacity: ramp(f, t - 4, 10)}}>
        <Text size={44} weight={700}>
          MAX OUTPUT
        </Text>
      </div>
      <div style={{position: 'absolute', right: 180, top: 900, opacity: ramp(f, t - 4, 10)}}>
        <Text size={44} weight={700} style={{textAlign: 'right'}}>
          MAX EFFICIENCY
        </Text>
      </div>
    </AbsoluteFill>
  );
};

/** 4.1 "NVIDIA builds for maximum output,": fans at full tilt, gauge to 360 W. */
export const S41: React.FC<ShotProps> = ({f, at}) => {
  const spin = interpolate(f, [0, 30], [8, 34], CLAMP);
  const g = interpolate(f, [4, at(4, 4)], [0, 0.86], {...CLAMP, easing: EASE_OUT});
  const shake = rnd(f) * 2 - 1;
  return (
    <AbsoluteFill>
      <Pos x={540 + shake * 1.2 * g} y={620}>
        <GpuCard w={820} uid="s41-gpu" angle={f * spin} blur={lin(f, 0, 24, 0.3, 0.9)} />
      </Pos>
      <div style={{position: 'absolute', left: 0, right: 0, top: 900, display: 'flex', justifyContent: 'center'}}>
        <Gauge value={g} color={C.nvidia}>
          <Odometer value={g * (360 / 0.86)} digits={3} size={120} suffix={<span style={{fontSize: 56, marginLeft: 10, marginTop: 52}}>W</span>} />
        </Gauge>
      </div>
      <Pos x={540} y={1210} o={ramp(f, 8, 12)}>
        <Text size={28} mono color={C.ink2}>
          2.62 GHz boost
        </Text>
      </Pos>
    </AbsoluteFill>
  );
};

/** 4.2 "with a whole chip just for graphics.": x-ray to the die; all 84 SMs flood green. */
export const S42: React.FC<ShotProps> = ({f, at}) => {
  const xr = ramp(f, 0, 10);
  const zoom = rampIn(f, 8, 12);
  const dieIn = settle(f, 12);
  const flood = lin(f, at(4, 7) - 2, at(4, 7) + 22, 0, 1.4);
  return (
    <AbsoluteFill>
      <Pos x={540} y={620} s={1 + 3 * zoom} o={1 - zoom}>
        <GpuCard w={820} uid="s42-gpu" angle={f * 30} blur={0.9} xray={xr} />
      </Pos>
      <Pos x={540} y={760} s={mix(0.45, 1, dieIn)} o={Math.min(1, dieIn * 1.6)}>
        <NvidiaDie w={700} uid="s42-die" flood={flood} />
      </Pos>
      <Callout x={420} y={560} dx={40} dy={-170} run={40} label="Entire chip = GPU" sub="84 SMs · 378 mm²" k={ramp(f, at(4, 8), 16)} />
    </AbsoluteFill>
  );
};

/** 4.3 "Apple builds for efficiency,": calm, and the same gauge barely moves. */
export const S43: React.FC<ShotProps> = ({f, dur}) => {
  const g = interpolate(f, [4, dur], [0, 0.12], {...CLAMP, easing: EASE_OUT});
  return (
    <AbsoluteFill>
      <Pos x={540} y={620} s={mix(0.97, 1, settle(f, 0))}>
        <MacStudio w={700} uid="s43-mac" sweep={lin(f, 0, dur * 1.4, 0, 1)} />
      </Pos>
      <div style={{position: 'absolute', left: 0, right: 0, top: 900, display: 'flex', justifyContent: 'center'}}>
        <Gauge value={g} color={C.apple}>
          <Text size={26} mono color={C.ink2} style={{marginTop: 18}}>
            POWER
          </Text>
        </Gauge>
      </div>
      <Pos x={540} y={1215} o={ramp(f, 6, 12)}>
        <Text size={64} weight={700}>
          a fraction
        </Text>
      </Pos>
    </AbsoluteFill>
  );
};

/** 4.4 "sharing one chip with the CPU.": the M5 Ultra floor plan, labels land one by one. */
export const S44: React.FC<ShotProps> = ({f, at}) => {
  const t = at(4, 16);
  return (
    <AbsoluteFill>
      <Pos x={540} y={780} s={mix(0.94, 1, settle(f, 0))}>
        <AppleChip w={720} uid="s44-chip" plan={ramp(f, 2, 12)} label={1 - ramp(f, 0, 8)} />
      </Pos>
      <Callout x={430} y={540} dx={-40} dy={-170} run={-40} label="CPU" k={ramp(f, t, 14)} />
      <Callout x={742} y={700} dx={-20} dy={-330} run={-40} label="Neural Engine" k={ramp(f, t + 6, 14)} />
      <Callout x={458} y={900} dx={-60} dy={330} run={-40} label="GPU" color={C.apple} k={ramp(f, t + 12, 14)} />
      <Callout x={742} y={960} dx={20} dy={270} run={-40} label="Media" k={ramp(f, t + 18, 14)} />
      <Pos x={540} y={1290} o={ramp(f, 10, 12)}>
        <Text size={22} mono color={C.ink3}>
          illustrative layout
        </Text>
      </Pos>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ 4 · memory

/** 5.1 "But Apple's secret weapon is memory.": a single memory package rises; "Memory." */
export const S51: React.FC<ShotProps> = ({f, at}) => {
  const k = settle(f, 0);
  const t = at(5, 5);
  const word = interpolate(f, [t - 2, t + 10], [1, 0], {...CLAMP, easing: EASE_OUT});
  return (
    <AbsoluteFill>
      <Pos x={540} y={mix(780, 700, k)} o={Math.min(1, k * 1.4)}>
        <MemoryChip w={560} uid="s51-mem" sweep={lin(f, 8, 40, 0, 1)} />
      </Pos>
      <Pos x={540} y={960} o={ramp(f, 4, 12)}>
        <Text size={28} weight={600} color={C.ink2} track="0.2em">
          {"APPLE'S SECRET WEAPON"}
        </Text>
      </Pos>
      <div style={{position: 'absolute', left: 0, right: 0, top: 990, height: 240, overflow: 'hidden', display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: `translateY(${word * 100}%)`}}>
          <Text size={170} weight={800}>
            Memory.
          </Text>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** 5.2 "NVIDIA's best gaming card has thirty-two gigabytes.": x-ray of the 5090's own memory. */
export const S52: React.FC<ShotProps> = ({f, at}) => {
  const xr = ramp(f, 4, 12);
  const t = at(5, 11);
  const glow = ramp(f, t - 6, 10);
  const v = interpolate(f, [t - 4, t + 8], [0, 32], {...CLAMP, easing: EASE_OUT});
  return (
    <AbsoluteFill>
      <Pos x={540} y={620} s={mix(0.96, 1, settle(f, 0))}>
        <GpuCard w={820} uid="s52-gpu" label="GEFORCE RTX 5090" angle={f * 10} blur={0.5} xray={xr} mem={16} memGlow={glow} dieGlow={0.15 * glow} />
      </Pos>
      <div style={{position: 'absolute', left: 0, right: 0, top: 930, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 14, opacity: ramp(f, t - 6, 8)}}>
        <Odometer value={v} digits={2} size={170} color={C.nvidia} />
        <Text size={84} weight={700} color={C.nvidia} style={{marginBottom: 22}}>
          GB
        </Text>
      </div>
      <Pos x={540} y={1190} o={ramp(f, t, 10)}>
        <Text size={28} mono color={C.ink2}>
          RTX 5090 · its own memory
        </Text>
      </Pos>
    </AbsoluteFill>
  );
};

/** 5.3 "A Mac Studio can share up to five hundred and twelve.": one shared pool, then 512 GB vs 32 GB. */
export const S53: React.FC<ShotProps> = ({f, at}) => {
  const xr = ramp(f, 2, 12);
  const tB = at(5, 17);
  const toB = rampIO(f, tB - 6, 14);
  const grow = settle(f, tB);
  const v = interpolate(f, [tB, at(5, 23) + 2], [32, 512], {...CLAMP, easing: EASE_OUT});
  const dash = -f * 6;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - toB, transform: `scale(${1 - 0.1 * toB})`}}>
        <Pos x={540} y={700}>
          <MacStudio w={800} uid="s53-mac" xray={xr} led={1 - xr} />
        </Pos>
        <div style={{opacity: ramp(f, 8, 12)}}>
          <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
            <rect x={300} y={590} width={480} height={230} rx={34} fill={C.apple} fillOpacity={0.14} stroke={C.apple} strokeWidth={3} strokeDasharray="14 10" strokeDashoffset={dash} />
            <path d={`M 420 705 L 480 705`} stroke={C.apple} strokeWidth={4} strokeDasharray="8 8" strokeDashoffset={dash} />
            <path d={`M 600 705 L 660 705`} stroke={C.apple} strokeWidth={4} strokeDasharray="8 8" strokeDashoffset={-dash} />
          </svg>
          <Pos x={380} y={705}>
            <div style={{padding: '14px 22px', borderRadius: 16, background: C.ink, color: '#fff', fontFamily: SANS, fontWeight: 700, fontSize: 32}}>CPU</div>
          </Pos>
          <Pos x={540} y={705}>
            <div style={{width: 110, height: 110, borderRadius: 20, background: '#1A1B1E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: SANS, fontWeight: 600, fontSize: 22}}>M5 Ultra</div>
          </Pos>
          <Pos x={700} y={705}>
            <div style={{padding: '14px 22px', borderRadius: 16, background: C.apple, color: '#fff', fontFamily: SANS, fontWeight: 700, fontSize: 32}}>GPU</div>
          </Pos>
          <Pos x={540} y={880}>
            <Text size={34} weight={600} color={C.apple}>
              One shared pool of memory
            </Text>
          </Pos>
        </div>
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: toB}}>
        <Pos x={330} y={1000}>
          <GpuCard w={240} uid="s53-gpu" angle={f * 8} />
        </Pos>
        <div style={{position: 'absolute', left: 330 - 120, top: 1100 - 40}}>
          <Glass w={240} h={40} />
        </div>
        <Pos x={750} y={1100 - mix(40, 640, grow) - 80}>
          <MacStudio w={220} uid="s53-mac2" />
        </Pos>
        <div style={{position: 'absolute', left: 750 - 120, top: 1100 - mix(40, 640, grow)}}>
          <Glass w={240} h={mix(40, 640, grow)} tint="rgba(10,132,255,.10)" />
        </div>
        <Pos x={330} y={1160}>
          <Text size={48} weight={700} color={C.nvidia}>
            32 GB
          </Text>
        </Pos>
        <div style={{position: 'absolute', left: 750 - 200, width: 400, top: 1130, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 8}}>
          <Odometer value={v} digits={3} size={56} color={C.apple} />
          <Text size={48} weight={700} color={C.apple} style={{marginBottom: 2}}>
            GB
          </Text>
        </div>
        <Pos x={750} y={1215} o={ramp(f, tB + 10, 10)}>
          <Text size={24} mono color={C.ink2}>
            shared by CPU + GPU
          </Text>
        </Pos>
      </div>
    </AbsoluteFill>
  );
};

/** 6.1 "So AI models too big for any gaming card": the real table, then the 42.5 GB model overflows 32 GB. */
export const S61: React.FC<ShotProps> = ({f, at}) => {
  const win = settle(f, 0);
  const mark = interpolate(f, [8, 22], [0, 1], {...CLAMP, easing: EASE_OUT});
  const tLift = at(6, 3);
  const lift = rampIO(f, tLift - 4, 12);
  const tLand = at(6, 8);
  const fall = interpolate(f, [tLift + 4, tLand], [0, 1], {...CLAMP, easing: EASE_IN});
  const landed = f >= tLand;
  const shake = landed ? Math.sin((f - tLand) * 2.4) * 14 * Math.exp(-(f - tLand) / 6) : 0;
  const bad = ramp(f, tLand, 6);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, transform: `translateY(${-70 * lift}px) scale(${1 - 0.3 * lift})`, transformOrigin: '540px 620px'}}>
        <Pos x={540} y={mix(680, 640, win)} o={Math.min(1, win * 1.5)}>
          <div style={{width: 860, height: 420, borderRadius: 26, background: '#fff', boxShadow: SHADOW.lift, overflow: 'hidden', position: 'relative'}}>
            <div style={{height: 52, background: '#F2F2F4', borderBottom: '1px solid rgba(0,0,0,.08)', display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 22}}>
              {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
                <div key={c} style={{width: 15, height: 15, borderRadius: 8, background: c}} />
              ))}
              <div style={{marginLeft: 20, fontFamily: MONO, fontSize: 19, color: C.ink2}}>huggingface.co · Llama-3.3-70B-Instruct-GGUF</div>
            </div>
            <div style={{position: 'absolute', left: 14, top: 52, width: 846, height: 368, overflow: 'hidden'}}>
              <div style={{position: 'absolute', left: 0, top: 0, transform: 'scale(1.3)', transformOrigin: '0 0', marginTop: -330}}>
                <div style={{position: 'relative', width: 1265, height: 712}}>
                  <div style={{position: 'absolute', left: 14, top: 300, height: 74, width: 640 * mark, background: 'rgba(255,214,10,.45)', borderRadius: 6}} />
                  <Img src={staticFile('media/llama-size.jpg')} style={{position: 'absolute', inset: 0, width: 1265, height: 712, mixBlendMode: 'multiply'}} />
                </div>
              </div>
            </div>
          </div>
        </Pos>
      </div>
      <Pos x={540} y={mix(640, mix(640, 990 - 60, fall), lift)} o={lift} s={0.9 + 0.1 * lift}>
        <div
          style={{
            width: 330,
            height: 110,
            borderRadius: 22,
            background: `linear-gradient(180deg, ${C.model}, #8E3FBF)`,
            boxShadow: '0 24px 50px -20px rgba(175,82,222,.7)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            transform: `translateX(${shake}px)`,
          }}
        >
          <Text size={30} weight={700} color="#fff">
            Llama 3.3 70B
          </Text>
          <Text size={24} mono color="rgba(255,255,255,.85)">
            42.5 GB
          </Text>
        </div>
      </Pos>
      <div style={{position: 'absolute', left: 540 - 180, top: 960, opacity: lift}}>
        <Glass w={360} h={84} fill={landed ? 1 : 0} over={landed ? 40 * bad : 0} shake={shake} tint="rgba(118,185,0,.10)" />
      </div>
      <Pos x={540} y={1100} o={lift}>
        <Text size={28} mono color={C.ink2}>
          best gaming card · 32 GB
        </Text>
      </Pos>
      <Pos x={540} y={1190} o={bad}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <Mark kind="cross" size={64} k={bad} color={C.red} />
          <Text size={54} weight={700} color={C.red}>
            42.5 GB {'>'} 32 GB
          </Text>
        </div>
      </Pos>
    </AbsoluteFill>
  );
};

/** 6.2 "run on a Mac.": the model drops into the 512 GB pool with room to spare. */
export const S62: React.FC<ShotProps> = ({f, at}) => {
  const k = settle(f, 0);
  const fill = settle(f, 4) * (42.5 / 512);
  const ok = ramp(f, at(6, 12) - 2, 10);
  return (
    <AbsoluteFill>
      <Pos x={540} y={430} o={Math.min(1, k * 1.5)}>
        <MacStudio w={240} uid="s62-mac" />
      </Pos>
      <div style={{position: 'absolute', left: 540 - 150, top: 520, transform: `translateY(${(1 - k) * 60}px)`, opacity: Math.min(1, k * 1.5)}}>
        <Glass w={300} h={600} fill={fill} fillColor={C.model} tint="rgba(10,132,255,.10)" />
      </div>
      <Pos x={540} y={1120 - 50 - mix(380, 0, settle(f, 0))} o={1 - ramp(f, 4, 6)}>
        <div style={{width: 300, height: 100, borderRadius: 22, background: C.model}} />
      </Pos>
      <Pos x={540} y={1190} o={ok}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <Mark kind="check" size={64} k={ok} color={C.apple} />
          <Text size={54} weight={700}>
            Fits.
          </Text>
          <Text size={30} mono color={C.ink2} style={{marginTop: 10}}>
            ~470 GB to spare
          </Text>
        </div>
      </Pos>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ 5 · verdict

const CARD_TOP = {x: 140, y: 400, w: 800, h: 360};
const CARD_BOT = {x: 140, y: 800, w: 800, h: 360};

const Tag: React.FC<{children: React.ReactNode; dark?: boolean}> = ({children, dark}) => (
  <div
    style={{
      padding: '10px 18px',
      borderRadius: 14,
      background: dark ? 'rgba(255,255,255,.18)' : 'rgba(29,29,31,.07)',
      color: dark ? '#fff' : C.ink,
      fontFamily: SANS,
      fontWeight: 600,
      fontSize: 28,
      letterSpacing: '-0.01em',
    }}
  >
    {children}
  </div>
);

const FerrariCard: React.FC<{f: number; m: number}> = ({f, m}) => {
  // m = 0: full-bleed jolt; m = 1: the card.
  const x = mix(0, CARD_TOP.x, m);
  const y = mix(0, CARD_TOP.y, m);
  const w = mix(W, CARD_TOP.w, m);
  const h = mix(H, CARD_TOP.h, m);
  const carX = interpolate(f, [0, 14], [-1100, 0], {...CLAMP, easing: EASE_OUT});
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 40 * m, overflow: 'hidden', background: 'linear-gradient(160deg, #E2231A, #8B0A10)', boxShadow: SHADOW.card}}>
      {Array.from({length: 14}, (_, i) => {
        const yy = (rnd(i + 3) * 0.8 + 0.1) * h;
        const len = 200 + rnd(i + 9) * 500;
        const xx = ((f * (40 + rnd(i) * 40) + rnd(i + 1) * 2000) % (w + len)) - len;
        return <div key={i} style={{position: 'absolute', top: yy, left: w - xx, width: len, height: 3, borderRadius: 2, background: 'rgba(255,255,255,.35)'}} />;
      })}
      <div style={{position: 'absolute', left: w / 2, top: h / 2 + 20 * (1 - m), transform: `translate(-50%, -50%) translateX(${carX}px) scale(${mix(1.5, 0.9, m)})`}}>
        <SuperCar w={600} uid="ferrari" wheel={f * 40} />
      </div>
      <div style={{position: 'absolute', left: 30, bottom: 26, display: 'flex', gap: 12, opacity: ramp(m * 20, 12, 8)}}>
        <Tag dark>Speed: insane</Tag>
        <Tag dark>Trunk: tiny</Tag>
      </div>
      <div style={{position: 'absolute', right: 30, top: 24, opacity: ramp(m * 20, 12, 8)}}>
        <Text size={30} weight={700} color="#fff">
          NVIDIA
        </Text>
      </div>
    </div>
  );
};

const TruckCard: React.FC<{f: number; k: number; open: number}> = ({f, k, open}) => (
  <div
    style={{
      position: 'absolute',
      left: CARD_BOT.x,
      top: CARD_BOT.y + (1 - k) * 80,
      width: CARD_BOT.w,
      height: CARD_BOT.h,
      borderRadius: 40,
      overflow: 'hidden',
      background: '#FFFFFF',
      boxShadow: SHADOW.card,
      opacity: Math.min(1, k * 1.4),
    }}
  >
    <div style={{position: 'absolute', left: 400, top: 170, transform: 'translate(-50%, -50%)'}}>
      <BoxTruck w={560} uid="truck" open={open} />
    </div>
    <div style={{position: 'absolute', left: 30, bottom: 26, display: 'flex', gap: 12}}>
      <Tag>Space: massive</Tag>
      <Tag>Built for the load</Tag>
    </div>
    <div style={{position: 'absolute', right: 30, top: 24}}>
      <Text size={30} weight={700}>
        Apple
      </Text>
    </div>
    <div style={{position: 'absolute', inset: 0, background: `rgba(255,255,255,${0.15 * Math.sin(f / 8) ** 2})`}} />
  </div>
);

/** 7.1 "NVIDIA is a Ferrari,": the one full-bleed colour jolt, which then settles into a card. */
export const S71: React.FC<ShotProps> = ({f, at}) => {
  const m = rampIO(f, at(7, 3) + 2, 14);
  return (
    <AbsoluteFill>
      <FerrariCard f={f} m={m} />
    </AbsoluteFill>
  );
};

/** 7.2 "and Apple is a moving truck.": the truck card slides in; its box opens on a full load. */
export const S72: React.FC<ShotProps> = ({f, at}) => (
  <AbsoluteFill>
    <FerrariCard f={f + 60} m={1} />
    <TruckCard f={f} k={settle(f, 0)} open={ramp(f, at(7, 8), 14)} />
  </AbsoluteFill>
);

/** 7.3 "Send this to someone who thinks more cores means faster.": back to frame 0 for a seamless loop. */
export const S73: React.FC<ShotProps> = ({f, dur}) => {
  const back = rampIO(f, 0, 14);
  const cta = ramp(f, 8, 12) * (1 - ramp(f, dur - 18, 10));
  const plane = interpolate(f, [24, 50], [0, 1], {...CLAMP, easing: EASE_IN});
  const end = ramp(f, dur - 14, 12);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - back, transform: `scale(${1 - 0.15 * back})`, transformOrigin: '540px 780px'}}>
        <FerrariCard f={f + 120} m={1} />
        <TruckCard f={f} k={1} open={1} />
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: back}}>
        <TwoUpProducts f={f} labels={end} s={mix(0.9, 1, back)} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: cta}}>
        <Text size={64} weight={700}>
          Send this to someone
        </Text>
        <Text size={64} weight={700} style={{marginTop: 8}}>
          who thinks <span style={{color: C.apple}}>more cores</span> = faster
        </Text>
      </div>
      <Pos
        x={mix(540, 1000, plane)}
        y={mix(640, 1490, plane)}
        s={mix(1, 0.5, plane)}
        r={mix(0, 30, plane)}
        o={ramp(f, 14, 8) * (1 - ramp(f, 48, 4))}
      >
        <PlaneIcon size={110} color={C.apple} />
      </Pos>
      <Headline k={end} />
    </AbsoluteFill>
  );
};
