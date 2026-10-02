import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {CaseBack, CaseFront} from './components/PcCase';
import {Gpu} from './components/Gpu';
import {FONT_FAMILY} from './fonts';
import {CASE, GPU, HEIGHT, T, WIDTH, hsl, hueAt, power} from './timeline';

const OFF_WHITE = '#F4F1EA';
const INK = '#1C1B1A';
const MUTED = '#8A8478';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.inOut(Easing.cubic);

const GPU_CENTER = {
  x: CASE.x + GPU.x + GPU.w / 2,
  y: CASE.y + GPU.y + GPU.h / 2,
};

const GPU_SPRING = {damping: 13, stiffness: 80, mass: 0.9};
const GPU_SPRING_FRAMES = 32;

/** Frame at which the GPU first reaches its slot (for the "seated" pulse). */
const gpuLandFrame = (fps: number) => {
  for (let f = 0; f < 90; f++) {
    if (spring({frame: f, fps, config: GPU_SPRING, durationInFrames: GPU_SPRING_FRAMES}) >= 0.995) {
      return T.gpuIn + f;
    }
  }
  return T.gpuIn + 30;
};

const useCamera = (frame: number) => {
  const keys = [0, 150, T.pushIn, T.pushIn + 56, T.pullBack, T.pullBack + 40];
  const opts = {...clamp, easing: ease};
  const scale = interpolate(frame, keys, [0.9, 0.98, 0.98, 1.72, 1.8, 0.84], opts);
  const fx = interpolate(frame, keys, [960, 960, 960, GPU_CENTER.x, GPU_CENTER.x, 1300], opts);
  const fy = interpolate(frame, keys, [528, 528, 528, GPU_CENTER.y - 10, GPU_CENTER.y - 10, 530], opts);
  return {scale, fx, fy};
};

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = power(frame);

  // Case entrance
  const caseIn = spring({frame, fps, config: {damping: 18, stiffness: 70}});
  const caseY = interpolate(caseIn, [0, 1], [90, 0]);

  // Side panel slides off, then back on
  const panelOut = interpolate(frame, [T.panelOff, T.panelOff + 22], [0, 1], {...clamp, easing: ease});
  const panelBack = interpolate(frame, [T.panelOn, T.panelOn + 24], [0, 1], {...clamp, easing: ease});
  const panelT = panelOut * (1 - panelBack);
  const panelX = panelT * 640;
  const panelOpacity = 1 - panelT;

  // GPU flies in from the upper right and settles into place
  const g = spring({frame: frame - T.gpuIn, fps, config: GPU_SPRING, durationInFrames: GPU_SPRING_FRAMES});
  const lift = 1 - Math.min(1, g);
  const gpuX = GPU.x + interpolate(g, [0, 1], [760, 0]);
  const gpuY = GPU.y + interpolate(g, [0, 1], [-560, 0]);
  const gpuRot = interpolate(g, [0, 1], [-16, 0]);
  const gpuScale = interpolate(g, [0, 1], [1.28, 1]);
  const gpuOpacity = interpolate(frame, [T.gpuIn, T.gpuIn + 8], [0, 1], clamp);

  const land = gpuLandFrame(fps);
  const pulse = interpolate(frame, [land, land + 16], [0, 1], clamp);
  const shake = frame >= land && frame < land + 8 ? Math.sin((frame - land) * 2.6) * (8 - (frame - land)) * 0.5 : 0;

  // Light thrown onto the off-white backdrop and floor
  const haloHue = hueAt(frame, CASE.w / 2, CASE.h / 2);

  return (
    <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{overflow: 'visible'}}>
      <defs>
        <filter id="glow" x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="b2" />
          <feMerge>
            <feMergeNode in="b2" />
            <feMergeNode in="b1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="soft" x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id="shadow" x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="22" />
        </filter>
        <filter id="gpu-shadow" x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation={8 + lift * 18} />
        </filter>
        <radialGradient id="halo">
          <stop offset="0" stopColor={hsl(haloHue, 95, 62, 0.22)} />
          <stop offset="0.55" stopColor={hsl(haloHue + 60, 95, 62, 0.08)} />
          <stop offset="1" stopColor={hsl(haloHue + 120, 95, 62, 0)} />
        </radialGradient>
        <radialGradient id="floor-glow">
          <stop offset="0" stopColor={hsl(haloHue - 40, 100, 60, 0.45)} />
          <stop offset="1" stopColor={hsl(haloHue - 40, 100, 60, 0)} />
        </radialGradient>
      </defs>

      <g transform={`translate(${shake} ${caseY})`} opacity={caseIn}>
        {/* RGB halo spilling onto the backdrop */}
        <circle cx={CASE.x + CASE.w / 2} cy={CASE.y + CASE.h / 2} r={760} fill="url(#halo)" opacity={p} />

        {/* Floor shadow and colored floor spill */}
        <ellipse
          cx={CASE.x + CASE.w / 2}
          cy={CASE.y + CASE.h + 22}
          rx={560}
          ry={34}
          fill="rgba(40, 32, 22, 0.32)"
          filter="url(#shadow)"
        />
        <ellipse cx={CASE.x + CASE.w / 2} cy={CASE.y + CASE.h + 24} rx={720} ry={70} fill="url(#floor-glow)" opacity={p} />
        <ellipse
          cx={CASE.x + CASE.w / 2}
          cy={CASE.y + CASE.h + 16}
          rx={430}
          ry={8}
          fill="rgba(20, 16, 12, 0.45)"
          filter="url(#soft)"
        />

        <g transform={`translate(${CASE.x} ${CASE.y})`}>
          <CaseBack />

          {/* GPU drop shadow (grows and softens while the card is lifted) */}
          <g opacity={gpuOpacity * 0.7}>
            <rect
              x={gpuX + 10 + lift * 70}
              y={gpuY + 16 + lift * 90}
              width={GPU.w}
              height={GPU.h}
              rx={18}
              fill="#000"
              opacity={1 - lift * 0.6}
              filter="url(#gpu-shadow)"
            />
          </g>

          <g
            opacity={gpuOpacity}
            transform={`translate(${gpuX + GPU.w / 2} ${gpuY + GPU.h / 2}) rotate(${gpuRot}) scale(${gpuScale}) translate(${-GPU.w / 2} ${-GPU.h / 2})`}
          >
            <Gpu />
          </g>

          {/* "Seated" pulse */}
          {pulse > 0 && pulse < 1 ? (
            <rect
              x={GPU.x - pulse * 18}
              y={GPU.y - pulse * 18}
              width={GPU.w + pulse * 36}
              height={GPU.h + pulse * 36}
              rx={20 + pulse * 10}
              fill="none"
              stroke="#ffffff"
              strokeWidth={3}
              opacity={(1 - pulse) * 0.7}
            />
          ) : null}

          <CaseFront panelX={panelX} panelOpacity={panelOpacity} />
        </g>
      </g>
    </svg>
  );
};

