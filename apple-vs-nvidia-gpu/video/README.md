# Apple vs NVIDIA GPU reel (Remotion)

A 52-second 1080 × 1920 reel at 30 fps, built from `../shot-map.md` and timed to the voice-clone voiceover in `public/voice/voiceover.wav`.

## Usage

```bash
npm install
npm run dev      # Remotion Studio
npm run render   # out/apple-vs-nvidia-gpu.mp4 (H.264, CRF 18, AAC 320k)
npm run words    # re-time src/data/words.json after replacing the voiceover
npm run sfx      # regenerate the synthesized sound effects
```

`remotion.config.ts` points at the sandbox's headless Chromium. To use another browser, set `REMOTION_BROWSER`.

## How it fits together

- `scripts/align-words.mjs` finds the pauses in the voiceover and anchors the script's punctuation to them with a global alignment. It then spreads each phrase's words by syllable count. This needs no speech model.
- `src/timing.ts` turns those word times into frames. Every cut and sound cue is anchored to a word, so a new voiceover only needs `npm run words`.
- `src/Reel.tsx` holds the shot list (23 cuts, numbered as in the shot map), the sound-cue list, the chapter eyebrows, the captions and the progress rail.
- `src/shots.tsx` contains one component per shot.
- `src/devices.tsx` has code-drawn stand-ins for the Mac Studio, the RTX 50 Founders Edition, the M5 Ultra package, a GB203-style die, a memory package, and the closing car and truck.
- `src/ui.tsx` has the odometer, hairline callouts, gauge, glass containers, captions and background.
- `scripts/make-sfx.mjs` synthesizes the sounds (whoosh, pop, tick, riser, signature, thump, error) with ffmpeg and peak-normalizes them to −6 dBFS.

## Swapping in the real assets

The products are drawn in code because the official images couldn't be downloaded from this sandbox. To use the photos listed in `../shot-map.md`:

1. Put the cut-outs in `public/media/`.
2. Replace `<MacStudio … />` and `<GpuCard … />` in `src/shots.tsx` with `<Img src={staticFile('media/…')} />` at the same width.

The x-ray shots (4.2, 5.2, 5.3) and the chip shots stay code-drawn.
