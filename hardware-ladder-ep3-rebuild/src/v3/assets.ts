import {useEffect, useMemo, useState} from 'react';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';
import * as THREE from 'three';
import {GLTFLoader, type GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/examples/jsm/libs/meshopt_decoder.module.js';

/*
 * GLB models from public/models/. Loading holds the frame (delayRender) until the file is parsed; parsed files are
 * cached per page, so later frames in the same tab render immediately.
 */

const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const pending = new Map<string, Promise<GLTF>>();
const loaded = new Map<string, GLTF>();

const load = (file: string) => {
  let p = pending.get(file);
  if (!p) {
    p = loader.loadAsync(staticFile(`models/${file}`)).then((g) => {
      loaded.set(file, g);
      return g;
    });
    pending.set(file, p);
  }
  return p;
};

/**
 * The parsed scene of public/models/<file>, or null while it loads (the frame is held until then). Call it OUTSIDE
 * the <ThreeCanvas> and mount the canvas once every model is ready: during a render the canvas only redraws when
 * the frame changes, so a model that arrives later would never be drawn.
 */
export const useGLB = (file: string): THREE.Group | null => {
  const [scene, setScene] = useState<THREE.Group | null>(() => loaded.get(file)?.scene ?? null);
  const [handle] = useState(() => (loaded.has(file) ? null : delayRender(`model ${file}`, {timeoutInMilliseconds: 120000})));
  useEffect(() => {
    if (!handle) return;
    load(file)
      .then((g) => setScene(g.scene))
      .catch((e) => cancelRender(e));
  }, [file, handle]);
  // Release the frame only after the loaded model is committed: anything that mounts with it (e.g. a <ThreeCanvas>)
  // has registered its own delayRender by then, so the screenshot can't be taken before the model is drawn.
  useEffect(() => {
    if (handle && scene) continueRender(handle);
  }, [handle, scene]);
  return scene;
};

const texLoader = new THREE.TextureLoader();
const texPending = new Map<string, Promise<THREE.Texture>>();
const texLoaded = new Map<string, THREE.Texture>();

/**
 * An image from public/ as a texture (sRGB), holding the frame until it has loaded. Call it OUTSIDE the <ThreeCanvas>
 * (during a render the canvas only redraws on frame changes) and pass the texture in.
 */
export const useTex = (file: string): THREE.Texture | null => {
  const [tex, setTex] = useState<THREE.Texture | null>(() => texLoaded.get(file) ?? null);
  const [handle] = useState(() => (texLoaded.has(file) ? null : delayRender(`texture ${file}`)));
  useEffect(() => {
    if (!handle) return;
    let p = texPending.get(file);
    if (!p) {
      p = texLoader.loadAsync(staticFile(file)).then((t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        texLoaded.set(file, t);
        return t;
      });
      texPending.set(file, p);
    }
    p.then((t) => setTex(t)).catch((e) => cancelRender(e));
  }, [file, handle]);
  useEffect(() => {
    if (handle && tex) continueRender(handle);
  }, [handle, tex]);
  return tex;
};

export type Fit = {
  /** target size in metres along `axis` */
  size: number;
  axis?: 'x' | 'y' | 'z' | 'max';
  /** extra rotation applied before measuring (radians), to stand a model up or face it forward */
  rot?: [number, number, number];
};

/**
 * A normalised copy of a model: rotated, scaled to `size`, centred on x/z and standing on y = 0. Geometry and
 * materials are shared with the cache (clone materials before changing them).
 */
export const useFitted = (scene: THREE.Group | null, fit: Fit) =>
  useMemo(() => {
    if (!scene) return null;
    const inner = scene.clone(true);
    if (fit.rot) inner.rotation.set(...fit.rot);
    const holder = new THREE.Group();
    holder.add(inner);
    holder.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(holder);
    const size = box.getSize(new THREE.Vector3());
    const ax = fit.axis ?? 'max';
    const cur = ax === 'max' ? Math.max(size.x, size.y, size.z) : size[ax];
    const k = fit.size / Math.max(1e-9, cur);
    holder.scale.setScalar(k);
    holder.updateMatrixWorld(true);
    const b2 = new THREE.Box3().setFromObject(holder);
    const c = b2.getCenter(new THREE.Vector3());
    const outer = new THREE.Group();
    holder.position.set(-c.x, -b2.min.y, -c.z);
    outer.add(holder);
    outer.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
    return outer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, fit.size, fit.axis, fit.rot?.join(',')]);