const STEPS = [
  {n: '01', label: 'Open the side panel', from: 16, to: 54},
  {n: '02', label: 'Seat the graphics card', from: 54, to: 128},
  {n: '03', label: 'Power on', from: 128, to: 170},
  {n: '04', label: 'Light it up', from: 170, to: T.pullBack},
];

const StepCaption: React.FC = () => {
  const frame = useCurrentFrame();
  const step = STEPS.find((s) => frame >= s.from && frame < s.to);
  if (!step) {
    return null;
  }
  const local = frame - step.from;
  const left = step.to - frame;
  const inT = interpolate(local, [0, 10], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const outT = interpolate(left, [0, 8], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const opacity = Math.min(inT, outT);
  const lit = power(frame);
  const dotColor = lit > 0 ? hsl(hueAt(frame, 0, 0), 95, 58) : '#B9B3A7';

  return (
    <div
      style={{
        position: 'absolute',
        left: 72,
        bottom: 72,
        opacity,
        transform: `translateY(${(1 - inT) * 18}px)`,
        display: 'flex',
        alignItems: 'center',
        gap: 22,
        padding: '20px 30px 20px 24px',
        background: 'rgba(250, 248, 243, 0.94)',
        borderRadius: 18,
        boxShadow: '0 12px 40px rgba(40, 32, 20, 0.12), 0 1px 0 rgba(255,255,255,0.8) inset',
        border: '1px solid rgba(28, 27, 26, 0.06)',
      }}
    >
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: 7,
          background: dotColor,
          boxShadow: lit > 0 ? `0 0 16px ${dotColor}` : 'none',
        }}
      />
      <div style={{fontSize: 22, fontWeight: 500, color: MUTED, letterSpacing: 2}}>{step.n}</div>
      <div style={{fontSize: 38, fontWeight: 700, color: INK, letterSpacing: -0.5}}>{step.label}</div>
    </div>
  );
};

