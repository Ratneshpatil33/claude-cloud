# Apple GPU vs NVIDIA GPU: Reel script

**Length:** about 50 s at your ep3 pace (152 words at 182 wpm). A slower 170 wpm read runs about 54 s.
**Matchup:** Mac Studio with M5 Ultra (80-core GPU) vs. RTX 5080, both current as of fall 2026.
**Format:** 9:16 Reel or Short. Numbers are spelled out the way they should be read aloud.
**Arc:** Apple's core count looks tiny next to NVIDIA's (hook), then the reveal that each Apple core is far bigger than it sounds, then the real difference (NVIDIA builds for maximum output, Apple for efficiency), then Apple's memory twist, then an analogy and a share CTA that loops back to frame 1.

---

## Script

### 1 · HOOK · 0:00–0:09
**VO:** What's the difference between Apple's M5 Ultra Mac Studio, with eighty GPU cores, and NVIDIA's RTX fifty-eighty, with over ten thousand? How is Apple even competing?
**On screen:** `MAC STUDIO · M5 ULTRA · 80 GPU cores` | `RTX 5080 · 10,000+ CUDA cores`
**Visual:** No fade-in. Frame 0 already shows the Mac Studio and the card. A `pop` lands on each number as it appears. Under them, a balance scale slams down hard on the NVIDIA side, with Apple's 80 tiny next to a huge 10,000+. On the question, the overlay reads `HOW?`

### 2 · REVEAL · 0:09–0:18
**VO:** Because Apple's cores are bigger than you think. Each one packs a hundred and twenty-eight math units. NVIDIA counts every unit as a core. Multiply it out: nearly identical.
**On screen:** `1 Apple core = 128 math units` → `80 × 128 = 10,240` vs `10,752`
**Visual:** Zoom into one Apple core and burst it into a 16 × 8 grid of dots. Pull back as all 80 cores burst the same way, while a counter runs from 80 up to 10,240 beside NVIDIA's 10,752. The scale swings back to almost level.

### 3 · NEXT QUESTION · 0:18–0:21
**VO:** Then why is NVIDIA way more powerful? Opposite goals.
**On screen:** `33 vs 56 TFLOPS` → `MAX OUTPUT` vs `MAX EFFICIENCY`
**Visual:** Two power bars race and NVIDIA's lands about 1.7× higher. Then the frame splits into two labels, one over each device.

### 4 · DESIGN GOALS · 0:21–0:31
**VO:** NVIDIA builds for maximum output: the whole chip is GPU, fed three hundred and sixty watts. Apple builds for efficiency: its GPU shares one chip with the CPU, sipping a fraction.
**On screen:** `Whole chip = GPU · 360 W · 2.6 GHz` vs `Shared chip · ~1.6 GHz`
**Visual:** The card's fans spin up (the fan spin-up from the RGB-case animation) while a wattage needle swings to 360, and the whole die lights up as GPU. Then x-ray the Apple chip: the CPU, GPU, Neural Engine and media engines share one chip, the GPU is just one highlighted block, and its wattage needle barely moves.

### 5 · THE TWIST · 0:31–0:40
**VO:** But Apple's cheat code is memory. NVIDIA's best gaming card has thirty-two gigs. This Mac Studio shares up to five hundred and twelve between CPU and GPU.
**On screen:** `RTX 5090: 32 GB (its own)` vs `Mac Studio: 512 GB (shared)`
**Visual:** Use your v3 x-ray look. The card frosts over to expose the memory chips around the GPU, and the Mac Studio exposes one big memory pool with arrows to both CPU and GPU.

### 6 · PAYOFF · 0:40–0:44
**VO:** So AI models too big for any gaming card... run on a Mac.
**On screen:** `70B model · 42 GB` → ✗ card, ✓ Mac
**Visual:** Green weight blocks pour into the card's memory, overflow and turn red. Then they pour into the Mac's pool with room to spare. This calls back to ep3's "Llama 70B needs 42 GB."

### 7 · CLOSE · 0:44–0:50
**VO:** NVIDIA's a Ferrari. Apple's a moving truck. Send this to someone who thinks more cores means faster.
**On screen:** `Speed` vs `Space` → `more cores ≠ faster`
**Visual:** A Ferrari roars past, then its tiny trunk pops open and fits one "32 GB" box. A moving truck rolls its door up on a wall of "512 GB." The last frame snaps back to the 80 vs 10,000+ split from the hook, so the replay loops cleanly.


---

## Hook variants

Each one replaces scene 1 and leads into scene 2. Test them against the main hook with Instagram's Trial Reels.

- **B, question:** "Apple's M5 Ultra Mac Studio has eighty GPU cores. NVIDIA's RTX fifty-eighty has ten thousand, seven hundred and fifty-two. So NVIDIA has over a hundred times more?"
- **C, viewer's guess:** "Eighty GPU cores, or ten thousand, seven hundred and fifty-two. Which one would you buy?" (Start scene 2 with "Trick question." instead of "Because.")

## Want an exact match instead?

The RTX 4080 Super has exactly 10,240 CUDA cores, the same as 80 × 128. Swap it in and scene 2 can end on "the exact same count." It's last generation, though (about 52 TFLOPS, 320 W).

## Optional line

Add this only if your read comes in under about 45 s. It goes after scene 4 (+4 s):
"Plus almost twenty years of CUDA, the software most AI is built on."

## Caption

