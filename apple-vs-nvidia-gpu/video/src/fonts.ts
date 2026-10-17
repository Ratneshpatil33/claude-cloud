import {loadFont} from '@remotion/fonts';
import inter400 from '@fontsource/inter/files/inter-latin-400-normal.woff2';
import inter500 from '@fontsource/inter/files/inter-latin-500-normal.woff2';
import inter600 from '@fontsource/inter/files/inter-latin-600-normal.woff2';
import inter700 from '@fontsource/inter/files/inter-latin-700-normal.woff2';
import inter800 from '@fontsource/inter/files/inter-latin-800-normal.woff2';
import mono400 from '@fontsource/geist-mono/files/geist-mono-latin-400-normal.woff2';
import mono500 from '@fontsource/geist-mono/files/geist-mono-latin-500-normal.woff2';

export const SANS = '"Inter", sans-serif';
export const MONO = '"Geist Mono", monospace';

const faces: [string, string, string][] = [
  ['Inter', inter400, '400'],
  ['Inter', inter500, '500'],
  ['Inter', inter600, '600'],
  ['Inter', inter700, '700'],
  ['Inter', inter800, '800'],
  ['Geist Mono', mono400, '400'],
  ['Geist Mono', mono500, '500'],
];

export const fontsReady = Promise.all(faces.map(([family, url, weight]) => loadFont({family, url, weight})));
