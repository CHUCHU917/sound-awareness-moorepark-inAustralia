# Background plate

## Clean Passive heartbeat update (29 October 2026)

- `passive-clean-scene.png`: byte-identical copy of `C:/Users/15125/Desktop/usyd document/9202/passive mode-scenario.png`; SHA-256 `A513CFBCE9897EABAF4125ED01D5649B66AFE56423E42B93BDA893DD04BBACC1`.
- This source has no baked-in bubbles. Passive now adds seven independent SVG heartbeat overlays. No source editing or image generation was used.
- The older `passive-scene.png` is retained unchanged, solely for Individual's existing compositing layer. Individual and Group assets/configurations are unaffected.

## Added interaction scenes (29 October 2026)

- `passive-scene.png`: byte-identical copy of `C:/Users/15125/Desktop/usyd document/9202/主场景图-没人的状态.png`; SHA-256 `941A4B1531D31342F6785A17FF15461EF8CD9BCDEBCD754AA6ED28F5FDCACD48`.
- `individual-scene.png`: byte-identical copy of `C:/Users/15125/Desktop/usyd document/9202/getting louder.png`; SHA-256 `F32748B913098E0FCAF76B77985BF06B839FDDCA13DEEDA21F6C27177E0BD4F0`.
- No generation/editing tool was used for these two supplied images. Passive is displayed with only gentle ambient opacity overlays. Individual has an SVG-only masked composition of the two supplied sources so the original large light effects and yellow device graphics can be replaced by live feedback without changing either file. Small fixed reflections on clothing remain photographic.
- Group continues to use the existing clean plate and existing foot anchors, unchanged.

- Source: user-supplied `主场景图.png`, copied unchanged to `main-scene-reference.png`.
- State reference: user-supplied `立标场景图.png`, copied unchanged to `signal-state-reference.png`. Documentation only.
- Runtime asset: `stadium-clean-plate.png`, 1672 × 941, edited using the built-in Image Generation tool. No CLI/API fallback.
- The original scene's composition, rugby fans, architecture, light, and physical signal housing were retained. Baked-in projections and device illumination were removed so runtime overlays can change independently. Small image synthesis differences can remain; this is an edited background plate rather than a pixel-identical original.

## Edit prompt

Use case: precise-object-edit. Edit target: the supplied stadium staircase photo. Produce a clean background plate for an interactive installation, preserving the EXACT original 1672x941 composition, viewpoint, ALL rugby fans and their feet/poses/faces/clothes, stadium architecture, stairs, railings, dusk sky, normal warm lighting and signal housing at the right. Change ONLY these two things: (1) remove ALL coloured projected light bubbles and their blue/yellow/green/pink spill from the stair treads, restoring natural grey stone step texture under and between the fans. (2) turn off the vertical signal device: remove its glowing green face, text, bars and bright green edge illumination, leaving the SAME dark black physical housing in exactly its original location and outline. Do not remove the device housing. No new objects, no new people, no lettering. Preserve all other scene detail and original framing as faithfully as possible. Output a single landscape photograph.
