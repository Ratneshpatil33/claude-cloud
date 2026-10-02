import {Composition} from 'remotion';
import {GpuRgbCase} from './GpuRgbCase';
import {DURATION, FPS, HEIGHT, WIDTH} from './timeline';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="GpuRgbCase"
      component={GpuRgbCase}
      durationInFrames={DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