const BrandMark: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [6, 22], [0, 1], clamp);
  const lit = power(frame);
  return (
    <div
      style={{
        position: 'absolute',
        top: 64,
        left: 72,
        opacity,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: 8,
        color: INK,
      }}
    >
      <svg width={26} height={24} viewBox="0 0 26 24">
        <path
          d="M13 2 L24 22 L2 22 Z"
          fill="none"
          stroke={lit > 0 ? hsl(hueAt(frame), 95, 55) : INK}
          strokeWidth={3}
          strokeLinejoin="round"
        />
      </svg>
      AURORA
    </div>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const local = frame - T.endCard;
  if (local < 0) {
    return null;
  }
  const rise = (delay: number) => {
    const t = interpolate(local, [delay, delay + 18], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
    return {opacity: t, transform: `translateY(${(1 - t) * 28}px)`};
  };
  const barW = interpolate(local, [14, 44], [0, 300], {...clamp, easing: Easing.out(Easing.cubic)});
  const h = hueAt(frame);

  return (
    <div
      style={{
        position: 'absolute',
        left: 1150,
        top: 0,
        bottom: 0,
        width: 700,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div style={{...rise(0), fontSize: 22, fontWeight: 500, letterSpacing: 6, color: MUTED}}>
        AURORA X9 GRAPHICS
      </div>
      <div
        style={{
          ...rise(5),
          fontSize: 112,
          fontWeight: 700,
          lineHeight: 1.0,
          letterSpacing: -3,
          color: INK,
          marginTop: 22,
        }}
      >
        Built
        <br />
        to glow.
      </div>
      <div
        style={{
          height: 8,
          width: barW,
          borderRadius: 4,
          marginTop: 34,
          background: `linear-gradient(90deg, ${[0, 1, 2, 3, 4, 5].map((i) => hsl(h - i * 60, 95, 58)).join(', ')})`,
          boxShadow: `0 6px 24px ${hsl(h - 120, 95, 58, 0.45)}`,
        }}
      />
      <div style={{...rise(12), fontSize: 32, fontWeight: 500, color: '#55514A', marginTop: 34, lineHeight: 1.35}}>
        Next-gen graphics.
        <br />
        Every color, in sync.
      </div>
    </div>
  );
};

export const GpuRgbCase: React.FC = () => {
  const frame = useCurrentFrame();
  const {scale, fx, fy} = useCamera(frame);
  const fadeOut = interpolate(frame, [348, 359], [1, 0], clamp);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: OFF_WHITE,
        backgroundImage: `radial-gradient(ellipse at 50% 45%, #F8F6F0 0%, ${OFF_WHITE} 55%, #ECE7DC 100%)`,
        fontFamily: `${FONT_FAMILY}, sans-serif`,
        overflow: 'hidden',
      }}
    >
      <AbsoluteFill style={{opacity: fadeOut}}>
        <AbsoluteFill
          style={{
            transformOrigin: '0 0',
            transform: `translate(${WIDTH / 2}px, ${HEIGHT / 2}px) scale(${scale}) translate(${-fx}px, ${-fy}px)`,
          }}
        >
          <Scene />
        </AbsoluteFill>
        <BrandMark />
        <StepCaption />
        <EndCard />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
