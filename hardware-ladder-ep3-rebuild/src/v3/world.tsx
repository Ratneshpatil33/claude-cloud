import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useFitted, useGLB, type Fit} from './assets';
import {ContactShadow, type V3} from './studio';
import {XRay, type Glow, type Screen} from './xray';

/*
 * The row of devices in the white studio, left → right and small → big, at real-world scale (metres):
 * Arduino UNO R4 WiFi · ESP32-S3 Feather · Raspberry Pi 5 · MacBook Pro 14″ · Framework Desktop (Strix Halo) ·
 * server rack (8 × H100). Episode 1 copy of hardware-ladder/src/v3/world.tsx: the Arduino replaces the tower + DIMM; episode 2 adds the iPhone.
 * Model sources and licences: assets/models/incoming/REPORT.md (converted CAD: assets/models/converted/).
 */

export const ROW = {
  esp: [0, 0, 0] as V3,
  pi: [0.2, 0, 0.01] as V3,
  mac: [0.58, 0, -0.03] as V3,
  fw: [1.08, 0, -0.06] as V3,
  rack: [3.1, 0, -2.5] as V3,
  // episode 1's twist: left of the ESP (it slides in on "An Arduino"; off frame before)
  uno: [-0.1, 0, 0.035] as V3,
  // episode 2: the iPhone 18 Pro Max lies screen-up between the Pi and the MacBook (it slides in on "An iPhone")
  iphone: [0.335, 0, 0.07] as V3,
};

/** The rack stands turned toward the row (its front faces the smaller devices), off the hook frame's right edge. */
export const RACK_RY = -0.766;

/** World point of a point given in the rack's own frame (x across its front, z out of its front). */
export const rackAt = (l: V3): V3 => {
  const c = Math.cos(RACK_RY);
  const sn = Math.sin(RACK_RY);
  return [ROW.rack[0] + l[0] * c + l[2] * sn, ROW.rack[1] + l[1], ROW.rack[2] - l[0] * sn + l[2] * c];
};

type DeviceSpec = {file: string; fit: Fit; ry?: number; paint?: (m: THREE.MeshStandardMaterial) => void; hide?: string[]};

export const DEVICES: Record<keyof typeof ROW, DeviceSpec> = {
  esp: {file: 'esp32s3.glb', fit: {size: 0.0508, axis: 'x', rot: [-Math.PI / 2, 0, 0]}},
  pi: {file: 'pi5.glb', fit: {size: 0.085, axis: 'x', rot: [-Math.PI / 2, 0, 0]}},
  mac: {file: 'macbook16.glb', fit: {size: 0.3126, axis: 'x'}, hide: ['Object_23']}, // Object_23 = the lid logo
  // Framework's CAD: +X is up, the tile-grid front faces +Z, width along Y (case + panels + mainboard + front cover)
  fw: {file: 'framework.glb', fit: {size: 0.2286, axis: 'y', rot: [0, 0, Math.PI / 2]}},
  rack: {file: 'rack.glb', fit: {size: 2.07, axis: 'y'}, ry: RACK_RY},
  // official Arduino CAD (Z up, headers along x, the LED matrix toward the front edge once stood up)
  // iPhone 18 Pro Max (Sketchfab, CC BY 4.0): Y up, screen toward +Z → laid flat, screen up, top away from camera
  iphone: {file: 'iphone18pm.glb', fit: {size: 0.1634, axis: 'z', rot: [-Math.PI / 2, 0, 0]}, ry: 0.32},
  uno: {
    file: 'uno-r4.glb',
    fit: {size: 0.0686, axis: 'x', rot: [-Math.PI / 2, 0, 0]},
    // Arduino teal board, black headers (the CAD's colours read as cyan and lilac under the studio key)
    paint: (m) => {
      if (m.name === 'uno_pcb') m.color.setRGB(0.0, 0.1, 0.11);
      if (m.name === 'c96a2da') m.color.setRGB(0.03, 0.03, 0.035);
      if (m.name === 'uno_led') m.color.setRGB(0.32, 0.3, 0.26); // unlit matrix LEDs: pale, so the lit ones pop
    },
  },
};

/** Framework mainboard part holding its LPDDR5X packages (lit green in the x-ray). */
export const FW_MEM = 'DW_LPDDR5_CHIP';

/** Box of a named part inside a fitted model, in the model's own (fitted) coordinates. */
export const partBox = (obj: THREE.Object3D | null, name: string) => {
  if (!obj) return null;
  obj.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(obj.matrixWorld).invert();
  let box: THREE.Box3 | null = null;
  obj.traverse((o) => {
    if (box || o.name !== name) return;
    const b = new THREE.Box3().setFromObject(o);
    box = b.applyMatrix4(inv);
  });
  return box as THREE.Box3 | null;
};

export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

