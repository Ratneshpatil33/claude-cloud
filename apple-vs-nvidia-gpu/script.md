# Apple GPU vs NVIDIA GPU: Reel script

**Length:** about 46 s at your ep3 pace (140 words at 182 wpm). A slower 170 wpm read runs about 49 s.
**Format:** 9:16 Reel or Short. Numbers are spelled out the way they should be read aloud.
**Arc:** a contradiction you can see (hook), then what a "core" actually is, then why NVIDIA is faster, then Apple's memory twist, then an analogy and a share CTA that loops back to frame 1.

---

## Script

### 1 · HOOK · 0:00–0:05
**VO:** These two have the exact same number of GPU cores. And one's almost twice as powerful.
**On screen:** `M2 ULTRA · 76 cores` | `RTX 4080 · 9,728 cores` → `76 = 9,728` *(not a typo)*
**Visual:** No fade-in. Frame 0 already shows both devices and both numbers, so viewers see 76 vs 9,728 while they hear "exact same." The "=" slams in between them on "same," with a `pop` on each number and a `whoosh` on the "=". On "powerful," a power bar on the NVIDIA side shoots to nearly double the Mac's.

### 2 · BODY · 0:05–0:13
**VO:** Apple bundles a hundred and twenty-eight math units into one core. NVIDIA calls every single unit a core. Same count, different labels.
**On screen:** `1 Apple core = 128 math units` → `76 × 128 = 9,728`
**Visual:** Zoom into one Apple core and burst it into a 16 × 8 grid of dots. Do the same to one NVIDIA SM (4 × 32 dots), with every dot tagged "core."

### 3 · LOOP · 0:13–0:16
**VO:** So if the cores match, why the power gap? Watts.
**On screen:** `27 vs 49 TFLOPS` → **WATTS**
**Visual:** Bring back the hook's power bars, now labeled with the real numbers. Hard cut to a lightning bolt on "Watts."

### 4 · BODY · 0:16–0:24
**VO:** It gulps three hundred and twenty of them to run at nearly double the speed. Apple's GPU sips a fraction, sharing one chip with the CPU.
**On screen:** `320 W · 2.5 GHz` vs `1.4 GHz` → `CPU + GPU: one chip`
**Visual:** The card's fans spin up (the fan spin-up from the RGB-case animation) while a wattage needle swings to 320. Then x-ray the Apple chip: the CPU, GPU, Neural Engine and media engines sit on one die, with the GPU highlighted.

### 5 · PAYOFF · 0:24–0:35
**VO:** But Apple's cheat code is memory. NVIDIA's best gaming card has thirty-two gigs of its own. Apple's GPU shares one giant pool with the CPU, up to five hundred and twelve.
**On screen:** `RTX 5090: 32 GB (its own)` vs `Mac Studio: 512 GB (shared)`
**Visual:** Use your v3 x-ray look. The card frosts over to expose the VRAM chips around the GPU die, and the Mac exposes one big memory pool with arrows to both CPU and GPU.

### 6 · PAYOFF · 0:35–0:39
**VO:** So AI models too big for any gaming card... run on a Mac.
**On screen:** `70B model · 42 GB` → ✗ card, ✓ Mac
**Visual:** Green weight blocks pour into the card's 32 GB, overflow and turn red. Then they pour into the Mac's pool with room to spare. This calls back to ep3's "Llama 70B needs 42 GB."

### 7 · CLOSE · 0:39–0:46
**VO:** NVIDIA's a Ferrari with a tiny trunk. Apple's a moving truck. Send this to someone who still thinks more cores means faster.
**On screen:** `Speed` vs `Space` → `more cores ≠ faster`
**Visual:** A Ferrari's tiny trunk pops open and fits one "32 GB" box. A moving truck rolls its door up on a wall of "512 GB." The last frame snaps back to the "76 = 9,728" split from the hook, so the replay loops cleanly.

---

## Hook variants

Each one replaces scene 1. Test them against the main hook with Instagram's Trial Reels.

- **B, 128× the cores:** "This NVIDIA card has a hundred and twenty-eight times the cores. It's not even twice as powerful." Show a `×128` badge between 9,728 and 76, then power bars that stop short of 2×. The "128" pays off in scene 2. Scene 3 works as written. Runs about 46.5 s.
- **C, underdog AI:** "Seventy-six GPU cores versus nearly ten thousand. Only one can fit this AI model. It's the Mac." A `70B model · 42 GB` block bounces off the card and lands in the Mac. That question stays open until scene 6. This hook never mentions power, so change scene 3 back to "So why is the NVIDIA card almost twice as powerful? Watts." Runs about 47 s.

Test the main hook against C first. They pull on different things, a puzzle versus Mac-vs-PC and AI, so the result tells you more than testing two similar phrasings.

## Optional line

Add this only if your read comes in under about 46 s. It goes after scene 4 (+4 s):
"Plus almost twenty years of CUDA, the software most AI is built on."

## Caption

