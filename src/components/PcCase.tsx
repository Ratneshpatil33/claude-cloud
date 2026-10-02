import {interpolate, useCurrentFrame} from 'remotion';
import {CASE, GPU, T, fanAngle, fanSpeed, hsl, hueAt, power, rgbOn, sweepX} from '../timeline';
import {Fan} from './Fan';
import {RgbRing} from './RgbRing';

const {w: W, h: H} = CASE;
// Inner edge of the glass window.
const WIN = {x: 18, y: 18, w: W - 36, h: H - 36};
const SHROUD_Y = 640;
const FRONT_FANS = [165, 340, 515];
const FRONT_FAN_X = 800;
const REAR_FAN = {x: 118, y: 150};
const FAN_R = 70;
const RAM_X = [498, 514, 530, 546];
const PUMP = {x: 395, y: 200};

// Strips are drawn as rects rather than <line>s: a line has a zero-height
// bounding box, which collapses the glow filter region and hides it.
const bar = (x1: number, y1: number, x2: number, y2: number, width: number, t: number) => {
  const vertical = x1 === x2;
  return vertical
    ? {x: x1 - width / 2, y: y1, width, height: (y2 - y1) * t, rx: width / 2}
    : {x: x1, y: y1 - width / 2, width: Math.max(width, (x2 - x1) * t), height: width, rx: width / 2};
};

/** An LED strip that lights up progressively as the power-on sweep passes. */
const LedStrip: React.FC<{
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
}> = ({id, x1, y1, x2, y2, width}) => {
  const frame = useCurrentFrame();
  const vertical = x1 === x2;
  // Horizontal strips are revealed left to right by the sweep; vertical
  // strips light all at once when the sweep reaches them.
  const lit = vertical
    ? rgbOn(frame, x1)
    : Math.min(1, Math.max(0, (sweepX(frame) - x1) / (x2 - x1)));
  const stops = [0, 0.2, 0.4, 0.6, 0.8, 1];

  return (
    <g>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
          {stops.map((o) => (
            <stop
              key={o}
              offset={o}
              stopColor={hsl(hueAt(frame, x1 + (x2 - x1) * o, y1 + (y2 - y1) * o), 100, 62)}
            />
          ))}
        </linearGradient>
      </defs>
      <rect {...bar(x1, y1, x2, y2, width, 1)} fill="#24252b" />
      {lit > 0 ? (
        <rect
          {...bar(x1, y1, x2, y2, width, vertical ? 1 : lit)}
          fill={`url(#${id})`}
          opacity={vertical ? lit : 1}
          filter="url(#glow)"
        />
      ) : null}
    </g>
  );
};

