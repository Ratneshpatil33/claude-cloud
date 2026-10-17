# Shot map: Apple vs NVIDIA GPU (Reel)

**Runtime:** 49.4 s · 1,236 frames at the kit's 25 fps · 1080 × 1920
**Voiceover:** the voice-clone script in `script.md` (150 words).
**Timing:** shot times are estimated at your ep3 pace (0.33 s per word). After the clone renders, re-time every cut from `words.json`. The cue words listed in each shot are the anchors.
**Shots:** 23 shots, averaging 2.1 s. A new visual event lands every 1.5–2.5 s.

---

## Look and feel

**Canvas**
- Off-white `#F5F5F7` (the `apple-light` bg), with a soft white center glow (`radial-gradient(#FFFFFF 0%, #F5F5F7 70%)`) and 2% film grain.
- 3D shots use the v3 infinite white studio (`STUDIO_BG #F3F4F6`) so they cut cleanly against the flat shots.

**Type**
- SF Pro Display via the preset font stack. Apple's license only covers UI mock-ups, so for a public video, Inter Display is the safe drop-in (see Assets).
- Headlines: 700 weight, 96–120 px.
- Hero numbers: 800 weight, 280–340 px, tabular figures.
- Labels: 36–40 px. Specs: 28 px SF Mono.
- Tracking: −0.045em (preset).

**Color**
- Ink `#1D1D1F`, secondary `#6E6E73`, hairlines `rgba(0,0,0,.12)`.
- Data colors: Apple `#0A84FF`, NVIDIA `#76B900`, AI model `#AF52DE` (preset accent2), overflow `#FF3B30`.
- The model is purple in this episode, not your series green, because green belongs to NVIDIA here.

**Depth**
- Every product is a cut-out with a `SHADOW.lift` contact shadow.
- Reveals get one slow specular light band sweeping across the product.
- Text never sits on a product.

**Motion**
- Entrances use `EASE_OUT` (`bezier(.16,1,.3,1)`), Apple's long settle.
- Big objects use `settle`, small objects `pop`, punch-ins `snap`.
- Whips and zooms run inside `CameraMotionBlur` (`shutterAngle 180`, 10 samples).
- Only counters move linearly. Nothing bounces more than `pop` allows.

**Labels**
- v3 `Callout`: a hairline leader from a dot on the product to a small precise label, Apple spec-page style. No pills.

**Always on screen**
- `ProgressRail`.
- `Captions` (3–4 words per page) in the caption strip.
- A top-left section eyebrow, 26 px caps in `#6E6E73`: **CORES → DESIGN → MEMORY → VERDICT**.
- All hero type stays inside `SAFE` (left 80, right 180, top 240, bottom 440). Check with `--props='{"guides":true}'`.

**Cutting**
- Hard cuts on spoken beats.
- One zoom-through per section: into the Mac, into one core, into the die, into the memory.
- One persistent object, the **bars**, carries the story from 1.5 → 2.4 → 3.1 so viewers track one thing.

---

## Shot list

Times are in seconds, frames are `[start, end)` at 25 fps. **Cue** is the spoken word an event lands on. Asset IDs (A, N, S, R, M, F, I) refer to the table at the end.

### SECTION 1 · HOOK (0.0–8.9)

**1.1 · 0.0–1.3 · f0–33** · VO: "What's the difference between"
- **Picture:** Two-up hero, already lit at frame 0 with no fade-in. Mac Studio on the left (3/4 front) and RTX 5080 Founders Edition on the right (3/4), a hairline divider between them. One light band sweeps across both.
- **On screen:** The text hook sits at the top, readable in half a second: **80 cores vs 10,000+**. The numbers are 200 px, "vs" is 60 px in `#6E6E73`.
- **Motion:** 3% slow push. The products float up 12 px on `settle`.
- **SFX:** `signature` at 0.0.
- **Assets:** A1, N1.
- **Build:** `Stage` + two cut-out `Img`s with `SHADOW.lift`. `MaskReveal` for the headline (frame 0 already shows the mask edge).

