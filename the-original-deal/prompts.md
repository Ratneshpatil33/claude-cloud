# The Original Deal: Omni Prompts

This is the companion to [`shot-map.md`](shot-map.md). It has 16 prompts for Gemini Omni Flash, numbered to match the shots, plus 5 reference-image prompts to make first.

## How to use

1. **Model:** Gemini Omni Flash, in the Gemini app, Flow, or the API (`gemini-omni-1.1-flash`).
2. **Every clip:** 9:16 vertical, at the length listed per shot (**4 s** or **6 s**). Test the wording at draft resolution (360p/720p), then render the final at 1080p.
3. **Make the reference images R1–R5 first** (below), and attach the ones each shot lists. In Flow that's ingredients; in the API, image parts. Omni takes at most 5 per call.
4. **Paste the prompt as-is.** Each one already has:
   - the single-take lock
   - `[timecodes]` matched to the voiceover
   - camera and lens
   - the character anchor, word for word
   - light and style
   - audio limited to ambient sound
   - the exclusions
5. **If a clip is close, fix it with an edit turn rather than a re-roll.** Every shot has an "If it misses" line. Keep edits short, make one change, and end with "Keep everything else the same."
6. **Trim to the "Use" window** when you cut to the voiceover. The windows line the action up with the words.

> Going 16:9 instead? Delete "Vertical 9:16" from each prompt and set the aspect ratio to 16:9. The shots still work, but S04 and S08 lose some of their vertical drama.

### Settings at a glance

| Shot | Length | Attach | Use (clip seconds) | On screen |
|---|---|---|---|---|
| S01 The Reach | 4 s | R4, R5 | 0.0–3.3 | 0.00–3.30 |
| S02 Imagine | 4 s | R1, R2, R3 | 0.3–3.15 | 3.30–6.15 |
| S03 Hunt · Eat · Rest | 4 s | R1, R2 | 3 slices (see shot) | 6.15–7.35 |
| S04 No Safety Net | 4 s | R1, R3 | 0.25–3.8 | 7.35–10.90 |
| S05 Tried Harder | 4 s | R1, R2 | 0.8–3.2 | 10.90–13.30 |
| S06 Oblivion | 4 s | R1 | 1.9–3.95 | 13.30–15.35 |
| S07 Awakening | **6 s** | R1, R2, R3 | 0.4–5.65 | 15.35–20.60 |
| S08 Infinite Autonomy | 4 s | R1 | 0.3–2.5 | 20.60–22.80 |
| S09 Empty Hand | 4 s | R1, R2 | 0.4–3.6 | 22.80–26.00 |
| S10 The Deal | **6 s** | R1, R2 | 1.5–4.8 | 26.00–29.30 |
| S11 The Wall | 4 s | R4 | 1.4–3.8 | 29.30–31.70 |
| S12 Trigger | 4 s | R4 | 0.3–2.45 | 31.70–33.85 |
| S13 Act · Effort · Need | 4 s | R4 | 0.2–3.6 | 33.85–37.25 |
| S14 Someone Else's Meal | **6 s** | R4 | 0.5–4.35 | 37.25–41.10 |
| S15 Dawn | 4 s | R1, R3 | 0.3–2.92 | 41.10–43.72 |
| S16 Match Cut | **6 s** | first frame only | 0.0–3.88 | 43.72–47.60 |

That is 72 s of generation per full pass. Plan on 2–3 takes for S03, S07, S10, S14 and S16.

**Generate in this order:** R1–R5, then S02 and S07, because they define the hunter's look. If a frame from your best S02 beats R2, use it as the new face reference. Then do the rest, with S15 before S16.

### Anchors (already inside every prompt; keep them word for word)

- **Hunter:** `the hunter (a lean, wiry hunter-gatherer man in his early 30s, sun-darkened brown skin, long matted dark hair tied back with a leather cord, a short rough beard, a thin pale scar across his left cheekbone, a patched brown deer-hide tunic, a grey wolf-fur wrap over his right shoulder, a carved bone pendant on a leather cord, a long wooden spear with a knapped flint point)`
- **Hiker:** `a modern hiker (early 30s, lean build, dark hair tied back, charcoal-grey shell jacket, small dark backpack, black smartwatch on his left wrist, one trekking pole in his right hand)`
- **Live-action style:** `Photoreal cinematic survival drama with nature-documentary realism, 35mm film look, fine grain, natural light, earthy palette of ochre, bone and charcoal.`
- **Cave-art style:** `Authentic Paleolithic cave art in red ochre and charcoal on rough limestone, animated like hand-made stop-motion on twos. The figures stay flat pigment on the real rock texture: no 3D, no cartoon outlines. Real flickering torchlight on real rock.`
- **Closer (every prompt):** `No dialogue, no voiceover, no music. No text, subtitles or logos.` This keeps Omni's built-in audio to ambient sound you can mix under the voiceover.

### API notes (skip if you use the app)

