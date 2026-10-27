# Scene implementation QA

final result: passed

## Evidence and normalization

- Source visual truth: `assets/main-scene-reference.png` (1672 × 941), plus `assets/signal-state-reference.png` for behaviour only.
- Rendered implementation: `scene-quiet.png`, `scene-medium.png`, `scene-loud.png`.
- Viewport for comparisons: 1672 × 941 CSS pixels; screenshots 1672 × 941 pixels, 1:1 normalized density. Browser override reset after checks.
- States: manual normalized 4, 13, and 28, after smoothing settled. These use the same rendering functions as microphone input.
- Full-view comparison: source plus all three browser screenshots opened together in one visual inspection input. Landscape composition, rugby fans, architecture, rails, sky, warm lighting and right-hand signal placement were compared directly. A fixed edited clean plate replaces the baked-in light effects; state changes do not replace the background.
- Focused evidence: `signal-quiet-detail.png` (180 × 450 crop at x1270/y350), plus the full-resolution signal region in the three state captures. Smile/neutral/shh, two-line copy, stacked bars and illuminated edge were inspected. Larger foreground projections and footwear occlusion were inspected at full resolution.

## Findings

### Current placement-only correction (supersedes the eight-group refinement below)

- Evidence: `foot-anchors-quiet.png`, `foot-anchors-loud.png`, and `foot-placement-final.png`; source remains the same clean-plate photograph.
- Removed four speculative groups and one speculative upper-left footprint. Current configuration contains four real visible-foot clusters, with 3/3/2/2 people (10 anchors). Six to eight clusters cannot be justified by clearly visible feet in this photograph.
- Replaced origin/offset data with named people and percentage x/y coordinates relative to the complete scene. Base sizes decrease with distance; vertical flattening remains perspective-compressed. Signal, image, scene layout, thresholds and continuous scale mapping are unchanged.
- Optional Show Anchors checkbox displays fixed numbered foot dots; defaults off. Markers sit outside the footwear mask so the actual contact points can be inspected.
- Browser comparison: all 10 `.person-anchor` translation transforms were identical between Quiet and Loud. Numbered dots were inspected directly against all ten visible shoes in both states. Quiet has no cross-group overlaps; Loud merges footprints within the visible clusters while remaining centred on the same feet. Widely separated clusters are not artificially moved together to force cross-colour overlap.
- The audio/state section of `script.js` (from `let mode =` onward) has the same SHA-256 before/after: `823a160f283283690de51454d5d2e63258e3574bf160f29c2e5a9b8486cbf164`.
- Regression checks include four unique group colours, 2–4 visible-person anchors per group, percentage bounds, no per-person colours, fixed coordinates through sound changes, anchor toggle, and the existing microphone/manual tests. Passed.
- Final result remains passed for this placement-only correction. Physical microphone hardware was not re-tested because the audio logic is unchanged.

No actionable P0/P1/P2 findings remain within the requested concept-demo scope.

- Typography/copy: compact illuminated two-line Great job!, Getting louder..., and Too loud fit the original housing. Face/text/bar hierarchy follows the references. The precise photographic typeface is not available; the live text uses a condensed system-font stack. This is a P3 fidelity difference.
- Spacing/layout: the whole supplied composition stays visible through a shared aspect-ratio scene frame. Presentation Mode contains no controls or promotional headings. Debug controls overlay the working scene only outside Presentation Mode. Narrow viewports letterbox the landscape scene rather than crop it.
- Colours/tokens: fixed blue/green/yellow/pink/purple visitor-group assignments persist across all states. Only the signal uses green/yellow/red as a scale. The environment is not tinted. Captures show 2, 5 and 9 illuminated bars respectively.
- Image quality: the edited plate preserves the scene and removes baked-in lights/display. Image generation introduces slight softening and small texture differences relative to the supplied original (P3). Source files are preserved unchanged in assets. Masks clip projections to stairs and keep foreground shoes/legs over the light. The runtime face/bars/projections use SVG as explicitly requested by the user.
- Bubble behaviour: quiet personal-size projections are separated; medium projections grow but remain mostly separate; loud projections visibly overlap, including green/yellow group colours. A continuous piecewise function plus exponential interpolation replaces fixed per-state scales, without replacing the microphone implementation.
- Content: no additional content is placed over the presentation. The original baked-in feather mark is removed with the inactive device display; no replacement brand mark was introduced.