**1.2 · 1.3–3.3 · f33–83** · VO: "Apple's M five Ultra Mac Studio"
- **Picture:** Hard cut to the Mac Studio alone, filling 70% of the width. If you use the 3D model (M1), add a slow 15° turntable.
- **On screen:** A `Callout` from the top of the case: **Mac Studio · M5 Ultra**.
- **Motion:** `snap` punch-in 1.00 → 1.06 on "Mac Studio" (2.6 s).
- **SFX:** `whoosh` −6 dB on the cut.
- **Assets:** A2 (or M1).

**1.3 · 3.3–4.6 · f83–115** · VO: "with eighty GPU cores"
- **Picture:** Same shot. The Mac Studio slides 25% left and a huge counter lands on its right.
- **On screen:** **80**, 320 px in Apple blue, with **GPU cores** under it at 40 px.
- **Motion:** `Odometer` 0 → 80 starting on "eighty" (3.6 s), 0.5 s long, then `pop`.
- **SFX:** `pop` on landing (3.9 s).
- **Build:** `Odometer`.

**1.4 · 4.6–7.2 · f115–180** · VO: "and NVIDIA's RTX fifty-eighty, with over ten thousand?"
- **Picture:** Whip-pan right with motion blur to the RTX 5080 hero, fans toward the camera.
- **On screen:**
  - `Callout`: **GeForce RTX 5080**.
  - `Odometer` 0 → 10,000 in NVIDIA green, rolling fast from "over" (6.3 s).
  - A **+** pops in on "thousand" (6.9 s), with **CUDA cores** under it.
- **SFX:** `whoosh` on the whip (4.6), `pop` on the "+" (6.9).
- **Assets:** N2.
- **Build:** x-translate inside `CameraMotionBlur`, or `TransitionSeries` with `slide({direction: 'from-right'})`.

**1.5 · 7.2–8.9 · f180–223** · VO: "How is Apple even competing?"
- **Picture:** Pull back to the 1.1 two-up. A vertical bar grows under each product. Apple's is a 6 px sliver (80). NVIDIA's grows so tall it bursts out the top of the frame, and the camera tilts up 300 px chasing it, then snaps back (7.2–7.9).
- **On screen:** A centered **How?** lands on "competing" (8.6 s) with a `WeightWord` swell.
- **SFX:** `riser` (lead 1 s) peaking on "competing" (8.6).
- **Build:** Two SVG rects on `settle`. Keep this bar component, because it comes back in 2.4 and 3.1.

### SECTION 2 · CORES (8.9–19.1)

**2.1 · 8.9–11.5 · f223–288** · VO: "Because Apple's cores are bigger than you think."
- **Picture:** Zoom-through. The camera pushes into the Mac Studio's top plate, then a match-dissolve fills the frame with the M5 Ultra chip render. An 80-tile grid overlay lights up over the GPU area in a wave from the center.
- **On screen:**
  - Eyebrow: **CORES**.
  - `Callout` to one tile: **1 GPU core**.
  - Footnote (22 px): *illustrative layout*.
- **SFX:** `whoosh` on the zoom (8.9).
- **Assets:** A3.
- **Build:** Scale 1 → 6 in `CameraMotionBlur`, then the chip `Img` and an SVG tile grid (8 × 10) with staggered `ramp`.

**2.2 · 11.5–14.8 · f288–370** · VO: "Each one packs a hundred and twenty-eight math units,"
- **Picture:** Zoom into one tile. It bursts into a 16 × 8 grid of 128 small rounded squares (math units), popping in a ripple from the center. The squares are flat with a faint top highlight, like Apple's icon tiles.
- **On screen:**
  - `Odometer` **128** (260 px), landing on "twenty-eight" (13.5 s).
  - Mono label: **128 math units (ALUs) = 1 Apple GPU core**.
- **SFX:** A soft `tick` cluster under the ripple (−9 dB). `pop` when the counter lands (13.5).
- **Build:** SVG grid; each square's `pop` delay = distance from center × 0.6 frames.