These details come from Google's Omni cookbook.

- Use `client.interactions.create(model="gemini-omni-1.1-flash", input=[...images, {"type": "text", "text": prompt}], response_format={"type": "video", "aspect_ratio": "9:16", "resolution": "1080p"})`.
- Put the shot's references first in `input`, in the order listed, and start the prompt with a binding line, for example: `The hunter is <IMAGE_REF_0>; his face is <IMAGE_REF_1>; the valley is <IMAGE_REF_2>.`
- If Omni uses a reference as the opening frame, set `generation_config={"video_config": {"task": "reference_to_video"}}`. An explicit `task` stops you from chaining edit turns on that clip.
- For S16, pass only the edited still with `task: "image_to_video"` so it becomes the literal first frame. Two images with that task are read as a first and a last frame.- To edit, pass `previous_interaction_id=<clip id>` with the short "If it misses" prompt.

---

## Reference images: make these first

You can use Nano Banana 2 (`gemini-3.1-flash-image`) or any image model. Use vertical 9:16 unless a prompt says otherwise. Make R2 in the same chat as R1, or attach R1, so it's the same face.

**R1 · Hunter, full body**
```text
Photoreal full-body reference photo of a lean, wiry hunter-gatherer man in his early 30s, standing in a relaxed three-quarter view on a plain light-grey studio background. Sun-darkened brown skin, long matted dark hair tied back with a leather cord, a short rough beard, a thin pale scar across his left cheekbone. He wears a patched brown deer-hide tunic, a grey wolf-fur wrap over his right shoulder, a carved bone pendant on a leather cord, and simple hide wraps on his feet. In his right hand he holds a long wooden spear with a knapped flint point bound with sinew. Soft even light, sharp detail, natural proportions. No text.
```

**R2 · Hunter, face (square)**
```text
Photoreal close-up portrait of the same man: sun-darkened brown skin, long matted dark hair tied back with a leather cord, a short rough beard, a thin pale scar across his left cheekbone, a carved bone pendant on a leather cord at his throat. Calm, alert eyes looking just off camera. Soft side light, plain dark background, detailed skin texture. No text.
```

**R3 · The valley and the rock shelter**
```text
Photoreal vertical landscape at sunrise: a wide river valley of golden late-summer steppe grass ringed by pale limestone cliffs. High in the cliff face, a shallow rock-shelter overhang with a smoke-blackened ceiling opens onto a narrow rock ledge overlooking the valley. Mist on the river, scattered pines, no people, no paths, no buildings. 35mm film look, fine grain. No text.
```

**R4 · The painted wall**
```text
Photoreal close view of a limestone rock-shelter wall lit by warm torchlight. Authentic Paleolithic paintings in red ochre and charcoal arranged in a loose circle: a herd of bison, a small stick-like hunter figure with a spear, a fire, and a sleeping figure. At the centre, a crisp red-ochre stencil of a left hand. Half-hidden in shadow at the edge, a large cave lion drawn in charcoal beside a dark crack in the rock. Rough rock texture, soot stains. No text, no letters, no modern graffiti.
```

**R5 · The hiker, from behind**
```text
Photoreal full-body reference photo from behind of a modern hiker in his early 30s, lean build, dark hair tied back, wearing a charcoal-grey shell jacket, dark trousers and a small dark backpack, a black smartwatch on his left wrist, holding one trekking pole in his right hand. Plain light-grey studio background, soft even light. No logos, no text.
```

---

## Shot prompts

### S01 · The Reach · 4 s
**Attach:** R4, R5 · **Use:** 0.0–3.3 s · **VO:** "To find an answer, let's go back thousands of years."
```text
Single continuous unbroken shot, no scene cuts. Vertical 9:16 macro shot.
[0-1s] Near darkness inside a prehistoric limestone rock shelter. A cold white phone-flashlight beam sweeps across rough, smoke-stained rock and stops on an ancient red-ochre stencil of a left hand.
[1-2s] A modern left hand wearing a black smartwatch enters from the bottom of frame and reaches toward the stencil, fingers spread to match its outline.
[2-3s] The cold white light flickers and turns into warm, dancing orange firelight, and the ochre suddenly looks fresh and wet.
[3-4s] The fingertips hover a few millimetres from the rock, not touching.
Camera: 50mm macro lens, eye level, slow push-in, shallow depth of field, focus on the stencil.
Light: cold blue-white LED at the start, warm amber firelight at the end, deep black shadows.
Style: photoreal cinematic, 35mm film look, fine grain.
Audio: cave room tone, a single water drip; a soft fire crackle fades in as the light changes.
No dialogue, no voiceover, no music. No text, subtitles or logos.
Avoid: extra or fused fingers, graffiti, a visible phone screen.
```
**If it misses:** `Make the light turn from white flashlight to orange firelight at 2 seconds. Keep everything else the same.`