/** Everything behind the GPU: chassis, motherboard, cooling, PSU shroud. */
export const CaseBack: React.FC = () => {
  const frame = useCurrentFrame();
  const speed = fanSpeed(frame);
  const spin = fanAngle(frame, 11);
  const p = power(frame);

  const pumpHue = hueAt(frame, PUMP.x, PUMP.y);
  const pumpOn = rgbOn(frame, PUMP.x);

  return (
    <g>
      <defs>
        <linearGradient id="case-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2e2f35" />
          <stop offset="1" stopColor="#141519" />
        </linearGradient>
        <radialGradient id="case-interior" cx="0.45" cy="0.4" r="0.8">
          <stop offset="0" stopColor="#17181d" />
          <stop offset="1" stopColor="#0a0a0d" />
        </radialGradient>
        <linearGradient id="shroud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f2026" />
          <stop offset="1" stopColor="#111216" />
        </linearGradient>
        <linearGradient id="ram-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2d3038" />
          <stop offset="0.5" stopColor="#3d414b" />
          <stop offset="1" stopColor="#24262c" />
        </linearGradient>
        <pattern id="honeycomb" width="14" height="24" patternUnits="userSpaceOnUse">
          <path d="M7 0 L14 4 L14 12 L7 16 L0 12 L0 4 Z" fill="#0a0a0c" transform="scale(0.8) translate(1.5 1)" />
          <path d="M0 16 L7 20 L7 28 L0 32 L-7 28 L-7 20 Z" fill="#0a0a0c" transform="scale(0.8) translate(1.5 -2)" />
          <path d="M14 16 L21 20 L21 28 L14 32 L7 28 L7 20 Z" fill="#0a0a0c" transform="scale(0.8) translate(1.5 -2)" />
        </pattern>
      </defs>

      {/* Chassis */}
      <rect x={0} y={0} width={W} height={H} rx={22} fill="url(#case-body)" />
      <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} rx={10} fill="url(#case-interior)" />

      {/* Rear expansion slot covers */}
      {Array.from({length: 7}, (_, i) => (
        <g key={i}>
          <rect x={40} y={300 + i * 42} width={66} height={34} rx={3} fill="#1b1c21" stroke="#26272d" />
          {[0, 1, 2].map((j) => (
            <rect key={j} x={52 + j * 17} y={311 + i * 42} width={10} height={12} rx={2} fill="#0b0b0d" />
          ))}
        </g>
      ))}

      {/* Motherboard */}
      <rect x={215} y={55} width={385} height={490} rx={6} fill="#15171c" stroke="#24272e" strokeWidth={2} />
      {[
        'M 240 330 L 300 330 L 320 350 L 470 350',
        'M 240 345 L 290 345 L 310 365 L 480 365',
        'M 480 90 L 480 300 L 470 310',
        'M 560 60 L 560 200',
        'M 250 300 L 250 520',
        'M 590 330 L 590 530',
      ].map((d) => (
        <path key={d} d={d} stroke="#1f2229" strokeWidth={2} fill="none" />
      ))}
      <text
        x={262}
        y={308}
        fontFamily="Space Grotesk, sans-serif"
        fontWeight={700}
        fontSize={13}
        letterSpacing={4}
        fill="#2a2d35"
      >
        AURORA Z9
      </text>

      {/* PCIe slots (visible before the GPU arrives) */}
      {[
        [272, 424, 300],
        [272, 482, 300],
        [272, 540, 220],
      ].map(([x, y, w]) => (
        <rect key={y} x={x} y={y} width={w} height={10} rx={2} fill="#0b0c0e" stroke="#5f636d" strokeWidth={1.5} />
      ))}

      {/* M.2 heatsink */}
      <rect x={285} y={318} width={180} height={24} rx={4} fill="#2a2d34" stroke="#383b44" />
      {Array.from({length: 9}, (_, i) => (
        <line key={i} x1={300 + i * 18} y1={322} x2={292 + i * 18} y2={338} stroke="#1d1f24" strokeWidth={2} />
      ))}

      {/* VRM heatsinks */}
      <rect x={272} y={68} width={196} height={32} rx={4} fill="#2b2e35" stroke="#3a3d46" />
      {Array.from({length: 11}, (_, i) => (
        <line key={i} x1={284 + i * 17} y1={72} x2={284 + i * 17} y2={96} stroke="#1c1e23" strokeWidth={3} />
      ))}
      <rect x={272} y={110} width={34} height={170} rx={4} fill="#2b2e35" stroke="#3a3d46" />

      {/* Rear I/O cover with its own light strip */}
      <path d="M 215 62 L 262 62 L 262 250 L 240 270 L 215 270 Z" fill="#23262d" stroke="#30333b" />
      <LedStrip id="io-led" x1={252} y1={84} x2={252} y2={236} width={4} />

      {/* RAM */}
      {RAM_X.map((x) => {
        const on = rgbOn(frame, x);
        const hue = hueAt(frame, x, 100);
        return (
          <g key={x}>
            <rect x={x} y={100} width={12} height={190} rx={2} fill="url(#ram-body)" />
            <rect x={x} y={100} width={12} height={20} rx={2} fill="#2a2b31" />
            {on > 0 ? (
              <>
                <rect x={x} y={100} width={12} height={20} rx={2} fill={hsl(hue, 100, 66)} opacity={on} filter="url(#glow)" />
                <rect x={x} y={120} width={12} height={34} fill={hsl(hue, 100, 60, 0.25 * on)} />
              </>
            ) : null}
          </g>
        );
      })}

      {/* 24-pin connector and sleeved cable */}
      <rect x={580} y={215} width={18} height={90} rx={2} fill="#0c0c0e" stroke="#2a2b30" />
      <rect x={598} y={222} width={30} height={76} fill="#1a1b1f" />
      {Array.from({length: 12}, (_, i) => (
        <line key={i} x1={598} y1={225 + i * 6} x2={628} y2={225 + i * 6} stroke="#2a2b31" strokeWidth={2} />
      ))}

      {/* Cable grommets */}
      <rect x={626} y={90} width={22} height={110} rx={11} fill="#09090b" stroke="#24252a" strokeWidth={2} />
      <rect x={626} y={218} width={22} height={100} rx={11} fill="#09090b" stroke="#24252a" strokeWidth={2} />

      {/* Rear exhaust fan */}
      <Fan
        cx={REAR_FAN.x}
        cy={REAR_FAN.y}
        r={FAN_R}
        angle={spin + 17}
        hue={hueAt(frame, REAR_FAN.x, REAR_FAN.y)}
        on={rgbOn(frame, REAR_FAN.x)}
        speed={speed}
        variant="case"
      />

      {/* Front intake fans */}
      {FRONT_FANS.map((y, i) => (
        <Fan
          key={y}
          cx={FRONT_FAN_X}
          cy={y}
          r={FAN_R}
          angle={spin + i * 23}
          hue={hueAt(frame, FRONT_FAN_X, y)}
          on={rgbOn(frame, FRONT_FAN_X)}
          speed={speed}
          variant="case"
        />
      ))}

      {/* AIO tubes from the pump to the front radiator */}
      {[
        'M 440 238 C 470 330, 600 352, 722 340',
        'M 452 218 C 490 316, 610 330, 722 318',
      ].map((d) => (
        <g key={d}>
          <path d={d} stroke="#0d0d10" strokeWidth={13} fill="none" strokeLinecap="round" />
          <path d={d} stroke="#2c2d34" strokeWidth={2} fill="none" transform="translate(0 -3)" />
        </g>
      ))}

      {/* AIO pump with infinity-mirror rings */}
      <circle cx={PUMP.x} cy={PUMP.y} r={62} fill="#1b1c21" stroke="#3a3c44" strokeWidth={2} />
      <circle cx={PUMP.x} cy={PUMP.y} r={54} fill="#08080a" />
      <RgbRing cx={PUMP.x} cy={PUMP.y} r={48} width={4} hue={pumpHue} on={pumpOn} segments={30} />
      {[40, 33, 27, 22].map((r, i) => (
        <circle
          key={r}
          cx={PUMP.x}
          cy={PUMP.y}
          r={r}
          fill="none"
          stroke={hsl(pumpHue + 40 * (i + 1), 100, 62)}
          strokeWidth={2.4 - i * 0.4}
          opacity={pumpOn * (0.7 - i * 0.15)}
        />
      ))}
      <circle cx={PUMP.x} cy={PUMP.y} r={16} fill="#121317" stroke="#3a3c44" />
      <path
        d={`M ${PUMP.x} ${PUMP.y - 8} L ${PUMP.x + 7} ${PUMP.y + 5} L ${PUMP.x - 7} ${PUMP.y + 5} Z`}
        fill="none"
        stroke={pumpOn > 0 ? hsl(pumpHue, 60, 85) : '#6d717b'}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* PSU shroud */}
      <rect x={WIN.x} y={SHROUD_Y} width={WIN.w} height={H - WIN.y - SHROUD_Y} fill="url(#shroud)" />
      <rect x={640} y={SHROUD_Y + 30} width={240} height={110} rx={6} fill="url(#honeycomb)" opacity={0.9} />
      <text
        x={300}
        y={SHROUD_Y + 98}
        textAnchor="middle"
        fontFamily="Space Grotesk, sans-serif"
        fontWeight={700}
        fontSize={34}
        letterSpacing={16}
        fill="#24262c"
      >
        AURORA
      </text>

      {/* Colored light pooling on the shroud beneath the GPU */}
      <ellipse
        cx={GPU.x + GPU.w / 2}
        cy={SHROUD_Y + 6}
        rx={GPU.w / 2 + 40}
        ry={26}
        fill={hsl(hueAt(frame, GPU.x + GPU.w / 2, GPU.y + GPU.h), 100, 60)}
        opacity={0.35 * p}
        filter="url(#soft)"
      />
      <LedStrip id="shroud-led" x1={36} y1={SHROUD_Y + 2} x2={W - 36} y2={SHROUD_Y + 2} width={4} />
      <LedStrip id="top-led" x1={36} y1={30} x2={W - 36} y2={30} width={4} />

      {/* Short white flash when the system powers on */}
      <rect
        x={WIN.x}
        y={WIN.y}
        width={WIN.w}
        height={WIN.h}
        rx={10}
        fill="#ffffff"
        opacity={interpolate(frame, [T.powerOn - 2, T.powerOn + 2, T.powerOn + 16], [0, 0.12, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })}
      />
    </g>
  );
};