> Apple's M5 Ultra has 80 GPU cores. NVIDIA's RTX 5080 has 10,752. Turns out that's almost the same, so why is NVIDIA still faster, and what can a Mac do that a 5090 can't?
> Mac or NVIDIA for local AI? 👇

#nvidia #applesilicon #gpu #techexplained #localai

## Receipts for the comments

| Claim | Number |
| --- | --- |
| M5 Ultra GPU (Mac Studio) | 80 cores × 128 ALUs = 10,240 · ~1.62 GHz · ~33 TFLOPS FP32 (third-party estimates; Apple doesn't publish these) |
| RTX 5080 | 84 SMs × 128 = 10,752 CUDA cores · 2.62 GHz boost · ~56 TFLOPS · 360 W · 16 GB |
| The gap | 56 / 33 ≈ 1.7×: about 1.6× from clock speed (the payoff of NVIDIA's power budget) and 1.05× from the extra units |
| RTX 5090 | 32 GB GDDR7, the most on any GeForce card (rumored 50 Super cards top out at 24 GB) |
| Mac Studio (M5 Ultra, Aug 2026) | Up to 512 GB unified memory, ~1.2 TB/s |
| Llama 70B at 4-bit | ~42 GB |

## Where this departs from the source report

- **Bandwidth isn't NVIDIA's edge in this matchup.** The M5 Ultra reaches about 1.2 TB/s, against about 960 GB/s on the RTX 5080 and 1.79 TB/s on the 5090. The report's "2–3× bandwidth" is out of date, so the script puts the gap down to design goals (power budget and clock speed) instead.
- **AI and ray-tracing hardware isn't NVIDIA-only anymore.** Apple GPUs have had hardware ray tracing since M3, and M5 puts a Neural Accelerator in every GPU core. NVIDIA's versions are more mature, but "Apple has none" would get corrected in the comments.
- **TBDR vs IMR is left out.** NVIDIA has used tile-based rasterization since Maxwell (2014), so the clean TBDR-vs-IMR split is oversimplified. It's also too deep for 45 s.

## Scenes for timeline.json

The times are estimates at the ep3 pace. Re-time them from `words.json` after recording.

```json
[
  {"id": 1, "start": 0.0, "end": 8.57, "treat": "ANIM", "beat": "hook", "exit": "cut",
   "text": "What's the difference between Apple's M5 Ultra Mac Studio, with eighty GPU cores, and NVIDIA's RTX fifty-eighty, with over ten thousand? How is Apple even competing?"},
  {"id": 2, "start": 8.57, "end": 18.12, "treat": "ANIM", "beat": "body", "exit": "cut",
   "text": "Because Apple's cores are bigger than you think. Each one packs a hundred and twenty-eight math units. NVIDIA counts every unit as a core. Multiply it out: nearly identical."},
  {"id": 3, "start": 18.12, "end": 21.09, "treat": "ANIM", "beat": "loop", "exit": "cut",
   "text": "Then why is NVIDIA way more powerful? Opposite goals."},
  {"id": 4, "start": 21.09, "end": 31.3, "treat": "ANIM", "beat": "body", "exit": "cut",
   "text": "NVIDIA builds for maximum output: the whole chip is GPU, fed three hundred and sixty watts. Apple builds for efficiency: its GPU shares one chip with the CPU, sipping a fraction."},
  {"id": 5, "start": 31.3, "end": 40.2, "treat": "ANIM", "beat": "payoff", "exit": "cut",
   "text": "But Apple's cheat code is memory. NVIDIA's best gaming card has thirty-two gigs. This Mac Studio shares up to five hundred and twelve between CPU and GPU."},
  {"id": 6, "start": 40.2, "end": 44.49, "treat": "ANIM", "beat": "payoff", "exit": "cut",
   "text": "So AI models too big for any gaming card... run on a Mac."},
  {"id": 7, "start": 44.49, "end": 50.09, "treat": "ANIM", "beat": "close", "exit": "cut",
   "text": "NVIDIA's a Ferrari. Apple's a moving truck. Send this to someone who thinks more cores means faster."}
]
```

## Sources

- [What are Apple's GPU cores? (dmg)](https://www.youtube.com/watch?v=-TOdEjcFldI)
- [NanoReview: Apple M5 Ultra GPU (80-core)](https://nanoreview.net/en/gpu/apple-m5-ultra-gpu-80-core)
- [Flopper: Apple M5 Ultra](https://flopper.io/gpu/apple-m5-ultra)
- [CGChannel: Apple unveils M5 Ultra](https://www.cgchannel.com/?p=178333)
- [PetaPixel: the new Mac Studio supports up to 512GB](https://petapixel.com/2026/08/25/apples-new-mac-studio-supports-up-to-512gb-of-unified-memory/)
- [Guru3D: M5 Ultra Mac Studio launch](https://guru3d.com/story/apple-m5-ultra-mac-studio-launches-with-36core-cpu-80core-gpu-and-512gb-unified-memory/)
- [Tom's Hardware: RTX 50 Super plans](https://www.tomshardware.com/pc-components/gpus/nvidia-is-reportedly-still-planning-fabled-rtx-50-super-series-for-2026-leak-claims-lineup-could-now-include-a-potential-rtx-5060-super-with-12gb-of-vram)
- [eclincher: how the Instagram algorithm works in 2026](https://www.eclincher.com/articles/how-the-instagram-algorithm-works-in-2026)
