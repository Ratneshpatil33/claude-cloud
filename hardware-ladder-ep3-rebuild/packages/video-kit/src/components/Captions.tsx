import React from 'react';
import {useCurrentFrame} from 'remotion';
import {FPS, P, SAFE, SPLIT} from '../design';
import {pop} from '../motion';
import {AVATAR_PIP, CUTS, Treatment, WORDS, Word, cutIndexAt, seamAt} from '../timeline';

const MAX_WORDS = 4;
const MIN_WORDS = 3;
const PAUSE = 0.35;
const LINGER = 0.4;

type Page = {words: Word[]; start: number; end: number};

/** 3–4 words per page; break early on sentence punctuation or a real pause. */
const buildPages = (words: Word[]): Page[] => {
  const pages: Page[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) pages.push({words: cur, start: cur[0].start, end: cur[cur.length - 1].end});
    cur = [];
  };
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    const punct = /[.!?;:,]$/.test(w.word);
    const gap = next ? next.start - w.end : Infinity;
    if (cur.length >= MAX_WORDS) return flush();
    if (cur.length >= MIN_WORDS && (punct || gap > PAUSE)) return flush();
    if (/[.!?]$/.test(w.word) || gap > 0.7) flush();
  });
  flush();
  for (let i = 0; i < pages.length; i++) {
    const nextStart = pages[i + 1]?.start ?? Infinity;
    pages[i].end = Math.min(pages[i].end + LINGER, nextStart);
  }
  return pages;
};

let pagesFor: Word[] | null = null;
let pages: Page[] = [];
/** Built lazily: WORDS is filled by configure() after this module loads. */
const getPages = () => {
  if (pagesFor !== WORDS) (pages = buildPages(WORDS)), (pagesFor = WORDS);
  return pages;
};

const zone = (cut: {treat: Treatment}, f: number): React.CSSProperties => {
  switch (cut.treat) {
    case 'SPLIT':
      return {left: SAFE.left, width: SAFE.width, top: seamAt(f) - 70, justifyContent: 'center'};
    case 'PIP': {
      // Beside the bubble; top 70 px below the bubble's top (1250 for the default 300 px bubble at y 1180).
      const left = AVATAR_PIP.left + AVATAR_PIP.size + 30;
      return {left, width: SAFE.left + SAFE.width - left, top: AVATAR_PIP.top + 70, justifyContent: 'flex-start'};
    }
    default:
      return {left: SAFE.left, width: SAFE.width, top: 1300, justifyContent: 'center'};
  }
};

export const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const page = getPages().find((p) => t >= p.start && t < p.end);
  if (!page) return null;
  const cut = CUTS[cutIndexAt(f)];
  const enter = pop(f, Math.round(page.start * FPS), 10);
  return (
    <div
      style={{
        position: 'absolute',
        display: 'flex',
        zIndex: 20,
        ...zone(cut, f),
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0 16px',
          padding: '14px 26px',
          borderRadius: Math.min(P.radius, 24),
          background: P.captionBg,
          fontFamily: P.text,
          fontSize: 58,
          fontWeight: 800,
          lineHeight: 1.12,
          letterSpacing: '-0.01em',
          color: P.captionInk,
          opacity: enter,
          transform: `translateY(${(1 - enter) * 16}px) scale(${0.96 + enter * 0.04})`,
        }}
      >
        {page.words.map((w, i) => {
          const active = t >= w.start && t < (page.words[i + 1]?.start ?? page.end);
          return (
            <span
              key={`${w.start}-${i}`}
              style={{
                color: active ? P.captionActive : P.captionInk,
                transform: active ? 'scale(1.06)' : undefined,
                display: 'inline-block',
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