**2.3 · 14.8–17.1 · f370–428** · VO: "but NVIDIA counts every unit as a core."
- **Picture:** Split screen.
  - **Left (Apple):** the same 128 squares wrapped in one bracket, labeled **= 1 core**.
  - **Right (NVIDIA):** one Blackwell SM drawn as 4 partitions × 32 lanes = 128 squares. On "every unit" (15.5 s), a tiny **core** tag pops on each square in a cascade, 128 tags in 1 s. The density is the joke.
- **On screen:** Bottom labels **Apple: 1 core** | **NVIDIA: 128 "CUDA cores"**.
- **SFX:** A fast `tick` cascade (−9 dB), then `pop` on "core" (16.8).
- **Reference:** N4, the whitepaper SM diagram, for the 4 × 32 layout. Redraw it in your style rather than pasting the PDF figure.

**2.4 · 17.1–19.1 · f428–478** · VO: "So the totals are nearly identical."
- **Picture:** Back to the 1.5 bars. NVIDIA's tower drops, Apple's sliver grows 128×, and they settle at almost the same height. This is the visual payoff of the hook.
- **On screen:** Under the bars, **80 × 128 = 10,240** | **84 × 128 = 10,752**, with both `Odometer`s rolling.
- **SFX:** `whoosh` on the drop (17.1), soft `pop` when the bars level on "identical" (18.8, −3 dB).
- **Build:** The same bar component with new heights on `settle`.

### SECTION 3 · DESIGN (19.1–30.6)

**3.1 · 19.1–21.4 · f478–535** · VO: "So why is NVIDIA still more powerful?"
- **Picture:** The same two bars re-label and re-grow as compute. Apple's lands at 33 and NVIDIA's at 56, 1.7× taller.
- **On screen:**
  - **33** vs **56** **TFLOPS**.
  - Eyebrow: **DESIGN**.
  - Footnote: *FP32 · M5 Ultra figure is a third-party estimate*.
- **SFX:** none; the silence after the riser is the contrast.

**3.2 · 21.4–23.4 · f535–585** · VO: "They are built for opposite goals."
- **Picture:** Everything clears. One hairline draws edge to edge across the middle. RTX thumbnail pins slide to the left end and Mac thumbnail pins to the right end, landing on "opposite" (22.7 s).
- **On screen:** End labels **MAX OUTPUT** (left) and **MAX EFFICIENCY** (right), via `MaskReveal`.
- **SFX:** two short `whoosh`es (−6 dB) as the pins slide, then `pop` on landing (22.7).
- **Build:** `evolvePath` (`@remotion/paths`) for the line draw. Pins on `pop`.

**4.1 · 23.4–25.0 · f585–625** · VO: "NVIDIA builds for maximum output,"
- **Picture:** RTX 5080 full frame. Fans spin on the 3D model (M2), or use a 1.6 s trailer clip (N5). A circular wattage gauge sweeps up on the right.
- **On screen:** Gauge `Odometer` **360 W**, with **2.62 GHz boost** in mono under it.
- **SFX:** `riser` (lead 1.5 s) peaking on "output" (24.7).
- **Assets:** N2 or M2, optional N5.
- **Build:** SVG arc gauge drawn with `evolvePath`.

**4.2 · 25.0–27.3 · f625–683** · VO: "with a whole chip just for graphics."
- **Picture:** X-ray through the shroud to a stylized GB203 die: 84 SM tiles grouped in GPC blocks, after N4's block-diagram style. On "whole chip" (25.7 s), the entire die floods NVIDIA green in a wave from the center.
- **On screen:** `Callout` **Entire chip = GPU**, with mono **84 SMs · 378 mm²**.
- **SFX:** `tick` under the flood wave (−9 dB), `pop` on "graphics" (27.0).
- **Build:** The v3 x-ray look, then an SVG die.

