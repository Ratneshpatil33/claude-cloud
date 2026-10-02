import {hsl} from '../timeline';
import {RgbRing} from './RgbRing';

type FanProps = {
  cx: number;
  cy: number;
  r: number;
  angle: number;
  hue: number;
  on: number;
  speed: number;
  variant: 'case' | 'gpu';
};

const bladePath = (r: number) => {
  const p = (x: number, y: number) => `${(x * r).toFixed(2)} ${(y * r).toFixed(2)}`;
  return [
    `M ${p(0.3, -0.06)}`,
    `C ${p(0.55, -0.22)} ${p(0.8, -0.34)} ${p(0.93, -0.3)}`,
    `Q ${p(1.0, -0.14)} ${p(0.95, 0.03)}`,
    `C ${p(0.7, 0.02)} ${p(0.45, 0.12)} ${p(0.3, 0.1)}`,
    'Z',
  ].join(' ');
};

export const Fan: React.FC<FanProps> = ({
  cx,
  cy,
  r,
  angle,
  hue,
  on,
  speed,
  variant,
}) => {
  const isCase = variant === 'case';
  const blades = isCase ? 9 : 11;
  const blade = bladePath(r);
  const hub = r * 0.3;
  const bladeOpacity = 1 - 0.45 * speed;

  return (
    <g>
      {isCase ? (
        <>
          <rect
            x={cx - r - 9}
            y={cy - r - 9}
            width={2 * r + 18}
            height={2 * r + 18}
            rx={14}
            fill="#17181c"
            stroke="#26272d"
            strokeWidth={2}
          />
          {[
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1],
          ].map(([sx, sy]) => (
            <circle
              key={`${sx}${sy}`}
              cx={cx + sx * (r - 2)}
              cy={cy + sy * (r - 2)}
              r={4}
              fill="#0b0b0d"
              stroke="#2c2d33"
            />
          ))}
        </>
      ) : null}

      {/* Opening behind the blades */}
      <circle cx={cx} cy={cy} r={r + 1} fill="#08080a" />

      {/* Case fans have the LED ring on the frame, behind the blades */}
      {isCase ? (
        <RgbRing cx={cx} cy={cy} r={r - 3} width={6} hue={hue} on={on} />
      ) : null}

      {/* Motion blur disc that fades in as the fan spins up */}
      <circle
        cx={cx}
        cy={cy}
        r={r * 0.95}
        fill={
          isCase
            ? hsl(hue + 40, 85, 70, 0.22 * speed * on)
            : `rgba(120, 124, 135, ${0.16 * speed})`
        }
      />

      <g transform={`rotate(${angle} ${cx} ${cy})`} opacity={bladeOpacity}>
        {Array.from({length: blades}, (_, i) => (
          <g key={i} transform={`translate(${cx} ${cy}) rotate(${(i * 360) / blades})`}>
            <path
              d={blade}
              fill={isCase ? 'rgba(46, 48, 56, 0.95)' : '#1c1d22'}
              stroke={isCase ? 'rgba(90, 92, 102, 0.6)' : '#30323a'}
              strokeWidth={1.2}
            />
            {isCase && on > 0 ? (
              // Frosted blades pick up the color of the LEDs
              <path d={blade} fill={hsl(hue + 30, 90, 72, 0.5 * on)} />
            ) : null}
          </g>
        ))}
      </g>

      {/* Hub */}
      <circle cx={cx} cy={cy} r={hub} fill="#141519" stroke="#2b2c33" strokeWidth={2} />
      {isCase ? (
        <circle
          cx={cx}
          cy={cy}
          r={hub * 0.72}
          fill={on > 0 ? hsl(hue + 60, 95, 66, 0.9 * on) : '#1d1e23'}
          filter={on > 0 ? 'url(#glow)' : undefined}
        />
      ) : (
        <g transform={`rotate(${angle} ${cx} ${cy})`}>
          <circle cx={cx} cy={cy} r={hub * 0.78} fill="#1f2026" stroke="#3a3c45" />
          <path
            d={`M ${cx} ${cy - hub * 0.42} L ${cx + hub * 0.38} ${cy + hub * 0.3} L ${cx - hub * 0.38} ${cy + hub * 0.3} Z`}
            fill="none"
            stroke="#8b8f99"
            strokeWidth={2.2}
            strokeLinejoin="round"
          />
        </g>
      )}
      {isCase ? <circle cx={cx} cy={cy} r={hub * 0.32} fill="#101114" /> : null}
    </g>
  );
};
