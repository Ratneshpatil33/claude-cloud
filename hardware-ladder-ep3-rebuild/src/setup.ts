import {configure} from '@video/kit';
import parallax from './data/parallax.json';
/** Written by `render.mjs check` from timeline.json's sfx cues — don't edit by hand. */
import sfx from './data/sfx.resolved.json';
import timeline from './data/timeline.json';
import words from './data/words.json';

configure({
  timeline,
  words,
  parallax,
  sfx,
  /** Token overrides on top of the timeline's preset, e.g. {accent: '#FF5A1F'}. Don't edit the kit's presets. */
  palette: {accent: '#00C853', accent2: '#23272E', captionActive: '#3DFF8F', gradient: 'linear-gradient(90deg,#00C853,#3DFF8F)'},
});