### S02 · Imagine · 4 s
**Attach:** R1, R2, R3 · **Use:** 0.3–3.15 s · **VO:** "Imagine a hunter-gatherer. His job is survival."
```text
Single continuous unbroken shot, no scene cuts. Vertical 9:16.
[0-1.5s] Low-angle medium shot in tall golden grass at sunrise: the hunter rises slowly into frame from a crouch, gripping his spear.
[1.5-4s] The camera pushes in to a close-up as his eyes scan the horizon, alert and calm; wind moves the grass and loose strands of his hair.
Subject: the hunter (a lean, wiry hunter-gatherer man in his early 30s, sun-darkened brown skin, long matted dark hair tied back with a leather cord, a short rough beard, a thin pale scar across his left cheekbone, a patched brown deer-hide tunic, a grey wolf-fur wrap over his right shoulder, a carved bone pendant on a leather cord, a long wooden spear with a knapped flint point).
Setting: a late-summer steppe valley ringed by pale limestone cliffs, no trace of other people.
Camera: 35mm lens, low angle, steady slow push-in.
Light: low golden sunrise behind him, warm rim light on hair, skin and grass tips, light haze.
Style: photoreal cinematic survival drama with nature-documentary realism, 35mm film look, fine grain, natural light, earthy palette of ochre, bone and charcoal.
Audio: wind through dry grass, distant birds, one slow breath.
No dialogue, no voiceover, no music. No text, subtitles or logos.
Avoid: modern clothing or objects.
```
**If it misses:** `Slow the push-in so his eyes fill the frame only in the last second. Keep everything else the same.`

