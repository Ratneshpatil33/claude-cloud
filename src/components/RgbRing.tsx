import {hsl} from '../timeline';

type RgbRingProps = {
  cx: number;
  cy: number;
  r: number;
  width: number;
  hue: number;
  on: number;
  segments?: number;
  hueSpan?: number;
  lightness?: number;
  glow?: boolean;
};

/**
 * A ring of LEDs drawn as short arc segments, each with its own hue, so the
 * ring shows a rotating rainbow (SVG has no conic gradients).
 */
export const RgbRing: React.FC<RgbRingProps> = ({
  cx,
  cy,
  r,
  width,
  hue,
  on,
  segments = 28,
  hueSpan = 360,
  lightness = 60,
  glow = true,
}) => {
  const arcs = [];
  for (let i = 0; i < segments; i++) {
    // Slight overlap between segments hides anti-aliasing seams.
    const a0 = (i / segments) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / segments) * Math.PI * 2 - Math.PI / 2 + 0.03;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    arcs.push(
      <path
        key={i}
        d={`M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`}
        stroke={hsl(hue + (i / segments) * hueSpan, 100, lightness)}
        strokeWidth={width}
        fill="none"
      />,
    );
  }

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        stroke="#2a2b31"
        strokeWidth={width}
        fill="none"
      />
      {on > 0 ? (
        <g opacity={on} filter={glow ? 'url(#glow)' : undefined}>
          {arcs}
        </g>
      ) : null}
    </g>
  );
};
