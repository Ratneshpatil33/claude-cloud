import React from 'react';
import {P, SAFE, SPLIT, displayType} from './design';
import {Stage} from './components/Chrome';
import {pop} from './motion';
import {seamOf, type Scene} from './timeline';

export type SceneProps = {f: number; dur: number; scene: Scene};
export type SceneFor = (id: number, variant: string) => React.FC<SceneProps>;

/**
 * Stand-in until a bespoke scene is written. Shows the line immediately (never an empty frame)
 * so the edit renders end-to-end from the first scaffold.
 */
export const DraftScene: React.FC<SceneProps> = ({f, scene}) => {
  const split = scene.treat === 'SPLIT';
  const p = pop(f, 0, 12);
  return (
    <Stage f={f} height={split ? seamOf(scene) : undefined}>
      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: split ? 300 : 700,
          width: SAFE.width,
          ...displayType(76),
          transform: `translateY(${(1 - p) * 10}px)`,
        }}
      >
        {scene.text}
      </div>
      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: split ? 250 : 640,
          fontFamily: P.mono,
          fontSize: 22,
          letterSpacing: 2,
          color: P.ink2,
        }}
      >
        DRAFT · SCENE {scene.id} · {scene.treat}
      </div>
    </Stage>
  );
};

/**
 * Lookup over a project's scene registry. Hook variants use `${id}:${variant}` (e.g. '1:B');
 * a missing variant falls back to the plain id, then to DraftScene.
 */
export const makeSceneFor =
  (scenes: Record<string, React.FC<SceneProps>>): SceneFor =>
  (id, variant) =>
    scenes[`${id}:${variant}`] ?? scenes[String(id)] ?? DraftScene;
