import {loadFont} from '@remotion/fonts';
import spaceGrotesk500 from '@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff2';
import spaceGrotesk700 from '@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2';

export const FONT_FAMILY = 'Space Grotesk';

loadFont({family: FONT_FAMILY, url: spaceGrotesk500, weight: '500'});
loadFont({family: FONT_FAMILY, url: spaceGrotesk700, weight: '700'});
