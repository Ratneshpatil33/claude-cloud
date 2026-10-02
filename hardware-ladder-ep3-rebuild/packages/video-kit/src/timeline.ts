import {getInputProps, interpolate} from 'remotion';
import {CLAMP, FPS, PIP, SPLIT} from './design';
import {EASE_IN_OUT} from './motion';

export type Treatment = 'SPLIT' | 'ANIM' | 'AVATAR' | 'PIP' | 'MEDIA';
export type Beat = 'hook' | 'body' | 'loop' | 'payoff' | 'close';

/** How a scene leaves (played over the next scene). Match cuts and zoom-throughs into a detail are built inside scenes. */
export type Exit = 'dissolve' | 'cut' | 'wipe' | 'whip' | 'zoom' | 'slide-up';

export type Scene = {
  id: number;
  start: number;
  end: number;
  treat: Treatment;
  beat: Beat;
  text: string;
  exit?: Exit;
  exitAt?: {x: number; y: number};
  /**
   * SPLIT only: y (px) where the animation ends and the avatar begins. Default SPLIT.seam (960, a 50:50 split);
   * e.g. 1440 gives a bottom avatar strip. The avatar box morphs between seams at the cut like any layout change.
   */
  seam?: number;
  /** Hook-variant overrides, e.g. {"B": {"treat": "PIP"}}: variant B renders this scene in a different layout. */
  variants?: Record<string, SceneOverride>;
};
export type SceneOverride = Partial<Pick<Scene, 'treat' | 'exit' | 'exitAt' | 'seam'>>;

/** The SPLIT seam of a scene (its own `seam`, else the default 960). */
export const seamOf = (s: {seam?: number}) => s.seam ?? SPLIT.seam;
export type AvatarTake = {file: string; start: number; end: number; trimBefore?: number};
/** PIP bubble geometry in frame px (diameter and top-left corner). */
export type PipGeometry = {size: number; left: number; top: number};
/**
 * A sound cue. Two forms:
 * - Named (preferred): `{at, sound}` — `sound` is a kind from the sfx-v2 library ("whoosh", "pop", "tick",
 *   "riser", "signature") or an exact id ("whoosh-03"). `at` is the EVENT: the sound's loudest point lands there
 *   (a riser/swell ends there). Level comes from the sound's tier; `gainDb` nudges it.
 * - File (legacy): `{at, file, volume}` — `at` is where the file starts, `volume` is linear gain.
 * Both are resolved by `@video/kit/tools/sfx.mjs` (run by `render.mjs check`) into src/data/sfx.resolved.json.
 */
export type SfxCue = {
  at: number;
  sound?: string;
  file?: string;
  volume?: number;
  /** Named cues: dB offset from the tier default (e.g. -3 for a quieter repeat). */
  gainDb?: number;
  /** Seconds: stop here with a short fade. */
  until?: number;
  /** Named cues: 'peak' (default) lands the loudest point on `at`; 'start' starts the file at `at`. */
  align?: 'peak' | 'start';
  /** Risers/swells: build length in seconds (1, 1.5 or 2; default 1.5). */
  lead?: number;
};
/** A cue after resolution: a concrete file under public/, when it starts, how loud, where it stops. */
export type ResolvedSfxCue = {start: number; file: string; volume: number; until?: number};
export type ResolvedSfx = {hash: string; cues: ResolvedSfxCue[]};
export type ContextCard = {at: number; until: number; label: string; icon?: string};
export type Word = {word: string; start: number; end: number};

export type TimelineFile = {
  preset: string;
  voice: {file: string; seconds: number};
  tail: number;
  scenes: Scene[];
  avatar: {
    ready: boolean;
    focus: string;
    splitFocus?: string;
    pipZoom: number;
    /** Per-project PIP bubble override, e.g. {"size": 380, "top": 1090}; defaults to design.ts PIP. */
    pip?: Partial<PipGeometry>;
    takes: AvatarTake[];
  };
  emphasis: number[];
  sfx: SfxCue[];
  cards: ContextCard[];
  hooks: {variants: string[]};
};

export type Cut = Scene & {from: number; durationInFrames: number};

/*
 * Live bindings, filled by `configure()` before the composition renders.
 * Read them inside components and functions, not at module load.
 */
