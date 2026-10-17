import React from 'react';
import {Composition} from 'remotion';
import {fontsReady} from './fonts';
import {FPS, H, W} from './lib';
import {Reel} from './Reel';
import {DURATION} from './timing';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Reel"
    component={Reel}
    durationInFrames={DURATION}
    fps={FPS}
    width={W}
    height={H}
    calculateMetadata={async () => {
      await fontsReady;
      return {};
    }}
  />
);
