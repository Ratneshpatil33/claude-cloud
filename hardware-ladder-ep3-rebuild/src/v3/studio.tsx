import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';

/*
 * Look v3: the infinite white studio. A seamless floor-to-wall sweep (cyclorama) that melts into white fog, a studio
 * environment map for product reflections, one soft key light with blurred shadows, and a camera rig that places the
 * world from a {pos, at, fov} per frame (so every shot is a pure function of time, like before).
 */

export type V3 = [number, number, number];
/** Camera: position, look-at, horizontal fov (deg) and `shift` = vertical lens shift in px (positive moves the picture
 * up, so the subject can sit above the avatar bubble without tilting the camera). */
export type Cam = {pos: V3; at: V3; fov: number; shift?: number};

export const STUDIO_BG = '#F3F4F6';

const vfovOf = (hfov: number, aspect: number) => (2 * Math.atan(Math.tan((hfov * Math.PI) / 360) / aspect) * 180) / Math.PI;

export const cameraOf = (c: Cam, w: number, h: number) => {
  const cam = new THREE.PerspectiveCamera(vfovOf(c.fov, w / h), w / h, 0.005, 80);
  cam.position.set(...c.pos);
  cam.lookAt(new THREE.Vector3(...c.at));
  if (c.shift) cam.setViewOffset(w, h, 0, c.shift, w, h);
  cam.updateMatrixWorld(true);
  cam.updateProjectionMatrix();
  return cam;
};

/** Screen px of world point p (for the HTML callouts drawn over the canvas). */
export const project = (c: Cam, w: number, h: number, p: V3) => {
  const cam = cameraOf(c, w, h);
  const v = new THREE.Vector3(...p).project(cam);
  return {x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h, front: v.z < 1};
};

/** Floor that curves up into a back wall: profile in (z, y), swept along x. */
const cycGeometry = (width: number, front: number, back: number, radius: number, height: number) => {
  const prof: Array<[number, number]> = [];
  const n = 24;
  prof.push([front, 0]);
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * (Math.PI / 2);
    prof.push([back + radius - Math.sin(a) * radius, radius - Math.cos(a) * radius]);
  }
  prof.push([back, height]);
  const xs = 2;
  const pos: number[] = [];
  const idx: number[] = [];
  prof.forEach(([z, y]) => {
    for (let j = 0; j < xs; j++) pos.push(-width / 2 + (j / (xs - 1)) * width, y, z);
  });
  for (let i = 0; i < prof.length - 1; i++) {
    const a = i * xs;
    const b = (i + 1) * xs;
    idx.push(a, a + 1, b, a + 1, b + 1, b); // wound so the floor and wall face the camera (up / forward)
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};

/** PMREM studio environment (reflections on metal/glass), built once per GL context. */
const Env: React.FC<{intensity?: number}> = ({intensity = 0.9}) => {
  const {gl, scene} = useThree();
  const env = useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const t = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();
    return t;
  }, [gl]);
  useLayoutEffect(() => {
    scene.environment = env;
    scene.environmentIntensity = intensity;
  }, [scene, env, intensity]);
  return null;
};

/** The canvas camera only reads its props on mount; keep fov synced every frame. */
const FovSync: React.FC<{fov: number; shift: number; w: number; h: number}> = ({fov, shift, w, h}) => {
  const camera = useThree((st) => st.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.fov = fov;
    if (shift) camera.setViewOffset(w, h, 0, shift, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }, [camera, fov, shift, w, h]);
  return null;
};

/** Key + fill lights; lives in world space with an explicit target. */
export type Sun = {from: V3; power?: number; area?: number; soft?: number; rim?: number};

