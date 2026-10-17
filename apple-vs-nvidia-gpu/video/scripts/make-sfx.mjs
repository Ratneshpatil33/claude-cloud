// Synthesizes the reel's sound effects with ffmpeg, so the project needs no downloaded audio.
// Each sound's loudest point (its "peak", in seconds) is listed in src/data/sfx.json for cue alignment.
// Usage: node scripts/make-sfx.mjs
import {execFileSync} from 'node:child_process';
import {mkdirSync, renameSync, writeFileSync} from 'node:fs';

mkdirSync('public/sfx', {recursive: true});
const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args]);
const out = (name) => ['-ar', '48000', '-ac', '2', `public/sfx/${name}.wav`];

// Soft air whoosh: band-limited pink noise that swells to a peak at 0.28 s and tails off.
ff(['-f', 'lavfi', '-i', 'anoisesrc=color=pink:duration=0.9:amplitude=0.9:seed=7',
  '-af', "highpass=f=350,lowpass=f=5200,volume='if(lt(t,0.28),pow(t/0.28,2.2),exp(-(t-0.28)*7))':eval=frame,afade=t=out:st=0.75:d=0.15,aecho=0.6:0.4:40:0.25", ...out('whoosh')]);

// Pop: a short, rounded pluck with a falling pitch.
ff(['-f', 'lavfi', '-i', "aevalsrc='0.55*sin(2*PI*(820*t-1900*t*t))*exp(-t*32)*(1-exp(-t*900))':s=48000:d=0.22", ...out('pop')]);

// Tick: a tiny bright click for counters and grids.
ff(['-f', 'lavfi', '-i', "aevalsrc='0.45*sin(2*PI*3100*t)*exp(-t*260)+0.2*sin(2*PI*1500*t)*exp(-t*180)':s=48000:d=0.05", ...out('tick')]);

// Riser: noise plus a rising tone that peaks at 1.5 s, then a quick release.
ff(['-f', 'lavfi', '-i', 'anoisesrc=color=pink:duration=1.7:amplitude=0.6:seed=3',
  '-f', 'lavfi', '-i', "aevalsrc='0.32*sin(2*PI*(180*t+260*t*t))':s=48000:d=1.7",
  '-filter_complex', "[0:a]highpass=f=600,lowpass=f=7000[n];[n][1:a]amix=inputs=2:normalize=0,volume='if(lt(t,1.5),pow(t/1.5,3),exp(-(t-1.5)*30))':eval=frame", ...out('riser')]);

// Signature: a soft glassy chime (fifth and octave) with a short room tail.
ff(['-f', 'lavfi', '-i', "aevalsrc='(0.30*sin(2*PI*880*t)+0.18*sin(2*PI*1318.5*t)+0.10*sin(2*PI*1760*t)+0.06*sin(2*PI*2637*t))*exp(-t*2.6)*(1-exp(-t*160))':s=48000:d=1.8",
  '-af', 'aecho=0.7:0.5:60|120:0.3|0.18', ...out('signature')]);

// Thump: a low, soft body hit for landings and the memory pivot.
ff(['-f', 'lavfi', '-i', "aevalsrc='0.9*sin(2*PI*(95*t-60*t*t))*exp(-t*10)*(1-exp(-t*600))':s=48000:d=0.6", ...out('thump')]);

// Error: two short low buzzes for the model that doesn't fit.
ff(['-f', 'lavfi', '-i', "aevalsrc='0.35*(sin(2*PI*150*t)+0.5*sin(2*PI*300*t))*(exp(-t*22)*lt(t,0.12)+exp(-(t-0.14)*22)*gte(t,0.14))':s=48000:d=0.4", ...out('error')]);

// Peak-normalize every file to -6 dBFS so cue gains mean the same thing for each sound.
for (const name of ['whoosh', 'pop', 'tick', 'riser', 'signature', 'thump', 'error']) {
  const file = `public/sfx/${name}.wav`;
  const probe = execFileSync('sh', ['-c', `ffmpeg -hide_banner -i ${file} -af volumedetect -f null - 2>&1 | grep max_volume`]).toString();
  const max = parseFloat(probe.split('max_volume:')[1]);
  ff(['-i', file, '-af', `volume=${(-6 - max).toFixed(2)}dB`, `public/sfx/${name}.tmp.wav`]);
  renameSync(`public/sfx/${name}.tmp.wav`, file);
}

const peaks = {whoosh: 0.28, pop: 0.01, tick: 0.002, riser: 1.5, signature: 0.02, thump: 0.01, error: 0.01};
writeFileSync('src/data/sfx.json', JSON.stringify(peaks, null, 1) + '\n');
console.log('wrote', Object.keys(peaks).join(', '));
