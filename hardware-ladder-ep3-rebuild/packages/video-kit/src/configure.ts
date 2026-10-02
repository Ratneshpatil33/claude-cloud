import {applyPreset} from './design';
import {Plate, loadPlates} from './kit/parallax';
import type {Preset} from './presets';
import {TimelineFile, Word, loadResolvedSfx, loadTimeline} from './timeline';

export type ProjectData = {
  /** src/data/timeline.json */
  timeline: unknown;
  /** src/data/words.json */
  words: unknown;
  /** src/data/parallax.json (optional) */
  parallax?: unknown;
  /** src/data/sfx.resolved.json (optional): written by `render.mjs check` from the timeline's sfx cues. */
  sfx?: unknown;
  /** Per-project token overrides on top of the timeline's preset, e.g. {accent: '#FF5A1F'}. */
  palette?: Partial<Preset>;
};

/**
 * Bind a project's data to the kit. Call once from the project's src/setup.ts, which src/index.ts
 * imports first, so the palette and timeline are set before any scene module or render reads them.
 */
export const configure = ({timeline, words, parallax = {}, sfx, palette = {}}: ProjectData) => {
  const t = timeline as TimelineFile;
  applyPreset(t.preset, palette);
  loadTimeline(t, words as Word[]);
  loadPlates(parallax as Record<string, Plate>);
  loadResolvedSfx(sfx);
};