export let PRESET = 'apple-light';
export let VOICE_FILE = '';
export let DURATION = 1;
export let WORDS: Word[] = [];
export let SCENES: Scene[] = [];
/** Cuts tile the timeline with no gaps: each runs to the next scene's start. */
export let CUTS: Cut[] = [];
export let AVATAR_READY = false;
export let AVATAR_FOCUS = '50% 32%';
/** Framing for the SPLIT bottom half; defaults to AVATAR_FOCUS. */
export let AVATAR_SPLIT_FOCUS = '50% 32%';
export let AVATAR_PIP_ZOOM = 1.5;
export let AVATAR_PIP: PipGeometry = {...PIP};
export let AVATAR_TAKES: AvatarTake[] = [];
export let EMPHASIS_FRAMES: number[] = [];
export let SFX: SfxCue[] = [];
/** Resolved cues from src/data/sfx.resolved.json; null when the project has none. */
export let SFX_RESOLVED: ResolvedSfx | null = null;
export let CARDS: ContextCard[] = [];
export let HOOK_VARIANTS: string[] = ['A'];

export const loadTimeline = (T: TimelineFile, words: Word[]) => {
  PRESET = T.preset;
  VOICE_FILE = T.voice.file;
  DURATION = Math.ceil((T.voice.seconds + T.tail) * FPS);
  WORDS = words;
  HOOK_VARIANTS = T.hooks.variants;
  const variant = hookVariant();
  SCENES = T.scenes.map(({variants, ...s}) => ({...s, ...variants?.[variant]}));
  CUTS = SCENES.map((s, i) => {
    const from = Math.round(s.start * FPS);
    const to = i === SCENES.length - 1 ? DURATION : Math.round(SCENES[i + 1].start * FPS);
    return {...s, from, durationInFrames: Math.max(1, to - from)};
  });
  AVATAR_READY = T.avatar.ready;
  AVATAR_FOCUS = T.avatar.focus;
  AVATAR_SPLIT_FOCUS = T.avatar.splitFocus ?? T.avatar.focus;
  AVATAR_PIP_ZOOM = T.avatar.pipZoom;
  AVATAR_PIP = {...PIP, ...T.avatar.pip};
  AVATAR_TAKES = T.avatar.takes;
  EMPHASIS_FRAMES = T.emphasis.map((s) => Math.round(s * FPS));
  SFX = T.sfx;
  CARDS = T.cards;
};

/**
 * FNV-1a over the JSON of the timeline's sfx cues. tools/sfx.mjs stores the same hash in sfx.resolved.json,
 * so a render can tell when the cues changed after the last `render.mjs check`.
 */
export const sfxHash = (cues: unknown): string => {
  const s = JSON.stringify(cues ?? []);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
};

export const loadResolvedSfx = (resolved: unknown) => {
  const r = resolved as Partial<ResolvedSfx> | undefined;
  SFX_RESOLVED = r && typeof r.hash === 'string' && Array.isArray(r.cues) ? (r as ResolvedSfx) : null;
};

export const cutIndexAt = (frame: number) => {
  for (let i = CUTS.length - 1; i >= 0; i--) if (frame >= CUTS[i].from) return i;
  return 0;
};

/** Frames over which a cut's avatar box (and a changed SPLIT seam) morph in from the previous cut's layout. */
export const MORPH_FRAMES = 9;

/**
 * The SPLIT seam at a global frame. When a SPLIT cut follows a SPLIT cut with another seam, the seam slides over
 * MORPH_FRAMES in step with the avatar box, so captions and the divider don't jump ahead of it.
 */
export const seamAt = (frame: number) => {
  const i = cutIndexAt(frame);
  const cut = CUTS[i];
  const prev = CUTS[i - 1];
  if (!prev || prev.treat !== 'SPLIT' || cut.treat !== 'SPLIT' || seamOf(prev) === seamOf(cut)) return seamOf(cut);
  const t = interpolate(frame - cut.from, [0, MORPH_FRAMES], [0, 1], {...CLAMP, easing: EASE_IN_OUT});
  return seamOf(prev) + (seamOf(cut) - seamOf(prev)) * t;
};

/** Hook variant for this render: --props='{"hook":"B"}'. Defaults to the first variant. */
export const hookVariant = (): string => {
  const {hook} = getInputProps() as {hook?: string};
  return hook && HOOK_VARIANTS.includes(hook) ? hook : HOOK_VARIANTS[0] ?? 'A';
};
