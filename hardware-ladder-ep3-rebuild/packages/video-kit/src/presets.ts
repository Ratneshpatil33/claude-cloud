/**
 * Style presets. Starting points, not cages: a project may tweak tokens, blend two presets,
 * or define its own — keep the same shape so Stage, captions and cards keep working.
 */
export type Preset = {
  name: string;
  dark: boolean;
  bg: string;
  bg2: string;
  ink: string;
  ink2: string;
  accent: string;
  accent2: string;
  gradient: string;
  display: string;
  text: string;
  mono: string;
  displayWeight: number;
  tracking: number;
  radius: number;
  texture: 'dots' | 'paper' | 'grid' | 'grain';
  captionBg: string;
  captionInk: string;
  captionActive: string;
};

const SF = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const MONO = '"SF Mono", ui-monospace, Menlo, Monaco, monospace';

export const PRESETS: Record<string, Preset> = {
  'apple-light': {
    name: 'Apple light',
    dark: false,
    bg: '#F5F5F7',
    bg2: '#EDEDF0',
    ink: '#1D1D1F',
    ink2: '#6E6E73',
    accent: '#007AFF',
    accent2: '#AF52DE',
    gradient: 'linear-gradient(115deg,#0A84FF 0%,#5E5CE6 24%,#BF5AF2 48%,#FF375F 72%,#FF9F0A 100%)',
    display: SF,
    text: SF,
    mono: MONO,
    displayWeight: 700,
    tracking: -0.045,
    radius: 30,
    texture: 'dots',
    captionBg: 'rgba(29,29,31,.82)',
    captionInk: '#F5F5F7',
    captionActive: '#64D2FF',
  },
  editorial: {
    name: 'Editorial',
    dark: false,
    bg: '#F3EEE4',
    bg2: '#E8E1D3',
    ink: '#1B1A17',
    ink2: '#6B645A',
    accent: '#C8361E',
    accent2: '#1F4E79',
    gradient: 'linear-gradient(90deg,#C8361E,#E0703A)',
    display: '"Didot", "Bodoni 72", "Baskerville", Georgia, serif',
    text: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    mono: '"Courier New", Courier, monospace',
    displayWeight: 700,
    tracking: -0.02,
    radius: 4,
    texture: 'paper',
    captionBg: 'rgba(27,26,23,.9)',
    captionInk: '#F3EEE4',
    captionActive: '#FFB199',
  },
  'swiss-bold': {
    name: 'Swiss bold',
    dark: false,
    bg: '#FFFFFF',
    bg2: '#F1F1F1',
    ink: '#0A0A0A',
    ink2: '#5C5C5C',
    accent: '#FF3B1F',
    accent2: '#0A0A0A',
    gradient: 'linear-gradient(90deg,#FF3B1F,#FF3B1F)',
    display: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    text: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    mono: MONO,
    displayWeight: 800,
    tracking: -0.05,
    radius: 0,
    texture: 'grid',
    captionBg: '#0A0A0A',
    captionInk: '#FFFFFF',
    captionActive: '#FF3B1F',
  },
  'cinematic-warm': {
    name: 'Cinematic warm',
    dark: true,
    bg: '#17110D',
    bg2: '#2A1C14',
    ink: '#F6EDE3',
    ink2: 'rgba(246,237,227,.62)',
    accent: '#F2A65A',
    accent2: '#E0566B',
    gradient: 'linear-gradient(115deg,#F2A65A 0%,#E0566B 60%,#8C4FD8 100%)',
    display: '"Avenir Next", "Helvetica Neue", Arial, sans-serif',
    text: '"Avenir Next", "Helvetica Neue", Arial, sans-serif',
    mono: MONO,
    displayWeight: 600,
    tracking: -0.03,
    radius: 22,
    texture: 'grain',
    captionBg: 'rgba(23,17,13,.78)',
    captionInk: '#F6EDE3',
    captionActive: '#F2A65A',
  },
};