**4.3 · 27.3–28.6 · f683–715** · VO: "Apple builds for efficiency,"
- **Picture:** Hard cut to calm. The Mac Studio hero in cool daylight. The same gauge as 4.1 sits beside it and its needle barely lifts.
- **On screen:** Gauge label **Power: a fraction**, no number. Apple doesn't publish GPU wattage.
- **SFX:** none. The missing riser after 4.1 is the effect.

**4.4 · 28.6–30.6 · f715–765** · VO: "sharing one chip with the CPU."
- **Picture:** The M5 Ultra chip render gets a floor-plan overlay: CPU cluster, GPU (blue, highlighted), Neural Engine and media engines.
- **On screen:**
  - Four `Callout`s land one by one: **CPU**, **GPU**, **Neural Engine**, **Media**.
  - Footnote: *illustrative layout*.
- **SFX:** four soft `pop`s (−6 dB), 6 frames apart.
- **Assets:** A3 (or A4).

### SECTION 4 · MEMORY (30.6–42.8)

**5.1 · 30.6–32.6 · f765–815** · VO: "But Apple's secret weapon is memory."
- **Picture:** Pattern interrupt at 62% of the runtime. The frame clears to off-white. A single memory package (S5 macro photo, or M3 3D chip) rises in with a light sweep.
- **On screen:** **Memory.** via `MaskReveal`, 200 px. Eyebrow: **MEMORY**.
- **SFX:** 4 frames of silence, then `signature` on "memory" (32.3).
- **Assets:** S5 or M3.

**5.2 · 32.6–34.9 · f815–873** · VO: "NVIDIA's best gaming card has thirty-two gigabytes."
- **Picture:** RTX 5090 hero, then x-ray. The 16 GDDR7 packages ringing the die glow, and a small frosted-glass container labeled **32 GB** forms beside the card.
- **On screen:** **RTX 5090 · 32 GB · its own memory**.
- **SFX:** `pop` on "thirty-two" (34.3).
- **Assets:** N3, optional N6 (PCB shot).
- **Build:** The container is a rounded rect with `backdrop-filter: blur(20px)`, a 1 px white border and an inner shadow.

**5.3 · 34.9–38.6 · f873–965** · VO: "A Mac Studio can share up to five hundred and twelve."
- **Picture:** Mac Studio, then x-ray. One unified memory pool wraps the chip, with animated flow lines from **CPU** and **GPU** both drawing from it. A giant **512 GB** container then grows beside the 32 GB one, 16× its height. The camera pulls back to fit both.
- **On screen:** `Odometer` **32 → 512 GB**, with **shared by CPU + GPU** under it.
- **SFX:** `riser` (lead 1.5 s) peaking on "twelve" (38.2).
- **Build:** `FlowDiagram` (CPU, GPU, Memory nodes), `Odometer`, and the two containers.

**6.1 · 38.6–41.5 · f965–1038** · VO: "So AI models too big for any gaming card"
- **Picture:** The real proof first. Your ep3 screenshot of the GGUF table (R1) slides in inside a macOS window frame, and a highlighter sweeps the **Q4_K_M · 42.52GB** row. A purple block, **Llama 3.3 70B · 42.5 GB**, lifts out of the screenshot and drops into the 32 GB container. It overflows, shakes, and turns red.
- **On screen:** **42.5 GB > 32 GB** ✗.
- **SFX:** `whoosh` on the lift (39.5), then a low `pop` −3 dB plus the shake on "card" (41.2).
- **Assets:** R1 (already in the repo), R2 as the live page.
- **Build:** `MediaShot` inside a window frame. Block on `settle`; shake = `drift` with a high frequency and a 2-frame decay.

**6.2 · 41.5–42.8 · f1038–1070** · VO: "run on a Mac."
- **Picture:** The block slides into the 512 GB container and settles at about 8% full. A blue check draws on.
- **On screen:** **Fits. ~470 GB to spare.**
- **SFX:** `pop` on "Mac" (42.5).

### SECTION 5 · VERDICT (42.8–49.4)