> Apple's 76 GPU cores = NVIDIA's 9,728 CUDA cores. So why is NVIDIA almost 2× faster, and what can a Mac do that a 5090 can't?
> Mac or NVIDIA for local AI? 👇

#nvidia #applesilicon #gpu #techexplained #localai

## Receipts for the comments

| Claim | Number |
| --- | --- |
| M2 Ultra GPU | 76 cores × 128 ALUs = 9,728 · ~1.4 GHz · ~27.2 TFLOPS FP32 |
| RTX 4080 | 76 SMs × 128 = 9,728 CUDA cores · 2.5 GHz boost · ~48.7 TFLOPS · 320 W · 16 GB |
| The gap | 48.7 / 27.2 ≈ 1.8×, the same ratio as the clocks (2.505 / 1.398 GHz) |
| RTX 5090 | 32 GB GDDR7, the most on any GeForce card (rumored 50 Super cards top out at 24 GB) |
| Mac Studio (M5 Ultra, Aug 2026) | Up to 512 GB unified memory, 80-core GPU, ~1.2 TB/s |
| Llama 70B at 4-bit | ~42 GB |

## Where this departs from the source report

- **Bandwidth isn't NVIDIA's edge in this matchup.** The M2 Ultra has 800 GB/s and the RTX 4080 has about 717 GB/s. The M5 Ultra now reaches about 1.2 TB/s against the 5090's 1.79 TB/s, so the report's "2–3× bandwidth" is out of date. The script blames watts and clock speed instead, which account for the whole 1.8× gap.
- **AI and ray-tracing hardware isn't NVIDIA-only anymore.** Apple GPUs have had hardware ray tracing since M3, and M5 puts a Neural Accelerator in every GPU core. NVIDIA's versions are more mature, but "Apple has none" would get corrected in the comments.
- **TBDR vs IMR is left out.** NVIDIA has used tile-based rasterization since Maxwell (2014), so the clean TBDR-vs-IMR split is oversimplified. It's also too deep for 45 s.

## Scenes for timeline.json

The times are estimates at the ep3 pace. Re-time them from `words.json` after recording.

```json
[
  {"id": 1, "start": 0.0, "end": 5.27, "treat": "ANIM", "beat": "hook", "exit": "cut",
   "text": "These two have the exact same number of GPU cores. And one's almost twice as powerful."},
  {"id": 2, "start": 5.27, "end": 12.52, "treat": "ANIM", "beat": "body", "exit": "cut",
   "text": "Apple bundles a hundred and twenty-eight math units into one core. NVIDIA calls every single unit a core. Same count, different labels."},
  {"id": 3, "start": 12.52, "end": 15.82, "treat": "ANIM", "beat": "loop", "exit": "cut",
   "text": "So if the cores match, why the power gap? Watts."},
  {"id": 4, "start": 15.82, "end": 24.38, "treat": "ANIM", "beat": "body", "exit": "cut",
   "text": "It gulps three hundred and twenty of them to run at nearly double the speed. Apple's GPU sips a fraction, sharing one chip with the CPU."},
  {"id": 5, "start": 24.38, "end": 34.6, "treat": "ANIM", "beat": "payoff", "exit": "cut",
   "text": "But Apple's cheat code is memory. NVIDIA's best gaming card has thirty-two gigs of its own. Apple's GPU shares one giant pool with the CPU, up to five hundred and twelve."},
  {"id": 6, "start": 34.6, "end": 38.88, "treat": "ANIM", "beat": "payoff", "exit": "cut",
   "text": "So AI models too big for any gaming card... run on a Mac."},
  {"id": 7, "start": 38.88, "end": 46.13, "treat": "ANIM", "beat": "close", "exit": "cut",
   "text": "NVIDIA's a Ferrari with a tiny trunk. Apple's a moving truck. Send this to someone who still thinks more cores means faster."}
]
```

## Sources

- [What are Apple's GPU cores? (dmg)](https://www.youtube.com/watch?v=-TOdEjcFldI)
- [M2 Ultra 76-core GPU specs (eatyourbytes)](https://www.eatyourbytes.com/applecpu-detail/apple-m2-ultra-76-core-gpu/)
- [PetaPixel: the new Mac Studio supports up to 512GB](https://petapixel.com/2026/08/25/apples-new-mac-studio-supports-up-to-512gb-of-unified-memory/)
- [Guru3D: M5 Ultra Mac Studio launch](https://guru3d.com/story/apple-m5-ultra-mac-studio-launches-with-36core-cpu-80core-gpu-and-512gb-unified-memory/)
- [Tom's Hardware: RTX 50 Super plans](https://www.tomshardware.com/pc-components/gpus/nvidia-is-reportedly-still-planning-fabled-rtx-50-super-series-for-2026-leak-claims-lineup-could-now-include-a-potential-rtx-5060-super-with-12gb-of-vram)
- [eclincher: how the Instagram algorithm works in 2026](https://www.eclincher.com/articles/how-the-instagram-algorithm-works-in-2026)
