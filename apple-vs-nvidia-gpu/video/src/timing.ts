import words from './data/words.json';
import script from './data/script.json';
import {FPS} from './lib';

export type Word = {word: string; start: number; end: number};
export const WORDS = words as Word[];

const offsets: number[] = [];
{
  let i = 0;
  for (const s of script.scenes) {
    offsets.push(i);
    i += s.text.split(/\s+/).length;
  }
}

/** The k-th word (0-based) of scene `scene` (1-based), as in src/data/script.json. */
export const word = (scene: number, k: number): Word => WORDS[offsets[scene - 1] + k];
export const ts = (scene: number, k: number) => word(scene, k).start;
export const te = (scene: number, k: number) => word(scene, k).end;
export const fr = (t: number) => Math.round(t * FPS);

export const VO_END = WORDS[WORDS.length - 1].end;
/** Half a second of tail after the last word, so the loop lands on a settled frame. */
export const DURATION = fr(VO_END + 0.5);