/** Top-centre of a named part, in world coordinates (device at `base`, no rotation), and the part's size. */
export const partTop = (obj: THREE.Object3D, name: string, base: V3) => {
  const b = partBox(obj, name);
  if (!b) return {top: base, size: [0.01, 0.001, 0.01] as V3};
  const c = b.getCenter(new THREE.Vector3());
  const s = b.getSize(new THREE.Vector3());
  return {top: add(base, [c.x, b.max.y, c.z]), size: [s.x, s.y, s.z] as V3};
};

/** Centre of a named part, in world coordinates (device at `base`, no rotation), and the part's size. */
export const partCenter = (obj: THREE.Object3D, name: string, base: V3) => {
  const b = partBox(obj, name);
  if (!b) return {c: base, size: [0.01, 0.01, 0.01] as V3};
  const c = b.getCenter(new THREE.Vector3());
  const s = b.getSize(new THREE.Vector3());
  return {c: add(base, [c.x, c.y, c.z]), size: [s.x, s.y, s.z] as V3};
};

/** A fitted device model, as its own object (for partBox and x-ray). */
export const useDevice = (key: keyof typeof ROW) => {
  const spec = DEVICES[key];
  const o = useFitted(useGLB(spec.file), spec.fit);
  return useMemo(() => {
    if (o && spec.hide) o.traverse((n) => spec.hide!.includes(n.name) && (n.visible = false));
    return o;
  }, [o, spec]);
};

/**
 * One device in the row: its model at ROW[key] turned by `ry`, x-rayed by `xray` (0 solid … 1 ghost), with a soft
 * contact shadow. `keep` lists part names that stay solid while the rest ghosts (e.g. the memory package); `band`
 * [lo, hi] (m above the floor) ghosts only the parts lying entirely inside that height band (e.g. one rack drawer).
 */
export const Device: React.FC<{
  id: keyof typeof ROW;
  obj: THREE.Object3D | null;
  xray?: number;
  keep?: string[];
  /** the opposite of `keep`: only these named parts ghost (e.g. a module's metal shield), the rest stays solid */
  ghostOnly?: string[];
  band?: [number, number];
  /** ghost colour (a light one reads on a device standing in shadow) */
  tint?: string;
  /** hairline strength of the ghost's edges (1 = default) */
  lines?: number;
  p?: V3;
  ry?: number;
  shadow?: number;
  glow?: Glow;
  screen?: Screen;
  children?: React.ReactNode;
}> = ({id, obj, xray = 0, keep, ghostOnly, band, tint, lines, p, ry, shadow = 1, glow, screen, children}) => {
  const [ghost, solid] = useMemo(() => {
    if (!obj) return [null, null] as const;
    if (!keep?.length && !ghostOnly?.length && !band) return [obj, null] as const;
    const keepSet = new Set(keep ?? []);
    const onlySet = new Set(ghostOnly ?? []);
    const within = (o: THREE.Object3D, set: Set<string>) => {
      for (let c: THREE.Object3D | null = o; c; c = c.parent) if (set.has(c.name)) return true;
      return false;
    };
    const kept = (o: THREE.Object3D) => (ghostOnly?.length ? !within(o, onlySet) : within(o, keepSet));
    obj.updateMatrixWorld(true);
    const flags: boolean[] = [];
    obj.traverse((o) => {
      if (!(o as THREE.Mesh).isMesh) return;
      let gh = !kept(o);
      if (band) {
        const b = new THREE.Box3().setFromObject(o);
        gh = gh && b.min.y >= band[0] - 0.004 && b.max.y <= band[1] + 0.004;
      }
      flags.push(gh);
    });
    const g = obj.clone(true);
    const s = obj.clone(true);
    let i = 0;
    g.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) o.visible = flags[i++];
    });
    i = 0;
    s.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) o.visible = !flags[i++];
    });
    return [g, s] as const;
  }, [obj, keep?.join('|'), ghostOnly?.join('|'), band?.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
  const pos = p ?? ROW[id];
  if (!obj || !ghost) return null;
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  return (
    <group position={pos} rotation={[0, ry ?? DEVICES[id].ry ?? 0, 0]}>
      <XRay obj={ghost} k={xray} tint={tint} lines={lines} paint={DEVICES[id].paint} glow={glow} screen={screen} />
      {solid && <XRay obj={solid} k={0} tint={tint} paint={DEVICES[id].paint} glow={glow} screen={screen} />}
      {children}
      <ContactShadow p={[0, 0, 0]} w={size.x * 1.5 + 0.02} d={size.z * 1.5 + 0.02} o={shadow * (1 - 0.6 * xray * (band || ghostOnly ? 0 : 1))} />
    </group>
  );
};

/** All devices, loaded (null until every model is ready: mount the canvas only then). */
export const useWorld = () => {
  const esp = useDevice('esp');
  const pi = useDevice('pi');
  const mac = useDevice('mac');
  const fw = useDevice('fw');
  const rack = useDevice('rack');
  const uno = useDevice('uno');
  const iphone = useDevice('iphone');
  return esp && pi && mac && fw && rack && uno && iphone ? {esp, pi, mac, fw, rack, uno, iphone} : null;
};