### S03 · Hunt · Eat · Rest · 4 s (montage)
**Attach:** R1, R2 · **Use:** about 0.45 s, 0.25 s and 0.5 s from the middle of each sub-shot, cut on "Hunt" (6.15), "eat" (6.60) and "rest" (6.85) · **VO:** "Hunt, eat, rest,"
```text
Rapid three-shot montage with two hard cuts on a fast rhythmic beat. Vertical 9:16.
[0-1.3s] HUNT, close-up: the hunter drives his flint-tipped spear forward through tall grass, dust bursting, slight motion blur.
[1.3-2.6s] EAT, close-up: his hands tear a strip of fire-roasted meat beside a small campfire, sparks rising.
[2.6-4s] REST, top-down shot: he lies on his back on a fur beside glowing embers under a starry sky, eyes closing.
Subject: the hunter (a lean, wiry hunter-gatherer man in his early 30s, sun-darkened brown skin, long matted dark hair tied back with a leather cord, a short rough beard, a thin pale scar across his left cheekbone, a patched brown deer-hide tunic, a grey wolf-fur wrap over his right shoulder, a carved bone pendant on a leather cord, a long wooden spear with a knapped flint point).
Light: hard midday sun, then orange campfire, then blue night with ember glow.
Style: photoreal cinematic survival drama with nature-documentary realism, 35mm film look, fine grain, natural light, earthy palette of ochre, bone and charcoal.
Audio: spear whoosh, fire crackle, a long slow exhale.
No dialogue, no voiceover, no music. No text, subtitles or logos.
Avoid: blood, gore, modern objects.
```
**If it misses:** use the three single-shot versions under [Fallbacks](#fallbacks).

### S04 · No Safety Net · 4 s
**Attach:** R1, R3 · **Use:** 0.25–3.8 s · **VO:** "no government, no safety net, no salary."
```text
Single continuous unbroken shot, no scene cuts. Vertical 9:16.
[0-4s] Extreme wide shot from across a deep limestone gorge: the tiny figure of the hunter walks slowly from left to right along a single fallen tree trunk that spans the chasm, spear held across his body for balance. The camera slowly cranes down, revealing the sheer drop beneath the log and a white-water river far below.
Subject: the hunter (a lean, wiry hunter-gatherer man in his early 30s, sun-darkened brown skin, long matted dark hair tied back with a leather cord, a short rough beard, a thin pale scar across his left cheekbone, a patched brown deer-hide tunic, a grey wolf-fur wrap over his right shoulder, a carved bone pendant on a leather cord, a long wooden spear with a knapped flint point), small in frame and readable by silhouette.
Setting: untouched wilderness, with no paths, ropes, bridges or people anywhere.
Camera: high vantage, 24mm lens, smooth slow crane down.
Light: flat, cool overcast morning, mist drifting in the gorge, muted greens and greys.
Physical realism: firm footing and natural weight on the log, no sliding; the rock walls stay rigid.
Style: photoreal cinematic survival drama with nature-documentary realism, 35mm film look, fine grain, natural light, earthy palette of ochre, bone and charcoal.
Audio: gusting wind, a distant river roar far below, the log creaking.
No dialogue, no voiceover, no music. No text, subtitles or logos.
Avoid: railings, ropes, modern objects.
```
**If it misses:** `Make the gorge twice as deep and the hunter smaller in frame. Keep everything else the same.`

### S05 · Tried Harder · 4 s
**Attach:** R1, R2 · **Use:** 0.8–3.2 s · **VO:** "If you couldn't find food today, you tried harder"
```text
Single continuous unbroken shot, no scene cuts. Vertical 9:16.
[0-1s] Handheld tracking close-up running alongside the hunter as he sprints left to right through waist-high golden grass, jaw clenched, sweat and dust on his skin.
[1-4s] He pushes harder, breath ragged, eyes locked on prey fleeing out of frame ahead; grass whips past the lens.
Subject: the hunter (a lean, wiry hunter-gatherer man in his early 30s, sun-darkened brown skin, long matted dark hair tied back with a leather cord, a short rough beard, a thin pale scar across his left cheekbone, a patched brown deer-hide tunic, a grey wolf-fur wrap over his right shoulder, a carved bone pendant on a leather cord, a long wooden spear with a knapped flint point).
Camera: handheld, 85mm telephoto, matching his speed, shallow depth of field, real-time motion blur.
Light: harsh high afternoon sun, bleached sky, dust in the air.
Physical realism: powerful strides with firm ground contact, no foot sliding.
Style: photoreal cinematic survival drama with nature-documentary realism, 35mm film look, fine grain, natural light, earthy palette of ochre, bone and charcoal.
Audio: pounding footsteps, ragged breathing, grass swishing.
No dialogue, no voiceover, no music. No text, subtitles or logos.
Avoid: slow motion, visible animal wounds, modern objects.
```
**If it misses:** `Keep the camera tight on his face and shoulders the whole time. Keep everything else the same.`

### S06 · Oblivion · 4 s
**Attach:** R1 · **Use:** 1.9–3.95 s (the disappearance) · **VO:** "or you faded into oblivion."
```text
Single continuous unbroken shot, no scene cuts. Vertical 9:16.
[0-1.5s] Static wide shot from behind: the exhausted hunter, empty-handed, his spear dragging in the dust, walks slowly straight away from camera across a barren plain toward a wall of dense grey fog at dusk.
[1.5-3.5s] The fog rolls over him and his silhouette fades until he disappears completely.
[3.5-4s] Only empty grass and drifting mist remain.
Subject: the hunter (a lean, wiry hunter-gatherer man in his early 30s, sun-darkened brown skin, long matted dark hair tied back with a leather cord, a short rough beard, a thin pale scar across his left cheekbone, a patched brown deer-hide tunic, a grey wolf-fur wrap over his right shoulder, a carved bone pendant on a leather cord, a long wooden spear with a knapped flint point).
Camera: locked-off tripod, 50mm lens, eye level, no camera movement.
Light: cold, colourless dusk, desaturated blue-grey.
Physical realism: slow, heavy steps with firm footing, no sliding.
Style: photoreal cinematic survival drama with nature-documentary realism, 35mm film look, fine grain, natural light, drained and desaturated colour.
Audio: hollow wind fading to near silence.
No dialogue, no voiceover, no music. No text, subtitles or logos.
Avoid: other people, animals, modern objects.
```
**If it misses:** `Make him vanish completely into the fog by 3.5 seconds. Keep everything else the same.`

### S07 · Awakening · 6 s
**Attach:** R1, R2, R3 · **Use:** 0.4–5.65 s · **VO:** "And he had a kind of freedom. Nobody told him when to wake up or where to go."
```text
Single continuous unbroken shot, no scene cuts. Vertical 9:16.
[0-2s] Extreme close-up of the hunter's face as he sleeps on a fur at the edge of a rock-shelter ledge. The first ray of golden sunrise slides across his face.
[2-3.5s] He opens his eyes on his own, unhurried; a faint smile.
[3.5-6s] The camera smoothly pulls back and rises as he sits up, stands, takes his spear and looks out over a vast sunlit river valley that stretches to the horizon.
Subject: the hunter (a lean, wiry hunter-gatherer man in his early 30s, sun-darkened brown skin, long matted dark hair tied back with a leather cord, a short rough beard, a thin pale scar across his left cheekbone, a patched brown deer-hide tunic, a grey wolf-fur wrap over his right shoulder, a carved bone pendant on a leather cord, a long wooden spear with a knapped flint point).
Setting: a limestone rock-shelter ledge high above a golden river valley ringed by pale cliffs.
Camera: 35mm lens, starting inches from his face, one continuous pull-back and crane up to a wide shot.
Light: warm golden sunrise, long soft shadows, gentle lens flare; the warmest image of the film.
Physical realism: natural weight as he stands; the rock ledge stays rigid.
Style: photoreal cinematic survival drama with nature-documentary realism, 35mm film look, fine grain, natural light, earthy palette of ochre, bone and charcoal.
Audio: morning birdsong, soft wind, a calm breath.
No dialogue, no voiceover, no music. No text, subtitles or logos.
Avoid: other people, modern objects.
```
**If it misses:** `Start the pull-back at 3 seconds and make it slower and smoother. Keep everything else the same.`

### S08 · Infinite Autonomy · 4 s
**Attach:** R1 · **Use:** 0.3–2.5 s, then hold through the pause · **VO:** "Infinite autonomy."
```text
Single continuous unbroken shot, no scene cuts. Vertical 9:16.
[0-4s] Top-down aerial view looking straight down at the hunter standing at the centre of a vast golden grassland. Dozens of narrow animal trails run outward from where he stands in every direction, like the spokes of a wheel. The camera rises steadily straight up; he shrinks to a dot as the trails stretch to the horizon. His long morning shadow points across the grass.
Subject: the hunter (a lean, wiry hunter-gatherer man in his early 30s, sun-darkened brown skin, long matted dark hair tied back with a leather cord, a short rough beard, a thin pale scar across his left cheekbone, a patched brown deer-hide tunic, a grey wolf-fur wrap over his right shoulder, a carved bone pendant on a leather cord, a long wooden spear with a knapped flint point), seen from directly above.
Camera: drone, perfectly vertical top-down, smooth continuous rise, no rotation.
Light: low warm morning sun, long shadows, golden grass.
Style: photoreal cinematic survival drama with nature-documentary realism, 35mm film look, fine grain, natural light, earthy palette of ochre, bone and charcoal.
Audio: high wind, one distant eagle cry.
No dialogue, no voiceover, no music. No text, subtitles or logos.
Avoid: roads, fences, buildings, crop circles.
```
**If it misses:** `Make the trails thinner and more numerous, fading naturally into the grass. Keep everything else the same.`

### S09 · Empty Hand · 4 s
**Attach:** R1, R2 · **Use:** 0.4–3.6 s · **VO:** "But with a catch, responsibility, nobody was going to feed him."
```text
Single continuous unbroken shot, no scene cuts. Vertical 9:16.
[0-1.5s] Night. The hunter sits alone beside a small campfire on the rock-shelter ledge, a tiny pool of warm light in a vast, cold blue darkness.
[1.5-2.8s] The camera slowly pushes in to a medium close-up as he opens his hand and looks down at his empty palm.
[2.8-4s] He slowly closes it into a fist.
Subject: the hunter (a lean, wiry hunter-gatherer man in his early 30s, sun-darkened brown skin, long matted dark hair tied back with a leather cord, a short rough beard, a thin pale scar across his left cheekbone, a patched brown deer-hide tunic, a grey wolf-fur wrap over his right shoulder, a carved bone pendant on a leather cord, a long wooden spear with a knapped flint point).
Camera: 35mm lens, eye level, slow steady push-in.
Light: one warm firelight source on one side, deep moonlit blue on the other, heavy shadow.
Style: photoreal cinematic survival drama with nature-documentary realism, 35mm film look, fine grain, natural light, earthy palette of ochre, bone and charcoal.
Audio: fire crackle, night insects, a distant wolf howl.
No dialogue, no voiceover, no music. No text, subtitles or logos.
Avoid: food, other people, modern objects.
```
**If it misses:** `Make the darkness around him deeper and the fire smaller. Keep everything else the same.`

### S10 · The Deal · 6 s
**Attach:** R1, R2 (not R4, which already shows the stencil) · **Use:** 1.5–4.8 s, so his eyes reach the lens on "You" · **VO:** "That's the original deal. You can be free, but you are accountable."
```text
Single continuous unbroken shot, no scene cuts. Vertical 9:16.
[0-2s] Medium close-up by firelight at the rock-shelter wall: the hunter presses his left hand flat against the limestone and blows a fine mist of red-ochre pigment from his mouth over it.
[2-3s] He lifts his hand away, revealing a crisp red stencil of his hand on the rock.
[3-6s] He turns his head and looks directly into the camera lens, calm and serious, and holds the gaze.
Subject: the hunter (a lean, wiry hunter-gatherer man in his early 30s, sun-darkened brown skin, long matted dark hair tied back with a leather cord, a short rough beard, a thin pale scar across his left cheekbone, a patched brown deer-hide tunic, a grey wolf-fur wrap over his right shoulder, a carved bone pendant on a leather cord, a long wooden spear with a knapped flint point).
Camera: 50mm lens, eye level, very slow push-in toward his eyes.
Light: split lighting, warm firelight on one half of his face and cool blue shadow on the other.
Style: photoreal cinematic survival drama with nature-documentary realism, 35mm film look, fine grain, natural light, earthy palette of ochre, bone and charcoal.
Audio: a soft spray of breath, fire crackle, then stillness.
No dialogue, no voiceover, no music. No text, subtitles or logos.
Avoid: extra or fused fingers, paintbrushes, modern objects.
```
**If it misses:** `Have him turn and look straight into the lens at exactly 3 seconds. Keep everything else the same.`

### S11 · The Wall · 4 s
**Attach:** R4 · **Use:** 1.4–3.8 s, so the camera settles during the pause · **VO:** "Think of it as a system."
```text
Single continuous unbroken shot, no scene cuts. Vertical 9:16.
[0-2.5s] Slow sideways tracking shot along a rock-shelter wall lit only by a burning wooden torch that moves with the camera. The flickering light reveals red-ochre and charcoal paintings arranged in a great circle: a bison herd, a small hunter figure with a spear, a fire, a sleeping figure, and a fresh red stencil of a left hand at the centre. Half-hidden in shadow at the edge of the light, a large charcoal cave lion lies beside a dark crack in the rock.
[2.5-4s] The camera settles square-on to the circle and holds.
Camera: 35mm lens, slow lateral dolly, settling square to the wall.
Light: a single moving torch, warm flicker, deep shadows in the rock texture.
Style: authentic Paleolithic cave art in red ochre and charcoal on rough limestone; in this shot the paintings are still. Real flickering torchlight on real rock.
Audio: torch flame fluttering, cave room tone.
No dialogue, no voiceover, no music. No text, subtitles or logos.
Avoid: letters, symbols, modern graffiti, moving paintings.
```
**If it misses:** `Keep the lion mostly in shadow so it is barely noticeable. Keep everything else the same.`

### S12 · Trigger · 4 s
**Attach:** R4 · **Use:** 0.3–2.45 s · **VO:** "A situation triggers the need to survive."
```text
Single continuous unbroken shot, no scene cuts. Vertical 9:16.
[0-1.5s] Close-up on the torch-lit cave wall: the charcoal-and-ochre bison herd comes alive and gallops across the rough rock.
[1.5-4s] The small red-ochre hunter figure stands up, turns toward the herd and grips his spear.
Camera: locked-off, square to the wall, 50mm lens.
Light: flickering torchlight from the left.
Style: authentic Paleolithic cave art in red ochre and charcoal on rough limestone, animated like hand-made stop-motion on twos. The figures stay flat pigment on the real rock texture: no 3D, no cartoon outlines. Real flickering torchlight on real rock.
Audio: muffled hoofbeats like a deep drum, torch flutter.
No dialogue, no voiceover, no music. No text, subtitles or logos.
Avoid: 3D animals, cartoon style, realistic animals.
```
**If it misses:** `Make the figures flatter, as if the pigment itself is moving on the stone. Keep everything else the same.`

### S13 · Act · Effort · Need · 4 s
**Attach:** R4 · **Use:** 0.2–3.6 s · **VO:** "You act, you put in effort, you meet the need."
```text
Single continuous unbroken shot, no scene cuts. Vertical 9:16.
[0-1.2s] On the torch-lit cave wall, the painted hunter figure hurls his spear; it flies across the rock.
[1.2-2.4s] He runs after the bison herd, chasing over the bumps and cracks of the stone.
[2.4-4s] A painted bison falls; the hunter sits beside a painted fire whose flames glow with real flickering light, and eats.
Camera: very slow push-in, square to the wall.
Light: warm torchlight flicker.
Style: authentic Paleolithic cave art in red ochre and charcoal on rough limestone, animated like hand-made stop-motion on twos. The figures stay flat pigment on the real rock texture: no 3D, no cartoon outlines. Real flickering torchlight on real rock.
Audio: spear thud, drum-like hoofbeats, fire crackle.
No dialogue, no voiceover, no music. No text, subtitles or logos.
Avoid: blood, gore, 3D, cartoon style.
```
**If it misses:** `Make the spear throw happen in the first second and the meal start at 2.5 seconds. Keep everything else the same.`

### S14 · Someone Else's Meal · 6 s
**Attach:** R4 · **Use:** 0.5–4.35 s · **VO:** "Rinse and repeat until one day you become someone else's meal."
```text
Single continuous unbroken shot, no scene cuts. Vertical 9:16.
[0-1.5s] On the torch-lit cave wall the painted cycle repeats faster and faster: a painted sun rises and sets again and again across the rock while the tiny hunter figure hunts, eats and sleeps in rapid loops.
[1.5-2.5s] The loop stops dead. A huge charcoal cave lion slides out of the dark crack in the rock behind the tiny hunter.
[2.5-3.5s] The lion lunges and swallows the hunter figure in one bite.
[3.5-4s] The torch gutters out with a puff of smoke.
[4-6s] Total darkness and silence.
Camera: locked-off, square to the wall.
Style: authentic Paleolithic cave art in red ochre and charcoal on rough limestone, animated like hand-made stop-motion on twos, the lion drawn like the Chauvet cave lions. The figures stay flat pigment on the real rock texture: no 3D, no cartoon outlines. Real flickering torchlight on real rock.
Audio: hoofbeat-like thumps that speed up, a deep low growl, the torch whoosh, then dead silence.
No dialogue, no voiceover, no music. No text, subtitles or logos.
Avoid: blood, gore, realistic animals, 3D.
```
**If it misses:** `Make the lion swallow the hunter at 3 seconds and the torch go out at 3.5 seconds. Keep everything else the same.`

### S15 · Dawn · 4 s
**Attach:** R1, R3 · **Use:** 0.3–2.92 s, cutting as the step begins · **VO:** "So living with freedom and responsibility together"
```text
Single continuous unbroken shot, no scene cuts. Vertical 9:16.
[0-2.5s] Wide shot from behind: the hunter stands at the very edge of the rock-shelter ledge, spear in his right hand, silhouetted against a glowing sunrise over the misty river valley. He breathes in; his shoulders rise.
[2.5-4s] He shifts his weight and begins one slow step forward.
Subject: the hunter (a lean, wiry hunter-gatherer man in his early 30s, sun-darkened brown skin, long matted dark hair tied back with a leather cord, a short rough beard, a thin pale scar across his left cheekbone, a patched brown deer-hide tunic, a grey wolf-fur wrap over his right shoulder, a carved bone pendant on a leather cord, a long wooden spear with a knapped flint point), seen from behind.
Camera: locked-off, 35mm lens, eye level, about 4 metres behind him; he stands centred with his head just above the horizon and the low sun beside him.
Light: sunrise backlight, soft pink-gold sky, glowing valley mist.
Physical realism: firm footing on rock; the ledge stays rigid.
Style: photoreal cinematic survival drama with nature-documentary realism, 35mm film look, fine grain, natural light, earthy palette of ochre, bone and charcoal.
Audio: dawn birdsong, gentle wind.
No dialogue, no voiceover, no music. No text, subtitles or logos.
Avoid: modern objects, camera movement.
```
**If it misses:** `Keep the camera completely still and start the step at 2.5 seconds. Keep everything else the same.`

**Before S16:** export the S15 frame at **2.9 s** (your cut point). Then edit that still with Nano Banana:
```text
Replace the hunter with a modern hiker (early 30s, lean build, dark hair tied back, charcoal-grey shell jacket, small dark backpack, black smartwatch on his left wrist, one trekking pole in his right hand), in exactly the same pose, position and size, mid-step. In the valley below, add a small modern town and a highway with tiny lights, half-hidden in the mist. Keep the composition, camera, sunrise light and colours exactly the same. No text.
```

### S16 · Match Cut · 6 s
**Attach:** only the edited still, as the **first frame**. It already contains the hiker; in the API, pass that one image with `task: "image_to_video"`. · **Use:** 0.0–3.88 s · **VO:** "is actually the most natural thing humans have ever done."
```text
Single continuous unbroken shot, no scene cuts. Vertical 9:16. Start exactly on the provided first frame.
[0-1.5s] Wide shot from behind: the modern hiker completes his slow step forward to the edge of the rock ledge, trekking pole in his right hand, silhouetted against the sunrise.
[1.5-6s] He stands still and breathes in the view. In the misty valley below, a small modern town and a highway with tiny moving car lights; the town's street lights blink off one by one as the dawn grows. After 2 seconds the camera begins an extremely slow push-in.
Subject: a modern hiker (early 30s, lean build, dark hair tied back, charcoal-grey shell jacket, small dark backpack, black smartwatch on his left wrist, one trekking pole in his right hand), seen from behind.
Camera: locked-off for the first 2 seconds, 35mm lens, eye level, then an extremely slow push-in.
Light: sunrise backlight, soft pink-gold sky, cool points of town light fading out.
Physical realism: firm footing on rock; the ledge and the town stay rigid.
Style: photoreal cinematic, 35mm film look, fine grain, natural light, matching the previous shot exactly.
Audio: dawn birdsong, gentle wind, a faint distant traffic hum.
No dialogue, no voiceover, no music. No text, subtitles or logos.
Avoid: logos on clothing, other people.
```
**If it misses:** `Make the town smaller and further away, mostly hidden in mist. Keep everything else the same.`

---

## Fallbacks

**S03 as three separate 4 s clips.** Use these if the montage drifts off-character. Take the best 0.45 s, 0.25 s and 0.5 s of each.
```text
Single continuous unbroken shot, no scene cuts. Vertical 9:16. [0-4s] Close-up: the hunter drives his flint-tipped spear forward through tall golden grass, dust bursting, slight motion blur. Subject: the hunter (a lean, wiry hunter-gatherer man in his early 30s, sun-darkened brown skin, long matted dark hair tied back with a leather cord, a short rough beard, a thin pale scar across his left cheekbone, a patched brown deer-hide tunic, a grey wolf-fur wrap over his right shoulder, a carved bone pendant on a leather cord, a long wooden spear with a knapped flint point). Light: hard midday sun. Style: photoreal cinematic survival drama with nature-documentary realism, 35mm film look, fine grain, natural light, earthy palette of ochre, bone and charcoal. Audio: spear whoosh, grass rustle. No dialogue, no voiceover, no music. No text, subtitles or logos. Avoid: blood, modern objects.
```
```text
Single continuous unbroken shot, no scene cuts. Vertical 9:16. [0-4s] Close-up: the hunter's hands tear a strip of fire-roasted meat beside a small campfire, sparks rising, his bone pendant swinging into frame. Subject: the hunter (a lean, wiry hunter-gatherer man in his early 30s, sun-darkened brown skin, long matted dark hair tied back with a leather cord, a short rough beard, a thin pale scar across his left cheekbone, a patched brown deer-hide tunic, a grey wolf-fur wrap over his right shoulder, a carved bone pendant on a leather cord, a long wooden spear with a knapped flint point). Light: orange campfire against dusk. Style: photoreal cinematic survival drama with nature-documentary realism, 35mm film look, fine grain, natural light, earthy palette of ochre, bone and charcoal. Audio: fire crackle, sizzling fat. No dialogue, no voiceover, no music. No text, subtitles or logos. Avoid: gore, modern objects.
```
```text
Single continuous unbroken shot, no scene cuts. Vertical 9:16. [0-4s] Top-down shot: the hunter lies on his back on a fur beside glowing embers under a starry sky, his eyes slowly closing. Subject: the hunter (a lean, wiry hunter-gatherer man in his early 30s, sun-darkened brown skin, long matted dark hair tied back with a leather cord, a short rough beard, a thin pale scar across his left cheekbone, a patched brown deer-hide tunic, a grey wolf-fur wrap over his right shoulder, a carved bone pendant on a leather cord, a long wooden spear with a knapped flint point). Light: blue night with a warm ember glow on his face. Style: photoreal cinematic survival drama with nature-documentary realism, 35mm film look, fine grain, natural light, earthy palette of ochre, bone and charcoal. Audio: soft ember crackle, crickets. No dialogue, no voiceover, no music. No text, subtitles or logos. Avoid: modern objects.
```

**S10, simpler version (pressed palm).** Use this if the pigment-blowing keeps failing. If you use it, change "stencil" to "handprint" in S01, S11 and R4.
```text
Single continuous unbroken shot, no scene cuts. Vertical 9:16.
[0-2s] Medium close-up by firelight at the rock-shelter wall: the hunter presses his ochre-covered left palm firmly onto the limestone.
[2-3s] He lifts it away, leaving a crisp red handprint on the rock.
[3-6s] He turns his head and looks directly into the camera lens, calm and serious, and holds the gaze.
Subject: the hunter (a lean, wiry hunter-gatherer man in his early 30s, sun-darkened brown skin, long matted dark hair tied back with a leather cord, a short rough beard, a thin pale scar across his left cheekbone, a patched brown deer-hide tunic, a grey wolf-fur wrap over his right shoulder, a carved bone pendant on a leather cord, a long wooden spear with a knapped flint point).
Camera: 50mm lens, eye level, very slow push-in toward his eyes.
Light: split lighting, warm firelight on one half of his face and cool blue shadow on the other.
Style: photoreal cinematic survival drama with nature-documentary realism, 35mm film look, fine grain, natural light, earthy palette of ochre, bone and charcoal.
Audio: fire crackle, then stillness.
No dialogue, no voiceover, no music. No text, subtitles or logos.
Avoid: extra or fused fingers, modern objects.
```

**S14, live-action version.** Use this if you'd rather stay out of the cave-art style here. It keeps the darkness and the silence, with no attack shown.
```text
Single continuous unbroken shot, no scene cuts. Vertical 9:16.
[0-2s] Night. Medium shot: the hunter kneels at a black waterhole, drinking from cupped hands, his small campfire far behind him.
[2-3s] In the dark grass behind him, two eyes ignite with gold eyeshine and slowly rise.
[3-4s] He freezes; the campfire behind him gutters out.
[4-6s] Total darkness and silence.
Subject: the hunter (a lean, wiry hunter-gatherer man in his early 30s, sun-darkened brown skin, long matted dark hair tied back with a leather cord, a short rough beard, a thin pale scar across his left cheekbone, a patched brown deer-hide tunic, a grey wolf-fur wrap over his right shoulder, a carved bone pendant on a leather cord, a long wooden spear with a knapped flint point).
Camera: locked-off, 50mm lens, low angle at water level.
Light: faint moonlight, the distant fire, gold eyeshine.
Style: photoreal cinematic survival drama with nature-documentary realism, 35mm film look, fine grain, natural light, earthy palette of ochre, bone and charcoal.
Audio: water lapping, crickets suddenly stopping, a deep low growl, then dead silence.
No dialogue, no voiceover, no music. No text, subtitles or logos.
Avoid: attack, blood, gore, a fully visible lion.
```

**If cave-art shots (S12–S14) render as 3D or cartoony:** attach R4, add `flat pigment, no depth, no shading, the rock texture shows through the paint`, and use the edit turn `Make the figures look painted directly on the rock. Keep everything else the same.`
