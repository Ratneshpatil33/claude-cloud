import {useCurrentFrame} from 'remotion';
import {GPU, fanAngle, fanSpeed, hsl, hueAt, rgbOn} from '../timeline';
import {Fan} from './Fan';
import {RgbRing} from './RgbRing';

const {w: W, h: H} = GPU;
const FAN_R = 76;
const FAN_X = [98, 280, 462];
const FAN_Y = H / 2;

const SHROUD = `M 18 0 L ${W - 18} 0 L ${W} 18 L ${W} ${H - 18} L ${W - 18} ${H} L 18 ${H} L 0 ${H - 18} L 0 18 Z`;
const FACEPLATE = `M 26 8 L ${W - 26} 8 L ${W - 8} 26 L ${W - 8} ${H - 26} L ${W - 26} ${H - 8} L 26 ${H - 8} L 8 ${H - 26} L 8 26 Z`;

/** Graphics card seen face-on (as on a vertical mount), in local coordinates. */
export const Gpu: React.FC = () => {
  const frame = useCurrentFrame();
  const speed = fanSpeed(frame);
  const spin = fanAngle(frame, 12.5);

  // Hue/activation use the installed position, so the card joins the case's
  // light wave seamlessly.
  const hueFor = (x: number, y = FAN_Y) => hueAt(frame, GPU.x + x, GPU.y + y);
  const onFor = (x: number) => rgbOn(frame, GPU.x + x);

  const edgeOn = onFor(W / 2);

  return (
    <g>
      <defs>
        <linearGradient id="gpu-shroud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a4e58" />
          <stop offset="0.5" stopColor="#2c2f36" />
          <stop offset="1" stopColor="#1a1c21" />
        </linearGradient>
        <linearGradient id="gpu-face" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2b2e35" />
          <stop offset="1" stopColor="#17181c" />
        </linearGradient>
        <linearGradient id="gpu-bracket" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9a9ea7" />
          <stop offset="0.5" stopColor="#d9dce1" />
          <stop offset="1" stopColor="#8e929b" />
        </linearGradient>
        <linearGradient id="gpu-edge" x1="0" y1="0" x2={W} y2="0" gradientUnits="userSpaceOnUse">
          {[0, 0.25, 0.5, 0.75, 1].map((o) => (
            <stop key={o} offset={o} stopColor={hsl(hueFor(o * W, 0), 100, 62)} />
          ))}
        </linearGradient>
      </defs>

      {/* I/O bracket */}
      <rect x={-18} y={-16} width={18} height={H + 32} rx={3} fill="url(#gpu-bracket)" />
      {[30, 80, 130].map((y) => (
        <rect key={y} x={-13} y={y} width={8} height={36} rx={4} fill="#3b3e45" />
      ))}

      {/* Card thickness / backplate edge */}
      <path d={SHROUD} transform="translate(5 7)" fill="#0b0b0d" />

      {/* Shroud */}
      <path d={SHROUD} fill="url(#gpu-shroud)" stroke="#5a5e69" strokeWidth={1.5} />
      <path d={FACEPLATE} fill="url(#gpu-face)" />

      {/* Angular accents between the fans */}
      {[189, 371].map((x) => (
        <g key={x}>
          <path
            d={`M ${x - 9} 24 L ${x + 9} 24 L ${x + 4} ${H / 2} L ${x + 9} ${H - 24} L ${x - 9} ${H - 24} L ${x - 4} ${H / 2} Z`}
            fill="#30333b"
            stroke="#454954"
          />
          <rect
            x={x - 1.5}
            y={44}
            width={3}
            height={H - 88}
            rx={1.5}
            fill={hsl(hueFor(x), 100, 64)}
            opacity={onFor(x)}
            filter="url(#glow)"
          />
        </g>
      ))}

      {/* Light bars along the top and bottom edges */}
      {[11, H - 11].map((y) => (
        <g key={y}>
          <rect x={44} y={y - 2} width={W - 88} height={4} rx={2} fill="#33363e" />
          <rect
            x={44}
            y={y - 2}
            width={W - 88}
            height={4}
            rx={2}
            fill="url(#gpu-edge)"
            opacity={edgeOn}
            filter="url(#glow)"
          />
        </g>
      ))}

      {/* Fans; the middle one spins the opposite way, like real cards */}
      {FAN_X.map((x, i) => (
        <g key={x}>
          <circle cx={x} cy={FAN_Y} r={FAN_R + 8} fill="#0b0b0d" stroke="#555963" strokeWidth={1.5} />
          <RgbRing
            cx={x}
            cy={FAN_Y}
            r={FAN_R + 4}
            width={4}
            hue={hueFor(x)}
            on={onFor(x)}
            segments={32}
          />
          <Fan
            cx={x}
            cy={FAN_Y}
            r={FAN_R}
            angle={(i === 1 ? -spin : spin) + i * 13}
            hue={hueFor(x)}
            on={onFor(x)}
            speed={speed}
            variant="gpu"
          />
        </g>
      ))}
    </g>
  );
};