const Lights: React.FC<{target: V3; power?: number; sun?: Sun; fill?: number}> = ({target, power = 2.4, sun, fill = 1}) => {
  const a = sun?.area ?? 3;
  const from: V3 = sun?.from ?? [target[0] - 2.2, target[1] + 4.2, target[2] + 2.6];
  const tgt = useMemo(() => new THREE.Object3D(), []);
  const key = useRef<THREE.DirectionalLight>(null);
  // the shadow frustum can animate (area, soft): its projection isn't rebuilt from props on its own
  useLayoutEffect(() => {
    key.current?.shadow.camera.updateProjectionMatrix();
  });
  return (
    <>
      <primitive object={tgt} position={target} />
      <hemisphereLight args={['#FFFFFF', '#DCDFE5']} intensity={0.9 * fill} />
      <directionalLight
        ref={key}
        position={from}
        target={tgt}
        intensity={sun?.power ?? power}
        color="#FFFFFF"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-a}
        shadow-camera-right={a}
        shadow-camera-top={a}
        shadow-camera-bottom={-a}
        shadow-camera-near={0.2}
        shadow-camera-far={30}
        shadow-radius={sun?.soft ?? 14}
        shadow-blurSamples={24}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[target[0] + 3, target[1] + 1.5, target[2] - 2]} target={tgt} intensity={sun?.rim ?? 0.8} color="#EEF3FF" />
    </>
  );
};

export const Cyc: React.FC = () => {
  const geo = useMemo(() => cycGeometry(80, 30, -18, 5, 20), []);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial color={STUDIO_BG} roughness={0.55} metalness={0} />
    </mesh>
  );
};

/**
 * The studio canvas. Children are placed in world space; the camera `cam` is applied as the inverse transform of a
 * world group (Remotion's ThreeCanvas owns the real camera).
 */
export const Studio: React.FC<{w: number; h: number; cam: Cam; light: V3; keyLight?: number; sun?: Sun; fill?: number; fog?: [number, number]; children: React.ReactNode}> = ({
  w,
  h,
  cam,
  light,
  keyLight,
  sun,
  fill = 1,
  fog = [9, 30],
  children,
}) => {
  const c = cameraOf(cam, w, h);
  const pos = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  c.matrixWorldInverse.decompose(pos, quat, new THREE.Vector3());
  const vfov = vfovOf(cam.fov, w / h);
  return (
    <ThreeCanvas
      width={w}
      height={h}
      style={{position: 'absolute', left: 0, top: 0}}
      gl={{antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.NeutralToneMapping, toneMappingExposure: 1.0}}
      camera={{fov: vfov, position: [0, 0, 0], near: 0.005, far: 80}}
      shadows="variance"
      dpr={1}
    >
      <FovSync fov={vfov} shift={cam.shift ?? 0} w={w} h={h} />
      <Env intensity={0.9 * fill} />
      <color attach="background" args={[STUDIO_BG]} />
      <fog attach="fog" args={[STUDIO_BG, fog[0], fog[1]]} />
      <group position={pos} quaternion={quat}>
        <Lights target={light} power={keyLight} sun={sun} fill={fill} />
        <Cyc />
        {children}
      </group>
    </ThreeCanvas>
  );
};

/** A soft contact shadow (radial gradient) under an object, for grounding on the white floor. */
const blobTex = (() => {
  let t: THREE.CanvasTexture | null = null;
  return () => {
    if (t) return t;
    const cv = document.createElement('canvas');
    cv.width = cv.height = 256;
    const g = cv.getContext('2d') as CanvasRenderingContext2D;
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, 'rgba(20,24,32,0.55)');
    grd.addColorStop(0.45, 'rgba(20,24,32,0.22)');
    grd.addColorStop(1, 'rgba(20,24,32,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    t = new THREE.CanvasTexture(cv);
    return t;
  };
})();

export const ContactShadow: React.FC<{p: V3; w: number; d: number; o?: number}> = ({p, w, d, o = 1}) => (
  <mesh position={[p[0], 0.0015, p[2]]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
    <planeGeometry args={[w, d]} />
    <meshBasicMaterial map={blobTex()} transparent opacity={o} depthWrite={false} />
  </mesh>
);