## Comparison history

The first photographic comparison found no P0/P1/P2 issue requiring a visual revision. Earlier laptop-height problems belonged to the prior illustrated demo, before this photographic revision. The new scene uses a unified contained frame and a separate Presentation Mode, preventing those earlier crop/controls problems.

## Interaction verification

- Browser: Quiet/Getting louder/Too loud presets, correct 5/9 active bar counts, visible shh gesture in red, continuous bubble transforms, entering/exiting Presentation Mode, Debug Mode, current state and default 8/18 editable thresholds.
- Browser Presentation Mode: DOM check found zero visible buttons/inputs. Screenshot confirms only the scene and live overlays remain.
- Browser console error check: no errors returned.
- Regression: `node sound-check.cjs` passed boundaries, continuous scale monotonicity and continuity, fixed colours, equal manual/microphone visual output at equal normalized inputs, transient rejection, three microphone-driven states, calibration, sensitivity, invalid-threshold handling, cancellation, presets, permission-denied fallback and presentation toggle. Audio uses a simulated Web Audio source for deterministic checks.
- Physical microphone capture has not been verified against the user's classroom hardware in this run. The existing Web Audio capture/gain/smoothing/calibration pipeline is preserved. A live room check remains necessary for hardware-specific sensitivity.

## Follow-up polish

### Eight-group refinement

- Updated evidence: `groups-quiet.png`, `groups-medium.png`, `groups-loud.png` at the same 1672 × 941 viewport.
- Scoped change: eight parent-owned colours and 18 bubbles. Existing signal design, background asset, thresholds, microphone processing and scale interpolation are unchanged.
- Browser computed-fill inspection confirms exactly eight `.visitor-group` elements, each with one inherited colour across all descendant ellipses. Counts per group: 3, 2, 3, 2, 2, 2, 2, 2.
- The central three fans now share green. Added clustered yellow, cyan, orange and rear-left red footprints extend coverage of visible stair treads; rear anchors are approximate where feet are occluded by foreground fans.
- First placement pass found rear red bubbles on foreground hair/clothing (P2). Moved those bubbles to clear rear-left treads and extended clothing/leg exclusions for the expanded cyan/orange projections. Revised Quiet/Loud screenshots confirm the red bubbles sit on steps and cross-colour cyan/green/orange overlaps appear in Loud. This finding is resolved.
- Full-view Quiet/Medium/Loud review confirms fixed colours, quiet separation, smooth growth and substantially denser Loud light. Staircase clipping is retained. Browser errors: none in the updated capture run. Regression checks passed, including eight unique group colours, at least two bubbles per group, no individual colour fields, and colour invariance through microphone/manual states.
- Final result remains passed. Normal browser viewport was restored after the landscape checks.

- P3: a professionally retouched clean plate could retain more original photographic detail.
- P3: a supplied licensed condensed device typeface could improve lettering fidelity.

## Implementation checklist

- [x] Keep existing project and audio pipeline.
- [x] Use one fixed landscape scene and independently rendered overlays.
- [x] Match signal location, three expressions, copy, edge light and bar counts.
- [x] Make all group bubbles follow one continuously smoothed input.
- [x] Preserve classroom thresholds, sensitivity, calibration and manual fallback.
- [x] Provide Presentation Mode and collapsible Debug Mode.
- [x] Preserve sources and document editable visual configuration.
- [x] Run regressions and browser comparisons; leave Windows server running.