/** Everything in front of the GPU: ambient light, glass, front strip, button. */
export const CaseFront: React.FC<{panelX: number; panelOpacity: number}> = ({
  panelX,
  panelOpacity,
}) => {
  const frame = useCurrentFrame();
  const p = power(frame);
  const gpuHue = hueAt(frame, GPU.x + GPU.w / 2, GPU.y + GPU.h / 2);
  const frontHue = hueAt(frame, FRONT_FAN_X, 340);
  const buttonGlow = interpolate(frame, [T.powerOn - 10, T.powerOn - 4], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <g>
      <defs>
        <clipPath id="window-clip">
          <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} rx={10} />
        </clipPath>
        <radialGradient id="ambient-gpu">
          <stop offset="0" stopColor={hsl(gpuHue, 100, 60, 0.3)} />
          <stop offset="1" stopColor={hsl(gpuHue, 100, 60, 0)} />
        </radialGradient>
        <radialGradient id="ambient-front">
          <stop offset="0" stopColor={hsl(frontHue, 100, 60, 0.28)} />
          <stop offset="1" stopColor={hsl(frontHue, 100, 60, 0)} />
        </radialGradient>
        <linearGradient id="glass-streak" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.09" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="screw" cx="0.35" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#f2f3f5" />
          <stop offset="1" stopColor="#7d818a" />
        </radialGradient>
      </defs>

      {/* Colored light filling the interior */}
      <g clipPath="url(#window-clip)" opacity={p} style={{mixBlendMode: 'screen'}}>
        <circle cx={GPU.x + GPU.w / 2} cy={GPU.y + GPU.h / 2} r={420} fill="url(#ambient-gpu)" />
        <circle cx={FRONT_FAN_X} cy={340} r={360} fill="url(#ambient-front)" />
      </g>

      {/* Tempered glass side panel */}
      <g transform={`translate(${panelX} 0)`} opacity={panelOpacity}>
        <rect x={12} y={12} width={W - 24} height={H - 24} rx={13} fill="rgba(210, 220, 235, 0.05)" stroke="rgba(255,255,255,0.16)" strokeWidth={2} />
        <g clipPath="url(#window-clip)">
          <polygon points={`150,0 330,0 70,${H} -110,${H}`} fill="url(#glass-streak)" />
          <polygon points={`380,0 430,0 170,${H} 120,${H}`} fill="url(#glass-streak)" />
        </g>
        {[
          [34, 34],
          [W - 34, 34],
          [34, H - 34],
          [W - 34, H - 34],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={7} fill="url(#screw)" />
        ))}
      </g>

      {/* Front panel light strip */}
      <LedStrip id="front-led" x1={W - 8} y1={60} x2={W - 8} y2={H - 60} width={5} />

      {/* Power button on the top edge */}
      <rect x={W - 92} y={-7} width={44} height={9} rx={4} fill="#1d1e23" />
      <rect
        x={W - 88}
        y={-6}
        width={36}
        height={5}
        rx={2.5}
        fill={p > 0 ? hsl(hueAt(frame, W, 0), 100, 70) : '#ffffff'}
        opacity={buttonGlow}
        filter="url(#glow)"
      />

      {/* Feet */}
      <rect x={70} y={H - 4} width={120} height={22} rx={6} fill="#111215" />
      <rect x={W - 190} y={H - 4} width={120} height={22} rx={6} fill="#111215" />
    </g>
  );
};
