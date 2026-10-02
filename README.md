# GPU in an RGB PC case — Remotion animation

A 12-second, 1920×1080 @ 30fps [Remotion](https://www.remotion.dev) animation of a
graphics card being installed in a glass-panel PC case that then lights up with
synced RGB, all on an off-white background.

## Storyboard

| Frames  | Beat |
| ------- | ---- |
| 0–24    | Case rises into frame on an off-white backdrop |
| 24–50   | Tempered-glass side panel slides off |
| 50–94   | GPU flies in and seats into its vertical mount (with a "seated" pulse) |
| 94–136  | Side panel slides back on |
| 136–172 | Power on: a light sweep turns on every LED, fans spin up |
| 172–252 | Camera pushes in on the GPU while the rainbow wave flows |
| 252–360 | Pull back to the end card: "Built to glow." |

## Usage

```bash
npm install
npm run dev       # open Remotion Studio
npm run render    # render to out/gpu-rgb-case.mp4
npm run still     # render a single frame to out/still.png
```

If Remotion can't download its headless browser in your environment, point it at
an existing one with `--browser-executable=/path/to/chrome`.

## Structure

- `src/timeline.ts` — canvas size, key frames, layout, and the shared RGB/fan math
  (hue wave, power-on sweep, fan spin-up).
- `src/GpuRgbCase.tsx` — the composition: camera moves, background, captions, end card.
- `src/components/PcCase.tsx` — chassis, motherboard, AIO cooler, RAM, fans, PSU
  shroud, LED strips, glass panel.
- `src/components/Gpu.tsx` — the triple-fan graphics card.
- `src/components/Fan.tsx`, `src/components/RgbRing.tsx` — fans and segmented LED rings.

All visuals are vector SVG built in code; "Aurora" is a fictional brand.
