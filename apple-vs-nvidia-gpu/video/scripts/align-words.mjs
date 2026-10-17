// Word timings for the voiceover without a speech model: find the pauses in the audio, anchor the script's
// punctuation breaks to them in order, then spread each phrase's words across its speech by syllable count.
// Usage: node scripts/align-words.mjs  ->  src/data/words.json
import {execFileSync} from 'node:child_process';
import {readFileSync, writeFileSync} from 'node:fs';

const WAV = 'public/voice/voiceover.wav';
const SCRIPT = JSON.parse(readFileSync('src/data/script.json', 'utf8'));
const RATE = 16000;
const pcm = execFileSync('ffmpeg', ['-v', 'error', '-i', WAV, '-ac', '1', '-ar', String(RATE), '-f', 's16le', '-'], {maxBuffer: 1 << 28});
const samples = new Int16Array(pcm.buffer, pcm.byteOffset, pcm.length / 2);

// 10 ms RMS envelope in dBFS.
const HOP = RATE / 100;
const env = [];
for (let i = 0; i + HOP <= samples.length; i += HOP) {
  let s = 0;
  for (let j = i; j < i + HOP; j++) s += samples[j] * samples[j];
  env.push(10 * Math.log10(s / HOP / 32768 / 32768 + 1e-12));
}
const peak = Math.max(...env);
const voiced = env.map((d) => d > peak - 34);
const first = voiced.indexOf(true);
const last = voiced.lastIndexOf(true);

// Pauses: unvoiced runs of at least 60 ms inside the speech.
const pauses = [];
for (let i = first; i <= last; i++) {
  if (voiced[i]) continue;
  let j = i;
  while (j <= last && !voiced[j]) j++;
  if (j - i >= 6) pauses.push({start: i / 100, end: j / 100, len: (j - i) / 100});
  i = j;
}

const syllables = (w) => {
  const word = w.toLowerCase().replace(/[^a-z\-']/g, '');
  if (/^nvidia/.test(word)) return 4; // "en-vid-ee-uh", not spelled out
  if (/^[A-Z]{2,}/.test(w.replace(/[^A-Za-z]/g, ''))) return w.replace(/[^A-Za-z]/g, '').length; // GPU, CPU, RTX, AI
  return word.split('-').reduce((n, part) => {
    const m = part.replace(/e$/, '').match(/[aeiouy]+/g);
    return n + Math.max(1, m ? m.length : 1);
  }, 0);
};

const words = SCRIPT.scenes.flatMap((s) => s.text.split(/\s+/));
const weight = words.map(syllables);
const breakAfter = words.map((w) => (/[?.]$/.test(w) ? 2 : /,$/.test(w) ? 1 : 0));

// Global alignment: choose which pauses the punctuation breaks fall on (in order) so every phrase's speaking rate
// stays close to the overall rate, sentence ends prefer long pauses, and long pauses left mid-phrase cost extra.
const total = weight.reduce((a, b) => a + b, 0);
const t0 = first / 100;
const t1 = last / 100;
const speech = (t1 - t0) - pauses.reduce((a, p) => a + p.len, 0);
const spps = speech / total; // seconds per syllable
const cum = [0];
weight.forEach((w) => cum.push(cum[cum.length - 1] + w));
const breaks = breakAfter.map((b, i) => (b && i < words.length - 1 ? i : -1)).filter((i) => i >= 0);
// Nodes: virtual start, breaks, virtual end. Pause -1 = speech start, pauses.length = speech end.
const B = [-1, ...breaks, words.length - 1];
const P = pauses.length;
const pStart = (j) => (j === P ? t1 : pauses[j].start);
const pEnd = (j) => (j === -1 ? t0 : j === P ? t1 : pauses[j].end);
const segCost = (bi, bj, pa, pb) => {
  const syl = cum[B[bj] + 1] - cum[B[bi] + 1];
  let t = pStart(pb) - pEnd(pa);
  for (let k = pa + 1; k < pb; k++) t -= pauses[k].len; // unmatched pauses inside are short gaps, not speech
  const want = syl * spps;
  if (t <= 0.05) return Infinity;
  const r = Math.log(t / want);
  let c = r * r * (1 + syl / 4);
  for (let k = pa + 1; k < pb; k++) c += Math.max(0, pauses[k].len - 0.12) * 6;
  return c;
};
const breakBonus = (bi, j) => {
  const kind = breakAfter[B[bi]];
  return -pauses[j].len * (kind === 2 ? 8 : 3);
};
const N = B.length;
const cost = Array.from({length: N}, () => new Map());
cost[0].set(-1, {c: 0, prev: null});
for (let bj = 1; bj < N; bj++) {
  const cands = bj === N - 1 ? [P] : [...Array(P).keys()];
  for (const pb of cands) {
    let best = null;
    for (let bi = Math.max(0, bj - 4); bi < bj; bi++) {
      const skipped = bj - bi - 1; // breaks with no pause of their own
      for (const [pa, v] of cost[bi]) {
        if (pa >= pb) continue;
        const sc = segCost(bi, bj, pa, pb);
        if (!isFinite(sc)) continue;
        const c = v.c + sc + skipped * 0.6 + (bj === N - 1 ? 0 : breakBonus(bj, pb));
        if (!best || c < best.c) best = {c, prev: [bi, pa]};
      }
    }
    if (best) cost[bj].set(pb, best);
  }
}
const path = [];
let node = [N - 1, P];
while (node) {
  path.unshift(node);
  node = cost[node[0]].get(node[1]).prev;
}
const anchors = path.map(([bi, pj]) => ({word: B[bi], t: bi === 0 ? t0 : pStart(pj), resume: pEnd(pj), pj}));

const out = [];
for (let a = 0; a < anchors.length - 1; a++) {
  const from = anchors[a].word + 1;
  const to = anchors[a + 1].word;
  const start = a === 0 ? anchors[0].t : anchors[a].resume;
  const end = anchors[a + 1].t;
  const seg = weight.slice(from, to + 1);
  const sum = seg.reduce((x, y) => x + y, 0);
  let t = start;
  for (let i = from; i <= to; i++) {
    const d = ((end - start) * weight[i]) / sum;
    out.push({word: words[i], start: +t.toFixed(2), end: +(t + d).toFixed(2)});
    t += d;
  }
}
writeFileSync('src/data/words.json', JSON.stringify(out, null, 1) + '\n');
console.log(`speech ${t0}-${t1}s, ${pauses.length} pauses, ${anchors.length - 2} anchored breaks, ${out.length} words`);
console.log(anchors.slice(1, -1).map((a) => `${words[a.word]}@${a.t.toFixed(2)}`).join('  '));
