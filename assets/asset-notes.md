# Background plate

- Source: user-supplied `主场景图.png`, copied unchanged to `main-scene-reference.png`.
- State reference: user-supplied `立标场景图.png`, copied unchanged to `signal-state-reference.png`. Documentation only.
- Runtime asset: `stadium-clean-plate.png`, 1672 × 941, edited using the built-in Image Generation tool. No CLI/API fallback.
- The original scene's composition, rugby fans, architecture, light, and physical signal housing were retained. Baked-in projections and device illumination were removed so runtime overlays can change independently. Small image synthesis differences can remain; this is an edited background plate rather than a pixel-identical original.

## Edit prompt

Use case: precise-object-edit. Edit target: the supplied stadium staircase photo. Produce a clean background plate for an interactive installation, preserving the EXACT original 1672x941 composition, viewpoint, ALL rugby fans and their feet/poses/faces/clothes, stadium architecture, stairs, railings, dusk sky, normal warm lighting and signal housing at the right. Change ONLY these two things: (1) remove ALL coloured projected light bubbles and their blue/yellow/green/pink spill from the stair treads, restoring natural grey stone step texture under and between the fans. (2) turn off the vertical signal device: remove its glowing green face, text, bars and bright green edge illumination, leaving the SAME dark black physical housing in exactly its original location and outline. Do not remove the device housing. No new objects, no new people, no lettering. Preserve all other scene detail and original framing as faithfully as possible. Output a single landscape photograph.