**7.1 · 42.8–44.1 · f1070–1103** · VO: "NVIDIA is a Ferrari,"
- **Picture:** The only full-bleed real footage in the film. A red supercar blasts past (S1). After 40 s of off-white, the color jolt re-grabs attention right before the CTA. At 43.6 s it shrinks into a rounded card (radius 30) on off-white.
- **On screen:** **Speed: insane** · **Trunk: tiny**.
- **SFX:** `whoosh` on the pass (42.8). Keep the clip muted.
- **Assets:** S1 (S2 still as fallback).

**7.2 · 44.1–46.1 · f1103–1153** · VO: "and Apple is a moving truck."
- **Picture:** A matching rounded card beside the Ferrari: a box truck with its rear roll-up door opening, or one driving (S3).
- **On screen:** **Space: massive** · **Built for the load**.
- **SFX:** `whoosh` −6 dB (44.1).
- **Assets:** S3 (S4 still as fallback).

**7.3 · 46.1–49.4 · f1153–1236** · VO: "Send this to someone who thinks more cores means faster."
- **Picture:** The cards morph back into the products: the Ferrari into the RTX 5080, the truck into the Mac Studio. They land exactly in the 1.1 two-up composition. A paper-plane icon (I1 `send`) flies toward the share button on the right rail (around x 1000, y 1500).
- **On screen:**
  - **Send this to someone who thinks more cores = faster**.
  - In the last 6 frames, the hook headline **80 cores vs 10,000+** fades back in, so the final frame equals frame 0 and the loop is seamless.
- **SFX:** `whoosh` on the morph (46.1), `pop` on the plane (47.1). End on silence so the loop doesn't click.
- **Assets:** A1, N1, I1.

---

## Engagement mechanics in this cut

- **Frame 0 is the thumbnail.** It shows two hero products plus the "80 vs 10,000+" question with no fade-in, and the open question is spoken by 8.6 s.
- **Set-up and payoff on one object.** The bar that breaks the frame (1.5) comes back level (2.4), then re-grows as power (3.1). Viewers track one thing across 12 seconds.
- **Two density gags people rewatch:** the 128-square burst (2.2) and the 128 "core" tags (2.3).
- **Pattern interrupt** at 30.6 s (Memory). The twist lands at 62% of the runtime, where drop-off usually starts.
- **Real proof.** The Hugging Face table (6.1) makes the claim checkable, and that heads off "source?" comments.
- **Color jolt** (7.1) before the CTA. Then a share-icon CTA, because sends are Instagram's strongest reach signal, and a last frame that equals frame 0.

## SFX cues for timeline.json

These use your named sfx-v2 kinds. The times are estimates, so re-time them from `words.json`. Keep it restrained: premium sound design leaves space.

```json
[
  {"at": 0.0,  "sound": "signature"},
  {"at": 1.3,  "sound": "whoosh", "gainDb": -6},
  {"at": 3.9,  "sound": "pop"},
  {"at": 4.6,  "sound": "whoosh"},
  {"at": 6.9,  "sound": "pop"},
  {"at": 8.6,  "sound": "riser", "lead": 1},
  {"at": 8.9,  "sound": "whoosh"},
  {"at": 13.5, "sound": "pop"},
  {"at": 16.8, "sound": "pop"},
  {"at": 18.8, "sound": "pop", "gainDb": -3},
  {"at": 22.7, "sound": "pop"},
  {"at": 24.7, "sound": "riser", "lead": 1.5},
  {"at": 27.0, "sound": "pop"},
  {"at": 32.3, "sound": "signature"},
  {"at": 34.3, "sound": "pop"},
  {"at": 38.2, "sound": "riser", "lead": 1.5},
  {"at": 41.2, "sound": "pop", "gainDb": -3},
  {"at": 42.5, "sound": "pop"},
  {"at": 42.8, "sound": "whoosh"},
  {"at": 44.1, "sound": "whoosh", "gainDb": -6},
  {"at": 46.1, "sound": "whoosh"},
  {"at": 47.1, "sound": "pop"}
]
```

<!-- ASSETS -->
