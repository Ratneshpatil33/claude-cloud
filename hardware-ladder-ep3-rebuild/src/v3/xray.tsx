import React, {useMemo} from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {rnd} from '@video/kit';
import type {V3} from './studio';

/*
 * The technical language of look v3: devices turn x-ray (frosted shell + hairline edges) to expose their memory
 * chips; model weights are streams / blocks of green numbers that fill the chips.
 */

export const GREEN = '#00C853';
export const GREEN_HI = '#3DFF8F';
export const GRAPHITE = '#23272E';

// ---------------------------------------------------------------- textures (deterministic, cached per page)

const texCache = new Map<string, THREE.CanvasTexture>();
export const canvasTex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const hit = texCache.get(key);
  if (hit) return hit;
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  draw(cv.getContext('2d') as CanvasRenderingContext2D);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  texCache.set(key, t);
  return t;
};

const num = (s: number) => {
  const v = (rnd(s) - 0.5) * 2.4;
  return (v < 0 ? '−' : ' ') + Math.abs(v).toFixed(2);
};

/** A sheet of weight values (green monospace on transparent), tileable. */
export const weightsTex = (key = 'w', color = GREEN) => {
  const t = canvasTex(`weights-${key}-${color}`, 1024, 1024, (g) => {
    g.font = '600 30px Menlo, monospace';
    g.fillStyle = color;
    for (let r = 0; r < 28; r++)
      for (let c = 0; c < 8; c++) {
        g.globalAlpha = 0.35 + 0.65 * rnd(r * 13.1 + c * 7.7 + key.length);
        g.fillText(num(r * 31.7 + c * 3.3 + key.length * 11), 8 + c * 128, 32 + r * 36.5);
      }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

/** Atlas of 64 short weight tokens for the point-sprite streams (8 × 8 cells). */
const tokenAtlas = () =>
  canvasTex('tokens', 1024, 1024, (g) => {
    g.font = '700 44px Menlo, monospace';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = '#FFFFFF';
    for (let i = 0; i < 64; i++) g.fillText(num(i * 9.13 + 1).trim(), (i % 8) * 128 + 64, Math.floor(i / 8) * 128 + 64);
  });

// ---------------------------------------------------------------- x-ray

const XRAY_V = /* glsl */ `
varying vec3 vN; varying vec3 vV;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const XRAY_F = /* glsl */ `
uniform vec3 color; uniform float opacity;
varying vec3 vN; varying vec3 vV;
void main() {
  float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2);
  gl_FragColor = vec4(color, (0.05 + 0.75 * f) * opacity);
}`;

type Built = {solid: THREE.Object3D; ghost: THREE.Object3D; solidMats: THREE.Material[]; ghostMat: THREE.ShaderMaterial; lineMat: THREE.LineBasicMaterial};

const edgeCache = new Map<string, THREE.EdgesGeometry>();

const build = (obj: THREE.Object3D, tint: string, paint?: (m: THREE.MeshStandardMaterial) => void): Built => {
  const solid = obj.clone(true);
  const solidMats: THREE.Material[] = [];
  solid.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    const mats = (Array.isArray(m.material) ? m.material : [m.material]).map((mt) => {
      const c = mt.clone();
      // the model's own transparency (e.g. a laptop's screen glass), which the x-ray fade multiplies
      c.userData.base = {opacity: c.opacity, transparent: c.transparent, depthWrite: c.depthWrite};
      if (paint && (c as THREE.MeshStandardMaterial).isMeshStandardMaterial) paint(c as THREE.MeshStandardMaterial);
      solidMats.push(c);
      return c;
    });
    m.material = Array.isArray(m.material) ? mats : mats[0];
  });
  const ghostMat = new THREE.ShaderMaterial({
    vertexShader: XRAY_V,
    fragmentShader: XRAY_F,
    uniforms: {color: {value: new THREE.Color(tint)}, opacity: {value: 0}},
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const lineMat = new THREE.LineBasicMaterial({color: tint, transparent: true, opacity: 0, depthWrite: false});
  const ghost = obj.clone(true);
  ghost.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    m.material = ghostMat;
    m.castShadow = false;
    let e = edgeCache.get(m.geometry.uuid);
    if (!e) {
      e = new THREE.EdgesGeometry(m.geometry, 28);
      edgeCache.set(m.geometry.uuid, e);
    }
    m.add(new THREE.LineSegments(e, lineMat));
  });
  return {solid, ghost, solidMats, ghostMat, lineMat};
};

/** Light the solid materials whose name is in `names` (e.g. a memory package) with an emissive colour, k 0..1. */
export type Glow = {names: string[]; k: number; color?: string};

/**
 * A model that turns x-ray: k = 0 solid, 1 = frosted ghost with hairline edges. `glow` lights named materials of the
 * solid layer (per frame, without rebuilding the model).
 */
/** Show a texture on a named mesh (a laptop's display), unlit so it glows; `map: null` restores the model's own. */
export type Screen = {name: string; map: THREE.Texture | null};

export const XRay: React.FC<{obj: THREE.Object3D; k: number; tint?: string; p?: V3; r?: V3; s?: number; paint?: (m: THREE.MeshStandardMaterial) => void; glow?: Glow; screen?: Screen; lines?: number}> = ({
  obj,
  k,
  tint = GRAPHITE,
  p,
  r,
  s,
  paint,
  glow,
  screen,
  lines = 1,
}) => {
  const b = useMemo(() => build(obj, tint, paint), [obj, tint, paint]);
  // drawn a hair in front of the display mesh, so it never z-fights the glass or bezel around it
  const screenMat = useMemo(() => new THREE.MeshBasicMaterial({toneMapped: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -4}), []);
  if (screen) {
    b.solid.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || o.name !== screen.name) return;
      if (!m.userData.own) m.userData.own = m.material;
      if (screen.map) {
        if (screenMat.map !== screen.map) {
          screenMat.map = screen.map;
          screenMat.needsUpdate = true; // a map added to a material needs its program rebuilt
        }
        m.material = screenMat;
      } else m.material = m.userData.own;
    });
  }
  const solidO = Math.max(0, 1 - k * 1.15);
  b.solidMats.forEach((m) => {
    const base = m.userData.base as {opacity: number; transparent: boolean; depthWrite: boolean};
    m.transparent = base.transparent || solidO < 0.999;
    m.opacity = base.opacity * solidO;
    m.depthWrite = base.depthWrite && solidO > 0.5;
    const sm = m as THREE.MeshStandardMaterial;
    if (glow && sm.isMeshStandardMaterial && glow.names.includes(m.name)) {
      sm.emissive.set(glow.color ?? GREEN_HI);
      sm.emissiveIntensity = 1.6 * glow.k;
      sm.toneMapped = glow.k < 0.01;
    }
  });
  // a replaced display fades with the rest of the shell
  screenMat.transparent = solidO < 0.999;
  screenMat.opacity = solidO;
  screenMat.depthWrite = solidO > 0.5;
  b.solid.visible = solidO > 0.01;
  b.solid.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).castShadow = solidO > 0.5;
  });
  b.ghostMat.uniforms.opacity.value = k;
  b.lineMat.opacity = 0.55 * k * lines; // `lines` < 1 for dense CAD (perforated panels) whose edges would read as a dark mesh
  b.ghost.visible = k > 0.01;
  return (
    <group position={p} rotation={r} scale={s}>
      <primitive object={b.solid} />
      <primitive object={b.ghost} />
    </group>
  );
};

// ---------------------------------------------------------------- memory chip

const chipLabel = (label: string, sub: string) =>
  canvasTex(`chip-${label}-${sub}`, 512, 256, (g) => {
    g.fillStyle = '#1B1E23';
    g.fillRect(0, 0, 512, 256);
    g.fillStyle = '#C9CED6';
    g.font = '700 64px Menlo, monospace';
    g.fillText(label, 28, 110);
    g.fillStyle = '#7E8591';
    g.font = '600 40px Menlo, monospace';
    g.fillText(sub, 28, 184);
  });

/**
 * A memory package (BGA / PSRAM / HBM stack): graphite body with a printed top; `fill` 0..1 lights it green from the
 * left as weights load, `glow` adds a green outline.
 */
export const Chip: React.FC<{p: V3; s: V3; label: string; sub?: string; fill?: number; glow?: number; r?: V3; over?: boolean}> = ({p, s, label, sub = '', fill = 0, glow = 0, r, over}) => {
  const [w, h, d] = s;
  const geo = useMemo(() => new RoundedBoxGeometry(w, h, d, 2, Math.min(w, h, d) * 0.12), [w, h, d]);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(w * 1.02, h * 1.02, d * 1.02)), [w, h, d]);
  const c = over ? '#FF3B30' : GREEN_HI;
  return (
    <group position={p} rotation={r}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshPhysicalMaterial color="#1B1E23" roughness={0.38} metalness={0.2} clearcoat={0.6} clearcoatRoughness={0.3} />
      </mesh>
      <mesh position={[0, h / 2 + 0.0004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 0.92, d * 0.92]} />
        <meshBasicMaterial map={chipLabel(label, sub)} toneMapped={false} />
      </mesh>
      {fill > 0.001 && (
        <mesh position={[-w * 0.46 + (w * 0.92 * Math.min(1, fill)) / 2, h / 2 + 0.0008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[w * 0.92 * Math.min(1, fill), d * 0.92]} />
          <meshBasicMaterial color={c} transparent opacity={0.82} toneMapped={false} />
        </mesh>
      )}
      {glow > 0.001 && (
        <lineSegments geometry={edges}>
          <lineBasicMaterial color={over ? '#FF3B30' : GREEN} transparent opacity={glow} toneMapped={false} />
        </lineSegments>
      )}
    </group>
  );
};

// ---------------------------------------------------------------- weight streams

const PTS_V = /* glsl */ `
attribute float cell; attribute float alpha; attribute float size;
varying float vCell; varying float vA;
uniform float scale;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vCell = cell; vA = alpha;
  gl_PointSize = size * scale / -mv.z;
  gl_Position = projectionMatrix * mv;
}`;
const PTS_F = /* glsl */ `
uniform sampler2D atlas; uniform vec3 color;
varying float vCell; varying float vA;
void main() {
  float cx = mod(vCell, 8.0); float cy = floor(vCell / 8.0);
  vec2 uv = vec2((cx + gl_PointCoord.x) / 8.0, 1.0 - (cy + gl_PointCoord.y) / 8.0);
  float a = texture2D(atlas, uv).a * vA;
  if (a < 0.02) discard;
  gl_FragColor = vec4(color, a);
}`;

/**
 * Weight tokens ("0.42", "−1.07"…) flowing along an arc from `from` to `to`. `k` 0..1 fades the stream; `t` (s)
 * animates it; `h` is the viewport height in px (point sizes are in px at 1 m).
 */
export const WeightStream: React.FC<{from: V3; to: V3; k: number; t: number; h: number; n?: number; arc?: number; spread?: number; size?: number; speed?: number; seed?: number; color?: string}> = ({
  from,
  to,
  k,
  t,
  h,
  n = 16,
  arc = 0.25,
  spread = 0.0,
  size = 0.02,
  speed = 0.45,
  seed = 1,
  color = GREEN,
}) => {
  const curve = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const m = a.clone().lerp(b, 0.5);
    m.y += arc;
    return new THREE.QuadraticBezierCurve3(a, m, b);
  }, [from.join(','), to.join(','), arc]); // eslint-disable-line react-hooks/exhaustive-deps
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute('cell', new THREE.BufferAttribute(Float32Array.from({length: n}, (_, i) => Math.floor(rnd(i * 3.7 + seed) * 64)), 1));
    g.setAttribute('alpha', new THREE.BufferAttribute(new Float32Array(n), 1));
    g.setAttribute('size', new THREE.BufferAttribute(Float32Array.from({length: n}, (_, i) => 0.6 + 0.8 * rnd(i * 5.1 + seed)), 1));
    return g;
  }, [n, seed]);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: PTS_V,
        fragmentShader: PTS_F,
        uniforms: {atlas: {value: tokenAtlas()}, color: {value: new THREE.Color(color)}, scale: {value: 1}},
        transparent: true,
        depthWrite: false,
      }),
    [color],
  );
  mat.uniforms.scale.value = size * h;
  const pos = geo.getAttribute('position') as THREE.BufferAttribute;
  const al = geo.getAttribute('alpha') as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    const u = (rnd(i * 1.37 + seed) + t * speed * (0.7 + 0.6 * rnd(i * 2.9 + seed))) % 1;
    curve.getPointAt(u, v);
    const j = (x: number) => (rnd(i * x + seed) - 0.5) * 2 * spread;
    pos.setXYZ(i, v.x + j(4.1), v.y + j(6.3), v.z + j(8.7));
    al.setX(i, k * (0.45 + 0.55 * rnd(i * 7.3 + seed)) * Math.min(1, Math.sin(u * Math.PI) * 2.2));
  }
  pos.needsUpdate = true;
  al.needsUpdate = true;
  const path = useMemo(() => new THREE.BufferGeometry().setFromPoints(curve.getSpacedPoints(64)), [curve]);
  return (
    <>
      <line>
        <primitive object={path} attach="geometry" />
        <lineBasicMaterial color={color} transparent opacity={0.55 * k} toneMapped={false} />
      </line>
      <points geometry={geo} material={mat} frustumCulled={false} />
    </>
  );
};

// ---------------------------------------------------------------- a model as an object: a glass block of weights

/**
 * The model itself: a frosted glass block whose faces are sheets of weights, with green hairline edges. `s` = size
 * (m), `k` = presence (0..1), `fit` 0..1 turns the edges from green-while-loading to solid "fits" green.
 */
export const WeightBlock: React.FC<{p: V3; s: V3; k: number; t: number; seed?: string; over?: boolean}> = ({p, s, k, t, seed = 'm', over}) => {
  const [w, h, d] = s;
  const tex = useMemo(() => {
    const base = weightsTex(seed, over ? '#FF3B30' : GREEN);
    const tt = base.clone();
    tt.needsUpdate = true;
    tt.wrapS = tt.wrapT = THREE.RepeatWrapping;
    return tt;
  }, [seed, over]);
  tex.repeat.set(Math.max(0.2, w / 0.8), Math.max(0.2, h / 0.8));
  tex.offset.y = -(t * 0.08) % 1;
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), [w, h, d]);
  if (k <= 0.001) return null;
  return (
    <group position={[p[0], p[1] + h / 2, p[2]]}>
      <mesh castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshPhysicalMaterial color="#EAF7EF" roughness={0.2} metalness={0} transparent opacity={0.5 * k} clearcoat={1} depthWrite={false} />
      </mesh>
      <mesh>
        <boxGeometry args={[w * 0.999, h * 0.999, d * 0.999]} />
        <meshBasicMaterial map={tex} transparent opacity={0.42 * k} depthWrite={false} toneMapped={false} side={THREE.FrontSide} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={over ? '#FF3B30' : GREEN} transparent opacity={k} toneMapped={false} />
      </lineSegments>
    </group>
  );
};
