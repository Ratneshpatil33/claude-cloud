import React, {useMemo} from 'react';
import * as THREE from 'three';
import {P} from '@video/kit';
import type {V3} from './studio';
import {Chip, GREEN, GREEN_HI, XRay, canvasTex} from './xray';

/*
 * Pieces shared by the style frames and the one-take: memory fills, the rack's GPU wall, glass boundaries, the
 * exploded DDR4 stick, and the canvas textures shown on the MacBook's display.
 */

export const RED = '#FF3B30';

/** Pi 5 parts that stay solid in its x-ray: the LPDDR4X package and the SoC. */
export const PI_RAM = 'OBJ4366';
export const PI_SOC = 'OBJ1936';

/** The rack's opened band (m above the floor): its parts ghost, the 8 GPU boards stand inside. */
export const BAND: [number, number] = [0.86, 1.36];

/** A green fill laid on top of a real chip (the memory package filling with weights). */
export const Fill: React.FC<{top: V3; size: V3; fill: number; over?: boolean; k?: number}> = ({top, size, fill, over, k = 1}) => {
  const w = size[0] * 0.96;
  const d = size[2] * 0.96;
  const f = Math.max(0.001, Math.min(1, fill));
  if (k <= 0.001) return null;
  return (
    <group position={[top[0], top[1] + 0.0003, top[2]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <meshBasicMaterial color="#0E3B22" transparent opacity={0.55 * k} toneMapped={false} />
      </mesh>
      <mesh position={[-w / 2 + (w * f) / 2, 0.0002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * f, d]} />
        <meshBasicMaterial color={over ? RED : GREEN_HI} transparent opacity={k} toneMapped={false} />
      </mesh>
      <lineSegments position={[0, 0.0003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(w * 1.08, d * 1.08)]} />
        <lineBasicMaterial color={over ? RED : GREEN} transparent opacity={k} toneMapped={false} />
      </lineSegments>
    </group>
  );
};

/** HBM3 fill 0..1 per GPU (8 values) or one value for all; `lit` 0..8 = how many GPUs' stacks are outlined. */
export const GpuWall: React.FC<{fill: number | number[]; lit?: number; k?: number}> = ({fill, lit = 8, k = 1}) => (
  // 8 SXM modules on the HGX baseboard, standing in the opened band facing the front
  <group position={[0, (BAND[0] + BAND[1]) / 2, 0.5]} scale={0.6 + 0.4 * k} visible={k > 0.01}>
    <mesh position={[0, 0, -0.02]}>
      <boxGeometry args={[0.66, 0.44, 0.01]} />
      <meshStandardMaterial color="#0F2A19" roughness={0.55} metalness={0.2} />
    </mesh>
    {Array.from({length: 8}, (_, i) => {
      const x = -0.24 + (i % 4) * 0.16;
      const y = i < 4 ? 0.1 : -0.1;
      const f = Array.isArray(fill) ? fill[i] : fill;
      const g = Math.max(0, Math.min(1, lit - i));
      return (
        <group key={i} position={[x, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <Chip p={[0, 0, 0]} s={[0.062, 0.008, 0.062]} label="H100" sub="80 GB" />
          {Array.from({length: 6}, (_, j) => (
            <Chip key={j} p={[(j < 3 ? -1 : 1) * 0.043, 0, -0.024 + (j % 3) * 0.024]} s={[0.018, 0.009, 0.02]} label="HBM3" fill={f} glow={g} />
          ))}
        </group>
      );
    })}
  </group>
);

// ---------------------------------------------------------------- a glass boundary (dome) with hairline rings

const DOME_V = /* glsl */ `
varying vec3 vN; varying vec3 vV;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const DOME_F = /* glsl */ `
uniform vec3 color; uniform float opacity;
varying vec3 vN; varying vec3 vV;
void main() {
  float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.5);
  gl_FragColor = vec4(color, (0.03 + 0.5 * f) * opacity);
}`;

/**
 * A hairline glass dome over a device (a "nothing leaves this" boundary). `k` 0..1 grows it up from the floor ring;
 * `pulse` 0..1 flashes its edge (where a token stops).
 */
export const Dome: React.FC<{p: V3; r: number; k: number; color?: string; squash?: number}> = ({p, r, k, color = GREEN, squash = 1}) => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: DOME_V,
        fragmentShader: DOME_F,
        uniforms: {color: {value: new THREE.Color(color)}, opacity: {value: 0}},
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [color],
  );
  const rings = useMemo(() => {
    const out: THREE.BufferGeometry[] = [];
    // latitude rings (y = r sin a) and four meridians
    for (const a of [0, 0.35, 0.75, 1.15]) {
      const pts = Array.from({length: 97}, (_, i) => {
        const u = (i / 96) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(u) * r * Math.cos(a), r * Math.sin(a), Math.sin(u) * r * Math.cos(a));
      });
      out.push(new THREE.BufferGeometry().setFromPoints(pts));
    }
    for (const m of [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4]) {
      const pts = Array.from({length: 65}, (_, i) => {
        const a = (i / 64) * Math.PI;
        return new THREE.Vector3(Math.cos(a) * r * Math.cos(m), Math.sin(a) * r, Math.cos(a) * r * Math.sin(m));
      });
      out.push(new THREE.BufferGeometry().setFromPoints(pts));
    }
    return out;
  }, [r]);
  if (k <= 0.001) return null;
  mat.uniforms.opacity.value = k;
  const e = 1 - Math.pow(1 - Math.min(1, k), 3);
  return (
    <group position={p} scale={[1, e * squash, 1]}>
      <mesh material={mat} renderOrder={3}>
        <sphereGeometry args={[r, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      {rings.map((g, i) => (
        <line key={i}>
          <primitive object={g} attach="geometry" />
          <lineBasicMaterial color={color} transparent opacity={(i === 0 ? 0.9 : 0.35) * k} toneMapped={false} depthWrite={false} />
        </line>
      ))}
    </group>
  );
};

// ---------------------------------------------------------------- the exploded DDR4 stick (scene 5)

/**
 * One real DDR4 DIMM (model: Crucial 8 GB), x-rayable, with a fill bar over its row of DRAM chips. `fill` 0..1 in
 * red = out of memory. Placed at `p` (its bottom centre), turned by `ry`, scaled by `s`.
 */
export const Dimm: React.FC<{obj: THREE.Object3D; p: V3; ry: number; s: number; fill: number; glow: number}> = ({obj, p, ry, s, fill, glow}) => {
  const f = Math.max(0.001, Math.min(1, fill));
  const W = 0.114;
  const H = 0.0125;
  return (
    <group position={p} rotation={[0, ry, 0]} scale={s}>
      <XRay obj={obj} k={0} glow={{names: ['Storage'], k: glow, color: RED}} />
      {fill > 0.001 && (
        <group position={[0.0019, 0.0168, 0.0024]}>
          <mesh position={[-W / 2 + (W * f) / 2, 0, 0]}>
            <planeGeometry args={[W * f, H]} />
            <meshBasicMaterial color={RED} transparent opacity={0.85} toneMapped={false} />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[new THREE.PlaneGeometry(W * 1.03, H * 1.25)]} />
            <lineBasicMaterial color={RED} toneMapped={false} />
          </lineSegments>
        </group>
      )}
    </group>
  );
};

// ---------------------------------------------------------------- display textures (MacBook screen)

const SCREEN_W = 1600;
const SCREEN_H = 1000;

/** "yours?" typed on the display (n characters), with a blinking cursor; the model's wallpaper dimmed behind. */
export const wordTex = (word: string, n: number, blink: number, wallpaper: CanvasImageSource | null) =>
  canvasTex(`word-${word}-${n}-${blink}`, SCREEN_W, SCREEN_H, (g) => {
    g.fillStyle = '#07090D';
    g.fillRect(0, 0, SCREEN_W, SCREEN_H);
    if (wallpaper) {
      g.globalAlpha = 0.16;
      g.drawImage(wallpaper, 0, 0, SCREEN_W, SCREEN_H);
      g.globalAlpha = 1;
    }
    g.font = `700 300px ${P.display}`;
    g.textBaseline = 'middle';
    const x0 = 800 - g.measureText('yours?').width / 2; // the word stays put when the "?" is deleted
    const typed = word.slice(0, n);
    g.fillStyle = '#FFFFFF';
    g.fillText(typed, x0, 500);
    if (!blink) {
      g.fillStyle = GREEN_HI;
      g.fillRect(x0 + g.measureText(typed).width + 14, 360, 22, 280);
    }
  });

/** Regions of a page screenshot (source x, y, w, h) drawn one under the other, each scaled to the display's width. */
export type Crop = [number, number, number, number];

/** A web page screenshot on the display (dark browser chrome), zoomed so its title reads; scrolled by `y` px. */
export const pageTex = (key: string, img: CanvasImageSource & {width: number; height: number}, crops: Crop[], y = 0) =>
  canvasTex(`page-${key}-${Math.round(y)}`, SCREEN_W, SCREEN_H, (g) => {
    g.fillStyle = '#0B0F19';
    g.fillRect(0, 0, SCREEN_W, SCREEN_H);
    let top = 96 - y;
    for (const [sx, sy, sw, sh] of crops) {
      const s = (SCREEN_W - 80) / sw;
      g.drawImage(img, sx, sy, sw, sh, 40, top, sw * s, sh * s);
      top += sh * s + 24;
    }
    g.fillStyle = '#1A1F2B';
    g.fillRect(0, 0, SCREEN_W, 64);
    ['#FF5F57', '#FEBC2E', '#28C840'].forEach((c, i) => {
      g.fillStyle = c;
      g.beginPath();
      g.arc(40 + i * 34, 32, 11, 0, Math.PI * 2);
      g.fill();
    });
    g.fillStyle = '#2A3040';
    g.fillRect(260, 16, 1080, 34);
    g.fillStyle = '#9AA3B5';
    g.font = `500 22px ${P.text}`;
    g.fillText('huggingface.co', 290, 41);
  });

const CODE = [
  ['def', ' tokenize', '(src: str) -> list[Token]:'],
  ['    ', '"""Split source into tokens."""', ''],
  ['    out', ' = ', '[]'],
  ['    for', ' m ', 'in PATTERN.finditer(src):'],
  ['        kind', ' = ', 'm.lastgroup'],
  ['        if', ' kind == ', '"WS": continue'],
  ['        out', '.append(', 'Token(kind, m.group()))'],
  ['    return', ' out', ''],
  ['', '', ''],
  ['def', ' parse', '(tokens: list[Token]) -> Node:'],
  ['    ', '# local model: suggestions never leave this laptop', ''],
  ['    p', ' = ', 'Parser(tokens)'],
  ['    tree', ' = ', 'p.expression()'],
  ['    p', '.expect(', '"EOF")'],
  ['    return', ' tree', ''],
];

/** A code editor on the display; `n` lines typed so far, the last one with a green ghost suggestion. */
export const codeTex = (n: number) =>
  canvasTex(`code-${n}`, SCREEN_W, SCREEN_H, (g) => {
    g.fillStyle = '#0D1117';
    g.fillRect(0, 0, SCREEN_W, SCREEN_H);
    g.fillStyle = '#161B22';
    g.fillRect(0, 0, SCREEN_W, 64);
    g.fillStyle = '#C9D1D9';
    g.font = `600 24px ${P.text}`;
    g.fillText('parser.py', 40, 41);
    g.fillStyle = GREEN_HI;
    g.font = `600 22px ${P.text}`;
    g.fillText('● local model', SCREEN_W - 230, 41);
    g.font = '500 40px Menlo, monospace';
    CODE.slice(0, n).forEach(([a, b, c], i) => {
      const y = 140 + i * 56;
      g.fillStyle = '#4B5563';
      g.fillText(String(i + 1).padStart(2, ' '), 24, y);
      let x = 110;
      [
        [a, '#FF7B72'],
        [b, '#D2A8FF'],
        [c, '#C9D1D9'],
      ].forEach(([s, col]) => {
        g.fillStyle = i === n - 1 ? GREEN_HI : col;
        g.globalAlpha = i === n - 1 ? 0.75 : 1;
        g.fillText(s, x, y);
        x += g.measureText(s).width;
      });
      g.globalAlpha = 1;
    });
  });
